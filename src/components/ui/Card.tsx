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
      className={`rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-xl transition-all duration-300 ${
        hover ? "hover:-translate-y-1 hover:shadow-2xl hover:border-gold-400/30" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
