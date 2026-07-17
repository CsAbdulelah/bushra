"use client";

import { useLiveBank } from "@/hooks/useLiveBank";

export function BeneficiariesRow() {
  const { beneficiaries } = useLiveBank();
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex gap-3.5">
          <button className="flex cursor-pointer items-center gap-1 text-[13px] text-alinma-warm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7d6e63" strokeWidth="2">
              <polyline points="17,1 21,5 17,9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7,23 3,19 7,15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            تحويل جديد
          </button>
          <button className="flex cursor-pointer items-center gap-1 text-[13px] text-alinma-warm">
            <span className="text-base">+</span> إضافة مستفيد
          </button>
        </div>
        <span className="text-[17px] font-bold">تحويل أموال</span>
      </div>
      <div className="mb-4 h-px bg-black/[0.07]" />

      <div className="flex gap-[22px] overflow-x-auto py-1">
        {beneficiaries.map((b) => (
          <div key={b.id} className="flex shrink-0 cursor-pointer flex-col items-center gap-1.5">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-black/[0.08] bg-alinma-sand text-[18px] font-bold text-alinma-navy">
              {b.initial === "★" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#f5b91e"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
              ) : b.initial === "anb" ? (
                <span className="text-[11px] font-extrabold text-[#c0392b]">anb</span>
              ) : (
                <span>{b.initial}</span>
              )}
            </div>
            <span className="max-w-[64px] text-center text-[11px] leading-tight">{b.name}</span>
            <span className="text-[9px] text-alinma-warm">{b.bank}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
