/**
 * In-memory mutable store for the mock bank. Resets on server restart.
 * Wrapped in a singleton so Next dev doesn't re-instantiate across HMR.
 */
import { accounts, cards, transactions, savingsOpportunities, type Card, type Transaction } from "./fixtures";

type Store = {
  cards: Card[];
  transactions: Transaction[];
  transfers: Array<{ id: string; from: string; recipient: string; amount: number; ref: string; at: string }>;
  payments: Array<{ id: string; billerId: string; amount: number; ref: string; at: string }>;
};

const g = globalThis as { __bushraBankStore?: Store };
if (!g.__bushraBankStore) {
  g.__bushraBankStore = {
    cards: cards.map((c) => ({ ...c })),
    transactions: [...transactions],
    transfers: [],
    payments: [],
  };
}
const store = g.__bushraBankStore;

export const bank = {
  accounts: () => accounts,
  cards: () => store.cards,
  transactions: (limit?: number) => (limit ? store.transactions.slice(0, limit) : store.transactions),
  savingsOpportunities: () => savingsOpportunities,

  setCardFrozen(id: string, frozen: boolean): Card | null {
    const c = store.cards.find((x) => x.id === id);
    if (!c) return null;
    c.frozen = frozen;
    return c;
  },

  addTransfer(input: { fromAccountId: string; recipient: string; amount: number }): { id: string; ref: string } {
    const id = crypto.randomUUID();
    const ref = `INM-2026-${Math.floor(Math.random() * 900000 + 100000)}`;
    store.transfers.unshift({ id, from: input.fromAccountId, recipient: input.recipient, amount: input.amount, ref, at: new Date().toISOString() });
    return { id, ref };
  },

  addPayment(input: { billerId: string; amount: number }): { id: string; ref: string } {
    const id = crypto.randomUUID();
    const ref = `SADAD-2026-${Math.floor(Math.random() * 900000 + 100000)}`;
    store.payments.unshift({ id, billerId: input.billerId, amount: input.amount, ref, at: new Date().toISOString() });
    return { id, ref };
  },
};
