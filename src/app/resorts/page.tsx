"use client";

import { Badge, Card, EmptyState, PageHeader, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { ResortListItem } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { resortImages } from "@/lib/resortImages";
import { useEffect, useState } from "react";

export default function ResortsPage() {
  const [resorts, setResorts] = useState<ResortListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resortCardImages = [
    resortImages.resortAerialLuxury,
    resortImages.resortGrounds,
    resortImages.resortSpaGarden,
    resortImages.lagoon,
    resortImages.sunsetDeck,
    resortImages.aerialLake,
  ];

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { resorts: r } = await api.resorts.list();
        if (!cancelled) setResorts(r);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Failed to load resorts");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PageHeader title="Resorts" description="We couldn’t load properties." />
        <div className="mt-8 rounded-sm border border-danger/25 bg-danger-muted px-5 py-4 text-sm text-danger">
          {error}
        </div>
      </div>
    );
  }

  if (resorts === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (resorts.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PageHeader title="Resorts" description="No properties in the catalog yet." />
        <div className="mt-10">
          <EmptyState title="No resorts" description="Seed the API or add resorts in the database." />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-14">
      <section className="reveal relative min-h-[40vh] overflow-hidden">
        <Image
          src={resortImages.resortsHero}
          alt="Luxury resort landscape hero"
          fill
          className="hero-zoom object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1128]/82 via-[#0a1128]/48 to-black/34" aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_95%_60%_at_85%_10%,rgba(212,175,55,0.17),transparent_58%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <PageHeader
            eyebrow="Destinations"
            title="Resorts & retreats"
            description="Explore each property—dining, spa, pools, and walking directions match what the voice concierge can answer."
            className="text-white [&_p]:text-white/85"
          />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">

      <ul className="mt-2 grid gap-6 sm:grid-cols-2">
        {resorts.map((r, index) => (
          <li key={r.id} className="animate-fade-up reveal" style={{ animationDelay: `${index * 0.06}s` }}>
            <Link href={`/resorts/${r.slug}`} className="block h-full">
              <Card hover className="tilt-card flex h-full flex-col overflow-hidden p-0">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={resortCardImages[index % resortCardImages.length]}
                    alt={r.name}
                    fill
                    className="card-zoom object-cover"
                    sizes="(max-width:1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/20 to-transparent" aria-hidden />
                  <div className="absolute left-5 top-5">
                    <span className="float-luxury rounded-full border border-white/25 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                      Signature retreat
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#f3d796]">
                        {r.region}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">{r.name}</h2>
                    </div>
                    <Badge variant="muted" className="!border-white/30 !bg-white/15 !text-white">
                      {r._count.rooms} rooms
                    </Badge>
                  </div>
                </div>
                <div className="flex h-full flex-col p-6 lg:p-8">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Destination profile</p>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{r.shortDescription}</p>
                <p className="mt-4 text-xs text-muted/90">{r.address}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge variant="default">{r._count.services} services</Badge>
                  <Badge variant="default">{r._count.mapPlaces} map points</Badge>
                </div>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  View guide
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
