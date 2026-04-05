"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  ChevronRight,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const modules = [
  {
    href: "/admin/revenue",
    title: "Revenue intelligence",
    description:
      "Occupancy, demand curves, and room-rate guidance — the same signals you use for BAR and packages.",
    icon: BarChart3,
    accent: "from-violet-500/15 to-fuchsia-500/10",
    iconBg: "bg-violet-500/12 text-violet-700",
  },
  {
    href: "/admin/rates",
    title: "Experience pricing",
    description:
      "AI-suggested guest rates for spa, dining, and on-property experiences. Confirm to update the public catalog.",
    icon: Wallet,
    accent: "from-emerald-500/15 to-teal-500/10",
    iconBg: "bg-emerald-500/12 text-emerald-800",
  },
  {
    href: "/admin/operations",
    title: "Operations",
    description:
      "Bookings, revenue totals, rooms, and the guest service queue — day-to-day property control.",
    icon: Building2,
    accent: "from-amber-500/12 to-orange-500/8",
    iconBg: "bg-amber-500/12 text-amber-900",
    adminOnly: true,
  },
];

export default function AdminHubPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAdmin = Boolean(user?.isAdmin);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_45%,#f5f5f7_100%)]">
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <header className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
            Staff
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-[2.75rem] sm:leading-[1.08]">
            Control Center
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-[17px]">
            One calm place for pricing intelligence and property operations. Pick a workspace —
            everything is designed for quick decisions and clear outcomes.
          </p>
        </header>

        <div className="mt-14 grid gap-4 sm:grid-cols-1">
          {modules
            .filter((m) => !m.adminOnly || isAdmin)
            .map((mod, i) => {
              const Icon = mod.icon;
              const active = pathname === mod.href || pathname.startsWith(mod.href + "/");
              return (
                <motion.div
                  key={mod.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                >
                  <Link
                    href={mod.href}
                    className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 sm:flex-row sm:items-stretch ${
                      active
                        ? "border-foreground/15 bg-white shadow-[0_2px_40px_-12px_rgba(0,0,0,0.12)]"
                        : "border-border/80 bg-white/70 shadow-sm hover:border-foreground/10 hover:bg-white hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.1)]"
                    }`}
                  >
                    <div
                      className={`relative flex min-h-[140px] flex-1 flex-col justify-between bg-gradient-to-br p-7 sm:min-h-[160px] sm:p-8 ${mod.accent}`}
                    >
                      <span
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${mod.iconBg}`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                      </span>
                      <div className="mt-6">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-[1.35rem]">
                          {mod.title}
                        </h2>
                        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/60 bg-white/50 px-7 py-4 sm:w-44 sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:px-5">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted">
                        Open
                      </span>
                      <span className="mt-2 flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white text-foreground transition group-hover:border-foreground/20 group-hover:bg-foreground group-hover:text-white">
                        <ChevronRight
                          className="h-5 w-5 -translate-x-px transition group-hover:translate-x-0"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
        </div>

        <div className="mt-12 rounded-3xl border border-border/60 bg-white/80 px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            <Sparkles className="h-4 w-4 text-foreground/40" aria-hidden />
            <span>
              Signed in as <span className="font-medium text-foreground">{user?.email}</span>
              {isAdmin ? (
                <span className="ml-2 rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/80">
                  Administrator
                </span>
              ) : (
                <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                  Manager
                </span>
              )}
            </span>
            <Link
              href="/pricing"
              className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 transition hover:underline"
            >
              View public catalog
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
