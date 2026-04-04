import type { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler, routeParamId } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

export const resortsRouter = Router();

async function resortByIdOrSlug(identifier: string) {
  return prisma.resort.findFirst({
    where: { OR: [{ id: identifier }, { slug: identifier }] },
  });
}

resortsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const resorts = await prisma.resort.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        region: true,
        shortDescription: true,
        address: true,
        _count: { select: { services: true, mapPlaces: true, rooms: true } },
      },
    });
    res.json({ resorts });
  })
);

resortsRouter.get(
  "/:identifier",
  asyncHandler(async (req, res) => {
    const identifier = routeParamId(req.params.identifier);
    if (!identifier) {
      res.status(400).json({ error: "Invalid resort id or slug" });
      return;
    }
    const resort = await prisma.resort.findFirst({
      where: { OR: [{ id: identifier }, { slug: identifier }] },
      include: {
        _count: { select: { services: true, mapPlaces: true, rooms: true } },
      },
    });
    if (!resort) {
      res.status(404).json({ error: "Resort not found" });
      return;
    }
    res.json({ resort });
  })
);

const listQuery = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
});

resortsRouter.get(
  "/:identifier/services",
  asyncHandler(async (req, res) => {
    const identifier = routeParamId(req.params.identifier);
    if (!identifier) {
      res.status(400).json({ error: "Invalid resort id or slug" });
      return;
    }
    const parsed = listQuery.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query" });
      return;
    }
    const resort = await resortByIdOrSlug(identifier);
    if (!resort) {
      res.status(404).json({ error: "Resort not found" });
      return;
    }
    const { category, q } = parsed.data;
    const parts: Prisma.ResortServiceWhereInput[] = [{ resortId: resort.id }];
    if (category?.trim()) {
      parts.push({ category: category.trim().toLowerCase() });
    }
    if (q?.trim()) {
      const needle = q.trim();
      parts.push({
        OR: [
          { title: { contains: needle } },
          { description: { contains: needle } },
          { locationNote: { contains: needle } },
        ],
      });
    }
    const where: Prisma.ResortServiceWhereInput =
      parts.length === 1 ? parts[0]! : { AND: parts };
    const services = await prisma.resortService.findMany({
      where,
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });
    res.json({ resortId: resort.id, resortName: resort.name, services });
  })
);

resortsRouter.get(
  "/:identifier/map-places",
  asyncHandler(async (req, res) => {
    const identifier = routeParamId(req.params.identifier);
    if (!identifier) {
      res.status(400).json({ error: "Invalid resort id or slug" });
      return;
    }
    const parsed = listQuery.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query" });
      return;
    }
    const resort = await resortByIdOrSlug(identifier);
    if (!resort) {
      res.status(404).json({ error: "Resort not found" });
      return;
    }
    const { category, q } = parsed.data;
    const parts: Prisma.MapPlaceWhereInput[] = [{ resortId: resort.id }];
    if (category?.trim()) {
      parts.push({ category: category.trim().toLowerCase() });
    }
    if (q?.trim()) {
      const needle = q.trim();
      parts.push({
        OR: [
          { name: { contains: needle } },
          { directionsFromLobby: { contains: needle } },
          { building: { contains: needle } },
        ],
      });
    }
    const where: Prisma.MapPlaceWhereInput =
      parts.length === 1 ? parts[0]! : { AND: parts };
    const mapPlaces = await prisma.mapPlace.findMany({
      where,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    res.json({ resortId: resort.id, resortName: resort.name, mapPlaces });
  })
);
