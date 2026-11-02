"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./icons";

export const btn =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors disabled:opacity-50";
export const btnPrimary = `${btn} bg-accent text-on-accent hover:brightness-110`;
export const btnQuiet = `${btn} border border-line bg-surface text-ink hover:bg-sunk`;
export const btnDanger = `${btn} bg-expense text-bg hover:brightness-110`;
export const iconBtn =
  "inline-flex size-10 items-center justify-center rounded-md text-muted transition-colors hover:bg-sunk hover:text-ink";
export const field =
  "h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus-visible:outline-2";
export const label = "mb-1.5 block text-sm font-medium text-ink";

export function Card({
  title,
  question,
  action,
  children,
  className = "",
}: {
  title: string;
  /** Pertanyaan yang dijawab panel ini, tampil sebagai subjudul */
  question?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-line bg-surface p-5 ${className}`}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          {question && <p className="mt-0.5 text-sm text-muted">{question}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-md border border-dashed border-line px-4 py-8 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{hint}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** Dialog bawaan browser: fokus terkunci, Esc menutup, label via aria-labelledby */
export function Dialog({
  open,
  onClose,
  title,
  variant = "center",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  variant?: "center" | "drawer";
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const place =
    variant === "drawer"
      ? "m-0 ml-auto h-dvh max-h-none w-full max-w-md"
      : "m-auto w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)]";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={`${place} overflow-y-auto border border-line bg-surface p-0 text-ink ${
        variant === "drawer" ? "" : "rounded-lg shadow-xl"
      }`}
    >
      {open && (
        <div className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 id="dialog-title" className="text-lg font-bold">
              {title}
            </h2>
            <button type="button" onClick={onClose} className={iconBtn} aria-label="Tutup">
              <Icon name="close" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
