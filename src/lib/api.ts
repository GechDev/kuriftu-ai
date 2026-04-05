import type {
  Booking,
  BookingWithSummary,
  MapPlaceItem,
  Notification,
  Resort,
  ResortListItem,
  ResortServiceItem,
  Room,
  ServiceRequest,
  ServiceRequestStatus,
  StaySummary,
  User,
} from "./types";

/**
 * Browser calls the booking API either:
 * - Same-origin `/api/backend/...` (Next rewrite → BACKEND_INTERNAL_URL) — avoids CORS issues locally and when API has strict CORS.
 * - Or absolute `NEXT_PUBLIC_API_URL` when you want the browser to talk to the API host directly.
 */
function getApiBase(): string {
  const u = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (u) return u.replace(/\/$/, "");
  return "/api/backend";
}

function buildUrl(path: string): string {
  const base = getApiBase();
  if (base.startsWith("http://") || base.startsWith("https://")) {
    return `${base}${path}`;
  }
  const sub = path.startsWith("/api/") ? path.slice(5) : path.replace(/^\//, "");
  const prefix = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${prefix}/${sub}`;
}

/** Browser fetch has no default timeout; hung API = hung UI (e.g. auth spinner forever). */
const REQUEST_TIMEOUT_MS = 15_000;

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

function isAbortError(e: unknown): boolean {
  if (e instanceof DOMException && e.name === "AbortError") return true;
  if (e instanceof Error && e.name === "AbortError") return true;
  return false;
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, signal: callerSignal, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path), {
      ...init,
      headers,
      mode: "cors",
      credentials: "omit",
      signal: controller.signal,
    });
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    if (isAbortError(e)) {
      throw new ApiError(
        "Request timed out. Start the booking API and ensure Next can reach it (BACKEND_INTERNAL_URL / port 4000).",
        408
      );
    }
    throw new ApiError(e instanceof Error ? e.message : "Network error", 0);
  }
  clearTimeout(timeoutId);

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

  resorts: {
    list: () => request<{ resorts: ResortListItem[] }>("/api/resorts"),
    get: (identifier: string) =>
      request<{ resort: Resort }>(`/api/resorts/${encodeURIComponent(identifier)}`),
    services: (
      identifier: string,
      params?: { category?: string; q?: string }
    ) => {
      const q = new URLSearchParams();
      if (params?.category) q.set("category", params.category);
      if (params?.q) q.set("q", params.q);
      const suffix = q.toString() ? `?${q}` : "";
      return request<{
        resortId: string;
        resortName: string;
        services: ResortServiceItem[];
      }>(`/api/resorts/${encodeURIComponent(identifier)}/services${suffix}`);
    },
    mapPlaces: (
      identifier: string,
      params?: { category?: string; q?: string }
    ) => {
      const q = new URLSearchParams();
      if (params?.category) q.set("category", params.category);
      if (params?.q) q.set("q", params.q);
      const suffix = q.toString() ? `?${q}` : "";
      return request<{
        resortId: string;
        resortName: string;
        mapPlaces: MapPlaceItem[];
      }>(`/api/resorts/${encodeURIComponent(identifier)}/map-places${suffix}`);
    },
  },

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
      request<{ booking: Booking; staySummary: StaySummary }>("/api/bookings", {
        method: "POST",
        token,
        body: JSON.stringify(body),
      }),
    list: (token: string, filter: "upcoming" | "past" | "all" = "all") =>
      request<{ bookings: BookingWithSummary[]; filter: string }>(
        `/api/bookings?filter=${filter}`,
        { token }
      ),
    get: (token: string, id: string) =>
      request<{ booking: Booking; staySummary: StaySummary }>(
        `/api/bookings/${id}`,
        { token }
      ),
  },

  serviceRequests: {
    list: (token: string) =>
      request<{ serviceRequests: ServiceRequest[] }>("/api/service-requests", {
        token,
      }),
    get: (token: string, id: string) =>
      request<{ serviceRequest: ServiceRequest }>(
        `/api/service-requests/${encodeURIComponent(id)}`,
        { token }
      ),
    create: (
      token: string,
      body: {
        roomId: string;
        message: string;
        bookingId?: string;
        serviceCategory?: ServiceRequest["serviceCategory"];
      }
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
      body: {
        name: string;
        description?: string;
        pricePerNight: number;
        resortId?: string;
      }
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

  pricing: {
    adminPreview: (token: string) =>
      request<{ services: import("./data/types").KuriftuServicePricingRow[]; updatedAt: number }>(
        "/api/pricing/admin/preview",
        { token }
      ),
    adminConfirm: (
      token: string,
      body?: { serviceIds?: string[]; applyAll?: boolean }
    ) =>
      request<{
        success: boolean;
        applied: {
          id: string;
          name: string;
          previousPublished: number;
          newPublished: number;
        }[];
        message: string;
      }>("/api/pricing/admin/confirm", {
        method: "POST",
        token,
        body: JSON.stringify(body ?? { applyAll: true }),
      }),
  },

  public: {
    serviceCatalog: (slug: string) =>
      request<{
        resort: { id: string; name: string; slug: string; region: string };
        services: Array<{
          id: string;
          category: string;
          title: string;
          description: string;
          hours: string | null;
          locationNote: string | null;
          howToBook: string | null;
          imageUrl: string | null;
          basePrice: number;
          publishedPrice: number;
        }>;
      }>(`/api/public/resorts/${encodeURIComponent(slug)}/services-catalog`),
  },
};
