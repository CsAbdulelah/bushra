import { clientConfig } from "@/lib/config";

/**
 * Voice capture + streaming to the ASR service.
 *
 * The ASR contract is intentionally minimal: open a WebSocket to
 * NEXT_PUBLIC_ASR_URL, stream binary audio chunks up, receive JSON
 * `{ type: 'partial'|'final', text: string }` frames down.
 *
 * Final transcript is folded into the BushraSession by the caller.
 */

export type VoiceEvent =
  | { type: "phase"; phase: "listening" | "processing" | "idle" }
  | { type: "partial"; text: string }
  | { type: "final"; text: string }
  | { type: "error"; message: string };

export type VoiceListener = (evt: VoiceEvent) => void;

export class VoiceCapture {
  private ws: WebSocket | null = null;
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private listeners = new Set<VoiceListener>();

  on(fn: VoiceListener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(evt: VoiceEvent) {
    for (const fn of this.listeners) fn(evt);
  }

  async start(): Promise<void> {
    if (!clientConfig.asrUrl) {
      this.emit({ type: "error", message: "NEXT_PUBLIC_ASR_URL not configured" });
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      this.emit({
        type: "error",
        message: err instanceof Error ? err.message : "mic denied",
      });
      return;
    }

    this.ws = new WebSocket(clientConfig.asrUrl);
    this.ws.binaryType = "arraybuffer";

    this.ws.onopen = () => {
      this.emit({ type: "phase", phase: "listening" });
      const rec = new MediaRecorder(this.stream!, { mimeType: "audio/webm;codecs=opus" });
      rec.ondataavailable = (e) => {
        if (e.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
          e.data.arrayBuffer().then((buf) => this.ws?.send(buf));
        }
      };
      rec.start(250);
      this.recorder = rec;
    };

    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(typeof e.data === "string" ? e.data : "") as VoiceEvent;
        if (msg.type === "partial" || msg.type === "final") this.emit(msg);
      } catch {
        /* ignore malformed */
      }
    };

    this.ws.onerror = () => this.emit({ type: "error", message: "asr socket error" });
    this.ws.onclose = () => this.emit({ type: "phase", phase: "idle" });
  }

  stop(): void {
    this.emit({ type: "phase", phase: "processing" });
    this.recorder?.stop();
    this.recorder = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.ws?.close();
    this.ws = null;
  }
}
