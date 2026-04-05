"use client";

import { VoiceAgentIdleAura } from "@/components/voice-agent-sound-stage";
import { LinkButton } from "@/components/ui";

export function VoiceHomePromo() {
  return (
    <div className="mx-auto mt-16 max-w-3xl sm:mt-20">
      <div className="rounded-2xl border border-accent/20 bg-white p-1 shadow-[var(--shadow-lift)]">
        <div className="rounded-xl bg-surface-2/30 px-4 pb-6 pt-5 sm:px-6 sm:pb-8 sm:pt-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Voice-first concierge
          </p>
          <h2 className="mt-3 text-center font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Start with a conversation
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-muted">
            Our voice agent knows the collection—rooms, resorts, and services—and responds in real
            time.
          </p>
          <div className="mt-6">
            <VoiceAgentIdleAura compact />
          </div>
          <div className="mt-6 flex justify-center">
            <LinkButton href="/voice" className="min-w-[200px] px-8 py-3.5 text-base">
              Open voice agent
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
