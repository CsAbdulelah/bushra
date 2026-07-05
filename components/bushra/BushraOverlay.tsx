"use client";

import { BushraFab } from "./BushraFab";
import { ProactiveNudge } from "./ProactiveNudge";
import { ChatPanel } from "./ChatPanel";
import { VoiceModal } from "./VoiceModal";
import { ConfirmationHost } from "./ConfirmationHost";

/** Mounts every Bushra surface. Rendered once at the app root. */
export function BushraOverlay() {
  return (
    <>
      <div className="fixed bottom-7 left-7 z-[1000] flex flex-col items-center gap-2.5">
        <ProactiveNudge />
        <BushraFab />
      </div>
      <ChatPanel />
      <VoiceModal />
      <ConfirmationHost />
    </>
  );
}
