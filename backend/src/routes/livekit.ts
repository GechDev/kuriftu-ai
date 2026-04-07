import { Router } from "express";
import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";

const router = Router();

// LiveKit token endpoint - deployed version
router.post("/token", (req: Request, res: Response) => {
  try {
    const { roomName, participantName } = req.body;
    
    // Generate proper LiveKit JWT token
    const apiSecret = process.env.LIVEKIT_API_SECRET || "nbDCCYIs5WHta7cVyUDUnfpdJ9lf4HmkUO7yCqeoD7fC";
    const apiKey = process.env.LIVEKIT_API_KEY || "API4ZSZ8bpjaMoB";
    
    // Create proper LiveKit video grant
    const videoGrant = {
      room: roomName || "default-room",
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    };
    
    // Generate JWT with LiveKit specific structure
    const token = jwt.sign(
      {
        iss: apiKey,
        sub: participantName || "guest",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        video: videoGrant,
        metadata: JSON.stringify({
          participantName: participantName || "Guest User",
          room: roomName || "default-room"
        }),
      },
      apiSecret,
      { algorithm: "HS256" }
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

// Add GET method for debugging
router.get("/token", (req: Request, res: Response) => {
  res.json({
    message: "LiveKit token endpoint is working",
    method: "GET - use POST for actual token",
    timestamp: new Date().toISOString()
  });
});

export default router;
