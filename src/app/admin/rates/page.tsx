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
import { confirmKuriftuAiPrices, fetchAdminPricingPreview } from "@/lib/pricing-api";
import { useAuth } from "@/contexts/auth-context";
import { ServiceComparisonCard } from "@/components/services/ServiceComparisonCard";
import { StaffSubnav } from "@/components/admin/StaffSubnav";

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

function SectionHeader({
  eyebrow,
  title,
  description,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{eyebrow}</p>
      ) : null}
      <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-primary sm:text-2xl">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p> : null}
    </div>
  );
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
  const { token } = useAuth();
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

  const getServiceImage = (category: string) => {
    const imageMap: Record<string, string> = {
      Spa: resortImages.spa,
      Dining: resortImages.dining,
      "Boat Ride": resortImages.tropicalPool,
      "Room Types": resortImages.suite,
      Wellness: resortImages.wellnessDetail,
      Activities: resortImages.infinityPool,
      Business: resortImages.lobby,
      Family: resortImages.infinityPool,
      dining: resortImages.dining,
      spa: resortImages.spa,
      pool: resortImages.tropicalPool,
    };
    return imageMap[category] || resortImages.spa;
  };

  const loadPricing = useCallback(async () => {
    setPricingLoading(true);
    setPricingError(null);
    try {
      const { services } = await fetchAdminPricingPreview(token);
      setRows(services);
      setLiveApi(true);
    } catch (e) {
      setRows(buildFallbackKuriftuRows());
      setLiveApi(false);
      setPricingError(e instanceof Error ? e.message : "Pricing API unavailable");
    } finally {
      setPricingLoading(false);
    }
  }, [token]);

  const handleConfirmOne = useCallback(
    async (serviceId: string) => {
      await confirmKuriftuAiPrices(token, { applyAll: false, serviceIds: [serviceId] });
      await loadPricing();
    },
    [token, loadPricing],
  );

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

  const computedRows = useMemo(() => {
    return rows.map((r) => {
      const suggested = r.aiSuggestedPrice;
      const effectiveAi = aiMode
        ? simulatedAiPrice(suggested, demandBoost, eventOn, occupancy)
        : Math.round(r.basePrice * (1 + manualPct / 100));
      const changeVsPublished = (((effectiveAi - r.publishedPrice) / r.publishedPrice) * 100).toFixed(1);
      return { row: r, suggested, effectiveAi, changeVsPublished };
    });
  }, [rows, aiMode, demandBoost, eventOn, occupancy, manualPct]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#e8e4dc_0%,#f0ede6_38%,#f7f5f0_100%)] pb-16">
      <section className="relative min-h-[min(52vh,26rem)] overflow-hidden sm:min-h-[min(56vh,30rem)] lg:min-h-[min(60vh,32rem)]">
        <Image
          src={resortImages.wellnessDetail}
          alt="Resort spa and wellness experience"
          fill
          priority
          className="object-cover object-[center_42%] sm:object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#070c0b]/95 via-[#122520]/82 to-[#1e3d36]/55"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_70%_0%,rgba(232,220,200,0.14),transparent_55%)]" aria-hidden />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 pt-6 pb-12 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
          <StaffSubnav segment="Experience pricing" variant="onDark" />
          <div className="mt-8 flex flex-col gap-10 lg:mt-10 lg:flex-row lg:items-end lg:justify-between lg:gap-14">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#e8dcc8]/95">
                Kuriftu · NEXORA
              </p>
              <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-[-0.02em] text-white sm:text-[2.5rem] lg:text-[2.75rem]">
                Experience pricing
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/78 sm:text-base">
                Model-suggested rates for spa, dining, and on-property experiences. Confirm to sync guest-facing
                prices in the database and on the public catalog.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md">
                  Staff workspace
                </span>
                <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md">
                  AI-assisted
                </span>
                <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md">
                  Live catalog sync
                </span>
              </div>
            </div>
            <div className="w-full shrink-0 lg:max-w-[22rem] xl:max-w-[24rem]">
              <div className="rounded-2xl border border-white/18 bg-white/[0.09] p-5 shadow-[0_28px_90px_-28px_rgba(0,0,0,0.65)] backdrop-blur-2xl ring-1 ring-white/10 sm:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Pricing mode</p>
                <div className="mt-4 space-y-4">
                  <AiModeToggle enabled={aiMode} onChange={setAiMode} onDark />
                  {!aiMode ? (
                    <label className="flex flex-wrap items-center gap-2 rounded-xl border border-white/18 bg-black/20 px-3 py-2.5 text-sm text-white/92 backdrop-blur-md">
                      <span className="whitespace-nowrap font-medium">Manual override</span>
                      <input
                        type="number"
                        value={manualPct}
                        onChange={(e) => setManualPct(Number(e.target.value))}
                        className="min-w-[5rem] flex-1 rounded-lg border border-white/22 bg-white/95 px-2.5 py-1.5 text-sm font-medium text-primary shadow-inner"
                      />
                      <span className="text-white/70">%</span>
                    </label>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-6 max-w-7xl space-y-8 px-4 py-8 sm:-mt-8 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col gap-4 rounded-2xl border px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 ${
            liveApi
              ? "border-secondary/25 bg-[linear-gradient(135deg,rgba(143,110,69,0.08)_0%,rgba(255,255,255,0.65)_100%)]"
              : "border-amber-200/80 bg-[linear-gradient(135deg,rgba(254,243,199,0.5)_0%,rgba(255,255,255,0.75)_100%)]"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                liveApi ? "bg-secondary/15 text-secondary" : "bg-amber-100 text-amber-800"
              }`}
            >
              {liveApi ? <Wifi className="h-5 w-5" aria-hidden /> : <WifiOff className="h-5 w-5" aria-hidden />}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold tracking-tight text-primary">
                {liveApi ? "Live pricing engine" : "Offline preview"}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                {liveApi
                  ? "Anchors, competitor blend, and elasticity — confirmations persist to the database."
                  : pricingError
                    ? `${pricingError} — start the Node API (port 4000) and sign in as manager or admin.`
                    : "Connect the backend for full AI-driven suggestions."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadPricing()}
            disabled={pricingLoading}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-border/90 bg-card/95 px-5 py-2.5 text-[13px] font-semibold text-primary shadow-sm transition hover:border-primary/25 hover:bg-card disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${pricingLoading ? "animate-spin" : ""}`} aria-hidden />
            Refresh rates
          </button>
        </div>

        <Card className="overflow-hidden border-border/80 bg-card/95 shadow-[0_24px_60px_-32px_rgba(26,46,42,0.35)] backdrop-blur-md">
          <div className="border-b border-border/60 bg-gradient-to-b from-background/80 to-transparent px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                eyebrow="Catalog"
                title="Resort service pricing"
                description={
                  liveApi
                    ? "Published vs model suggestion — endpoint GET /api/pricing/admin/preview"
                    : "Static preview with the same layout as the live API"
                }
              />
            </div>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-background/40 text-[11px] uppercase tracking-[0.06em] text-muted">
                  <th className="px-4 py-3.5 pl-6 font-semibold sm:pl-8">Service</th>
                  <th className="px-4 py-3.5 font-semibold">Category</th>
                  <th className="px-4 py-3.5 font-semibold">Base</th>
                  <th className="px-4 py-3.5 font-semibold">Published</th>
                  <th className="px-4 py-3.5 font-semibold">AI suggested</th>
                  <th className="px-4 py-3.5 font-semibold">Simulated</th>
                  <th className="px-4 py-3.5 font-semibold">Demand</th>
                  <th className="px-4 py-3.5 font-semibold">Δ vs pub.</th>
                  <th className="px-4 py-3.5 font-semibold">Insight</th>
                  <th className="px-4 py-3.5 pr-6 font-semibold sm:pr-8">Status</th>
                </tr>
              </thead>
              <tbody>
                {pricingLoading && rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-14 text-center text-muted sm:px-8">
                      Loading pricing…
                    </td>
                  </tr>
                ) : null}
                {computedRows.map(({ row: r, suggested, effectiveAi, changeVsPublished }) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/50 transition-colors last:border-0 hover:bg-background/50"
                  >
                    <td className="px-4 py-3.5 pl-6 font-medium text-primary sm:pl-8">{r.name}</td>
                    <td className="px-4 py-3.5 text-muted">{r.category}</td>
                    <td className="px-4 py-3.5 tabular-nums">${r.basePrice}</td>
                    <td className="px-4 py-3.5 tabular-nums font-medium text-primary">${r.publishedPrice}</td>
                    <td className="px-4 py-3.5 tabular-nums font-semibold text-accent">
                      ${suggested}
                      <span className="ml-1.5 text-[10px] font-normal text-muted">({r.confidence}%)</span>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums font-bold text-primary">${effectiveAi}</td>
                    <td className="px-4 py-3.5">{demandBadge(r.demandLevel)}</td>
                    <td className="px-4 py-3.5">
                      <span className={Number(changeVsPublished) < 0 ? "text-amber-700" : "text-secondary"}>
                        {Number(changeVsPublished) > 0 ? "+" : ""}
                        {changeVsPublished}%
                      </span>
                    </td>
                    <td className="max-w-[220px] px-4 py-3.5 text-xs leading-snug text-muted" title={r.insight}>
                      {r.insight.length > 110 ? `${r.insight.slice(0, 107)}…` : r.insight}
                    </td>
                    <td className="px-4 py-3.5 pr-6 sm:pr-8">{statusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-border/60 md:hidden">
            {pricingLoading && rows.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted sm:px-6">Loading pricing…</div>
            ) : null}
            {computedRows.map(({ row: r, suggested, effectiveAi, changeVsPublished }) => (
              <div key={r.id} className="space-y-3 px-4 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight text-primary">{r.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{r.category}</p>
                  </div>
                  {statusBadge(r.status)}
                </div>
                <div className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Published</p>
                    <p className="mt-0.5 font-medium tabular-nums text-primary">${r.publishedPrice}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">AI</p>
                    <p className="mt-0.5 font-semibold tabular-nums text-accent">
                      ${suggested}
                      <span className="ml-1 text-[10px] font-normal text-muted">({r.confidence}%)</span>
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Simulated</p>
                    <p className="mt-0.5 font-bold tabular-nums text-primary">${effectiveAi}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {demandBadge(r.demandLevel)}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                      Number(changeVsPublished) < 0 ? "bg-amber-100 text-amber-900" : "bg-secondary/15 text-secondary"
                    }`}
                  >
                    {Number(changeVsPublished) > 0 ? "+" : ""}
                    {changeVsPublished}% vs pub.
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted">{r.insight}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border/50 bg-background/30 px-4 py-4 sm:px-6">
            <Button variant="outline" className="!rounded-full !px-5 !py-2.5 !text-[13px]" href="/admin/revenue">
              Revenue intelligence
            </Button>
          </div>
        </Card>

        {/* Service Comparison Cards */}
        <Card className="border-border/80 bg-card/95 shadow-[0_20px_50px_-28px_rgba(26,46,42,0.3)] backdrop-blur-md">
          <SectionHeader
            className="mb-8"
            eyebrow="Confirmation"
            title="AI price analysis"
            description="Per-service comparison and one-tap confirm to push suggested rates to the public catalog."
          />
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((service) => (
              <ServiceComparisonCard
                key={service.id}
                service={{
                  id: service.id,
                  name: service.name,
                  category: service.category,
                  basePrice: service.basePrice,
                  publishedPrice: service.publishedPrice,
                  aiSuggestedPrice: service.aiSuggestedPrice,
                  confidence: service.confidence,
                  demandLevel: service.demandLevel,
                  status: service.status,
                  insight: service.insight,
                  image: service.imageUrl ?? getServiceImage(service.category),
                }}
                onConfirmAiPrice={handleConfirmOne}
                isConfirmed={
                  Math.abs(service.publishedPrice - service.aiSuggestedPrice) < 0.02
                }
              />
            ))}
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
