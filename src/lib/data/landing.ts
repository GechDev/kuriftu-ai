import type { ResortImageKey } from "@/lib/resortImages";

export const features = [
  {
    id: "receptionist",
    title: "AI Receptionist",
    description:
      "Voice and SMS that books, reschedules, and answers policy-aware FAQs — without the hold music.",
    icon: "phone" as const,
    image: "lobby" satisfies ResortImageKey,
  },
  {
    id: "concierge",
    title: "AI Concierge",
    description:
      "Around-the-clock itineraries, amenities, and requests shaped by each guest’s stay context.",
    icon: "concierge" as const,
    image: "sunsetDeck" satisfies ResortImageKey,
  },
  {
    id: "intellirate",
    title: "IntelliRate Engine",
    description:
      "Room rates that respond to demand, events, and comp sets — transparent, explainable, fast.",
    icon: "chart" as const,
    image: "minimalSuite" satisfies ResortImageKey,
  },
  {
    id: "memory",
    title: "Guest Memory System",
    description:
      "Preferences, occasions, and history surfaced to staff so every return feels remembered.",
    icon: "brain" as const,
    image: "wellnessDetail" satisfies ResortImageKey,
  },
  {
    id: "insights",
    title: "Insights Dashboard",
    description:
      "Executive narratives on revenue, satisfaction, and operations — ready for the boardroom.",
    icon: "layout" as const,
    image: "aerialLake" satisfies ResortImageKey,
  },
] as const;

export const steps = [
  {
    n: 1,
    title: "Guest interacts",
    body: "Calls, chats, or messages — every channel meets the same intelligent layer.",
  },
  {
    n: 2,
    title: "AI understands intent",
    body: "NLP and resort context resolve requests with policies and availability in mind.",
  },
  {
    n: 3,
    title: "Tasks are automated",
    body: "Bookings, upsells, and service tickets flow to your PMS and teams automatically.",
  },
  {
    n: 4,
    title: "Insights are generated",
    body: "Leadership sees pricing, demand, and satisfaction signals without digging through spreadsheets.",
  },
];

export const benefits = [
  "Reduce staff workload on repetitive guest touchpoints",
  "Increase revenue with intelligent pricing and timely upsells",
  "Improve guest satisfaction through speed and personalization",
  "24/7 intelligent automation that scales with occupancy",
];

export const testimonials = [
  {
    id: "1",
    quote:
      "We reclaimed dozens of front-desk hours weekly. RevPAR is up meaningfully after IntelliRate went live.",
    name: "Elena Marchetti",
    role: "General Manager, Lakeside Resort Group",
    photo: "villa" satisfies ResortImageKey,
  },
  {
    id: "2",
    quote:
      "The concierge automation feels invisible to guests — exactly what we wanted. NEXORA paid for itself in a quarter.",
    name: "James Okonkwo",
    role: "Director of Operations, Urban Heritage Hotels",
    photo: "infinityPool" satisfies ResortImageKey,
  },
  {
    id: "3",
    quote:
      "Finally a platform built for hoteliers, not generic chatbots. The insights layer is board-meeting ready.",
    name: "Sofia Andersson",
    role: "VP Revenue, Nordic Hospitality Collective",
    photo: "wineLounge" satisfies ResortImageKey,
  },
] as const;
