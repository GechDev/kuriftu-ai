"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Platform" },
  { href: "/intellirate", label: "IntelliRate" },
  { href: "/services", label: "Service Optimizer" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setScrolled(latest > 20);
    });
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-black/80 backdrop-blur-xl"
          : "border-b border-white/5 bg-black/50 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-[3.8rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-amber-500 shadow-lg"
          >
            <Sparkles className="h-[1.15rem] w-[1.15rem] text-black" aria-hidden />
          </motion.div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold tracking-tight text-white">Kuriftu NEXORA</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-gold-400/80">
              Resort intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "text-gold-400"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-x-3 -bottom-px h-px bg-gold-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/#demo"
            className="hidden rounded-full border border-white/20 px-3.5 py-2 text-[13px] font-semibold text-white/80 transition-all duration-200 hover:border-gold-400/50 hover:bg-white/5 hover:text-gold-400 lg:inline-flex"
          >
            Request demo
          </Link>
          <Link
            href="/intellirate"
            className="hidden rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-4 py-2 text-[13px] font-semibold text-black shadow-md transition-all duration-200 hover:shadow-gold-400/25 hover:scale-[1.02] sm:inline-flex"
          >
            Dashboard
          </Link>
          <button
            type="button"
            className="inline-flex rounded-xl border border-white/20 p-2 text-white/80 transition-colors hover:border-gold-400/50 hover:text-gold-400 md:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-black/95 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile main">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                      active
                        ? "bg-gold-400/10 text-gold-400"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <Link
                href="/intellirate"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-full bg-gradient-to-r from-gold-400 to-amber-500 px-3 py-3 text-center text-sm font-semibold text-black"
              >
                Dashboard
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}