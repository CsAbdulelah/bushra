import { serverConfig } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const body = await req.text();
  const res = await fetch(`${serverConfig.pythonAgentUrl.replace(/\/$/, "")}/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    return new Response(text || "tts error", { status: res.status });
  }
  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
