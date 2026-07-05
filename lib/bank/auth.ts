import { NextResponse } from "next/server";
import { serverConfig } from "@/lib/config";

type Handler = (req: Request, ctx: unknown) => Promise<Response> | Response;

/**
 * Gate a mutating handler (POST/PUT/DELETE) behind the shared bank key.
 * Reads are open so the dashboard can render live state without shipping
 * the secret to the browser.
 */
export function withBankAuth(handler: Handler): Handler {
  return async (req: Request, ctx: unknown) => {
    const key = req.headers.get("x-bushra-mock-key");
    if (!serverConfig.bankKey || key !== serverConfig.bankKey) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return handler(req, ctx);
  };
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
