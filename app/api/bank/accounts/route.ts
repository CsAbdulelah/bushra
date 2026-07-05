import { NextResponse } from "next/server";
import { withBankAuth, cors } from "@/lib/bank/auth";
import { bank } from "@/lib/bank/store";

export const GET = withBankAuth(async () => cors(NextResponse.json({ accounts: bank.accounts() })));

export const OPTIONS = withBankAuth(async () => cors(new NextResponse(null, { status: 204 })));
