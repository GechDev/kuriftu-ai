"""Async HTTP client for the Kuriftu booking REST API (backend/)."""

from __future__ import annotations

import json
from typing import Any

import httpx

Json = dict[str, Any] | list[Any] | str | None


class BookingApiError(Exception):
    def __init__(self, message: str, status: int | None = None, body: str | None = None):
        super().__init__(message)
        self.status = status
        self.body = body


class BookingApiClient:
    def __init__(self, base_url: str, token: str | None = None) -> None:
        self.base_url = base_url.rstrip("/")
        #: Staff JWT from env; not overwritten when a guest JWT is applied to `token`.
        self.staff_token: str | None = token
        self.token = token
        #: When set, wins over LiveKit participant attributes (voice login/register).
        self.force_token: str | None = None

    def _headers(self) -> dict[str, str]:
        h = {"Content-Type": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h

    async def _request(
        self,
        method: str,
        path: str,
        *,
        json_body: Json = None,
        params: dict[str, str] | None = None,
        auth: bool = False,
    ) -> Any:
        if auth and not self.token:
            raise BookingApiError(
                "This action needs an authenticated user. Log in on the website before voice, "
                "or use login_voice / register_voice in this session."
            )
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=45.0) as client:
            r = await client.request(
                method,
                url,
                headers=self._headers(),
                json=json_body if json_body is not None else None,
                params=params,
            )
        text = r.text
        if r.status_code >= 400:
            raise BookingApiError(
                f"API error {r.status_code}: {text[:500]}",
                status=r.status_code,
                body=text,
            )
        if not text:
            return None
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return text

    async def register(self, email: str, password: str) -> Any:
        data = await self._request(
            "POST",
            "/api/auth/register",
            json_body={"email": email, "password": password},
        )
        if isinstance(data, dict) and "token" in data:
            self.token = str(data["token"])
        return data

    async def login(self, email: str, password: str) -> Any:
        data = await self._request(
            "POST",
            "/api/auth/login",
            json_body={"email": email, "password": password},
        )
        if isinstance(data, dict) and "token" in data:
            self.token = str(data["token"])
        return data

    async def list_rooms(self) -> Any:
        return await self._request("GET", "/api/rooms")

    async def list_resorts(self) -> Any:
        return await self._request("GET", "/api/resorts")

    async def get_resort(self, resort_id_or_slug: str) -> Any:
        rid = resort_id_or_slug.strip()
        return await self._request("GET", f"/api/resorts/{rid}")

    async def list_resort_services(
        self,
        resort_id_or_slug: str,
        *,
        category: str | None = None,
        query: str | None = None,
    ) -> Any:
        rid = resort_id_or_slug.strip()
        params: dict[str, str] = {}
        if category and category.strip():
            params["category"] = category.strip().lower()
        if query and query.strip():
            params["q"] = query.strip()
        return await self._request(
            "GET",
            f"/api/resorts/{rid}/services",
            params=params or None,
        )

    async def list_map_places(
        self,
        resort_id_or_slug: str,
        *,
        category: str | None = None,
        query: str | None = None,
    ) -> Any:
        rid = resort_id_or_slug.strip()
        params: dict[str, str] = {}
        if category and category.strip():
            params["category"] = category.strip().lower()
        if query and query.strip():
            params["q"] = query.strip()
        return await self._request(
            "GET",
            f"/api/resorts/{rid}/map-places",
            params=params or None,
        )

    async def get_room(self, room_id: str) -> Any:
        return await self._request("GET", f"/api/rooms/{room_id}")

    async def get_me(self) -> Any:
        return await self._request("GET", "/api/me", auth=True)

    async def room_availability(self, room_id: str, month: str) -> Any:
        return await self._request(
            "GET",
            f"/api/rooms/{room_id}/availability",
            params={"month": month},
        )

    async def quote(self, room_id: str, check_in: str, check_out: str) -> Any:
        return await self._request(
            "GET",
            f"/api/rooms/{room_id}/quote",
            params={"checkIn": check_in, "checkOut": check_out},
        )

    async def create_booking(self, room_id: str, check_in: str, check_out: str) -> Any:
        return await self._request(
            "POST",
            "/api/bookings",
            auth=True,
            json_body={"roomId": room_id, "checkIn": check_in, "checkOut": check_out},
        )

    async def list_bookings(self, filter_mode: str = "all") -> Any:
        return await self._request(
            "GET",
            "/api/bookings",
            auth=True,
            params={"filter": filter_mode},
        )

    async def get_booking(self, booking_id: str) -> Any:
        return await self._request("GET", f"/api/bookings/{booking_id}", auth=True)

    async def create_service_request(
        self,
        room_id: str,
        message: str,
        booking_id: str | None = None,
        service_category: str | None = None,
    ) -> Any:
        body: dict[str, Any] = {"roomId": room_id, "message": message}
        if booking_id:
            body["bookingId"] = booking_id
        if service_category and service_category.strip():
            body["serviceCategory"] = service_category.strip().lower()
        return await self._request("POST", "/api/service-requests", auth=True, json_body=body)

    async def list_service_requests(self) -> Any:
        return await self._request("GET", "/api/service-requests", auth=True)

    async def list_notifications(self) -> Any:
        return await self._request("GET", "/api/notifications", auth=True)

    async def mark_notification_read(self, notification_id: str) -> Any:
        return await self._request(
            "PATCH",
            f"/api/notifications/{notification_id}/read",
            auth=True,
        )

    async def mark_all_notifications_read(self) -> Any:
        return await self._request("POST", "/api/notifications/read-all", auth=True)

    async def admin_dashboard(self) -> Any:
        return await self._request("GET", "/api/admin/dashboard", auth=True)

    async def admin_list_service_requests(self) -> Any:
        return await self._request("GET", "/api/admin/service-requests", auth=True)

    async def admin_create_room(
        self, name: str, price_per_night: int, description: str | None = None
    ) -> Any:
        body: dict[str, Any] = {"name": name, "pricePerNight": price_per_night}
        if description is not None:
            body["description"] = description
        return await self._request("POST", "/api/admin/rooms", auth=True, json_body=body)

    async def admin_check_in(self, booking_id: str) -> Any:
        return await self._request(
            "PATCH",
            f"/api/admin/bookings/{booking_id}/check-in",
            auth=True,
        )

    async def admin_check_out(self, booking_id: str) -> Any:
        return await self._request(
            "PATCH",
            f"/api/admin/bookings/{booking_id}/check-out",
            auth=True,
        )

    async def admin_set_service_status(self, request_id: str, status: str) -> Any:
        return await self._request(
            "PATCH",
            f"/api/admin/service-requests/{request_id}",
            auth=True,
            json_body={"status": status},
        )
