/**
 * Shared flow logic for the mock agent.
 *
 * Consumed by:
 *   - app/api/dev/chat/route.ts  (serverless, runs on Vercel)
 *   - mock-agent/server.ts       (standalone Bun for CLI/local dev)
 *
 * Design constraint: this must run correctly on a stateless serverless
 * function. So the mock never *waits* for a follow-up POST — the browser
 * drives multi-step flows by sending a new /chat call with a specific
 * "confirmed" text (e.g. Face ID success → new chat message).
 */

import type { BushraEvent } from "@/lib/bushra/events";

export type FlowPush = (evt: BushraEvent) => void;

export type BankResult = { ok: boolean; data?: unknown; error?: string };
export type BankCall = (path: string, body: unknown) => Promise<BankResult>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tokenize(text: string, push: FlowPush, chunk = 6, delay = 22): Promise<void> {
  const messageId = crypto.randomUUID();
  push({ type: "message_start", messageId, role: "assistant" });
  for (let i = 0; i < text.length; i += chunk) {
    push({ type: "token", text: text.slice(i, i + chunk) });
    await sleep(delay);
  }
  push({ type: "message_end", messageId });
}

const matches = (text: string, keywords: string[]) => keywords.some((k) => text.includes(k));

export async function runChat(text: string, push: FlowPush, bank: BankCall): Promise<void> {
  const t = text.toLowerCase();

  // ── Balance ────────────────────────────────────────────
  if (matches(t, ["رصيد", "حساب", "balance"]) && !matches(t, ["حول", "تحويل"])) {
    await tokenize("بالطبع! هذه أرصدة حساباتك:", push);
    push({ type: "flow", flow: "balance" });
    return;
  }

  // ── Transfer: initial ask (not the confirmation follow-up) ────
  if (matches(t, ["حول", "تحويل"]) && matches(t, ["300", "محمد"]) && !matches(t, ["نفّذ", "تم face"])) {
    await tokenize("وجدت محمد سامي في قائمة المستفيدين.\nراجع التفاصيل وأكّد بـ Face ID:", push);
    push({ type: "flow", flow: "transfer-confirm", context: { amount: 300, recipient: "محمد سامي" } });
    return;
  }

  // ── Transfer: user confirmed via local Face ID modal ──
  if (matches(t, ["نفّذ التحويل", "تم face id"])) {
    const toolCallId = crypto.randomUUID();
    push({ type: "tool_call", toolCallId, name: "transfer", args: { amount: 300, recipient: "محمد سامي" } });
    const result = await bank("/api/bank/transfers", {
      fromAccountId: "acc-main",
      recipient: "محمد سامي",
      amount: 300,
    });
    push({ type: "tool_result", toolCallId, ok: result.ok, summary: result.ok ? "transfer completed" : result.error });
    const ref = (result.data as { ref?: string } | undefined)?.ref ?? "INM-2026-447821";
    await tokenize(
      `تم التحويل بنجاح! ✅\n━━━━━━━━━━━━━━━\nالمبلغ: 300.00 ريال\nإلى: محمد سامي\nرقم المرجع: ${ref}`,
      push,
    );
    push({ type: "flow", flow: null });
    return;
  }

  // ── Bill: initial ask, show two options ────────────────
  if (matches(t, ["فاتورة", "كهرباء", "سداد"]) && !t.startsWith("سدد شركة") && !matches(t, ["أكد سداد"])) {
    await tokenize("وجدت فاتورتين لشركة الكهرباء. أيهما تريد سداده؟", push);
    push({
      type: "flow",
      flow: "bill-confirm",
      context: {
        options: [
          { id: "bill-main", label: "شركة الكهرباء — الحساب الرئيسي", amount: 186 },
          { id: "bill-sub", label: "شركة الكهرباء — الحساب الفرعي", amount: 94 },
        ],
      },
    });
    return;
  }

  // ── Bill: user picked one option ──────────────────────
  if (t.startsWith("سدد شركة الكهرباء")) {
    const isSub = t.includes("الفرعي");
    const amount = isSub ? 94 : 186;
    const biller = isSub ? "شركة الكهرباء — الحساب الفرعي" : "شركة الكهرباء السعودية";
    push({
      type: "flow",
      flow: "bill-confirm",
      context: { selected: { biller, amount, due: "30 يونيو 2026" } },
    });
    await tokenize("تفاصيل الفاتورة:", push);
    return;
  }

  // ── Bill: user confirmed ─────────────────────────────
  if (matches(t, ["أكد سداد"])) {
    const amount = /186/.test(t) ? 186 : /94/.test(t) ? 94 : 186;
    const billerId = amount === 94 ? "bill-sub" : "bill-main";
    const billerLabel = amount === 94 ? "شركة الكهرباء — الحساب الفرعي" : "شركة الكهرباء السعودية";

    const toolCallId = crypto.randomUUID();
    push({ type: "tool_call", toolCallId, name: "pay_bill", args: { billerId, amount } });
    const result = await bank("/api/bank/bills/pay", { billerId, amount, billerLabel });
    push({ type: "tool_result", toolCallId, ok: result.ok, summary: result.error });
    const ref = (result.data as { ref?: string } | undefined)?.ref ?? "SADAD-2026-889034";
    await tokenize(
      `تم سداد الفاتورة بنجاح! ✅\n━━━━━━━━━━━━━━━\n${billerLabel}\nالمبلغ: ${amount.toFixed(2)} ريال\nرقم SADAD: ${ref}`,
      push,
    );
    push({ type: "flow", flow: null });
    return;
  }

  // ── Card freeze ──────────────────────────────────────
  if (matches(t, ["اجمّد", "تجميد", "بطاقتي"]) && !matches(t, ["أكد", "ارفع"])) {
    await tokenize("سأجمّد بطاقتك VISA *** 4521. هل أنت متأكد؟", push);
    push({ type: "flow", flow: "card-freeze" });
    return;
  }
  if (matches(t, ["أكد تجميد"])) {
    const toolCallId = crypto.randomUUID();
    push({ type: "tool_call", toolCallId, name: "freeze_card", args: { cardId: "card-visa" } });
    const result = await bank("/api/bank/cards/card-visa/freeze", { frozen: true });
    push({ type: "tool_result", toolCallId, ok: result.ok, summary: result.error });
    await tokenize(
      "تم تجميد البطاقة! 🔒\n━━━━━━━━━━━━━━━\nVISA *** 4521\nيمكنك رفع التجميد بأمر صوتي \"ارفع تجميد بطاقتي\"",
      push,
    );
    push({ type: "flow", flow: null });
    return;
  }
  if (matches(t, ["ارفع التجميد", "رفع التجميد"])) {
    const toolCallId = crypto.randomUUID();
    push({ type: "tool_call", toolCallId, name: "unfreeze_card", args: { cardId: "card-visa" } });
    const result = await bank("/api/bank/cards/card-visa/freeze", { frozen: false });
    push({ type: "tool_result", toolCallId, ok: result.ok, summary: result.error });
    await tokenize("تم رفع التجميد! 🔓\n━━━━━━━━━━━━━━━\nVISA *** 4521 نشطة الآن.", push);
    push({ type: "flow", flow: null });
    return;
  }

  // ── Savings ─────────────────────────────────────────
  if (matches(t, ["ادخار", "توفير", "فرص"])) {
    await tokenize(
      "لاحظت أنك تحتفظ بحوالي 1,200 ريال شهرياً دون استثمار 📊\nبرنامج الادخار من الإنماء يمنحك 2% سنوياً. تحوّل الآن؟",
      push,
    );
    push({ type: "flow", flow: "savings", context: { rate: 2, monthly: 1200, yearly: 24 } });
    return;
  }
  if (matches(t, ["حوّل الآن للادخار", "نعم، حوّل"])) {
    const toolCallId = crypto.randomUUID();
    push({ type: "tool_call", toolCallId, name: "open_savings", args: { amount: 1200 } });
    const result = await bank("/api/bank/savings/move", { amount: 1200 });
    push({ type: "tool_result", toolCallId, ok: result.ok, summary: result.error });
    await tokenize(
      "تم التحويل لحساب التوفير! ✅\n━━━━━━━━━━━━━━━\n1,200 ريال → برنامج الادخار الإنماء\nالعائد السنوي: 24.00 ريال 🎉",
      push,
    );
    push({ type: "flow", flow: null });
    return;
  }

  // ── Recent transactions ────────────────────────────
  if (matches(t, ["معاملات", "أرني"])) {
    await tokenize("هذه آخر 5 معاملات:", push);
    push({ type: "flow", flow: "transactions" });
    return;
  }

  // ── Digital products ───────────────────────────────
  if (matches(t, ["منتجات", "منتج"])) {
    await tokenize("لديك 3 منتجات رقمية قد تناسبك 🏦", push);
    push({ type: "flow", flow: "digital-products" });
    return;
  }

  if (matches(t, ["إلغاء"])) {
    await tokenize("تم الإلغاء. هل هناك شيء آخر؟", push);
    push({ type: "flow", flow: null });
    return;
  }

  await tokenize(
    "يمكنني مساعدتك في:\n• التحويلات • الفواتير • الرصيد\n• البطاقات • المنتجات الرقمية\nجرّب الاختصارات أدناه أو الضغط على 🎤 للتحدث.",
    push,
  );
}
