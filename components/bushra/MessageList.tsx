"use client";

import { useBushra } from "@/hooks/useBushra";

export function MessageList() {
  const { messages } = useBushra();
  return (
    <>
      {messages.map((m) => {
        const isUser = m.role === "user";
        return (
          <div key={m.id} className={`mb-1 flex ${isUser ? "justify-start" : "justify-end"}`}>
            <div
              className="max-w-[80%] whitespace-pre-wrap break-words px-3.5 py-2.5 text-[13px] leading-relaxed"
              style={{
                background: isUser ? "#15233a" : "#eee8e0",
                color: isUser ? "#ffffff" : "#15233a",
                borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              }}
            >
              {m.text}
              <div dir="ltr" className="mt-0.5 text-left text-[9px] opacity-40">
                {m.time}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
