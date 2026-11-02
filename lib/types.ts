export type TxType = "INCOME" | "EXPENSE";
export type WalletType = "TUNAI" | "BANK" | "EWALLET";

export type Wallet = {
  id: string;
  name: string;
  type: WalletType;
  /** Rupiah, bilangan bulat */
  initialBalance: number;
};

export type Category = {
  id: string;
  name: string;
  type: TxType;
  color: string;
  isArchived: boolean;
};

export type Transaction = {
  id: string;
  walletId: string;
  categoryId: string;
  type: TxType;
  /** Rupiah, bilangan bulat, selalu positif */
  amount: number;
  /** YYYY-MM-DD (Asia/Jakarta) */
  date: string;
  note: string;
  createdAt: number;
};

export type Budget = {
  categoryId: string;
  /** YYYY-MM */
  month: string;
  amount: number;
};

export type AppData = {
  version: 1;
  /** Bulan terakhir dibuka, YYYY-MM */
  month: string;
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
};

export const WALLET_TYPE_LABEL: Record<WalletType, string> = {
  TUNAI: "Tunai",
  BANK: "Rekening bank",
  EWALLET: "E-wallet",
};
