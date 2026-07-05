"use client";

import { useEffect, useRef } from "react";
import { useBushra } from "@/hooks/useBushra";
import { MessageList } from "./MessageList";
import { QuickActions } from "./QuickActions";
import { FlowCards } from "./FlowCards";
import { ChatInputBar } from "./ChatInputBar";

export function ChatPanel() {
  const b = useBushra();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [b.messages, b.isStreaming, b.activeFlow]);

  if (!b.chatOpen) return null;

  const showQuickActions = b.messages.length <= 1 && !b.isStreaming;

  return (
    <div
      className="animate-slide-up fixed bottom-[110px] left-7 z-[999] flex max-h-[600px] w-[390px] flex-col overflow-hidden rounded-[20px] bg-white shadow-panel"
    >
      <ChatPanelHeader />
      <div
        ref={scrollRef}
        dir="rtl"
        id="bushra-msgs"
        className="flex max-h-[400px] flex-1 flex-col gap-1 overflow-y-auto bg-alinma-panel p-3.5"
      >
        <MessageList />
        {b.isStreaming && b.messages[b.messages.length - 1]?.role === "user" && <TypingIndicator />}
        <FlowCards />
        {showQuickActions && <QuickActions />}
      </div>
      <ChatInputBar />
    </div>
  );
}

function ChatPanelHeader() {
  const b = useBushra();
  return (
    <div
      dir="rtl"
      className="flex shrink-0 items-center justify-between px-4 py-3.5 text-white"
      style={{ background: "linear-gradient(135deg,#0d1b2e,#1a3560)" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l1.4 5.6L19 9l-5.6 1.4L12 16l-1.4-5.6L5 9l5.6-1.4L12 2z" />
          </svg>
          <div className="absolute bottom-px right-px h-2.5 w-2.5 rounded-full border-2 border-[#0d1b2e] bg-alinma-green" />
        </div>
        <div>
          <div className="text-[15px] font-bold">بشرى</div>
          <div className="text-[11px] text-white/50">مساعدة الإنماء الذكية • متاحة الآن</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={b.openVoice}
          title="وضع الصوت"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 hover:bg-white/20"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" fill="none" strokeWidth="1.5" />
            <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="1.5" />
            <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="1.5" />
          </svg>
        </button>
        <button
          onClick={b.resetChat}
          className="cursor-pointer rounded-lg border-0 bg-white/[0.08] px-2.5 py-1 text-[10px] text-white/60 hover:bg-white/15"
        >
          جديد
        </button>
        <button
          onClick={b.closeChat}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 hover:bg-white/20"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-end">
      <div className="flex items-center gap-1.5 rounded-[12px_12px_12px_4px] bg-[#f0e9e2] px-4 py-3">
        <Dot delay="0s" />
        <Dot delay="0.2s" />
        <Dot delay="0.4s" />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return <div className="h-[7px] w-[7px] rounded-full bg-alinma-warm" style={{ animation: `blink 1.4s ease-in-out ${delay} infinite` }} />;
}
