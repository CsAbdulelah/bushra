import {
  ensurePythonSession,
  makeSseResponse,
  pushPythonResponse,
  pythonChat,
  streamAssistantReply,
} from "@/lib/bushra/agent-adapter";
import { serverConfig } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { sessionId: string; text: string; customerId?: string };

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.sessionId || !body?.text) {
    return new Response("bad request", { status: 400 });
  }

  const customerId = body.customerId || serverConfig.defaultCustomerId;

  return makeSseResponse(async (push) => {
    const entry = await ensurePythonSession(body.sessionId, customerId);

    // If this is the very first turn and Python returned an opener, stream it
    // as an assistant message before processing the user's text.
    const firstTurn = !("_openerPushed" in entry) && entry.opener;
    if (firstTurn) {
      await streamAssistantReply(push, entry.opener!);
      (entry as unknown as { _openerPushed: true })._openerPushed = true;
    }

    const resp = await pythonChat(entry.pythonSessionId, body.text);
    await pushPythonResponse(push, entry, resp);
  }, body.sessionId);
}
