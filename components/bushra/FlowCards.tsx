"use client";

import { useBushra } from "@/hooks/useBushra";
import { useLiveBank } from "@/hooks/useLiveBank";
import type { FlowContext } from "./BushraProvider";

export function FlowCards() {
  const b = useBushra();
  switch (b.activeFlow) {
    case "balance": return <BalanceCard />;
    case "transfer-confirm": return <TransferConfirmCard ctx={b.flowContext} />;
    case "bill-confirm": return <BillConfirmCard ctx={b.flowContext} />;
    case "card-freeze": return <CardFreezeCard />;
    case "card-unfreeze": return <CardUnfreezeCard />;
    case "savings": return <SavingsCard ctx={b.flowContext} />;
    case "transactions": return <TransactionsCard />;
    case "digital-products": return <DigitalProductsCard />;
    default: return null;
  }
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-slide-up mt-1 rounded-xl bg-white p-3.5 shadow-card">
      {children}
    </div>
  );
}

function BalanceCard() {
  const { accounts } = useLiveBank();
  const nf = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const borders: Record<string, string> = {
    "acc-main": "#15233a",
    "acc-exp": "#7d6e63",
    "acc-savings": "#c8a02a",
  };
  return (
    <div className="animate-slide-up mt-1 flex flex-col gap-2">
      {accounts.map((a) => (
        <div
          key={a.id}
          className="rounded-[10px] bg-white p-3 shadow-card"
          style={{ borderRight: `3px solid ${borders[a.id] ?? "#7d6e63"}` }}
        >
          <div className="mb-1 text-[11px] text-alinma-warm">{a.name}</div>
          <div className="text-[22px] font-bold text-alinma-navy tabular-nums">
            {nf.format(a.balance)} ر.س
          </div>
          <div className="mt-0.5 text-[10px] text-alinma-warm">
            {a.id === "acc-savings" ? "عائد 2% سنوياً" : a.iban}
          </div>
        </div>
      ))}
    </div>
  );
}

function TransferConfirmCard({ ctx }: { ctx: FlowContext }) {
  const b = useBushra();
  const amount = (ctx?.amount as number | undefined) ?? 300;
  const recipient = (ctx?.recipient as string | undefined) ?? "محمد سامي";
  const nf = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <CardShell>
      <div className="mb-2.5 text-right text-xs font-bold text-alinma-navy">مراجعة التحويل</div>
      <Row label="المبلغ" value={<span className="text-base font-bold text-alinma-navy">{nf.format(amount)} ر.س</span>} bordered />
      <Row label="المستفيد" value={<span className="text-[13px] font-semibold text-alinma-navy">{recipient}</span>} />
      <Row label="من حساب" value={<span className="text-xs text-alinma-navy">الحساب الجاري • 795000</span>} spacer />
      <button
        onClick={() =>
          b.requestLocalFaceId(() => {
            b.send(`نفّذ التحويل — تم Face ID (${amount} ريال إلى ${recipient})`);
          })
        }
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[9px] border-0 bg-alinma-navy px-3 py-2.5 text-[13px] font-semibold text-white hover:bg-alinma-navy-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
        تأكيد بـ Face ID
      </button>
      <CancelButton />
    </CardShell>
  );
}

function BillConfirmCard({ ctx }: { ctx: FlowContext }) {
  const b = useBushra();
  const options =
    (ctx?.options as { id: string; label: string; amount: number }[] | undefined) ?? [
      { id: "bill-main", label: "شركة الكهرباء — الحساب الرئيسي", amount: 186 },
      { id: "bill-sub", label: "شركة الكهرباء — الحساب الفرعي", amount: 94 },
    ];
  const selected = ctx?.selected as { biller: string; amount: number; due: string } | undefined;

  return (
    <CardShell>
      {!selected ? (
        <>
          <div className="mb-2.5 text-right text-xs font-bold text-alinma-navy">لديك فاتورتان — أيهما؟</div>
          <div className="flex flex-col gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => b.send(`سدد ${opt.label} ${opt.amount} ريال`)}
                className="flex cursor-pointer items-center justify-between rounded-[9px] border-[1.5px] border-black/10 bg-alinma-cream px-3.5 py-2.5 text-right text-[13px] text-alinma-navy hover:border-alinma-navy hover:bg-[#f0e8e0]"
              >
                <span>{opt.label}</span>
                <span className="text-[13px] font-bold">{opt.amount} ر.س</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mb-2.5 text-right text-xs font-bold text-alinma-navy">تفاصيل الفاتورة</div>
          <Row label="الجهة" value={<span className="text-[13px] font-semibold">{selected.biller}</span>} />
          <Row label="المبلغ" value={<span className="text-[15px] font-bold">{(selected.amount ?? 0).toFixed(2)} ر.س</span>} />
          <Row
            label="الاستحقاق"
            value={<span className="rounded-md bg-[#fff0f0] px-2 py-0.5 text-xs font-semibold text-alinma-red">{selected.due}</span>}
            spacer
          />
          <div className="flex gap-2">
            <button
              onClick={() => b.send(`أكد سداد ${selected.amount} ريال`)}
              className="flex-1 cursor-pointer rounded-[9px] border-0 bg-alinma-navy px-3 py-2.5 text-[13px] font-semibold text-white hover:bg-alinma-navy-2"
            >
              تأكيد السداد
            </button>
            <button
              onClick={() => b.send("إلغاء")}
              className="flex-1 cursor-pointer rounded-[9px] border-[1.5px] border-alinma-navy bg-transparent px-3 py-2.5 text-[13px] text-alinma-navy hover:bg-alinma-sand"
            >
              إلغاء
            </button>
          </div>
        </>
      )}
    </CardShell>
  );
}

function CardFreezeCard() {
  const b = useBushra();
  return (
    <CardShell>
      <div
        className="relative mb-3 flex items-center gap-3 rounded-[10px] p-3.5 text-white"
        style={{ background: "linear-gradient(135deg,#15233a,#2a4a78)" }}
      >
        <div>
          <div className="mb-1 text-xs font-extrabold opacity-80">VISA</div>
          <div className="text-[13px] font-semibold tracking-[2px]">**** **** **** 4521</div>
          <div className="mt-1 text-[10px] opacity-60">ائتمانية • حد متاح 8,500 ر.س</div>
        </div>
      </div>
      <div className="mb-3 rounded-lg bg-[#fff8f0] p-2.5 text-right text-[11px] leading-relaxed text-alinma-warm">
        🔒 بعد التجميد لن يمكن إجراء أي معاملة. يمكن رفع التجميد فوراً من هنا.
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => b.send("أكد تجميد البطاقة")}
            className="flex-1 cursor-pointer rounded-[9px] border-0 bg-alinma-red px-3 py-2.5 text-[13px] font-semibold text-white"
          >
            🔒 تجميد الآن
          </button>
          <button
            onClick={() => b.send("إلغاء")}
            className="flex-1 cursor-pointer rounded-[9px] border-[1.5px] border-alinma-navy bg-transparent px-3 py-2.5 text-[13px] text-alinma-navy hover:bg-alinma-sand"
          >
            إلغاء
          </button>
        </div>
        <button
          onClick={() => b.send("طلب استبدال البطاقة")}
          className="w-full cursor-pointer rounded-[9px] border border-black/10 bg-transparent px-3 py-2.5 text-xs text-alinma-warm hover:bg-alinma-cream"
        >
          أو: طلب استبدال البطاقة
        </button>
      </div>
    </CardShell>
  );
}

function CardUnfreezeCard() {
  const b = useBushra();
  return (
    <CardShell>
      <div
        className="relative mb-3 overflow-hidden rounded-[10px] p-3.5 text-white"
        style={{ background: "linear-gradient(135deg,#15233a,#2a4a78)" }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
          <span className="text-4xl opacity-20">🔒</span>
        </div>
        <div className="relative">
          <div className="mb-1 text-xs font-extrabold opacity-80">VISA — مجمّدة</div>
          <div className="text-[13px] font-semibold tracking-[2px]">**** **** **** 4521</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => b.send("ارفع التجميد")}
          className="flex-1 cursor-pointer rounded-[9px] border-0 bg-alinma-green px-3 py-2.5 text-[13px] font-semibold text-white"
        >
          🔓 رفع التجميد
        </button>
        <button
          onClick={() => b.send("إلغاء")}
          className="flex-1 cursor-pointer rounded-[9px] border-[1.5px] border-alinma-navy bg-transparent px-3 py-2.5 text-[13px] text-alinma-navy hover:bg-alinma-sand"
        >
          إلغاء
        </button>
      </div>
    </CardShell>
  );
}

function SavingsCard({ ctx }: { ctx: FlowContext }) {
  const b = useBushra();
  const rate = (ctx?.rate as number | undefined) ?? 2;
  const monthly = (ctx?.monthly as number | undefined) ?? 1200;
  const yearly = (ctx?.yearly as number | undefined) ?? monthly * (rate / 100) * 12;
  return (
    <CardShell>
      <div
        className="mb-3 rounded-[10px] p-4 text-white"
        style={{ background: "linear-gradient(135deg,#0d1b2e,#1a3560)" }}
      >
        <div className="mb-1 text-[11px] text-white/60">برنامج الادخار — الإنماء</div>
        <div className="mb-1 text-[32px] font-extrabold leading-none">{rate}%</div>
        <div className="mb-3 text-xs text-white/70">عائد سنوي مضمون</div>
        <div className="flex justify-between rounded-lg bg-white/10 p-2.5">
          <span className="text-[13px] font-bold">{(yearly ?? 0).toFixed(2)} ر.س</span>
          <span className="text-[11px] opacity-70">العائد السنوي على {monthly} ر.س</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => b.send("نعم، حوّل الآن للادخار")}
          className="flex-1 cursor-pointer rounded-[9px] border-0 bg-alinma-green px-3 py-2.5 text-[13px] font-semibold text-white"
        >
          نعم، احوّل الآن ✓
        </button>
        <button
          onClick={() => b.send("لاحقاً")}
          className="flex-1 cursor-pointer rounded-[9px] border-[1.5px] border-alinma-navy bg-transparent px-3 py-2.5 text-[13px] text-alinma-navy hover:bg-alinma-sand"
        >
          لاحقاً
        </button>
      </div>
    </CardShell>
  );
}

function TransactionsCard() {
  const { transactions } = useLiveBank();
  const rows = transactions.slice(0, 5);
  return (
    <CardShell>
      <div dir="rtl">
        <div className="mb-2.5 text-xs font-bold text-alinma-navy">آخر 5 معاملات</div>
        <div className="flex flex-col">
          {rows.length === 0 && (
            <div className="py-2 text-center text-[11px] text-alinma-warm">لا توجد معاملات</div>
          )}
          {rows.map((tx, i) => (
            <div
              key={tx.id}
              className={`flex items-center justify-between py-2 ${
                i < rows.length - 1 ? "border-b border-black/[0.05]" : ""
              }`}
            >
              <div
                className={`text-[13px] font-bold tabular-nums ${
                  tx.amount > 0 ? "text-alinma-green" : "text-alinma-red"
                }`}
              >
                {tx.amount > 0 ? "+" : "-"}
                {Math.abs(tx.amount)} ر.س
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold">{tx.merchant}</div>
                <div className="text-[10px] text-alinma-warm">{tx.date.split(" ").slice(0, 2).join(" ")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

function DigitalProductsCard() {
  const b = useBushra();
  const items = [
    { title: "بطاقة السفر الإنماء", subtitle: "9 عملات دولية • بدون رسوم تحويل", icon: "✈", gradient: "linear-gradient(135deg,#6b3fa0,#8b55c0)", cta: "شحن البطاقة الآن", send: "أريد شحن بطاقة السفر" },
    { title: "تمويل شخصي", subtitle: "حتى 500,000 ر.س • متوافق مع الشريعة", icon: "💼", gradient: "linear-gradient(135deg,#1a6b2e,#2d9147)", cta: "تقديم طلب تمويل", send: "أريد التمويل الشخصي" },
    { title: "فتح حساب فرعي", subtitle: "أهداف ادخارية مخصصة", icon: "🏦", gradient: "linear-gradient(135deg,#15233a,#2a4a78)", cta: "فتح حساب جديد", send: "أريد فتح حساب فرعي" },
  ];
  return (
    <div className="animate-slide-up mt-1 flex flex-col gap-2.5">
      {items.map((it) => (
        <div key={it.title} dir="rtl" className="rounded-xl bg-white p-3.5 shadow-card">
          <div className="mb-2.5 flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-lg text-white"
              style={{ background: it.gradient }}
            >
              {it.icon}
            </div>
            <div>
              <div className="text-[13px] font-bold">{it.title}</div>
              <div className="text-[11px] text-alinma-warm">{it.subtitle}</div>
            </div>
          </div>
          <button
            onClick={() => b.send(it.send)}
            className="w-full cursor-pointer rounded-[9px] border-0 px-3 py-2 text-[13px] font-semibold text-white"
            style={{ background: it.gradient.split(",")[1]?.trim().replace(")", "") ?? "#15233a" }}
          >
            {it.cta}
          </button>
        </div>
      ))}
    </div>
  );
}

function Row({ label, value, bordered = false, spacer = false }: { label: string; value: React.ReactNode; bordered?: boolean; spacer?: boolean }) {
  return (
    <div
      className={`flex justify-between ${bordered ? "mb-1.5 border-b border-black/[0.05] pb-1.5" : spacer ? "mb-3" : "mb-1.5"}`}
    >
      {value}
      <span className="text-[11px] text-alinma-warm">{label}</span>
    </div>
  );
}

function CancelButton() {
  const b = useBushra();
  return (
    <button
      onClick={() => b.send("إلغاء")}
      className="mt-1 w-full cursor-pointer border-0 bg-transparent p-2 text-xs text-alinma-warm hover:text-alinma-navy"
    >
      إلغاء
    </button>
  );
}
