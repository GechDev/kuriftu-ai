import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-md hover:shadow-lg hover:bg-[#5a52e6] border border-transparent",
  secondary:
    "bg-secondary text-primary font-semibold shadow-md hover:shadow-lg hover:brightness-95 border border-transparent",
  ghost: "bg-white/10 text-white border border-white/20 hover:bg-white/15 backdrop-blur-sm",
  outline:
    "bg-white text-primary border border-border hover:border-accent/40 hover:shadow-soft",
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
    "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98]";
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
