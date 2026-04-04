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
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="sticky top-0 z-50 border-b border-border/80 bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-md">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-primary">Kuriftu NEXORA</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted">AI Hospitality</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted hover:bg-slate-100 hover:text-primary"
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
            className="hidden rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary transition hover:border-accent/40 lg:inline-flex"
          >
            Request demo
          </Link>
          <Link
            href="/intellirate"
            className="hidden rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#5a52e6] sm:inline-flex"
          >
            Dashboard
          </Link>
          <button
            type="button"
            className="inline-flex rounded-lg border border-border p-2 text-primary md:hidden"
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
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border bg-white md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobile main">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
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
                className="mt-2 rounded-xl bg-accent px-3 py-2.5 text-center text-sm font-semibold text-white"
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
