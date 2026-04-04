import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all duration-300 ${
        hover ? "hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
