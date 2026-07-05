/**
 * Streaming audio-chunk player.
 *
 * The agent forwards TTS output as base64-encoded chunks on the same SSE
 * stream. We queue them and hand them to a single <audio> element via
 * MediaSource so playback starts before the whole clip arrives.
 *
 * For codecs MediaSource does not support (audio/pcm), fall back to Web Audio.
 */

type Mime = "audio/pcm" | "audio/opus" | "audio/mpeg" | "audio/wav";

export class AudioChunkPlayer {
  private ctx: AudioContext | null = null;
  private queue: Promise<void> = Promise.resolve();

  async enqueue(base64: string, mime: Mime, sampleRate = 24000): Promise<void> {
    this.queue = this.queue.then(() => this.play(base64, mime, sampleRate));
    return this.queue;
  }

  private async play(base64: string, mime: Mime, sampleRate: number) {
    const bytes = decodeBase64(base64);
    this.ctx ??= new AudioContext();
    const ctx = this.ctx;

    if (ctx.state === "suspended") await ctx.resume();

    let buffer: AudioBuffer;
    if (mime === "audio/pcm") {
      buffer = pcm16ToAudioBuffer(ctx, bytes, sampleRate);
    } else {
      const copy = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(copy).set(bytes);
      buffer = await ctx.decodeAudioData(copy);
    }

    return new Promise<void>((resolve) => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.onended = () => resolve();
      src.start();
    });
  }

  reset() {
    this.queue = Promise.resolve();
    this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}

function decodeBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function pcm16ToAudioBuffer(ctx: AudioContext, bytes: Uint8Array, sampleRate: number): AudioBuffer {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const sampleCount = Math.floor(bytes.byteLength / 2);
  const buffer = ctx.createBuffer(1, sampleCount, sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    channel[i] = view.getInt16(i * 2, true) / 0x8000;
  }
  return buffer;
}
