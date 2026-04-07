import { Router } from "express";
import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";

const router = Router();

// Generate LiveKit token for frontend
router.post("/token", (req: Request, res: Response) => {
  try {
    const { roomName, participantName } = req.body;
    
    // Generate a real JWT token for LiveKit
    const token = jwt.sign(
      {
        identity: participantName || "guest",
        name: participantName || "Guest User",
        metadata: `room:${roomName || "default"}`,
      },
      process.env.LIVEKIT_API_SECRET || "fallback-secret",
      {
        expiresIn: "24h",
        issuer: process.env.LIVEKIT_API_KEY || "API4ZSZ8bpjaMoB",
        subject: participantName || "guest",
      }
    );
    
    res.json({
      token: token,
      serverUrl: process.env.LIVEKIT_URL || "wss://kuriftu-ai-nwgrgp4i.livekit.cloud",
      roomName: roomName || "default-room",
      participantName: participantName || "guest"
    });
  } catch (error) {
    console.error("LiveKit token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

export default router;
