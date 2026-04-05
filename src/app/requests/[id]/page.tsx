"use client";

import { RequireAuth } from "@/components/require-auth";
import { Badge, Card, EmptyState, LinkButton, Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import {
  categoryLabel,
  formatCurrency,
  formatStayRange,
  nightsLabel,
  serviceStatusLabel,
} from "@/lib/guest-format";
import type { ServiceRequest } from "@/lib/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function statusVariant(
  s: ServiceRequest["status"]
): "default" | "success" | "warning" | "muted" {
  if (s === "COMPLETED") return "success";
  if (s === "IN_PROGRESS") return "warning";
  return "default";
}

export default function ServiceRequestDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [sr, setSr] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      return;
    }
    let c = false;
    void (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { serviceRequest } = await api.serviceRequests.get(token, id as string);
        if (!c) setSr(serviceRequest);
      } catch (e) {
        if (!c) {
          setSr(null);
          if (e instanceof ApiError && e.status === 404) setNotFound(true);
        }
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
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <Link
          href="/requests"
          className="text-sm font-medium text-muted transition hover:text-accent"
        >
          ← Service requests
        </Link>

        {loading ? (
          <div className="mt-20 flex justify-center">
            <Spinner />
          </div>
        ) : !sr ? (
          <div className="mt-10">
            <EmptyState
              title={notFound ? "Request not found" : "Could not load request"}
            />
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <div className="flex flex-col gap-4 border-b border-border/80 pb-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Request
                </p>
                <h1 className="mt-1 text-[1.5rem] font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                  {sr.room?.name ?? "Guest services"}
                </h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant={statusVariant(sr.status)}>
                    {serviceStatusLabel(sr.status)}
                  </Badge>
                  {sr.serviceCategory ? (
                    <Badge variant="muted">{categoryLabel(sr.serviceCategory)}</Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <Card className="space-y-4 p-6 sm:p-8">
              <h2 className="text-sm font-semibold text-foreground">Your message</h2>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                {sr.message}
              </p>
              <div className="border-t border-border/60 pt-4 text-sm text-muted">
                <p>
                  <span className="font-medium text-foreground/80">Submitted: </span>
                  {new Date(sr.createdAt).toLocaleString()}
                </p>
                {sr.updatedAt !== sr.createdAt ? (
                  <p className="mt-1">
                    <span className="font-medium text-foreground/80">Last updated: </span>
                    {new Date(sr.updatedAt).toLocaleString()}
                  </p>
                ) : null}
                <p className="mt-1 font-mono text-xs text-muted/90">ID {sr.id}</p>
              </div>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="p-6">
                <h2 className="text-sm font-semibold text-foreground">Room</h2>
                {sr.room ? (
                  <>
                    <p className="mt-2 font-medium text-foreground">{sr.room.name}</p>
                    {sr.room.description ? (
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {sr.room.description}
                      </p>
                    ) : null}
                    {sr.room.resort ? (
                      <p className="mt-3 text-sm">
                        <Link
                          href={`/resorts/${sr.room.resort.slug}`}
                          className="font-semibold text-accent hover:underline"
                        >
                          {sr.room.resort.name}
                        </Link>
                        {sr.room.resort.region ? ` · ${sr.room.resort.region}` : ""}
                      </p>
                    ) : null}
                    <LinkButton
                      href={`/rooms/${sr.roomId}`}
                      variant="secondary"
                      className="mt-4 inline-flex text-sm"
                    >
                      View room
                    </LinkButton>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted">Room details unavailable.</p>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-sm font-semibold text-foreground">Linked booking</h2>
                {sr.booking ? (
                  <>
                    <p className="mt-2 text-sm text-muted">
                      {formatStayRange(sr.booking.checkIn, sr.booking.checkOut)}
                    </p>
                    {sr.booking.staySummary ? (
                      <p className="mt-2 text-sm text-muted">
                        {nightsLabel(sr.booking.staySummary.nights)} ·{" "}
                        {formatCurrency(sr.booking.staySummary.totalPrice)} total
                      </p>
                    ) : null}
                    {sr.booking.room?.resort ? (
                      <p className="mt-2 text-sm">
                        <Link
                          href={`/resorts/${sr.booking.room.resort.slug}`}
                          className="text-accent hover:underline"
                        >
                          {sr.booking.room.resort.name}
                        </Link>
                      </p>
                    ) : null}
                    <LinkButton
                      href={`/bookings/${sr.booking.id}`}
                      variant="secondary"
                      className="mt-4 inline-flex text-sm"
                    >
                      Open booking
                    </LinkButton>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted">
                    This request was not tied to a reservation. You can still reference your
                    room above.
                  </p>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
