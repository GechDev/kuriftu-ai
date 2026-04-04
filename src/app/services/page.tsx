"use client";

import { motion } from "framer-motion";
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
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bell, Minus } from "lucide-react";
import {
  fetchAiExplanations,
  fetchDemandHeatmap,
  fetchMarketIntel,
  fetchServiceAlerts,
  fetchServicePriceHistory,
  fetchServicePricingRows,
} from "@/lib/data/services";
import type { ChartRange } from "@/lib/data/types";
import { DemandHeatmap } from "@/components/services/DemandHeatmap";
import { AiModeToggle } from "@/components/ui/AiModeToggle";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

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

  const rows = useMemo(() => fetchServicePricingRows(), []);
  const history = useMemo(() => fetchServicePriceHistory(range), [range]);
  const intel = useMemo(() => fetchMarketIntel(), []);
  const explanations = useMemo(() => fetchAiExplanations(), []);
  const heatmap = useMemo(() => fetchDemandHeatmap(), []);
  const alerts = useMemo(() => fetchServiceAlerts(), []);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">NEXORA Service Optimizer</p>
            <h1 className="mt-1 text-3xl font-bold text-primary">Dynamic service pricing</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              AI-adjusted pricing for spa, dining, experiences, and room types — with transparent rationale and
              simulation.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <AiModeToggle enabled={aiMode} onChange={setAiMode} />
            {!aiMode ? (
              <label className="flex items-center gap-2 text-sm text-muted">
                <span className="whitespace-nowrap">Manual override</span>
                <input
                  type="number"
                  value={manualPct}
                  onChange={(e) => setManualPct(Number(e.target.value))}
                  className="w-24 rounded-lg border border-border px-2 py-1 text-primary"
                />
                <span>%</span>
              </label>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-primary">Service pricing table</h2>
            <p className="text-sm text-muted">Mock payload: GET /api/v1/nexora/services/pricing</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted">
                  <th className="pb-3 pr-4 font-semibold">Service</th>
                  <th className="pb-3 pr-4 font-semibold">Category</th>
                  <th className="pb-3 pr-4 font-semibold">Base</th>
                  <th className="pb-3 pr-4 font-semibold">AI price</th>
                  <th className="pb-3 pr-4 font-semibold">Simulated</th>
                  <th className="pb-3 pr-4 font-semibold">Demand</th>
                  <th className="pb-3 pr-4 font-semibold">Δ %</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const effectiveAi = aiMode
                    ? simulatedAiPrice(r.aiPrice, demandBoost, eventOn, occupancy)
                    : Math.round(r.basePrice * (1 + manualPct / 100));
                  const changeVsBase = (((effectiveAi - r.basePrice) / r.basePrice) * 100).toFixed(1);
                  return (
                    <tr key={r.id} className="border-b border-border/70 last:border-0">
                      <td className="py-3 pr-4 font-medium text-primary">{r.name}</td>
                      <td className="py-3 pr-4 text-muted">{r.category}</td>
                      <td className="py-3 pr-4">${r.basePrice}</td>
                      <td className="py-3 pr-4 font-semibold text-accent">${r.aiPrice}</td>
                      <td className="py-3 pr-4 font-bold text-primary">${effectiveAi}</td>
                      <td className="py-3 pr-4">{demandBadge(r.demandLevel)}</td>
                      <td className="py-3 pr-4">
                        <span className={Number(changeVsBase) < 0 ? "text-amber-700" : "text-secondary"}>
                          {Number(changeVsBase) > 0 ? "+" : ""}
                          {changeVsBase}%
                        </span>
                      </td>
                      <td className="py-3">{statusBadge(r.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-primary">Real-time pricing</h2>
                <p className="text-sm text-muted">Historical vs AI-adjusted (aggregated index)</p>
              </div>
              <div className="flex rounded-xl border border-border bg-slate-50 p-1">
                {(["24h", "7d", "30d"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setRange(k)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      range === k ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary"
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="t" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="historical" name="Historical" stroke="#2A4D6E" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="ai" name="AI-adjusted" stroke="#6C63FF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary">Market intelligence</h2>
            <p className="text-sm text-muted">Signals ingested this hour</p>
            <ul className="mt-6 space-y-4">
              {intel.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 rounded-xl border border-border bg-slate-50/90 p-4"
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
          <Card>
            <h2 className="text-lg font-bold text-primary">AI decision explanation</h2>
            <p className="text-sm text-muted">Why prices moved — with confidence scores</p>
            <ul className="mt-6 space-y-4">
              {explanations.map((ex) => (
                <li key={ex.id} className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <p className="text-sm text-primary">{ex.text}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted">Model confidence</span>
                    <span className="font-bold text-accent">{ex.confidence}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-primary">Demand heatmap</h2>
            <p className="text-sm text-muted">Day × time slot — peak demand highlighted</p>
            <div className="mt-6">
              <DemandHeatmap data={heatmap} />
            </div>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
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
                  className="mt-2 w-full accent-accent"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={eventOn}
                  onChange={(e) => setEventOn(e.target.checked)}
                  className="h-4 w-4 accent-accent"
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

          <Card>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
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
