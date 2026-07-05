import { NextResponse } from "next/server";
import { withBankAuth, cors } from "@/lib/bank/auth";
import { bank } from "@/lib/bank/store";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withBankAuth(async (req: Request, ctx: unknown) => {
  const { params } = ctx as Ctx;
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { frozen?: boolean };
  const frozen = body.frozen ?? true;
  const card = bank.setCardFrozen(id, frozen);
  if (!card) return cors(NextResponse.json({ error: "card not found" }, { status: 404 }));
  return cors(NextResponse.json({ card }));
});
