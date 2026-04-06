"use client";

import { RequireAuth } from "@/components/require-auth";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Spinner,
} from "@/components/ui";
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
    queueMicrotask(() => {
      void load();
    });
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
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:py-14">
        <PageHeader
          eyebrow="Inbox"
          title="Notifications"
          description="Booking confirmations and stay updates land here."
          action={
            unread > 0 ? (
              <Button
                variant="secondary"
                className="shrink-0"
                onClick={() => void markAll()}
              >
                Mark all read
              </Button>
            ) : null
          }
        />

        {items === null ? (
          <div className="mt-16 flex justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p className="mt-10 text-sm text-danger">{error}</p>
        ) : items.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No notifications"
              description="Booking confirmations and updates appear here."
            />
          </div>
        ) : (
          <ul className="mt-10 space-y-4">
            {items.map((n) => (
              <li key={n.id} className="reveal">
                <Card
                  hover
                  className={
                    n.read
                      ? "opacity-75"
                      : "border-accent/30 shadow-md shadow-accent/5"
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="font-semibold text-foreground">{n.title}</h2>
                    {!n.read ? <Badge variant="accent" className="pulse-glow">New</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {n.body}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <time className="text-xs text-muted">
                      {new Date(n.createdAt).toLocaleString()}
                    </time>
                    {!n.read ? (
                      <Button
                        variant="ghost"
                        className="!px-3 !py-1.5 !text-xs"
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
