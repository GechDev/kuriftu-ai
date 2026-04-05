import { Router } from "express";
import { z } from "zod";
import { hashPassword, signToken, verifyPassword } from "../lib/auth.js";
import { asyncHandler, zodErrorMessage } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: zodErrorMessage(parsed.error) });
      return;
    }
    const { email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, isAdmin: true },
    });
    const token = signToken({ sub: user.id, admin: user.isAdmin });
    res.status(201).json({ user, token });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: zodErrorMessage(parsed.error) });
      return;
    }
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = signToken({ sub: user.id, admin: user.isAdmin });
    res.json({
      user: { id: user.id, email: user.email, isAdmin: user.isAdmin },
      token,
    });
  })
);
