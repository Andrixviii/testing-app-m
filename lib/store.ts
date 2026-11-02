"use client";

import { useSyncExternalStore } from "react";
import { currentMonth } from "./format";
import type {
  AppData,
  Category,
  Transaction,
  TxType,
  Wallet,
} from "./types";

/*
 * Penyimpanan sementara di localStorage supaya UI bisa dipakai penuh sebelum
 * database dan Server Actions dibuat. Bentuk datanya mengikuti model di PRD,
 * jadi tiap fungsi di bawah nantinya diganti dengan Server Action.
 */

const KEY = "kasbulan:v1";

export const CATEGORY_COLORS = [
  "#c2563f",
  "#d28f2c",
  "#5d8a4a",
  "#3f8a8c",
  "#6b7fb0",
  "#a65f8e",
  "#8a7358",
  "#b8a23a",
  "#4a7a64",
  "#c97b84",
];

function cat(
  id: string,
  name: string,
  type: TxType,
  color: string,
): Category {
  return { id, name, type, color, isArchived: false };
}

const DEFAULT_CATEGORIES: Category[] = [
  cat("c-makan", "Makan & minum", "EXPENSE", CATEGORY_COLORS[0]),
  cat("c-transport", "Transport", "EXPENSE", CATEGORY_COLORS[1]),
  cat("c-tagihan", "Tagihan", "EXPENSE", CATEGORY_COLORS[3]),
  cat("c-belanja", "Belanja", "EXPENSE", CATEGORY_COLORS[5]),
  cat("c-kesehatan", "Kesehatan", "EXPENSE", CATEGORY_COLORS[2]),
  cat("c-hiburan", "Hiburan", "EXPENSE", CATEGORY_COLORS[4]),
  cat("c-pendidikan", "Pendidikan", "EXPENSE", CATEGORY_COLORS[7]),
  cat("c-lain-keluar", "Lainnya", "EXPENSE", CATEGORY_COLORS[6]),
  cat("c-gaji", "Gaji", "INCOME", CATEGORY_COLORS[8]),
  cat("c-bonus", "Bonus", "INCOME", CATEGORY_COLORS[7]),
  cat("c-lain-masuk", "Lainnya", "INCOME", CATEGORY_COLORS[6]),
];

function freshData(month: string = currentMonth()): AppData {
  return {
    version: 1,
    month,
    wallets: [],
    categories: DEFAULT_CATEGORIES,
    transactions: [],
    budgets: [],
  };
}

// Bulan sengaja kosong: jam tidak boleh dibaca saat prerender. Nilai asli diisi di klien.
const SERVER_SNAPSHOT: AppData = freshData("");

let state: AppData | null = null;
const listeners = new Set<() => void>();

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (parsed?.version === 1) return parsed;
    }
  } catch {
    /* data rusak: mulai dari awal */
  }
  return freshData();
}

function getSnapshot(): AppData {
  if (!state) state = load();
  return state;
}

function getServerSnapshot(): AppData {
  return SERVER_SNAPSHOT;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function commit(next: AppData) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* penyimpanan penuh atau diblokir */
  }
  listeners.forEach((l) => l());
}

function update(fn: (d: AppData) => AppData) {
  commit(fn(getSnapshot()));
}

const noopSubscribe = () => () => {};

/** false saat render server dan hidrasi, true setelah data lokal terbaca */
export function useReady(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const uid = () => crypto.randomUUID();

export const actions = {
  setMonth(month: string) {
    update((d) => ({ ...d, month }));
  },

  addTransaction(t: Omit<Transaction, "id" | "createdAt">) {
    update((d) => ({
      ...d,
      transactions: [...d.transactions, { ...t, id: uid(), createdAt: Date.now() }],
    }));
  },
  updateTransaction(id: string, t: Omit<Transaction, "id" | "createdAt">) {
    update((d) => ({
      ...d,
      transactions: d.transactions.map((x) => (x.id === id ? { ...x, ...t } : x)),
    }));
  },
  deleteTransaction(id: string) {
    update((d) => ({
      ...d,
      transactions: d.transactions.filter((x) => x.id !== id),
    }));
  },

  setBudget(categoryId: string, month: string, amount: number) {
    update((d) => {
      const rest = d.budgets.filter(
        (b) => !(b.categoryId === categoryId && b.month === month),
      );
      return {
        ...d,
        budgets: amount > 0 ? [...rest, { categoryId, month, amount }] : rest,
      };
    });
  },

  addWallet(w: Omit<Wallet, "id">) {
    update((d) => ({ ...d, wallets: [...d.wallets, { ...w, id: uid() }] }));
  },
  updateWallet(id: string, w: Omit<Wallet, "id">) {
    update((d) => ({
      ...d,
      wallets: d.wallets.map((x) => (x.id === id ? { ...x, ...w } : x)),
    }));
  },
  /** Mengembalikan false bila dompet masih punya transaksi */
  deleteWallet(id: string): boolean {
    const d = getSnapshot();
    if (d.transactions.some((t) => t.walletId === id)) return false;
    commit({ ...d, wallets: d.wallets.filter((w) => w.id !== id) });
    return true;
  },

  addCategory(name: string, type: TxType) {
    update((d) => {
      const used = d.categories.length % CATEGORY_COLORS.length;
      return {
        ...d,
        categories: [
          ...d.categories,
          { id: uid(), name, type, color: CATEGORY_COLORS[used], isArchived: false },
        ],
      };
    });
  },
  updateCategory(id: string, patch: Partial<Pick<Category, "name" | "isArchived">>) {
    update((d) => ({
      ...d,
      categories: d.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },
};
