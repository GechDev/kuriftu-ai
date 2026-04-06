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
import { StaffSubnav } from "@/components/admin/StaffSubnav";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bed, DollarSign, Users, Clock, Plus } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-b from-black via-[#0a1210] to-[#0a1210] pb-20">
        <div className="relative z-20 mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <StaffSubnav segment="Operations" variant="onDark" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageHeader
            eyebrow="Staff"
            title="Admin dashboard"
            description="Revenue, active stays, room inventory, and the full service queue."
            className="text-white"
          />
          {error && (
            <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
              {error}
            </div>
          )}

          {!dash ? (
            <div className="mt-16 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: Bed, label: "Total bookings", value: dash.totalBookings },
                  { icon: DollarSign, label: "Total revenue", value: `$${dash.totalRevenue}` },
                  { icon: Users, label: "Active stays", value: dash.activeBookings.length },
                  { icon: Clock, label: "Pending requests", value: dash.pendingServiceRequests.length },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl p-5 before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-gold-400 before:to-amber-600 before:content-['']">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                            {stat.label}
                          </p>
                          <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                            {stat.value}
                          </p>
                        </div>
                        <stat.icon className="h-8 w-8 text-gold-400/50" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="mt-14 grid gap-10 lg:grid-cols-2">
                {/* Active Bookings Section */}
                <section>
                  <h2 className="text-lg font-semibold text-white">Active bookings</h2>
                  {dash.activeBookings.length === 0 ? (
                    <div className="mt-4">
                      <EmptyState title="No active stays" />
                    </div>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {dash.activeBookings.map((b, idx) => (
                        <motion.li
                          key={b.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-white">
                                  {b.room?.name} · {b.user?.email ?? "Guest"}
                                </p>
                                <p className="mt-1 font-mono text-xs text-white/50">
                                  {b.id}
                                </p>
                              </div>
                              {!b.checkedInAt && !b.checkedOutAt && (
                                <Badge variant="muted" className="bg-gold-400/20 text-gold-400">
                                  Pending
                                </Badge>
                              )}
                              {b.checkedInAt && !b.checkedOutAt && (
                                <Badge variant="secondary" className="bg-gold-400/20 text-gold-400">
                                  In house
                                </Badge>
                              )}
                              {b.checkedOutAt && (
                                <Badge variant="muted" className="bg-white/10 text-white/50">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {!b.checkedInAt ? (
                                <Button
                                  className="!px-3 !py-1.5 !text-xs border-white/20 text-white hover:border-gold-400 hover:text-gold-400"
                                  variant="outline"
                                  onClick={() => void checkIn(b.id)}
                                >
                                  Check in
                                </Button>
                              ) : !b.checkedOutAt ? (
                                <Button
                                  variant="secondary"
                                  className="!px-3 !py-1.5 !text-xs border-white/20 text-white hover:border-gold-400 hover:text-gold-400"
                                  onClick={() => void checkOut(b.id)}
                                >
                                  Check out
                                </Button>
                              ) : null}
                            </div>
                          </Card>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Add Room Section */}
                <section>
                  <h2 className="text-lg font-semibold text-white">Add room</h2>
                  <Card className="mt-4 border-white/10 bg-black/40 backdrop-blur-xl">
                    <form onSubmit={createRoom} className="flex flex-col gap-4 p-5">
                      <Input
                        label="Name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        required
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                      />
                      <Input
                        label="Price / night (whole number)"
                        type="number"
                        min={1}
                        value={roomPrice}
                        onChange={(e) => setRoomPrice(e.target.value)}
                        required
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                      />
                      <Input
                        label="Description (optional)"
                        value={roomDesc}
                        onChange={(e) => setRoomDesc(e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                      />
                      <Button
                        type="submit"
                        disabled={creating}
                        className="bg-gold-400/20 text-gold-400 hover:bg-gold-400/30 border border-gold-400/30"
                      >
                        {creating ? (
                          <>
                            <Spinner className="mr-2 h-3 w-3" />
                            Creating…
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-3 w-3" />
                            Create room
                          </>
                        )}
                      </Button>
                    </form>
                  </Card>
                </section>
              </div>

              {/* Pending Service Requests */}
              <section className="mt-14">
                <h2 className="text-lg font-semibold text-white">Pending service requests</h2>
                {dash.pendingServiceRequests.length === 0 ? (
                  <p className="mt-4 text-sm text-white/60">None right now.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {dash.pendingServiceRequests.map((sr, idx) => (
                      <motion.li
                        key={sr.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <AdminRequestRow
                          sr={sr}
                          onStatus={(s) => void setStatus(sr.id, s)}
                        />
                      </motion.li>
                    ))}
                  </ul>
                )}
              </section>

              {/* All Service Requests Table */}
              <section className="mt-14">
                <h2 className="text-lg font-semibold text-white">All service requests</h2>
                {allRequests === null ? (
                  <Spinner className="mt-8" />
                ) : allRequests.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState title="No requests" />
                  </div>
                ) : (
                  <TableWrap>
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="sticky top-0 border-b border-white/10 bg-black/80 backdrop-blur-sm">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gold-400">Guest</th>
                          <th className="px-4 py-3 font-semibold text-gold-400">Room</th>
                          <th className="px-4 py-3 font-semibold text-gold-400">Message</th>
                          <th className="px-4 py-3 font-semibold text-gold-400">Status</th>
                          <th className="px-4 py-3 font-semibold text-gold-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allRequests.map((sr) => (
                          <tr
                            key={sr.id}
                            className="border-t border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-white/80">{sr.user?.email ?? "—"}</td>
                            <td className="px-4 py-3 text-white/80">{sr.room?.name}</td>
                            <td className="max-w-xs truncate px-4 py-3 text-white/60">
                              {sr.message}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="muted" className="bg-white/10 text-white/60">
                                {sr.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {(["PENDING", "IN_PROGRESS", "COMPLETED"] as const).map(
                                  (s) => (
                                    <Button
                                      key={s}
                                      variant={sr.status === s ? "primary" : "ghost"}
                                      className={`!px-2 !py-1 !text-xs ${
                                        sr.status === s
                                          ? "bg-gold-400/20 text-gold-400"
                                          : "text-white/60 hover:text-white"
                                      }`}
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
    <Card className="border-white/10 bg-black/40 backdrop-blur-xl p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">{sr.user?.email}</p>
          <p className="text-sm text-white/60">{sr.room?.name}</p>
        </div>
        <Badge variant="muted" className="bg-gold-400/20 text-gold-400">
          {sr.status}
        </Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/80">{sr.message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="!text-xs border-white/20 text-white hover:border-gold-400 hover:text-gold-400"
          onClick={() => onStatus("IN_PROGRESS")}
        >
          In progress
        </Button>
        <Button
          className="!text-xs bg-gold-400/20 text-gold-400 hover:bg-gold-400/30 border border-gold-400/30"
          onClick={() => onStatus("COMPLETED")}
        >
          Complete
        </Button>
      </div>
    </Card>
  );
}