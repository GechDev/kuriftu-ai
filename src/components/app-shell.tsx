"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui";

const nav = [
  { href: "/rooms", label: "Rooms" },
  { href: "/bookings", label: "My bookings" },
  { href: "/requests", label: "Service requests" },
  { href: "/notifications", label: "Notifications" },
  { href: "/voice", label: "Voice" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const hideNav =
    pathname === "/login" || pathname === "/register" || pathname === "/voice";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800 dark:border-zinc-600 dark:border-t-zinc-200" />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      {!hideNav ? (
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Kuriftu
            </Link>
            <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
              {nav.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    pathname === href || pathname.startsWith(href + "/")
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  }`}
                >
                  {label}
                </Link>
              ))}
              {user?.isAdmin ? (
                <Link
                  href="/admin"
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    pathname.startsWith("/admin")
                      ? "bg-amber-100 text-amber-950 dark:bg-amber-900/40 dark:text-amber-100"
                      : "text-amber-800 hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-amber-950/40"
                  }`}
                >
                  Admin
                </Link>
              ) : null}
            </nav>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 sm:inline">
                    {user.email}
                  </span>
                  <Button variant="ghost" className="!px-2 text-sm" onClick={logout}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="!px-3 text-sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="!px-3 text-sm">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-zinc-100 px-2 py-2 md:hidden dark:border-zinc-900">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {label}
              </Link>
            ))}
            {user?.isAdmin ? (
              <Link
                href="/admin"
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200"
              >
                Admin
              </Link>
            ) : null}
          </div>
        </header>
      ) : null}
      <main className="flex-1">{children}</main>
      {!hideNav ? (
        <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
          Kuriftu demo · API + voice concierge
        </footer>
      ) : null}
    </div>
  );
}
