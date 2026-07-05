/**
 * Bushra Mock Agent — stand-in for the LLM/Agent service until colleagues ship theirs.
 *
 * Contract (must match lib/bushra/events.ts):
 *   POST /chat            → SSE stream of BushraEvents
 *   POST /confirmations   → 200; resumes a paused turn
 *   GET  /health          → { ok: true }
 *
 * Run with:  bun run mock-agent/server.ts   (default port 8787)
 */

import type { BushraEvent } from "@/lib/bushra/events";

const PORT = Number(process.env.PORT ?? 8787);
const BANK_BASE = process.env.BANK_BASE ?? "http://localhost:3000";
const BANK_KEY = process.env.BUSHRA_MOCK_BANK_KEY ?? "dev-secret-change-me";

type PendingResolver = (payload: { ok: boolean; otp?: string; reason?: string }) => void;

const pending = new Map<string, PendingResolver>();

async function bankCall(path: string, body: unknown): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  try {
    const res = await fetch(`${BANK_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Bushra-Mock-Key": BANK_KEY },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { ok: false, error: `bank returned ${res.status}` };
    return { ok: true, data: await res.json() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "bank call failed" };
  }
}

const enc = new TextEncoder();

function frame(evt: BushraEvent): Uint8Array {
  return enc.encode(`data: ${JSON.stringify(evt)}\n\n`);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tokenize(text: string, push: (evt: BushraEvent) => void, chunk = 6, delay = 25) {
  const messageId = crypto.randomUUID();
  push({ type: "message_start", messageId, role: "assistant" });
  for (let i = 0; i < text.length; i += chunk) {
    push({ type: "token", text: text.slice(i, i + chunk) });
    await sleep(delay);
  }
  push({ type: "message_end", messageId });
}

async function waitForConfirmation(promptId: string): Promise<{ ok: boolean; otp?: string; reason?: string }> {
  return new Promise((resolve) => {
    pending.set(promptId, (payload) => {
      pending.delete(promptId);
      resolve(payload);
    });
  });
}

// ── Scripted flows ────────────────────────────────────────────

async function runFlow(text: string, push: (evt: BushraEvent) => void): Promise<void> {
  const t = text.toLowerCase();

  if (matches(t, ["رصيد", "حساب", "balance"])) {
    await tokenize("بالطبع! هذه أرصدة حساباتك:", push);
    push({ type: "flow", flow: "balance" });
    return;
  }

  if (matches(t, ["حول", "تحويل", "300", "محمد"]) && !t.includes("أكد")) {
    await tokenize("وجدت محمد سامي في قائمة المستفيدين.\nراجع التفاصيل وأكّد بـ Face ID:", push);
    push({ type: "flow", flow: "transfer-confirm", context: { amount: 300, recipient: "محمد سامي" } });
    return;
  }

  if (matches(t, ["أكد التحويل", "face id"])) {
    const promptId = crypto.randomUUID();
    push({ type: "requires_confirmation", kind: "face_id", promptId, context: { amount: 300, recipient: "محمد سامي" } });
    const answer = await waitForConfirmation(promptId);
    if (!answer.ok) {
      // Face ID declined → offer OTP.
      const otpPrompt = crypto.randomUUID();
      await tokenize("تم إرسال رمز OTP إلى جوالك ••30", push);
      push({ type: "flow", flow: "otp-entry" });
      push({ type: "requires_confirmation", kind: "otp", promptId: otpPrompt, context: { otpMaskedPhone: "••30" } });
      const otpAnswer = await waitForConfirmation(otpPrompt);
      if (!otpAnswer.ok) {
        await tokenize("تم الإلغاء. هل هناك شيء آخر؟", push);
        push({ type: "flow", flow: null });
        return;
      }
    }
    const toolCallId = crypto.randomUUID();
    push({ type: "tool_call", toolCallId, name: "transfer", args: { amount: 300, recipient: "محمد سامي" } });
    const result = await bankCall("/api/bank/transfers", { fromAccountId: "acc-main", recipient: "محمد سامي", amount: 300 });
    push({ type: "tool_result", toolCallId, ok: result.ok, summary: result.ok ? "transfer completed" : result.error });
    const ref = (result.data as { ref?: string } | undefined)?.ref ?? "INM-2026-447821";
    await tokenize(
      `تم التحويل بنجاح! ✅\n━━━━━━━━━━━━━━━\nالمبلغ: 300.00 ريال\nإلى: محمد سامي\nرقم المرجع: ${ref}`,
      push,
    );
    push({ type: "flow", flow: null });
    return;
  }

  if (matches(t, ["فاتورة", "كهرباء", "سداد"]) && !t.includes("أكد")) {
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

  // Bill selection — user tapped one of the two options; text carries the amount.
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

  // Bill confirm — text carries the amount so we know which biller to pay.
  if (matches(t, ["أكد سداد"])) {
    const amount = /186/.test(t) ? 186 : /94/.test(t) ? 94 : 186;
    const billerId = amount === 94 ? "bill-sub" : "bill-main";
    const billerLabel = amount === 94 ? "شركة الكهرباء — الحساب الفرعي" : "شركة الكهرباء السعودية";

    const toolCallId = crypto.randomUUID();
    push({ type: "tool_call", toolCallId, name: "pay_bill", args: { billerId, amount } });
    const result = await bankCall("/api/bank/bills/pay", { billerId, amount, billerLabel });
    push({ type: "tool_result", toolCallId, ok: result.ok, summary: result.error });
    const ref = (result.data as { ref?: string } | undefined)?.ref ?? "SADAD-2026-889034";
    await tokenize(
      `تم سداد الفاتورة بنجاح! ✅\n━━━━━━━━━━━━━━━\n${billerLabel}\nالمبلغ: ${amount.toFixed(2)} ريال\nرقم SADAD: ${ref}`,
      push,
    );
    push({ type: "flow", flow: null });
    return;
  }

  if (matches(t, ["اجمّد", "تجميد", "بطاقتي"]) && !t.includes("أكد") && !t.includes("ارفع")) {
    await tokenize("سأجمّد بطاقتك VISA *** 4521. هل أنت متأكد؟", push);
    push({ type: "flow", flow: "card-freeze" });
    return;
  }

  if (matches(t, ["أكد تجميد"])) {
    const toolCallId = crypto.randomUUID();
    push({ type: "tool_call", toolCallId, name: "freeze_card", args: { cardId: "card-visa" } });
    const result = await bankCall("/api/bank/cards/card-visa/freeze", { frozen: true });
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
    const result = await bankCall("/api/bank/cards/card-visa/freeze", { frozen: false });
    push({ type: "tool_result", toolCallId, ok: result.ok, summary: result.error });
    await tokenize("تم رفع التجميد! 🔓\n━━━━━━━━━━━━━━━\nVISA *** 4521 نشطة الآن.", push);
    push({ type: "flow", flow: null });
    return;
  }

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
    const result = await bankCall("/api/bank/savings/move", { amount: 1200 });
    push({ type: "tool_result", toolCallId, ok: result.ok, summary: result.error });
    await tokenize(
      "تم التحويل لحساب التوفير! ✅\n━━━━━━━━━━━━━━━\n1,200 ريال → برنامج الادخار الإنماء\nالعائد السنوي: 24.00 ريال 🎉",
      push,
    );
    push({ type: "flow", flow: null });
    return;
  }

  if (matches(t, ["معاملات", "أرني"])) {
    await tokenize("هذه آخر 5 معاملات:", push);
    push({ type: "flow", flow: "transactions" });
    return;
  }

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

function matches(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// ── HTTP server ────────────────────────────────────────────────

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }

    if (url.pathname === "/confirmations" && req.method === "POST") {
      const body = (await req.json().catch(() => null)) as
        | { sessionId?: string; promptId: string; ok: boolean; otp?: string; reason?: string }
        | null;
      if (!body?.promptId) return new Response("bad request", { status: 400, headers: corsHeaders() });
      const resolver = pending.get(body.promptId);
      if (resolver) resolver({ ok: body.ok, otp: body.otp, reason: body.reason });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() },
      });
    }

    if (url.pathname === "/chat" && req.method === "POST") {
      const body = (await req.json().catch(() => null)) as { sessionId: string; text: string } | null;
      if (!body?.text) return new Response("bad request", { status: 400, headers: corsHeaders() });

      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const push = (evt: BushraEvent) => controller.enqueue(frame(evt));
          push({ type: "session", sessionId: body.sessionId });
          try {
            await runFlow(body.text, push);
          } catch (err) {
            push({ type: "error", message: err instanceof Error ? err.message : "flow error", recoverable: false });
          } finally {
            push({ type: "done" });
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          ...corsHeaders(),
        },
      });
    }

    return new Response("not found", { status: 404, headers: corsHeaders() });
  },
});

console.log(`[mock-agent] listening on http://localhost:${PORT}`);
