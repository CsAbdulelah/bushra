"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { BushraContext } from "@/components/bushra/BushraProvider";
import type { Account, Transaction, Card } from "@/lib/bank/fixtures";

type BankSnapshot = { accounts: Account[]; transactions: Transaction[]; cards: Card[] };

/**
 * Fetches accounts/transactions/cards from `/api/bank/*` and re-fetches
 * every time the agent emits a `tool_result` event (i.e. a banking action
 * just completed on the server). This is what makes the dashboard reflect
 * a transfer or bill payment immediately.
 *
 * Safe to use outside <BushraProvider>: if the session isn't mounted, we
 * still fetch once on mount but skip the reactive re-fetch.
 */
export function useLiveBank(): BankSnapshot & { refresh: () => void } {
  const ctx = useContext(BushraContext);
  const [data, setData] = useState<BankSnapshot>({ accounts: [], transactions: [], cards: [] });

  const refresh = useCallback(async () => {
    try {
      const [aRes, tRes, cRes] = await Promise.all([
        fetch("/api/bank/accounts", { cache: "no-store" }),
        fetch("/api/bank/transactions?limit=5", { cache: "no-store" }),
        fetch("/api/bank/cards", { cache: "no-store" }),
      ]);
      const [{ accounts }, { transactions }, { cards }] = await Promise.all([
        aRes.json(),
        tRes.json(),
        cRes.json(),
      ]);
      setData({ accounts, transactions, cards });
    } catch {
      /* leave last-known state */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!ctx) return;
    return ctx.session.on((evt) => {
      if (evt.type === "tool_result" && evt.ok) refresh();
    });
  }, [ctx, refresh]);

  return { ...data, refresh };
}
