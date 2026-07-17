import {
  getSession,
  mapConfirmation,
  pythonConfirm,
} from "@/lib/bushra/agent-adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * JSON variant of /api/agent/confirmations. Called by the Realtime voice
 * pipeline when the user says "yes"/"confirm"/"go ahead" to a pending
 * banking action.
 */
export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as
    | { sessionId: string; approve: boolean }
    | null;
  if (!body?.sessionId || typeof body.approve !== "boolean") {
    return new Response("bad request", { status: 400 });
  }

  try {
    const entry = getSession(body.sessionId);
    if (!entry) {
      return Response.json({ kind: "error", speak: "الجلسة غير موجودة." }, { status: 404 });
    }
    const resp = await pythonConfirm(entry.pythonSessionId, body.approve);

    if (resp.type === "confirmation_required" && resp.confirmation) {
      const mapped = mapConfirmation(resp.confirmation);
      return Response.json({
        kind: "confirmation_required",
        flowId: mapped.flow,
        flowContext: mapped.flowContext,
        speak: "أحتاج تأكيداً إضافياً.",
      });
    }
    return Response.json({
      kind: "reply",
      reply: resp.reply ?? "",
      speak: resp.reply ?? "",
    });
  } catch (err) {
    return Response.json(
      { kind: "error", speak: "لم أتمكن من إتمام العملية. حاول مرة ثانية." },
      { status: 500 },
    );
  }
}
