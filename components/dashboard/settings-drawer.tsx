"use client";

import { useState } from "react";
import { walletBalance } from "@/lib/calc";
import { exportBackupJson, exportMonthCsv } from "@/lib/export";
import { formatMonth, formatNumber, formatRupiah, parseAmount } from "@/lib/format";
import { actions } from "@/lib/store";
import {
  WALLET_TYPE_LABEL,
  type AppData,
  type TxType,
  type Wallet,
  type WalletType,
} from "@/lib/types";
import { Icon } from "./icons";
import { Dialog, btnPrimary, btnQuiet, field, iconBtn, label } from "./ui";

export type SettingsTab = "wallets" | "categories" | "data";

const TABS: { id: SettingsTab; name: string }[] = [
  { id: "wallets", name: "Dompet" },
  { id: "categories", name: "Kategori" },
  { id: "data", name: "Data" },
];

function WalletsTab({ data }: { data: AppData }) {
  const [editing, setEditing] = useState<Wallet | "new" | null>(
    data.wallets.length === 0 ? "new" : null,
  );
  const [error, setError] = useState("");

  return (
    <div className="space-y-4">
      {data.wallets.length > 0 && (
        <ul className="divide-y divide-line rounded-md border border-line">
          {data.wallets.map((w) => (
            <li key={w.id} className="flex items-center gap-2 py-2 pr-1 pl-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{w.name}</p>
                <p className="num text-xs text-muted">
                  {WALLET_TYPE_LABEL[w.type]} · {formatRupiah(walletBalance(w, data.transactions))}
                </p>
              </div>
              <button
                type="button"
                className={iconBtn}
                aria-label={`Ubah dompet ${w.name}`}
                onClick={() => {
                  setError("");
                  setEditing(w);
                }}
              >
                <Icon name="edit" size={16} />
              </button>
              <button
                type="button"
                className={`${iconBtn} hover:text-expense`}
                aria-label={`Hapus dompet ${w.name}`}
                onClick={() => {
                  if (!actions.deleteWallet(w.id)) {
                    setError(
                      `Dompet ${w.name} masih punya transaksi, jadi belum bisa dihapus. Pindahkan atau hapus transaksinya dulu.`,
                    );
                  } else setError("");
                }}
              >
                <Icon name="trash" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p role="alert" className="flex gap-2 text-sm font-medium text-expense">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      {editing ? (
        <WalletForm
          key={editing === "new" ? "new" : editing.id}
          wallet={editing === "new" ? null : editing}
          onDone={() => setEditing(null)}
          canCancel={data.wallets.length > 0}
        />
      ) : (
        <button type="button" className={btnQuiet} onClick={() => setEditing("new")}>
          <Icon name="plus" size={16} />
          Tambah dompet
        </button>
      )}
    </div>
  );
}

function WalletForm({
  wallet,
  onDone,
  canCancel,
}: {
  wallet: Wallet | null;
  onDone: () => void;
  canCancel: boolean;
}) {
  const [name, setName] = useState(wallet?.name ?? "");
  const [type, setType] = useState<WalletType>(wallet?.type ?? "TUNAI");
  const [balance, setBalance] = useState(
    wallet?.initialBalance ? formatNumber(wallet.initialBalance) : "",
  );
  const [error, setError] = useState("");

  return (
    <form
      noValidate
      className="space-y-3 rounded-md border border-line bg-sunk p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return setError("Isi nama dompet.");
        const payload = { name: name.trim(), type, initialBalance: parseAmount(balance) };
        if (wallet) actions.updateWallet(wallet.id, payload);
        else actions.addWallet(payload);
        onDone();
      }}
    >
      <p className="text-sm font-bold">{wallet ? "Ubah dompet" : "Dompet baru"}</p>
      <div>
        <label htmlFor="w-name" className={label}>Nama</label>
        <input
          id="w-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mis. Dompet harian"
          autoFocus
          aria-invalid={!!error}
          aria-describedby={error ? "w-err" : undefined}
          className={field}
        />
        {error && (
          <p id="w-err" className="mt-1 text-sm font-medium text-expense">
            {error}
          </p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="w-type" className={label}>Jenis</label>
          <select
            id="w-type"
            value={type}
            onChange={(e) => setType(e.target.value as WalletType)}
            className={field}
          >
            {Object.entries(WALLET_TYPE_LABEL).map(([v, n]) => (
              <option key={v} value={v}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="w-balance" className={label}>Saldo awal</label>
          <input
            id="w-balance"
            inputMode="numeric"
            value={balance}
            placeholder="0"
            onChange={(e) => {
              const n = parseAmount(e.target.value);
              setBalance(n ? formatNumber(n) : "");
            }}
            className={`${field} num`}
          />
        </div>
      </div>
      <div className="flex gap-2">
        {canCancel && (
          <button type="button" className={`${btnQuiet} flex-1`} onClick={onDone}>
            Batal
          </button>
        )}
        <button type="submit" className={`${btnPrimary} flex-1`}>
          Simpan
        </button>
      </div>
    </form>
  );
}

function CategoriesTab({ data }: { data: AppData }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TxType>("EXPENSE");
  const [error, setError] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const groups: { type: TxType; title: string }[] = [
    { type: "EXPENSE", title: "Pengeluaran" },
    { type: "INCOME", title: "Pemasukan" },
  ];

  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <section key={g.type}>
          <h3 className="mb-2 text-sm font-bold">{g.title}</h3>
          <ul className="divide-y divide-line rounded-md border border-line">
            {data.categories
              .filter((c) => c.type === g.type)
              .map((c) => (
                <li key={c.id} className="flex items-center gap-2 py-1.5 pr-1 pl-3">
                  <span
                    className="size-3 shrink-0 rounded-sm"
                    style={{ background: c.color }}
                    aria-hidden="true"
                  />
                  {renaming === c.id ? (
                    <form
                      className="flex min-w-0 flex-1 gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (draft.trim()) actions.updateCategory(c.id, { name: draft.trim() });
                        setRenaming(null);
                      }}
                    >
                      <label htmlFor={`rename-${c.id}`} className="sr-only">
                        Nama kategori
                      </label>
                      <input
                        id={`rename-${c.id}`}
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === "Escape" && setRenaming(null)}
                        className={`${field} h-9`}
                      />
                      <button type="submit" className={iconBtn} aria-label="Simpan nama">
                        <Icon name="check" size={16} />
                      </button>
                    </form>
                  ) : (
                    <>
                      <p
                        className={`min-w-0 flex-1 truncate text-sm ${
                          c.isArchived ? "text-muted line-through" : "font-semibold"
                        }`}
                      >
                        {c.name}
                        {c.isArchived && <span className="no-underline"> (diarsipkan)</span>}
                      </p>
                      <button
                        type="button"
                        className={iconBtn}
                        aria-label={`Ubah nama ${c.name}`}
                        onClick={() => {
                          setDraft(c.name);
                          setRenaming(c.id);
                        }}
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        type="button"
                        className={`${iconBtn} w-auto gap-1.5 px-2 text-xs font-semibold`}
                        onClick={() => actions.updateCategory(c.id, { isArchived: !c.isArchived })}
                      >
                        <Icon name="archive" size={16} />
                        {c.isArchived ? "Pulihkan" : "Arsipkan"}
                      </button>
                    </>
                  )}
                </li>
              ))}
          </ul>
        </section>
      ))}

      <form
        noValidate
        className="space-y-3 rounded-md border border-line bg-sunk p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const n = name.trim();
          if (!n) return setError("Isi nama kategori.");
          if (data.categories.some((c) => c.type === type && c.name.toLowerCase() === n.toLowerCase()))
            return setError("Kategori dengan nama itu sudah ada.");
          actions.addCategory(n, type);
          setName("");
          setError("");
        }}
      >
        <p className="text-sm font-bold">Kategori baru</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="c-name" className="sr-only">Nama kategori</label>
            <input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama kategori"
              aria-invalid={!!error}
              aria-describedby={error ? "c-err" : undefined}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="c-type" className="sr-only">Tipe kategori</label>
            <select
              id="c-type"
              value={type}
              onChange={(e) => setType(e.target.value as TxType)}
              className={field}
            >
              <option value="EXPENSE">Pengeluaran</option>
              <option value="INCOME">Pemasukan</option>
            </select>
          </div>
        </div>
        {error && (
          <p id="c-err" className="text-sm font-medium text-expense">
            {error}
          </p>
        )}
        <button type="submit" className={btnPrimary}>
          <Icon name="plus" size={16} />
          Tambah kategori
        </button>
      </form>
    </div>
  );
}

function DataTab({ data, month }: { data: AppData; month: string }) {
  const [msg, setMsg] = useState("");
  return (
    <div className="space-y-5">
      <section className="rounded-md border border-line p-4">
        <h3 className="text-sm font-bold">Ekspor CSV</h3>
        <p className="mt-1 text-sm text-muted">
          Semua transaksi {formatMonth(month)} dalam satu berkas CSV, siap dibuka di spreadsheet.
        </p>
        <button
          type="button"
          className={`${btnQuiet} mt-3`}
          onClick={() => {
            const { count, label } = exportMonthCsv(data, month);
            setMsg(`${count} transaksi ${label} diunduh.`);
          }}
        >
          <Icon name="download" size={16} />
          Unduh CSV {formatMonth(month)}
        </button>
      </section>
      <section className="rounded-md border border-line p-4">
        <h3 className="text-sm font-bold">Cadangan JSON</h3>
        <p className="mt-1 text-sm text-muted">
          Seluruh data: dompet, kategori, transaksi, dan anggaran. Simpan berkala di tempat aman.
        </p>
        <button
          type="button"
          className={`${btnQuiet} mt-3`}
          onClick={() => {
            exportBackupJson(data);
            setMsg("Cadangan seluruh data diunduh.");
          }}
        >
          <Icon name="download" size={16} />
          Unduh cadangan
        </button>
      </section>
      <p role="status" className="min-h-5 text-sm font-medium text-income">
        {msg}
      </p>
    </div>
  );
}

export function SettingsDrawer({
  open,
  tab,
  onTabChange,
  onClose,
  data,
}: {
  open: boolean;
  tab: SettingsTab;
  onTabChange: (t: SettingsTab) => void;
  onClose: () => void;
  data: AppData;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Pengaturan" variant="drawer">
      <div role="tablist" aria-label="Bagian pengaturan" className="mb-5 grid grid-cols-3 gap-1 rounded-md bg-sunk p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="settings-panel"
            onClick={() => onTabChange(t.id)}
            className={`h-9 rounded-md text-sm font-semibold ${
              tab === t.id ? "bg-surface text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="settings-panel" aria-labelledby={`tab-${tab}`}>
        {tab === "wallets" && <WalletsTab data={data} />}
        {tab === "categories" && <CategoriesTab data={data} />}
        {tab === "data" && <DataTab data={data} month={data.month} />}
      </div>
    </Dialog>
  );
}
