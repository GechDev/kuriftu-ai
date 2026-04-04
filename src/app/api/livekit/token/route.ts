import { AgentDispatchClient, AccessToken } from "livekit-server-sdk";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { livekitHttpUrl } from "@/lib/livekit-url";

const AGENT_NAME = "kuriftu-hotel";

const backendBase =
  process.env.BACKEND_INTERNAL_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:4000";

export async function POST(req: Request) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl =
    process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return NextResponse.json(
      {
        error:
          "Missing LIVEKIT_API_KEY, LIVEKIT_API_SECRET, or LIVEKIT_URL / NEXT_PUBLIC_LIVEKIT_URL",
      },
      { status: 500 }
    );
  }

  let body: { roomName?: string; bookingToken?: string | null } = {};
  try {
    body = await req.json();
  } catch {
    /* optional body */
  }

  const roomName =
    typeof body.roomName === "string" && body.roomName.trim().length > 0
      ? body.roomName.trim().slice(0, 128)
      : `voice-${randomUUID()}`;

  let bookingToken: string | undefined;
  if (
    typeof body.bookingToken === "string" &&
    body.bookingToken.trim().length > 0
  ) {
    bookingToken = body.bookingToken.trim();
    const me = await fetch(`${backendBase}/api/me`, {
      headers: { Authorization: `Bearer ${bookingToken}` },
    });
    if (!me.ok) {
      return NextResponse.json(
        { error: "Invalid or expired booking session" },
        { status: 401 }
      );
    }
  }

  const httpUrl = livekitHttpUrl(livekitUrl);

  try {
    const dispatchClient = new AgentDispatchClient(httpUrl, apiKey, apiSecret);
    await dispatchClient.createDispatch(roomName, AGENT_NAME);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: "Failed to dispatch voice agent", detail: message },
      { status: 502 }
    );
  }

  const identity = `guest-${randomUUID()}`;
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: "Guest",
    ttl: "1h",
    ...(bookingToken
      ? { attributes: { kuriftu_jwt: bookingToken } as Record<string, string> }
      : {}),
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({
    token,
    roomName,
    serverUrl: livekitUrl,
    linkedAccount: Boolean(bookingToken),
  });
}
