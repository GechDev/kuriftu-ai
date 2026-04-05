"use client";

import { RequireAuth } from "@/components/require-auth";
import { Badge, Card, EmptyState, LinkButton, Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import {
  categoryLabel,
  formatCurrency,
  formatStayRange,
  nightsLabel,
  serviceStatusLabel,
} from "@/lib/guest-format";
import type { Booking, StaySummary } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function stayBadge(b: Booking) {
  if (b.checkedOutAt) return { label: "Stay completed", variant: "muted" as const };
  if (b.checkedInAt) return { label: "Checked in", variant: "success" as const };
  return { label: "Confirmed", variant: "accent" as const };
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [staySummary, setStaySummary] = useState<StaySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    let c = false;
    void (async () => {
      setLoading(true);
      try {
        const { booking: b, staySummary: s } = await api.bookings.get(
          token,
          id as string
        );
        if (!c) {
          setBooking(b);
          setStaySummary(s);
        }
      } catch {
        if (!c) {
          setBooking(null);
          setStaySummary(null);
        }
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [token, id]);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <Link
          href="/bookings"
          className="text-sm font-medium text-muted transition hover:text-accent"
        >
          ← My bookings
        </Link>

        {loading ? (
          <div className="mt-20 flex justify-center">
            <Spinner />
          </div>
        ) : !booking || !staySummary ? (
          <div className="mt-10">
            <EmptyState title="Booking not found" />
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="flex flex-col gap-4 border-b border-border/80 pb-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                {booking.room?.resort ? (
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    <Link
                      href={`/resorts/${booking.room.resort.slug}`}
                      className="text-accent hover:underline"
                    >
                      {booking.room.resort.name}
                    </Link>
                    {booking.room.resort.region
                      ? ` · ${booking.room.resort.region}`
                      : ""}
                  </p>
                ) : null}
                <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground sm:text-[2rem]">
                  {booking.room?.name ?? "Your stay"}
                </h1>
                <p className="text-[15px] text-muted">
                  {formatStayRange(booking.checkIn, booking.checkOut)}
                  <span className="text-border"> · </span>
                  {nightsLabel(staySummary.nights)}
                </p>
              </div>
              <Badge variant={stayBadge(booking).variant}>{stayBadge(booking).label}</Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 space-y-6 p-6 sm:p-8">
                <h2 className="text-sm font-semibold text-foreground">Stay details</h2>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-sm bg-surface-2/70 p-4">
                    <dt className="text-xs font-medium text-muted">Check-in</dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">
                      {new Date(booking.checkIn).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                  <div className="rounded-sm bg-surface-2/70 p-4">
                    <dt className="text-xs font-medium text-muted">Check-out</dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">
                      {new Date(booking.checkOut).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                  <div className="rounded-sm bg-surface-2/70 p-4">
                    <dt className="text-xs font-medium text-muted">Nights</dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">
                      {nightsLabel(staySummary.nights)}
                    </dd>
                  </div>
                  <div className="rounded-sm bg-surface-2/70 p-4">
                    <dt className="text-xs font-medium text-muted">Average nightly rate</dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">
                      {formatCurrency(staySummary.pricePerNight)}
                    </dd>
                  </div>
                  <div className="rounded-sm bg-surface-2/70 p-4 sm:col-span-2">
                    <dt className="text-xs font-medium text-muted">Total for stay</dt>
                    <dd className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                      {formatCurrency(staySummary.totalPrice)}
                    </dd>
                  </div>
                </dl>

                {booking.room?.description ? (
                  <div className="border-t border-border/60 pt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                      About this room
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {booking.room.description}
                    </p>
                    <Link
                      href={`/rooms/${booking.roomId}`}
                      className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
                    >
                      View room page
                    </Link>
                  </div>
                ) : (
                  <div className="border-t border-border/60 pt-6">
                    <Link
                      href={`/rooms/${booking.roomId}`}
                      className="text-sm font-semibold text-accent hover:underline"
                    >
                      View room details
                    </Link>
                  </div>
                )}

                <div className="border-t border-border/60 pt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Reference
                  </h3>
                  <p className="mt-2 font-mono text-xs text-foreground/80">{booking.id}</p>
                  <p className="mt-1 text-xs text-muted">
                    Booked {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
              </Card>

              <Card className="flex h-fit flex-col gap-4 p-6">
                <h2 className="text-sm font-semibold text-foreground">Guest services</h2>
                <p className="text-sm leading-relaxed text-muted">
                  Tie a request to this stay so housekeeping and front desk see the right
                  context.
                </p>
                <LinkButton
                  href={`/requests?roomId=${booking.roomId}&bookingId=${booking.id}`}
                  className="w-full"
                >
                  New request for this stay
                </LinkButton>
                <LinkButton href="/requests" variant="secondary" className="w-full">
                  All service requests
                </LinkButton>
              </Card>
            </div>

            <section>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Requests for this stay
                </h2>
                {booking.serviceRequests && booking.serviceRequests.length > 0 ? (
                  <Link
                    href={`/requests?bookingId=${booking.id}`}
                    className="text-sm font-semibold text-accent hover:underline"
                  >
                    View in requests
                  </Link>
                ) : null}
              </div>
              {!booking.serviceRequests || booking.serviceRequests.length === 0 ? (
                <Card className="border-dashed p-10 text-center">
                  <p className="text-sm text-muted">
                    No service requests linked to this booking yet.
                  </p>
                  <LinkButton
                    href={`/requests?roomId=${booking.roomId}&bookingId=${booking.id}`}
                    variant="secondary"
                    className="mt-4 inline-flex"
                  >
                    Create a request
                  </LinkButton>
                </Card>
              ) : (
                <ul className="space-y-3">
                  {booking.serviceRequests.map((sr) => (
                    <li key={sr.id}>
                      <Link href={`/requests/${sr.id}`}>
                        <Card hover className="p-5 transition">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="muted">{serviceStatusLabel(sr.status)}</Badge>
                                {sr.serviceCategory ? (
                                  <Badge variant="default">
                                    {categoryLabel(sr.serviceCategory)}
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="mt-2 line-clamp-2 text-sm text-foreground">
                                {sr.message}
                              </p>
                              <p className="mt-2 text-xs text-muted">
                                Submitted {new Date(sr.createdAt).toLocaleString()}
                                {sr.updatedAt !== sr.createdAt
                                  ? ` · Updated ${new Date(sr.updatedAt).toLocaleString()}`
                                  : ""}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold text-accent">
                              Open →
                            </span>
                          </div>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
