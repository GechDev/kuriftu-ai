"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Brain,
  LayoutDashboard,
  Mic2,
  Phone,
  Sparkles,
  Wand2,
} from "lucide-react";
import { benefits, features, steps, testimonials } from "@/lib/data/landing";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

const iconMap = {
  phone: Phone,
  concierge: Wand2,
  chart: BarChart3,
  brain: Brain,
  layout: LayoutDashboard,
} as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

export function LandingView() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#1e3a52] to-[#0f2740]" />
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -right-20 top-20 h-96 w-96 rounded-full bg-accent blur-[100px]" />
          <div className="absolute -left-20 bottom-20 h-80 w-80 rounded-full bg-secondary/40 blur-[90px]" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-28 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="mb-2 text-sm font-medium text-white/80">Where Hospitality Meets Intelligence.</p>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Kuriftu NEXORA
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Transform Hospitality with AI Intelligence
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/80">
              Automate guest journeys, personalize every touchpoint, and optimize revenue with models trained for
              resort operations — from voice reception to dynamic pricing.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/#cta" variant="secondary">
                Request Demo
              </Button>
              <Button href="/#features" variant="ghost">
                Explore Platform
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.65 }}
            className="mt-16 grid gap-6 lg:grid-cols-3"
          >
            {[
              { k: "Automate", v: "Voice, SMS, and chat unified" },
              { k: "Personalize", v: "Guest memory across stays" },
              { k: "Optimize", v: "IntelliRate + service pricing" },
            ].map((item) => (
              <div
                key={item.k}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition hover:bg-white/10"
              >
                <p className="text-sm font-bold text-secondary">{item.k}</p>
                <p className="mt-1 text-sm text-white/75">{item.v}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Platform"
            title="Everything your resort needs to run smarter"
            subtitle="Modular AI that plugs into operations — not another siloed dashboard."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = iconMap[f.icon];
              return (
                <motion.div key={f.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}>
                  <Card hover className="h-full">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <h3 className="text-lg font-bold text-primary">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Flow"
            title="How it works"
            subtitle="From first contact to executive insight — one continuous loop."
          />
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((s, idx) => (
              <motion.div key={s.n} {...fadeUp} transition={{ ...fadeUp.transition, delay: idx * 0.08 }}>
                <div className="relative rounded-2xl border border-border bg-background p-6 shadow-sm">
                  <span className="absolute -top-3 left-6 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
                    Step {s.n}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-primary">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gradient-to-b from-background to-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Outcomes</p>
              <h2 className="mt-2 text-3xl font-bold text-primary md:text-4xl">Built for operators and owners</h2>
              <ul className="mt-8 space-y-4">
                {benefits.map((b) => (
                  <li key={b} className="flex gap-3 text-muted">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                    <span className="text-base">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <Card className="border-accent/20 bg-gradient-to-br from-white to-accent/5">
                <Mic2 className="h-10 w-10 text-accent" />
                <p className="mt-4 text-lg font-semibold text-primary">Voice + SMS that sounds like your brand</p>
                <p className="mt-2 text-sm text-muted">
                  Policies, inventory, and guest context stay in sync — so AI Receptionist never overpromises.
                </p>
                <div className="mt-6 flex gap-3">
                  <div className="flex-1 rounded-xl bg-primary/5 p-4">
                    <p className="text-2xl font-bold text-primary">−38%</p>
                    <p className="text-xs text-muted">Routine call volume</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-secondary/20 p-4">
                    <p className="text-2xl font-bold text-primary">+12%</p>
                    <p className="text-xs text-muted">RevPAR uplift (avg)</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo preview */}
      <section id="demo" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Preview"
            title="See NEXORA in action"
            subtitle="Executive dashboards and guest-facing AI — same platform, two lenses."
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <p className="mb-3 text-sm font-semibold text-primary">Insights Dashboard</p>
              <div className="overflow-hidden rounded-2xl border border-border bg-slate-900 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-white/50">nexora.kuriftu.app / insights</span>
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-2">
                  {[
                    { l: "Occupancy", v: "78%", c: "text-secondary" },
                    { l: "ADR", v: "$284", c: "text-accent" },
                    { l: "Guest NPS", v: "62", c: "text-sky-300" },
                    { l: "AI tasks / day", v: "1,240", c: "text-amber-300" },
                  ].map((x) => (
                    <div key={x.l} className="rounded-xl bg-white/5 p-4">
                      <p className="text-xs text-white/50">{x.l}</p>
                      <p className={`mt-1 text-2xl font-bold ${x.c}`}>{x.v}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 p-4">
                  <div className="h-28 rounded-lg bg-gradient-to-t from-accent/30 to-transparent" />
                  <p className="mt-2 text-center text-[10px] text-white/40">Revenue vs forecast — mock visualization</p>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <p className="mb-3 text-sm font-semibold text-primary">AI Concierge</p>
              <div className="flex h-full min-h-[320px] flex-col rounded-2xl border border-border bg-white shadow-[var(--shadow-soft)]">
                <div className="border-b border-border bg-primary px-4 py-3 text-white">
                  <p className="text-sm font-bold">Kuriftu Guest Concierge</p>
                  <p className="text-[10px] text-white/70">Online · powered by NEXORA</p>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="ml-auto max-w-[85%] rounded-2xl bg-slate-100 px-3 py-2 text-sm text-primary">
                    Can you move our dinner to 8pm and add a spa slot?
                  </div>
                  <div className="max-w-[90%] rounded-2xl bg-accent/10 px-3 py-2 text-sm text-primary">
                    Done. Dinner is now 8:00 PM at Lakehouse. I’ve reserved Spa at 4:30 PM — confirmation sent to your
                    phone.
                  </div>
                  <div className="mt-auto flex gap-2">
                    <input
                      readOnly
                      className="flex-1 rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-muted"
                      placeholder="Type a message…"
                    />
                    <button
                      type="button"
                      className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Social proof"
            title="Trusted by hospitality leaders"
            subtitle="Mock testimonials representing the outcomes teams see with intelligent automation."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={t.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}>
                <Card hover className="h-full">
                  <p className="text-sm leading-relaxed text-primary">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-6 border-t border-border pt-4">
                    <p className="text-sm font-bold text-primary">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="scroll-mt-20 pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[#1a3550] px-8 py-14 text-center text-white shadow-[var(--shadow-glow)]"
          >
            <div className="absolute -right-16 top-0 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to see NEXORA on your property?</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/80">
                Book a tailored walkthrough of IntelliRate, Service Optimizer, and guest-facing AI — calibrated for
                Kuriftu-scale operations.
              </p>
              <div className="mt-8 flex justify-center">
                <Button href="mailto:hello@kuriftu.nexora" variant="secondary" className="px-8 py-3 text-base">
                  Book a Demo
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
