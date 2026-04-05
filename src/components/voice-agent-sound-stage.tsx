"use client";

import {
  BarVisualizer,
  type AgentState,
  useLocalParticipant,
  useTrackVolume,
  useVoiceAssistant,
} from "@livekit/components-react";
import type { LocalAudioTrack } from "livekit-client";
import { Track } from "livekit-client";

function cn(...parts: (string | undefined | false)[]) {
  return parts.filter(Boolean).join(" ");
}

function agentStateLabel(state: AgentState): string {
  switch (state) {
    case "listening":
      return "Listening";
    case "thinking":
      return "Thinking";
    case "speaking":
      return "Speaking";
    case "initializing":
      return "Preparing";
    case "connecting":
      return "Connecting";
    case "idle":
      return "Ready";
    case "disconnected":
      return "Disconnected";
    case "pre-connect-buffering":
      return "Buffering";
    case "failed":
      return "Connection issue";
    default:
      return "Host active";
  }
}

/** Pre-session: ambient “listening” motion — no LiveKit required. */
export function VoiceAgentIdleAura({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const bars = compact ? 28 : 40;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-end overflow-hidden rounded-2xl border border-accent/15 bg-[linear-gradient(165deg,rgba(19,78,74,0.07)_0%,rgba(250,250,249,0.9)_42%,#fff_100%)]",
        compact ? "min-h-[160px] py-6" : "min-h-[240px] py-10 sm:min-h-[300px] sm:py-12",
        className
      )}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="voice-idle-ripple voice-idle-ripple--1 absolute left-1/2 top-[38%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20 sm:h-64 sm:w-64" />
        <div className="voice-idle-ripple voice-idle-ripple--2 absolute left-1/2 top-[38%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-500/15 sm:h-64 sm:w-64" />
        <div className="voice-idle-ripple voice-idle-ripple--3 absolute left-1/2 top-[38%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/10 sm:h-64 sm:w-64" />
      </div>

      <div className="relative z-[1] flex flex-col items-center">
        <div
          className={cn(
            "voice-idle-core rounded-full bg-[radial-gradient(circle_at_30%_25%,#5eead4_0%,#134e4a_45%,#0f3d3a_100%)] shadow-[0_0_60px_rgba(19,78,74,0.35),0_20px_50px_rgba(19,78,74,0.2)]",
            compact ? "h-16 w-16" : "h-24 w-24 sm:h-28 sm:w-28"
          )}
        />
        <p
          className={cn(
            "mt-4 text-center font-medium text-muted",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {compact ? "Tap below to speak with your host" : "Your host is ready when you are"}
        </p>
      </div>

      <div
        className={cn(
          "relative z-[1] mt-6 flex w-full max-w-md items-end justify-center gap-1 px-4 sm:max-w-xl sm:gap-1.5",
          compact && "mt-4 max-w-sm sm:max-w-md"
        )}
      >
        {Array.from({ length: bars }, (_, i) => (
          <span
            key={i}
            className="voice-idle-bar w-1 shrink-0 rounded-full bg-accent/35 sm:w-1.5"
            style={{ "--voice-bar-i": String(i) } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

function UserMicPulse() {
  const { isMicrophoneEnabled, microphoneTrack } = useLocalParticipant();
  const raw = microphoneTrack?.track;
  const mic =
    raw && raw.kind === Track.Kind.Audio ? (raw as LocalAudioTrack) : undefined;
  const vol = useTrackVolume(mic);

  if (!isMicrophoneEnabled) {
    return (
      <p className="text-center text-xs text-muted">Microphone is off — use the bar below to enable</p>
    );
  }

  const scale = 1 + Math.min(1.2, vol * 2.8);
  const glow = 12 + vol * 48;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Your voice</p>
      <div
        className="h-14 w-14 rounded-full bg-gradient-to-br from-accent/20 to-teal-400/30 ring-2 ring-accent/25 transition-transform duration-75"
        style={{
          transform: `scale(${scale})`,
          boxShadow: `0 0 ${glow}px rgba(45, 212, 191, 0.35)`,
        }}
      />
    </div>
  );
}

/** Inside <LiveKitRoom /> — agent spectrum + guest mic pulse. */
export function VoiceAgentLiveStage({ className }: { className?: string }) {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-accent/20 bg-[linear-gradient(180deg,rgba(19,78,74,0.06)_0%,#fafaf9_55%,#fff_100%)] shadow-inner shadow-black/[0.03]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(45,212,191,0.12),transparent)]" />

      <div className="relative px-4 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          Live audio
        </p>
        <p className="mt-1 text-center font-display text-xl text-foreground sm:text-2xl">
          {agentStateLabel(state)}
        </p>

        <div className="mx-auto mt-8 flex min-h-[200px] max-w-3xl items-end justify-center sm:min-h-[240px] lg:min-h-[280px]">
          <BarVisualizer
            state={state}
            track={audioTrack}
            barCount={32}
            options={{ minHeight: 6, maxHeight: 100 }}
            className="voice-bar-visualizer flex h-full w-full max-w-2xl items-end justify-center gap-1 sm:gap-1.5 lg:gap-2"
          >
            <div className="voice-bar-pill" />
          </BarVisualizer>
        </div>

        <div className="mt-8 flex justify-center border-t border-border/80 pt-6">
          <UserMicPulse />
        </div>
      </div>
    </div>
  );
}
