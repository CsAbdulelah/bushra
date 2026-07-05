import { cards } from "@/lib/bank/fixtures";

const gradients: Record<string, string> = {
  visa: "linear-gradient(135deg,#15233a 0%,#2a4a78 100%)",
  mada: "linear-gradient(135deg,#2e5d38,#3d7a4a)",
  travel: "linear-gradient(135deg,#6b3fa0,#8b55c0)",
};

const labels: Record<string, string> = {
  visa: "ائتمانية",
  mada: "مدى",
  travel: "سفر",
};

const nf = new Intl.NumberFormat("en-US");

export function CardsCarousel() {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <span className="cursor-pointer text-[13px] text-alinma-warm">عرض الكل ›</span>
        <span className="text-[17px] font-bold">بطاقاتي</span>
      </div>

      <div className="flex gap-3.5">
        {cards.map((c) => (
          <div
            key={c.id}
            className="relative min-h-[120px] flex-1 overflow-hidden rounded-2xl p-[18px] text-white"
            style={{ background: gradients[c.brand] }}
          >
            {c.brand === "visa" && (
              <div className="absolute -top-5 -right-5 h-[90px] w-[90px] rounded-full bg-white/5" />
            )}
            <div className="mb-4 flex items-start justify-between">
              <div className="text-[11px] font-extrabold tracking-widest opacity-80">
                {c.brand === "travel" ? "✈ TRAVEL" : c.network}
              </div>
              <div className="rounded-md bg-white/[0.12] px-2 py-[3px] text-[10px]">{labels[c.brand]}</div>
            </div>

            {c.brand !== "travel" ? (
              <div className="mb-3.5 text-[13px] tracking-[3px] opacity-90">**** **** **** {c.last4}</div>
            ) : (
              <div className="mb-2.5 text-[11px] leading-snug opacity-65">بطاقة السفر الإنماء</div>
            )}

            <div className="flex items-end justify-between">
              <div className="text-[10px] opacity-55">{c.brand === "travel" ? "نشطة" : c.expiry}</div>
              <div className="text-right">
                <div className="mb-0.5 text-[9px] opacity-55">
                  {c.brand === "visa" ? "الحد المتاح" : c.brand === "travel" ? "الرصيد (USD)" : "الرصيد"}
                </div>
                <div className="text-[13px] font-bold">
                  {c.currency === "USD" ? `$${nf.format(c.balance)}.00` : `${nf.format(c.balance)} ر.س`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex gap-2.5">
        {[
          "🔒 تجميد البطاقة",
          "💳 رفع الحد",
          "📋 كشف الحساب",
          "➕ طلب بطاقة",
        ].map((label) => (
          <button
            key={label}
            className="flex-1 cursor-pointer rounded-[9px] border border-black/[0.12] bg-white px-2 py-2.5 text-xs text-alinma-navy hover:bg-alinma-sand"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
