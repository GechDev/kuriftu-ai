import type {
  Booking,
  Notification,
  Room,
  ServiceRequest,
  ServiceRequestStatus,
  User,
} from "./types";

const getBase = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${getBase()}${path}`, {
    ...init,
    headers,
    mode: "cors",
    credentials: "omit",
  });
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg =
      typeof data === "object" && data !== null && "error" in data
        ? String((data as { error: string }).error)
        : res.statusText;
    throw new ApiError(msg || "Request failed", res.status, text);
  }
  return data as T;
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      request<{ user: User; token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    login: (email: string, password: string) =>
      request<{ user: User; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  },
  me: (token: string) =>
    request<{ user: User }>("/api/me", { token }),

  rooms: {
    list: () => request<{ rooms: Room[] }>("/api/rooms"),
    get: (id: string) => request<{ room: Room }>(`/api/rooms/${id}`),
    availability: (id: string, month: string) =>
      request<{ days: { date: string; booked: boolean }[]; month: string }>(
        `/api/rooms/${id}/availability?month=${encodeURIComponent(month)}`
      ),
    quote: (id: string, checkIn: string, checkOut: string) =>
      request<{
        nights: number;
        pricePerNight: number;
        totalPrice: number;
      }>(
        `/api/rooms/${id}/quote?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`
      ),
  },

  bookings: {
    create: (
      token: string,
      body: { roomId: string; checkIn: string; checkOut: string }
    ) =>
      request<{ booking: Booking }>("/api/bookings", {
        method: "POST",
        token,
        body: JSON.stringify(body),
      }),
    list: (token: string, filter: "upcoming" | "past" | "all" = "all") =>
      request<{ bookings: Booking[]; filter: string }>(
        `/api/bookings?filter=${filter}`,
        { token }
      ),
    get: (token: string, id: string) =>
      request<{ booking: Booking }>(`/api/bookings/${id}`, { token }),
  },

  serviceRequests: {
    list: (token: string) =>
      request<{ serviceRequests: ServiceRequest[] }>("/api/service-requests", {
        token,
      }),
    create: (
      token: string,
      body: { roomId: string; message: string; bookingId?: string }
    ) =>
      request<{ serviceRequest: ServiceRequest }>("/api/service-requests", {
        method: "POST",
        token,
        body: JSON.stringify(body),
      }),
  },

  notifications: {
    list: (token: string) =>
      request<{ notifications: Notification[] }>("/api/notifications", {
        token,
      }),
    markRead: (token: string, id: string) =>
      request<{ notification: Notification }>(
        `/api/notifications/${id}/read`,
        { method: "PATCH", token }
      ),
    readAll: (token: string) =>
      request<{ ok: boolean }>("/api/notifications/read-all", {
        method: "POST",
        token,
      }),
  },

  admin: {
    dashboard: (token: string) =>
      request<{
        totalBookings: number;
        totalRevenue: number;
        activeBookings: Booking[];
        pendingServiceRequests: ServiceRequest[];
      }>("/api/admin/dashboard", { token }),
    serviceRequests: (token: string) =>
      request<{ serviceRequests: ServiceRequest[] }>(
        "/api/admin/service-requests",
        { token }
      ),
    updateServiceStatus: (
      token: string,
      id: string,
      status: ServiceRequestStatus
    ) =>
      request<{ serviceRequest: ServiceRequest }>(
        `/api/admin/service-requests/${id}`,
        { method: "PATCH", token, body: JSON.stringify({ status }) }
      ),
    createRoom: (
      token: string,
      body: { name: string; description?: string; pricePerNight: number }
    ) =>
      request<{ room: Room }>("/api/admin/rooms", {
        method: "POST",
        token,
        body: JSON.stringify(body),
      }),
    checkIn: (token: string, bookingId: string) =>
      request<{ booking: Booking }>(
        `/api/admin/bookings/${bookingId}/check-in`,
        { method: "PATCH", token }
      ),
    checkOut: (token: string, bookingId: string) =>
      request<{ booking: Booking }>(
        `/api/admin/bookings/${bookingId}/check-out`,
        { method: "PATCH", token }
      ),
  },
};
