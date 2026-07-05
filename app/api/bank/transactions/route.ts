import { NextResponse } from "next/server";
import { cors } from "@/lib/bank/auth";
import { bank } from "@/lib/bank/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? 10);
  return cors(NextResponse.json({ transactions: bank.transactions(Number.isFinite(limit) ? limit : 10) }));
}
