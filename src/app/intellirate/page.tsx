"use client";

import { motion } from "framer-motion";
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
import { useMemo, useState } from "react";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import {
  fetchCompetitorTable,
  fetchDemandInsights,
  fetchIntellirateAlerts,
  fetchIntellirateKpis,
  fetchIntellirateRecommendations,
  fetchPricingSeries,
} from "@/lib/data/intellirate";
import type { PricingPeriod } from "@/lib/data/types";
import { AiModeToggle } from "@/components/ui/AiModeToggle";
import { Card } from "@/components/ui/Card";

export default function IntelliRatePage() {
  const [period, setPeriod] = useState<PricingPeriod>("daily");
  const [aiMode, setAiMode] = useState(true);

  const kpis = useMemo(() => fetchIntellirateKpis(), []);
  const series = useMemo(() => fetchPricingSeries(period), [period]);
  const recommendations = useMemo(() => fetchIntellirateRecommendations(), []);
  const demand = useMemo(() => fetchDemandInsights(), []);
  const competitors = useMemo(() => fetchCompetitorTable(), []);
  const alerts = useMemo(() => fetchIntellirateAlerts(), []);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">IntelliRate Engine</p>
            <h1 className="mt-1 text-3xl font-bold text-primary">Dynamic room pricing</h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              AI-recommended rates vs current published prices — filters mirror API query params.
            </p>
          </div>
          <AiModeToggle enabled={aiMode} onChange={setAiMode} label="Pricing control" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{k.label}</p>
                <p className="mt-2 text-2xl font-bold text-primary">{k.value}</p>
                {k.change ? (
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      k.trend === "up" ? "text-secondary" : k.trend === "down" ? "text-red-500" : "text-muted"
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
          <Card className="lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-primary">Pricing trajectory</h2>
                <p className="text-sm text-muted">Current price vs AI recommended</p>
              </div>
              <div className="flex rounded-xl border border-border bg-slate-50 p-1">
                {(["daily", "weekly", "monthly"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      period === p ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full min-h-[300px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value) => [`$${value ?? ""}`, ""]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    name="Current price"
                    stroke="#2A4D6E"
                    strokeWidth={2}
                    dot={false}
                    opacity={aiMode ? 1 : 0.35}
                  />
                  <Line
                    type="monotone"
                    dataKey="recommended"
                    name="AI recommended"
                    stroke="#6C63FF"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {!aiMode ? (
              <p className="mt-3 text-xs font-medium text-amber-700">Manual mode: AI curve shown faded for reference.</p>
            ) : null}
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary">AI recommendations</h2>
            <p className="text-sm text-muted">Latest model outputs</p>
            <ul className="mt-6 space-y-4">
              {recommendations.map((r) => (
                <li key={r.id} className="rounded-xl border border-border bg-slate-50/80 p-4">
                  <p className="text-sm text-primary">{r.text}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted">Confidence</span>
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 font-bold text-accent">{r.confidence}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <h2 className="text-lg font-bold text-primary">Demand insights</h2>
            <p className="text-sm text-muted">Intraday interest index — peak periods highlighted</p>
            <div className="mt-6 h-[260px] min-h-[260px] min-w-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demand} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Bar dataKey="demand" fill="#4ECCA3" radius={[6, 6, 0, 0]} name="Demand index" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary">Competitor comparison</h2>
            <p className="text-sm text-muted">Your price vs competitor average</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase text-muted">
                    <th className="pb-3 pr-4 font-semibold">Room type</th>
                    <th className="pb-3 pr-4 font-semibold">You</th>
                    <th className="pb-3 pr-4 font-semibold">Comp avg</th>
                    <th className="pb-3 font-semibold">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((row) => {
                    const diff = row.yourPrice - row.competitorAvg;
                    const pct = ((diff / row.competitorAvg) * 100).toFixed(1);
                    const under = diff < 0;
                    return (
                      <tr key={row.roomType} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 font-medium text-primary">{row.roomType}</td>
                        <td className="py-3 pr-4">${row.yourPrice}</td>
                        <td className="py-3 pr-4">${row.competitorAvg}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                              under ? "bg-secondary/20 text-primary" : "bg-amber-100 text-amber-900"
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

        <Card>
          <h2 className="text-lg font-bold text-primary">Alerts</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {alerts.map((a) => (
              <div
                key={a.id}
                className={`flex gap-3 rounded-xl border p-4 ${
                  a.type === "warning"
                    ? "border-amber-200 bg-amber-50"
                    : "border-accent/30 bg-accent/5"
                }`}
              >
                <AlertTriangle
                  className={`mt-0.5 h-5 w-5 shrink-0 ${a.type === "warning" ? "text-amber-600" : "text-accent"}`}
                />
                <p className="text-sm text-primary">{a.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
