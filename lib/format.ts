export const TZ = "Asia/Jakarta";

const grouping = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/** 1250000 -> "Rp 1.250.000" */
export function formatRupiah(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}Rp ${grouping.format(Math.abs(n))}`;
}

export function formatNumber(n: number): string {
  return grouping.format(n);
}

/** 1250000 -> "1,3 jt" (untuk sumbu grafik) */
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  const f = (v: number) => v.toLocaleString("id-ID", { maximumFractionDigits: 1 });
  if (abs >= 1_000_000_000) return `${f(n / 1_000_000_000)} m`;
  if (abs >= 1_000_000) return `${f(n / 1_000_000)} jt`;
  if (abs >= 1_000) return `${f(n / 1_000)} rb`;
  return String(n);
}

/** Tanggal hari ini (Asia/Jakarta) sebagai YYYY-MM-DD */
export function todayJakarta(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export function currentMonth(): string {
  return todayJakarta().slice(0, 7);
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthDate(month: string): Date {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}

/** "2026-11" -> "November 2026" */
export function formatMonth(month: string): string {
  return monthDate(month).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "2026-11" -> "Nov" */
export function formatMonthShort(month: string): string {
  return monthDate(month).toLocaleDateString("id-ID", {
    month: "short",
    timeZone: "UTC",
  });
}

/** "2026-11-02" -> "2 Nov" */
export function formatDayShort(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** "2026-11-02" -> "Senin, 2 November 2026" */
export function formatDayLong(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Ambil angka bulat dari input bebas ("1.250.000" -> 1250000) */
export function parseAmount(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}
