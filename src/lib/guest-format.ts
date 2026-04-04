import type { Booking, ServiceRequestStatus } from "./types";

export function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatStayRange(checkIn: string, checkOut: string) {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const y = { ...opts, year: "numeric" as const };
  if (a.getFullYear() === b.getFullYear()) {
    return `${a.toLocaleDateString(undefined, opts)} – ${b.toLocaleDateString(undefined, y)}`;
  }
  return `${a.toLocaleDateString(undefined, y)} – ${b.toLocaleDateString(undefined, y)}`;
}

export function bookingOptionLabel(b: Pick<Booking, "room" | "checkIn" | "checkOut" | "id">) {
  const room = b.room?.name ?? "Room";
  const range = formatStayRange(b.checkIn, b.checkOut);
  return `${room} · ${range}`;
}

export function serviceStatusLabel(s: ServiceRequestStatus) {
  switch (s) {
    case "COMPLETED":
      return "Completed";
    case "IN_PROGRESS":
      return "In progress";
    default:
      return "Received";
  }
}

export function categoryLabel(cat: string | null | undefined) {
  if (!cat) return null;
  return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function nightsLabel(n: number) {
  return `${n} night${n === 1 ? "" : "s"}`;
}
