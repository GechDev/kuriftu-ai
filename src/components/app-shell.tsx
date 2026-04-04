"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  IconBell,
  IconBookings,
  IconMark,
  IconMic,
  IconRequests,
  IconResort,
  IconRooms,
  IconShield,
} from "@/components/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, LinkButton } from "./ui";

const mainNav = [
  { href: "/rooms", label: "Rooms & suites", Icon: IconRooms },
  { href: "/resorts", label: "Our resorts", Icon: IconResort },
  { href: "/bookings", label: "Reservations", Icon: IconBookings },
  { href: "/requests", label: "Guest services", Icon: IconRequests },
  { href: "/notifications", label: "Messages", Icon: IconBell },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const hideNav = pathname === "/login" || pathname === "/register";

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
        <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
            <Link
              href="/"
              className="group flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <span className="flex h-11 w-11 items-center justify-center border border-border bg-accent text-accent-fg transition group-hover:bg-accent-hover">
                <IconMark className="h-6 w-6" />
              </span>
              <span className="flex flex-col">
                <span className="font-display text-xl font-semibold leading-none tracking-tight text-foreground sm:text-2xl">
                  Kuriftu
                </span>
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.28em] text-muted">
                  Collection
                </span>
              </span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              <LinkButton
                href="/voice"
                className="mr-2 !px-4 !py-2.5 text-xs font-semibold uppercase tracking-[0.1em]"
              >
                <span className="inline-flex items-center gap-2">
                  <IconMic className="h-4 w-4" />
                  Voice
                </span>
              </LinkButton>
              {mainNav.map(({ href, label, Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] transition ${
                      active
                        ? "text-accent"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 opacity-70" />
                    {label}
                  </Link>
                );
              })}
              {user?.isAdmin ? (
                <Link
                  href="/admin"
                  className={`ml-2 border-l border-border pl-4 text-xs font-medium uppercase tracking-[0.12em] ${
                    pathname.startsWith("/admin")
                      ? "text-[color:var(--gold)]"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <IconShield className="h-3.5 w-3.5" />
                    Staff
                  </span>
                </Link>
              ) : null}
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className="hidden max-w-[200px] truncate text-xs text-muted xl:inline">
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
            {mainNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`shrink-0 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide ${
                  pathname === href || pathname.startsWith(href + "/")
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
        <footer className="border-t border-border bg-surface-2">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3 sm:px-6">
            <div>
              <p className="font-display text-lg font-semibold text-foreground">Kuriftu</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Voice-first concierge for the collection—plus refined rooms, regional dining, and
                attentive guest care.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Plan your visit
              </p>
              <ul className="mt-4 space-y-2 text-sm text-foreground">
                <li>
                  <Link href="/voice" className="font-medium text-accent transition hover:underline">
                    Voice agent
                  </Link>
                </li>
                <li>
                  <Link href="/rooms" className="text-muted transition hover:text-accent">
                    Rooms & suites
                  </Link>
                </li>
                <li>
                  <Link href="/resorts" className="text-muted transition hover:text-accent">
                    Resort destinations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Guest care
              </p>
              <ul className="mt-4 space-y-2 text-sm text-foreground">
                <li>
                  <Link href="/requests" className="text-muted transition hover:text-accent">
                    Service requests
                  </Link>
                </li>
                <li>
                  <Link href="/bookings" className="text-muted transition hover:text-accent">
                    Your reservations
                  </Link>
                </li>
                <li>
                  <Link href="/notifications" className="text-muted transition hover:text-accent">
                    Messages
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border py-6 text-center">
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} Kuriftu Collection. Crafted for restful stays.
            </p>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
