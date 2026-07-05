export type Account = {
  id: string;
  name: string;
  iban: string;
  balance: number;
  currency: "SAR" | "USD";
  primary?: boolean;
};

export type Card = {
  id: string;
  brand: "visa" | "mada" | "travel";
  last4: string;
  network: string;
  expiry: string;
  balance: number;
  currency: "SAR" | "USD";
  category: "credit" | "debit" | "travel";
  frozen: boolean;
};

export type Beneficiary = { id: string; name: string; bank: string; initial: string };

export type Transaction = {
  id: string;
  merchant: string;
  amount: number; // negative = outflow
  currency: "SAR";
  category: string;
  date: string; // display string, Arabic
  icon: string;
  iconBg: string;
};

export type SavingsOpportunity = {
  id: string;
  title: string;
  expectedSavings: number;
  category: string;
};

export const accounts: Account[] = [
  { id: "acc-main", name: "الحساب الجاري الرئيسي", iban: "68202824795000", balance: 12450.75, currency: "SAR", primary: true },
  { id: "acc-exp", name: "المصاريف الدورية", iban: "68202824795003", balance: 570.04, currency: "SAR" },
  { id: "acc-savings", name: "حساب التوفير", iban: "68202824795010", balance: 3200.0, currency: "SAR" },
];

export const cards: Card[] = [
  { id: "card-visa", brand: "visa", last4: "4521", network: "VISA", expiry: "08/28", balance: 8500, currency: "SAR", category: "credit", frozen: false },
  { id: "card-mada", brand: "mada", last4: "7830", network: "mada", expiry: "12/27", balance: 12450, currency: "SAR", category: "debit", frozen: false },
  { id: "card-travel", brand: "travel", last4: "0918", network: "Travel", expiry: "05/29", balance: 240, currency: "USD", category: "travel", frozen: false },
];

export const beneficiaries: Beneficiary[] = [
  { id: "ben-invest", name: "حساب الاستثمار", bank: "الإنماء", initial: "★" },
  { id: "ben-mohd", name: "محمد سامي", bank: "بنك دولي", initial: "م" },
  { id: "ben-gh", name: "غلياء", bank: "بنك محلي", initial: "anb" },
  { id: "ben-flex", name: "Flex ktchn", bank: "الإنماء", initial: "ا" },
];

export const transactions: Transaction[] = [
  { id: "tx1", merchant: "شركة الكهرباء السعودية", amount: -186, currency: "SAR", category: "سداد فاتورة", date: "25 يونيو 2026", icon: "⚡", iconBg: "#fff5e6" },
  { id: "tx2", merchant: "محمد سامي", amount: -300, currency: "SAR", category: "تحويل خارجي", date: "23 يونيو 2026", icon: "↗", iconBg: "#e8f0fe" },
  { id: "tx3", merchant: "مطعم شاورما الرياض", amount: -540, currency: "SAR", category: "مدفوعات", date: "21 يونيو 2026", icon: "🍽", iconBg: "#fce8e8" },
  { id: "tx4", merchant: "إيداع راتب", amount: 5000, currency: "SAR", category: "تحويل وارد", date: "20 يونيو 2026", icon: "💰", iconBg: "#e6f9ec" },
  { id: "tx5", merchant: "هايبر بنده", amount: -1200, currency: "SAR", category: "مشتريات", date: "18 يونيو 2026", icon: "🛒", iconBg: "#f0eaff" },
];

export const savingsOpportunities: SavingsOpportunity[] = [
  { id: "so-1", title: "برنامج الادخار الإنماء (2%)", expectedSavings: 24, category: "savings" },
  { id: "so-2", title: "تخفيض إنفاق التسوق 15%", expectedSavings: 180, category: "spending" },
];
