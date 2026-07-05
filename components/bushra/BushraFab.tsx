"use client";

import { useBushra } from "@/hooks/useBushra";

export function BushraFab() {
  const b = useBushra();
  return (
    <button
      onClick={b.toggleChat}
      title="بشرى"
      className="animate-glow-pulse flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full border-none bg-gradient-to-br from-alinma-navy to-alinma-navy-2 text-white"
      style={{ background: "linear-gradient(145deg,#15233a,#1d3460)" }}
    >
      <svg width="23" height="23" viewBox="0 0 24 24" fill="white">
        <path d="M12 2l1.4 5.6L19 9l-5.6 1.4L12 16l-1.4-5.6L5 9l5.6-1.4L12 2z" />
        <path d="M19.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" opacity="0.65" />
        <path d="M5 3l.6 1.4 1.4.6-1.4.6L5 7l-.6-1.4L3 5l1.4-.6L5 3z" opacity="0.5" />
      </svg>
      <span className="mt-px text-[9px] font-extrabold tracking-wide">بشرى</span>
    </button>
  );
}
