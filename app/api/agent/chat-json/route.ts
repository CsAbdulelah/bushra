import {
  ensurePythonSession,
  mapConfirmation,
  pythonChat,
} from "@/lib/bushra/agent-adapter";
import { serverConfig } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * JSON variant of /api/agent/chat, used by the Realtime API tool calls.
 * The voice model needs a synchronous result to speak, so we collapse the
 * whole reply into a single JSON blob instead of an SSE stream.
 */
export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as
    | { sessionId: string; text: string; customerId?: string }
    | null;
  if (!body?.sessionId || !body?.text) {
    return new Response("bad request", { status: 400 });
  }

  const customerId = body.customerId || serverConfig.defaultCustomerId;

  try {
    const entry = await ensurePythonSession(body.sessionId, customerId);
    const resp = await pythonChat(entry.pythonSessionId, body.text);

    if (resp.type === "confirmation_required" && resp.confirmation) {
      const mapped = mapConfirmation(resp.confirmation);
      return Response.json({
        kind: "confirmation_required",
        confirmationType: resp.confirmation.type,
        flowId: mapped.flow,
        flowContext: mapped.flowContext,
        // Speakable prompt for the voice model — falls back to a generic ask.
        speak: buildConfirmationPrompt(resp.confirmation),
      });
    }

    return Response.json({
      kind: "reply",
      reply: resp.reply ?? "",
      speak: resp.reply ?? "",
    });
  } catch (err) {
    return Response.json(
      { kind: "error", speak: "حصل خطأ في الاتصال بالنظام. حاول مرة ثانية." },
      { status: 500 },
    );
  }
}

function buildConfirmationPrompt(c: { type: string; transfer_summary?: unknown; payment_summary?: unknown }): string {
  if (c.type === "transfer_confirmation") {
    const s = (c.transfer_summary ?? {}) as {
      amount?: number;
      to?: { name_ar?: string };
    };
    return `أنا على وشك تحويل ${s.amount ?? "المبلغ"} ريال إلى ${s.to?.name_ar ?? "المستفيد"}. هل تؤكد؟`;
  }
  if (c.type === "bill_payment_confirmation") {
    const s = (c.payment_summary ?? {}) as {
      total_amount?: number;
      bills?: Array<{ biller_name_ar?: string }>;
    };
    const first = s.bills?.[0];
    return `تأكيد سداد ${s.total_amount ?? "الفاتورة"} ريال لصالح ${first?.biller_name_ar ?? "الجهة"}. هل تؤكد؟`;
  }
  if (c.type === "card_replacement_confirmation") {
    return "أنا على وشك طلب استبدال البطاقة. هل تؤكد؟";
  }
  if (c.type === "product_application_confirmation") {
    return "سأقدّم طلب المنتج نيابة عنك. هل تؤكد؟";
  }
  return "هل تؤكد العملية؟";
}
