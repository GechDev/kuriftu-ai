"use client";

import { motion, useMotionValue, useTransform, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import {
  BarChart3,
  Brain,
  LayoutDashboard,
  Mic2,
  Phone,
  Sparkles,
  Wand2,
  ArrowRight,
  Star,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import { benefits, features, steps, testimonials } from "@/lib/data/landing";
import { resortGalleryKeys, resortImages } from "@/lib/resortImages";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CountUpOnView } from "@/components/ui/CountUpOnView";

const iconMap = {
  phone: Phone,
  concierge: Wand2,
  chart: BarChart3,
  brain: Brain,
  layout: LayoutDashboard,
} as const;

// Custom hook for 3D tilt effect
const useTilt = (ref: React.RefObject<HTMLElement>) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { rotateX, rotateY, handleMouseMove, handleMouseLeave };
};

// Floating particles component (improved)
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 15 + 8,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/15"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// 3D Tilt Card Component
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useTilt(cardRef as React.RefObject<HTMLElement>);

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-200 ${className}`}
      whileHover={{ scale: 1.02, y: -5, boxShadow: "0 25px 40px -12px rgba(0,0,0,0.4)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

// Cinematic image with faster zoom and pan
const CinematicImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  return (
    <motion.div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1, 1.08, 1],
          x: ["0%", "-0.8%", "0%"],
          y: ["0%", "-0.5%", "0%"],
        }}
        transition={{
          duration: 14, // faster motion
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" />
      </motion.div>
    </motion.div>
  );
};

export function LandingView() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.98]);
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, 60]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const parallaxX = useSpring(useTransform(useMotionValue(mousePosition.x), [0, 1], [-12, 12]), { damping: 50 });
  const parallaxY = useSpring(useTransform(useMotionValue(mousePosition.y), [0, 1], [-6, 6]), { damping: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="overflow-x-hidden bg-gradient-to-b from-[#0a0f0e] to-[#141a18]">
      {/* HERO SECTION - Increased height, faster motion */}
      <section ref={heroRef} className="relative h-[90vh] min-h-[700px] max-h-[900px] overflow-hidden">
        {/* Background with faster zoom */}
        <motion.div
          className="absolute inset-0"
          style={{
            scale: heroScale,
            y: heroY,
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              scale: [1, 1.08, 1],
              x: ["0%", "-1%", "0%"],
            }}
            transition={{
              duration: 14, // faster
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <Image
              src={resortImages.hero}
              alt="Kuriftu luxury resort"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </motion.div>
          {/* Lighter overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/50" />
        </motion.div>

        <FloatingParticles />

        <motion.div
          className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
                Hospitality Intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-3xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl"
            >
              AI-Powered Luxury.
              <br />
              <span className="bg-gradient-to-r from-gold-400 to-amber-300 bg-clip-text text-transparent">
                Ethiopian Warmth.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-3 max-w-lg text-sm text-white/90 drop-shadow sm:text-base"
            >
              Kuriftu AI Nexus — where cutting-edge AI meets genuine Ethiopian hospitality.
              Three specialized agents orchestrate voice, concierge, and pricing operations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-6 flex flex-wrap gap-3"
            >
              <Button
                href="/#cta"
                variant="light"
                className="group relative overflow-hidden rounded-full px-5 py-2 text-sm font-semibold"
              >
                <span className="relative z-10">Explore the Nexus</span>
                <ArrowRight className="relative z-10 ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white to-gold-200"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </Button>
              <Button href="/#features" variant="ghost" className="rounded-full border-white/20 px-5 py-2 text-sm">
                Watch demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-3"
          >
            {[
              { icon: Clock, label: "Annual savings", value: "$31,000" },
              { icon: TrendingUp, label: "RevPAR uplift", value: "+23%" },
              { icon: Users, label: "Guest satisfaction", value: "+15%" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center gap-3 border-white/15 sm:border-l sm:pl-5 first:border-l-0 first:pl-0"
              >
                <div className="rounded-full bg-white/10 p-1.5">
                  <item.icon className="h-4 w-4 text-gold-400" />
                </div>
                <div>
                  <p className="text-xs text-white/70">{item.label}</p>
                  <p className="text-xl font-bold text-white drop-shadow">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <div className="h-7 w-4 rounded-full border border-white/30">
            <motion.div
              className="mx-auto mt-1 h-1 w-1 rounded-full bg-white"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Bar - Animated Counters */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="border-y border-white/10 bg-black/30 py-5 backdrop-blur-sm"
      >
        <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { label: "Annual Savings", value: <CountUpOnView prefix="$" to={31000} />, suffix: "/year" },
            { label: "RevPAR Uplift", value: <CountUpOnView prefix="+" to={23} suffix="%" /> },
            { label: "Direct Bookings", value: <CountUpOnView prefix="+" to={25} suffix="%" /> },
            { label: "Guest Satisfaction", value: <CountUpOnView prefix="+" to={15} suffix="%" /> },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-gold-400 sm:text-3xl">{item.value}</p>
              <p className="mt-1 text-xs font-medium text-white/80">{item.label}</p>
              {item.suffix && <p className="text-[10px] text-white/50">{item.suffix}</p>}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Gallery Filmstrip - Larger images */}
      <section className="relative overflow-hidden py-8">
        <div className="mb-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">On-property experience</p>
        </div>
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          >
            {[...resortGalleryKeys, ...resortGalleryKeys].map((key, idx) => (
              <div key={`${key}-${idx}`} className="shrink-0">
                <TiltCard>
                  <div className="relative h-40 w-60 overflow-hidden rounded-xl border border-white/10 shadow-md sm:h-48 sm:w-72">
                    <Image
                      src={resortImages[key as keyof typeof resortImages] || resortImages.hero}
                      alt=""
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </TiltCard>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Bento - Fixed text visibility */}
      <section id="features" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Platform"
            title="Everything Kuriftu needs to run smarter"
            subtitle="Modular AI that lives inside operations — not another siloed dashboard."
            className="text-white"
          />
          <div className="grid auto-rows-fr gap-5 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = iconMap[f.icon as keyof typeof iconMap];
              let spans = "min-h-[11rem]";
              if (i === 0) spans = "lg:col-span-2 lg:row-span-2 min-h-[18rem]";
              if (i === 3) spans = "lg:col-span-2 min-h-[12rem]";
              
              return (
                <TiltCard key={f.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`group relative h-full overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-white/5 to-transparent ${spans}`}
                  >
                    <motion.div
                      className="absolute inset-0"
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 14, repeat: Infinity }}
                    >
                      <Image
                        src={resortImages[f.image as keyof typeof resortImages] || resortImages.hero}
                        alt=""
                        fill
                        className="object-cover opacity-50 transition-opacity duration-500 group-hover:opacity-60"
                      />
                    </motion.div>
                    {/* Balanced gradient - text visible, images still show */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/10 to-transparent" />
                    <div className="relative flex h-full flex-col justify-end p-5">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/25 backdrop-blur-sm">
                        <Icon className="h-4.5 w-4.5 text-gold-400" />
                      </div>
                      <h3 className="text-base font-semibold text-white drop-shadow-md sm:text-lg">{f.title}</h3>
                      <p className="mt-1.5 text-sm font-medium text-white/90 leading-relaxed drop-shadow-sm">
                        {f.description}
                      </p>
                    </div>
                  </motion.div>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Split Section */}
      <section className="relative overflow-hidden border-y border-white/10 bg-black/30 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative aspect-[4/3] overflow-hidden rounded-xl"
          >
            <CinematicImage src={resortImages.resortGrounds} alt="Resort grounds" className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-tr from-gold-400/15 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Why Kuriftu AI Nexus</p>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white drop-shadow sm:text-3xl lg:text-4xl">
              Designed for owners, GMs, and front-line teams
            </h2>
            <p className="mt-4 text-sm text-white/85">
              The same platform that answers a 2 a.m. spa request also explains why rates moved on Saturday.
              Fewer tools, clearer stories, faster decisions.
            </p>
            <ul className="mt-8 space-y-3">
              {benefits.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-2"
                >
                  <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-400" />
                  <span className="text-sm text-white/85">{b}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Steps */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Flow"
            title="How it works"
            subtitle="From first contact to executive insight — one continuous loop."
            className="text-white"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, idx) => (
              <TiltCard key={s.n}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative rounded-xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-gold-400/20 text-lg font-bold text-gold-400">
                    0{s.n}
                  </div>
                  <h3 className="text-base font-semibold text-white drop-shadow-sm">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-white/80">{s.body}</p>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Voice + Benefits Card */}
      <section className="border-y border-white/10 bg-black/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative min-h-[15rem] overflow-hidden rounded-xl"
            >
              <CinematicImage src={resortImages.dining} alt="Dining" className="h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 text-base font-medium text-white drop-shadow-md sm:text-lg">
                Kuriftu guests expect quiet luxury. NEXORA keeps service invisible — and unforgettable.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm"
            >
              <Mic2 className="h-8 w-8 text-gold-400" />
              <p className="mt-4 text-xl font-semibold text-white drop-shadow sm:text-2xl">
                Voice and SMS that sound like your brand
              </p>
              <p className="mt-2 text-sm text-white/85">
                Policies, inventory, and guest context stay synchronized — so AI Receptionist never overpromises.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: "Routine call volume", value: "-38%" },
                  { label: "RevPAR uplift", value: "+12%" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                    <p className="text-xl font-bold text-gold-400 sm:text-2xl">{stat.value}</p>
                    <p className="mt-1 text-xs text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section id="demo" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Preview"
            title="NEXORA in two lenses"
            subtitle="Executive clarity and guest-facing polish — same data model, different surfaces."
            className="text-white"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <TiltCard>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-white/5 to-transparent"
              >
                <div className="border-b border-white/10 p-3">
                  <p className="text-xs font-semibold text-gold-400">Insights Dashboard</p>
                </div>
                <div className="grid gap-2 p-3 sm:grid-cols-2">
                  {[
                    { label: "Occupancy", value: "78%" },
                    { label: "ADR", value: "$284" },
                    { label: "Guest NPS", value: "62" },
                    { label: "AI tasks / day", value: "1,240" },
                  ].map((x) => (
                    <div key={x.label} className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <p className="text-[10px] text-white/60">{x.label}</p>
                      <p className="mt-0.5 text-lg font-bold text-white">{x.value}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 p-3">
                  <div className="h-16 rounded-lg bg-gradient-to-t from-gold-400/15 to-transparent" />
                  <p className="mt-2 text-center text-[9px] text-white/40">Revenue vs forecast · live</p>
                </div>
              </motion.div>
            </TiltCard>

            <TiltCard>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex min-h-[21rem] flex-col overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-white/5 to-transparent"
              >
                <div className="border-b border-white/10 bg-gold-400/10 px-4 py-2">
                  <p className="text-sm font-semibold text-white">Kuriftu Guest Concierge</p>
                  <p className="text-[10px] text-white/60">Online · NEXORA</p>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="ml-auto max-w-[85%] rounded-xl bg-gold-400/20 px-3 py-1.5 text-sm text-white">
                    Can you move dinner to 8pm and add a spa slot?
                  </div>
                  <div className="max-w-[85%] rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white">
                    Done. Dinner is now 8:00 PM at Lakehouse. Spa reserved for 4:30 PM — confirmation sent.
                  </div>
                  <div className="mt-auto flex gap-2 pt-2">
                    <input
                      readOnly
                      className="flex-1 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/40"
                      placeholder="Message..."
                    />
                    <button className="rounded-full bg-gold-400 px-4 py-1.5 text-sm font-semibold text-black">Send</button>
                  </div>
                </div>
              </motion.div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-white/10 bg-black/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Proof"
            title="Trusted where hospitality runs 24/7"
            subtitle="Real outcomes from properties using intelligent automation."
            className="text-white"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <TiltCard key={t.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="h-full rounded-xl border border-white/15 bg-white/5 p-5"
                >
                  <div className="relative mb-3 h-8 w-8 overflow-hidden rounded-full">
                    <Image
                      src={resortImages[t.photo as keyof typeof resortImages] || resortImages.hero}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm text-white/85">“{t.quote}”</p>
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-[10px] text-white/60">{t.role}</p>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="scroll-mt-20 pb-16 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative min-h-[13rem] overflow-hidden rounded-xl"
          >
            <CinematicImage src={resortImages.cta} alt="CTA" className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/25" />
            <div className="relative flex min-h-[13rem] flex-col items-center justify-center px-4 py-8 text-center">
              <h2 className="max-w-xl text-xl font-bold text-white drop-shadow-md sm:text-2xl lg:text-3xl">
                See NEXORA on Kuriftu — and your next property.
              </h2>
              <p className="mt-2 max-w-md text-xs text-white/85">
                Walk through IntelliRate, Service Optimizer, and guest-facing AI in one tailored session.
              </p>
              <Button href="mailto:hello@kuriftu.nexora" variant="light" className="mt-4 rounded-full px-5 py-1.5 text-xs">
                Book a demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}