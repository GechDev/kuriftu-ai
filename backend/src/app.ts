import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { buildCorsOptions } from "./lib/cors-options.js";
import { prisma } from "./lib/prisma.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { bookingsRouter } from "./routes/bookings.js";
import { notificationsRouter } from "./routes/notifications.js";
import { profileRouter } from "./routes/profile.js";
import { resortsRouter } from "./routes/resorts.js";
import { roomsRouter } from "./routes/rooms.js";
import { serviceRequestsRouter } from "./routes/serviceRequests.js";
import { publicCatalogRouter } from "./routes/public-catalog.js";
import { pricingAdminRouter } from "./routes/pricing-admin.js";
import { seedRouter } from "./routes/seed.js";
import livekitRouter from "./routes/livekit.js";

export function createApp() {
  const app = express();

  if (process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
  }

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });

  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: "1mb" }));

  app.use(
    (
      err: unknown,
      _req: Request,
      res: Response,
      next: NextFunction
    ): void => {
      const isParse =
        err instanceof SyntaxError &&
        err.message.includes("JSON") &&
        "body" in err;
      const maybeBodyParser =
        err &&
        typeof err === "object" &&
        "type" in err &&
        (err as { type?: string }).type === "entity.parse.failed";
      if (isParse || maybeBodyParser) {
        res.status(400).json({ error: "Invalid JSON body" });
        return;
      }
      next(err);
    }
  );

  app.get("/health", async (_req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: 'disconnected'
    });
  }
});

  app.use("/api/auth", authRouter);
  app.use("/api/public", publicCatalogRouter);
  app.use("/api/pricing", pricingAdminRouter);
  app.use("/api/seed", seedRouter);
  app.use("/api", profileRouter);
  app.use("/api/resorts", resortsRouter);
  app.use("/api/rooms", roomsRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/service-requests", serviceRequestsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/livekit", livekitRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
