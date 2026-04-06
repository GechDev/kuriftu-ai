"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { resortImages } from "@/lib/resortImages";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black">
      {/* Background image with slow zoom motion - very subtle opacity */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        animate={{
          scale: [1, 1.06, 1],
        }}
        transition={{
          duration: 20,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <Image
          src={resortImages.aerialLake}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      </motion.div>

      {/* Pure black gradient overlay for consistency */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-2">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gold-400 bg-clip-text text-transparent"
            >
              Kuriftu NEXORA
            </motion.p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Where hospitality meets intelligence. Built for Kuriftu Resort and properties that treat every stay as
              craft — not a ticket queue.
            </p>
            {/* Decorative gold line */}
            <div className="mt-6 h-px w-12 bg-gold-400/50" />
          </div>

          {/* Product links */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400">Product</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  href="/intellirate"
                  className="group inline-flex items-center gap-1 text-white/70 transition-all duration-300 hover:text-gold-400 hover:translate-x-1"
                >
                  IntelliRate Engine
                  <span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="group inline-flex items-center gap-1 text-white/70 transition-all duration-300 hover:text-gold-400 hover:translate-x-1"
                >
                  Service Optimizer
                  <span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  className="group inline-flex items-center gap-1 text-white/70 transition-all duration-300 hover:text-gold-400 hover:translate-x-1"
                >
                  Platform
                  <span className="opacity-0 transition-opacity group-hover:opacity-100">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-400">Contact</p>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li className="transition-all duration-300 hover:text-gold-400 hover:translate-x-1">
                <a href="mailto:hello@kuriftu.nexora" className="inline-flex items-center gap-1">
                  hello@kuriftu.nexora
                </a>
              </li>
              <li className="transition-all duration-300 hover:text-gold-400 hover:translate-x-1">
                <span>+251 11 555 0142</span>
              </li>
              <li className="transition-all duration-300 hover:text-gold-400 hover:translate-x-1">
                <span>Bishoftu, Ethiopia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Kuriftu NEXORA. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="transition-all duration-300 hover:text-gold-400">
              Privacy
            </a>
            <a href="#" className="transition-all duration-300 hover:text-gold-400">
              Terms
            </a>
            <a href="#" className="transition-all duration-300 hover:text-gold-400">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}