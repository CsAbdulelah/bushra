"use client";

import { useCallback, useEffect, useRef } from "react";
import { RealtimeVoice } from "@/lib/bushra/realtime";
import { useBushra } from "@/hooks/useBushra";
import type { FlowId } from "@/lib/bushra/events";

/**
 * Realtime voice mode. Opens a WebRTC session to OpenAI, streams the user's
 * mic up and Bushra's Arabic voice down. Banking tool calls made by the
 * model are routed to the Python backend and their results are:
 *   • fed back into the conversation so the model speaks them, and
 *   • dispatched as flow-card + dashboard-refresh events for the UI.
 */
export function useVoice() {
  const b = useBushra();
  const rtRef = useRef<RealtimeVoice | null>(null);

  useEffect(() => {
    if (!b.voiceOpen) {
      rtRef.current?.stop();
      rtRef.current = null;
      return;
    }

    const rt = new RealtimeVoice();
    rtRef.current = rt;

    rt.on((evt) => {
      switch (evt.type) {
        case "status":
          if (evt.status === "connecting") {
            b.setVoicePhase("processing");
            b.setVoiceText("جاري الاتصال…");
          } else if (evt.status === "listening") {
            b.setVoicePhase("listening");
            if (!b.voiceText) b.setVoiceText("تكلّم الآن");
          } else if (evt.status === "responding") {
            b.setVoicePhase("processing");
          } else if (evt.status === "error") {
            b.setVoicePhase("idle");
          }
          break;
        case "user_transcript":
          if (evt.text.trim()) b.setVoiceText(evt.text);
          break;
        case "assistant_transcript":
          if (evt.text.trim()) b.setVoiceText(evt.text);
          break;
        case "flow":
          // Flow card driven by the voice pipeline. Emit through the global
          // event bus so BushraProvider (which owns activeFlow) picks it up.
          window.dispatchEvent(
            new CustomEvent("bushra:flow", {
              detail: { flowId: evt.flowId as FlowId | null, flowContext: evt.flowContext },
            }),
          );
          break;
        case "bank_action_completed":
          // Tell useLiveBank to re-fetch the customer summary.
          window.dispatchEvent(new CustomEvent("bushra:bank-refresh"));
          break;
        case "error":
          b.setVoiceText(`⚠️ ${evt.message}`);
          break;
      }
    });

    rt.start();
    return () => {
      rt.stop();
    };
  }, [b.voiceOpen, b]);

  /** Kept for the demo command chips inside the voice modal. */
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
