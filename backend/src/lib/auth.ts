import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-insecure-secret";

export type JwtPayload = { sub: string; admin: boolean; role: string };

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: JwtPayload, expiresIn = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded !== "object" || decoded === null) throw new Error("INVALID_TOKEN");
  const sub = (decoded as { sub?: unknown }).sub;
  const admin = (decoded as { admin?: unknown }).admin;
  const roleRaw = (decoded as { role?: unknown }).role;
  if (typeof sub !== "string" || typeof admin !== "boolean") throw new Error("INVALID_TOKEN");
  const role = typeof roleRaw === "string" ? roleRaw : "GUEST";
  return { sub, admin, role };
}
