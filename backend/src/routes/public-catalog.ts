import { Router } from "express";
import { asyncHandler, routeParamId } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";

export const publicCatalogRouter = Router();

/**
 * Public catalog: guest-facing prices from DB (publishedPriceCents).
 * No authentication.
 */
publicCatalogRouter.get(
  "/resorts/:slug/services-catalog",
  asyncHandler(async (req, res) => {
    const slug = routeParamId(req.params.slug);
    if (!slug) {
      res.status(400).json({ error: "Invalid resort slug" });
      return;
    }
    const resort = await prisma.resort.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, region: true },
    });
    if (!resort) {
      res.status(404).json({ error: "Resort not found" });
      return;
    }
    const services = await prisma.resortService.findMany({
      where: { resortId: resort.id },
      orderBy: [{ category: "asc" }, { title: "asc" }],
      select: {
        id: true,
        category: true,
        title: true,
        description: true,
        hours: true,
        locationNote: true,
        howToBook: true,
        imageUrl: true,
        basePriceCents: true,
        publishedPriceCents: true,
      },
    });

    res.json({
      resort,
      services: services.map((s) => ({
        id: s.id,
        category: s.category,
        title: s.title,
        description: s.description,
        hours: s.hours,
        locationNote: s.locationNote,
        howToBook: s.howToBook,
        imageUrl: s.imageUrl,
        basePrice: s.basePriceCents / 100,
        publishedPrice: s.publishedPriceCents / 100,
      })),
    });
  }),
);
