export type PricingPeriod = "daily" | "weekly" | "monthly";
export type ChartRange = "24h" | "7d" | "30d";

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export interface PricingPoint {
  label: string;
  current: number;
  recommended: number;
}

export interface AiRecommendation {
  id: string;
  text: string;
  confidence: number;
}

export interface CompetitorRow {
  roomType: string;
  yourPrice: number;
  competitorAvg: number;
}

export interface ServicePriceRow {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  aiPrice: number;
  demandLevel: "Low" | "Medium" | "High" | "Surge";
  changePct: number;
  status: "Optimal" | "Underpriced" | "Overpriced";
}

export interface MarketIntelItem {
  id: string;
  label: string;
  value: string;
  impact: "increase" | "decrease" | "neutral";
  impactLabel: string;
}

export interface AiExplanation {
  id: string;
  text: string;
  confidence: number;
}
