/**
 * Same-origin `/api/dev` is the built-in mock agent. Colleagues' real
 * agent goes on `NEXT_PUBLIC_AGENT_URL` when ready.
 */
export const clientConfig = {
  agentUrl: process.env.NEXT_PUBLIC_AGENT_URL || "/api/dev",
  asrUrl: process.env.NEXT_PUBLIC_ASR_URL ?? "",
  ttsUrl: process.env.NEXT_PUBLIC_TTS_URL ?? "",
} as const;

export const serverConfig = {
  bankKey: process.env.BUSHRA_MOCK_BANK_KEY ?? "",
  agentOrigin: (process.env.BUSHRA_AGENT_ORIGIN ?? "").split(",").map((s) => s.trim()).filter(Boolean),
} as const;
