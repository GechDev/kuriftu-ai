"use client";

import { RequireAuth } from "@/components/require-auth";
import { Badge, Button, Card, EmptyState, Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookingDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
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
        const { booking: b } = await api.bookings.get(token, id as string);
        if (!c) setBooking(b);
      } catch {
        if (!c) setBooking(null);
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
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/bookings" className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← My bookings
        </Link>
        {loading ? (
          <div className="mt-12 flex justify-center">
            <Spinner />
          </div>
        ) : !booking ? (
          <div className="mt-8">
            <EmptyState title="Booking not found" />
          </div>
        ) : (
          <Card className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {booking.room?.name ?? "Stay"}
              </h1>
              {booking.checkedOutAt ? (
                <Badge variant="muted">Checked out</Badge>
              ) : booking.checkedInAt ? (
                <Badge variant="success">Checked in</Badge>
              ) : (
                <Badge>Confirmed</Badge>
              )}
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-zinc-100 py-2 dark:border-zinc-800">
                <dt className="text-zinc-500">Check-in</dt>
                <dd className="font-medium">
                  {new Date(booking.checkIn).toLocaleDateString(undefined, {
                    dateStyle: "full",
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-zinc-100 py-2 dark:border-zinc-800">
                <dt className="text-zinc-500">Check-out</dt>
                <dd className="font-medium">
                  {new Date(booking.checkOut).toLocaleDateString(undefined, {
                    dateStyle: "full",
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-zinc-100 py-2 dark:border-zinc-800">
                <dt className="text-zinc-500">Total</dt>
                <dd className="font-medium">${booking.totalPrice}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <dt className="text-zinc-500">Booking ID</dt>
                <dd className="font-mono text-xs">{booking.id}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <Link href={`/requests?roomId=${booking.roomId}&bookingId=${booking.id}`}>
                <Button variant="secondary" className="w-full sm:w-auto">
                  Request service for this stay
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </RequireAuth>
  );
}
