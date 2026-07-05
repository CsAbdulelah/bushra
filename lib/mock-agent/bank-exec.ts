/**
 * In-process bank executor used by /api/dev/chat.
 *
 * When the mock agent runs inside the same Next.js process as the bank
 * routes, there's no reason to fetch() them — that only adds latency and
 * introduces an auth-header dependency (X-Bushra-Mock-Key) that isn't
 * needed for same-process calls. Just call the store.
 *
 * The standalone Bun mock still uses HTTP via mock-agent/server.ts,
 * because there it's actually a separate process.
 */

import { bank } from "@/lib/bank/store";
import type { BankCall, BankResult } from "@/lib/mock-agent/flows";

export const bankExec: BankCall = async (path, body) => {
  try {
    if (path === "/api/bank/transfers") {
      const b = body as { fromAccountId?: string; recipient: string; amount: number };
      if (!b.recipient || !Number.isFinite(b.amount) || b.amount <= 0) return bad("invalid transfer");
      return ok(bank.addTransfer({ fromAccountId: b.fromAccountId ?? "acc-main", recipient: b.recipient, amount: b.amount }));
    }

    if (path === "/api/bank/bills/pay") {
      const b = body as { billerId: string; amount: number; billerLabel?: string };
      if (!b.billerId || !Number.isFinite(b.amount) || b.amount <= 0) return bad("invalid payment");
      return ok(bank.addPayment({ billerId: b.billerId, amount: b.amount, billerLabel: b.billerLabel }));
    }

    if (path === "/api/bank/savings/move") {
      const b = body as { amount: number };
      if (!Number.isFinite(b.amount) || b.amount <= 0) return bad("invalid amount");
      return ok(bank.moveToSavings(b.amount));
    }

    if (path.startsWith("/api/bank/cards/") && path.endsWith("/freeze")) {
      const id = path.slice("/api/bank/cards/".length, -"/freeze".length);
      const b = body as { frozen?: boolean };
      const card = bank.setCardFrozen(id, b.frozen ?? true);
      if (!card) return bad("card not found");
      return ok({ card });
    }

    return bad(`unknown bank path: ${path}`);
  } catch (err) {
    return bad(err instanceof Error ? err.message : "bank exec failed");
  }
};

function ok<T>(data: T): BankResult {
  return { ok: true, data };
}
function bad(error: string): BankResult {
  return { ok: false, error };
}
