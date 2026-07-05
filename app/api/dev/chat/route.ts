import { runChat } from "@/lib/mock-agent/flows";
import { bankExec } from "@/lib/mock-agent/bank-exec";
import { encodeEvent, type BushraEvent } from "@/lib/bushra/events";

/**
 * Built-in mock agent, exposed as a Next.js route handler.
 * Runs on Vercel out of the box — same-origin, no separate service,
 * no cross-request state, no auth header dance.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { sessionId: string; text: string };

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.text) return new Response("bad request", { status: 400 });

  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (evt: BushraEvent) => controller.enqueue(enc.encode(encodeEvent(evt)));
      push({ type: "session", sessionId: body.sessionId });
      try {
        await runChat(body.text, push, bankExec);
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
