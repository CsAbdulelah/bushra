"use client";

import { useBushra } from "@/hooks/useBushra";

export function ChatInputBar() {
  const b = useBushra();
  return (
    <div
      dir="rtl"
      className="flex shrink-0 items-center gap-2 border-t border-black/[0.07] bg-white px-3 py-2.5"
    >
      <input
        value={b.inputText}
        onChange={(e) => b.setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            b.send(b.inputText);
          }
        }}
        placeholder="اكتب رسالتك لبشرى..."
        dir="rtl"
        className="flex-1 rounded-[20px] border border-black/10 bg-alinma-cream px-3.5 py-2 text-[13px] text-alinma-navy outline-none focus:border-alinma-navy focus:bg-white"
      />
      <button
        onClick={() => b.send(b.inputText)}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-alinma-navy hover:bg-alinma-navy-2"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22,2 15,22 11,13 2,9" />
        </svg>
      </button>
      <button
        onClick={b.openVoice}
        title="وضع الصوت"
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-alinma-sand hover:bg-[#ece0d6]"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
    </div>
  );
}
