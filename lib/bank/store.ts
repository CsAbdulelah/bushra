/**
 * In-memory mutable store for the mock bank. Resets on server restart.
 * Wrapped in a globalThis singleton so Next dev doesn't re-instantiate
 * across HMR (state would otherwise vanish on file save).
 */
import {
  accounts as seedAccounts,
  cards as seedCards,
  transactions as seedTransactions,
  savingsOpportunities,
  type Account,
  type Card,
  type Transaction,
} from "./fixtures";

type Store = {
  accounts: Account[];
  cards: Card[];
  transactions: Transaction[];
  transfers: Array<{ id: string; from: string; recipient: string; amount: number; ref: string; at: string }>;
  payments: Array<{ id: string; billerId: string; amount: number; ref: string; at: string }>;
};

const g = globalThis as { __bushraBankStore?: Store };
if (!g.__bushraBankStore) {
  g.__bushraBankStore = {
    accounts: seedAccounts.map((a) => ({ ...a })),
    cards: seedCards.map((c) => ({ ...c })),
    transactions: [...seedTransactions],
    transfers: [],
    payments: [],
  };
}
const store = g.__bushraBankStore;

function today(): string {
  return new Date().toLocaleDateString("ar-SA-u-nu-latn", { day: "numeric", month: "long", year: "numeric" });
}

export const bank = {
  accounts: () => store.accounts,
  cards: () => store.cards,
  transactions: (limit?: number) => (limit ? store.transactions.slice(0, limit) : store.transactions),
  savingsOpportunities: () => savingsOpportunities,

  setCardFrozen(id: string, frozen: boolean): Card | null {
    const c = store.cards.find((x) => x.id === id);
    if (!c) return null;
    c.frozen = frozen;
    return c;
  },

  addTransfer(input: { fromAccountId: string; recipient: string; amount: number }): {
    id: string;
    ref: string;
    fromBalance: number;
  } {
    const id = crypto.randomUUID();
    const ref = `INM-2026-${Math.floor(Math.random() * 900000 + 100000)}`;
    const from = store.accounts.find((a) => a.id === input.fromAccountId) ?? store.accounts[0];
    from.balance = Math.max(0, from.balance - input.amount);

    store.transactions.unshift({
      id: `tx-${id.slice(0, 6)}`,
      merchant: input.recipient,
      amount: -input.amount,
      currency: "SAR",
      category: "تحويل خارجي",
      date: today(),
      icon: "↗",
      iconBg: "#e8f0fe",
    });
    store.transfers.unshift({
      id,
      from: from.id,
      recipient: input.recipient,
      amount: input.amount,
      ref,
      at: new Date().toISOString(),
    });
    return { id, ref, fromBalance: from.balance };
  },

  addPayment(input: { billerId: string; amount: number; billerLabel?: string }): {
    id: string;
    ref: string;
    fromBalance: number;
  } {
    const id = crypto.randomUUID();
    const ref = `SADAD-2026-${Math.floor(Math.random() * 900000 + 100000)}`;
    const from = store.accounts[0];
    from.balance = Math.max(0, from.balance - input.amount);

    store.transactions.unshift({
      id: `tx-${id.slice(0, 6)}`,
      merchant: input.billerLabel ?? "شركة الكهرباء السعودية",
      amount: -input.amount,
      currency: "SAR",
      category: "سداد فاتورة",
      date: today(),
      icon: "⚡",
      iconBg: "#fff5e6",
    });
    store.payments.unshift({ id, billerId: input.billerId, amount: input.amount, ref, at: new Date().toISOString() });
    return { id, ref, fromBalance: from.balance };
  },

  /** Used by the savings flow. Moves money from main → savings sub-account. */
  moveToSavings(amount: number): { fromBalance: number; savingsBalance: number } {
    const from = store.accounts[0];
    const savings = store.accounts.find((a) => a.id === "acc-savings");
    from.balance = Math.max(0, from.balance - amount);
    if (savings) savings.balance += amount;

    store.transactions.unshift({
      id: `tx-sv-${Date.now().toString(36)}`,
      merchant: "برنامج الادخار الإنماء",
      amount: -amount,
      currency: "SAR",
      category: "تحويل داخلي",
      date: today(),
      icon: "🐷",
      iconBg: "#e6f9ec",
    });
    return { fromBalance: from.balance, savingsBalance: savings?.balance ?? 0 };
  },
};
