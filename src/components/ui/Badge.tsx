import type { ReactNode } from "react";

const tones: Record<string, string> = {
  default: "bg-white/10 text-white",
  accent: "bg-gold-400/20 text-gold-400",
  secondary: "bg-white/5 text-white/70",
  warn: "bg-amber-500/20 text-amber-400",
  surge: "bg-gold-400/15 text-gold-400",
};

export function Badge({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
