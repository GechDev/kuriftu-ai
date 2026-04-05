import type {
  AiExplanation,
  ChartRange,
  KuriftuServicePricingRow,
  MarketIntelItem,
  ServicePriceRow,
} from "./types";

/** Mock API: GET /api/v1/nexora/services/pricing */
/** Offline shape when the Python pricing API is unreachable */
export function buildFallbackKuriftuRows(): KuriftuServicePricingRow[] {
  return fetchServicePricingRows().map((r) => {
    const publishedPrice = Math.round(r.basePrice * 0.94);
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      basePrice: r.basePrice,
      publishedPrice,
      aiSuggestedPrice: r.aiPrice,
      demandLevel: r.demandLevel,
      demandIndex: r.demandLevel === "Surge" ? 90 : r.demandLevel === "High" ? 72 : r.demandLevel === "Medium" ? 48 : 28,
      changePctPublishedVsBase: ((publishedPrice - r.basePrice) / r.basePrice) * 100,
      changePctSuggestedVsPublished: ((r.aiPrice - publishedPrice) / publishedPrice) * 100,
      status: r.status,
      insight:
        r.demandLevel === "Surge"
          ? "Simulated surge window — uplift recommended on experiences and spa."
          : "Offline demo — start the Node API and sign in as staff for database-backed pricing.",
      confidence: 82,
      competitorAvg: Math.round(r.basePrice * 1.045 * 100) / 100,
    };
  });
}

export function fetchServicePricingRows(): ServicePriceRow[] {
  return [
    {
      id: "spa",
      name: "Signature Spa Ritual (90m)",
      category: "Spa",
      basePrice: 120,
      aiPrice: 144,
      demandLevel: "High",
      changePct: 20,
      status: "Optimal",
    },
    {
      id: "dine",
      name: "Lakehouse Tasting Menu",
      category: "Dining",
      basePrice: 95,
      aiPrice: 88,
      demandLevel: "Medium",
      changePct: -7.4,
      status: "Overpriced",
    },
    {
      id: "boat",
      name: "Sunset Boat Ride",
      category: "Boat Ride",
      basePrice: 65,
      aiPrice: 78,
      demandLevel: "Surge",
      changePct: 20,
      status: "Optimal",
    },
    {
      id: "deluxe",
      name: "Deluxe Lake View",
      category: "Room Types",
      basePrice: 260,
      aiPrice: 284,
      demandLevel: "High",
      changePct: 9.2,
      status: "Underpriced",
    },
    {
      id: "suite",
      name: "Executive Suite",
      category: "Room Types",
      basePrice: 400,
      aiPrice: 420,
      demandLevel: "Medium",
      changePct: 5,
      status: "Optimal",
    },
  ];
}

const serviceHistory: Record<ChartRange, { t: string; historical: number; ai: number }[]> = {
  "24h": [
    { t: "00:00", historical: 118, ai: 120 },
    { t: "04:00", historical: 118, ai: 119 },
    { t: "08:00", historical: 122, ai: 128 },
    { t: "12:00", historical: 125, ai: 132 },
    { t: "16:00", historical: 128, ai: 138 },
    { t: "20:00", historical: 130, ai: 145 },
  ],
  "7d": [
    { t: "Mon", historical: 115, ai: 122 },
    { t: "Tue", historical: 118, ai: 124 },
    { t: "Wed", historical: 120, ai: 128 },
    { t: "Thu", historical: 125, ai: 135 },
    { t: "Fri", historical: 132, ai: 148 },
    { t: "Sat", historical: 138, ai: 155 },
    { t: "Sun", historical: 128, ai: 140 },
  ],
  "30d": [
    { t: "W1", historical: 118, ai: 125 },
    { t: "W2", historical: 122, ai: 132 },
    { t: "W3", historical: 128, ai: 142 },
    { t: "W4", historical: 135, ai: 150 },
  ],
};

export function fetchServicePriceHistory(range: ChartRange) {
  return serviceHistory[range];
}

export function fetchMarketIntel(): MarketIntelItem[] {
  return [
    { id: "occ", label: "Occupancy Rate", value: "78%", impact: "increase", impactLabel: "+6% vs last week" },
    { id: "comp", label: "Competitor Pricing", value: "−4.2% avg", impact: "decrease", impactLabel: "Market softening" },
    { id: "season", label: "Seasonal Trends", value: "Peak shoulder", impact: "increase", impactLabel: "Upside 8–12%" },
    { id: "events", label: "Local Events", value: "2 major", impact: "increase", impactLabel: "Weekend lift" },
  ];
}

export function fetchAiExplanations(): AiExplanation[] {
  return [
    { id: "e1", text: "High weekend demand → spa and experiences priced +20% to capture willingness-to-pay.", confidence: 91 },
    { id: "e2", text: "Competitor prices dropped on dining bundles → adjusted tasting menu to stay competitive.", confidence: 86 },
    { id: "e3", text: "Boat rides show surge pattern Fri 5–8pm → time-based uplift applied.", confidence: 88 },
  ];
}

/** 7 days × 4 time slots — values 0–100 for heat intensity (deterministic for SSR) */
export function fetchDemandHeatmap(): { day: string; slot: string; value: number }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = ["6–10a", "10a–2p", "2–6p", "6–10p"];
  const seed: Record<string, number> = {
    "Mon-6–10a": 22,
    "Mon-10a–2p": 35,
    "Fri-6–10p": 92,
    "Sat-6–10p": 98,
    "Sat-10a–2p": 78,
    "Sun-10a–2p": 65,
  };
  const out: { day: string; slot: string; value: number }[] = [];
  let i = 0;
  for (const day of days) {
    for (const slot of slots) {
      const key = `${day}-${slot}`;
      const fallback = 32 + ((i * 7) % 41);
      i += 1;
      out.push({ day, slot, value: seed[key] ?? fallback });
    }
  }
  return out;
}

export function fetchServiceAlerts(): { id: string; message: string }[] {
  return [
    { id: "s1", message: "Spa demand surge predicted this weekend — consider staffing + inventory." },
    { id: "s2", message: "Deluxe rooms underpriced vs competitors — AI uplift recommended." },
  ];
}
