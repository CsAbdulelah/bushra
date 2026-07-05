import { clientConfig } from "@/lib/config";
import {
  type BushraEvent,
  type ConfirmationPayload,
  parseEvent,
} from "@/lib/bushra/events";

export type SessionListener = (evt: BushraEvent) => void;

/**
 * Streaming client for the agent service.
 *
 * - `send(text)` opens an SSE stream from POST /chat and dispatches every
 *   frame to registered listeners.
 * - `confirm(payload)` fires a discrete POST to /confirmations to resume
 *   an agent turn that emitted `requires_confirmation`.
 * - Consumers subscribe with `on(fn)` and receive typed events.
 *
 * The class does NOT own React state. UI state lives in BushraUIProvider,
 * which subscribes to this class through the useBushraSession hook.
 */
export class BushraSession {
  readonly sessionId: string;
  private listeners = new Set<SessionListener>();
  private abort: AbortController | null = null;

  constructor(sessionId?: string) {
    this.sessionId = sessionId ?? crypto.randomUUID();
  }

  on(fn: SessionListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(evt: BushraEvent) {
    for (const fn of this.listeners) fn(evt);
  }

  /** Cancel any in-flight stream. Safe to call multiple times. */
  cancel() {
    this.abort?.abort();
    this.abort = null;
  }

  async send(text: string): Promise<void> {
    this.cancel();
    const abort = new AbortController();
    this.abort = abort;

    let res: Response;
    try {
      res = await fetch(`${clientConfig.agentUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ sessionId: this.sessionId, text }),
        signal: abort.signal,
      });
    } catch (err) {
      this.emit({
        type: "error",
        message: err instanceof Error ? err.message : "network error",
        recoverable: true,
      });
      return;
    }

    if (!res.ok || !res.body) {
      this.emit({
        type: "error",
        message: `agent returned ${res.status}`,
        recoverable: false,
      });
      return;
    }

    await this.consumeStream(res.body, abort.signal);
  }

  async confirm(payload: ConfirmationPayload): Promise<void> {
    try {
      await fetch(`${clientConfig.agentUrl}/confirmations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: this.sessionId, ...payload }),
      });
    } catch (err) {
      this.emit({
        type: "error",
        message: err instanceof Error ? err.message : "confirm failed",
        recoverable: true,
      });
    }
  }

  private async consumeStream(body: ReadableStream<Uint8Array>, signal: AbortSignal) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (!signal.aborted) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by blank lines. Each frame may have multiple
        // `field:` lines; we only care about `data:`.
        let idx: number;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const dataLine = frame
            .split("\n")
            .find((l) => l.startsWith("data:"))
            ?.slice(5)
            .trim();
          if (!dataLine) continue;
          const evt = parseEvent(dataLine);
          if (evt) this.emit(evt);
        }
      }
    } catch (err) {
      if (!signal.aborted) {
        this.emit({
          type: "error",
          message: err instanceof Error ? err.message : "stream error",
          recoverable: true,
        });
      }
    }
  }
}
