import { Router } from "express";
import { type Request, type Response } from "express";

const router = Router();

// Generate LiveKit token for frontend
router.post("/token", (req: Request, res: Response) => {
  try {
    const { roomName, participantName } = req.body;
    
    // For now, return a mock token - in production you'd generate real tokens
    // This is a temporary fix to get voice working
    
    res.json({
      token: "mock-token-for-testing", // Replace with real token generation
      url: "wss://kuriftu-ai-nwgrgp4i.livekit.cloud",
      roomName: roomName || "default-room",
      participantName: participantName || "guest"
    });
  } catch (error) {
    console.error("LiveKit token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

export default router;
