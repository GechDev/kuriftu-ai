import { prisma } from "./prisma.js";

export async function notifyUser(userId: string, title: string, body: string) {
  return prisma.notification.create({
    data: { userId, title, body },
  });
}
