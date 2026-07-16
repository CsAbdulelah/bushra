/**
 * Same-origin `/api/agent` is the Python-backend adapter (chat/confirm/voice).
 * `/api/dev` is the legacy built-in mock kept for offline/CLI testing.
 * Set NEXT_PUBLIC_AGENT_URL to override.
 */
export const clientConfig = {
  agentUrl: process.env.NEXT_PUBLIC_AGENT_URL || "/api/agent",
  asrUrl: process.env.NEXT_PUBLIC_ASR_URL ?? "",
  ttsUrl: process.env.NEXT_PUBLIC_TTS_URL ?? "",
  customerId: process.env.NEXT_PUBLIC_BUSHRA_CUSTOMER_ID || "CUST-002",
} as const;

export const serverConfig = {
  bankKey: process.env.BUSHRA_MOCK_BANK_KEY ?? "",
  agentOrigin: (process.env.BUSHRA_AGENT_ORIGIN ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  pythonAgentUrl: process.env.PYTHON_AGENT_URL || "http://127.0.0.1:8000",
  defaultCustomerId: process.env.BUSHRA_CUSTOMER_ID || "CUST-002",
} as const;
