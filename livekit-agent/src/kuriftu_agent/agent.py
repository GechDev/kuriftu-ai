"""LiveKit voice agent: drives Kuriftu booking API via LLM function tools."""

from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any

from dotenv import load_dotenv
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


class HotelVoiceAgent(Agent):
    """Voice assistant with tools mapped to REST endpoints."""

    def __init__(self, api: BookingApiClient) -> None:
        self._api = api
        super().__init__(
            instructions="""You are the Kuriftu hotel voice concierge. Users speak to you; keep replies short, clear,
and natural for text-to-speech. No emojis or markdown.

Never ask for email, password, sign-in, sign-up, or account creation on voice. Do not offer to log the guest in.

Voice can help guests explore the hotel only:
- list_rooms: all rooms with names and nightly prices
- get_room: details for one room by id
- room_availability: which nights are free in a given month (month as YYYY-MM)
- quote_stay: estimated total for check-in and check-out (dates must be YYYY-MM-DD)

Summarize tool results in plain spoken language. Never read JSON, raw ids, or field names aloud—give names, prices,
dates, and totals in natural phrases.

If someone wants to reserve, change a booking, submit service requests, or see notifications, tell them to use the
Kuriftu website or app where they can complete checkout securely.

Admin tools (admin_dashboard, admin_list_service_requests, admin_create_room, admin_check_in, admin_check_out,
admin_set_service_request_status) only work when the worker is configured with staff API access. If the API returns
forbidden or unauthorized, say to use the admin dashboard in the browser.

If a tool fails, explain briefly and suggest trying different dates or another room, or using the website.""",
        )

    async def on_enter(self) -> None:
        """Speak first so the guest knows the agent is live and what it can do."""
        try:
            ctx = get_job_context()
            if not ctx.is_fake_job():
                # Avoid greeting before the browser has joined/subscribed (easy to miss the first utterance).
                try:
                    await asyncio.wait_for(ctx.wait_for_participant(), timeout=60.0)
                except TimeoutError:
                    logger.warning("wait_for_participant timed out; still sending greeting")
        except Exception:
            logger.exception("on_enter: wait_for_participant")

        try:
            # Do not await wait_for_playout here — it can block startup before playout is wired (see LiveKit basic_agent).
            self.session.generate_reply(
                tool_choice="none",
                instructions=(
                    "The guest just connected. Give a brief warm greeting as the Kuriftu hotel voice concierge. "
                    "Say you can help them explore rooms, check availability for a month, and get a price quote for "
                    "specific dates. Mention that actual reservations are completed on the Kuriftu website or app. "
                    "Do not ask for login or password. Ask what they would like to know."
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


@server.rtc_session(agent_name="kuriftu-hotel")
async def hotel_entrypoint(ctx: JobContext) -> None:
    ctx.log_context_fields = {"room": ctx.room.name}
    base = os.getenv("BOOKING_API_BASE", "http://127.0.0.1:4000").strip()
    staff_token = (os.getenv("BOOKING_API_TOKEN") or os.getenv("BOOKING_API_BEARER") or "").strip() or None
    api = BookingApiClient(base, token=staff_token)

    # Turn end: use STT (Deepgram via LiveKit inference emits END_OF_SPEECH after finals).
    # Pure VAD endpointing often misses end-of-speech on mic/browser audio, so the agent stops responding.
    # interruption.mode=vad keeps adaptive STT gating off (see prior transcript-hold bug with aligned STT).
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
        "voice session: turn_detection=stt (EOS from inference STT), stt_language=%r, "
        "aec_warmup=1s, interruption.mode=vad",
        stt_lang,
    )

    await session.start(
        agent=HotelVoiceAgent(api),
        room=ctx.room,
        # Default mic path (no BVC): browser audio + BVC was hurting STT/VAD for many setups.
        room_options=room_io.RoomOptions(),
    )


if __name__ == "__main__":
    cli.run_app(server)
