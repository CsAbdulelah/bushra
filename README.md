# Bushra — Alinma Bank AI Assistant (web)

Conversational banking assistant for Alinma Bank. Chat + voice UI, ported from the `dc-runtime` prototype in `Bushra AI assistant prototype/` into a real Next.js app.

## Quick start

```bash
bun install
cp .env.local.example .env.local
bun run dev:mock          # Next.js on :3000 + in-repo mock agent on :8787
```

Open http://localhost:3000. Click the "بشرى" floating button in the bottom-left.

## Structure

```
app/                         Next.js App Router
  api/bank/*                 Mock banking API (called by the agent, not the browser)
components/
  dashboard/                 Ported Alinma dashboard (Header, Sidebar, Accounts, Cards, ...)
  bushra/                    Assistant surfaces (FAB, ChatPanel, FlowCards, VoiceModal, ...)
lib/
  bushra/events.ts           SHARED CONTRACT — mirror in colleague repos
  bushra/session.ts          SSE client to the agent service
  bushra/voice.ts            Mic capture → ASR WebSocket
  bushra/audio-player.ts     Streaming TTS playback
  bank/                      Fixtures + auth wrapper for /api/bank
hooks/
  useBushra.ts, useVoice.ts
mock-agent/
  server.ts                  Bun SSE server, unblocks web dev before the real agent ships
```

## The three seams

1. **Web ⇄ Agent** — REST + SSE. See `INTEGRATION.md`.
2. **Web ⇄ ASR** — WebSocket (browser sends audio, ASR sends transcript JSON).
3. **Agent ⇄ Bank** — REST, server-to-server, with `X-Bushra-Mock-Key`.

The web app knows nothing about tools, LLMs, or TTS internals. It just renders whatever `BushraEvent`s the agent streams.

## Scripts

| Script | Purpose |
|---|---|
| `bun run dev` | Next dev server only |
| `bun run mock-agent` | Just the mock agent (port 8787) |
| `bun run dev:mock` | Both in parallel |
| `bun run build` / `bun run start` | Production build + start |
| `bun run typecheck` | Type check the whole tree |

## Swapping in real services

Set these in `.env.local`:

```
NEXT_PUBLIC_AGENT_URL=https://your-agent.example.com
NEXT_PUBLIC_ASR_URL=wss://your-asr.example.com/stream
BUSHRA_MOCK_BANK_KEY=<shared-secret>
BUSHRA_AGENT_ORIGIN=https://your-agent.example.com
```

If the agent honors the envelope in `lib/bushra/events.ts`, nothing else in the web app changes.
