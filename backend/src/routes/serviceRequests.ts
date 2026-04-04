import { Router } from "express";
import { z } from "zod";
import { asyncHandler, zodErrorMessage } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

const createSchema = z.object({
  roomId: z.string().min(1),
  bookingId: z.string().optional(),
  message: z.string().min(1).max(2000),
});

export const serviceRequestsRouter = Router();

serviceRequestsRouter.use(requireAuth);

serviceRequestsRouter.post(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: zodErrorMessage(parsed.error) });
      return;
    }
    const { roomId, bookingId, message } = parsed.data;
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if (bookingId) {
      const b = await prisma.booking.findFirst({
        where: { id: bookingId, userId: req.userId! },
      });
      if (!b) {
        res.status(404).json({ error: "Booking not found" });
        return;
      }
      if (b.roomId !== roomId) {
        res.status(400).json({ error: "Booking does not match room" });
        return;
      }
    }
    const sr = await prisma.serviceRequest.create({
      data: {
        userId: req.userId!,
        roomId,
        bookingId: bookingId ?? null,
        message,
      },
      include: { room: true, booking: true },
    });
    res.status(201).json({ serviceRequest: sr });
  })
);

serviceRequestsRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const list = await prisma.serviceRequest.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      include: { room: true, booking: true },
    });
    res.json({ serviceRequests: list });
  })
);
