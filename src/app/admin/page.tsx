"use client";

import { RequireAuth } from "@/components/require-auth";
import { Badge, Button, Card, EmptyState, Input, Spinner } from "@/components/ui";
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
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Admin dashboard
        </h1>
        {error ? (
          <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
        ) : null}

        {!dash ? (
          <div className="mt-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <p className="text-sm text-zinc-500">Total bookings</p>
                <p className="mt-1 text-2xl font-semibold">{dash.totalBookings}</p>
              </Card>
              <Card>
                <p className="text-sm text-zinc-500">Total revenue</p>
                <p className="mt-1 text-2xl font-semibold">${dash.totalRevenue}</p>
              </Card>
              <Card>
                <p className="text-sm text-zinc-500">Active stays</p>
                <p className="mt-1 text-2xl font-semibold">
                  {dash.activeBookings.length}
                </p>
              </Card>
              <Card>
                <p className="text-sm text-zinc-500">Pending requests</p>
                <p className="mt-1 text-2xl font-semibold">
                  {dash.pendingServiceRequests.length}
                </p>
              </Card>
            </div>

            <div className="mt-12 grid gap-10 lg:grid-cols-2">
              <section>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
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
                        <Card>
                          <p className="font-medium">
                            {b.room?.name} · {b.user?.email ?? "Guest"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500 font-mono">{b.id}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {!b.checkedInAt ? (
                              <Button
                                className="!text-xs !py-1.5"
                                onClick={() => void checkIn(b.id)}
                              >
                                Check in
                              </Button>
                            ) : !b.checkedOutAt ? (
                              <Button
                                variant="secondary"
                                className="!text-xs !py-1.5"
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
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Add room
                </h2>
                <Card className="mt-4">
                  <form onSubmit={createRoom} className="flex flex-col gap-3">
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

            <section className="mt-12">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Pending service requests
              </h2>
              {dash.pendingServiceRequests.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">None right now.</p>
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

            <section className="mt-12">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                All service requests
              </h2>
              {allRequests === null ? (
                <Spinner className="mt-8" />
              ) : allRequests.length === 0 ? (
                <div className="mt-4">
                  <EmptyState title="No requests" />
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                      <tr>
                        <th className="px-3 py-2">Guest</th>
                        <th className="px-3 py-2">Room</th>
                        <th className="px-3 py-2">Message</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allRequests.map((sr) => (
                        <tr
                          key={sr.id}
                          className="border-t border-zinc-100 dark:border-zinc-800"
                        >
                          <td className="px-3 py-2">{sr.user?.email ?? "—"}</td>
                          <td className="px-3 py-2">{sr.room?.name}</td>
                          <td className="max-w-xs truncate px-3 py-2">{sr.message}</td>
                          <td className="px-3 py-2">
                            <Badge>{sr.status}</Badge>
                          </td>
                          <td className="px-3 py-2">
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
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
    <Card>
      <p className="text-sm font-medium">{sr.user?.email}</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{sr.room?.name}</p>
      <p className="mt-2 text-sm">{sr.message}</p>
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
