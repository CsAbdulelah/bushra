import { serverConfig } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxy to Python /customer/{id}/summary — the single call the dashboard
 * needs to render accounts, cards, beneficiaries, bills, and recent
 * transactions. Kept server-side so the browser never talks to Python
 * directly (avoids CORS + hides the backend URL).
 */
export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const customerId = url.searchParams.get("customerId") || serverConfig.defaultCustomerId;
  const upstream = `${serverConfig.pythonAgentUrl.replace(/\/$/, "")}/customer/${encodeURIComponent(customerId)}/summary`;

  const res = await fetch(upstream, { cache: "no-store" });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
