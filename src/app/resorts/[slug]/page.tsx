"use client";

import { Badge, Card, PageHeader, SelectField, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import type { MapPlaceItem, Resort, ResortServiceItem } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ResortGuidePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [resort, setResort] = useState<Resort | null>(null);
  const [services, setServices] = useState<ResortServiceItem[]>([]);
  const [places, setPlaces] = useState<MapPlaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svcCat, setSvcCat] = useState("");
  const [mapCat, setMapCat] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ resort: r }, { services: sv }, { mapPlaces: mp }] = await Promise.all([
          api.resorts.get(slug),
          api.resorts.services(slug),
          api.resorts.mapPlaces(slug),
        ]);
        if (!cancelled) {
          setResort(r);
          setServices(sv);
          setPlaces(mp);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Failed to load resort");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const serviceCategories = useMemo(() => {
    const u = new Set(services.map((s) => s.category));
    return Array.from(u).sort();
  }, [services]);

  const mapCategories = useMemo(() => {
    const u = new Set(places.map((p) => p.category));
    return Array.from(u).sort();
  }, [places]);

  const filteredServices = useMemo(
    () => (svcCat ? services.filter((s) => s.category === svcCat) : services),
    [services, svcCat]
  );

  const filteredPlaces = useMemo(
    () => (mapCat ? places.filter((p) => p.category === mapCat) : places),
    [places, mapCat]
  );

  if (loading && !resort) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !resort) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <PageHeader title="Resort" description="This property could not be loaded." />
        <p className="mt-6 text-sm text-danger">{error ?? "Not found"}</p>
        <Link href="/resorts" className="mt-6 inline-block text-sm font-semibold text-accent">
          ← All resorts
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <Link
        href="/resorts"
        className="text-sm font-medium text-muted transition hover:text-accent"
      >
        ← Resorts
      </Link>

      <PageHeader
        className="mt-6"
        eyebrow={resort.region}
        title={resort.name}
        description={resort.shortDescription}
      />

      <p className="mt-4 text-sm text-muted">{resort.address}</p>

      {resort.fullDescription ? (
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">{resort.fullDescription}</p>
      ) : null}

      <section className="mt-14">
        <h2 className="text-lg font-semibold text-foreground">Property map (overview)</h2>
        <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-muted">
          {resort.mapOverview}
        </p>
        <p className="mt-4 text-xs text-muted/80">
          The same overview is available on the voice assistant—ask how the property is laid out.
        </p>
      </section>

      <section className="mt-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Services & experiences</h2>
          {serviceCategories.length > 0 ? (
            <SelectField
              label="Category"
              value={svcCat}
              onChange={(e) => setSvcCat(e.target.value)}
              className="w-full min-w-[12rem] sm:max-w-xs"
            >
              <option value="">All categories</option>
              {serviceCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
          ) : null}
        </div>
        {filteredServices.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No services listed for this filter.</p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {filteredServices.map((s) => (
              <li key={s.id}>
                <Card className="h-full p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{s.category}</Badge>
                    {s.hours ? (
                      <span className="text-xs text-muted">{s.hours}</span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                  {s.locationNote ? (
                    <p className="mt-3 text-xs text-muted">
                      <span className="font-medium text-foreground/80">Where: </span>
                      {s.locationNote}
                    </p>
                  ) : null}
                  {s.howToBook ? (
                    <p className="mt-2 text-xs text-muted">
                      <span className="font-medium text-foreground/80">How to book: </span>
                      {s.howToBook}
                    </p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-16 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Map & walking directions</h2>
          {mapCategories.length > 0 ? (
            <SelectField
              label="Place type"
              value={mapCat}
              onChange={(e) => setMapCat(e.target.value)}
              className="w-full min-w-[12rem] sm:max-w-xs"
            >
              <option value="">All types</option>
              {mapCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectField>
          ) : null}
        </div>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Directions are from the main lobby—use these with the voice concierge for “how do I get to…?”
        </p>
        {filteredPlaces.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No places for this filter.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {filteredPlaces.map((p) => (
              <li key={p.id}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <Badge variant="muted">{p.category}</Badge>
                  </div>
                  {(p.building || p.floor) && (
                    <p className="mt-2 text-xs text-muted">
                      {[p.building, p.floor].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    <span className="font-medium text-foreground/90">From lobby: </span>
                    {p.directionsFromLobby}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
