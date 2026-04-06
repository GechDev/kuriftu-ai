"use client";

import { motion, useScroll, useTransform } from "framer-motion";
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
import { ArrowDownRight, ArrowUpRight, Bell, Minus, RefreshCw, Wifi, WifiOff, CheckCircle } from "lucide-react";
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
import { StaffSubnav } from "@/components/admin/StaffSubnav";

const chart = {
  grid: "rgba(255,255,255,0.08)",
  axis: "#a0a8a5",
  historical: "#d4af37",
  ai: "#6B21E5",
} as const;

function impactIcon(impact: "increase" | "decrease" | "neutral") {
  if (impact === "increase") return <ArrowUpRight className="h-4 w-4 text-gold-400" />;
  if (impact === "decrease") return <ArrowDownRight className="h-4 w-4 text-amber-500" />;
  return <Minus className="h-4 w-4 text-white/40" />;
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
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">{eyebrow}</p>
      )}
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">{description}</p>}
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

// Apple-inspired horizontal service card
function ServiceCardHorizontal({
  service,
  onConfirm,
  isConfirmed,
}: {
  service: KuriftuServicePricingRow & { image: string };
  onConfirm: (id: string) => void;
  isConfirmed: boolean;
}) {
  const changePercent = ((service.aiSuggestedPrice - service.publishedPrice) / service.publishedPrice) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-2xl border-2 border-white/30 bg-black/60 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-gold-400 hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image section - left */}
        <div className="relative h-48 w-full sm:h-auto sm:w-48 md:w-56 overflow-hidden">
          <Image
            src={service.image}
            alt={service.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent sm:bg-gradient-to-l" />
        </div>

        {/* Content section - right */}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-white">{service.name}</h3>
              <p className="text-xs text-white/50 uppercase tracking-wide">{service.category}</p>
            </div>
            {statusBadge(service.status)}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">Published</p>
              <p className="text-xl font-bold text-white">${service.publishedPrice}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">AI Suggested</p>
              <p className="text-xl font-bold text-gold-400">${service.aiSuggestedPrice}</p>
              <p className="text-[10px] text-white/40">Confidence {service.confidence}%</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">Demand</p>
              <div className="mt-1">{demandBadge(service.demandLevel)}</div>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-white/60 line-clamp-2">{service.insight}</p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-bold tracking-wide ${
                  changePercent > 0 ? "text-gold-400" : changePercent < 0 ? "text-amber-500" : "text-white/50"
                }`}
              >
                {changePercent > 0 ? "+" : ""}
                {changePercent.toFixed(1)}% vs published original
              </span>
            </div>
            <button
              onClick={() => onConfirm(service.id)}
              disabled={isConfirmed}
              className={`group/btn relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full py-2 px-5 text-sm font-bold tracking-wider transition-all duration-500 ${
                isConfirmed
                  ? "bg-white/5 border border-green-500/30 text-green-400 cursor-default"
                  : "bg-transparent text-white border-2 border-white hover:scale-[1.02] hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-95"
              }`}
            >
              {!isConfirmed && (
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out group-hover/btn:translate-x-[100%]" />
              )}
              {isConfirmed ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirmed
                </>
              ) : (
                <span className="relative z-10">Apply AI Price</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
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

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const getServiceImage = (category: string) => {
    const imageMap: Record<string, string> = {
      // Use diverse images to avoid repetition
      Spa: resortImages.spa,
      Dining: resortImages.dining,
      "Boat Ride": resortImages.lagoon,
      "Room Types": resortImages.penthouseSuite,
      Wellness: resortImages.wellnessDetail,
      Activities: resortImages.infinityPool,
      Business: resortImages.lobby,
      Family: resortImages.familySuite,
      "Fine Dining": resortImages.wineLounge,
 "Pool & Recreation": resortImages.tropicalPool,
      "Luxury Suite": resortImages.lakeVilla,
      "Garden View": resortImages.resortSpaGarden,
      // Lowercase fallbacks
      dining: resortImages.dining,
      spa: resortImages.spa,
      pool: resortImages.tropicalPool,
      wellness: resortImages.wellnessDetail,
      activities: resortImages.infinityPool,
      business: resortImages.lobby,
      family: resortImages.familySuite,
    };
    // Return a random image if no match found to avoid repetition
    const fallbackImages = [resortImages.spa, resortImages.dining, resortImages.infinityPool, resortImages.lagoon, resortImages.wellnessDetail];
    return imageMap[category] || fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
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
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a1210] to-[#0a1210]">
      {/* Hero section */}
      <section className="relative min-h-[min(50vh,24rem)] overflow-hidden sm:min-h-[min(54vh,28rem)] lg:min-h-[min(56vh,30rem)]">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={resortImages.wellnessDetail}
            alt="Resort spa and wellness"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(212,175,55,0.12),transparent_60%)]" />

        <div className="relative z-10 mx-auto flex max-w-[96%] flex-col px-4 pt-6 pb-12 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
          <StaffSubnav segment="Experience pricing" variant="onDark" />
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-400/90">
                Kuriftu · NEXORA
              </p>
              <h1 className="mt-4 text-[1.86rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-[2.22rem] lg:text-[2.42rem] xl:text-[2.56rem]">
                Experience pricing
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-base">
                Model-suggested rates for spa, dining, and on-property experiences. Confirm to sync guest-facing
                prices in the database and on the public catalog.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md">
                  Staff workspace
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md">
                  AI-assisted
                </span>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-md">
                  Live catalog sync
                </span>
              </div>
            </div>
            <div className="w-full shrink-0 lg:max-w-[21rem] xl:max-w-[22.5rem]">
              <div className="rounded-2xl border border-white/15 bg-black/40 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400/70">Pricing mode</p>
                <div className="mt-4 space-y-4">
                  <AiModeToggle enabled={aiMode} onChange={setAiMode} onDark />
                  {!aiMode && (
                    <label className="flex flex-wrap items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white backdrop-blur-md">
                      <span className="whitespace-nowrap font-medium">Manual override</span>
                      <input
                        type="number"
                        value={manualPct}
                        onChange={(e) => setManualPct(Number(e.target.value))}
                        className="min-w-[5rem] flex-1 rounded-lg border border-white/20 bg-white px-2.5 py-1.5 text-sm font-medium text-black shadow-inner"
                      />
                      <span className="text-white/70">%</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-6 max-w-[96%] space-y-8 px-4 py-8 sm:-mt-8 sm:px-6 lg:px-8">
        {/* API Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col gap-4 rounded-2xl border px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 ${
            liveApi
              ? "border-gold-400/30 bg-gradient-to-r from-black/60 to-black/40"
              : "border-amber-500/30 bg-gradient-to-r from-black/60 to-black/40"
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                liveApi ? "bg-gold-400/20 text-gold-400" : "bg-amber-500/20 text-amber-500"
              }`}
            >
              {liveApi ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold tracking-tight text-white">
                {liveApi ? "Live pricing engine" : "Offline preview"}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-white/60">
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
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/50 px-5 py-2.5 text-[13px] font-semibold text-white transition hover:border-gold-400/50 hover:bg-black/70 disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${pricingLoading ? "animate-spin" : ""}`} />
            Refresh rates
          </button>
        </motion.div>

        {/* Horizontal Service Cards - Apple/Amazon inspired */}
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Confirmation"
            title="AI price analysis"
            description="Review AI-suggested rates and apply with one click"
          />
          {pricingLoading && rows.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-12 text-center text-white/60">
              Loading pricing data...
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((service) => (
                <ServiceCardHorizontal
                  key={service.id}
                  service={{
                    ...service,
                    image: service.imageUrl ?? getServiceImage(service.category),
                  }}
                  onConfirm={handleConfirmOne}
                  isConfirmed={Math.abs(service.publishedPrice - service.aiSuggestedPrice) < 0.02}
                />
              ))}
            </div>
          )}
        </div>

        {/* Professional Catalog Table */}
        <Card className="border-white/10 bg-black backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="border-b border-white/10 bg-gradient-to-b from-black to-black px-4 py-5 sm:px-6 sm:py-6">
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

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block bg-black">
            <table className="w-full min-w-[960px] text-left text-sm border-collapse border border-white/20">
              <thead>
                <tr className="bg-white/10 text-[12px] uppercase tracking-[0.06em] text-white">
                  <th className="px-4 py-3.5 pl-6 font-bold sm:pl-8 border border-white/20">Service</th>
                  <th className="px-4 py-3.5 font-bold border border-white/20">Category</th>
                  <th className="px-4 py-3.5 font-bold border border-white/20">Base</th>
                  <th className="px-4 py-3.5 font-bold border border-white/20">Published</th>
                  <th className="px-4 py-3.5 font-bold border border-white/20">AI suggested</th>
                  <th className="px-4 py-3.5 font-bold border border-white/20">Simulated</th>
                  <th className="px-4 py-3.5 font-bold border border-white/20">Demand</th>
                  <th className="px-4 py-3.5 font-bold border border-white/20">Δ vs pub.</th>
                  <th className="px-4 py-3.5 font-bold border border-white/20">Insight</th>
                  <th className="px-4 py-3.5 pr-6 font-bold sm:pr-8 border border-white/20">Status</th>
                </tr>
              </thead>
              <tbody className="bg-black">
                {pricingLoading && rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-14 text-center text-white/60 bg-black sm:px-8 border border-white/20">
                      Loading pricing…
                    </td>
                  </tr>
                ) : null}
                {computedRows.map(({ row: r, suggested, effectiveAi, changeVsPublished }, index) => (
                  <tr
                    key={r.id}
                    className={`transition-colors hover:bg-white/10 ${
                      index % 2 === 0 
                        ? 'bg-black' 
                        : 'bg-black/80'
                    }`}
                  >
                    <td className="px-4 py-3.5 pl-6 font-medium text-white sm:pl-8 border border-white/20">{r.name}</td>
                    <td className="px-4 py-3.5 text-white/70 border border-white/20">{r.category}</td>
                    <td className="px-4 py-3.5 tabular-nums text-white/70 border border-white/20">${r.basePrice}</td>
                    <td className="px-4 py-3.5 tabular-nums font-medium text-white border border-white/20">${r.publishedPrice}</td>
                    <td className="px-4 py-3.5 tabular-nums font-semibold text-gold-400 border border-white/20">
                      ${suggested}
                      <span className="ml-1.5 text-[10px] font-normal text-white/50">({r.confidence}%)</span>
                    </td>
                    <td className="px-4 py-3.5 tabular-nums font-bold text-white border border-white/20">${effectiveAi}</td>
                    <td className="px-4 py-3.5 border border-white/20">{demandBadge(r.demandLevel)}</td>
                    <td className="px-4 py-3.5 border border-white/20">
                      <span className={Number(changeVsPublished) < 0 ? "text-amber-400" : "text-gold-400"}>
                        {Number(changeVsPublished) > 0 ? "+" : ""}
                        {changeVsPublished}%
                      </span>
                    </td>
                    <td className="min-w-[320px] px-4 py-3.5 text-xs leading-snug text-white/60 border border-white/20" title={r.insight}>
                      {r.insight}
                    </td>
                    <td className="px-4 py-3.5 pr-6 sm:pr-8 border border-white/20">{statusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Table View */}
          <div className="divide-y divide-white/10 bg-black md:hidden">
            {pricingLoading && rows.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-white/60 bg-black sm:px-6">Loading pricing…</div>
            ) : null}
            {computedRows.map(({ row: r, suggested, effectiveAi, changeVsPublished }, index) => (
              <div key={r.id} className={`space-y-3 px-4 py-5 sm:px-6 ${
                index % 2 === 0 
                  ? 'bg-black border-b border-white/5' 
                  : 'bg-black/80 border-b border-white/8'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{r.name}</p>
                    <p className="mt-0.5 text-xs text-white/60">{r.category}</p>
                  </div>
                  {statusBadge(r.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Published</p>
                    <p className="mt-0.5 font-medium text-white">${r.publishedPrice}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">AI</p>
                    <p className="mt-0.5 font-semibold text-gold-400">
                      ${suggested}
                      <span className="ml-1 text-[10px] font-normal text-white/50">({r.confidence}%)</span>
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Simulated</p>
                    <p className="mt-0.5 font-bold text-white">${effectiveAi}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {demandBadge(r.demandLevel)}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${
                      Number(changeVsPublished) < 0
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-gold-400/20 text-gold-400"
                    }`}
                  >
                    {Number(changeVsPublished) > 0 ? "+" : ""}
                    {changeVsPublished}% vs pub.
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-white/60">{r.insight}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 bg-black px-4 py-4 sm:px-6">
            <Button variant="outline" className="!rounded-full !px-5 !py-2.5 !text-[13px] border-white/20 text-white hover:border-gold-400 hover:text-gold-400">
              Revenue intelligence
            </Button>
          </div>
        </Card>

        {/* Rest of the page remains the same as before, but ensure dark backgrounds */}
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Real-time pricing</h2>
                <p className="text-sm text-white/60">Historical vs AI-adjusted (aggregated index)</p>
              </div>
              <div className="flex rounded-xl border border-white/10 bg-black/50 p-1">
                {(["24h", "7d", "30d"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setRange(k)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      range === k
                        ? "bg-gold-400/20 text-gold-400 shadow-sm"
                        : "text-white/60 hover:text-white"
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
                      border: "1px solid rgba(212,175,55,0.3)",
                      background: "#0a1210",
                      color: "white",
                    }}
                    labelStyle={{ color: "#d4af37" }}
                  />
                  <Legend wrapperStyle={{ color: "white" }} />
                  <Line
                    type="monotone"
                    dataKey="historical"
                    name="Historical"
                    stroke={chart.historical}
                    strokeWidth={2.25}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ai"
                    name="AI-adjusted"
                    stroke={chart.ai}
                    strokeWidth={2.25}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl p-0">
            <div className="relative h-32 w-full shrink-0">
              <Image
                src={resortImages.wineLounge}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-lg font-bold text-white">Market intelligence</h2>
                <p className="text-xs text-white/60">Signals ingested this hour</p>
              </div>
            </div>
            <ul className="space-y-3 p-5">
              {intel.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 rounded-xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="mt-0.5">{impactIcon(item.impact)}</div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-white/50">{item.label}</p>
                    <p className="mt-1 text-lg font-bold text-white">{item.value}</p>
                    <p className="text-xs font-medium text-white/60">{item.impactLabel}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">AI decision explanation</h2>
                <p className="text-sm text-white/60">Why prices moved — with confidence scores</p>
              </div>
              <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 sm:h-24 sm:w-36">
                <Image src={resortImages.dining} alt="" fill className="object-cover" sizes="144px" />
              </div>
            </div>
            <ul className="mt-6 space-y-4">
              {explanations.map((ex, idx) => (
                <motion.li
                  key={ex.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-xl border border-white/10 bg-black/30 p-4"
                >
                  <p className="text-sm text-white/90">{ex.text}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-white/50">Model confidence</span>
                    <span className="font-bold text-gold-400">{ex.confidence}%</span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
            <h2 className="text-lg font-bold text-white">Demand heatmap</h2>
            <p className="text-sm text-white/60">Day × time slot — peak demand highlighted</p>
            <div className="mt-6">
              <DemandHeatmap data={heatmap} />
            </div>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
            <h2 className="text-lg font-bold text-white">Simulation tool</h2>
            <p className="text-sm text-white/60">Adjust drivers — simulated column updates instantly</p>
            <div className="mt-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium text-white">
                  <span>Demand shock</span>
                  <span className="text-gold-400">{demandBoost >= 0 ? "+" : ""}{demandBoost}%</span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={40}
                  value={demandBoost}
                  onChange={(e) => setDemandBoost(Number(e.target.value))}
                  className="mt-2 w-full accent-gold-400"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <input
                  type="checkbox"
                  checked={eventOn}
                  onChange={(e) => setEventOn(e.target.checked)}
                  className="h-4 w-4 accent-gold-400"
                />
                <div>
                  <p className="text-sm font-semibold text-white">Major local event</p>
                  <p className="text-xs text-white/60">Applies +8% uplift in simulation</p>
                </div>
              </label>
              <div>
                <div className="flex justify-between text-sm font-medium text-white">
                  <span>Property occupancy</span>
                  <span className="text-gold-400">{occupancy}%</span>
                </div>
                <input
                  type="range"
                  min={45}
                  max={98}
                  value={occupancy}
                  onChange={(e) => setOccupancy(Number(e.target.value))}
                  className="mt-2 w-full accent-gold-400"
                />
              </div>
            </div>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gold-400" />
              <h2 className="text-lg font-bold text-white">Alerts</h2>
            </div>
            <ul className="mt-6 space-y-3">
              {alerts.map((a) => (
                <li key={a.id} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-white">
                  {a.message}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-white/50">
              Webhook-ready: POST /api/v1/nexora/alerts/subscribe — structure matches production envelope.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}