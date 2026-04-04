"use client";

import { RequireAuth } from "@/components/require-auth";
import { Badge, Button, Card, EmptyState, Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { api, ApiError } from "@/lib/api";
import type { Notification } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";

export default function NotificationsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const { notifications: n } = await api.notifications.list(token);
      setItems(n);
    } catch (e) {
      setItems([]);
      setError(e instanceof ApiError ? e.message : "Failed to load");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markOne(id: string) {
    if (!token) return;
    try {
      await api.notifications.markRead(token, id);
      await load();
    } catch {
      /* ignore */
    }
  }

  async function markAll() {
    if (!token) return;
    try {
      await api.notifications.readAll(token);
      await load();
    } catch {
      /* ignore */
    }
  }

  const unread = items?.filter((n) => !n.read).length ?? 0;

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Notifications
          </h1>
          {unread > 0 ? (
            <Button
              variant="secondary"
              className="!text-sm"
              onClick={() => void markAll()}
            >
              Mark all read
            </Button>
          ) : null}
        </div>

        {items === null ? (
          <div className="mt-12 flex justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="mt-8 text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No notifications"
              description="Booking confirmations and updates appear here."
            />
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {items.map((n) => (
              <li key={n.id}>
                <Card
                  className={
                    n.read ? "opacity-70" : "border-zinc-300 dark:border-zinc-600"
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {n.title}
                    </h2>
                    {!n.read ? <Badge variant="warning">New</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {n.body}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <time className="text-xs text-zinc-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </time>
                    {!n.read ? (
                      <Button
                        variant="ghost"
                        className="!px-2 !py-1 !text-xs"
                        onClick={() => void markOne(n.id)}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RequireAuth>
  );
}
