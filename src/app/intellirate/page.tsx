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

/** Charts aligned with global forest / bronze system */
const chart = {
  grid: "rgba(26, 46, 42, 0.1)",
  axis: "#5a6460",
  current: "#1a2e2a",
  recommended: "#8f6e45",
  demand: "#355a52",
  tooltipBorder: "rgba(26, 46, 42, 0.12)",
  tooltipBg: "#fcfaf6",
} as const;

export default function IntelliRatePage() {
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#ebe8e1_0%,#f2f0ea_40%,#f6f4ef_100%)] pb-20">
      {/* Hero — Kuriftu-scale suite photography */}
      <section className="relative min-h-[min(42vh,22rem)] overflow-hidden sm:min-h-[min(46vh,26rem)]">
        <Image
          src={resortImages.lagoon}
          alt="Resort lagoon and pool"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0d1412]/93 via-[#1a2e2a]/78 to-[#243d38]/50"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.35'%3E%3Cpath d='M48 46v-6h-4v6h-6v4h6v6h4v-6h6v-4h-6zm0-40V0h-4v6h-6v4h6v6h4V6h6V4h-6zM8 46v-6H4v6H0v4h4v6h4v-6h6v-4H8zM8 6V0H4v6H0v4h4v6h4V6h6V4H8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-12 lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4c4a8] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#e8d5a3]" aria-hidden />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 380, damping: 28 }}
            >
              <Card
                hover
                className="relative overflow-hidden border-border/90 bg-card/95 backdrop-blur-sm before:pointer-events-none before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-[#c4a574] before:to-[#6b5438] before:content-['']"
              >
                <p className="pl-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {k.label}
                </p>
                <p className="mt-2 pl-3 text-2xl font-bold tracking-tight text-primary">{k.value}</p>
                {k.change ? (
                  <p
                    className={`mt-1.5 pl-3 text-xs font-semibold ${
                      k.trend === "up"
                        ? "text-[#1f6b5c]"
                        : k.trend === "down"
                          ? "text-[#b45309]"
                          : "text-muted"
                    }`}
                  >
                    {k.change}
                  </p>
                ) : null}
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="border-border/90 bg-card/95 backdrop-blur-sm lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-primary">Pricing trajectory</h2>
                <p className="mt-0.5 text-sm text-muted">Current published rate vs model recommendation</p>
              </div>
              <div className="inline-flex rounded-xl border border-border bg-background p-1">
                {(["daily", "weekly", "monthly"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
                      period === p
                        ? "bg-card text-primary shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
                        : "text-muted hover:text-primary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 border-b border-border/80 pb-4 text-xs">
              <span className="inline-flex items-center gap-2 font-medium text-muted">
                <span className="h-2 w-6 rounded-full bg-[#1a2e2a]" aria-hidden />
                Current
              </span>
              <span className="inline-flex items-center gap-2 font-medium text-muted">
                <span className="h-2 w-6 rounded-full bg-[#8f6e45]" aria-hidden />
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
                      boxShadow: "0 8px 30px -8px rgba(15, 23, 42, 0.12)",
                      background: chart.tooltipBg,
                    }}
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
            {!aiMode ? (
              <p className="mt-3 rounded-lg bg-amber-50/90 px-3 py-2 text-xs font-medium text-[#92400e] ring-1 ring-amber-200/80">
                Manual mode: AI curve shown faded for reference only.
              </p>
            ) : null}
          </Card>

          <Card className="overflow-hidden border-border/90 bg-card/95 p-0 backdrop-blur-sm">
            <div className="relative h-36 w-full shrink-0">
              <Image
                src={resortImages.sunsetDeck}
                alt="Resort pool at dusk"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1412]/92 via-[#1a2e2a]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h2 className="text-lg font-bold tracking-tight text-white">AI recommendations</h2>
                <p className="text-sm text-white/75">Latest model outputs for your property</p>
              </div>
            </div>
            <ul className="space-y-3 p-6 pt-2">
              {recommendations.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-border/80 bg-[linear-gradient(145deg,#fcfaf6_0%,#f0ebe3_100%)] p-4 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset]"
                >
                  <p className="text-sm leading-relaxed text-primary">{r.text}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted">Confidence</span>
                    <span className="rounded-full bg-[#f2e8d8] px-2.5 py-0.5 font-bold text-[#5c4a32] ring-1 ring-[#dcc9b0]/90">
                      {r.confidence}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-border/90 bg-card/95 backdrop-blur-sm">
            <h2 className="text-lg font-bold tracking-tight text-primary">Demand insights</h2>
            <p className="mt-0.5 text-sm text-muted">Interest index by period — peaks show high booking intent</p>
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
                      boxShadow: "0 8px 30px -8px rgba(15, 23, 42, 0.12)",
                      background: chart.tooltipBg,
                    }}
                  />
                  <Bar dataKey="demand" fill={chart.demand} radius={[7, 7, 0, 0]} name="Demand index" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border-border/90 bg-card/95 backdrop-blur-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-primary">Competitor comparison</h2>
                <p className="mt-0.5 text-sm text-muted">Your BAR vs competitor average</p>
              </div>
              <div className="relative mt-2 h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-border/60 sm:mt-0 sm:h-[4.5rem] sm:w-36">
                <Image
                  src={resortImages.villa}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="144px"
                />
              </div>
            </div>
            <div className="mt-5 overflow-x-auto rounded-xl border border-border/80">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background text-[11px] uppercase tracking-wider text-muted">
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
                        className={`border-b border-border/50 last:border-0 ${idx % 2 === 1 ? "bg-card/70" : ""}`}
                      >
                        <td className="px-4 py-3.5 font-medium text-primary">{row.roomType}</td>
                        <td className="px-4 py-3.5 tabular-nums text-foreground">${row.yourPrice}</td>
                        <td className="px-4 py-3.5 tabular-nums text-muted">${row.competitorAvg}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              under
                                ? "bg-[#e8f5f1] text-[#14523f] ring-1 ring-[#b8e0d4]/80"
                                : "bg-[#fff7ed] text-[#9a3412] ring-1 ring-[#fed7aa]/90"
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

        <Card className="border-border/90 bg-card/95 backdrop-blur-sm">
          <h2 className="text-lg font-bold tracking-tight text-primary">Alerts</h2>
          <p className="mt-0.5 text-sm text-muted">Operational signals from pricing and parity checks</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`flex gap-3 rounded-xl border p-4 transition-shadow duration-200 ${
                  a.type === "warning"
                    ? "border-amber-200/90 bg-[linear-gradient(135deg,#fffbeb_0%,#fef3c7_120%)] shadow-sm"
                    : "border-secondary/25 bg-[linear-gradient(135deg,#eef4f2_0%,#e8f0ed_100%)] shadow-sm"
                }`}
              >
                <AlertTriangle
                  className={`mt-0.5 h-5 w-5 shrink-0 ${a.type === "warning" ? "text-amber-600" : "text-secondary"}`}
                />
                <p className="text-sm leading-relaxed text-primary">{a.message}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/90 bg-[linear-gradient(145deg,#fcfaf6_0%,#eef4f0_100%)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold tracking-tight text-primary">Confirm AI service rates</h2>
              <p className="mt-1 text-sm text-muted">
                Push the model&apos;s suggested prices to guest-facing{" "}
                <span className="font-semibold text-primary">published</span> rates
                for spa, dining, rooms, and experiences. The Service Optimizer table updates on refresh.
              </p>
              {confirmOk ? (
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-[#14523f]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                  {confirmOk}
                </p>
              ) : null}
              {confirmErr ? (
                <p className="mt-3 text-sm font-medium text-amber-800">{confirmErr}</p>
              ) : null}
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
                    const res = await confirmKuriftuAiPrices({ applyAll: true });
                    setConfirmOk(res.message);
                  } catch (e) {
                    setConfirmErr(
                      e instanceof Error
                        ? e.message
                        : "Could not reach pricing API. Run backend: python enhanced_api.py",
                    );
                  } finally {
                    setConfirmBusy(false);
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1a2e2a] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a2e2a]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {confirmBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {confirmBusy ? "Applying…" : "Confirm AI prices → published"}
              </button>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/25"
              >
                View service pricing
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
