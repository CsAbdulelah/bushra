import { NextResponse } from "next/server";
import { withBankAuth, cors } from "@/lib/bank/auth";
import { bank } from "@/lib/bank/store";

type Body = { amount: number };

export const POST = withBankAuth(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !Number.isFinite(body.amount) || body.amount <= 0) {
    return cors(NextResponse.json({ error: "invalid amount" }, { status: 400 }));
  }
  const result = bank.moveToSavings(body.amount);
  return cors(NextResponse.json({ ok: true, ...result }));
});
