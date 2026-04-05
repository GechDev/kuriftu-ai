"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Platform" },
  { href: "/intellirate", label: "IntelliRate" },
  { href: "/services", label: "Service Optimizer" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-border/70 bg-card/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-card/65"
    >
      <div className="mx-auto flex h-[3.65rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-white shadow-[var(--shadow-soft)]">
            <Sparkles className="h-[1.15rem] w-[1.15rem]" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold tracking-tight text-primary">Kuriftu NEXORA</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Resort intelligence</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted hover:bg-background hover:text-primary"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/#demo"
            className="hidden rounded-full border border-border px-3.5 py-2 text-[13px] font-semibold text-primary transition hover:border-primary/25 hover:bg-background lg:inline-flex"
          >
            Request demo
          </Link>
          <Link
            href="/intellirate"
            className="hidden rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-primary/90 sm:inline-flex"
          >
            Dashboard
          </Link>
          <button
            type="button"
            className="inline-flex rounded-xl border border-border p-2 text-primary md:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-border bg-card md:hidden"
          >
            <nav className="flex flex-col gap-0.5 px-4 py-3" aria-label="Mobile main">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-3 py-2.5 text-sm font-medium ${
                      active ? "bg-primary/10 text-primary" : "text-muted"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <Link
                href="/intellirate"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-full bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Dashboard
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
