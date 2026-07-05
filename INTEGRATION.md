# Bushra — Integration Contract

Hand this file to whoever is building the LLM/Agent, TTS, and ASR services. It defines what the web app expects. The event types live in `lib/bushra/events.ts` — mirror that file in your service to stay in sync.

---

## Services & responsibilities

| Service | Owner | What it does |
|---|---|---|
| Agent (LLM + orchestration + tool use) | Colleague | Receives user text, streams `BushraEvent`s back over SSE. Calls the bank tools server-to-server. |
| TTS | Colleague | Produces audio; the agent forwards it inline on the same SSE stream as `audio_chunk` events. |
| ASR | Colleague | WebSocket endpoint; browser sends mic audio, service sends `{type: 'partial'|'final'}` JSON. |
| Web app (this repo) | You | Renders chat UI, dashboard, flow cards, confirmation modals. |
| Mock banking (this repo) | You | Exposes `/api/bank/*` for the agent to call as tools. |

**Tool execution is agent-side.** The browser never calls the bank API. When the agent decides to freeze a card, it POSTs `POST /api/bank/cards/:id/freeze` itself, then emits `tool_call` / `tool_result` events so the UI can render the intermediate state.

---

## HTTP endpoints the agent must expose

### `POST /chat`

**Request:**
```json
{ "sessionId": "uuid", "text": "حولي 300 ريال لمحمد" }
```

**Response:** `text/event-stream` — one `BushraEvent` per SSE frame. Frames end with `\n\n`. Keep the connection open until a `done` event is sent; the browser handles this.

### `POST /confirmations`

Called by the browser when a `requires_confirmation` prompt is resolved.

**Request:**
```json
{ "sessionId": "uuid", "promptId": "uuid", "ok": true, "otp": "123456" }
```
or
```json
{ "sessionId": "uuid", "promptId": "uuid", "ok": false, "reason": "user_cancelled" }
```

**Response:** `200 OK` (empty body is fine). The agent should resume the paused turn and keep streaming to the still-open `/chat` SSE.

### `GET /health` → `{ "ok": true }`

---

## SSE event envelope

Every frame is `data: <JSON>\n\n`. `<JSON>` must be one of:

| Type | Fields | When to emit |
|---|---|---|
| `session` | `sessionId` | Once, at the start of a stream |
| `message_start` | `messageId`, `role: "assistant"` | Before streaming tokens for an assistant message |
| `token` | `text` | For each streamed token (or chunk) |
| `message_end` | `messageId` | End of an assistant message |
| `tool_call` | `toolCallId`, `name`, `args` | Immediately before executing a tool |
| `tool_result` | `toolCallId`, `ok`, `summary?` | After the tool returns |
| `audio_chunk` | `mime`, `data` (base64), `sampleRate?` | Streaming TTS audio inline |
| `flow` | `flow` (id or null), `context?` | Tells UI which flow card to render — see below |
| `requires_confirmation` | `kind: "face_id" \| "otp"`, `promptId`, `context?` | Pause the turn; browser POSTs `/confirmations` to resume |
| `error` | `message`, `recoverable` | Something went wrong |
| `done` | — | End of the stream |

### `flow` ids

Match `FlowId` in `events.ts`:

- `balance`, `transfer-confirm`, `otp-entry`, `bill-confirm`, `card-freeze`, `card-unfreeze`, `savings`, `transactions`, `digital-products`

`context` is a bag the agent can use to parameterize the card:

- `transfer-confirm` → `{ amount, recipient }`
- `bill-confirm` → `{ options: [{id,label,amount}] }` or `{ selected: { biller, amount, due } }`
- `savings` → `{ rate, monthly, yearly }`
- `requires_confirmation` (otp) → `{ otpMaskedPhone }`

Emit `flow: null` to clear the active card.

---

## Mock banking (called by the agent, not the browser)

Base URL: whatever URL this Next app is deployed at (`/api/bank/*`).

- `GET  /api/bank/accounts`
- `GET  /api/bank/cards`
- `POST /api/bank/cards/:id/freeze` `{ frozen: boolean }`
- `POST /api/bank/transfers` `{ fromAccountId, recipient, amount }`
- `POST /api/bank/bills/pay` `{ billerId, amount }`
- `GET  /api/bank/savings/opportunities`
- `GET  /api/bank/transactions?limit=10`

**Auth:** every request must send `X-Bushra-Mock-Key: <shared-secret>` (matches `BUSHRA_MOCK_BANK_KEY`). Requests missing the key return 401. Optional origin allowlist via `BUSHRA_AGENT_ORIGIN`.

---

## Dev workflow

The web app defaults `NEXT_PUBLIC_AGENT_URL` to same-origin `/api/dev`, which is the built-in mock agent implemented as a Next route handler. So a fresh clone runs end-to-end with just `npm run dev` — no separate service. This also works on Vercel out of the box.

```
npm install
npm run dev          # http://localhost:3000
```

The standalone `bun run mock-agent` and `npm run dev:mock` scripts still exist for CLI-testing the SSE contract from outside the app (curl, Postman, etc.).

When your real agent is ready, set `NEXT_PUBLIC_AGENT_URL=https://your-agent...` — the UI code doesn't change.

## Notes for real agents (stateful vs. stateless hosting)

The `requires_confirmation` event pattern (agent pauses, browser POSTs `/confirmations`, agent resumes on the same SSE) requires the agent to hold session state across two HTTP requests. This is fine on any long-running server (Railway, Fly, Modal, EC2, FastAPI on Cloud Run, etc.) — the vast majority of LLM/agent hosting.

If you host your agent on a **stateless serverless** platform (Vercel/Lambda without a session store), you have two options:
- Add a shared session store (Redis, Vercel KV) keyed by `promptId`.
- Skip `requires_confirmation` and let the UI drive the confirmation client-side (this is what the built-in mock does — it never emits `requires_confirmation`; the `TransferConfirmCard` button opens the Face ID modal locally and sends a follow-up chat message on success).

Both options work with zero changes to the web app.

## Testing the contract

Run against the in-repo mock agent:
```
curl -N -X POST http://localhost:8787/chat \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"test","text":"ما رصيدي؟"}'
```
You should see `session`, `message_start`, several `token`s, `message_end`, `flow: balance`, `done`. Any real agent that matches this shape will drop into the web app with no changes.
