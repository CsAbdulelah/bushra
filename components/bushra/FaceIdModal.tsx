"use client";

import { useState } from "react";
import { useBushra } from "@/hooks/useBushra";

export function FaceIdModal() {
  const b = useBushra();
  const [phase, setPhase] = useState<"scanning" | "success">("scanning");

  // POC-only: after a short delay, mark scan complete and confirm.
  // A real integration would gate this on WebAuthn / platform authenticator.
  const authenticate = () => {
    setPhase("success");
    setTimeout(() => b.confirmFaceId(), 1200);
  };

  const subtitle = phase === "success" ? "تمت المصادقة بنجاح ✓" : "انظر إلى الكاميرا للتحقق من هويتك";

  return (
    <div
      dir="rtl"
      className="animate-slide-up fixed inset-0 z-[2001] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="flex w-[300px] flex-col items-center gap-5 rounded-3xl p-9"
        style={{ background: "#0d1b2e" }}
      >
        <div className="text-[15px] font-bold text-white">تأكيد الهوية</div>

        <div className="relative h-[120px] w-[120px]">
          <div className="absolute inset-0 rounded-full border-2 border-white/15" />
          <Corner pos="top-0 right-0" borders="border-t-[3px] border-r-[3px]" radius="rounded-tr-md" />
          <Corner pos="top-0 left-0" borders="border-t-[3px] border-l-[3px]" radius="rounded-tl-md" />
          <Corner pos="bottom-0 right-0" borders="border-b-[3px] border-r-[3px]" radius="rounded-br-md" />
          <Corner pos="bottom-0 left-0" borders="border-b-[3px] border-l-[3px]" radius="rounded-bl-md" />
          <div className="absolute inset-5 flex items-center justify-center rounded-full bg-white/[0.06]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          {phase === "scanning" && (
            <div
              className="animate-face-scan absolute left-[10%] right-[10%] h-[2px]"
              style={{ background: "linear-gradient(90deg,transparent,rgba(100,200,255,0.8),transparent)" }}
            />
          )}
          {phase === "success" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-check-pop flex h-[52px] w-[52px] items-center justify-center rounded-full bg-alinma-green">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-white/50">{subtitle}</div>

        {phase === "scanning" && (
          <div className="flex w-full gap-2">
            <button
              onClick={authenticate}
              className="flex-1 cursor-pointer rounded-[10px] border-0 bg-white px-3 py-3 text-[13px] font-bold text-[#0d1b2e] hover:bg-[#e8e8e8]"
            >
              تأكيد بـ Face ID
            </button>
            <button
              onClick={() => {
                // Fall back to OTP by cancelling this prompt; agent may re-emit an OTP prompt.
                b.cancelConfirmation();
              }}
              className="cursor-pointer rounded-[10px] border-0 bg-white/[0.08] px-3.5 py-3 text-xs text-white/55 hover:bg-white/15"
            >
              OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Corner({ pos, borders, radius }: { pos: string; borders: string; radius: string }) {
  return (
    <div className={`absolute h-[22px] w-[22px] border-white ${pos} ${borders} ${radius}`} />
  );
}
