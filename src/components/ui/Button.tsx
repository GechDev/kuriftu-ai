import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "light";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-gold-400 to-amber-500 text-black shadow-sm hover:from-gold-500 hover:to-amber-600 border border-transparent active:scale-[0.99]",
  secondary:
    "bg-black/30 text-white font-semibold hover:bg-black/50 border border-white/20 active:scale-[0.99]",
  ghost: "bg-white/10 text-white border border-white/25 hover:bg-white/14 backdrop-blur-md",
  outline:
    "bg-black/40 text-white border border-white/20 hover:border-gold-400/50 hover:text-gold-400 hover:bg-black/60",
  light:
    "bg-white/95 text-black shadow-sm hover:bg-white border border-white/40 active:scale-[0.99]",
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
