import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "light";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary/90 border border-transparent active:scale-[0.99]",
  secondary:
    "bg-secondary/15 text-primary font-semibold hover:bg-secondary/22 border border-secondary/20 active:scale-[0.99]",
  ghost: "bg-white/10 text-white border border-white/25 hover:bg-white/14 backdrop-blur-md",
  outline:
    "bg-card text-primary border border-border hover:border-primary/20 hover:shadow-[var(--shadow-soft)]",
  light:
    "bg-white/95 text-primary shadow-sm hover:bg-white border border-white/40 active:scale-[0.99]",
};

export function Button({
  children,
  href,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300";
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick}>
      {children}
    </button>
  );
}
