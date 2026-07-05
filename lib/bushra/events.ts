/**
 * Bushra ⇄ Agent event envelope.
 *
 * This is the CONTRACT the web app shares with the LLM/Agent, TTS, and ASR
 * services. Every SSE frame the agent sends the browser MUST match one of
 * these variants. Keep this file the single source of truth — mirror it in
 * the agent codebase.
 */

export type FlowId =
  | "balance"
  | "transfer-confirm"
  | "otp-entry"
  | "bill-confirm"
  | "card-freeze"
  | "card-unfreeze"
  | "savings"
  | "transactions"
  | "digital-products";

export type BushraEvent =
  | { type: "session"; sessionId: string }
  | { type: "message_start"; messageId: string; role: "assistant" }
  | { type: "token"; text: string }
  | { type: "message_end"; messageId: string }
  | { type: "tool_call"; toolCallId: string; name: string; args: unknown }
  | { type: "tool_result"; toolCallId: string; ok: boolean; summary?: string }
  | {
      type: "audio_chunk";
      mime: "audio/pcm" | "audio/opus" | "audio/mpeg" | "audio/wav";
      sampleRate?: number;
      data: string; // base64
    }
  | { type: "flow"; flow: FlowId | null; context?: Record<string, unknown> }
  | {
      type: "requires_confirmation";
      kind: "face_id" | "otp";
      promptId: string;
      context?: { amount?: number; recipient?: string; otpMaskedPhone?: string };
    }
  | { type: "error"; message: string; recoverable: boolean }
  | { type: "done" };

export type ConfirmationPayload =
  | { promptId: string; ok: true; otp?: string }
  | { promptId: string; ok: false; reason?: string };

export type ChatRequest = {
  sessionId: string;
  text: string;
  // Optional history hint; agent may ignore if it keeps its own state.
  clientMessageId?: string;
};

/** Parse a single SSE `data:` line. Returns null if the frame is malformed. */
export function parseEvent(line: string): BushraEvent | null {
  try {
    const obj = JSON.parse(line) as BushraEvent;
    if (obj && typeof obj === "object" && "type" in obj) return obj;
    return null;
  } catch {
    return null;
  }
}

/** Encode an event as an SSE frame. Used by the mock agent. */
export function encodeEvent(evt: BushraEvent): string {
  return `data: ${JSON.stringify(evt)}\n\n`;
}
