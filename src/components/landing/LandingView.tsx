"use client";

import { motion } from "framer-motion";
import Image from "next/image";
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
import { resortGalleryKeys, resortImages } from "@/lib/resortImages";
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
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

function FeatureBentoCard({
  f,
  index,
}: {
  f: (typeof features)[number];
  index: number;
}) {
  const Icon = iconMap[f.icon];
  const spans =
    index === 0
      ? "lg:col-span-2 lg:row-span-2 min-h-[22rem]"
      : index === 3
        ? "lg:col-span-2 min-h-[16rem]"
        : "min-h-[14rem]";

  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: index * 0.06 }}
      className={spans}
    >
      <div className="group relative h-full min-h-0 overflow-hidden rounded-[1.35rem] border border-border bg-card shadow-[var(--shadow-soft)]">
        <Image
          src={resortImages[f.image]}
          alt=""
          fill
          className="object-cover transition-[transform,filter] duration-[1.2s] ease-out group-hover:scale-[1.03] group-hover:brightness-[1.03]"
          sizes={
            index === 0
              ? "(max-width:1024px) 100vw, 66vw"
              : index === 3
                ? "(max-width:1024px) 100vw, 66vw"
                : "(max-width:1024px) 100vw, 33vw"
          }
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0d1412]/88 via-[#0d1412]/35 to-[#0d1412]/10"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-7">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-white backdrop-blur-md ring-1 ring-white/20">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{f.title}</h3>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-white/78">{f.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function LandingView() {
  return (
    <main className="overflow-x-hidden">
      {/* Hero — full-bleed photography, minimal chrome */}
      <section className="relative min-h-[min(92vh,52rem)]">
        <Image
          src={resortImages.hero}
          alt="Kuriftu-style resort pool and grounds"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0d1412] via-[#0d1412]/45 to-[#0d1412]/25"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1412]/80 via-transparent to-transparent sm:from-[#0d1412]/65" />

        <div className="relative mx-auto flex min-h-[min(92vh,52rem)] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
            className="max-w-2xl"
          >
            <p className="text-sm font-medium tracking-wide text-white/85">Kuriftu Resort · NEXORA</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-white/80" aria-hidden />
              Hospitality intelligence
            </p>
            <h1 className="mt-6 text-[2.35rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              The calm operating system behind exceptional stays.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg">
              Automate guest journeys, personalize every touchpoint, and optimize revenue — tuned for Kuriftu-scale
              resort operations from Bishoftu to your next property.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href="/#cta" variant="light" className="px-7">
                Request a demo
              </Button>
              <Button href="/#features" variant="ghost" className="rounded-full px-7">
                Explore the platform
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.75, ease: [0.22, 1, 0.36, 1] as const }}
            className="mt-14 grid gap-3 border-t border-white/15 pt-10 sm:grid-cols-3"
          >
            {[
              { k: "Automate", v: "Voice, SMS, and chat — one brain" },
              { k: "Personalize", v: "Memory that follows every guest" },
              { k: "Optimize", v: "IntelliRate & service pricing" },
            ].map((item) => (
              <div key={item.k} className="border-white/10 sm:border-l sm:border-white/10 sm:pl-6 first:sm:border-l-0 first:sm:pl-0">
                <p className="text-[13px] font-semibold tracking-wide text-white">{item.k}</p>
                <p className="mt-1 text-sm text-white/65">{item.v}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Filmstrip gallery */}
      <section className="relative border-y border-border bg-card py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
            On-property experience
          </p>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 pt-0 [scrollbar-width:none] sm:gap-4 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
          {resortGalleryKeys.map((key) => (
            <div
              key={key}
              className="relative h-36 w-52 shrink-0 overflow-hidden rounded-2xl border border-border/80 shadow-sm sm:h-44 sm:w-64"
            >
              <Image
                src={resortImages[key]}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:640px) 208px, 256px"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Features — bento with imagery */}
      <section id="features" className="scroll-mt-24 bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Platform"
            title="Everything Kuriftu needs to run smarter"
            subtitle="Modular AI that lives inside operations — not another siloed dashboard."
          />
          <div className="grid auto-rows-fr gap-4 sm:gap-5 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureBentoCard key={f.id} f={f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Split narrative + photography */}
      <section className="border-y border-border bg-card py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <motion.div {...fadeUp} className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-border shadow-[var(--shadow-soft)] sm:aspect-[5/6]">
            <Image
              src={resortImages.resortGrounds}
              alt="Resort grounds and pool"
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/25 to-transparent" aria-hidden />
          </motion.div>
          <motion.div {...fadeUp}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">Why NEXORA</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-primary sm:text-4xl">
              Designed for owners, GMs, and front-line teams
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              The same platform that answers a 2 a.m. spa request also explains why rates moved on Saturday. Fewer
              tools, clearer stories, faster decisions.
            </p>
            <ul className="mt-10 space-y-5">
              {benefits.map((b) => (
                <li key={b} className="flex gap-4 text-muted">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-base leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden bg-background py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <Image
            src={resortImages.hotelFacade}
            alt=""
            fill
            className="object-cover opacity-[0.07]"
            sizes="50vw"
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Flow"
            title="How it works"
            subtitle="From first contact to executive insight — one continuous loop."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, idx) => (
              <motion.div
                key={s.n}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: idx * 0.07 }}
                className="relative rounded-[1.25rem] border border-border bg-card/90 p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm"
              >
                <span className="text-[11px] font-semibold tabular-nums text-accent">0{s.n}</span>
                <h3 className="mt-4 text-base font-semibold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits card + voice */}
      <section className="bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-stretch gap-10 lg:grid-cols-2">
            <motion.div {...fadeUp} className="relative min-h-[20rem] overflow-hidden rounded-[1.5rem] border border-border lg:min-h-[24rem]">
              <Image
                src={resortImages.dining}
                alt="Resort dining"
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-primary/10" aria-hidden />
              <p className="absolute bottom-8 left-8 right-8 text-lg font-medium leading-snug text-white sm:text-xl">
                Kuriftu guests expect quiet luxury. NEXORA keeps service invisible — and unforgettable.
              </p>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }}>
              <Card className="h-full border-border bg-background/80 p-8 sm:p-10">
                <Mic2 className="h-9 w-9 text-accent" aria-hidden />
                <p className="mt-6 text-xl font-semibold leading-snug text-primary sm:text-2xl">
                  Voice and SMS that sound like your brand
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  Policies, inventory, and guest context stay synchronized — so AI Receptionist never overpromises.
                </p>
                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-2xl font-semibold tabular-nums text-primary">−38%</p>
                    <p className="mt-1 text-xs text-muted">Routine call volume</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <p className="text-2xl font-semibold tabular-nums text-secondary">+12%</p>
                    <p className="mt-1 text-xs text-muted">RevPAR uplift (avg)</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo preview */}
      <section id="demo" className="scroll-mt-24 bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Preview"
            title="NEXORA in two lenses"
            subtitle="Executive clarity and guest-facing polish — same data model, different surfaces."
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div {...fadeUp}>
              <p className="mb-4 text-sm font-semibold text-primary">Insights</p>
              <div className="relative overflow-hidden rounded-[1.35rem] border border-border bg-primary shadow-[var(--shadow-soft)]">
                <div className="absolute inset-0 opacity-[0.12]">
                  <Image src={resortImages.landscape} alt="" fill className="object-cover" sizes="50vw" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-white/25" />
                    <span className="h-2 w-2 rounded-full bg-white/25" />
                    <span className="h-2 w-2 rounded-full bg-white/25" />
                    <span className="ml-3 font-mono text-[11px] text-white/45">nexora.kuriftu.app</span>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    {[
                      { l: "Occupancy", v: "78%" },
                      { l: "ADR", v: "$284" },
                      { l: "Guest NPS", v: "62" },
                      { l: "AI tasks / day", v: "1,240" },
                    ].map((x) => (
                      <div key={x.l} className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">{x.l}</p>
                        <p className="mt-2 text-2xl font-semibold tabular-nums text-white">{x.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 p-4">
                    <div className="h-24 rounded-lg bg-gradient-to-t from-white/10 to-transparent" />
                    <p className="mt-3 text-center text-[10px] text-white/40">Revenue vs forecast · mock</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }}>
              <p className="mb-4 text-sm font-semibold text-primary">Guest concierge</p>
              <div className="relative flex min-h-[22rem] flex-col overflow-hidden rounded-[1.35rem] border border-border bg-card shadow-[var(--shadow-soft)]">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" aria-hidden />
                <div className="relative border-b border-border bg-primary px-4 py-4 text-white">
                  <p className="text-sm font-semibold">Kuriftu Guest Concierge</p>
                  <p className="text-[11px] text-white/60">Online · NEXORA</p>
                </div>
                <div className="relative flex flex-1 flex-col gap-3 p-5">
                  <div className="ml-auto max-w-[88%] rounded-2xl bg-background px-4 py-2.5 text-sm text-primary">
                    Can you move dinner to 8pm and add a spa slot?
                  </div>
                  <div className="max-w-[92%] rounded-2xl border border-border bg-card px-4 py-2.5 text-sm text-primary shadow-sm">
                    Done. Dinner is now 8:00 PM at Lakehouse. Spa reserved for 4:30 PM — confirmation sent to your
                    phone.
                  </div>
                  <div className="mt-auto flex gap-2 pt-2">
                    <input
                      readOnly
                      className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-muted"
                      placeholder="Message…"
                    />
                    <button
                      type="button"
                      className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
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
      <section className="border-t border-border bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Proof"
            title="Trusted where hospitality runs 24/7"
            subtitle="Representative outcomes from properties using intelligent automation at scale."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={t.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}>
                <Card hover className="h-full overflow-hidden border-border p-0">
                  <div className="relative h-40 w-full">
                    <Image
                      src={resortImages[t.photo]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  </div>
                  <div className="p-6 pt-2">
                    <p className="text-sm leading-relaxed text-primary">&ldquo;{t.quote}&rdquo;</p>
                    <div className="mt-6 border-t border-border pt-5">
                      <p className="text-sm font-semibold text-primary">{t.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="scroll-mt-24 pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="relative min-h-[22rem] overflow-hidden rounded-[1.75rem] border border-border shadow-[var(--shadow-glow)] sm:min-h-[24rem]"
          >
            <Image
              src={resortImages.cta}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1412]/92 via-[#0d1412]/75 to-[#0d1412]/45" />
            <div className="relative px-8 py-16 text-center sm:px-12 sm:py-20">
              <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                See NEXORA on Kuriftu — and your next property.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
                Walk through IntelliRate, Service Optimizer, and guest-facing AI in one tailored session.
              </p>
              <div className="mt-10">
                <Button href="mailto:hello@kuriftu.nexora" variant="light" className="px-10 py-3 text-base">
                  Book a demo
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
