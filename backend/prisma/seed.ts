import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // HACKATHON ADMIN CREDENTIALS (for judges testing)
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "hackathon@kuriftu.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "hackathon123";
  const hash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, passwordHash: hash, isAdmin: true, role: "ADMIN" },
    update: { passwordHash: hash, isAdmin: true, role: "ADMIN" },
  });

  // NOTE: This admin account is for HACKATHON JUDGES TESTING ONLY
  // Email: hackathon@kuriftu.local | Password: hackathon123
  // Provides full access to AI pricing controls and admin dashboard
  // This account will be REMOVED after hackathon evaluation

  const managerEmail = process.env.SEED_MANAGER_EMAIL ?? "manager@demo.local";
  const managerPassword = process.env.SEED_MANAGER_PASSWORD ?? "manager123";
  const managerHash = await bcrypt.hash(managerPassword, 10);
  await prisma.user.upsert({
    where: { email: managerEmail },
    create: {
      email: managerEmail,
      passwordHash: managerHash,
      isAdmin: false,
      role: "MANAGER",
    },
    update: { passwordHash: managerHash, role: "MANAGER" },
  });

  await prisma.user.updateMany({
    where: { isAdmin: true, role: "GUEST" },
    data: { role: "ADMIN" },
  });

  const lake = await prisma.resort.upsert({
    where: { slug: "kuriftu-lakeside" },
    create: {
      name: "Kuriftu Lakeside Resort",
      slug: "kuriftu-lakeside",
      region: "Lake Region",
      shortDescription: "Waterfront rooms, sunset dining, and a full marina.",
      fullDescription:
        "Our flagship lakeside property combines calm water views with running trails, a family pool, and evening live music on the deck.",
      address: "1 Lakeside Drive, Kuriftu",
      mapOverview:
        "One main lodge connects the lobby, reception, and restaurants. Guest room towers are west of the lobby; the spa and fitness wing sit to the east. The pool and marina are south, past the garden path. Parking is north of the lobby circle.",
    },
    update: {
      name: "Kuriftu Lakeside Resort",
      region: "Lake Region",
      shortDescription: "Waterfront rooms, sunset dining, and a full marina.",
      fullDescription:
        "Our flagship lakeside property combines calm water views with running trails, a family pool, and evening live music on the deck.",
      address: "1 Lakeside Drive, Kuriftu",
      mapOverview:
        "One main lodge connects the lobby, reception, and restaurants. Guest room towers are west of the lobby; the spa and fitness wing sit to the east. The pool and marina are south, past the garden path. Parking is north of the lobby circle.",
    },
  });

  const garden = await prisma.resort.upsert({
    where: { slug: "kuriftu-garden-spa" },
    create: {
      name: "Kuriftu Garden Spa Retreat",
      slug: "kuriftu-garden-spa",
      region: "Highland Gardens",
      shortDescription: "Quiet courtyards, thermal spa, and farm-to-table dining.",
      fullDescription:
        "Adults-forward retreat focused on wellness: hydrotherapy circuits, yoga pavilion, and tasting menus from the on-site garden.",
      address: "88 Garden Way, Kuriftu",
      mapOverview:
        "Arrival is at the Garden Pavilion lobby. Spa and thermal baths are central; restaurant and bar wrap the inner courtyard. Villa-style rooms radiate along gravel paths—follow signage by villa number. The yoga pavilion is uphill east; parking is beside the pavilion.",
    },
    update: {
      name: "Kuriftu Garden Spa Retreat",
      region: "Highland Gardens",
      shortDescription: "Quiet courtyards, thermal spa, and farm-to-table dining.",
      fullDescription:
        "Adults-forward retreat focused on wellness: hydrotherapy circuits, yoga pavilion, and tasting menus from the on-site garden.",
      address: "88 Garden Way, Kuriftu",
      mapOverview:
        "Arrival is at the Garden Pavilion lobby. Spa and thermal baths are central; restaurant and bar wrap the inner courtyard. Villa-style rooms radiate along gravel paths—follow signage by villa number. The yoga pavilion is uphill east; parking is beside the pavilion.",
    },
  });

  const lakeServiceCount = await prisma.resortService.count({ where: { resortId: lake.id } });
  if (lakeServiceCount === 0) {
    await prisma.resortService.createMany({
      data: [
        {
          resortId: lake.id,
          category: "dining",
          title: "Lakeside Grill",
          description: "Open-flame steaks, fresh fish, and lakeside seating.",
          hours: "12:00–22:00 daily",
          locationNote: "Main lodge, ground floor, terrace side",
          howToBook: "Walk-in or ask concierge for a reservation.",
        },
        {
          resortId: lake.id,
          category: "dining",
          title: "Sunrise Café",
          description: "Coffee, pastries, and light lunch.",
          hours: "06:30–15:00",
          locationNote: "Lobby level, east wing",
          howToBook: "No reservation needed.",
        },
        {
          resortId: lake.id,
          category: "spa",
          title: "Lakeside Spa",
          description: "Massages, facials, and couples suites.",
          hours: "09:00–21:00",
          locationNote: "East wing, level 2",
          howToBook: "Book at spa desk or dial 7000 from your room.",
        },
        {
          resortId: lake.id,
          category: "pool",
          title: "Family Lagoon Pool",
          description: "Heated outdoor pool with shallow kids area and towel service.",
          hours: "07:00–20:00",
          locationNote: "South of main lodge, past the garden path",
          howToBook: "Included for guests; towels at pool hut.",
        },
        {
          resortId: lake.id,
          category: "fitness",
          title: "Marina Fitness",
          description: "Cardio, free weights, and stretch studio.",
          hours: "24 hours with room key",
          locationNote: "East wing, ground floor",
          howToBook: "Use your key card.",
        },
        {
          resortId: lake.id,
          category: "activities",
          title: "Kayak and paddleboard",
          description: "Calm-water rentals and guided sunrise paddles.",
          hours: "08:00–18:00 seasonal",
          locationNote: "Marina dock",
          howToBook: "Sign up at the marina hut; life jackets provided.",
        },
        {
          resortId: lake.id,
          category: "transport",
          title: "Airport shuttle",
          description: "Shared rides to the regional airport.",
          hours: "On schedule; front desk has times",
          locationNote: "Pickup at main circle",
          howToBook: "Reserve 24 hours ahead at reception.",
        },
        {
          resortId: lake.id,
          category: "concierge",
          title: "Concierge desk",
          description: "Tours, restaurant bookings outside the resort, and special occasions.",
          hours: "07:00–23:00",
          locationNote: "Lobby center",
          howToBook: "Visit the desk or submit a request through the app or voice assistant.",
        },
        {
          resortId: lake.id,
          category: "in_room",
          title: "In-room dining",
          description: "Full menu from Lakeside Grill delivered to your room.",
          hours: "12:00–22:00",
          locationNote: "Dial 7500",
          howToBook: "Phone or app order; average delivery 35 minutes.",
        },
        {
          resortId: lake.id,
          category: "kids",
          title: "Kids’ club",
          description: "Crafts, games, and supervised play for ages 4–12.",
          hours: "10:00–17:00 weekends; weekdays by schedule",
          locationNote: "West tower, ground floor",
          howToBook: "Register at concierge; space limited.",
        },
      ],
    });
  }

  const gardenServiceCount = await prisma.resortService.count({ where: { resortId: garden.id } });
  if (gardenServiceCount === 0) {
    await prisma.resortService.createMany({
      data: [
        {
          resortId: garden.id,
          category: "wellness",
          title: "Thermal bath circuit",
          description: "Hot pools, cold plunge, and steam rooms.",
          hours: "08:00–22:00",
          locationNote: "Central spa building",
          howToBook: "Included for guests; book peak slots at spa reception.",
        },
        {
          resortId: garden.id,
          category: "spa",
          title: "Garden Spa treatments",
          description: "Herbal wraps, deep tissue, and aromatherapy.",
          hours: "09:00–20:00",
          locationNote: "Central spa building, upper level",
          howToBook: "Reserve online, app, spa desk, or ask the voice assistant to note your preference.",
        },
        {
          resortId: garden.id,
          category: "dining",
          title: "Garden Table",
          description: "Tasting menu from the resort garden and local farms.",
          hours: "18:00–22:00 Wed–Sun",
          locationNote: "Inner courtyard",
          howToBook: "Reservations required; concierge can assist.",
        },
        {
          resortId: garden.id,
          category: "dining",
          title: "Courtyard Bar",
          description: "Small plates, natural wines, and zero-proof cocktails.",
          hours: "16:00–00:00",
          locationNote: "Courtyard level",
          howToBook: "Walk-in; large groups call ahead.",
        },
        {
          resortId: garden.id,
          category: "activities",
          title: "Yoga pavilion",
          description: "Daily vinyasa and restorative classes.",
          hours: "Schedule at reception",
          locationNote: "East path, uphill from spa",
          howToBook: "Sign up sheet at spa or morning announcement.",
        },
        {
          resortId: garden.id,
          category: "fitness",
          title: "Movement studio",
          description: "Pilates equipment and open mat space.",
          hours: "07:00–21:00",
          locationNote: "Next to thermal baths",
          howToBook: "Drop-in; classes posted weekly.",
        },
        {
          resortId: garden.id,
          category: "concierge",
          title: "Wellness concierge",
          description: "Itineraries, hiking guides, and meditation sessions.",
          hours: "08:00–20:00",
          locationNote: "Garden Pavilion lobby",
          howToBook: "Book at desk or via service request.",
        },
        {
          resortId: garden.id,
          category: "transport",
          title: "Village shuttle",
          description: "Hourly loop to the nearby village market.",
          hours: "10:00–18:00",
          locationNote: "Pickup at pavilion circle",
          howToBook: "No booking; check times at reception.",
        },
        {
          resortId: garden.id,
          category: "in_room",
          title: "Turndown and aromatherapy",
          description: "Optional evening service with herbal sachets.",
          hours: "Evening",
          locationNote: "Request from room",
          howToBook: "Dial guest services or use voice assistant.",
        },
      ],
    });
  }

  const lakePlaceCount = await prisma.mapPlace.count({ where: { resortId: lake.id } });
  if (lakePlaceCount === 0) {
    await prisma.mapPlace.createMany({
      data: [
        {
          resortId: lake.id,
          name: "Main lobby and reception",
          category: "lobby",
          building: "Main lodge",
          floor: "Ground",
          directionsFromLobby: "You are here—reception is straight ahead; concierge is to the right.",
        },
        {
          resortId: lake.id,
          name: "Lakeside Grill",
          category: "restaurant",
          building: "Main lodge",
          floor: "Ground, terrace",
          directionsFromLobby: "From lobby, follow signs west past the elevators; exit to the terrace.",
        },
        {
          resortId: lake.id,
          name: "Guest room towers",
          category: "room_tower",
          building: "West tower / East tower",
          floor: "Varies",
          directionsFromLobby: "West tower elevators on the left from reception; east tower past Sunrise Café.",
        },
        {
          resortId: lake.id,
          name: "Lakeside Spa",
          category: "spa",
          building: "East wing",
          floor: "Level 2",
          directionsFromLobby: "Cross the lobby to the east wing stairs or elevator; spa desk on level 2.",
        },
        {
          resortId: lake.id,
          name: "Family Lagoon Pool",
          category: "pool",
          building: "Outdoor",
          floor: "Pool deck",
          directionsFromLobby: "Exit south doors from the lobby, follow the garden path 2 minutes.",
        },
        {
          resortId: lake.id,
          name: "Marina and kayak hut",
          category: "landmark",
          building: "Dock",
          floor: "Water level",
          directionsFromLobby: "Past the pool, continue south on the lakeside boardwalk.",
        },
        {
          resortId: lake.id,
          name: "Guest parking",
          category: "parking",
          building: "North lot",
          floor: "Outdoor",
          directionsFromLobby: "Exit north entrance; parking attendant can direct you.",
        },
      ],
    });
  }

  const gardenPlaceCount = await prisma.mapPlace.count({ where: { resortId: garden.id } });
  if (gardenPlaceCount === 0) {
    await prisma.mapPlace.createMany({
      data: [
        {
          resortId: garden.id,
          name: "Garden Pavilion lobby",
          category: "lobby",
          building: "Pavilion",
          floor: "Ground",
          directionsFromLobby: "Arrival point—wellness concierge is left; spa corridor straight ahead.",
        },
        {
          resortId: garden.id,
          name: "Thermal bath entrance",
          category: "spa",
          building: "Spa",
          floor: "Ground",
          directionsFromLobby: "From lobby, take the glass corridor labeled Spa; check in at thermal desk.",
        },
        {
          resortId: garden.id,
          name: "Garden Table restaurant",
          category: "restaurant",
          building: "Courtyard",
          floor: "Ground",
          directionsFromLobby: "Exit lobby to the inner courtyard; restaurant occupies the north arc.",
        },
        {
          resortId: garden.id,
          name: "Courtyard Bar",
          category: "restaurant",
          building: "Courtyard",
          floor: "Ground",
          directionsFromLobby: "Opposite Garden Table, south arc of the courtyard.",
        },
        {
          resortId: garden.id,
          name: "Villa path A–F",
          category: "room_tower",
          building: "Villas",
          floor: "Single-story",
          directionsFromLobby: "West gate from courtyard; follow gravel path and villa letter signs.",
        },
        {
          resortId: garden.id,
          name: "Yoga pavilion",
          category: "landmark",
          building: "Hill pavilion",
          floor: "Open air",
          directionsFromLobby: "East path from spa; 4-minute uphill walk, lit at night.",
        },
        {
          resortId: garden.id,
          name: "Pavilion parking",
          category: "parking",
          building: "Upper lot",
          floor: "Outdoor",
          directionsFromLobby: "Continue past the pavilion entrance; valet optional at peak hours.",
        },
      ],
    });
  }

  const rooms = [
    { name: "Lake View Suite", description: "King bed, balcony", pricePerNight: 189 },
    { name: "Garden Room", description: "Queen bed, quiet wing", pricePerNight: 129 },
    { name: "Standard Twin", description: "Two twins, city view", pricePerNight: 99 },
  ];

  for (const r of rooms) {
    const existing = await prisma.room.findFirst({ where: { name: r.name } });
    if (!existing) {
      await prisma.room.create({
        data: { ...r, resortId: lake.id },
      });
    } else if (!existing.resortId) {
      await prisma.room.update({
        where: { id: existing.id },
        data: { resortId: lake.id },
      });
    }
  }

  await seedServicePricingAndImages();

  console.log("Seed OK:", {
    adminEmail,
    adminPassword: "(hidden)",
    managerEmail,
    managerPassword: "(hidden)",
    resorts: [lake.slug, garden.slug],
  });
}

const CATEGORY_IMAGES: Record<string, string> = {
  dining:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=85",
  spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=85",
  wellness:
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=85",
  pool: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=85",
  fitness:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85",
  activities:
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1600&q=85",
  transport:
    "https://images.unsplash.com/photo-1449965408869-eaa3f487e34f?auto=format&fit=crop&w=1600&q=85",
  concierge:
    "https://images.unsplash.com/photo-1566073771259-6a850609994b?auto=format&fit=crop&w=1600&q=85",
  in_room:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85",
  kids: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=85",
  default:
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=85",
};

function hashTitle(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (Math.imul(31, h) + title.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function priceCentsForService(title: string): number {
  return 4500 + (hashTitle(title) % 32000);
}

function imageForCategory(category: string): string {
  const k = category.toLowerCase().trim();
  return CATEGORY_IMAGES[k] ?? CATEGORY_IMAGES.default;
}

async function seedServicePricingAndImages() {
  const services = await prisma.resortService.findMany();
  for (const s of services) {
    const base = priceCentsForService(s.title);
    await prisma.resortService.update({
      where: { id: s.id },
      data: {
        imageUrl: imageForCategory(s.category),
        basePriceCents: base,
        publishedPriceCents: base,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
