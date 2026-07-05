import { NextResponse } from "next/server";
import { withBankAuth, cors } from "@/lib/bank/auth";
import { bank } from "@/lib/bank/store";

export const GET = withBankAuth(async () => cors(NextResponse.json({ cards: bank.cards() })));
