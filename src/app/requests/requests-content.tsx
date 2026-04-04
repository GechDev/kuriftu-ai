"use client";

import { RequireAuth } from "@/components/require-auth";
import { Badge, Button, Card, EmptyState, Spinner, TextArea } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import type { Room, ServiceRequest } from "@/lib/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function RequestsContent() {
  const { token } = useAuth();
  const search = useSearchParams();
  const preRoom = search.get("roomId") ?? "";
  const preBooking = search.get("bookingId") ?? "";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [list, setList] = useState<ServiceRequest[] | null>(null);
  const [roomId, setRoomId] = useState(preRoom);
  const [bookingId, setBookingId] = useState(preBooking);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [{ rooms: r }, { serviceRequests: s }] = await Promise.all([
        api.rooms.list(),
        api.serviceRequests.list(token),
      ]);
      setRooms(r);
      setList(s);
    } catch (e) {
      setList([]);
      setError(e instanceof ApiError ? e.message : "Failed to load");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setRoomId(preRoom);
    setBookingId(preBooking);
  }, [preRoom, preBooking]);

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

  return (
    <RequireAuth>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Service requests
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Ask housekeeping or front desk for extras. Track status here.
        </p>

        <Card className="mt-8">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            New request
          </h2>
          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Room
              </label>
              <select
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="">Select room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <InputBooking
              bookingId={bookingId}
              setBookingId={setBookingId}
            />
            <TextArea
              label="Message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Extra towels, late checkout request…"
            />
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Submit request"}
            </Button>
          </form>
        </Card>

        <h2 className="mt-12 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Your requests
        </h2>
        {list === null ? (
          <div className="mt-8 flex justify-center">
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No requests yet" />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((sr) => (
              <li key={sr.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {sr.room?.name ?? "Room"}
                    </p>
                    <Badge variant={statusVariant(sr.status)}>{sr.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {sr.message}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {new Date(sr.createdAt).toLocaleString()}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RequireAuth>
  );
}

function InputBooking({
  bookingId,
  setBookingId,
}: {
  bookingId: string;
  setBookingId: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Booking ID (optional)
      </label>
      <input
        value={bookingId}
        onChange={(e) => setBookingId(e.target.value)}
        className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-900"
        placeholder="Link to a specific stay"
      />
    </div>
  );
}
