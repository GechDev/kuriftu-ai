import { ServiceRequestStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import {
  isNightBookedForDay,
  startOfTodayUtc,
} from "../lib/dates.js";
import { asyncHandler, routeParamId, zodErrorMessage } from "../lib/http.js";
import { notifyUser } from "../lib/notifications.js";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { attachAdminFromDb, requireAdmin, requireAuth } from "../middleware/auth.js";

const roomSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  pricePerNight: z.number().int().positive(),
});

const statusSchema = z.object({
  status: z.nativeEnum(ServiceRequestStatus),
});

export const adminRouter = Router();

adminRouter.use(requireAuth, attachAdminFromDb, requireAdmin);

adminRouter.post(
  "/rooms",
  asyncHandler(async (req, res) => {
    const parsed = roomSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: zodErrorMessage(parsed.error) });
      return;
    }
    const room = await prisma.room.create({ data: parsed.data });
    res.status(201).json({ room });
  })
);

adminRouter.patch(
  "/service-requests/:id",
  asyncHandler(async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: zodErrorMessage(parsed.error) });
      return;
    }
    const id = routeParamId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Service request not found" });
      return;
    }
    const serviceRequest = await prisma.serviceRequest.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { user: true, room: true },
    });
    res.json({ serviceRequest });
  })
);

adminRouter.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const [totalBookings, revenueAgg, pendingRequests, bookings] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.aggregate({ _sum: { totalPrice: true } }),
      prisma.serviceRequest.findMany({
        where: { status: ServiceRequestStatus.PENDING },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, email: true } }, room: true },
      }),
      prisma.booking.findMany({
        include: {
          user: { select: { id: true, email: true } },
          room: true,
        },
        orderBy: { checkIn: "asc" },
      }),
    ]);

    const today = startOfTodayUtc();
    const activeBookings = bookings.filter((b) =>
      isNightBookedForDay(today, b.checkIn, b.checkOut)
    );

    res.json({
      totalBookings,
      totalRevenue: revenueAgg._sum.totalPrice ?? 0,
      activeBookings,
      pendingServiceRequests: pendingRequests,
    });
  })
);

adminRouter.patch(
  "/bookings/:id/check-in",
  asyncHandler(async (req: AuthedRequest, res) => {
    const bid = routeParamId(req.params.id);
    if (!bid) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const booking = await prisma.booking.findUnique({
      where: { id: bid },
      include: { room: true, user: true },
    });
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    if (booking.checkedInAt) {
      res.status(400).json({ error: "Already checked in" });
      return;
    }
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { checkedInAt: new Date() },
      include: { room: true },
    });
    await notifyUser(
      booking.userId,
      "Room is ready",
      `Checked in to ${booking.room.name}. Enjoy your stay.`
    );
    res.json({ booking: updated });
  })
);

adminRouter.patch(
  "/bookings/:id/check-out",
  asyncHandler(async (req: AuthedRequest, res) => {
    const bid = routeParamId(req.params.id);
    if (!bid) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const booking = await prisma.booking.findUnique({
      where: { id: bid },
      include: { room: true },
    });
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    if (!booking.checkedInAt) {
      res.status(400).json({ error: "Check in first" });
      return;
    }
    if (booking.checkedOutAt) {
      res.status(400).json({ error: "Already checked out" });
      return;
    }
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { checkedOutAt: new Date() },
      include: { room: true },
    });
    await notifyUser(
      booking.userId,
      "Check-out recorded",
      `Thanks for staying at ${booking.room.name}.`
    );
    res.json({ booking: updated });
  })
);

adminRouter.get(
  "/service-requests",
  asyncHandler(async (_req, res) => {
    const serviceRequests = await prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, email: true } }, room: true, booking: true },
    });
    res.json({ serviceRequests });
  })
);
