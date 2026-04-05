"use client";

import { IconMark } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Button, Card, Input } from "@/components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      router.push("/rooms");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="mb-8 flex justify-center">
        <Link
          href="/"
          className="flex h-14 w-14 items-center justify-center rounded-sm border border-border bg-accent text-accent-fg shadow-[var(--shadow-lift)]"
        >
          <IconMark className="h-8 w-8" />
        </Link>
      </div>
      <Card className="border-border/80 p-8 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-muted">
          No account?{" "}
          <Link
            href="/register"
            className="font-semibold text-accent hover:underline"
          >
            Create one
          </Link>
        </p>
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <Alert>{error}</Alert> : null}
          <Button type="submit" disabled={pending} className="w-full py-3">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
