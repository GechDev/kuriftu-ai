"use client";

import { RequireAuth } from "@/components/require-auth";
import { Badge, Button, EmptyState, Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import type { Booking } from "@/lib/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Filter = "upcoming" | "past" | "all";

function fmt(d: string) {
  return new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default function BookingsPage() {
  const { token } = useAuth();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [bookings, setBookings] = useState<Booking[] | null>(null);
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
    void load();
  }, [load]);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          My bookings
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["upcoming", "past", "all"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "primary" : "secondary"}
              className="!px-3 capitalize"
              onClick={() => {
                setBookings(null);
                setFilter(f);
              }}
            >
              {f}
            </Button>
          ))}
        </div>

        {bookings === null ? (
          <div className="mt-12 flex justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="mt-8 text-red-600">{error}</p>
        ) : bookings.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No bookings"
              description={`Nothing in "${filter}" right now.`}
              action={
                <Link href="/rooms">
                  <Button>Browse rooms</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Room</th>
                  <th className="px-4 py-3 font-medium">Check-in</th>
                  <th className="px-4 py-3 font-medium">Check-out</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-zinc-100 dark:border-zinc-800/80"
                  >
                    <td className="px-4 py-3 font-medium">
                      {b.room?.name ?? b.roomId.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {fmt(b.checkIn)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {fmt(b.checkOut)}
                    </td>
                    <td className="px-4 py-3">${b.totalPrice}</td>
                    <td className="px-4 py-3">
                      {b.checkedOutAt ? (
                        <Badge variant="muted">Checked out</Badge>
                      ) : b.checkedInAt ? (
                        <Badge variant="success">Checked in</Badge>
                      ) : (
                        <Badge>Confirmed</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/bookings/${b.id}`}
                        className="font-medium text-zinc-900 underline dark:text-zinc-100"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
