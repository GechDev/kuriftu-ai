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
      (s) =>
        s.participantInfo.identity === guestIdentity ||
        s.streamInfo.attributes?.[behalf] === guestIdentity,
    );
  }, [allStreams, guestIdentity]);

  /** Agent-originated streams minus user captions forwarded on behalf of the guest. */
  const agentStreams = useMemo(() => {
    if (!agent?.identity) return [];
    const behalf = ParticipantAgentAttributes.PublishOnBehalf;
    return allStreams.filter((s) => {
      if (s.participantInfo.identity !== agent.identity) return false;
      return s.streamInfo.attributes?.[behalf] !== guestIdentity;
    });
  }, [allStreams, agent?.identity, guestIdentity]);

  const userStreamText = useMemo(
    () =>
      userStreams
        .map((s) => s.text.trim())
        .filter(Boolean)
        .join("\n---\n"),
    [userStreams],
  );

  const agentStreamText = useMemo(
    () =>
      agentStreams
        .map((s) => s.text.trim())
        .filter(Boolean)
        .join("\n---\n"),
    [agentStreams],
  );

  const trackTranscriptionText = useMemo(
    () => agentTranscriptions.map((s) => s.text).join(""),
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

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-amber-200/80 bg-amber-50/90 p-4 text-left dark:border-amber-900/60 dark:bg-amber-950/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
          Voice debug
        </h2>
        <button
          type="button"
          onClick={clearLog}
          className="rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-zinc-900 dark:text-amber-100 dark:hover:bg-zinc-800"
        >
          Clear log
        </button>
      </div>

      <dl className="grid gap-2 text-xs text-amber-950 dark:text-amber-100/90">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <dt className="font-medium text-amber-800 dark:text-amber-200/90">
            Agent state
          </dt>
          <dd className="font-mono">{String(agentState)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <dt className="font-medium text-amber-800 dark:text-amber-200/90">
            Agent in room
          </dt>
          <dd className="font-mono">
            {agent ? `${agent.identity}` : "(not joined yet)"}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <dt className="font-medium text-amber-800 dark:text-amber-200/90">
            Your mic
          </dt>
          <dd>
            {isMicrophoneEnabled ? (
              <span className="text-emerald-700 dark:text-emerald-400">on</span>
            ) : (
              <span className="text-red-700 dark:text-red-400">off</span>
            )}
            {micProblem ? (
              <span className="ml-2 text-red-700 dark:text-red-300">
                — {micProblem}
              </span>
            ) : null}
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <dt className="font-medium text-amber-800 dark:text-amber-200/90">
            Guest identity
          </dt>
          <dd className="break-all font-mono text-[11px]">{guestIdentity}</dd>
        </div>
      </dl>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200/80">
          You — what STT received (room text streams)
        </h3>
        <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-lg border border-amber-200/80 bg-white/90 p-3 text-[11px] leading-relaxed text-zinc-800 dark:border-amber-900/50 dark:bg-zinc-950 dark:text-zinc-200">
          {userStreamText ||
            "(empty — if worker logs user_input_transcribed but this stays empty, expand “All transcription streams” and check sender vs lk.publish_on_behalf; if both empty, audio/STT is failing upstream)"}
        </pre>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200/80">
          Agent — TTS / spoken text (track transcription)
        </h3>
        <pre className="max-h-28 overflow-auto whitespace-pre-wrap rounded-lg border border-amber-200/80 bg-white/90 p-3 text-[11px] leading-relaxed text-zinc-800 dark:border-amber-900/50 dark:bg-zinc-950 dark:text-zinc-200">
          {trackTranscriptionText ||
            "(empty until the agent publishes aligned transcription with audio)"}
        </pre>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200/80">
          Agent — same via room STT streams (if any)
        </h3>
        <pre className="max-h-24 overflow-auto whitespace-pre-wrap rounded-lg border border-amber-200/80 bg-white/90 p-3 text-[11px] leading-relaxed text-zinc-800 dark:border-amber-900/50 dark:bg-zinc-950 dark:text-zinc-200">
          {agentStreamText || "(empty)"}
        </pre>
      </div>

      <details className="rounded-lg border border-amber-200/60 bg-white/60 p-2 dark:border-amber-900/40 dark:bg-zinc-950/40">
        <summary className="cursor-pointer text-xs font-medium text-amber-900 dark:text-amber-200/90">
          All transcription streams ({allStreams.length})
        </summary>
        <ul className="mt-2 max-h-40 space-y-2 overflow-auto text-[11px] text-zinc-700 dark:text-zinc-300">
          {allStreams.map((s, i) => {
            const behalf =
              s.streamInfo.attributes?.[
                ParticipantAgentAttributes.PublishOnBehalf
              ];
            return (
              <li
                key={`${s.participantInfo.identity}-${s.streamInfo.id}-${i}`}
                className="border-b border-amber-100/80 pb-2 dark:border-amber-900/30"
              >
                <div className="font-mono text-[10px] text-amber-800 dark:text-amber-300/80">
                  sender: {s.participantInfo.identity}
                  {behalf ? ` · on_behalf: ${behalf}` : ""}
                </div>
                <div className="whitespace-pre-wrap">{s.text || "—"}</div>
              </li>
            );
          })}
          {allStreams.length === 0 ? (
            <li className="text-zinc-500">No streams yet.</li>
          ) : null}
        </ul>
      </details>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-200/80">
          Event log (last 100)
        </h3>
        <div className="max-h-56 overflow-auto rounded-lg border border-amber-200/80 bg-black/5 p-2 font-mono text-[10px] leading-snug dark:border-amber-900/50 dark:bg-black/30">
          {logLines.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400">
              Changes to state and transcripts append here.
            </p>
          ) : (
            logLines.map((line) => (
              <div key={line.id} className="mb-2 border-b border-amber-200/40 pb-1 dark:border-amber-900/30">
                <span className="text-amber-700 dark:text-amber-400">
                  {line.time}
                </span>{" "}
                <span className="text-violet-700 dark:text-violet-300">
                  [{line.kind}]
                </span>
                <pre className="mt-0.5 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                  {line.text}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-[11px] leading-snug text-amber-900/80 dark:text-amber-200/70">
        User speech captions are usually sent as text streams from the agent participant with
        attribute{" "}
        <code className="rounded bg-amber-100/80 px-1 dark:bg-zinc-900">
          lk.publish_on_behalf
        </code>{" "}
        set to your identity — not from your own participant id. Compare with the worker:{" "}
        <code className="rounded bg-amber-100/80 px-1 dark:bg-zinc-900">
          user_input_transcribed
        </code>{" "}
        when STT runs. If the worker logs STT but this panel stays empty, the transcription topic is not
        reaching the client; if both are empty, fix audio or STT upstream.
      </p>
    </div>
  );
}
