import {
  getSession,
  makeSseResponse,
  pushPythonResponse,
  pythonConfirm,
} from "@/lib/bushra/agent-adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { sessionId: string; promptId?: string; ok: boolean };

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.sessionId || typeof body.ok !== "boolean") {
    return new Response("bad request", { status: 400 });
  }

  return makeSseResponse(async (push) => {
    const entry = getSession(body.sessionId);
    if (!entry) {
      push({ type: "error", message: "unknown session", recoverable: false });
      return;
    }
    const resp = await pythonConfirm(entry.pythonSessionId, body.ok);
    await pushPythonResponse(push, entry, resp);
  }, body.sessionId);
}
