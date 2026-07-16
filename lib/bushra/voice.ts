import { clientConfig } from "@/lib/config";

/**
 * Voice capture — REST flow against the Python backend.
 *
 * The Python /transcribe endpoint accepts a whole audio blob (webm/mp3/wav/m4a)
 * and returns the Arabic transcript. We record with MediaRecorder, POST the
 * blob on stop(), and emit a single `final` transcript.
 *
 * A WebSocket-based ASR is still supported when NEXT_PUBLIC_ASR_URL is set —
 * that path streams `partial`/`final` frames. When it's not set we default to
 * the same-origin `/api/agent/transcribe` proxy.
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
  private chunks: Blob[] = [];
  private listeners = new Set<VoiceListener>();
  private mode: "rest" | "ws" = "rest";
  /** Endpoint for the REST fallback (defaults to same-origin adapter). */
  private transcribeUrl = `${clientConfig.agentUrl}/transcribe`;

  on(fn: VoiceListener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(evt: VoiceEvent) {
    for (const fn of this.listeners) fn(evt);
  }

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      this.emit({
        type: "error",
        message: err instanceof Error ? err.message : "mic denied",
      });
      return;
    }

    if (clientConfig.asrUrl) {
      this.mode = "ws";
      this.startWebSocket();
    } else {
      this.mode = "rest";
      this.startRecorder();
    }
  }

  private startRecorder() {
    const rec = new MediaRecorder(this.stream!, { mimeType: "audio/webm;codecs=opus" });
    this.chunks = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    rec.onstart = () => this.emit({ type: "phase", phase: "listening" });
    rec.onstop = () => this.uploadAndTranscribe();
    rec.start();
    this.recorder = rec;
  }

  private async uploadAndTranscribe() {
    this.emit({ type: "phase", phase: "processing" });
    if (this.chunks.length === 0) {
      this.emit({ type: "phase", phase: "idle" });
      return;
    }
    const blob = new Blob(this.chunks, { type: "audio/webm" });
    this.chunks = [];
    try {
      const form = new FormData();
      form.append("file", blob, "audio.webm");
      const res = await fetch(this.transcribeUrl, { method: "POST", body: form });
      if (!res.ok) throw new Error(`transcribe ${res.status}`);
      const data = (await res.json()) as { text?: string };
      const text = (data.text ?? "").trim();
      if (text) this.emit({ type: "final", text });
    } catch (err) {
      this.emit({
        type: "error",
        message: err instanceof Error ? err.message : "transcribe failed",
      });
    } finally {
      this.emit({ type: "phase", phase: "idle" });
    }
  }

  private startWebSocket() {
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
    if (this.mode === "rest") {
      // Recorder.onstop will fire uploadAndTranscribe; keep the mic open until then.
      try { this.recorder?.stop(); } catch { /* ignore */ }
    } else {
      this.emit({ type: "phase", phase: "processing" });
      try { this.recorder?.stop(); } catch { /* ignore */ }
      this.ws?.close();
      this.ws = null;
    }
    this.recorder = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}
