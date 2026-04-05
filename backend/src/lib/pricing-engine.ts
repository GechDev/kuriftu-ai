export type DemandLevel = "Low" | "Medium" | "High" | "Surge";

export type PricingComputation = {
  suggestedCents: number;
  confidence: number;
  insight: string;
  demandIndex: number;
  demandLevel: DemandLevel;
  status: "Optimal" | "Underpriced" | "Overpriced";
  competitorAvgCents: number;
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Stable pseudo-market level (comps), typically 0.94–1.10× base. */
export function competitorAvgCents(serviceId: string, baseCents: number): number {
  const spread = (hashString(serviceId) % 19) / 100;
  return Math.round(baseCents * (0.94 + spread));
}

/**
 * Revenue model: demand is a smooth bump (log-normal style) around a
 * service-specific optimal multiplier mPeak ∈ [0.96, 1.16]. That yields a mix
 * of **uplift** and **reduction** suggestions vs published, unlike the old
 * curve that always favored the lowest price point.
 */
function revenueObjectiveAtMultiplier(
  baseCents: number,
  m: number,
  mPeak: number,
  competitorCents: number,
): number {
  const p = baseCents * m;
  // Primary demand: peaks at mPeak (booking intent)
  const sigma = 0.055;
  const d1 = Math.exp(-((m - mPeak) * (m - mPeak)) / (2 * sigma * sigma));
  // Secondary: stay near competitor positioning
  const mComp = competitorCents / Math.max(baseCents, 1);
  const sigma2 = 0.09;
  const d2 = Math.exp(-((m - mComp) * (m - mComp)) / (2 * sigma2 * sigma2));
  const blend = 0.72 * d1 + 0.28 * d2;
  return p * blend;
}

function optimalMultiplier(
  baseCents: number,
  serviceId: string,
  competitorCents: number,
): { m: number; mPeak: number } {
  const h = hashString(serviceId);
  // Peak between 0.96× and 1.16× base — varies per service
  const mPeak = 0.96 + ((h % 21) / 100); // 0.96 .. 1.16

  let bestM = 1;
  let bestR = -1;
  for (let bp = 88; bp <= 128; bp += 1) {
    const m = bp / 100;
    if (m < 0.86 || m > 1.28) continue;
    const r = revenueObjectiveAtMultiplier(baseCents, m, mPeak, competitorCents);
    if (r > bestR) {
      bestR = r;
      bestM = m;
    }
  }
  return { m: bestM, mPeak };
}

export function demandLevelFromIndex(idx: number): DemandLevel {
  if (idx >= 82) return "Surge";
  if (idx >= 64) return "High";
  if (idx >= 40) return "Medium";
  return "Low";
}

export function statusFromPrices(
  baseCents: number,
  publishedCents: number,
  suggestedCents: number,
): "Optimal" | "Underpriced" | "Overpriced" {
  if (suggestedCents < baseCents * 0.97 && publishedCents > baseCents * 1.02) return "Overpriced";
  if (suggestedCents > baseCents * 1.04) return "Underpriced";
  return "Optimal";
}

export function computeServicePricing(input: {
  serviceId: string;
  basePriceCents: number;
  publishedPriceCents: number;
}): PricingComputation {
  const base = input.basePriceCents;
  const published = input.publishedPriceCents;
  const comp = competitorAvgCents(input.serviceId, base);
  const { m: mElastic, mPeak } = optimalMultiplier(base, input.serviceId, comp);

  let suggested = Math.round(base * mElastic);

  // Light anchor to published + competitor so moves are explainable and not extreme
  const mPub = published / Math.max(base, 1);
  const suggestedBlend = Math.round(
    0.55 * suggested + 0.2 * published + 0.25 * (comp * 0.98 + published * 0.02),
  );
  suggested = suggestedBlend;

  const lo = Math.round(base * 0.87);
  const hi = Math.round(base * 1.24);
  suggested = Math.max(lo, Math.min(hi, suggested));

  const deltaPct = published > 0 ? ((suggested - published) / published) * 100 : 0;

  let insight: string;
  if (suggested > published * 1.015) {
    insight = `Demand index peaks near ${(mPeak * 100).toFixed(0)}% of catalog. Market comp ~$${(comp / 100).toFixed(0)}. Recommend +${Math.abs(deltaPct).toFixed(1)}% vs published to capture willingness-to-pay.`;
  } else if (suggested < published * 0.985) {
    insight = `Elasticity vs comps ($${(comp / 100).toFixed(0)}) favors −${Math.abs(deltaPct).toFixed(1)}% to lift conversion and fill capacity.`;
  } else {
    insight = `Published $${(published / 100).toFixed(0)} aligns with model band (peak ~${(mPeak * 100).toFixed(0)}% of base, comp $${(comp / 100).toFixed(0)}).`;
  }

  const spread = Math.abs(suggested - base * mPeak) / Math.max(base, 1);
  const confidence = Math.round(
    Math.min(96, Math.max(70, 91 - spread * 38 - (Math.abs(deltaPct) < 1.5 ? 3 : 0))),
  );

  const h = hashString(input.serviceId);
  const demandIndex = Math.min(
    98,
    Math.max(
      14,
      38 + (h % 48) + (suggested > published ? 10 : 0) + (mPeak > 1.05 ? 8 : 0),
    ),
  );

  return {
    suggestedCents: suggested,
    confidence,
    insight,
    demandIndex,
    demandLevel: demandLevelFromIndex(demandIndex),
    status: statusFromPrices(base, published, suggested),
    competitorAvgCents: comp,
  };
}

export function isStaffRole(role: string): boolean {
  return role === "MANAGER" || role === "ADMIN";
}
