import type { SVGProps } from "react";

export type IconName =
  | "plus"
  | "left"
  | "right"
  | "sun"
  | "moon"
  | "settings"
  | "edit"
  | "trash"
  | "download"
  | "search"
  | "close"
  | "up"
  | "down"
  | "alert"
  | "check"
  | "archive";

const PATHS: Record<IconName, string> = {
  plus: "M12 5v14M5 12h14",
  left: "M14.5 6l-6 6 6 6",
  right: "M9.5 6l6 6-6 6",
  sun: "M12 8a4 4 0 100 8 4 4 0 000-8zM12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4",
  moon: "M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z",
  settings: "M4 7h9M17 7h3M4 17h3M11 17h9M15 4.5v5M9 14.5v5",
  edit: "M5 19l.8-3.6L16.6 4.6a1.5 1.5 0 012.1 0l.7.7a1.5 1.5 0 010 2.1L8.6 18.2 5 19zM14.5 6.7l2.8 2.8",
  trash: "M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10.5 11v5M13.5 11v5",
  download: "M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14",
  search: "M11 5a6 6 0 100 12 6 6 0 000-12zM16 16l4 4",
  close: "M6 6l12 12M18 6L6 18",
  up: "M12 19V6M6.5 11.5L12 6l5.5 5.5",
  down: "M12 5v13M6.5 12.5L12 18l5.5-5.5",
  alert: "M12 4l9 16H3L12 4zM12 10v4M12 17v.5",
  check: "M5 12.5l4.5 4.5L19 7.5",
  archive: "M4 6h16v4H4zM6 10v9h12v-9M10 14h4",
};

export function Icon({
  name,
  size = 18,
  ...props
}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
