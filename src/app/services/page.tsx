"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bell, Minus, RefreshCw, Wifi, WifiOff } from "lucide-react";
import {
  buildFallbackKuriftuRows,
  fetchAiExplanations,
  fetchDemandHeatmap,
  fetchMarketIntel,
  fetchServiceAlerts,
  fetchServicePriceHistory,
} from "@/lib/data/services";
import type { ChartRange, KuriftuServicePricingRow } from "@/lib/data/types";
import { DemandHeatmap } from "@/components/services/DemandHeatmap";
import { AiModeToggle } from "@/components/ui/AiModeToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { resortImages } from "@/lib/resortImages";
import { fetchKuriftuServicePricing } from "@/lib/pricing-api";
import { ServiceComparisonCard } from "@/components/services/ServiceComparisonCard";

const chart = {
  grid: "rgba(26, 46, 42, 0.1)",
  axis: "#5a6460",
  historical: "#1a2e2a",
  ai: "#8f6e45",
} as const;

function impactIcon(impact: "increase" | "decrease" | "neutral") {
  if (impact === "increase") return <ArrowUpRight className="h-4 w-4 text-secondary" />;
  if (impact === "decrease") return <ArrowDownRight className="h-4 w-4 text-amber-600" />;
  return <Minus className="h-4 w-4 text-muted" />;
}

function statusBadge(status: string) {
  if (status === "Optimal") return <Badge tone="secondary">Optimal</Badge>;
  if (status === "Underpriced") return <Badge tone="warn">Underpriced</Badge>;
  return <Badge tone="accent">Overpriced</Badge>;
}

function demandBadge(level: string) {
  const tone =
    level === "Surge" ? "surge" : level === "High" ? "accent" : level === "Medium" ? "default" : "default";
  return <Badge tone={tone as "surge" | "accent" | "default"}>{level}</Badge>;
}

function simulatedAiPrice(
  aiPrice: number,
  demandBoost: number,
  eventOn: boolean,
  occupancy: number,
): number {
  const d = 1 + (demandBoost / 100) * 0.35;
  const e = eventOn ? 1.08 : 1;
  const o = 1 + ((occupancy - 70) / 100) * 0.12;
  return Math.round(aiPrice * d * e * o);
}

export default function ServiceOptimizerPage() {
  const [range, setRange] = useState<ChartRange>("7d");
  const [aiMode, setAiMode] = useState(true);
  const [manualPct, setManualPct] = useState(0);
  const [demandBoost, setDemandBoost] = useState(0);
  const [eventOn, setEventOn] = useState(false);
  const [occupancy, setOccupancy] = useState(78);

  const [rows, setRows] = useState<KuriftuServicePricingRow[]>([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [liveApi, setLiveApi] = useState(false);
  const [confirmedPrices, setConfirmedPrices] = useState<Record<number, number>>({});

  const getServiceImage = (category: string) => {
  const imageMap: Record<string, string> = {
    "Spa": resortImages.spa,
    "Dining": resortImages.dining,
    "Boat Ride": resortImages.tropicalPool,
    "Room Types": resortImages.suite,
    "Wellness": resortImages.wellnessDetail,
    "Activities": resortImages.infinityPool,
    "Business": resortImages.lobby,
    "Family": resortImages.infinityPool,
  };
  return imageMap[category] || resortImages.spa;
};

const handleConfirmAiPrice = (serviceId: number, newPrice: number) => {
    setConfirmedPrices(prev => {
      const updated = {
        ...prev,
        [serviceId]: newPrice
      };
      
      // Save to localStorage for pricing page sync
      localStorage.setItem('confirmedPrices', JSON.stringify(updated));
      
      return updated;
    });
    
    // Update the service's published price in rows using numericId
    setRows(prev => prev.map(row => 
      row.numericId === serviceId 
        ? { ...row, publishedPrice: newPrice, status: "Optimal" }
        : row
    ));
  };

  const loadPricing = useCallback(async () => {
    setPricingLoading(true);
    setPricingError(null);
    try {
      const { services } = await fetchKuriftuServicePricing();
      setRows(services);
      setLiveApi(true);
    } catch (e) {
      setRows(buildFallbackKuriftuRows());
      setLiveApi(false);
      setPricingError(e instanceof Error ? e.message : "Pricing API unavailable");
    } finally {
      setPricingLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPricing();
  }, [loadPricing]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") void loadPricing();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loadPricing]);

  const history = useMemo(() => fetchServicePriceHistory(range), [range]);
  const intel = useMemo(() => fetchMarketIntel(), []);
  const explanations = useMemo(() => fetchAiExplanations(), []);
  const heatmap = useMemo(() => fetchDemandHeatmap(), []);
  const alerts = useMemo(() => fetchServiceAlerts(), []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ebe8e1_0%,#f2f0ea_40%,#f6f4ef_100%)] pb-16">
      <section className="relative min-h-[min(38vh,19rem)] overflow-hidden sm:min-h-[min(42vh,23rem)]">
        <Image
          src={resortImages.wellnessDetail}
          alt="Resort spa and wellness experience"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0d1412]/93 via-[#1a2e2a]/75 to-[#243d38]/48"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8dcc8]">Kuriftu · NEXORA</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Service Optimizer</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">
              AI-adjusted pricing for spa, dining, and experiences — with transparent rationale and live simulation,
              aligned to how Kuriftu runs F&B and wellness.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <AiModeToggle enabled={aiMode} onChange={setAiMode} onDark />
            {!aiMode ? (
              <label className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/90 backdrop-blur-md">
                <span className="whitespace-nowrap">Manual override</span>
                <input
                  type="number"
                  value={manualPct}
                  onChange={(e) => setManualPct(Number(e.target.value))}
                  className="w-24 rounded-lg border border-white/25 bg-white/90 px-2 py-1 text-primary"
                />
                <span>%</span>
              </label>
            ) : null}
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-8 max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
            liveApi
              ? "border-secondary/30 bg-secondary/5"
              : "border-amber-200/90 bg-amber-50/80"
          }`}
        >
          <div className="flex items-start gap-3">
            {liveApi ? (
              <Wifi className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden />
            ) : (
              <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
            )}
            <div>
              <p className="text-sm font-semibold text-primary">
                {liveApi ? "Live pricing engine" : "Demo fallback"}
              </p>
              <p className="text-xs text-muted">
                {liveApi
                  ? "Rates blend revenue-curve optimization with competitor signals from the smart-dynamic-pricing environment."
                  : pricingError
                    ? `${pricingError} — start the Flask API (see kuriftu-ai/backend).`
                    : "Connect the backend for elasticity-driven AI suggestions."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadPricing()}
            disabled={pricingLoading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-primary shadow-sm transition hover:border-primary/20 disabled:opacity-60 sm:self-center"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${pricingLoading ? "animate-spin" : ""}`} aria-hidden />
            Refresh rates
          </button>
        </div>

        <Card className="border-border/90 bg-card/95 backdrop-blur-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-primary">Resort service pricing</h2>
            <p className="text-sm text-muted">
              {liveApi
                ? "Guest-facing published rate vs model suggestion (Python /api/kuriftu/service-pricing)"
                : "Static preview — same layout as live API"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted">
                  <th className="pb-3 pr-4 font-semibold">Service</th>
                  <th className="pb-3 pr-4 font-semibold">Category</th>
                  <th className="pb-3 pr-4 font-semibold">Base</th>
                  <th className="pb-3 pr-4 font-semibold">Published</th>
                  <th className="pb-3 pr-4 font-semibold">AI suggested</th>
                  <th className="pb-3 pr-4 font-semibold">Simulated</th>
                  <th className="pb-3 pr-4 font-semibold">Demand</th>
                  <th className="pb-3 pr-4 font-semibold">Δ vs pub.</th>
                  <th className="pb-3 pr-4 font-semibold">Insight</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {pricingLoading && rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-muted">
                      Loading pricing…
                    </td>
                  </tr>
                ) : null}
                {rows.map((r) => {
                  const suggested = r.aiSuggestedPrice;
                  const effectiveAi = aiMode
                    ? simulatedAiPrice(suggested, demandBoost, eventOn, occupancy)
                    : Math.round(r.basePrice * (1 + manualPct / 100));
                  const changeVsPublished = (((effectiveAi - r.publishedPrice) / r.publishedPrice) * 100).toFixed(1);
                  return (
                    <tr key={r.id} className="border-b border-border/70 last:border-0">
                      <td className="py-3 pr-4 font-medium text-primary">{r.name}</td>
                      <td className="py-3 pr-4 text-muted">{r.category}</td>
                      <td className="py-3 pr-4 tabular-nums">${r.basePrice}</td>
                      <td className="py-3 pr-4 tabular-nums font-medium text-primary">${r.publishedPrice}</td>
                      <td className="py-3 pr-4 tabular-nums font-semibold text-accent">
                        ${suggested}
                        <span className="ml-1.5 text-[10px] font-normal text-muted">({r.confidence}%)</span>
                      </td>
                      <td className="py-3 pr-4 tabular-nums font-bold text-primary">${effectiveAi}</td>
                      <td className="py-3 pr-4">{demandBadge(r.demandLevel)}</td>
                      <td className="py-3 pr-4">
                        <span className={Number(changeVsPublished) < 0 ? "text-amber-700" : "text-secondary"}>
                          {Number(changeVsPublished) > 0 ? "+" : ""}
                          {changeVsPublished}%
                        </span>
                      </td>
                      <td className="max-w-[220px] py-3 pr-4 text-xs leading-snug text-muted" title={r.insight}>
                        {r.insight.length > 110 ? `${r.insight.slice(0, 107)}…` : r.insight}
                      </td>
                      <td className="py-3">{statusBadge(r.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="outline" className="!rounded-full !px-4 !py-2 !text-xs" href="/intellirate">
              Open IntelliRate to confirm AI rates
            </Button>
          </div>
        </Card>

        {/* Service Comparison Cards */}
        <Card className="border-border/90 bg-card/95 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-primary mb-2">AI Price Analysis & Confirmation</h2>
            <p className="text-sm text-muted">
              Detailed comparison analysis for each service with AI price recommendations. 
              Confirm AI-suggested prices to update the public pricing page.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((service) => {
              console.log('Services page - service row:', service);
              return (
              <ServiceComparisonCard
                key={service.numericId}
                service={{
                  id: service.numericId,
                  name: service.name,
                  category: service.category,
                  basePrice: service.basePrice,
                  publishedPrice: service.publishedPrice,
                  aiSuggestedPrice: service.aiSuggestedPrice,
                  confidence: service.confidence,
                  demandLevel: service.demandLevel,
                  status: service.status,
                  insight: service.insight,
                  image: getServiceImage(service.category)
                }}
                onConfirmAiPrice={handleConfirmAiPrice}
                isConfirmed={service.numericId in confirmedPrices}
              />
              );
            })}
          </div>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="border-border/90 bg-card/95 backdrop-blur-sm lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-primary">Real-time pricing</h2>
                <p className="text-sm text-muted">Historical vs AI-adjusted (aggregated index)</p>
              </div>
              <div className="flex rounded-xl border border-border bg-background p-1">
                {(["24h", "7d", "30d"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setRange(k)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      range === k ? "bg-card text-primary shadow-sm" : "text-muted hover:text-primary"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] min-h-[300px] min-w-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(26, 46, 42, 0.12)",
                      background: "#fcfaf6",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="historical"
                    name="Historical"
                    stroke={chart.historical}
                    strokeWidth={2.25}
                    dot={false}
                  />
                  <Line type="monotone" dataKey="ai" name="AI-adjusted" stroke={chart.ai} strokeWidth={2.25} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="overflow-hidden border-border/90 bg-card/95 p-0 backdrop-blur-sm">
            <div className="relative h-32 w-full shrink-0">
              <Image
                src={resortImages.wineLounge}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" aria-hidden />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-lg font-bold text-white">Market intelligence</h2>
                <p className="text-xs text-white/75">Signals ingested this hour</p>
              </div>
            </div>
            <ul className="space-y-3 p-5">
              {intel.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 rounded-xl border border-border/80 bg-background/80 p-4"
                >
                  <div className="mt-0.5">{impactIcon(item.impact)}</div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">{item.label}</p>
                    <p className="mt-1 text-lg font-bold text-primary">{item.value}</p>
                    <p className="text-xs font-medium text-muted">{item.impactLabel}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-border/90 bg-card/95 backdrop-blur-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-primary">AI decision explanation</h2>
                <p className="text-sm text-muted">Why prices moved — with confidence scores</p>
              </div>
              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl border border-border sm:h-24 sm:w-36">
                <Image src={resortImages.dining} alt="" fill className="object-cover" sizes="144px" />
              </div>
            </div>
            <ul className="mt-6 space-y-4">
              {explanations.map((ex) => (
                <li
                  key={ex.id}
                  className="rounded-xl border border-border/80 bg-[linear-gradient(145deg,#fcfaf6_0%,#f0ebe3_100%)] p-4"
                >
                  <p className="text-sm text-primary">{ex.text}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted">Model confidence</span>
                    <span className="font-bold text-accent">{ex.confidence}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-border/90 bg-card/95 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-primary">Demand heatmap</h2>
            <p className="text-sm text-muted">Day × time slot — peak demand highlighted</p>
            <div className="mt-6">
              <DemandHeatmap data={heatmap} />
            </div>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-border/90 bg-card/95 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-primary">Simulation tool</h2>
            <p className="text-sm text-muted">Adjust drivers — simulated column updates instantly</p>
            <div className="mt-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium text-primary">
                  <span>Demand shock</span>
                  <span>{demandBoost >= 0 ? "+" : ""}
                  {demandBoost}%</span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={40}
                  value={demandBoost}
                  onChange={(e) => setDemandBoost(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                <input
                  type="checkbox"
                  checked={eventOn}
                  onChange={(e) => setEventOn(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-semibold text-primary">Major local event</p>
                  <p className="text-xs text-muted">Applies +8% uplift in simulation</p>
                </div>
              </label>
              <div>
                <div className="flex justify-between text-sm font-medium text-primary">
                  <span>Property occupancy</span>
                  <span>{occupancy}%</span>
                </div>
                <input
                  type="range"
                  min={45}
                  max={98}
                  value={occupancy}
                  onChange={(e) => setOccupancy(Number(e.target.value))}
                  className="mt-2 w-full accent-secondary"
                />
              </div>
            </div>
          </Card>

          <Card className="border-border/90 bg-card/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-secondary" />
              <h2 className="text-lg font-bold text-primary">Alerts</h2>
            </div>
            <ul className="mt-6 space-y-3">
              {alerts.map((a) => (
                <li key={a.id} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-primary">
                  {a.message}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-muted">
              Webhook-ready: POST /api/v1/nexora/alerts/subscribe — structure matches production envelope.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
