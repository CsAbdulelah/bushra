import { clientConfig } from "@/lib/config";

/**
 * Fire-and-play TTS for a Bushra assistant reply.
 *
 * Posts the text to `${agentUrl}/speak` (the Python /speak proxy), gets an
 * mp3 blob back, and plays it through a shared <audio> element. Interrupts
 * any in-flight playback so a fresh reply doesn't stack on the old one.
 *
 * Silent no-op on failure — TTS is a nice-to-have, not a hard requirement.
 */

let currentUrl: string | null = null;
let currentAudio: HTMLAudioElement | null = null;

export async function speakReply(text: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (!text.trim()) return;

  try {
    const res = await fetch(`${clientConfig.agentUrl}/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    if (currentAudio) {
      try { currentAudio.pause(); } catch { /* ignore */ }
    }
    if (currentUrl) URL.revokeObjectURL(currentUrl);

    currentUrl = url;
    const audio = new Audio(url);
    currentAudio = audio;
    audio.play().catch(() => { /* autoplay policies may block; that's fine */ });
  } catch {
    /* swallow; UI text is the source of truth */
  }
}
