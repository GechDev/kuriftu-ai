"use client";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Spinner,
} from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import type { Room } from "@/lib/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  const [roomError, setRoomError] = useState<string | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    void (async () => {
      setLoadRoom(true);
      setRoomError(null);
      try {
        const { room: r } = await api.rooms.get(id);
        if (!c) setRoom(r);
      } catch (e) {
        if (!c)
          setRoomError(e instanceof ApiError ? e.message : "Room not found");
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
    setCalendarError(null);
    try {
      const res = await api.rooms.availability(id, month);
      setDays(res.days);
    } catch (e) {
      setCalendarError(
        e instanceof ApiError ? e.message : "Calendar failed to load",
      );
    } finally {
      setLoadCal(false);
    }
  }, [id, month]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  const fetchQuote = useCallback(async (): Promise<boolean> => {
    if (!checkIn || !checkOut) return false;
    setBookingError(null);
    try {
      const q = await api.rooms.quote(id, checkIn, checkOut);
      setQuote({
        nights: q.nights,
        totalPrice: q.totalPrice,
        pricePerNight: q.pricePerNight,
      });
      return true;
    } catch (e) {
      setQuote(null);
      setBookingError(
        e instanceof ApiError ? e.message : "Could not get a price quote",
      );
      return false;
    }
  }, [id, checkIn, checkOut]);

  const quoteDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!user || !checkIn || !checkOut) return;
    if (quoteDebounce.current) clearTimeout(quoteDebounce.current);
    quoteDebounce.current = setTimeout(() => {
      void fetchQuote();
    }, 450);
    return () => {
      if (quoteDebounce.current) clearTimeout(quoteDebounce.current);
    };
  }, [user, checkIn, checkOut, fetchQuote]);

  useEffect(() => {
    setQuote(null);
    setBookingError(null);
  }, [checkIn, checkOut]);

  const submitBooking = async () => {
    if (!token || !checkIn || !checkOut) return;
    setBooking(true);
    setBookingError(null);
    try {
      let ok = !!quote;
      if (!ok) ok = await fetchQuote();
      if (!ok) {
        setBooking(false);
        return;
      }
      const { booking: b } = await api.bookings.create(token, {
        roomId: id,
        checkIn,
        checkOut,
      });
      router.push(`/bookings/${b.id}`);
    } catch (e) {
      setBookingError(
        e instanceof ApiError ? e.message : "Booking failed — try again",
      );
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
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <EmptyState title={roomError ?? "Room not found"} />
        <Link
          href="/rooms"
          className="mt-6 inline-flex text-sm font-semibold text-accent hover:underline"
        >
          ← All rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <Link
        href="/rooms"
        className="inline-flex text-sm font-medium text-muted transition hover:text-accent"
      >
        ← All rooms
      </Link>

      <div className="mt-6 flex flex-col gap-6 border-b border-border pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Room detail
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {room.name}
          </h1>
          {room.resort ? (
            <p className="mt-3 text-sm text-muted">
              Part of{" "}
              <Link
                href={`/resorts/${room.resort.slug}`}
                className="font-semibold text-accent hover:underline"
              >
                {room.resort.name}
              </Link>
              {room.resort.region ? ` · ${room.resort.region}` : ""}
            </p>
          ) : null}
          {room.description ? (
            <p className="mt-3 text-base leading-relaxed text-muted">
              {room.description}
            </p>
          ) : null}
        </div>
        <Badge variant="accent" className="w-fit shrink-0 px-4 py-1 text-sm">
          ${room.pricePerNight} / night
        </Badge>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-foreground">Availability</h2>
          <p className="mt-1 text-xs text-muted">
            Booked days are highlighted. Checkout day is not a stayed night.
          </p>
          <p className="mt-4 text-sm font-semibold text-foreground">{monthLabel}</p>
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="max-w-[200px]"
            />
            {loadCal ? <Spinner className="!h-5 !w-5" /> : null}
          </div>
          {calendarError ? (
            <p className="mt-3 text-sm text-danger">{calendarError}</p>
          ) : null}
          <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
              <div key={d} className="py-1 text-muted">
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
                  className={`rounded-lg py-2 text-sm font-semibold ${
                    d.booked
                      ? "bg-amber-100 text-amber-950 ring-1 ring-amber-200"
                      : "bg-accent-muted/70 text-accent ring-1 ring-accent/25"
                  }`}
                >
                  {parseInt(dayNum, 10)}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-foreground">Book this room</h2>
          {!user ? (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              <Link href="/login" className="font-semibold text-accent hover:underline">
                Log in
              </Link>{" "}
              or{" "}
              <Link href="/register" className="font-semibold text-accent hover:underline">
                register
              </Link>{" "}
              to complete a reservation.
            </p>
          ) : (
            <div className="mt-5 flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Check-in"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
                <Input
                  label="Check-out"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted">
                We fetch a quote automatically when both dates are set. You can still
                refresh it with the button below.
              </p>
              <Button
                type="button"
                variant="secondary"
                disabled={!checkIn || !checkOut}
                onClick={() => void fetchQuote()}
              >
                Refresh quote
              </Button>
              {quote ? (
                <div className="rounded-sm border border-accent/25 bg-accent-muted/30 px-4 py-3 text-sm">
                  <p>
                    <span className="font-semibold text-foreground">{quote.nights}</span>{" "}
                    night(s) × ${quote.pricePerNight} ={" "}
                    <span className="font-semibold text-accent">${quote.totalPrice}</span>{" "}
                    total
                  </p>
                </div>
              ) : null}
              {bookingError ? (
                <p className="text-sm text-danger">{bookingError}</p>
              ) : null}
              <Button
                type="button"
                disabled={
                  booking || !checkIn || !checkOut || !token
                }
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
