import { Router } from "express";
import { asyncHandler, routeParamId } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await prisma.notification.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ notifications: items });
  })
);

notificationsRouter.patch(
  "/:id/read",
  asyncHandler(async (req: AuthedRequest, res) => {
    const id = routeParamId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const n = await prisma.notification.findFirst({
      where: { id, userId: req.userId! },
    });
    if (!n) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    const updated = await prisma.notification.update({
      where: { id: n.id },
      data: { read: true },
    });
    res.json({ notification: updated });
  })
);

notificationsRouter.post(
  "/read-all",
  asyncHandler(async (req: AuthedRequest, res) => {
    await prisma.notification.updateMany({
      where: { userId: req.userId!, read: false },
      data: { read: true },
    });
    res.json({ ok: true });
  })
);
