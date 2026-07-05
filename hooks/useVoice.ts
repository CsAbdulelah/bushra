"use client";

import { useCallback, useEffect, useRef } from "react";
import { VoiceCapture } from "@/lib/bushra/voice";
import { useBushra } from "@/hooks/useBushra";
import { clientConfig } from "@/lib/config";

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
    if (!b.voiceOpen) return;
    if (!clientConfig.asrUrl) return;

    const cap = new VoiceCapture();
    captureRef.current = cap;
    const off = cap.on((evt) => {
      if (evt.type === "phase") b.setVoicePhase(evt.phase);
      else if (evt.type === "partial") b.setVoiceText(evt.text);
      else if (evt.type === "final") {
        b.setVoiceText(evt.text);
        b.stopVoice();
        b.send(evt.text);
      }
    });
    cap.start();

    return () => {
      off();
      cap.stop();
      captureRef.current = null;
    };
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
