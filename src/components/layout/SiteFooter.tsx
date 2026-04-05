import Image from "next/image";
import Link from "next/link";
import { resortImages } from "@/lib/resortImages";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-primary text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
        <Image
          src={resortImages.aerialLake}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-[#0f1a18]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-lg font-semibold tracking-tight">Kuriftu NEXORA</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
              Where hospitality meets intelligence. Built for Kuriftu Resort and properties that treat every stay as
              craft — not a ticket queue.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">Product</p>
            <ul className="mt-5 space-y-2.5 text-sm text-white/78">
              <li>
                <Link href="/intellirate" className="transition hover:text-white">
                  IntelliRate Engine
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition hover:text-white">
                  Service Optimizer
                </Link>
              </li>
              <li>
                <Link href="/#features" className="transition hover:text-white">
                  Platform
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">Contact</p>
            <ul className="mt-5 space-y-2.5 text-sm text-white/78">
              <li>
                <a href="mailto:hello@kuriftu.nexora" className="transition hover:text-white">
                  hello@kuriftu.nexora
                </a>
              </li>
              <li>
                <span>+251 11 555 0142</span>
              </li>
              <li>
                <span>Bishoftu, Ethiopia</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Kuriftu NEXORA. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="transition hover:text-white">
              Privacy
            </a>
            <a href="#" className="transition hover:text-white">
              Terms
            </a>
            <a href="#" className="transition hover:text-white">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
