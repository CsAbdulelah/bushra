import { NextResponse } from "next/server";
import { withBankAuth, cors } from "@/lib/bank/auth";
import { bank } from "@/lib/bank/store";

type Body = { billerId: string; amount: number; billerLabel?: string };

export const POST = withBankAuth(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.billerId || !Number.isFinite(body.amount) || body.amount <= 0) {
    return cors(NextResponse.json({ error: "invalid payment" }, { status: 400 }));
  }
  const { id, ref } = bank.addPayment({
    billerId: body.billerId,
    amount: body.amount,
    billerLabel: body.billerLabel,
  });
  return cors(NextResponse.json({ id, ref, status: "completed", amount: body.amount }));
});
