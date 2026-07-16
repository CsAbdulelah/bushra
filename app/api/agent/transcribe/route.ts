import { serverConfig } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const form = await req.formData().catch(() => null);
  if (!form) return new Response("bad request", { status: 400 });
  const file = form.get("file");
  if (!(file instanceof Blob)) return new Response("missing file", { status: 400 });

  const upstream = new FormData();
  const name = (file as File).name || "audio.webm";
  upstream.append("file", file, name);

  const res = await fetch(`${serverConfig.pythonAgentUrl.replace(/\/$/, "")}/transcribe`, {
    method: "POST",
    body: upstream,
  });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}
