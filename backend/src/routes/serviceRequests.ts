import { Router } from "express";
import { z } from "zod";
import {
  buildStaySummary,
  prismaBookingWithRoomResort,
  prismaRoomWithResort,
} from "../lib/booking-includes.js";
import { asyncHandler, routeParamId, zodErrorMessage } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

const createSchema = z.object({
  roomId: z.string().min(1),
  bookingId: z.string().optional(),
  message: z.string().min(1).max(2000),
  serviceCategory: z
    .enum([
      "housekeeping",
      "dining",
      "spa",
      "maintenance",
      "transport",
      "concierge",
      "other",
    ])
    .optional(),
});

const serviceRequestInclude = {
  room: prismaRoomWithResort,
  booking: {
    include: prismaBookingWithRoomResort,
  },
} as const;

function enrich(sr: {
  booking: {
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    room: { pricePerNight: number } | null;
  } | null;
}) {
  if (!sr.booking) return sr;
  return {
    ...sr,
    booking: {
      ...sr.booking,
      staySummary: buildStaySummary(sr.booking),
    },
  };
}

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
    const { roomId, bookingId, message, serviceCategory } = parsed.data;
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
        serviceCategory: serviceCategory ?? null,
      },
      include: serviceRequestInclude,
    });
    res.status(201).json({ serviceRequest: enrich(sr) });
  })
);

serviceRequestsRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const list = await prisma.serviceRequest.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      include: serviceRequestInclude,
    });
    res.json({ serviceRequests: list.map((row) => enrich(row)) });
  })
);

serviceRequestsRouter.get(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = routeParamId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: { id, userId: req.userId! },
      include: serviceRequestInclude,
    });
    if (!serviceRequest) {
      res.status(404).json({ error: "Service request not found" });
      return;
    }
    res.json({ serviceRequest: enrich(serviceRequest) });
  })
);
