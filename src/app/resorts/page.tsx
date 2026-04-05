"use client";

import { Badge, Card, EmptyState, PageHeader, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { ResortListItem } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ResortsPage() {
  const [resorts, setResorts] = useState<ResortListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <PageHeader
        eyebrow="Destinations"
        title="Resorts & retreats"
        description="Explore each property—dining, spa, pools, and walking directions match what the voice concierge can answer."
      />

      <ul className="mt-12 grid gap-6 sm:grid-cols-2">
        {resorts.map((r, index) => (
          <li key={r.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.06}s` }}>
            <Link href={`/resorts/${r.slug}`} className="block h-full">
              <Card hover className="flex h-full flex-col p-6 lg:p-8">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                      {r.region}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                      {r.name}
                    </h2>
                  </div>
                  <Badge variant="muted">{r._count.rooms} rooms</Badge>
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
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
