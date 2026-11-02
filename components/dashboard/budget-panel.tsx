"use client";

import { useState } from "react";
import { budgetStatus, type BudgetLevel } from "@/lib/calc";
import { formatNumber, formatRupiah, parseAmount } from "@/lib/format";
import { actions } from "@/lib/store";
import type { AppData } from "@/lib/types";
import { Icon } from "./icons";
import { Card, EmptyState, field } from "./ui";

const BAR: Record<BudgetLevel, string> = {
  none: "bg-line",
  ok: "bg-accent",
  warn: "bg-warn-bar",
  over: "bg-expense",
};

function BudgetInput({
  initial,
  onSave,
  onCancel,
  name,
}: {
  initial: number;
  onSave: (n: number) => void;
  onCancel: () => void;
  name: string;
}) {
  const [value, setValue] = useState(initial ? formatNumber(initial) : "");
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(parseAmount(value));
      }}
    >
      <label className="sr-only" htmlFor={`budget-${name}`}>
        Anggaran {name}
      </label>
      <span className="text-sm text-muted">Rp</span>
      <input
        id={`budget-${name}`}
        autoFocus
        inputMode="numeric"
        value={value}
        placeholder="0"
        onChange={(e) => {
          const n = parseAmount(e.target.value);
          setValue(n ? formatNumber(n) : "");
        }}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        onBlur={() => onSave(parseAmount(value))}
        className={`${field} num h-9 w-36 text-right`}
      />
    </form>
  );
}

export function BudgetPanel({
  data,
  month,
  spentByCategory,
  activeId,
}: {
  data: AppData;
  month: string;
  spentByCategory: Map<string, number>;
  activeId: string | null;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const categories = data.categories.filter(
    (c) => c.type === "EXPENSE" && (!c.isArchived || spentByCategory.has(c.id)),
  );
  const budgetOf = (id: string) =>
    data.budgets.find((b) => b.categoryId === id && b.month === month)?.amount;
  const setCount = categories.filter((c) => budgetOf(c.id)).length;

  return (
    <Card
      title="Anggaran bulan ini"
      question="Kategori mana yang hampir melewati batas?"
      action={
        <p className="num shrink-0 text-xs text-muted">
          {setCount} dari {categories.length} diatur
        </p>
      }
    >
      {categories.length === 0 ? (
        <EmptyState
          title="Belum ada kategori pengeluaran"
          hint="Tambahkan kategori lewat pengaturan, lalu tetapkan batas bulanannya di sini."
        />
      ) : (
        <ul className="divide-y divide-line">
          {categories.map((c) => {
            const spent = spentByCategory.get(c.id) ?? 0;
            const amount = budgetOf(c.id);
            const { level, pct, left } = budgetStatus(spent, amount);
            return (
              <li
                key={c.id}
                className={`py-3 first:pt-0 last:pb-0 ${
                  activeId && activeId !== c.id ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                    <span
                      className="size-3 shrink-0 rounded-sm"
                      style={{ background: c.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{c.name}</span>
                  </p>
                  {editing === c.id ? (
                    <BudgetInput
                      name={c.name}
                      initial={amount ?? 0}
                      onCancel={() => setEditing(null)}
                      onSave={(n) => {
                        actions.setBudget(c.id, month, n);
                        setEditing(null);
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditing(c.id)}
                      className="num -mr-2 rounded-md px-2 py-1 text-sm hover:bg-sunk"
                      aria-label={
                        amount
                          ? `Ubah anggaran ${c.name}, saat ini ${formatRupiah(amount)}`
                          : `Atur anggaran ${c.name}`
                      }
                    >
                      {amount ? (
                        <>
                          <span className="font-semibold">{formatRupiah(spent)}</span>
                          <span className="text-muted"> / {formatRupiah(amount)}</span>
                        </>
                      ) : (
                        <span className="font-semibold text-accent underline underline-offset-2">
                          Atur batas
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {amount ? (
                  <>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-sm bg-sunk"
                      role="progressbar"
                      aria-label={`Anggaran ${c.name} terpakai`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.min(Math.round(pct), 100)}
                    >
                      <div
                        className={`h-full transition-[width] duration-300 ${BAR[level]}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p
                      className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                        level === "over"
                          ? "font-semibold text-expense"
                          : level === "warn"
                            ? "font-semibold text-warn"
                            : "text-muted"
                      }`}
                    >
                      {level !== "ok" && <Icon name="alert" size={13} />}
                      <span className="num">
                        {level === "over"
                          ? `Melebihi ${formatRupiah(-left)} (${Math.round(pct)}%)`
                          : level === "warn"
                            ? `Hampir habis: sisa ${formatRupiah(left)} (${Math.round(pct)}%)`
                            : `Sisa ${formatRupiah(left)} (${Math.round(pct)}%)`}
                      </span>
                    </p>
                  </>
                ) : (
                  spent > 0 && (
                    <p className="num mt-1 text-xs text-muted">
                      Terpakai {formatRupiah(spent)}, belum ada batas.
                    </p>
                  )
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
