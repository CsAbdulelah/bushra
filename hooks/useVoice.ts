"use client";

import { useCallback, useEffect, useRef } from "react";
import { VoiceCapture } from "@/lib/bushra/voice";
import { useBushra } from "@/hooks/useBushra";

/**
 * Wires VoiceCapture to the Bushra session:
 * - opens/closes the voice modal via provider state
 * - streams mic audio to the ASR service
 * - on `final` transcript, submits the text through the session pipeline
 *
 * When ASR is not configured, the modal still works but relies on the demo
 * command chips (voice commands as pre-typed text shortcuts).
 */
export function useVoice() {
  const b = useBushra();
  const captureRef = useRef<VoiceCapture | null>(null);

  useEffect(() => {
    if (!b.voiceOpen) {
      // Modal was closed by user (X) or by a final transcript. Trigger a stop
      // on the current capture so the recorded audio uploads and yields a
      // `final` event that we still catch (listeners stay subscribed).
      captureRef.current?.stop();
      return;
    }

    const cap = new VoiceCapture();
    captureRef.current = cap;
    cap.on((evt) => {
      if (evt.type === "phase") b.setVoicePhase(evt.phase);
      else if (evt.type === "partial") b.setVoiceText(evt.text);
      else if (evt.type === "final") {
        b.setVoiceText(evt.text);
        b.stopVoice();
        b.send(evt.text);
      } else if (evt.type === "error") {
        b.setVoiceText("");
        b.stopVoice();
      }
    });
    cap.start();
  }, [b.voiceOpen, b]);

  /** Called by the demo command chips inside the voice modal. */
  const runDemoCommand = useCallback(
    (arabic: string) => {
      b.setVoicePhase("processing");
      b.setVoiceText(arabic);
      setTimeout(() => {
        b.stopVoice();
        b.send(arabic);
      }, 900);
    },
    [b],
  );

  return { runDemoCommand };
}
