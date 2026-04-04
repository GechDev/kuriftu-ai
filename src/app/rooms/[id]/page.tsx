"use client";

import { Badge, Button, Card, EmptyState, Input, Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import type { Room } from "@/lib/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function monthStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function RoomDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { token, user } = useAuth();
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [month, setMonth] = useState(() => monthStr(new Date()));
  const [days, setDays] = useState<{ date: string; booked: boolean }[]>([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [quote, setQuote] = useState<{
    nights: number;
    totalPrice: number;
    pricePerNight: number;
  } | null>(null);
  const [loadRoom, setLoadRoom] = useState(true);
  const [loadCal, setLoadCal] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    void (async () => {
      setLoadRoom(true);
      try {
        const { room: r } = await api.rooms.get(id);
        if (!c) setRoom(r);
      } catch (e) {
        if (!c) setError(e instanceof ApiError ? e.message : "Room not found");
      } finally {
        if (!c) setLoadRoom(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [id]);

  const loadAvailability = useCallback(async () => {
    setLoadCal(true);
    setError(null);
    try {
      const res = await api.rooms.availability(id, month);
      setDays(res.days);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Calendar failed");
    } finally {
      setLoadCal(false);
    }
  }, [id, month]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  const runQuote = async () => {
    if (!checkIn || !checkOut) return;
    setError(null);
    try {
      const q = await api.rooms.quote(id, checkIn, checkOut);
      setQuote({
        nights: q.nights,
        totalPrice: q.totalPrice,
        pricePerNight: q.pricePerNight,
      });
    } catch (e) {
      setQuote(null);
      setError(e instanceof ApiError ? e.message : "Quote failed");
    }
  };

  const submitBooking = async () => {
    if (!token || !checkIn || !checkOut) return;
    setBooking(true);
    setError(null);
    try {
      const { booking: b } = await api.bookings.create(token, {
        roomId: id,
        checkIn,
        checkOut,
      });
      router.push(`/bookings/${b.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const monthLabel = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  }, [month]);

  const calendarPad = useMemo(() => {
    if (!days.length) return 0;
    const [y, mo, d] = days[0].date.split("-").map(Number);
    const wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
    return (wd + 6) % 7;
  }, [days]);

  if (loadRoom) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <EmptyState title={error ?? "Room not found"} />
        <Link href="/rooms" className="mt-4 inline-block text-sm underline">
          Back to rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/rooms"
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
      >
        ← All rooms
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {room.name}
          </h1>
          {room.description ? (
            <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
              {room.description}
            </p>
          ) : null}
        </div>
        <Badge>${room.pricePerNight} / night</Badge>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Availability
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Booked days are highlighted. Checkout day is not a stayed night.
          </p>
          <p className="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {monthLabel}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="max-w-[200px]"
            />
            {loadCal ? <Spinner className="!h-5 !w-5" /> : null}
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div key={d} className="font-medium text-zinc-500">
                {d}
              </div>
            ))}
            {Array.from({ length: calendarPad }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((d) => {
              const dayNum = d.date.slice(-2);
              return (
                <div
                  key={d.date}
                  title={d.date}
                  className={`rounded-md py-2 ${
                    d.booked
                      ? "bg-amber-200 font-medium text-amber-950 dark:bg-amber-900/50 dark:text-amber-100"
                      : "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                  }`}
                >
                  {parseInt(dayNum, 10)}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Book this room
          </h2>
          {!user ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/login" className="font-medium underline">
                Log in
              </Link>{" "}
              or{" "}
              <Link href="/register" className="font-medium underline">
                register
              </Link>{" "}
              to book.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Check-in"
                  type="date"
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    setQuote(null);
                  }}
                />
                <Input
                  label="Check-out"
                  type="date"
                  value={checkOut}
                  onChange={(e) => {
                    setCheckOut(e.target.value);
                    setQuote(null);
                  }}
                />
              </div>
              <Button type="button" variant="secondary" onClick={() => void runQuote()}>
                Get quote
              </Button>
              {quote ? (
                <div className="rounded-lg bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
                  <p>
                    <strong>{quote.nights}</strong> night(s) × ${quote.pricePerNight} ={" "}
                    <strong>${quote.totalPrice}</strong> total
                  </p>
                </div>
              ) : null}
              {error ? (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              ) : null}
              <Button
                type="button"
                disabled={booking || !quote || !token}
                onClick={() => void submitBooking()}
              >
                {booking ? "Booking…" : "Confirm booking"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
