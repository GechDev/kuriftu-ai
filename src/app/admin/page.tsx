"use client";

import { RequireAuth } from "@/components/require-auth";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Spinner,
  TableWrap,
} from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import type { Booking, ServiceRequest, ServiceRequestStatus } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

export default function AdminPage() {
  const { token } = useAuth();
  const [dash, setDash] = useState<{
    totalBookings: number;
    totalRevenue: number;
    activeBookings: Booking[];
    pendingServiceRequests: ServiceRequest[];
  } | null>(null);
  const [allRequests, setAllRequests] = useState<ServiceRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [roomPrice, setRoomPrice] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const [d, ar] = await Promise.all([
        api.admin.dashboard(token),
        api.admin.serviceRequests(token),
      ]);
      setDash(d);
      setAllRequests(ar.serviceRequests);
    } catch (e) {
      setDash(null);
      setAllRequests([]);
      setError(e instanceof ApiError ? e.message : "Failed to load admin data");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !roomName || !roomPrice) return;
    const price = parseInt(roomPrice, 10);
    if (Number.isNaN(price) || price < 1) return;
    setCreating(true);
    try {
      await api.admin.createRoom(token, {
        name: roomName,
        pricePerNight: price,
        description: roomDesc || undefined,
      });
      setRoomName("");
      setRoomPrice("");
      setRoomDesc("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Create room failed");
    } finally {
      setCreating(false);
    }
  }

  async function setStatus(id: string, status: ServiceRequestStatus) {
    if (!token) return;
    try {
      await api.admin.updateServiceStatus(token, id, status);
      await load();
    } catch {
      /* ignore */
    }
  }

  async function checkIn(id: string) {
    if (!token) return;
    try {
      await api.admin.checkIn(token, id);
      await load();
    } catch {
      /* ignore */
    }
  }

  async function checkOut(id: string) {
    if (!token) return;
    try {
      await api.admin.checkOut(token, id);
      await load();
    } catch {
      /* ignore */
    }
  }

  return (
    <RequireAuth adminOnly>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <PageHeader
          eyebrow="Staff"
          title="Admin dashboard"
          description="Revenue, active stays, room inventory, and the full service queue."
        />
        {error ? (
          <p className="mt-6 rounded-sm border border-danger/30 bg-danger-muted px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        {!dash ? (
          <div className="mt-16 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total bookings", value: dash.totalBookings },
                { label: "Total revenue", value: `$${dash.totalRevenue}` },
                { label: "Active stays", value: dash.activeBookings.length },
                {
                  label: "Pending requests",
                  value: dash.pendingServiceRequests.length,
                },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="relative overflow-hidden border-border/80 p-5"
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
                  <p className="relative text-xs font-semibold uppercase tracking-wider text-muted">
                    {stat.label}
                  </p>
                  <p className="relative mt-2 text-2xl font-semibold tabular-nums text-foreground">
                    {stat.value}
                  </p>
                </Card>
              ))}
            </div>

            <div className="mt-14 grid gap-10 lg:grid-cols-2">
              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  Active bookings
                </h2>
                {dash.activeBookings.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState title="No active stays" />
                  </div>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {dash.activeBookings.map((b) => (
                      <li key={b.id}>
                        <Card className="p-4">
                          <p className="font-semibold text-foreground">
                            {b.room?.name} · {b.user?.email ?? "Guest"}
                          </p>
                          <p className="mt-1 font-mono text-xs text-muted">
                            {b.id}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {!b.checkedInAt ? (
                              <Button
                                className="!px-3 !py-1.5 !text-xs"
                                onClick={() => void checkIn(b.id)}
                              >
                                Check in
                              </Button>
                            ) : !b.checkedOutAt ? (
                              <Button
                                variant="secondary"
                                className="!px-3 !py-1.5 !text-xs"
                                onClick={() => void checkOut(b.id)}
                              >
                                Check out
                              </Button>
                            ) : (
                              <Badge variant="muted">Completed</Badge>
                            )}
                          </div>
                        </Card>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">Add room</h2>
                <Card className="mt-4">
                  <form onSubmit={createRoom} className="flex flex-col gap-4">
                    <Input
                      label="Name"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      required
                    />
                    <Input
                      label="Price / night (whole number)"
                      type="number"
                      min={1}
                      value={roomPrice}
                      onChange={(e) => setRoomPrice(e.target.value)}
                      required
                    />
                    <Input
                      label="Description (optional)"
                      value={roomDesc}
                      onChange={(e) => setRoomDesc(e.target.value)}
                    />
                    <Button type="submit" disabled={creating}>
                      {creating ? "Creating…" : "Create room"}
                    </Button>
                  </form>
                </Card>
              </section>
            </div>

            <section className="mt-14">
              <h2 className="text-lg font-semibold text-foreground">
                Pending service requests
              </h2>
              {dash.pendingServiceRequests.length === 0 ? (
                <p className="mt-4 text-sm text-muted">None right now.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {dash.pendingServiceRequests.map((sr) => (
                    <li key={sr.id}>
                      <AdminRequestRow
                        sr={sr}
                        onStatus={(s) => void setStatus(sr.id, s)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-14">
              <h2 className="text-lg font-semibold text-foreground">
                All service requests
              </h2>
              {allRequests === null ? (
                <Spinner className="mt-8" />
              ) : allRequests.length === 0 ? (
                <div className="mt-4">
                  <EmptyState title="No requests" />
                </div>
              ) : (
                <TableWrap>
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border bg-surface-2/50">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Guest</th>
                        <th className="px-4 py-3 font-semibold">Room</th>
                        <th className="px-4 py-3 font-semibold">Message</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allRequests.map((sr) => (
                        <tr
                          key={sr.id}
                          className="border-t border-border/80 hover:bg-surface-2/20"
                        >
                          <td className="px-4 py-3">{sr.user?.email ?? "—"}</td>
                          <td className="px-4 py-3">{sr.room?.name}</td>
                          <td className="max-w-xs truncate px-4 py-3 text-muted">
                            {sr.message}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="muted">{sr.status}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {(["PENDING", "IN_PROGRESS", "COMPLETED"] as const).map(
                                (s) => (
                                  <Button
                                    key={s}
                                    variant={sr.status === s ? "primary" : "ghost"}
                                    className="!px-2 !py-1 !text-xs"
                                    onClick={() => void setStatus(sr.id, s)}
                                  >
                                    {s.slice(0, 4)}
                                  </Button>
                                ),
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              )}
            </section>
          </>
        )}
      </div>
    </RequireAuth>
  );
}

function AdminRequestRow({
  sr,
  onStatus,
}: {
  sr: ServiceRequest;
  onStatus: (s: ServiceRequestStatus) => void;
}) {
  return (
    <Card className="p-4">
      <p className="text-sm font-semibold text-foreground">{sr.user?.email}</p>
      <p className="text-sm text-muted">{sr.room?.name}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">
        {sr.message}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="!text-xs"
          onClick={() => onStatus("IN_PROGRESS")}
        >
          In progress
        </Button>
        <Button className="!text-xs" onClick={() => onStatus("COMPLETED")}>
          Complete
        </Button>
      </div>
    </Card>
  );
}
