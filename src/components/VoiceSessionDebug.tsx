"use client";

import { ParticipantAgentAttributes } from "@livekit/components-core";
import {
  useLocalParticipant,
  useTranscriptions,
  useVoiceAssistant,
} from "@livekit/components-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LogLine = { id: string; time: string; kind: string; text: string };

function nowTime() {
  return new Date().toISOString().slice(11, 23);
}

let logSeq = 0;
function nextId() {
  logSeq += 1;
  return `${Date.now()}-${logSeq}`;
}

/**
 * In-room diagnostics: agent state, mic, STT text streams (you), agent track transcription, event log.
 * Must render inside <LiveKitRoom>.
 */
export function VoiceSessionDebug() {
  const { localParticipant, isMicrophoneEnabled, lastMicrophoneError } =
    useLocalParticipant();
  const guestIdentity = localParticipant.identity;

  const { agent, state: agentState, agentTranscriptions } = useVoiceAssistant();

  const allStreams = useTranscriptions();

  /** User STT captions are often published by the *agent* with lk.publish_on_behalf = guest (not guest packet identity). */
  const userStreams = useMemo(() => {
    if (!guestIdentity) return [];
    const behalf = ParticipantAgentAttributes.PublishOnBehalf;
    return allStreams.filter(
      (s: (typeof allStreams)[number]) =>
        s.participantInfo.identity === guestIdentity ||
        s.streamInfo.attributes?.[behalf] === guestIdentity,
    );
  }, [allStreams, guestIdentity]);

  /** Agent-originated streams minus user captions forwarded on behalf of the guest. */
  const agentStreams = useMemo(() => {
    if (!agent?.identity) return [];
    const behalf = ParticipantAgentAttributes.PublishOnBehalf;
    return allStreams.filter((s: (typeof allStreams)[number]) => {
      if (s.participantInfo.identity !== agent.identity) return false;
      return s.streamInfo.attributes?.[behalf] !== guestIdentity;
    });
  }, [allStreams, agent, guestIdentity]);

  const userStreamText = useMemo(
    () =>
      userStreams
        .map((s: (typeof userStreams)[number]) => s.text.trim())
        .filter(Boolean)
        .join("\n---\n"),
    [userStreams],
  );

  const agentStreamText = useMemo(
    () =>
      agentStreams
        .map((s: (typeof agentStreams)[number]) => s.text.trim())
        .filter(Boolean)
        .join("\n---\n"),
    [agentStreams],
  );

  const trackTranscriptionText = useMemo(
    () =>
      agentTranscriptions
        .map((s: (typeof agentTranscriptions)[number]) => s.text)
        .join(""),
    [agentTranscriptions],
  );

  const [logLines, setLogLines] = useState<LogLine[]>([]);
  const pushLog = useCallback((kind: string, text: string) => {
    const t = text.trim();
    if (!t) return;
    setLogLines((prev) => {
      const row: LogLine = {
        id: nextId(),
        time: nowTime(),
        kind,
        text: t.slice(0, 4000),
      };
      return [...prev, row].slice(-100);
    });
  }, []);

  const lastAgentState = useRef<string>("");
  useEffect(() => {
    const s = String(agentState);
    if (s === lastAgentState.current) return;
    lastAgentState.current = s;
    const t = window.setTimeout(() => pushLog("agent_state", s), 0);
    return () => window.clearTimeout(t);
  }, [agentState, pushLog]);

  const lastUserStream = useRef("");
  useEffect(() => {
    if (!userStreamText || userStreamText === lastUserStream.current) return;
    lastUserStream.current = userStreamText;
    const t = window.setTimeout(
      () => pushLog("you (room STT stream)", userStreamText),
      0,
    );
    return () => window.clearTimeout(t);
  }, [userStreamText, pushLog]);

  const lastAgentStream = useRef("");
  useEffect(() => {
    if (!agentStreamText || agentStreamText === lastAgentStream.current) return;
    lastAgentStream.current = agentStreamText;
    const t = window.setTimeout(
      () => pushLog("agent (room STT stream)", agentStreamText),
      0,
    );
    return () => window.clearTimeout(t);
  }, [agentStreamText, pushLog]);

  const lastTrackTx = useRef("");
  useEffect(() => {
    if (
      !trackTranscriptionText ||
      trackTranscriptionText === lastTrackTx.current
    ) {
      return;
    }
    lastTrackTx.current = trackTranscriptionText;
    const t = window.setTimeout(
      () => pushLog("agent (mic track transcription)", trackTranscriptionText),
      0,
    );
    return () => window.clearTimeout(t);
  }, [trackTranscriptionText, pushLog]);

  const clearLog = useCallback(() => setLogLines([]), []);

  const micProblem =
    lastMicrophoneError?.message ??
    (isMicrophoneEnabled === false ? "Microphone is off" : null);

  const pre =
    "max-h-32 overflow-auto whitespace-pre-wrap rounded-sm border border-border bg-white p-3 text-[11px] leading-relaxed text-foreground/90";

  return (
    <div className="mt-4 space-y-4 rounded-sm border border-border bg-accent-muted/30 p-4 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Voice debug</h2>
        <button
          type="button"
          onClick={clearLog}
          className="rounded-sm border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface-2"
        >
          Clear log
        </button>
      </div>

      <dl className="grid gap-2 text-xs text-foreground/90">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <dt className="font-medium text-muted">Agent state</dt>
          <dd className="font-mono text-foreground">{String(agentState)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <dt className="font-medium text-muted">Agent in room</dt>
          <dd className="font-mono text-foreground">
            {agent ? `${agent.identity}` : "(not joined yet)"}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <dt className="font-medium text-muted">Your mic</dt>
          <dd>
            {isMicrophoneEnabled ? (
              <span className="text-emerald-700">on</span>
            ) : (
              <span className="text-danger">off</span>
            )}
            {micProblem ? (
              <span className="ml-2 text-danger">— {micProblem}</span>
            ) : null}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <dt className="font-medium text-muted">Guest identity</dt>
          <dd className="break-all font-mono text-[11px] text-foreground">
            {guestIdentity}
          </dd>
        </div>
      </dl>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          You — STT (room text streams)
        </h3>
        <pre className={pre}>
          {userStreamText ||
            "(empty — if worker logs user_input_transcribed but this stays empty, expand “All transcription streams” and check sender vs lk.publish_on_behalf; if both empty, audio/STT is failing upstream)"}
        </pre>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Agent — TTS (track transcription)
        </h3>
        <pre className="max-h-28 overflow-auto whitespace-pre-wrap rounded-sm border border-border bg-white p-3 text-[11px] leading-relaxed text-foreground/90">
          {trackTranscriptionText ||
            "(empty until the agent publishes aligned transcription with audio)"}
        </pre>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Agent — room STT streams
        </h3>
        <pre className="max-h-24 overflow-auto whitespace-pre-wrap rounded-sm border border-border bg-white p-3 text-[11px] leading-relaxed text-foreground/90">
          {agentStreamText || "(empty)"}
        </pre>
      </div>

      <details className="rounded-sm border border-border bg-surface-2/80 p-3">
        <summary className="cursor-pointer text-xs font-semibold text-foreground">
          All transcription streams ({allStreams.length})
        </summary>
        <ul className="mt-2 max-h-40 space-y-2 overflow-auto text-[11px] text-muted">
          {allStreams.map((s: (typeof allStreams)[number], i: number) => {
            const behalf =
              s.streamInfo.attributes?.[
                ParticipantAgentAttributes.PublishOnBehalf
              ];
            return (
              <li
                key={`${s.participantInfo.identity}-${s.streamInfo.id}-${i}`}
                className="border-b border-border pb-2"
              >
                <div className="font-mono text-[10px] text-accent">
                  sender: {s.participantInfo.identity}
                  {behalf ? ` · on_behalf: ${behalf}` : ""}
                </div>
                <div className="whitespace-pre-wrap text-foreground/90">
                  {s.text || "—"}
                </div>
              </li>
            );
          })}
          {allStreams.length === 0 ? (
            <li className="text-muted">No streams yet.</li>
          ) : null}
        </ul>
      </details>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Event log (last 100)
        </h3>
        <div className="max-h-56 overflow-auto rounded-sm border border-border bg-surface-2/80 p-2 font-mono text-[10px] leading-snug">
          {logLines.length === 0 ? (
            <p className="text-muted">Changes to state and transcripts append here.</p>
          ) : (
            logLines.map((line) => (
              <div key={line.id} className="mb-2 border-b border-border pb-1">
                <span className="text-accent">{line.time}</span>{" "}
                <span className="text-violet-700">
                  [{line.kind}]
                </span>
                <pre className="mt-0.5 whitespace-pre-wrap text-foreground/90">
                  {line.text}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-muted">
        User speech captions are usually sent as text streams from the agent participant with
        attribute{" "}
        <code className="rounded-md bg-surface-2 px-1 py-0.5 font-mono text-[10px] text-foreground">
          lk.publish_on_behalf
        </code>{" "}
        set to your identity. Compare with the worker{" "}
        <code className="rounded-md bg-surface-2 px-1 py-0.5 font-mono text-[10px] text-foreground">
          user_input_transcribed
        </code>{" "}
        logs when STT runs.
      </p>
    </div>
  );
}
