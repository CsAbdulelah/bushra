/**
 * Standalone Bun runner for the mock agent — same flows as /api/dev/chat.
 * Useful for `curl`-testing the SSE contract from outside the Next app.
 *
 * Run:  bun run mock-agent/server.ts   (default port 8787)
 */

import { runChat, type BankResult } from "@/lib/mock-agent/flows";
import { encodeEvent, type BushraEvent } from "@/lib/bushra/events";

const PORT = Number(process.env.PORT ?? 8787);
const BANK_BASE = process.env.BANK_BASE ?? "http://localhost:3000";
const BANK_KEY = process.env.BUSHRA_MOCK_BANK_KEY ?? "dev-secret-change-me";

const enc = new TextEncoder();

const bankCall = async (path: string, body: unknown): Promise<BankResult> => {
  try {
    const res = await fetch(`${BANK_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Bushra-Mock-Key": BANK_KEY },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, error: `bank returned ${res.status}` };
    return { ok: true, data: await res.json() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "bank call failed" };
  }
};

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (url.pathname === "/chat" && req.method === "POST") {
      const body = (await req.json().catch(() => null)) as { sessionId: string; text: string } | null;
      if (!body?.text) return new Response("bad request", { status: 400, headers: cors });

      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const push = (evt: BushraEvent) => controller.enqueue(enc.encode(encodeEvent(evt)));
          push({ type: "session", sessionId: body.sessionId });
          try {
            await runChat(body.text, push, bankCall);
          } catch (err) {
            push({ type: "error", message: err instanceof Error ? err.message : "flow error", recoverable: false });
          } finally {
            push({ type: "done" });
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          ...cors,
        },
      });
    }

    return new Response("not found", { status: 404, headers: cors });
  },
});

console.log(`[mock-agent] listening on http://localhost:${PORT} (bank at ${BANK_BASE})`);
