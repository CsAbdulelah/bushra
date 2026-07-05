import { NextResponse } from "next/server";
import { withBankAuth, cors } from "@/lib/bank/auth";
import { bank } from "@/lib/bank/store";

type Body = { fromAccountId: string; recipient: string; amount: number; currency?: "SAR" };

export const POST = withBankAuth(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.recipient || !Number.isFinite(body.amount) || body.amount <= 0) {
    return cors(NextResponse.json({ error: "invalid transfer" }, { status: 400 }));
  }
  const { id, ref } = bank.addTransfer({
    fromAccountId: body.fromAccountId ?? "acc-main",
    recipient: body.recipient,
    amount: body.amount,
  });
  return cors(NextResponse.json({ id, ref, status: "completed", amount: body.amount, currency: body.currency ?? "SAR" }));
});
