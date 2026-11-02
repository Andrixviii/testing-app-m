"use client";

import { useState } from "react";
import { formatNumber, parseAmount } from "@/lib/format";
import { actions } from "@/lib/store";
import type { AppData, Transaction, TxType } from "@/lib/types";
import { btnPrimary, btnQuiet, field, label } from "./ui";

type Errors = Partial<Record<"amount" | "category" | "wallet" | "date", string>>;

export function TransactionForm({
  data,
  editing,
  defaultDate,
  onDone,
  onOpenWallets,
}: {
  data: AppData;
  editing: Transaction | null;
  defaultDate: string;
  onDone: () => void;
  onOpenWallets: () => void;
}) {
  const [type, setType] = useState<TxType>(editing?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(editing ? formatNumber(editing.amount) : "");
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [walletId, setWalletId] = useState(
    editing?.walletId ?? (data.wallets.length === 1 ? data.wallets[0].id : ""),
  );
  const [date, setDate] = useState(editing?.date ?? defaultDate);
  const [note, setNote] = useState(editing?.note ?? "");
  const [errors, setErrors] = useState<Errors>({});

  const categories = data.categories.filter(
    (c) => c.type === type && (!c.isArchived || c.id === editing?.categoryId),
  );

  if (data.wallets.length === 0) {
    return (
      <div>
        <p className="text-sm text-muted">
          Transaksi harus masuk ke sebuah dompet. Tambahkan dompet pertama dengan saldo awalnya, lalu
          kembali ke sini.
        </p>
        <button type="button" onClick={onOpenWallets} className={`${btnPrimary} mt-5 w-full`}>
          Tambah dompet
        </button>
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    const value = parseAmount(amount);
    if (value <= 0) next.amount = "Isi jumlah lebih dari Rp 0.";
    if (!categories.some((c) => c.id === categoryId)) next.category = "Pilih kategori.";
    if (!walletId) next.wallet = "Pilih dompet.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) next.date = "Isi tanggal yang valid.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      type,
      amount: value,
      categoryId,
      walletId,
      date,
      note: note.trim(),
    };
    if (editing) actions.updateTransaction(editing.id, payload);
    else actions.addTransaction(payload);
    onDone();
  }

  const err = (id: string, msg?: string) =>
    msg && (
      <p id={id} className="mt-1 text-sm font-medium text-expense">
        {msg}
      </p>
    );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <fieldset>
        <legend className={label}>Tipe</legend>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-sunk p-1">
          {(["EXPENSE", "INCOME"] as const).map((t) => (
            <label
              key={t}
              className={`flex h-9 cursor-pointer items-center justify-center rounded-md text-sm font-semibold has-focus-visible:outline-2 has-focus-visible:outline-accent ${
                type === t
                  ? t === "EXPENSE"
                    ? "bg-surface text-expense"
                    : "bg-surface text-income"
                  : "text-muted"
              }`}
            >
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={() => {
                  setType(t);
                  setCategoryId("");
                }}
                className="sr-only"
              />
              {t === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="tx-amount" className={label}>
          Jumlah
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted">
            Rp
          </span>
          <input
            id="tx-amount"
            autoFocus
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              const n = parseAmount(e.target.value);
              setAmount(n ? formatNumber(n) : "");
            }}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "err-amount" : undefined}
            className={`${field} num h-12 pl-10 text-lg font-bold`}
          />
        </div>
        {err("err-amount", errors.amount)}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tx-category" className={label}>
            Kategori
          </label>
          <select
            id="tx-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? "err-category" : undefined}
            className={field}
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {err("err-category", errors.category)}
        </div>
        <div>
          <label htmlFor="tx-wallet" className={label}>
            Dompet
          </label>
          <select
            id="tx-wallet"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            aria-invalid={!!errors.wallet}
            aria-describedby={errors.wallet ? "err-wallet" : undefined}
            className={field}
          >
            <option value="">Pilih dompet</option>
            {data.wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          {err("err-wallet", errors.wallet)}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tx-date" className={label}>
            Tanggal
          </label>
          <input
            id="tx-date"
            type="date"
            value={date}

            onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "err-date" : undefined}
            className={field}
          />
          {err("err-date", errors.date)}
        </div>
        <div>
          <label htmlFor="tx-note" className={label}>
            Catatan <span className="font-normal text-muted">(opsional)</span>
          </label>
          <input
            id="tx-note"
            value={note}
            maxLength={120}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mis. makan siang"
            className={field}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onDone} className={`${btnQuiet} flex-1`}>
          Batal
        </button>
        <button type="submit" className={`${btnPrimary} flex-1`}>
          {editing ? "Simpan perubahan" : "Simpan"}
        </button>
      </div>
    </form>
  );
}
