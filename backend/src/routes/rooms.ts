import { Router } from "express";
import { z } from "zod";
import {
  isNightBookedForDay,
  nightCount,
  parseDateOnly,
  utcDay,
} from "../lib/dates.js";
import { asyncHandler, routeParamId } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

export const roomsRouter = Router();

roomsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rooms = await prisma.room.findMany({
      orderBy: { name: "asc" },
      include: {
        resort: {
          select: {
            id: true,
            name: true,
            slug: true,
            region: true,
            shortDescription: true,
          },
        },
      },
    });
    res.json({ rooms });
  })
);

/** Month grid: YYYY-MM → per-day booked flag for UI calendar. */
roomsRouter.get(
  "/:id/availability",
  asyncHandler(async (req, res) => {
    const monthSchema = z.string().regex(/^\d{4}-\d{2}$/);
    const m = monthSchema.safeParse(req.query.month);
    if (!m.success) {
      res.status(400).json({ error: "Query ?month=YYYY-MM is required" });
      return;
    }
    const [y, mo] = m.data.split("-").map(Number);
    const roomId = routeParamId(req.params.id);
    if (!roomId) {
      res.status(400).json({ error: "Invalid room id" });
      return;
    }
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    const end = new Date(Date.UTC(y, mo, 0));
    const bookings = await prisma.booking.findMany({
      where: { roomId },
      select: { checkIn: true, checkOut: true },
    });

    const days: { date: string; booked: boolean }[] = [];
    for (let d = 1; d <= end.getUTCDate(); d++) {
      const day = new Date(Date.UTC(y, mo - 1, d));
      const booked = bookings.some((b) =>
        isNightBookedForDay(day, b.checkIn, b.checkOut)
      );
      const iso = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ date: iso, booked });
    }

    res.json({
      roomId,
      month: m.data,
      days,
      legend: {
        booked: "At least one booked night that calendar day",
        note: "Checkout day is not counted as a booked night",
      },
    });
  })
);

/** Optional helper: nights × price preview (no auth). */
roomsRouter.get(
  "/:id/quote",
  asyncHandler(async (req, res) => {
    const q = z
      .object({
        checkIn: z.string(),
        checkOut: z.string(),
      })
      .safeParse(req.query);
    if (!q.success) {
      res.status(400).json({ error: "Query checkIn and checkOut (YYYY-MM-DD) required" });
      return;
    }
    let checkIn: Date;
    let checkOut: Date;
    try {
      checkIn = parseDateOnly(q.data.checkIn);
      checkOut = parseDateOnly(q.data.checkOut);
    } catch {
      res.status(400).json({ error: "Invalid date format" });
      return;
    }
    const nights = nightCount(checkIn, checkOut);
    if (nights < 1) {
      res.status(400).json({ error: "checkOut must be after checkIn" });
      return;
    }
    const roomId = routeParamId(req.params.id);
    if (!roomId) {
      res.status(400).json({ error: "Invalid room id" });
      return;
    }
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    const totalPrice = nights * room.pricePerNight;
    res.json({
      roomId: room.id,
      checkIn: utcDay(checkIn).toISOString(),
      checkOut: utcDay(checkOut).toISOString(),
      nights,
      pricePerNight: room.pricePerNight,
      totalPrice,
    });
  })
);

roomsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = routeParamId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid room id" });
      return;
    }
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        resort: {
          select: {
            id: true,
            name: true,
            slug: true,
            region: true,
            shortDescription: true,
            address: true,
            mapOverview: true,
          },
        },
      },
    });
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    res.json({ room });
  })
);
