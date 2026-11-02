import { formatCompact, formatMonth, formatRupiah } from "@/lib/format";
import { Card } from "./ui";

type Point = { month: string; label: string; income: number; expense: number };

const W = 480;
const H = 200;
const PAD = { top: 12, right: 8, bottom: 26, left: 44 };

function niceMax(v: number): number {
  if (v <= 0) return 100_000;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

export function TrendChart({ series }: { series: Point[] }) {
  const hasData = series.some((p) => p.income > 0 || p.expense > 0);
  const max = niceMax(Math.max(...series.flatMap((p) => [p.income, p.expense])));
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const slot = plotW / series.length;
  const barW = Math.min(18, slot / 2 - 4);
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const ticks = [0, 0.5, 1].map((f) => f * max);

  return (
    <Card
      title="Tren 6 bulan"
      question="Apakah pemasukan masih lebih besar dari pengeluaran?"
      action={
        <ul className="flex shrink-0 gap-3 text-xs text-muted">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-income" aria-hidden="true" />
            Masuk
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-expense" aria-hidden="true" />
            Keluar
          </li>
        </ul>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Grafik batang pemasukan dan pengeluaran 6 bulan terakhir; rincian ada di tabel berikut"
        className="h-auto w-full"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--line)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 6}
              y={y(t) + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--muted)"
            >
              {formatCompact(t)}
            </text>
          </g>
        ))}
        {series.map((p, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          return (
            <g key={p.month}>
              <title>
                {`${formatMonth(p.month)}: masuk ${formatRupiah(p.income)}, keluar ${formatRupiah(p.expense)}`}
              </title>
              <rect
                x={cx - barW - 1}
                y={y(p.income)}
                width={barW}
                height={PAD.top + plotH - y(p.income)}
                fill="var(--income)"
              />
              <rect
                x={cx + 1}
                y={y(p.expense)}
                width={barW}
                height={PAD.top + plotH - y(p.expense)}
                fill="var(--expense)"
              />
              <text
                x={cx}
                y={H - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight={i === series.length - 1 ? 700 : 400}
                fill={i === series.length - 1 ? "var(--ink)" : "var(--muted)"}
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>

      {!hasData && (
        <p className="mt-2 text-sm text-muted">
          Belum ada transaksi dalam 6 bulan ini. Batang akan muncul setelah kamu mencatat.
        </p>
      )}

      <table className="sr-only">
        <caption>Pemasukan dan pengeluaran per bulan</caption>
        <thead>
          <tr>
            <th scope="col">Bulan</th>
            <th scope="col">Pemasukan</th>
            <th scope="col">Pengeluaran</th>
          </tr>
        </thead>
        <tbody>
          {series.map((p) => (
            <tr key={p.month}>
              <th scope="row">{formatMonth(p.month)}</th>
              <td>{formatRupiah(p.income)}</td>
              <td>{formatRupiah(p.expense)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
