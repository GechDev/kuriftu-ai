"use client";

import { RequireAuth } from "@/components/require-auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth staffOnly>{children}</RequireAuth>;
}
