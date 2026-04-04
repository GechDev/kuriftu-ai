"use client";

import {
  ConnectionState,
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { VoiceAssistantControlBar } from "@livekit/components-react/prefabs";
import { useCallback, useState } from "react";

import { VoiceSessionDebug } from "@/components/VoiceSessionDebug";

export function VoiceConcierge() {
  const [token, setToken] = useState<string | undefined>();
  const [serverUrl, setServerUrl] = useState<string | undefined>();
  const [roomName, setRoomName] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    setError(null);
    setLoading(true);
    setToken(undefined);
    setServerUrl(undefined);
    setRoomName(undefined);
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await res.json()) as {
        token?: string;
        serverUrl?: string;
        roomName?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        setError(
          data.detail ?? data.error ?? `Request failed (${res.status})`
        );
        return;
      }
      if (!data.token || !data.serverUrl) {
        setError("Invalid token response");
        return;
      }
      setToken(data.token);
      setServerUrl(data.serverUrl);
      setRoomName(data.roomName);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setToken(undefined);
    setServerUrl(undefined);
    setRoomName(undefined);
    setError(null);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Voice concierge
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Voice helps you explore rooms, check availability, and hear price quotes. Reservations
          and account actions are done on the website. Run the LiveKit worker (
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">python -m kuriftu_agent.agent dev</code>
          ) and the booking API.
        </p>
      </div>

      {error ? (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {!token ? (
        <button
          type="button"
          onClick={() => void connect()}
          disabled={loading}
          className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading ? "Connecting…" : "Start voice session"}
        </button>
      ) : (
        <LiveKitRoom
          serverUrl={serverUrl}
          token={token}
          connect
          audio
          video={false}
          onDisconnected={() => disconnect()}
          onError={(err) => setError(err.message)}
          className="flex flex-col gap-4"
        >
          {roomName ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Room: <span className="font-mono">{roomName}</span>
            </p>
          ) : null}
          <ConnectionState />
          <RoomAudioRenderer />
          <VoiceAssistantControlBar controls={{ microphone: true, leave: true }} />
          <VoiceSessionDebug />
        </LiveKitRoom>
      )}
    </div>
  );
}
