import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

export const seedRouter = Router();

// Temporary endpoint for seeding - REMOVE IN PRODUCTION
seedRouter.post("/run", async (req, res) => {
  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@demo.local";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
    const hash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.upsert({
      where: { email: adminEmail },
      create: { email: adminEmail, passwordHash: hash, isAdmin: true, role: "ADMIN" },
      update: { passwordHash: hash, isAdmin: true, role: "ADMIN" },
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
        slug: "kuriftu-lakeside",
        region: "Lake Region",
        shortDescription: "Waterfront rooms, sunset dining, and a full marina.",
        fullDescription:
          "Our flagship lakeside property combines calm water views with running trails, a family pool, and evening live music on the deck.",
        address: "1 Lakeside Drive, Kuriftu",
        mapOverview:
          "One main lodge connects the lobby, reception, and restaurants. Guest room towers are west of the lobby; the spa and fitness wing sit to the east. The pool and marina are south, past the garden path. Parking is north of the lobby circle.",
      },
    });

    // Add sample services
    const services = [
      {
        resortId: lake.id,
        category: "Spa",
        title: "Signature Massage",
        description: "60-minute full body massage with essential oils",
        hours: "1 hour",
        locationNote: "Spa Wing, Floor 2",
        howToBook: "Book at reception or call extension 200",
        basePriceCents: 12000,
        publishedPriceCents: 15000,
      },
      {
        resortId: lake.id,
        category: "Dining",
        title: "Lakeside Dinner",
        description: "3-course meal with sunset view",
        hours: "2-3 hours",
        locationNote: "Main Restaurant",
        howToBook: "Reservations required",
        basePriceCents: 8000,
        publishedPriceCents: 10000,
      },
      {
        resortId: lake.id,
        category: "Room Types",
        title: "Deluxe Lake View",
        description: "Premium room with balcony overlooking the lake",
        hours: "Check-in 3PM, Check-out 11AM",
        locationNote: "Tower A, Floors 3-8",
        howToBook: "Book online or at reception",
        basePriceCents: 20000,
        publishedPriceCents: 25000,
      },
    ];

    for (const service of services) {
      await prisma.resortService.upsert({
        where: {
          id: `${service.resortId}_${service.category}_${service.title}`.replace(/\s+/g, '_').toLowerCase(),
        },
        create: {
          ...service,
          id: `${service.resortId}_${service.category}_${service.title}`.replace(/\s+/g, '_').toLowerCase(),
        },
        update: service,
      });
    }

    res.json({ 
      success: true, 
      message: "Database seeded successfully",
      data: {
        resort: lake.name,
        servicesCount: services.length
      }
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});
