import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@demo.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, passwordHash: hash, isAdmin: true },
    update: { passwordHash: hash, isAdmin: true },
  });

  const rooms = [
    { name: "Lake View Suite", description: "King bed, balcony", pricePerNight: 189 },
    { name: "Garden Room", description: "Queen bed, quiet wing", pricePerNight: 129 },
    { name: "Standard Twin", description: "Two twins, city view", pricePerNight: 99 },
  ];

  for (const r of rooms) {
    const existing = await prisma.room.findFirst({ where: { name: r.name } });
    if (!existing) {
      await prisma.room.create({ data: r });
    }
  }

  console.log("Seed OK:", { adminEmail, adminPassword: "(hidden)" });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
