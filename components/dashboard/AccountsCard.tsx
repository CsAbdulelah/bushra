import { accounts } from "@/lib/bank/fixtures";

const nf = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function AccountsCard() {
  const shown = accounts.slice(0, 2);
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowBtn dir="left" />
          <ArrowBtn dir="right" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex cursor-pointer items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7d6e63" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-[13px] text-alinma-warm">إظهار الرصيد</span>
          </div>
          <span className="text-[17px] font-bold">قائمة الحسابات</span>
        </div>
      </div>

      <div className="flex gap-3.5">
        {shown.map((acc, i) => (
          <div
            key={acc.id}
            className={`flex-1 rounded-xl bg-white p-4 ${
              i === 0 ? "border-2 border-alinma-navy" : "border border-black/10"
            }`}
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span className="rounded-md bg-[#e8dfd6] px-2.5 py-0.5 text-[11px] font-semibold">حساب جاري</span>
              <span className={`text-lg ${i === 0 ? "text-[#f5b91e]" : "text-[#c0b8ae]"}`}>{i === 0 ? "★" : "☆"}</span>
            </div>
            <div className="mb-0.5 text-xs text-alinma-warm">
              {acc.name !== "الحساب الجاري الرئيسي" && `${acc.name} | `}
              {acc.iban}
            </div>
            <div className="mt-3.5 flex items-center justify-end gap-1">
              <span className="text-[15px] font-bold text-alinma-navy">{nf.format(acc.balance)} ر.س</span>
              <span className="text-xs text-alinma-warm">:الرصيد</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArrowBtn({ dir }: { dir: "left" | "right" }) {
  const points = dir === "left" ? "15,18 9,12 15,6" : "9,18 15,12 9,6";
  return (
    <button className="flex h-7 w-7 items-center justify-center rounded-full border border-black/[0.12] bg-white">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15233a" strokeWidth="2.5">
        <polyline points={points} />
      </svg>
    </button>
  );
}
