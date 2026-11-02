"use client";

import { useState } from "react";
import { expenseByCategory, monthlySummary, trendSeries } from "@/lib/calc";
import { formatDayLong, formatRupiah, todayJakarta } from "@/lib/format";
import { actions, useAppData, useReady } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { BudgetPanel } from "./budget-panel";
import { CategoryDonut } from "./category-donut";
import { Header } from "./header";
import { Icon } from "./icons";
import { SettingsDrawer, type SettingsTab } from "./settings-drawer";
import { Summary } from "./summary";
import { TransactionForm } from "./transaction-form";
import { TransactionTable } from "./transaction-table";
import { TrendChart } from "./trend-chart";
import { WalletPanel } from "./wallet-panel";
import { Dialog, btnDanger, btnQuiet } from "./ui";

export function Dashboard() {
  const data = useAppData();
  const ready = useReady();
  const month = data.month;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState<SettingsTab>("wallets");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formDate, setFormDate] = useState("");

  const summary = monthlySummary(data, month);
  const slices = expenseByCategory(data, month);
  const spentByCategory = new Map(slices.map((s) => [s.categoryId, s.amount]));
  const series = ready ? trendSeries(data, month) : [];

  // Tanggal hari ini dibaca saat klik, bukan saat render (menghindari prerender yang membeku).
  function openAdd() {
    const today = todayJakarta();
    setFormDate(today.startsWith(month) ? today : `${month}-01`);
    setEditing(null);
    setFormOpen(true);
  }
  function openSettings(t: SettingsTab) {
    setFormOpen(false);
    setTab(t);
    setSettingsOpen(true);
  }
  function changeMonth(m: string) {
    setCategoryFilter("");
    actions.setMonth(m);
  }

  const deletingCat = deleting
    ? data.categories.find((c) => c.id === deleting.categoryId)?.name
    : "";

  return (
    <>
      <Header
        month={month}
        ready={ready}
        onMonthChange={changeMonth}
        onAdd={openAdd}
        onOpenSettings={() => openSettings("wallets")}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 pt-5 pb-28 sm:space-y-5 sm:px-6 sm:pt-6">
        {!ready ? (
          <p className="py-24 text-center text-sm text-muted" role="status">
            Memuat data bulan ini
          </p>
        ) : (
          <>
            <Summary
              month={month}
              income={summary.income}
              expense={summary.expense}
              remaining={summary.remaining}
              totalBalance={summary.totalBalance}
              walletCount={data.wallets.length}
            />

            <div className="grid gap-4 sm:gap-5 lg:grid-cols-[5fr_6fr]">
              <CategoryDonut
                slices={slices}
                activeId={categoryFilter || null}
                onSelect={(id) => setCategoryFilter(id ?? "")}
              />
              <BudgetPanel
                data={data}
                month={month}
                spentByCategory={spentByCategory}
                activeId={categoryFilter || null}
              />
            </div>

            <div className="grid gap-4 sm:gap-5 lg:grid-cols-[3fr_2fr]">
              <TrendChart series={series} />
              <WalletPanel data={data} onManage={() => openSettings("wallets")} />
            </div>

            <TransactionTable
              data={data}
              month={month}
              categoryId={categoryFilter}
              onCategoryChange={setCategoryFilter}
              onAdd={openAdd}
              onEdit={(t) => {
                setEditing(t);
                setFormOpen(true);
              }}
              onDelete={setDeleting}
              onOpenWallets={() => openSettings("wallets")}
            />
          </>
        )}
      </main>

      <button
        type="button"
        onClick={openAdd}
        aria-label="Catat transaksi"
        className="fixed right-4 bottom-4 z-30 inline-flex size-14 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg hover:brightness-110 sm:right-6 sm:bottom-6 md:hidden"
      >
        <Icon name="plus" size={26} />
      </button>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Ubah transaksi" : "Catat transaksi"}
      >
        <TransactionForm
          data={data}
          editing={editing}
          defaultDate={formDate}
          onDone={() => setFormOpen(false)}
          onOpenWallets={() => openSettings("wallets")}
        />
      </Dialog>

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Hapus transaksi ini?"
      >
        {deleting && (
          <div>
            <p className="rounded-md bg-sunk p-3 text-sm">
              <span className="font-semibold">{deletingCat ?? "Kategori dihapus"}</span>
              {" · "}
              <span className="num font-semibold">{formatRupiah(deleting.amount)}</span>
              <br />
              <span className="text-muted">{formatDayLong(deleting.date)}</span>
              {deleting.note && (
                <>
                  <br />
                  <span className="text-muted">{deleting.note}</span>
                </>
              )}
            </p>
            <p className="mt-3 text-sm text-muted">
              Saldo dompet, anggaran, dan grafik ikut dihitung ulang. Tindakan ini tidak bisa
              dibatalkan.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setDeleting(null)} className={`${btnQuiet} flex-1`}>
                Batal
              </button>
              <button
                type="button"
                className={`${btnDanger} flex-1`}
                onClick={() => {
                  actions.deleteTransaction(deleting.id);
                  setDeleting(null);
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        )}
      </Dialog>

      <SettingsDrawer
        open={settingsOpen}
        tab={tab}
        onTabChange={setTab}
        onClose={() => setSettingsOpen(false)}
        data={data}
      />
    </>
  );
}
