/**
 * Stub kept only so the web app's confirmation POST from real-agent flows
 * doesn't 404 in local dev. The mock never emits `requires_confirmation`,
 * so this handler shouldn't fire — but returning 200 keeps things quiet
 * if someone hits it.
 */
export async function POST(): Promise<Response> {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
