"use client";

import { useBushra } from "@/hooks/useBushra";
import { useVoice } from "@/hooks/useVoice";

const DEMO_COMMANDS = [
  "حولي 300 ريال لمحمد",
  "ما رصيدي؟",
  "سددي فاتورة الكهرباء",
  "اجمّدي بطاقتي",
  "فرص الادخار",
];

export function VoiceModal() {
  const b = useBushra();
  const { runDemoCommand } = useVoice();

  if (!b.voiceOpen) return null;

  const statusLabel =
    b.voicePhase === "listening" ? "جاري الاستماع…" : b.voicePhase === "processing" ? "جاري المعالجة…" : "";
  const waveOpacity = b.voicePhase === "listening" ? 1 : 0.3;

  return (
    <div
      dir="rtl"
      className="animate-slide-up fixed inset-0 z-[2000] flex flex-col items-center justify-center gap-6"
      style={{ background: "rgba(13,27,46,0.94)" }}
    >
      <div className="absolute left-0 right-0 top-6 flex items-center justify-between px-7">
        <button
          onClick={b.stopVoice}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-white/10 hover:bg-white/20"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l1.4 5.6L19 9l-5.6 1.4L12 16l-1.4-5.6L5 9l5.6-1.4L12 2z" />
          </svg>
          <span className="text-[15px] font-bold text-white">بشرى</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="text-sm tracking-wide text-white/65">{statusLabel}</div>

      <div className="relative flex h-40 w-40 items-center justify-center">
        <div className="animate-face-ring absolute inset-0 rounded-full border-[1.5px] border-white/[0.08]" />
        <div
          className="animate-face-ring absolute inset-3.5 rounded-full border-[1.5px] border-white/[0.12]"
          style={{ animationDelay: "0.4s" }}
        />
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-[1.5px] border-white/[0.18] bg-white/[0.07]">
          <div className="flex h-9 items-center gap-[3px]">
            {[0, 0.09, 0.18, 0.27, 0.36, 0.45, 0.54].map((delay) => (
              <div
                key={delay}
                className="h-full w-[3px] origin-center rounded bg-white"
                style={{ animation: `waveBar 0.6s ease-in-out ${delay}s infinite`, opacity: waveOpacity }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-[44px] px-10 text-center">
        <div className="text-xl font-bold leading-tight text-white">{b.voiceText}</div>
      </div>

      <div className="flex w-full max-w-[340px] flex-col items-center gap-2">
        <div className="mb-0.5 text-[11px] text-white/35">جرّب قل واحدة من هذه:</div>
        <div className="flex flex-wrap justify-center gap-2">
          {DEMO_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              onClick={() => runDemoCommand(cmd)}
              className="cursor-pointer rounded-[20px] border border-white/15 bg-white/[0.08] px-3.5 py-1.5 text-xs text-white/75 hover:bg-white/15"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
