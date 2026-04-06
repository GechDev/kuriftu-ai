"use client";

import { useAuth } from "@/contexts/auth-context";
import { isStaff } from "@/lib/staff";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  IconBell,
  IconBookings,
  IconMark,
  IconMic,
  IconRequests,
  IconResort,
  IconRooms,
  IconShield,
  IconSpark,
} from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button, LinkButton } from "./ui";

const mainNav = [
  { href: "/rooms", label: "Rooms & suites", Icon: IconRooms },
  { href: "/resorts", label: "Our resorts", Icon: IconResort },
  { href: "/admin", label: "Control Center", Icon: IconSpark, staff: true },
  { href: "/pricing", label: "Premium Pricing", Icon: IconBookings },
  { href: "/bookings", label: "Reservations", Icon: IconBookings },
  { href: "/requests", label: "Guest services", Icon: IconRequests },
  { href: "/notifications", label: "Messages", Icon: IconBell },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const hideNav = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");

    const revealNodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -10% 0px" },
    );
    revealNodes.forEach((node) => revealObserver.observe(node));

    const cleanupTilt: Array<() => void> = [];
    if (!mq.matches) {
      const cards = Array.from(document.querySelectorAll<HTMLElement>(".tilt-card"));
      cards.forEach((card) => {
        const onMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `rotateX(${y * 12}deg) rotateY(${x * 12}deg) scale(1.02)`;
          card.style.transition = "transform 0.1s ease";
        };
        const onLeave = () => {
          card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
          card.style.transition = "transform 0.3s ease";
        };

        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
        cleanupTilt.push(() => {
          card.removeEventListener("mousemove", onMove);
          card.removeEventListener("mouseleave", onLeave);
        });
      });
    }

    return () => {
      revealObserver.disconnect();
      cleanupTilt.forEach((fn) => fn());
    };
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white">
        <div className="flex h-14 w-14 items-center justify-center border border-border bg-surface-2 text-accent">
          <IconMark className="h-8 w-8" />
        </div>
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
          aria-label="Loading"
        />
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Kuriftu</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      {!hideNav ? (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/72 shadow-[0_8px_30px_-24px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300">
          <div className="mx-auto flex h-[4.15rem] max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.35rem] sm:gap-5 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="group flex items-center gap-3.5 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10">
                <IconMark className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </span>
              <span className="flex flex-col">
                <span className="font-display text-[1.12rem] font-medium leading-none tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-[1.2rem] xl:text-[1.24rem]">
                  Kuriftu
                </span>
                <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.28em] text-muted sm:text-[9px] sm:tracking-[0.33em]">
                  Collection
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1">
              <LinkButton
                href="/voice"
                className="mr-2 !px-4 !py-2.5 text-xs font-semibold uppercase tracking-[0.1em]"
              >
                <span className="inline-flex items-center gap-2">
                  <IconMic className="h-4 w-4" />
                  Voice
                </span>
              </LinkButton>
              {mainNav
                .filter((item) => (item.staff ? isStaff(user) : true))
                .map(({ href, label, Icon }) => {
                const active =
                  href === "/admin"
                    ? pathname.startsWith("/admin")
                    : pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[11px] font-medium uppercase tracking-[0.1em] transition xl:px-3 ${
                      active
                        ? "bg-accent/10 text-accent"
                        : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 opacity-70" />
                    {label}
                  </Link>
                );
              })}
              {user?.isAdmin ? (
                <Link
                  href="/admin/operations"
                  className={`ml-2 border-l border-border pl-4 text-xs font-medium uppercase tracking-[0.12em] ${
                    pathname.startsWith("/admin/operations")
                      ? "text-[color:var(--gold)]"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <IconShield className="h-3.5 w-3.5" />
                    Ops
                  </span>
                </Link>
              ) : null}
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                <span className="hidden max-w-[180px] truncate text-[11px] text-muted xl:inline">
                    {user.email}
                  </span>
                  <Button
                    variant="ghost"
                    className="!px-3 !py-2 text-xs uppercase tracking-wider"
                    onClick={logout}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <LinkButton
                    href="/login"
                    variant="ghost"
                    className="!px-3 !py-2 text-xs uppercase tracking-wider"
                  >
                    Sign in
                  </LinkButton>
                  <LinkButton
                    href="/register"
                    className="!px-4 !py-2 text-xs uppercase tracking-wider"
                  >
                    Join
                  </LinkButton>
                </>
              )}
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto border-t border-border/80 px-3 py-2 lg:hidden">
            <Link
              href="/voice"
              className={`shrink-0 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${
                pathname === "/voice" ? "text-accent" : "text-muted"
              }`}
            >
              Voice
            </Link>
            {mainNav
              .filter((item) => (item.staff ? isStaff(user) : true))
              .map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`shrink-0 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide ${
                  href === "/admin"
                    ? pathname.startsWith("/admin")
                    : pathname === href || pathname.startsWith(href + "/")
                    ? "text-accent"
                    : "text-muted"
                }`}
              >
                {label}
              </Link>
            ))}
            {user?.isAdmin ? (
              <Link
                href="/admin"
                className="shrink-0 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-[color:var(--gold)]"
              >
                Staff
              </Link>
            ) : null}
          </nav>
        </header>
      ) : null}

      <main className="flex-1 bg-white">{children}</main>

      {!hideNav ? (
        <SiteFooter />
      ) : null}
    </div>
  );
}
