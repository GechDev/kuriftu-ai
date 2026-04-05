import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

export type AuthedRequest = Request & {
  userId?: string;
  isAdmin?: boolean;
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  try {
    const p = verifyToken(token);
    req.userId = p.sub;
    req.isAdmin = p.admin;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!req.isAdmin) {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  next();
}

/** Refreshes admin flag from DB so JWT cannot be stale after role change. */
export async function attachAdminFromDb(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    next();
    return;
  }
  try {
    const u = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isAdmin: true },
    });
    req.isAdmin = Boolean(u?.isAdmin);
    next();
  } catch {
    res.status(500).json({ error: "Server error" });
  }
}
