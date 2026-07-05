"use client";

import { useBushra } from "@/hooks/useBushra";

export function ProactiveNudge() {
  const b = useBushra();
  if (!b.proactiveVisible) return null;

  return (
    <div
      dir="rtl"
      className="animate-slide-up relative w-[320px] rounded-2xl bg-alinma-navy p-4 text-white"
      style={{ boxShadow: "0 8px 36px rgba(21,35,58,0.4)" }}
    >
      <button
        onClick={b.dismissProactive}
        className="absolute left-3 top-2.5 cursor-pointer border-0 bg-transparent p-1 text-xl leading-none text-white/40 hover:text-white/80"
      >
        ×
      </button>
      <div className="mb-1.5 text-[10px] text-white/55">✨ بشرى • الآن</div>
      <div className="mb-3 text-[13px] leading-relaxed">
        لاحظت أنك تحتفظ بـ 1,200 ريال شهرياً دون استثمار — برنامج ادخار الإنماء يمنحك 2% سنوياً
      </div>
      <button
        onClick={() => {
          b.dismissProactive();
          b.openChat();
          setTimeout(() => b.send("أخبريني عن فرص الادخار"), 400);
        }}
        className="w-full cursor-pointer rounded-[9px] border border-white/[0.22] bg-white/[0.13] px-2 py-2.5 text-[13px] font-semibold text-white hover:bg-white/20"
      >
        عرض الفرصة ←
      </button>
    </div>
  );
}
