import { formatMonth, formatRupiah } from "@/lib/format";
import { Icon } from "./icons";

function Figure({
  label,
  value,
  tone,
  icon,
  note,
}: {
  label: string;
  value: number;
  tone: string;
  icon: "up" | "down" | null;
  note?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-sm text-muted">
        {icon && <Icon name={icon} size={15} className={tone} />}
        {label}
      </p>
      <p className={`num mt-1 truncate text-xl font-bold ${tone}`}>{formatRupiah(value)}</p>
      {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
    </div>
  );
}

export function Summary({
  month,
  income,
  expense,
  remaining,
  totalBalance,
  walletCount,
}: {
  month: string;
  income: number;
  expense: number;
  remaining: number;
  totalBalance: number;
  walletCount: number;
}) {
  const deficit = remaining < 0;
  return (
    <section
      aria-label={`Ringkasan ${formatMonth(month)}`}
      className="grid overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-[1.3fr_2fr]"
    >
      <div className="p-5 sm:p-6">
        <p className="text-sm font-medium text-muted">Sisa {formatMonth(month)}</p>
        <p
          className={`num mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl ${
            deficit ? "text-expense" : "text-ink"
          }`}
        >
          {formatRupiah(remaining)}
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          {deficit ? (
            <>
              <Icon name="alert" size={15} className="text-expense" />
              <span className="text-expense">Pengeluaran melebihi pemasukan bulan ini</span>
            </>
          ) : (
            "Pemasukan dikurangi pengeluaran bulan ini"
          )}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 border-t border-line p-5 sm:grid-cols-3 sm:p-6 lg:border-t-0 lg:border-l">
        <Figure label="Pemasukan" value={income} tone="text-income" icon="up" />
        <Figure label="Pengeluaran" value={expense} tone="text-expense" icon="down" />
        <Figure
          label="Saldo semua dompet"
          value={totalBalance}
          tone="text-ink"
          icon={null}
          note={walletCount === 0 ? "Belum ada dompet" : `${walletCount} dompet`}
        />
      </div>
    </section>
  );
}
