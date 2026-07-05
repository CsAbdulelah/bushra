import { NextResponse } from "next/server";
import { serverConfig } from "@/lib/config";

/**
 * Wraps a route handler so it only runs if the incoming request presents
 * the shared bank key AND (if agent-origin allowlist is set) comes from an
 * allowed origin. Intended to gate /api/bank/* to the agent service only.
 */
export function withBankAuth<T extends (req: Request, ctx: unknown) => Promise<Response> | Response>(
  handler: T,
): T {
  return (async (req: Request, ctx: unknown) => {
    const key = req.headers.get("x-bushra-mock-key");
    if (!serverConfig.bankKey || key !== serverConfig.bankKey) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (serverConfig.agentOrigin.length > 0) {
      const origin = req.headers.get("origin");
      if (origin && !serverConfig.agentOrigin.includes(origin)) {
        return NextResponse.json({ error: "forbidden origin" }, { status: 403 });
      }
    }
    return handler(req, ctx);
  }) as T;
}

export function cors(res: NextResponse): NextResponse {
  const origins = serverConfig.agentOrigin;
  if (origins.length > 0) {
    res.headers.set("Access-Control-Allow-Origin", origins.join(","));
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type,X-Bushra-Mock-Key");
  }
  return res;
}
