"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { BushraContext } from "@/components/bushra/BushraProvider";
import type { Account, Beneficiary, Card, Transaction } from "@/lib/bank/fixtures";

type BankSnapshot = {
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  beneficiaries: Beneficiary[];
};

/**
 * Fetches the customer summary from the Python backend (via /api/bank/summary)
 * and maps the Python schema to the Account/Card/Transaction/Beneficiary types
 * the dashboard components consume. Re-fetches whenever the agent emits a
 * successful `tool_result` so a transfer, bill payment, or card freeze appears
 * on the dashboard as soon as the agent commits it.
 */
export function useLiveBank(): BankSnapshot & { refresh: () => void } {
  const ctx = useContext(BushraContext);
  const [data, setData] = useState<BankSnapshot>({
    accounts: [],
    transactions: [],
    cards: [],
    beneficiaries: [],
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/bank/summary", { cache: "no-store" });
      if (!res.ok) return;
      const raw = (await res.json()) as PythonSummary;
      setData({
        accounts: raw.accounts.map(toAccount),
        cards: raw.cards.map(toCard),
        beneficiaries: raw.beneficiaries.map(toBeneficiary),
        transactions: raw.transactions.map(toTransaction),
      });
    } catch {
      /* keep last-known snapshot on transient failure */
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

// ── Python schema (mirrors /customer/{id}/summary) ─────────────────────

type PythonSummary = {
  customer_id: string;
  accounts: PyAccount[];
  cards: PyCard[];
  beneficiaries: PyBeneficiary[];
  bills: PyBill[];
  transactions: PyTransaction[];
};

type PyAccount = {
  account_id: string;
  account_name_ar: string;
  account_type: "current" | "savings" | string;
  masked_iban: string;
  balance: number;
  currency: "SAR" | "USD" | string;
};

type PyCard = {
  card_id: string;
  card_type: "mada" | "credit" | "travel" | string;
  network: string;
  masked_number: string;
  label_ar: string;
  status: "active" | "frozen" | string;
  expiry: string;
  currency: "SAR" | "USD" | string;
};

type PyBeneficiary = {
  beneficiary_id: string;
  name_ar: string;
  bank_name_ar: string;
  account_mask: string;
};

type PyBill = {
  bill_id: string;
  biller_name_ar: string;
  account_label_ar: string;
  amount: number;
  due_date: string;
  status: string;
};

type PyTransaction = {
  account_id?: string;
  transaction_date: string;
  description_ar: string;
  amount: number;
  currency: string;
  transaction_type: "credit" | "debit" | string;
  category: string;
};

// ── Mappers ────────────────────────────────────────────────────────────

function toAccount(a: PyAccount): Account {
  return {
    id: a.account_id,
    name: a.account_name_ar,
    iban: a.masked_iban,
    balance: a.balance,
    currency: (a.currency === "USD" ? "USD" : "SAR") as Account["currency"],
    primary: a.account_type === "current",
  };
}

function toCard(c: PyCard): Card {
  // masked_number looks like "7830 **** **** ****" — first 4 are visible.
  const last4 = (c.masked_number.match(/\d+/)?.[0] ?? "0000").slice(0, 4);
  const brand: Card["brand"] =
    c.card_type === "credit" ? "visa" : c.card_type === "travel" ? "travel" : "mada";
  return {
    id: c.card_id,
    brand,
    last4,
    network: c.network,
    expiry: c.expiry,
    balance: 0, // Python doesn't track per-card balance; dashboard shows label instead
    currency: (c.currency === "USD" ? "USD" : "SAR") as Card["currency"],
    category: brand === "visa" ? "credit" : brand === "travel" ? "travel" : "debit",
    frozen: c.status === "frozen",
  };
}

function toBeneficiary(b: PyBeneficiary): Beneficiary {
  return {
    id: b.beneficiary_id,
    name: b.name_ar,
    bank: b.bank_name_ar,
    initial: b.name_ar.trim().charAt(0),
  };
}

const CATEGORY_ICON: Record<string, { icon: string; bg: string }> = {
  income: { icon: "💰", bg: "#e6f9ec" },
  transfer: { icon: "↗", bg: "#e8f0fe" },
  housing: { icon: "🏠", bg: "#fff5e6" },
  groceries: { icon: "🛒", bg: "#f0eaff" },
  fuel: { icon: "⛽", bg: "#fce8e8" },
  food: { icon: "🍽", bg: "#fce8e8" },
  utilities: { icon: "⚡", bg: "#fff5e6" },
  telecom: { icon: "📱", bg: "#e8f0fe" },
};

function toTransaction(t: PyTransaction): Transaction {
  const meta = CATEGORY_ICON[t.category] ?? { icon: "💳", bg: "#f4efe8" };
  return {
    id: `${t.account_id ?? "tx"}-${t.transaction_date}-${t.description_ar}`.slice(0, 64),
    merchant: t.description_ar,
    amount: t.transaction_type === "credit" ? Math.abs(t.amount) : -Math.abs(t.amount),
    currency: "SAR",
    category: t.category,
    date: formatArabicDate(t.transaction_date),
    icon: meta.icon,
    iconBg: meta.bg,
  };
}

function formatArabicDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ar-SA-u-nu-latn", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
