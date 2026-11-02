import { formatMonth } from "./format";
import type { AppData } from "./types";

function download(filename: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportMonthCsv(data: AppData, month: string) {
  const rows = data.transactions
    .filter((t) => t.date.startsWith(month))
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt)
    .map((t) =>
      [
        t.date,
        t.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
        data.categories.find((c) => c.id === t.categoryId)?.name ?? "",
        data.wallets.find((w) => w.id === t.walletId)?.name ?? "",
        t.amount,
        t.note,
      ]
        .map(csvCell)
        .join(","),
    );
  const header = "Tanggal,Tipe,Kategori,Dompet,Jumlah (Rp),Catatan";
  download(`kasbulan-${month}.csv`, "text/csv;charset=utf-8", [header, ...rows].join("\n"));
  return { count: rows.length, label: formatMonth(month) };
}

export function exportBackupJson(data: AppData) {
  const stamp = new Date().toISOString().slice(0, 10);
  download(`kasbulan-cadangan-${stamp}.json`, "application/json", JSON.stringify(data, null, 2));
}
