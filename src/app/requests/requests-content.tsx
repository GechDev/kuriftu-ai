"use client";

import { RequireAuth } from "@/components/require-auth";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  SelectField,
  Spinner,
  TextArea,
} from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import {
  bookingOptionLabel,
  categoryLabel,
  formatCurrency,
  formatStayRange,
  nightsLabel,
  serviceStatusLabel,
} from "@/lib/guest-format";
import type { BookingWithSummary, Room, ServiceRequest } from "@/lib/types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export function RequestsContent() {
  const { token } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const preRoom = search.get("roomId") ?? "";
  const preBooking = search.get("bookingId") ?? "";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<BookingWithSummary[]>([]);
  const [list, setList] = useState<ServiceRequest[] | null>(null);
  const [roomId, setRoomId] = useState(preRoom);
  const [bookingId, setBookingId] = useState(preBooking);
  const [message, setMessage] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [{ rooms: r }, { serviceRequests: s }, { bookings: b }] = await Promise.all([
        api.rooms.list(),
        api.serviceRequests.list(token),
        api.bookings.list(token, "all"),
      ]);
      setRooms(r);
      setList(s);
      setBookings(b);
    } catch (e) {
      setList([]);
      setError(e instanceof ApiError ? e.message : "Failed to load");
    }
  }, [token]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    setRoomId(preRoom);
    setBookingId(preBooking);
  }, [preRoom, preBooking]);

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === bookingId) ?? null,
    [bookings, bookingId]
  );

  function onBookingPick(id: string) {
    setBookingId(id);
    if (id) {
      const b = bookings.find((x) => x.id === id);
      if (b) setRoomId(b.roomId);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !roomId || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.serviceRequests.create(token, {
        roomId,
        message: message.trim(),
        bookingId: bookingId || undefined,
        serviceCategory: serviceCategory || undefined,
      });
      setMessage("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  function statusVariant(
    s: ServiceRequest["status"]
  ): "default" | "success" | "warning" | "muted" {
    if (s === "COMPLETED") return "success";
    if (s === "IN_PROGRESS") return "warning";
    return "default";
  }

  const highlightedId = preBooking || null;

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <PageHeader
          eyebrow="Guest services"
          title="Service requests"
          description="Send detailed messages to the team, categorize the type of need, and optionally tie each ticket to an active booking so context travels with the request."
        />

        {highlightedId ? (
          <div className="mt-8 rounded-sm border border-accent/25 bg-accent-muted/30 px-5 py-4 text-sm">
            <span className="text-foreground">
              You opened this page from a stay — new requests will pre-link to that booking
              when selected below.
            </span>
            <button
              type="button"
              className="ml-3 font-semibold text-accent hover:underline"
              onClick={() => {
                router.replace("/requests");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-5 lg:gap-10">
          <Card className="reveal lg:col-span-2">
            <h2 className="text-sm font-semibold text-foreground">New request</h2>
            <p className="mt-1 text-sm text-muted">
              Choose a room and optional stay. Your message is sent as-is to operations.
            </p>
            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
              <SelectField
                label="Room"
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              >
                <option value="">Select room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {r.resort ? ` · ${r.resort.name}` : ""}
                  </option>
                ))}
              </SelectField>

              <SelectField
                label="Link to a booking (recommended)"
                value={bookingId}
                onChange={(e) => onBookingPick(e.target.value)}
              >
                <option value="">No specific stay</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {bookingOptionLabel(b)}
                  </option>
                ))}
              </SelectField>

              {selectedBooking ? (
                <div className="rounded-sm border border-border/80 bg-surface-2/50 p-4 text-sm">
                  <p className="font-medium text-foreground">
                    {selectedBooking.room?.name ?? "Stay"}
                  </p>
                  <p className="mt-1 text-muted">
                    {formatStayRange(selectedBooking.checkIn, selectedBooking.checkOut)} ·{" "}
                    {nightsLabel(selectedBooking.staySummary.nights)} ·{" "}
                    {formatCurrency(selectedBooking.staySummary.totalPrice)} total
                  </p>
                  <Link
                    href={`/bookings/${selectedBooking.id}`}
                    className="mt-2 inline-block text-xs font-semibold text-accent hover:underline"
                  >
                    Open booking
                  </Link>
                </div>
              ) : null}

              <SelectField
                label="Request type"
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
              >
                <option value="">General</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="dining">Dining</option>
                <option value="spa">Spa</option>
                <option value="maintenance">Maintenance</option>
                <option value="transport">Transport</option>
                <option value="concierge">Concierge</option>
                <option value="other">Other</option>
              </SelectField>
              <TextArea
                label="Message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what you need: time, quantity, special instructions…"
                rows={5}
              />
              {error ? <Alert>{error}</Alert> : null}
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? "Sending…" : "Submit request"}
              </Button>
            </form>
          </Card>

          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold text-foreground">Your requests</h2>
            <p className="mt-1 text-sm text-muted">
              Open any item for the full thread, timestamps, and linked stay details.
            </p>
            {list === null ? (
              <div className="mt-10 flex justify-center">
                <Spinner />
              </div>
            ) : list.length === 0 ? (
              <Card className="mt-6 border-dashed p-12">
                <EmptyState title="No requests yet" description="Use the form to reach the team." />
              </Card>
            ) : (
              <ul className="mt-6 space-y-4">
                {list.map((sr) => {
                  const linked = highlightedId && sr.bookingId === highlightedId;
                  return (
                    <li key={sr.id}>
                      <Link href={`/requests/${sr.id}`}>
                        <Card
                          hover
                          className={`reveal p-5 transition ${
                            linked ? "ring-2 ring-accent/35" : ""
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {sr.room?.name ?? "Room"}
                                </span>
                                <Badge variant={statusVariant(sr.status)}>
                                  {serviceStatusLabel(sr.status)}
                                </Badge>
                                {sr.serviceCategory ? (
                                  <Badge variant="muted">
                                    {categoryLabel(sr.serviceCategory)}
                                  </Badge>
                                ) : null}
                              </div>
                              {sr.booking ? (
                                <p className="mt-2 text-xs text-muted">
                                  Linked stay:{" "}
                                  {formatStayRange(sr.booking.checkIn, sr.booking.checkOut)}
                                  {sr.booking.room?.resort ? (
                                    <>
                                      {" "}
                                      ·{" "}
                                      <span className="text-foreground/80">
                                        {sr.booking.room.resort.name}
                                      </span>
                                    </>
                                  ) : null}
                                </p>
                              ) : (
                                <p className="mt-2 text-xs text-muted">No booking linked</p>
                              )}
                              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                                {sr.message}
                              </p>
                              <p className="mt-3 text-xs text-muted/90">
                                Submitted {new Date(sr.createdAt).toLocaleString()}
                                {sr.updatedAt !== sr.createdAt
                                  ? ` · Updated ${new Date(sr.updatedAt).toLocaleString()}`
                                  : ""}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold text-accent">
                              Details →
                            </span>
                          </div>
                        </Card>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
