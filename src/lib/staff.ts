import type { User } from "@/lib/types";

export function isStaff(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === "MANAGER" || user.role === "ADMIN";
}
