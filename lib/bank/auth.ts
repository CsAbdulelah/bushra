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
    // No key configured → open POC mode: everyone through. Log once so
    // it's visible in Vercel/dev logs but not spammy in prod.
    if (!serverConfig.bankKey) {
      if (!warned) {
        console.warn("[bank] BUSHRA_MOCK_BANK_KEY not set — mutating endpoints are OPEN");
        warned = true;
      }
      return handler(req, ctx);
    }
    const key = req.headers.get("x-bushra-mock-key");
    if (key !== serverConfig.bankKey) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return handler(req, ctx);
  };
}

let warned = false;

export function cors(res: NextResponse): NextResponse {
  const origins = serverConfig.agentOrigin;
  if (origins.length > 0) {
    res.headers.set("Access-Control-Allow-Origin", origins.join(","));
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type,X-Bushra-Mock-Key");
  }
  return res;
}
