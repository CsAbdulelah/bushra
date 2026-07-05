import { runChat, type BankResult } from "@/lib/mock-agent/flows";
import { encodeEvent, type BushraEvent } from "@/lib/bushra/events";
import { serverConfig } from "@/lib/config";

/**
 * In-repo mock agent as a Next.js route handler. Runs on Vercel serverless
 * (Node runtime) — stateless per request, no cross-request pending state.
 *
 * The web app defaults to hitting this when NEXT_PUBLIC_AGENT_URL isn't set.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { sessionId: string; text: string };

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.text) return new Response("bad request", { status: 400 });

  const origin = new URL(req.url).origin;

  const bankCall = async (path: string, payload: unknown): Promise<BankResult> => {
    try {
      const res = await fetch(`${origin}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Bushra-Mock-Key": serverConfig.bankKey,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return { ok: false, error: `bank returned ${res.status}` };
      return { ok: true, data: await res.json() };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "bank call failed" };
    }
  };

  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (evt: BushraEvent) => controller.enqueue(enc.encode(encodeEvent(evt)));
      push({ type: "session", sessionId: body.sessionId });
      try {
        await runChat(body.text, push, bankCall);
      } catch (err) {
        push({
          type: "error",
          message: err instanceof Error ? err.message : "flow error",
          recoverable: false,
        });
      } finally {
        push({ type: "done" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
