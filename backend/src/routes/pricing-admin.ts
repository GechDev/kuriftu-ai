import { Router } from "express";
import { z } from "zod";
import { computeServicePricing } from "../lib/pricing-engine.js";
import { asyncHandler } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

export const pricingAdminRouter = Router();

pricingAdminRouter.use(requireAuth, requireStaff);

pricingAdminRouter.get(
  "/admin/preview",
  asyncHandler(async (_req, res) => {
    const services = await prisma.resortService.findMany({
      orderBy: [{ resortId: "asc" }, { category: "asc" }, { title: "asc" }],
      include: { resort: { select: { name: true, slug: true } } },
    });

    const rows = services.map((s) => {
      const calc = computeServicePricing({
        serviceId: s.id,
        basePriceCents: s.basePriceCents,
        publishedPriceCents: s.publishedPriceCents,
      });
      return {
        id: s.id,
        resortSlug: s.resort.slug,
        resortName: s.resort.name,
        imageUrl: s.imageUrl,
        name: s.title,
        category: s.category,
        basePrice: s.basePriceCents / 100,
        publishedPrice: s.publishedPriceCents / 100,
        aiSuggestedPrice: calc.suggestedCents / 100,
        demandLevel: calc.demandLevel,
        demandIndex: calc.demandIndex,
        changePctPublishedVsBase:
          s.basePriceCents > 0
            ? Math.round(
                ((s.publishedPriceCents - s.basePriceCents) / s.basePriceCents) * 10000,
              ) / 100
            : 0,
        changePctSuggestedVsPublished:
          s.publishedPriceCents > 0
            ? Math.round(
                ((calc.suggestedCents - s.publishedPriceCents) / s.publishedPriceCents) * 10000,
              ) / 100
            : 0,
        status: calc.status,
        insight: calc.insight,
        confidence: calc.confidence,
        competitorAvg: calc.competitorAvgCents / 100,
      };
    });

    res.json({ services: rows, updatedAt: Date.now() / 1000 });
  }),
);

const confirmSchema = z.object({
  serviceIds: z.array(z.string().min(1)).optional(),
  applyAll: z.boolean().optional(),
});

pricingAdminRouter.post(
  "/admin/confirm",
  asyncHandler(async (req, res) => {
    const parsed = confirmSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }
    const applyAll = parsed.data.applyAll !== false;
    const ids = parsed.data.serviceIds;

    if (!applyAll && (!ids || ids.length === 0)) {
      res.status(400).json({ error: "serviceIds required when applyAll is false" });
      return;
    }

    const all = await prisma.resortService.findMany({
      where: applyAll ? {} : { id: { in: ids! } },
    });

    const applied: {
      id: string;
      name: string;
      previousPublished: number;
      newPublished: number;
    }[] = [];

    for (const s of all) {
      const calc = computeServicePricing({
        serviceId: s.id,
        basePriceCents: s.basePriceCents,
        publishedPriceCents: s.publishedPriceCents,
      });
      const prev = s.publishedPriceCents;
      await prisma.resortService.update({
        where: { id: s.id },
        data: { publishedPriceCents: calc.suggestedCents },
      });
      applied.push({
        id: s.id,
        name: s.title,
        previousPublished: Math.round((prev / 100) * 100) / 100,
        newPublished: Math.round((calc.suggestedCents / 100) * 100) / 100,
      });
    }

    res.json({
      success: true,
      applied,
      message: `Updated ${applied.length} published rate(s) from AI suggestions.`,
    });
  }),
);
