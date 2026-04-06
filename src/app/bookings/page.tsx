"use client";

import { RequireAuth } from "@/components/require-auth";
import {
  Badge,
  Card,
  EmptyState,
  LinkButton,
  PageHeader,
  Spinner,
} from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import {
  formatCurrency,
  formatStayRange,
  nightsLabel,
} from "@/lib/guest-format";
import type { BookingWithSummary } from "@/lib/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Filter = "upcoming" | "past" | "all";

function stayBadge(b: BookingWithSummary) {
  if (b.checkedOutAt) return { label: "Completed", variant: "muted" as const };
  if (b.checkedInAt) return { label: "Checked in", variant: "success" as const };
  return { label: "Confirmed", variant: "accent" as const };
}

export default function BookingsPage() {
  const { token } = useAuth();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [bookings, setBookings] = useState<BookingWithSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const { bookings: b } = await api.bookings.list(token, filter);
      setBookings(b);
    } catch (e) {
      setBookings([]);
      setError(e instanceof ApiError ? e.message : "Failed to load");
    }
  }, [token, filter]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <PageHeader
          eyebrow="Stays"
          title="My bookings"
          description="Every reservation with nights, rate breakdown, and a quick path to guest services for that stay."
        />

        <div
          className="mt-10 inline-flex rounded-full border border-border/80 bg-surface p-1 shadow-[var(--shadow-card)]"
          role="tablist"
          aria-label="Booking timeframe"
        >
          {(["upcoming", "past", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                filter === f
                  ? "bg-accent text-accent-fg shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
              onClick={() => {
                setBookings(null);
                setFilter(f);
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {bookings === null ? (
          <div className="mt-20 flex justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="mt-12 text-sm text-danger">{error}</p>
        ) : bookings.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title="No bookings"
              description={`Nothing in “${filter}” right now. Browse rooms when you’re ready to plan a stay.`}
              action={<LinkButton href="/rooms">Browse rooms</LinkButton>}
            />
          </div>
        ) : (
          <ul className="mt-12 grid gap-5">
            {bookings.map((b, i) => {
              const badge = stayBadge(b);
              const reqCount = b._count?.serviceRequests ?? 0;
              const { staySummary } = b;
              return (
                <li
                  key={b.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.2)}s` }}
                >
                  <Card
                    hover
                    className="group relative overflow-hidden p-0 transition reveal"
                  >
                    <Link
                      href={`/bookings/${b.id}`}
                      className="absolute inset-0 z-0 rounded-[1.25rem]"
                      aria-label={`View booking: ${b.room?.name ?? "Stay"}`}
                    />
                    <div className="pointer-events-none relative z-[1] flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
                      <div className="min-w-0 flex-1 space-y-3">
                        {b.room?.resort ? (
                          <p className="pointer-events-auto text-[11px] font-semibold uppercase tracking-wider text-muted">
                            <Link
                              href={`/resorts/${b.room.resort.slug}`}
                              className="relative z-[2] text-accent hover:underline"
                            >
                              {b.room.resort.name}
                            </Link>
                            {b.room.resort.region ? ` · ${b.room.resort.region}` : ""}
                          </p>
                        ) : null}
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                          {b.room?.name ?? "Stay"}
                        </h2>
                        <p className="text-[15px] text-muted">
                          {formatStayRange(b.checkIn, b.checkOut)}
                          <span className="text-border"> · </span>
                          {nightsLabel(staySummary.nights)}
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="rounded-sm bg-surface-2 px-2.5 py-1 text-muted">
                            {formatCurrency(staySummary.pricePerNight)} / night
                          </span>
                          {reqCount > 0 ? (
                            <span className="rounded-lg bg-accent-muted/50 px-2.5 py-1 text-accent">
                              {reqCount} service request{reqCount === 1 ? "" : "s"}
                            </span>
                          ) : (
                            <span className="rounded-lg border border-dashed border-border px-2.5 py-1 text-muted">
                              No requests yet
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-start gap-4 sm:items-end">
                        <Badge
                          variant={badge.variant}
                          className={badge.label === "Confirmed" ? "pulse-glow" : ""}
                        >
                          {badge.label}
                        </Badge>
                        <div className="text-right">
                          <p className="text-xs font-medium text-muted">Total</p>
                          <p className="text-2xl font-semibold tracking-tight text-foreground">
                            {formatCurrency(staySummary.totalPrice)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-accent group-hover:underline">
                          Details
                          <span aria-hidden className="ml-1">
                            →
                          </span>
                        </span>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </RequireAuth>
  );
}
