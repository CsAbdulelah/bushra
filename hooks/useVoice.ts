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
 *
 * IMPORTANT: the effect below depends ONLY on `voiceOpen`. Never add the
 * `b` context object to the dep array — its reference changes on every
 * render, which would create a fresh RealtimeVoice on every keystroke
 * and result in overlapping sessions (heard as repeated replies + 409s
 * from OpenAI's realtime/calls endpoint).
 */
export function useVoice() {
  const b = useBushra();
  const bRef = useRef(b);
  bRef.current = b;
  const rtRef = useRef<RealtimeVoice | null>(null);

  useEffect(() => {
    const b = bRef.current;
    if (!b.voiceOpen) {
      rtRef.current?.stop();
      rtRef.current = null;
      return;
    }
    // Guard against re-entry: if a session already exists, don't spawn a second.
    if (rtRef.current) return;

    const rt = new RealtimeVoice();
    rtRef.current = rt;

    rt.on((evt) => {
      const cur = bRef.current;
      switch (evt.type) {
        case "status":
          if (evt.status === "connecting") {
            cur.setVoicePhase("processing");
            cur.setVoiceText("جاري الاتصال…");
          } else if (evt.status === "listening") {
            cur.setVoicePhase("listening");
            if (!cur.voiceText) cur.setVoiceText("تكلّم الآن");
          } else if (evt.status === "responding") {
            cur.setVoicePhase("processing");
          } else if (evt.status === "error") {
            cur.setVoicePhase("idle");
          }
          break;
        case "user_transcript":
          if (evt.text.trim()) cur.setVoiceText(evt.text);
          break;
        case "assistant_transcript":
          if (evt.text.trim()) cur.setVoiceText(evt.text);
          break;
        case "flow":
          window.dispatchEvent(
            new CustomEvent("bushra:flow", {
              detail: { flowId: evt.flowId as FlowId | null, flowContext: evt.flowContext },
            }),
          );
          break;
        case "bank_action_completed":
          window.dispatchEvent(new CustomEvent("bushra:bank-refresh"));
          break;
        case "error":
          cur.setVoiceText(`⚠️ ${evt.message}`);
          break;
      }
    });

    rt.start();
    return () => {
      rt.stop();
      rtRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b.voiceOpen]);

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
