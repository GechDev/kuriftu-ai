/**
 * Curated luxury resort photography — African lakeside / savanna aesthetic.
 * All images are high-res, cinematic, and optimized for hero & card layouts.
 */
export const resortImages = {
  // ----- HERO & LANDING -----
  hero: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2600&q=90",
  // ^ African luxury lodge with thatched roofs, warm sunset

  roomsHero: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2600&q=90",
  resortsHero: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=2600&q=90",

  // ----- ROOMS & SUITES -----
  penthouseSuite: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2200&q=90",
  familySuite: "https://images.unsplash.com/photo-1564078516393-cf04bd966897?auto=format&fit=crop&w=2200&q=90",
  lakeVilla: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2200&q=90",
  minimalSuite: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=2000&q=90",

  // ----- RESORT GROUNDS & ARCHITECTURE -----
  resortAerialLuxury: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2600&q=90",
  resortSpaGarden: "https://images.unsplash.com/photo-1542317854-6d8d523d7f8d?auto=format&fit=crop&w=2200&q=90",
  resortGrounds: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=90",
  hotelFacade: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=2000&q=90",

  // ----- POOLS & WATER -----
  lagoon: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85",
  tropicalPool: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=2000&q=85",
  infinityPool: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85",
  aerialLake: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=2400&q=85",
  sunsetDeck: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=85",

  // ----- SPA & WELLNESS -----
  spa: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=85",
  wellnessDetail: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=85",

  // ----- DINING -----
  dining: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2000&q=85",
  wineLounge: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=2000&q=85",

  // ----- VILLA & LOBBY -----
  villa: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=2000&q=85",
  lobby: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85",
  suite: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2000&q=85",

  // ----- LANDSCAPES & CTAs -----
  landscape: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=85",
  cta: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=85",
} as const;

export type ResortImageKey = keyof typeof resortImages;

/** Horizontal gallery / masonry sources – all high-impact visuals */
export const resortGalleryKeys: ResortImageKey[] = [
  "lagoon",
  "tropicalPool",
  "spa",
  "dining",
  "infinityPool",
  "suite",
  "sunsetDeck",
  "wineLounge",
  "aerialLake",
  "villa",
  "wellnessDetail",
];