"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import {
  fetchCompetitorTable,
  fetchDemandInsights,
  fetchIntellirateAlerts,
  fetchIntellirateKpis,
  fetchIntellirateRecommendations,
  fetchPricingSeries,
} from "@/lib/data/intellirate";
import type { PricingPeriod } from "@/lib/data/types";
import { resortImages } from "@/lib/resortImages";
import { AiModeToggle } from "@/components/ui/AiModeToggle";
import { Card } from "@/components/ui/Card";
import { confirmKuriftuAiPrices } from "@/lib/pricing-api";
import { useAuth } from "@/contexts/auth-context";
import { StaffSubnav } from "@/components/admin/StaffSubnav";

const chart = {
  grid: "rgba(255,255,255,0.08)",
  axis: "#a0a8a5",
  current: "#d4af37",
  recommended: "#6B21E5",
  demand: "#d4af37",
  tooltipBorder: "rgba(212,175,55,0.3)",
  tooltipBg: "#0a1210",
} as const;

export default function IntelliRatePage() {
  const { token } = useAuth();
  const [period, setPeriod] = useState<PricingPeriod>("daily");
  const [aiMode, setAiMode] = useState(true);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmOk, setConfirmOk] = useState<string | null>(null);
  const [confirmErr, setConfirmErr] = useState<string | null>(null);

  const kpis = useMemo(() => fetchIntellirateKpis(), []);
  const series = useMemo(() => fetchPricingSeries(period), [period]);
  const recommendations = useMemo(() => fetchIntellirateRecommendations(), []);
  const demand = useMemo(() => fetchDemandInsights(), []);
  const competitors = useMemo(() => fetchCompetitorTable(), []);
  const alerts = useMemo(() => fetchIntellirateAlerts(), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a1210] to-[#0a1210] pb-20">
      <div className="relative z-20 mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <StaffSubnav segment="Revenue intelligence" variant="onDark" />
      </div>

      {/* Hero section with cinematic image */}
      <section className="relative min-h-[min(42vh,22rem)] overflow-hidden sm:min-h-[min(46vh,26rem)]">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={resortImages.lagoon}
            alt="Resort lagoon and pool"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(212,175,55,0.12),transparent_60%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-gold-400" aria-hidden />
              IntelliRate Engine
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.35rem]">
              Dynamic room pricing
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-[15px]">
              AI-recommended rates aligned with your property — same filters as the live pricing API, tuned for
              resort revenue teams.
            </p>
          </div>
          <div className="shrink-0">
            <AiModeToggle enabled={aiMode} onChange={setAiMode} label="Pricing control" onDark />
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-10 max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 380, damping: 28 }}
            >
              <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl before:pointer-events-none before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-gold-400 before:to-amber-600 before:content-['']">
                <p className="pl-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50">
                  {k.label}
                </p>
                <p className="mt-2 pl-3 text-2xl font-bold tracking-tight text-white">{k.value}</p>
                {k.change && (
                  <p
                    className={`mt-1.5 pl-3 text-xs font-semibold ${
                      k.trend === "up"
                        ? "text-gold-400"
                        : k.trend === "down"
                          ? "text-amber-500"
                          : "text-white/50"
                    }`}
                  >
                    {k.change}
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Chart and Recommendations */}
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">Pricing trajectory</h2>
                <p className="mt-0.5 text-sm text-white/60">Current published rate vs model recommendation</p>
              </div>
              <div className="inline-flex rounded-xl border border-white/10 bg-black/50 p-1">
                {(["daily", "weekly", "monthly"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
                      period === p
                        ? "bg-gold-400/20 text-gold-400 shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-4 text-xs">
              <span className="inline-flex items-center gap-2 font-medium text-white/70">
                <span className="h-2 w-6 rounded-full bg-gold-400" aria-hidden />
                Current
              </span>
              <span className="inline-flex items-center gap-2 font-medium text-white/70">
                <span className="h-2 w-6 rounded-full bg-purple-500" aria-hidden />
                AI recommended
              </span>
            </div>
            <div className="mt-4 h-[300px] w-full min-h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: chart.axis }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(value) => [`$${value ?? ""}`, ""]}
                    contentStyle={{
                      borderRadius: 12,
                      border: `1px solid ${chart.tooltipBorder}`,
                      background: chart.tooltipBg,
                      color: "white",
                    }}
                    labelStyle={{ color: "#d4af37" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    name="Current price"
                    stroke={chart.current}
                    strokeWidth={2.5}
                    dot={false}
                    opacity={aiMode ? 1 : 0.3}
                  />
                  <Line
                    type="monotone"
                    dataKey="recommended"
                    name="AI recommended"
                    stroke={chart.recommended}
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {!aiMode && (
              <p className="mt-3 rounded-lg bg-amber-500/20 px-3 py-2 text-xs font-medium text-amber-400 ring-1 ring-amber-500/30">
                Manual mode: AI curve shown faded for reference only.
              </p>
            )}
          </Card>

          <Card className="overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl p-0">
            <div className="relative h-36 w-full shrink-0">
              <Image
                src={resortImages.sunsetDeck}
                alt="Resort pool at dusk"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h2 className="text-lg font-bold tracking-tight text-white">AI recommendations</h2>
                <p className="text-sm text-white/75">Latest model outputs for your property</p>
              </div>
            </div>
            <ul className="space-y-3 p-6 pt-2">
              {recommendations.map((r, idx) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-xl border border-white/10 bg-black/30 p-4"
                >
                  <p className="text-sm leading-relaxed text-white/90">{r.text}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-white/50">Confidence</span>
                    <span className="rounded-full bg-gold-400/20 px-2.5 py-0.5 font-bold text-gold-400 ring-1 ring-gold-400/30">
                      {r.confidence}%
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Demand Insights & Competitor Table */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
            <h2 className="text-lg font-bold tracking-tight text-white">Demand insights</h2>
            <p className="mt-0.5 text-sm text-white/60">Interest index by period — peaks show high booking intent</p>
            <div className="mt-6 h-[260px] min-h-[260px] min-w-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demand} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: `1px solid ${chart.tooltipBorder}`,
                      background: chart.tooltipBg,
                      color: "white",
                    }}
                    labelStyle={{ color: "#d4af37" }}
                  />
                  <Bar dataKey="demand" fill={chart.demand} radius={[7, 7, 0, 0]} name="Demand index" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">Competitor comparison</h2>
                <p className="mt-0.5 text-sm text-white/60">Your BAR vs competitor average</p>
              </div>
              <div className="relative mt-2 h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 sm:mt-0 sm:h-[4.5rem] sm:w-36">
                <Image src={resortImages.villa} alt="" fill className="object-cover" sizes="144px" />
              </div>
            </div>
            <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-black/50 text-[11px] uppercase tracking-wider text-gold-400/80">
                    <th className="px-4 py-3 font-semibold">Room type</th>
                    <th className="px-4 py-3 font-semibold">You</th>
                    <th className="px-4 py-3 font-semibold">Comp avg</th>
                    <th className="px-4 py-3 font-semibold">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((row, idx) => {
                    const diff = row.yourPrice - row.competitorAvg;
                    const pct = ((diff / row.competitorAvg) * 100).toFixed(1);
                    const under = diff < 0;
                    return (
                      <tr
                        key={row.roomType}
                        className={`border-b border-white/5 last:border-0 ${idx % 2 === 1 ? "bg-white/5" : ""}`}
                      >
                        <td className="px-4 py-3.5 font-medium text-white">{row.roomType}</td>
                        <td className="px-4 py-3.5 tabular-nums text-white/90">${row.yourPrice}</td>
                        <td className="px-4 py-3.5 tabular-nums text-white/60">${row.competitorAvg}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              under
                                ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                                : "bg-gold-400/20 text-gold-400 ring-1 ring-gold-400/30"
                            }`}
                          >
                            {under ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                            {under ? `${pct}% below` : `+${pct}%`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-bold tracking-tight text-white">Alerts</h2>
          <p className="mt-0.5 text-sm text-white/60">Operational signals from pricing and parity checks</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`flex gap-3 rounded-xl border p-4 transition-shadow duration-200 ${
                  a.type === "warning"
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-gold-400/20 bg-gold-400/5"
                }`}
              >
                <AlertTriangle
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    a.type === "warning" ? "text-amber-400" : "text-gold-400"
                  }`}
                />
                <p className="text-sm leading-relaxed text-white/90">{a.message}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Confirm AI Rates CTA */}
        <Card className="border-white/10 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold tracking-tight text-white">Confirm AI service rates</h2>
              <p className="mt-1 text-sm text-white/60">
                Push the model&apos;s suggested prices to guest-facing{" "}
                <span className="font-semibold text-gold-400">published</span> rates
                for spa, dining, rooms, and experiences. The Service Optimizer table updates on refresh.
              </p>
              {confirmOk && (
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-gold-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                  {confirmOk}
                </p>
              )}
              {confirmErr && (
                <p className="mt-3 text-sm font-medium text-amber-400">{confirmErr}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={confirmBusy}
                onClick={async () => {
                  setConfirmBusy(true);
                  setConfirmOk(null);
                  setConfirmErr(null);
                  try {
                    const res = await confirmKuriftuAiPrices(token, { applyAll: true });
                    setConfirmOk(res.message);
                  } catch (e) {
                    setConfirmErr(
                      e instanceof Error
                        ? e.message
                        : "Could not update prices. Ensure the Node API is running and you are signed in as staff.",
                    );
                  } finally {
                    setConfirmBusy(false);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400/20 px-6 py-2.5 text-sm font-semibold text-gold-400 shadow-sm transition hover:bg-gold-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {confirmBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {confirmBusy ? "Applying…" : "Confirm AI prices → published"}
              </button>
              <Link
                href="/admin/rates"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/50 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-gold-400/50 hover:text-gold-400"
              >
                Experience pricing
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}