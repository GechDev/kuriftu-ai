"use client";

import { IconMark } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EmptyState, LinkButton, Spinner } from "./ui";

export function RequireAuth({
  children,
  adminOnly,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (adminOnly && !user.isAdmin) router.replace("/");
  }, [user, loading, adminOnly, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <IconMark className="h-6 w-6" />
        </div>
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
        <EmptyState
          title="Sign in required"
          description="Log in to view this page and manage your stay."
          action={
            <LinkButton href="/login" className="min-w-[140px]">
              Log in
            </LinkButton>
          }
        />
      </div>
    );
  }

  if (adminOnly && !user.isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
        <EmptyState
          title="Admin access only"
          description="This area is restricted to staff accounts."
        />
      </div>
    );
  }

  return <>{children}</>;
}
