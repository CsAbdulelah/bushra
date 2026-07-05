import { NextResponse } from "next/server";
import { cors } from "@/lib/bank/auth";
import { bank } from "@/lib/bank/store";

export async function GET() {
  return cors(NextResponse.json({ accounts: bank.accounts() }));
}

export async function OPTIONS() {
  return cors(new NextResponse(null, { status: 204 }));
}
