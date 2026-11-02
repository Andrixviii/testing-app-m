"use client";

import { formatRupiah } from "@/lib/format";
import type { Category } from "@/lib/types";
import { Card, EmptyState } from "./ui";

type Slice = { categoryId: string; amount: number; category?: Category };

const R = 70;
const C = 2 * Math.PI * R;

export function CategoryDonut({
  slices,
  activeId,
  onSelect,
}: {
  slices: Slice[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const total = slices.reduce((s, x) => s + x.amount, 0);
  const starts = slices.map((_, i) =>
    slices.slice(0, i).reduce((s, x) => s + (x.amount / total) * C, 0),
  );

  return (
    <Card
      title="Pengeluaran per kategori"
      question="Bulan ini uang paling banyak keluar ke mana?"
    >
      {total === 0 ? (
        <EmptyState
          title="Belum ada pengeluaran bulan ini"
          hint="Begitu pengeluaran dicatat, pembagiannya per kategori muncul di sini."
        />
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative size-44 shrink-0">
            <svg viewBox="0 0 180 180" className="size-full -rotate-90" aria-hidden="true">
              {slices.map((s, i) => {
                const len = (s.amount / total) * C;
                const dim = activeId && activeId !== s.categoryId;
                return (
                  <circle
                    key={s.categoryId}
                    cx="90"
                    cy="90"
                    r={R}
                    fill="none"
                    stroke={s.category?.color ?? "#8a7358"}
                    strokeWidth="26"
                    strokeDasharray={`${Math.max(len - 2, 0.5)} ${C}`}
                    strokeDashoffset={-starts[i]}
                    opacity={dim ? 0.25 : 1}
                  />
                );
              })}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-muted">Total keluar</span>
              <span className="num text-sm font-bold">{formatRupiah(total)}</span>
            </div>
          </div>

          <ul className="w-full min-w-0 flex-1 space-y-0.5">
            {slices.map((s) => {
              const active = activeId === s.categoryId;
              return (
                <li key={s.categoryId}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelect(active ? null : s.categoryId)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-sunk ${
                      active ? "bg-sunk font-semibold" : ""
                    }`}
                  >
                    <span
                      className="size-3 shrink-0 rounded-sm"
                      style={{ background: s.category?.color }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {s.category?.name ?? "Kategori dihapus"}
                    </span>
                    <span className="num text-muted">
                      {Math.round((s.amount / total) * 100)}%
                    </span>
                    <span className="num w-28 text-right font-medium">
                      {formatRupiah(s.amount)}
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="px-2 pt-2 text-xs text-muted">
              Pilih kategori untuk menyaring tabel transaksi.
            </li>
          </ul>
        </div>
      )}
    </Card>
  );
}
