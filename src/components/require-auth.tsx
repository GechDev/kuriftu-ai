"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button, EmptyState, Spinner } from "./ui";

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
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          title="Sign in required"
          action={
            <Link href="/login">
              <Button>Log in</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (adminOnly && !user.isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState title="Admin access only" />
      </div>
    );
  }

  return <>{children}</>;
}
