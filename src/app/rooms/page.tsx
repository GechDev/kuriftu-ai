"use client";

import { Badge, Card, EmptyState, PageHeader, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { Room } from "@/lib/types";
import { resortImages } from "@/lib/resortImages";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const roomImages = [
    resortImages.penthouseSuite,
    resortImages.suite,
    resortImages.familySuite,
    resortImages.minimalSuite,
    resortImages.lakeVilla,
    resortImages.villa,
  ];

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
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PageHeader title="Rooms" description="We couldn’t load the catalog." />
        <div className="mt-8 rounded-sm border border-danger/25 bg-danger-muted px-5 py-4 text-sm text-danger">
          {error}
          <p className="mt-2 text-muted">
            Start the backend (see repo README). With the default proxy, Next forwards{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
              /api/backend
            </code>{" "}
            to{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
              BACKEND_INTERNAL_URL
            </code>{" "}
            (often{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
              http://127.0.0.1:4000
            </code>
            ).
          </p>
        </div>
      </div>
    );
  }

  if (rooms === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PageHeader
          title="Rooms"
          description="No listings yet—check back after an admin adds inventory."
        />
        <div className="mt-10">
          <EmptyState
            title="No rooms yet"
            description="An admin can add rooms from the admin dashboard."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-14">
      <section className="reveal relative min-h-[40vh] overflow-hidden">
        <Image
          src={resortImages.roomsHero}
          alt="Luxury suite interior hero"
          fill
          className="hero-zoom object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1128]/78 via-[#0a1128]/42 to-black/32" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_78%_15%,rgba(212,175,55,0.18),transparent_60%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <PageHeader
            eyebrow="Stays"
            title="Rooms & suites"
            description="Each card opens availability, calendar, and booking for that space."
            className="text-white [&_p]:text-white/85"
          />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">

      <ul className="mt-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, index) => (
          <li key={room.id} className="animate-fade-up reveal" style={{ animationDelay: `${index * 0.05}s` }}>
            <Link href={`/rooms/${room.id}`} className="block h-full">
              <Card hover className="tilt-card flex h-full flex-col overflow-hidden p-0">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={roomImages[index % roomImages.length]}
                    alt={room.name}
                    fill
                    className="card-zoom object-cover"
                    sizes="(max-width:1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" aria-hidden />
                  <div className="absolute right-4 top-4">
                    <span className="float-luxury rounded-full border border-white/25 bg-white/14 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                      AI recommended
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold tracking-tight text-white">
                        {room.name}
                      </h2>
                      {room.resort ? (
                        <p className="mt-1 truncate text-xs font-medium text-white/75">
                          {room.resort.name}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="accent" className="!bg-[#D4AF37] !text-[#1b1408]">
                      ${room.pricePerNight}/nt
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {room.description ? (
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted">
                      {room.description}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted">No description</p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                    View details
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}
