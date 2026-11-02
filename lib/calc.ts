import { formatMonthShort, shiftMonth } from "./format";
import type { AppData, Transaction, Wallet } from "./types";

export function txInMonth(txs: Transaction[], month: string): Transaction[] {
  return txs.filter((t) => t.date.startsWith(month));
}

export function sumBy(txs: Transaction[], type: Transaction["type"]): number {
  return txs.reduce((s, t) => (t.type === type ? s + t.amount : s), 0);
}

/** Saldo dompet = saldo awal + pemasukan - pengeluaran */
export function walletBalance(wallet: Wallet, txs: Transaction[]): number {
  return txs.reduce((s, t) => {
    if (t.walletId !== wallet.id) return s;
    return t.type === "INCOME" ? s + t.amount : s - t.amount;
  }, wallet.initialBalance);
}

export function monthlySummary(data: AppData, month: string) {
  const monthTxs = txInMonth(data.transactions, month);
  const income = sumBy(monthTxs, "INCOME");
  const expense = sumBy(monthTxs, "EXPENSE");
  const totalBalance = data.wallets.reduce(
    (s, w) => s + walletBalance(w, data.transactions),
    0,
  );
  return { income, expense, remaining: income - expense, totalBalance, monthTxs };
}

export function expenseByCategory(data: AppData, month: string) {
  const totals = new Map<string, number>();
  for (const t of txInMonth(data.transactions, month)) {
    if (t.type !== "EXPENSE") continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
  }
  return [...totals.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      category: data.categories.find((c) => c.id === categoryId),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export type BudgetLevel = "none" | "ok" | "warn" | "over";

export function budgetStatus(spent: number, amount: number | undefined) {
  if (!amount) return { level: "none" as BudgetLevel, pct: 0, left: 0 };
  const pct = (spent / amount) * 100;
  const level: BudgetLevel = pct >= 100 ? "over" : pct >= 80 ? "warn" : "ok";
  return { level, pct, left: amount - spent };
}

export function trendSeries(data: AppData, month: string, count = 6) {
  return Array.from({ length: count }, (_, i) => {
    const m = shiftMonth(month, i - (count - 1));
    const txs = txInMonth(data.transactions, m);
    return {
      month: m,
      label: formatMonthShort(m),
      income: sumBy(txs, "INCOME"),
      expense: sumBy(txs, "EXPENSE"),
    };
  });
}
