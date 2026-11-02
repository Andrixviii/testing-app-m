"use client";

import { useState } from "react";
import { formatDayShort, formatMonth, formatRupiah } from "@/lib/format";
import type { AppData, Transaction } from "@/lib/types";
import { Icon } from "./icons";
import { Card, EmptyState, btnPrimary, btnQuiet, field, iconBtn } from "./ui";

export function TransactionTable({
  data,
  month,
  categoryId,
  onCategoryChange,
  onAdd,
  onEdit,
  onDelete,
  onOpenWallets,
}: {
  data: AppData;
  month: string;
  categoryId: string;
  onCategoryChange: (id: string) => void;
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  onOpenWallets: () => void;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [walletId, setWalletId] = useState("");

  const monthTxs = data.transactions.filter((t) => t.date.startsWith(month));
  const rows = monthTxs
    .filter(
      (t) =>
        (!type || t.type === type) &&
        (!categoryId || t.categoryId === categoryId) &&
        (!walletId || t.walletId === walletId) &&
        (!q || t.note.toLowerCase().includes(q.trim().toLowerCase())),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  const filtered = !!(q || type || categoryId || walletId);
  const catName = (id: string) => data.categories.find((c) => c.id === id);
  const walletName = (id: string) => data.wallets.find((w) => w.id === id)?.name ?? "-";

  function reset() {
    setQ("");
    setType("");
    setWalletId("");
    onCategoryChange("");
  }

  return (
    <Card
      title="Transaksi"
      question={`Apa saja yang tercatat di ${formatMonth(month)}?`}
      action={
        <p className="num shrink-0 text-xs text-muted" aria-live="polite">
          {filtered ? `${rows.length} dari ${monthTxs.length}` : monthTxs.length} transaksi
        </p>
      }
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <label htmlFor="f-q" className="sr-only">
            Cari catatan
          </label>
          <Icon
            name="search"
            size={16}
            className="pointer-events-none absolute top-3 left-3 text-muted"
          />
          <input
            id="f-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari catatan"
            className={`${field} pl-9`}
          />
        </div>
        <div>
          <label htmlFor="f-type" className="sr-only">
            Tipe
          </label>
          <select id="f-type" value={type} onChange={(e) => setType(e.target.value)} className={field}>
            <option value="">Semua tipe</option>
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-cat" className="sr-only">
            Kategori
          </label>
          <select
            id="f-cat"
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={field}
          >
            <option value="">Semua kategori</option>
            {data.categories
              .filter((c) => !type || c.type === type)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.type === "INCOME" ? " (masuk)" : ""}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-wallet" className="sr-only">
            Dompet
          </label>
          <select
            id="f-wallet"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className={field}
          >
            <option value="">Semua dompet</option>
            {data.wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        {filtered && (
          <button type="button" onClick={reset} className={`${btnQuiet} sm:col-span-2 lg:col-span-1`}>
            Reset
          </button>
        )}
      </div>

      {data.wallets.length === 0 ? (
        <EmptyState
          title="Tambahkan dompet dulu"
          hint="Setiap transaksi masuk ke sebuah dompet, misalnya tunai atau rekening bank."
          action={
            <button type="button" onClick={onOpenWallets} className={btnPrimary}>
              Tambah dompet
            </button>
          }
        />
      ) : monthTxs.length === 0 ? (
        <EmptyState
          title={`Belum ada transaksi di ${formatMonth(month)}`}
          hint="Catat pengeluaran atau pemasukan pertama bulan ini. Cukup jumlah, kategori, dan dompet."
          action={
            <button type="button" onClick={onAdd} className={btnPrimary}>
              <Icon name="plus" />
              Catat transaksi
            </button>
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Tidak ada transaksi yang cocok"
          hint="Coba ubah kata kunci atau lepas salah satu filter."
          action={
            <button type="button" onClick={reset} className={btnQuiet}>
              Reset filter
            </button>
          }
        />
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-0 text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th scope="col" className="px-2 py-2 font-medium">Tanggal</th>
                <th scope="col" className="px-2 py-2 font-medium">Kategori dan catatan</th>
                <th scope="col" className="hidden px-2 py-2 font-medium md:table-cell">Dompet</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Jumlah</th>
                <th scope="col" className="w-[5.5rem] px-2 py-2 sm:w-24">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((t) => {
                const c = catName(t.categoryId);
                const income = t.type === "INCOME";
                return (
                  <tr key={t.id}>
                    <td className="num px-2 py-2.5 whitespace-nowrap text-muted">
                      {formatDayShort(t.date)}
                    </td>
                    <td className="max-w-0 px-2 py-2.5">
                      <p className="flex items-center gap-2 font-semibold">
                        <span
                          className="size-2.5 shrink-0 rounded-sm"
                          style={{ background: c?.color }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{c?.name ?? "Kategori dihapus"}</span>
                      </p>
                      {t.note && <p className="truncate pl-[1.125rem] text-muted">{t.note}</p>}
                      <p className="truncate pl-[1.125rem] text-xs text-muted md:hidden">
                        {walletName(t.walletId)}
                      </p>
                    </td>
                    <td className="hidden px-2 py-2.5 text-muted md:table-cell">
                      {walletName(t.walletId)}
                    </td>
                    <td
                      className={`num px-2 py-2.5 text-right font-bold whitespace-nowrap ${
                        income ? "text-income" : "text-expense"
                      }`}
                    >
                      <span className="sr-only">{income ? "Pemasukan " : "Pengeluaran "}</span>
                      <span aria-hidden="true">{income ? "+" : "-"}</span>
                      {formatRupiah(t.amount)}
                    </td>
                    <td className="px-2 py-1 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className={`${iconBtn} size-9`}
                        aria-label={`Ubah transaksi ${c?.name ?? ""} ${formatDayShort(t.date)}`}
                        onClick={() => onEdit(t)}
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        type="button"
                        className={`${iconBtn} size-9 hover:text-expense`}
                        aria-label={`Hapus transaksi ${c?.name ?? ""} ${formatDayShort(t.date)}`}
                        onClick={() => onDelete(t)}
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
