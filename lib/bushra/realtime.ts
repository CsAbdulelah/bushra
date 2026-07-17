import { clientConfig } from "@/lib/config";

/**
 * OpenAI Realtime API client — bidirectional voice via WebRTC plus banking
 * tool calls that route to the Python LangGraph backend.
 *
 * Flow:
 *   1. POST /api/agent/realtime-session → ephemeral token + tool schema.
 *   2. Create RTCPeerConnection. Add mic track. Attach remote audio.
 *   3. Data channel handles JSON events; when the model calls a tool we
 *      hit our Next JSON endpoints (/chat-json or /confirm-json), forward
 *      the result back into the conversation, and trigger the next reply.
 */

export type RealtimeStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "responding"
  | "error";

export type RealtimeEvent =
  | { type: "status"; status: RealtimeStatus }
  | { type: "user_transcript"; text: string }
  | { type: "assistant_transcript"; text: string; final: boolean }
  | { type: "flow"; flowId: string | null; flowContext?: Record<string, unknown> }
  | { type: "bank_action_completed" }
  | { type: "error"; message: string };

export type RealtimeListener = (evt: RealtimeEvent) => void;

const REALTIME_URL = "https://api.openai.com/v1/realtime/calls";
const MODEL = "gpt-realtime";

export class RealtimeVoice {
  readonly sessionId: string;
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private mic: MediaStream | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private listeners = new Set<RealtimeListener>();
  private assistantBuffer = "";

  constructor(sessionId?: string) {
    this.sessionId = sessionId ?? crypto.randomUUID();
  }

  on(fn: RealtimeListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(evt: RealtimeEvent) {
    for (const fn of this.listeners) fn(evt);
  }

  async start(): Promise<void> {
    this.emit({ type: "status", status: "connecting" });

    try {
      const tokenRes = await fetch(`${clientConfig.agentUrl}/realtime-session`, { method: "POST" });
      if (!tokenRes.ok) {
        throw new Error(`session mint ${tokenRes.status}: ${await tokenRes.text()}`);
      }
      const session = await tokenRes.json();
      const ephemeralKey: string | undefined =
        session?.value ?? session?.client_secret?.value;
      if (!ephemeralKey) throw new Error("no ephemeral key in session response");

      const pc = new RTCPeerConnection();
      this.pc = pc;

      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      this.audioEl = audioEl;
      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
      };

      // echoCancellation + noiseSuppression + autoGainControl are critical:
      // without them the mic re-captures Bushra's own voice and the model
      // ends up talking over/repeating itself.
      const mic = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 24000,
        },
      });
      this.mic = mic;
      for (const track of mic.getTracks()) pc.addTrack(track, mic);

      const dc = pc.createDataChannel("oai-events");
      this.dc = dc;
      dc.addEventListener("open", () => this.emit({ type: "status", status: "listening" }));
      dc.addEventListener("message", (e) => this.handleEvent(e.data));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(`${REALTIME_URL}?model=${encodeURIComponent(MODEL)}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });
      if (!sdpRes.ok) {
        throw new Error(`sdp exchange ${sdpRes.status}: ${await sdpRes.text()}`);
      }
      const answer = { type: "answer", sdp: await sdpRes.text() } as RTCSessionDescriptionInit;
      await pc.setRemoteDescription(answer);
    } catch (err) {
      this.emit({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
      this.emit({ type: "status", status: "error" });
      this.stop();
    }
  }

  private sendEvent(payload: Record<string, unknown>): void {
    if (this.dc?.readyState !== "open") return;
    this.dc.send(JSON.stringify(payload));
  }

  /** Enable/disable the local mic track to stop speaker bleed becoming input. */
  private setMicEnabled(enabled: boolean): void {
    this.mic?.getAudioTracks().forEach((t) => {
      t.enabled = enabled;
    });
  }

  private handleEvent(raw: unknown): void {
    if (typeof raw !== "string") return;
    let evt: Record<string, unknown>;
    try {
      evt = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return;
    }
    const type = String(evt.type ?? "");

    switch (type) {
      case "input_audio_buffer.speech_started":
        this.emit({ type: "status", status: "listening" });
        break;
      case "response.audio.delta":
        // Mute the mic while Bushra is speaking. This prevents the speaker
        // output from bleeding back into the mic and being treated as new
        // user input — the classic echo-loop cause.
        this.setMicEnabled(false);
        this.emit({ type: "status", status: "responding" });
        break;
      case "response.done":
        this.setMicEnabled(true);
        this.emit({ type: "status", status: "listening" });
        break;
      case "response.audio.done":
        this.setMicEnabled(true);
        break;
      case "conversation.item.input_audio_transcription.completed": {
        const transcript = (evt as { transcript?: string }).transcript;
        if (transcript) this.emit({ type: "user_transcript", text: transcript });
        break;
      }
      case "response.audio_transcript.delta": {
        const delta = (evt as { delta?: string }).delta;
        if (delta) {
          this.assistantBuffer += delta;
          this.emit({ type: "assistant_transcript", text: this.assistantBuffer, final: false });
        }
        break;
      }
      case "response.audio_transcript.done": {
        const transcript = (evt as { transcript?: string }).transcript;
        if (transcript) {
          this.assistantBuffer = "";
          this.emit({ type: "assistant_transcript", text: transcript, final: true });
        }
        break;
      }
      case "response.function_call_arguments.done":
        void this.handleToolCall(evt as ToolCallEvent);
        break;
      case "error": {
        const message = (evt as { error?: { message?: string } }).error?.message ?? "realtime error";
        this.emit({ type: "error", message });
        break;
      }
    }
  }

  private async handleToolCall(evt: ToolCallEvent): Promise<void> {
    const name = evt.name;
    const callId = evt.call_id;
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(evt.arguments ?? "{}") as Record<string, unknown>;
    } catch {
      /* empty args */
    }

    let toolOutput: Record<string, unknown>;
    try {
      if (name === "banking_request") {
        toolOutput = await this.callBankingRequest(String(args.user_text ?? ""));
      } else if (name === "banking_confirm") {
        toolOutput = await this.callBankingConfirm(Boolean(args.approve));
      } else {
        toolOutput = { kind: "error", speak: "أداة غير معروفة." };
      }
    } catch (err) {
      toolOutput = {
        kind: "error",
        speak: "حصل خطأ في تنفيذ الأداة.",
        detail: err instanceof Error ? err.message : String(err),
      };
    }

    // Send the tool result back into the Realtime conversation.
    this.sendEvent({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: callId,
        output: JSON.stringify(toolOutput),
      },
    });
    this.sendEvent({ type: "response.create" });
  }

  private async callBankingRequest(userText: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${clientConfig.agentUrl}/chat-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: this.sessionId, text: userText }),
    });
    const data = (await res.json()) as ToolReply;
    return this.postProcessToolReply(data);
  }

  private async callBankingConfirm(approve: boolean): Promise<Record<string, unknown>> {
    const res = await fetch(`${clientConfig.agentUrl}/confirm-json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: this.sessionId, approve }),
    });
    const data = (await res.json()) as ToolReply;
    // Any successful confirm mutates bank state, so refresh the dashboard.
    if (data.kind === "reply") this.emit({ type: "bank_action_completed" });
    return this.postProcessToolReply(data);
  }

  private postProcessToolReply(data: ToolReply): Record<string, unknown> {
    if (data.kind === "confirmation_required") {
      this.emit({
        type: "flow",
        flowId: (data.flowId as string | null) ?? null,
        flowContext: data.flowContext as Record<string, unknown> | undefined,
      });
    } else {
      this.emit({ type: "flow", flowId: null });
    }
    return data as unknown as Record<string, unknown>;
  }

  stop(): void {
    try { this.dc?.close(); } catch { /* ignore */ }
    try { this.pc?.close(); } catch { /* ignore */ }
    this.mic?.getTracks().forEach((t) => t.stop());
    this.audioEl?.pause();
    this.dc = null;
    this.pc = null;
    this.mic = null;
    this.audioEl = null;
    this.assistantBuffer = "";
    this.emit({ type: "status", status: "idle" });
  }
}

type ToolCallEvent = {
  type: string;
  call_id: string;
  name: string;
  arguments?: string;
};

type ToolReply = {
  kind: "reply" | "confirmation_required" | "error";
  speak?: string;
  reply?: string;
  flowId?: string | null;
  flowContext?: Record<string, unknown>;
};
