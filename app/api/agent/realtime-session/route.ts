import { serverConfig } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxies to Python /realtime-session, which mints an ephemeral OpenAI
 * Realtime API session. The browser uses the returned client_secret to
 * open a WebRTC connection directly to OpenAI.
 *
 * The real OPENAI_API_KEY never leaves the Python backend — only the
 * short-lived ephemeral token reaches the browser.
 */
export async function POST(): Promise<Response> {
  const res = await fetch(
    `${serverConfig.pythonAgentUrl.replace(/\/$/, "")}/realtime-session`,
    { method: "POST" },
  );
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
