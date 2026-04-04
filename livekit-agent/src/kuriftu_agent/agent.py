"""LiveKit voice agent: drives Kuriftu booking API via LLM function tools."""

from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any

import httpx
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    AgentStateChangedEvent,
    ConversationItemAddedEvent,
    ErrorEvent,
    FunctionToolsExecutedEvent,
    JobContext,
    JobProcess,
    RunContext,
    SpeechCreatedEvent,
    TurnHandlingOptions,
    UserInputTranscribedEvent,
    UserStateChangedEvent,
    cli,
    function_tool,
    get_job_context,
    inference,
    room_io,
)
from livekit.agents.llm import ChatMessage
from livekit.plugins import silero

from kuriftu_agent.booking_api import BookingApiClient, BookingApiError

logger = logging.getLogger("kuriftu-agent")
session_logger = logging.getLogger("kuriftu-agent.session")

BOOKING_JWT_ATTR = "kuriftu_jwt"

load_dotenv(".env.local")
load_dotenv(".env")

_level_name = (os.getenv("KURIFTU_AGENT_LOG_LEVEL") or "INFO").upper()
_level = getattr(logging, _level_name, logging.INFO)
for _log_name in ("kuriftu-agent", "kuriftu-agent.session"):
    logging.getLogger(_log_name).setLevel(_level)


def _attach_session_debug_logging(session: AgentSession) -> None:
    """Structured INFO logs for STT, turns, chat, tools, and errors (worker terminal)."""

    @session.on("user_input_transcribed")
    def _on_user_input_transcribed(ev: UserInputTranscribedEvent) -> None:
        preview = (ev.transcript or "")[:800]
        session_logger.info(
            "user_input_transcribed final=%s lang=%s text=%r",
            ev.is_final,
            ev.language,
            preview,
        )

    @session.on("user_state_changed")
    def _on_user_state_changed(ev: UserStateChangedEvent) -> None:
        session_logger.info("user_state %s -> %s", ev.old_state, ev.new_state)

    @session.on("agent_state_changed")
    def _on_agent_state_changed(ev: AgentStateChangedEvent) -> None:
        session_logger.info("agent_state %s -> %s", ev.old_state, ev.new_state)

    @session.on("conversation_item_added")
    def _on_conversation_item_added(ev: ConversationItemAddedEvent) -> None:
        item = ev.item
        if isinstance(item, ChatMessage):
            text = item.text_content or ""
            session_logger.info(
                "conversation_item_added role=%s text_len=%s preview=%r",
                item.role,
                len(text),
                text[:500],
            )
        else:
            session_logger.info(
                "conversation_item_added type=%s",
                type(item).__name__,
            )

    @session.on("function_tools_executed")
    def _on_function_tools_executed(ev: FunctionToolsExecutedEvent) -> None:
        for call, output in ev.zipped():
            out_preview = ""
            if output is not None:
                out_preview = str(getattr(output, "output", "") or "")[:400]
            session_logger.info(
                "tool_executed name=%s args_preview=%r output_preview=%r",
                call.name,
                (call.arguments or "")[:300],
                out_preview,
            )

    @session.on("speech_created")
    def _on_speech_created(ev: SpeechCreatedEvent) -> None:
        session_logger.info(
            "speech_created source=%s user_initiated=%s",
            ev.source,
            ev.user_initiated,
        )

    @session.on("error")
    def _on_session_error(ev: ErrorEvent) -> None:
        session_logger.error("session_error source=%s err=%s", type(ev.source).__name__, ev.error)


def _dump(data: Any) -> str:
    if isinstance(data, str):
        return data[:12000]
    try:
        return json.dumps(data, default=str, indent=2)[:12000]
    except TypeError:
        return str(data)[:12000]


def _sync_api_token_from_room(room: rtc.Room, api: BookingApiClient) -> None:
    """Resolve active JWT: voice login override > guest attribute > staff env token."""
    if api.force_token:
        api.token = api.force_token
        session_logger.info("booking API auth: voice login/register override")
        return

    # Any remote with our attribute (do not filter by participant kind: ingress/SIP/etc. may differ).
    guest_jwt: str | None = None
    for p in room.remote_participants.values():
        j = p.attributes.get(BOOKING_JWT_ATTR)
        if j:
            guest_jwt = j
            break
    if guest_jwt:
        api.token = guest_jwt
        session_logger.info("booking API auth: guest JWT from LiveKit participant attribute")
    else:
        api.token = api.staff_token
        if api.staff_token:
            session_logger.info("booking API auth: staff token from env (no guest in room)")


def _bind_room_jwt_sync(room: rtc.Room, api: BookingApiClient) -> None:
    def _on_participant_connected(_participant: rtc.RemoteParticipant) -> None:
        _sync_api_token_from_room(room, api)

    def _on_attributes_changed(_changed: dict[str, str], _participant: rtc.Participant) -> None:
        # Re-scan on any attribute change (JWT may arrive after initial connect).
        _sync_api_token_from_room(room, api)

    def _on_connection_state_changed(state: rtc.ConnectionState) -> None:
        if state == rtc.ConnectionState.CONN_CONNECTED:
            _sync_api_token_from_room(room, api)

    _sync_api_token_from_room(room, api)
    room.on("participant_connected", _on_participant_connected)
    room.on("participant_attributes_changed", _on_attributes_changed)
    room.on("connection_state_changed", _on_connection_state_changed)


VOICE_INSTRUCTIONS = """You are the Kuriftu hotel voice concierge. Replies must be short, clear, and natural for
text-to-speech. No emojis or markdown.

The guest can do almost everything by voice when authenticated:
- If they started voice while logged in on the website, their account is already linked — use authenticated tools.
- Otherwise use register_voice (new account) or login_voice (email + password). Never read passwords aloud; ask them
  to spell or say them quietly if needed, and warn that voice channels are less private than the website.

Public tools (no login): list_rooms, get_room, room_availability, quote_stay,
list_resorts, get_resort_details, list_resort_services, find_resort_places.
Use get_resort_details for mapOverview (how the property is laid out). Use list_resort_services for dining, spa, pool, activities, etc.
Use find_resort_places for directions from the lobby to restaurants, spa, pool, parking, room towers, and landmarks; optional search_query matches names or directions text.
Resort id or slug works for resort tools (e.g. kuriftu-lakeside).

Authenticated guest tools (need JWT from website link or login_voice / register_voice):
- get_my_profile: who is logged in
- create_booking: reserve a room (room_id, check_in, check_out as YYYY-MM-DD)
- list_my_bookings: filter upcoming, past, or all
- get_my_booking: one booking by id
- create_service_request: housekeeping / front desk / spa / dining requests (room_id, message, optional booking_id,
  optional service_category: housekeeping, dining, spa, maintenance, transport, concierge, other)
- list_my_service_requests
- list_my_notifications
- mark_all_notifications_read
- logout_voice: clear guest session (back to anonymous / staff token only)

Always call tools for real data; never invent prices, room names, or availability. If unsure which room, list_rooms first.

Summarize tool output in plain language; do not read raw JSON or ids aloud unless the guest asks.

Staff / admin tools (admin_*) only work when BOOKING_API_TOKEN is set on the worker and that token is an admin user.
If the API returns forbidden, say they need staff access.

If a tool fails, explain briefly and suggest fixes (dates, different room, log in, or try the website)."""


class HotelVoiceAgent(Agent):
    """Voice assistant with tools mapped to REST endpoints."""

    def __init__(self, api: BookingApiClient) -> None:
        self._api = api
        super().__init__(instructions=VOICE_INSTRUCTIONS)

    async def on_enter(self) -> None:
        """Speak first so the guest knows the agent is live and what it can do."""
        try:
            ctx = get_job_context()
            if not ctx.is_fake_job():
                try:
                    await asyncio.wait_for(ctx.wait_for_participant(), timeout=60.0)
                except TimeoutError:
                    logger.warning("wait_for_participant timed out; still sending greeting")
        except Exception:
            logger.exception("on_enter: wait_for_participant")

        try:
            sync = getattr(self._api, "sync_booking_jwt", None)
            if callable(sync):
                sync()

            self.session.generate_reply(
                tool_choice="none",
                instructions=(
                    "The guest just connected. Brief warm greeting as the Kuriftu hotel voice concierge. "
                    "Say they can explore resorts—dining, spa, pools, activities, directions on property—browse rooms, "
                    "check availability, get quotes, and once logged in book stays, submit service requests, "
                    "and hear notifications, all by voice. "
                    "If they use the website while logged in and then open voice, their account is already linked. "
                    "Otherwise they can register or log in by voice. Ask what they would like to do."
                ),
            )
        except Exception:
            logger.exception("on_enter: generate_reply failed")

    @function_tool()
    async def list_rooms(self, _ctx: RunContext) -> str:
        """List all rooms with id, name, description, and price per night."""
        try:
            return _dump(await self._api.list_rooms())
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("list_rooms")
            return f"Error: {e}"

    @function_tool()
    async def get_room(self, _ctx: RunContext, room_id: str) -> str:
        """Fetch one room by id."""
        try:
            return _dump(await self._api.get_room(room_id))
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("get_room")
            return f"Error: {e}"

    @function_tool()
    async def room_availability(self, _ctx: RunContext, room_id: str, month: str) -> str:
        """Calendar-style availability for one room. month format YYYY-MM (e.g. 2026-04)."""
        try:
            return _dump(await self._api.room_availability(room_id, month))
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("room_availability")
            return f"Error: {e}"

    @function_tool()
    async def quote_stay(self, _ctx: RunContext, room_id: str, check_in: str, check_out: str) -> str:
        """Price quote: nights times nightly rate. Dates YYYY-MM-DD."""
        try:
            return _dump(await self._api.quote(room_id, check_in, check_out))
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("quote_stay")
            return f"Error: {e}"

    @function_tool()
    async def list_resorts(self, _ctx: RunContext) -> str:
        """List all Kuriftu resorts with id, slug, region, short description, and counts of services and map places."""
        try:
            return _dump(await self._api.list_resorts())
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("list_resorts")
            return f"Error: {e}"

    @function_tool()
    async def get_resort_details(self, _ctx: RunContext, resort_id_or_slug: str) -> str:
        """Full resort profile: address, descriptions, and mapOverview (voice-friendly layout of the property)."""
        try:
            return _dump(await self._api.get_resort(resort_id_or_slug))
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("get_resort_details")
            return f"Error: {e}"

    @function_tool()
    async def list_resort_services(
        self,
        _ctx: RunContext,
        resort_id_or_slug: str,
        category: str | None = None,
        search_query: str | None = None,
    ) -> str:
        """List on-property offerings: dining, spa, pool, fitness, kids, concierge, transport, in_room, wellness, activities.
        Optional category filters (e.g. dining, spa). Optional search_query matches title, description, or location."""
        try:
            return _dump(
                await self._api.list_resort_services(
                    resort_id_or_slug,
                    category=category,
                    query=search_query,
                )
            )
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("list_resort_services")
            return f"Error: {e}"

    @function_tool()
    async def find_resort_places(
        self,
        _ctx: RunContext,
        resort_id_or_slug: str,
        category: str | None = None,
        search_query: str | None = None,
    ) -> str:
        """Find map locations and walking directions from the lobby: restaurants, spa, pool, parking, room towers, landmarks.
        Optional category (e.g. restaurant, spa, pool, parking). Optional search_query matches name, building, or directions text."""
        try:
            return _dump(
                await self._api.list_map_places(
                    resort_id_or_slug,
                    category=category,
                    query=search_query,
                )
            )
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("find_resort_places")
            return f"Error: {e}"

    @function_tool()
    async def register_voice(self, _ctx: RunContext, email: str, password: str) -> str:
        """Create a new guest account and sign them in for voice. Then they can book and use service requests."""
        try:
            await self._api.register(email.strip(), password)
            self._api.force_token = self._api.token
            return "Registration succeeded. You are signed in for this voice session. You can book a room or use other guest features."
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("register_voice")
            return f"Error: {e}"

    @function_tool()
    async def login_voice(self, _ctx: RunContext, email: str, password: str) -> str:
        """Sign in with email and password for this voice session so bookings and requests use their account."""
        try:
            await self._api.login(email.strip(), password)
            self._api.force_token = self._api.token
            return "Signed in successfully for this voice session."
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("login_voice")
            return f"Error: {e}"

    @function_tool()
    async def logout_voice(self, _ctx: RunContext) -> str:
        """Sign out the guest for this voice session (clears voice login; re-applies browser-linked JWT or staff token)."""
        self._api.force_token = None
        try:
            ctx = get_job_context()
            _sync_api_token_from_room(ctx.room, self._api)
        except Exception:
            self._api.token = self._api.staff_token
        return "Signed out. Say if you want to log in again or use another account."

    @function_tool()
    async def get_my_profile(self, _ctx: RunContext) -> str:
        """Return the logged-in user's profile (requires authentication)."""
        try:
            return _dump(await self._api.get_me())
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("get_my_profile")
            return f"Error: {e}"

    @function_tool()
    async def create_booking(self, _ctx: RunContext, room_id: str, check_in: str, check_out: str) -> str:
        """Create a reservation. Dates must be YYYY-MM-DD. Requires guest authentication."""
        try:
            return _dump(await self._api.create_booking(room_id, check_in, check_out))
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("create_booking")
            return f"Error: {e}"

    @function_tool()
    async def list_my_bookings(
        self, _ctx: RunContext, filter_mode: str = "upcoming"
    ) -> str:
        """List bookings for the signed-in user. filter_mode: upcoming, past, or all."""
        mode = filter_mode.strip().lower()
        if mode not in ("upcoming", "past", "all"):
            mode = "all"
        try:
            return _dump(await self._api.list_bookings(mode))
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("list_my_bookings")
            return f"Error: {e}"

    @function_tool()
    async def get_my_booking(self, _ctx: RunContext, booking_id: str) -> str:
        """Get one booking by id for the signed-in user."""
        try:
            return _dump(await self._api.get_booking(booking_id.strip()))
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("get_my_booking")
            return f"Error: {e}"

    @function_tool()
    async def create_service_request(
        self,
        _ctx: RunContext,
        room_id: str,
        message: str,
        booking_id: str | None = None,
        service_category: str | None = None,
    ) -> str:
        """Submit a staff request for a room. Optional booking_id links it to a stay.
        service_category if known: housekeeping, dining, spa, maintenance, transport, concierge, other."""
        try:
            cat = (service_category.strip().lower() or None) if service_category else None
            return _dump(
                await self._api.create_service_request(
                    room_id,
                    message.strip(),
                    (booking_id.strip() or None) if booking_id else None,
                    service_category=cat,
                )
            )
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("create_service_request")
            return f"Error: {e}"

    @function_tool()
    async def list_my_service_requests(self, _ctx: RunContext) -> str:
        """List service requests created by the signed-in user."""
        try:
            return _dump(await self._api.list_service_requests())
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("list_my_service_requests")
            return f"Error: {e}"

    @function_tool()
    async def list_my_notifications(self, _ctx: RunContext) -> str:
        """List in-app notifications for the signed-in user."""
        try:
            return _dump(await self._api.list_notifications())
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("list_my_notifications")
            return f"Error: {e}"

    @function_tool()
    async def mark_all_notifications_read(self, _ctx: RunContext) -> str:
        """Mark every notification as read for the signed-in user."""
        try:
            return _dump(await self._api.mark_all_notifications_read())
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("mark_all_notifications_read")
            return f"Error: {e}"

    @function_tool()
    async def admin_dashboard(self, _ctx: RunContext) -> str:
        """Staff only: totals, active bookings, pending service requests."""
        try:
            return _dump(await self._api.admin_dashboard())
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("admin_dashboard")
            return f"Error: {e}"

    @function_tool()
    async def admin_list_service_requests(self, _ctx: RunContext) -> str:
        """Staff only: all service requests (any status)."""
        try:
            return _dump(await self._api.admin_list_service_requests())
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("admin_list_service_requests")
            return f"Error: {e}"

    @function_tool()
    async def admin_create_room(
        self, _ctx: RunContext, name: str, price_per_night: int, description: str | None = None
    ) -> str:
        """Staff only: add a room. price_per_night is a whole number (same units as the API)."""
        try:
            return _dump(await self._api.admin_create_room(name, price_per_night, description))
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("admin_create_room")
            return f"Error: {e}"

    @function_tool()
    async def admin_check_in(self, _ctx: RunContext, booking_id: str) -> str:
        """Staff only: mark guest checked in."""
        try:
            return _dump(await self._api.admin_check_in(booking_id))
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("admin_check_in")
            return f"Error: {e}"

    @function_tool()
    async def admin_check_out(self, _ctx: RunContext, booking_id: str) -> str:
        """Staff only: mark guest checked out (after check-in)."""
        try:
            return _dump(await self._api.admin_check_out(booking_id))
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("admin_check_out")
            return f"Error: {e}"

    @function_tool()
    async def admin_set_service_request_status(
        self, _ctx: RunContext, request_id: str, status: str
    ) -> str:
        """Staff only: set service request status. status is PENDING, IN_PROGRESS, or COMPLETED."""
        try:
            return _dump(await self._api.admin_set_service_status(request_id, status.upper()))
        except BookingApiError as e:
            return f"Error: {e}"
        except Exception as e:
            logger.exception("admin_set_service_request_status")
            return f"Error: {e}"


server = AgentServer()


def prewarm(proc: JobProcess) -> None:
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


async def _probe_booking_api(base: str) -> None:
    url = f"{base.rstrip('/')}/health"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(url)
        logger.info("BOOKING_API probe GET %s -> %s", url, r.status_code)
        if r.status_code >= 400:
            logger.warning("BOOKING_API /health returned %s; check API logs", r.status_code)
    except Exception as e:
        logger.error(
            "BOOKING_API unreachable at %s (%s). Fix BOOKING_API_BASE in .env "
            "(from Docker try http://host.docker.internal:4000). Voice tools will fail until the API is reachable.",
            url,
            e,
        )


@server.rtc_session(agent_name="kuriftu-hotel")
async def hotel_entrypoint(ctx: JobContext) -> None:
    ctx.log_context_fields = {"room": ctx.room.name}
    base = os.getenv("BOOKING_API_BASE", "http://127.0.0.1:4000").strip()
    staff_token = (os.getenv("BOOKING_API_TOKEN") or os.getenv("BOOKING_API_BEARER") or "").strip() or None
    api = BookingApiClient(base, token=staff_token)

    await _probe_booking_api(base)

    _bind_room_jwt_sync(ctx.room, api)

    def sync_booking_jwt() -> None:
        _sync_api_token_from_room(ctx.room, api)

    setattr(api, "sync_booking_jwt", sync_booking_jwt)

    stt_lang = (os.getenv("KURIFTU_STT_LANGUAGE") or "multi").strip()
    session = AgentSession(
        stt=inference.STT("deepgram/nova-3", language=stt_lang),
        llm=inference.LLM("openai/gpt-4.1-mini"),
        tts=inference.TTS("cartesia/sonic-3", voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc"),
        vad=ctx.proc.userdata["vad"],
        turn_handling=TurnHandlingOptions(
            turn_detection="stt",
            endpointing={"min_delay": 0.35, "max_delay": 3.0},
            interruption={
                "mode": "vad",
                "resume_false_interruption": True,
                "false_interruption_timeout": 1.0,
            },
        ),
        preemptive_generation=True,
        aec_warmup_duration=1.0,
    )
    _attach_session_debug_logging(session)
    logger.info(
        "voice session: turn_detection=stt, stt_language=%r, guest JWT attr=%r",
        stt_lang,
        BOOKING_JWT_ATTR,
    )

    await session.start(
        agent=HotelVoiceAgent(api),
        room=ctx.room,
        room_options=room_io.RoomOptions(),
    )

    # Guests who joined before the agent are in remote_participants without a participant_connected event.
    sync_booking_jwt()
    session_logger.info(
        "post session.start JWT sync: remotes=%s has_booking_token=%s",
        list(ctx.room.remote_participants.keys()),
        bool(api.token and api.token != staff_token),
    )

if __name__ == "__main__":
    cli.run_app(server)
