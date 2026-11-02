"use client";

import { useSyncExternalStore } from "react";
import { currentMonth, formatMonth, shiftMonth } from "@/lib/format";
import { Icon } from "./icons";
import { btnPrimary, iconBtn } from "./ui";

type Theme = "light" | "dark";

function subscribeTheme(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  mq.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", cb);
  };
}

function getTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "light" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className={iconBtn}
      aria-label={next === "dark" ? "Pakai tema gelap" : "Pakai tema terang"}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("kasbulan:theme", next);
        } catch {
          /* diabaikan */
        }
      }}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}

export function Header({
  month,
  ready,
  onMonthChange,
  onAdd,
  onOpenSettings,
}: {
  month: string;
  ready: boolean;
  onMonthChange: (m: string) => void;
  onAdd: () => void;
  onOpenSettings: () => void;
}) {
  const isCurrent = !ready || month === currentMonth();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <span className="text-lg font-extrabold tracking-tight text-accent">KasBulan</span>

        <div className="mx-auto flex items-center gap-1 sm:mx-0 sm:ml-4">
          <button
            type="button"
            className={iconBtn}
            aria-label="Bulan sebelumnya"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
          >
            <Icon name="left" />
          </button>
          <p
            className="min-w-32 text-center text-sm font-bold sm:min-w-40 sm:text-base"
            aria-live="polite"
          >
            {ready ? formatMonth(month) : "\u00a0"}
          </p>
          <button
            type="button"
            className={iconBtn}
            aria-label="Bulan berikutnya"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
          >
            <Icon name="right" />
          </button>
          {!isCurrent && (
            <button
              type="button"
              onClick={() => onMonthChange(currentMonth())}
              className="ml-1 hidden h-8 items-center rounded-md border border-line px-2.5 text-xs font-semibold hover:bg-sunk sm:inline-flex"
            >
              Bulan ini
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={onAdd} className={`${btnPrimary} hidden md:inline-flex`}>
            <Icon name="plus" />
            Catat transaksi
          </button>
          <ThemeToggle />
          <button
            type="button"
            className={iconBtn}
            aria-label="Buka pengaturan"
            onClick={onOpenSettings}
          >
            <Icon name="settings" />
          </button>
        </div>
      </div>
    </header>
  );
}
