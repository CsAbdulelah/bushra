"use client";

import { useLiveBank } from "@/hooks/useLiveBank";

const nf = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TransactionsList() {
  const { transactions } = useLiveBank();
  const rows = transactions.slice(0, 5);

  return (
    <section className="rounded-2xl bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <span className="cursor-pointer text-[13px] text-alinma-warm">عرض الكل ›</span>
        <span className="text-[17px] font-bold">آخر المعاملات</span>
      </div>
      <div className="flex flex-col">
        {rows.length === 0 && <div className="py-6 text-center text-xs text-alinma-warm">لا توجد معاملات بعد</div>}
        {rows.map((tx, i) => {
          const positive = tx.amount > 0;
          return (
            <div
              key={tx.id}
              className={`flex items-center justify-between py-2.5 ${
                i < rows.length - 1 ? "border-b border-black/[0.05]" : ""
              }`}
            >
              <div className={`text-[13px] font-bold tabular-nums ${positive ? "text-alinma-green" : "text-alinma-red"}`}>
                {positive ? "+" : "−"}
                {nf.format(Math.abs(tx.amount))} ر.س
              </div>
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <div className="text-[13px] font-semibold">{tx.merchant}</div>
                  <div className="text-[10px] text-alinma-warm">
                    {tx.date} • {tx.category}
                  </div>
                </div>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-[9px] text-base"
                  style={{ background: tx.iconBg }}
                >
                  {tx.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
