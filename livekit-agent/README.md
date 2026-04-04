# Kuriftu LiveKit voice agent

Voice layer on top of the booking REST API (`../backend`). Guests use voice to **browse rooms, check availability, and get quotes** (no sign-in on voice). **Admin** tools are optional when `BOOKING_API_TOKEN` is set to a staff JWT.

## Prerequisites

- [LiveKit CLI](https://docs.livekit.io/intro/basics/cli/) (`winget install LiveKit.LiveKitCLI` on Windows)
- Python **3.11–3.12** recommended (3.14 on Windows can hit asyncio/IPC quirks with the dev reloader)
- Running booking API (local or public URL)

## Configure

Copy `.env.example` to `.env.local` and set:

- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` — from [LiveKit Cloud](https://cloud.livekit.io/) or use:

  `lk cloud auth` then `lk app env -w -d .env.local`

- `BOOKING_API_BASE` — base URL of the Express backend (no trailing slash).  
  **Deployed agents cannot reach `localhost`:** use a public URL or tunnel (e.g. ngrok) for your API.

- Optional: `BOOKING_API_TOKEN` (or `BOOKING_API_BEARER`) — staff JWT so voice can call **admin** endpoints. Omit for guest-only voice.

## Local run

```bash
cd livekit-agent
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -e .
python -m kuriftu_agent.agent download-files
python -m kuriftu_agent.agent console
```

For a real room connection:

```bash
python -m kuriftu_agent.agent dev
```

**Windows:** auto-reload uses a pipe that sometimes fails on shutdown (`OSError: [WinError 87]` / `DuplexClosed`). Run without the file watcher:

```bash
python -m kuriftu_agent.agent dev --no-reload
```

Or use production-style mode (no dev coloring, no reload):

```bash
python -m kuriftu_agent.agent start
```

## Deploy to LiveKit Cloud

From this directory:

```bash
lk cloud auth
lk agent create
```

Follow the CLI prompts. Set Cloud **secrets** for anything sensitive, including `BOOKING_API_BASE` and API keys your stack needs.

See [Agent deployment](https://docs.livekit.io/deploy/agents/).

## Agent name

Register dispatch for agent name **`kuriftu-hotel`** (see `@server.rtc_session` in `src/agent.py`).
