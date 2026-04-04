import { Router } from "express";
import { z } from "zod";
import { nightCount, parseDateOnly, startOfTodayUtc } from "../lib/dates.js";
import { asyncHandler, routeParamId, zodErrorMessage } from "../lib/http.js";
import { notifyUser } from "../lib/notifications.js";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

const createSchema = z.object({
  roomId: z.string().min(1),
  checkIn: z.string(),
  checkOut: z.string(),
});

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);

bookingsRouter.post(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: zodErrorMessage(parsed.error) });
      return;
    }
    const { roomId, checkIn: inStr, checkOut: outStr } = parsed.data;
    let checkIn: Date;
    let checkOut: Date;
    try {
      checkIn = parseDateOnly(inStr);
      checkOut = parseDateOnly(outStr);
    } catch {
      res.status(400).json({ error: "checkIn and checkOut must be YYYY-MM-DD" });
      return;
    }
    const nights = nightCount(checkIn, checkOut);
    if (nights < 1) {
      res.status(400).json({ error: "checkOut must be after checkIn" });
      return;
    }
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    const overlap = await prisma.booking.findFirst({
      where: {
        roomId,
        AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
      },
    });
    if (overlap) {
      res.status(409).json({ error: "Room is not available for those dates" });
      return;
    }
    const totalPrice = nights * room.pricePerNight;
    const booking = await prisma.booking.create({
      data: {
        userId: req.userId!,
        roomId,
        checkIn,
        checkOut,
        totalPrice,
      },
      include: { room: true },
    });
    await notifyUser(
      req.userId!,
      "Booking confirmed",
      `${room.name}: ${inStr} → ${outStr} (${nights} night(s)). Total ${totalPrice}.`
    );
    res.status(201).json({ booking });
  })
);

bookingsRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const filter = z.enum(["upcoming", "past", "all"]).safeParse(req.query.filter);
    const mode = filter.success ? filter.data : "all";
    const today = startOfTodayUtc();

    const where: {
      userId: string;
      checkOut?: { gte?: Date; lt?: Date };
    } = { userId: req.userId! };

    if (mode === "upcoming") {
      where.checkOut = { gte: today };
    } else if (mode === "past") {
      where.checkOut = { lt: today };
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { checkIn: mode === "past" ? "desc" : "asc" },
      include: { room: true },
    });
    res.json({ filter: mode, bookings });
  })
);

bookingsRouter.get(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = routeParamId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const booking = await prisma.booking.findFirst({
      where: { id, userId: req.userId! },
      include: { room: true },
    });
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    res.json({ booking });
  })
);
