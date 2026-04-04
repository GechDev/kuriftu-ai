"use client";

import { Badge, Card, EmptyState, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Room } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { rooms: r } = await api.rooms.list();
        if (!cancelled) setRooms(r);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Failed to load rooms");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-red-600">{error}</p>
        <p className="mt-2 text-sm text-zinc-500">
          Is the API running at{" "}
          {process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000"}?
        </p>
      </div>
    );
  }

  if (rooms === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <EmptyState
          title="No rooms yet"
          description="An admin can add rooms from the admin dashboard."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Rooms
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Select a room to see availability and book.
      </p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <li key={room.id}>
            <Link href={`/rooms/${room.id}`}>
              <Card className="h-full transition hover:border-zinc-400 dark:hover:border-zinc-600">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {room.name}
                  </h2>
                  <Badge>${room.pricePerNight}/night</Badge>
                </div>
                {room.description ? (
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {room.description}
                  </p>
                ) : null}
                <span className="mt-4 inline-block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  View details →
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
