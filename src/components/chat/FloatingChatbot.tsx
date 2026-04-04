"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";

type ChatMessage = { id: string; role: "assistant" | "user"; text: string };

const seedMessages: ChatMessage[] = [
  { id: "1", role: "assistant", text: "Hi — I’m NEXORA. Ask about pricing, occupancy, or guest workflows." },
];

export function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(seedMessages);

  function send() {
    const t = input.trim();
    if (!t) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: t }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "I’m a demo assistant. In production, this connects to your resort knowledge base and live APIs.",
        },
      ]);
    }, 500);
  }

  return (
    <>
      {!open ? (
        <motion.button
          type="button"
          aria-label="Open AI assistant"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[var(--shadow-glow)] transition hover:scale-105 md:bottom-8 md:right-8"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <MessageCircle className="h-7 w-7" />
        </motion.button>
      ) : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-6 z-[60] flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] md:bottom-28 md:right-8"
            role="dialog"
            aria-label="NEXORA assistant"
          >
            <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-white">
              <div>
                <p className="text-sm font-bold">NEXORA Assistant</p>
                <p className="text-[10px] text-white/70">AI Hospitality Intelligence</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-72 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-accent text-white"
                        : "bg-slate-100 text-primary"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask NEXORA…"
                className="min-w-0 flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none ring-accent/30 focus:ring-2"
              />
              <button
                type="button"
                onClick={send}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary hover:brightness-95"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
