/**
 * Adapter between the Python Bushra backend and the web app's SSE contract.
 *
 * Python contract (JSON):
 *   POST /session   -> { session_id, opener }
 *   POST /chat      -> { type: "reply", reply, confirmation: null }
 *                    | { type: "confirmation_required", confirmation, reply: null }
 *   POST /confirm   -> same as /chat
 *
 * Web contract (SSE stream of BushraEvent). This module converts one to the
 * other. Session mapping (browser sessionId → python session_id) lives here.
 */

import { serverConfig } from "@/lib/config";
import { encodeEvent, type BushraEvent, type FlowId } from "@/lib/bushra/events";

type SessionEntry = {
  pythonSessionId: string;
  customerId: string;
  opener: string | null;
  /** Confirmation currently awaiting the user. Used to skip the flow card on resume. */
  pendingConfirmation: PythonConfirmation | null;
};

/**
 * Session map pinned to globalThis so it survives Next dev's HMR module
 * reloads and shares state across concurrent route handlers within the same
 * Node process. On Vercel serverless the map is per-instance; move to
 * Redis/Vercel KV for prod.
 */
const g = globalThis as { __bushraSessions?: Map<string, SessionEntry> };
if (!g.__bushraSessions) g.__bushraSessions = new Map<string, SessionEntry>();
const sessions = g.__bushraSessions;

export type PythonConfirmation = {
  type: string;
  transfer_summary?: Record<string, unknown>;
  payment_summary?: Record<string, unknown>;
  replacement_summary?: Record<string, unknown>;
  application_summary?: Record<string, unknown>;
};

export type PythonChatResponse =
  | { type: "reply"; reply: string; confirmation: null }
  | { type: "confirmation_required"; reply: null; confirmation: PythonConfirmation };

function pythonUrl(path: string): string {
  return `${serverConfig.pythonAgentUrl.replace(/\/$/, "")}${path}`;
}

async function pythonPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(pythonUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`python ${path} → ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** Ensure we have a Python session for this browser sessionId. Creates one on first use. */
export async function ensurePythonSession(
  browserSessionId: string,
  customerId: string = serverConfig.defaultCustomerId,
): Promise<SessionEntry> {
  const existing = sessions.get(browserSessionId);
  if (existing) return existing;

  const created = await pythonPost<{ session_id: string; opener: string | null }>(
    "/session",
    { customer_id: customerId },
  );
  const entry: SessionEntry = {
    pythonSessionId: created.session_id,
    customerId,
    opener: created.opener,
    pendingConfirmation: null,
  };
  sessions.set(browserSessionId, entry);
  return entry;
}

export function getSession(browserSessionId: string): SessionEntry | undefined {
  return sessions.get(browserSessionId);
}

export async function pythonChat(pythonSessionId: string, message: string): Promise<PythonChatResponse> {
  return pythonPost<PythonChatResponse>("/chat", { session_id: pythonSessionId, message });
}

export async function pythonConfirm(pythonSessionId: string, approve: boolean): Promise<PythonChatResponse> {
  return pythonPost<PythonChatResponse>("/confirm", { session_id: pythonSessionId, approve });
}

/** Split text into small chunks so the UI streams like the mock. */
function chunkify(text: string, size = 8): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Map a Python confirmation payload to (flowId, flowContext, faceIdContext).
 * The web UI renders both the flow card and the Face ID modal.
 */
export function mapConfirmation(c: PythonConfirmation): {
  flow: FlowId | null;
  flowContext?: Record<string, unknown>;
  faceIdContext?: { amount?: number; recipient?: string };
} {
  if (c.type === "transfer_confirmation" && c.transfer_summary) {
    const s = c.transfer_summary as Record<string, unknown>;
    const amount = num(s.amount);
    const to = s.to as Record<string, unknown> | undefined;
    const recipient = str(to?.name_ar) ?? str(to?.name) ?? str(s.recipient) ?? "";
    return {
      flow: "transfer-confirm",
      flowContext: { amount, recipient },
      faceIdContext: { amount, recipient },
    };
  }

  if (c.type === "bill_payment_confirmation" && c.payment_summary) {
    const s = c.payment_summary as Record<string, unknown>;
    // Python shape: { total_amount, bills: [{ biller_name_ar, account_label_ar, amount, ... }] }
    const bills = (Array.isArray(s.bills) ? s.bills : []) as Array<Record<string, unknown>>;
    const first = bills[0] ?? {};
    const amount =
      num(s.total_amount) ?? num(s.amount) ?? num(first.amount) ?? 0;
    const biller =
      str(first.biller_name_ar) ??
      str(s.biller_ar) ??
      str(s.biller) ??
      "فاتورة";
    const due =
      str(first.due_date) ??
      str(s.due_date) ??
      str(s.due) ??
      "";
    return {
      flow: "bill-confirm",
      flowContext: { selected: { biller, amount, due } },
      faceIdContext: { amount, recipient: biller },
    };
  }

  if (c.type === "card_replacement_confirmation" && c.replacement_summary) {
    const s = c.replacement_summary as Record<string, unknown>;
    return {
      flow: null,
      faceIdContext: { recipient: str(s.card_ar) ?? str(s.card) ?? "استبدال البطاقة" },
    };
  }

  if (c.type === "product_application_confirmation" && c.application_summary) {
    const s = c.application_summary as Record<string, unknown>;
    return {
      flow: null,
      faceIdContext: { recipient: str(s.product_ar) ?? str(s.product) ?? "طلب المنتج" },
    };
  }

  return { flow: null };
}

function num(v: unknown): number | undefined {
  return typeof v === "number" ? v : typeof v === "string" && !isNaN(+v) ? +v : undefined;
}
function str(v: unknown): string | undefined {
  return typeof v === "string" && v ? v : undefined;
}

/** Emit a full assistant reply as SSE (message_start → tokens → message_end). */
export async function streamAssistantReply(
  push: (evt: BushraEvent) => void,
  text: string,
  chunkSize = 8,
  delayMs = 18,
): Promise<void> {
  const messageId = crypto.randomUUID();
  push({ type: "message_start", messageId, role: "assistant" });
  for (const piece of chunkify(text, chunkSize)) {
    push({ type: "token", text: piece });
    if (delayMs > 0) await sleep(delayMs);
  }
  push({ type: "message_end", messageId });
}

/**
 * Translate a Python chat/confirm response into a sequence of BushraEvents.
 * Consumers await this while pushing to an SSE controller.
 */
export async function pushPythonResponse(
  push: (evt: BushraEvent) => void,
  entry: SessionEntry,
  resp: PythonChatResponse,
): Promise<void> {
  if (resp.type === "confirmation_required" && resp.confirmation) {
    entry.pendingConfirmation = resp.confirmation;
    const mapped = mapConfirmation(resp.confirmation);
    if (mapped.flow) {
      push({ type: "flow", flow: mapped.flow, context: mapped.flowContext });
    }
    push({
      type: "requires_confirmation",
      kind: "face_id",
      promptId: crypto.randomUUID(),
      context: mapped.faceIdContext,
    });
    return;
  }

  entry.pendingConfirmation = null;
  if (resp.reply) {
    await streamAssistantReply(push, resp.reply);
  }
  push({ type: "flow", flow: null });
}

/** Wraps a stream of BushraEvents into a Response with SSE headers. */
export function makeSseResponse(
  produce: (push: (evt: BushraEvent) => void) => Promise<void>,
  sessionId?: string,
): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (evt: BushraEvent) => controller.enqueue(enc.encode(encodeEvent(evt)));
      if (sessionId) push({ type: "session", sessionId });
      try {
        await produce(push);
      } catch (err) {
        push({
          type: "error",
          message: err instanceof Error ? err.message : "adapter error",
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
