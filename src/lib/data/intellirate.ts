import type {
  AiRecommendation,
  CompetitorRow,
  KpiMetric,
  PricingPeriod,
  PricingPoint,
} from "./types";

/** Mock API: GET /api/v1/intellirate/dashboard */
export function fetchIntellirateKpis(): KpiMetric[] {
  return [
    { id: "price", label: "Current Room Price", value: "$284", change: "+4.2%", trend: "up" },
    { id: "occ", label: "Occupancy Rate", value: "78%", change: "+6%", trend: "up" },
    { id: "rev", label: "Revenue Today", value: "$42.8k", change: "+12%", trend: "up" },
    { id: "pred", label: "Predicted Revenue", value: "$51.2k", change: "next 7d", trend: "neutral" },
  ];
}

const pricingByPeriod: Record<PricingPeriod, PricingPoint[]> = {
  daily: [
    { label: "Mon", current: 260, recommended: 268 },
    { label: "Tue", current: 255, recommended: 262 },
    { label: "Wed", current: 250, recommended: 258 },
    { label: "Thu", current: 270, recommended: 285 },
    { label: "Fri", current: 310, recommended: 328 },
    { label: "Sat", current: 340, recommended: 358 },
    { label: "Sun", current: 295, recommended: 305 },
  ],
  weekly: [
    { label: "W1", current: 265, recommended: 278 },
    { label: "W2", current: 272, recommended: 285 },
    { label: "W3", current: 288, recommended: 302 },
    { label: "W4", current: 305, recommended: 318 },
  ],
  monthly: [
    { label: "Jan", current: 240, recommended: 252 },
    { label: "Feb", current: 255, recommended: 268 },
    { label: "Mar", current: 270, recommended: 285 },
    { label: "Apr", current: 285, recommended: 298 },
    { label: "May", current: 295, recommended: 312 },
    { label: "Jun", current: 320, recommended: 338 },
  ],
};

export function fetchPricingSeries(period: PricingPeriod): PricingPoint[] {
  return pricingByPeriod[period];
}

export function fetchIntellirateRecommendations(): AiRecommendation[] {
  return [
    {
      id: "1",
      text: "Increase weekend price by 15% due to high demand and local festival overlap.",
      confidence: 92,
    },
    {
      id: "2",
      text: "Hold weekday rates: elasticity model shows minimal uplift past +3%.",
      confidence: 87,
    },
    {
      id: "3",
      text: "Suite inventory tight — consider +8% on premium room types for Thu–Sat.",
      confidence: 84,
    },
  ];
}

export interface DemandBar {
  label: string;
  demand: number;
}

export function fetchDemandInsights(): DemandBar[] {
  return [
    { label: "6a", demand: 12 },
    { label: "9a", demand: 45 },
    { label: "12p", demand: 62 },
    { label: "3p", demand: 38 },
    { label: "6p", demand: 71 },
    { label: "9p", demand: 55 },
  ];
}

export function fetchCompetitorTable(): CompetitorRow[] {
  return [
    { roomType: "Deluxe Lake View", yourPrice: 284, competitorAvg: 302 },
    { roomType: "Executive Suite", yourPrice: 420, competitorAvg: 398 },
    { roomType: "Family Villa", yourPrice: 560, competitorAvg: 545 },
    { roomType: "Presidential", yourPrice: 890, competitorAvg: 920 },
  ];
}

export function fetchIntellirateAlerts(): { id: string; type: "warning" | "surge"; message: string }[] {
  return [
    { id: "a1", type: "warning", message: "Low occupancy Tue–Wed: consider targeted promo codes." },
    { id: "a2", type: "surge", message: "Demand surge detected for Fri–Sat — AI pricing already adjusted." },
  ];
}
