"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type StaffSubnavProps = {
  segment: string;
  /** Breadcrumb on dark hero (light text). Default is for light backgrounds. */
  variant?: "default" | "onDark";
};

export function StaffSubnav({ segment, variant = "default" }: StaffSubnavProps) {
  const onDark = variant === "onDark";

  return (
    <nav
      className={`flex flex-wrap items-center gap-2 text-[13px] tracking-tight ${onDark ? "text-white/55" : "text-muted"}`}
      aria-label="Breadcrumb"
    >
      <Link
        href="/admin"
        className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition ${
          onDark
            ? "bg-white/10 text-white/95 ring-1 ring-white/15 backdrop-blur-md hover:bg-white/15"
            : "bg-foreground/[0.04] text-foreground ring-1 ring-border/80 hover:bg-foreground/[0.06]"
        }`}
      >
        <ChevronLeft
          className={`h-3.5 w-3.5 transition group-hover:-translate-x-0.5 ${onDark ? "text-white/80" : ""}`}
          aria-hidden
        />
        Control Center
      </Link>
      <span className={onDark ? "text-white/35" : "text-border"} aria-hidden>
        /
      </span>
      <span className={`font-medium ${onDark ? "text-white/90" : "text-foreground"}`}>{segment}</span>
    </nav>
  );
}
