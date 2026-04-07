"use client";

import {
  ConnectionState,
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { VoiceAssistantControlBar } from "@livekit/components-react/prefabs";
import { IconMic } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { useCallback, useState } from "react";

import { VoiceSessionDebug } from "@/components/VoiceSessionDebug";
import { VoiceAgentIdleAura, VoiceAgentLiveStage } from "@/components/voice-agent-sound-stage";
import { Alert, Button } from "@/components/ui";

export function VoiceConcierge() {
  const { token: bookingJwt } = useAuth();
  const [token, setToken] = useState<string | undefined>();
  const [serverUrl, setServerUrl] = useState<string | undefined>();
  const [roomName, setRoomName] = useState<string | undefined>();
  const [linkedAccount, setLinkedAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const tokenEndpoint =
    process.env.NEXT_PUBLIC_VOICE_TOKEN_ENDPOINT?.trim() || "/api/livekit/token";

  const connect = useCallback(async () => {
    // Prevent multiple connections and reconnection loops
    if (loading || token || isConnected) {
      return;
    }
    
    setError(null);
    setLoading(true);
    setToken(undefined);
    setServerUrl(undefined);
    setRoomName(undefined);
    setLinkedAccount(false);
    setIsConnected(false); // Reset connection state
    try {
      const res = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingToken: bookingJwt ?? undefined,
        }),
      });
      const data = (await res.json()) as {
        token?: string;
        serverUrl?: string;
        roomName?: string;
        linkedAccount?: boolean;
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
      setLinkedAccount(Boolean(data.linkedAccount));
      setIsConnected(true); // Set connection state to true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [bookingJwt, isConnected, loading, token, tokenEndpoint]);

  const disconnect = useCallback(() => {
    setToken(undefined);
    setServerUrl(undefined);
    setRoomName(undefined);
    setError(null);
    setLoading(false);
    setIsConnected(false); // Reset connection state
  }, []);

  return (
    <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-accent/20 bg-white shadow-[var(--shadow-lift)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(19,78,74,0.05)_0%,transparent_50%)]" />

      <div className="relative flex flex-col gap-0">
        <div className="flex flex-col gap-4 border-b border-border px-6 pb-6 pt-8 sm:flex-row sm:items-start sm:gap-6 sm:px-10 sm:pb-8 sm:pt-10">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-accent text-accent-fg shadow-sm">
            <IconMic className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              Kuriftu voice host
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Talk to your concierge
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]">
              Ask about rooms, resorts, and guest services in natural speech. Allow the microphone
              when your browser prompts you—we handle the rest. Bookings and formal requests can
              still be completed here on the site.
            </p>
          </div>
        </div>

        <div className="px-6 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-8">
          {error ? (
            <div className="mb-6">
              <Alert>{error}</Alert>
            </div>
          ) : null}

          {!token ? (
            <div className="flex flex-col gap-8">
              <VoiceAgentIdleAura />
              <Button
                type="button"
                onClick={() => void connect()}
                disabled={loading}
                className="w-full py-4 text-base sm:py-5 sm:text-lg"
              >
                {loading ? "Connecting…" : "Start voice agent"}
              </Button>
            </div>
          ) : (
            <LiveKitRoom
              serverUrl={serverUrl}
              token={token}
              connect
              audio
              video={false}
              onDisconnected={() => disconnect()}
              onError={(err: Error) => setError(err.message)}
              className="flex flex-col gap-6"
            >
              {roomName ? (
                <p className="text-center text-xs text-muted sm:text-start">
                  Session{" "}
                  <span className="font-mono text-foreground/85">{roomName}</span>
                  {linkedAccount ? (
                    <span className="ml-2 font-medium text-accent">· Signed in as guest</span>
                  ) : (
                    <span className="ml-2">
                      · Sign in by voice if you need linked reservations
                    </span>
                  )}
                </p>
              ) : null}

              <VoiceAgentLiveStage />

              <RoomAudioRenderer />

              <div className="rounded-lg border border-border bg-surface-2/90 px-3 py-2 text-sm">
                <ConnectionState />
              </div>

              <div className="voice-control-bar-wrap rounded-xl border border-border bg-white px-2 py-3 shadow-sm">
                <VoiceAssistantControlBar controls={{ microphone: true, leave: true }} />
              </div>

              <VoiceSessionDebug />
            </LiveKitRoom>
          )}
        </div>
      </div>
    </div>
  );
}
