"use client";

import { useBushra } from "@/hooks/useBushra";

const chips: { label: string; text: string; solid?: boolean }[] = [
  { label: "💰 رصيدي", text: "ما رصيدي؟" },
  { label: "↗ تحويل سريع", text: "حول 300 ريال لمحمد سامي" },
  { label: "📋 سداد فاتورة", text: "سددي فاتورة الكهرباء" },
  { label: "🔒 إدارة البطاقة", text: "اجمّدي بطاقتي" },
  { label: "✨ فرصة ادخار", text: "أخبريني عن فرص الادخار" },
  { label: "📊 آخر المعاملات", text: "أرني آخر معاملاتي" },
  { label: "🏦 منتجات رقمية", text: "ما هي المنتجات الرقمية؟", solid: true },
];

export function QuickActions() {
  const b = useBushra();
  return (
    <div dir="rtl" className="flex flex-wrap justify-end gap-1.5 py-1.5">
      {chips.map((c) => (
        <button
          key={c.label}
          onClick={() => b.send(c.text)}
          className={`cursor-pointer rounded-[20px] border px-3 py-1.5 text-xs ${
            c.solid
              ? "border-alinma-navy bg-alinma-navy text-white hover:bg-alinma-navy-2"
              : "border-black/[0.12] bg-white text-alinma-navy hover:bg-alinma-sand"
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
