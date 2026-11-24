import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

const paths = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  arrowUp: "M5 19 19 5M5 5h14v14",
  search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  people:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.87M13 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  grid: "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
  calendar:
    "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-11 12a3 3 0 0 0 6 0",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2",
  check: "m5 12 4 4L19 6",
  plus: "M12 5v14M5 12h14",
  chevron: "m9 5 7 7-7 7",
  clock: "M12 8v4l3 2M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0",
  globe:
    "M2 12h20M12 2a17 17 0 0 1 0 20 17 17 0 0 1 0-20M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0",
  lock: "M5 10h14v12H5zm3 0V6a4 4 0 0 1 8 0v4",
  mail: "M3 5h18v14H3zm0 0 9 8 9-8",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12m13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  close: "m6 6 12 12M6 18 18 6",
  menu: "M4 6h16M4 12h16M4 18h16",
  logout: "M9 4H3v16h6m5-13 5 5-5 5M8 12h11",
  leaf: "M20 3c-8-2-17 3-16 10 1 8 13 8 16-10ZM4 20 16 8",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18",
  spark: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
} as const;

export function Icon({
  name,
  size = 20,
}: {
  name: keyof typeof paths;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export function Logo({ onHome }: { onHome?: () => void }) {
  return (
    <a
      href="#/"
      className="logo inline-flex items-center gap-1.5 text-primary text-2xl font-semibold tracking-tight shrink-0"
      aria-label="Collabyrd home"
      onClick={(event) => {
        if (
          !onHome ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        onHome();
      }}
    >
      <svg viewBox="0 0 34 34" width="34" height="34" aria-hidden="true">
        <path
          d="M5 5c10 0 16 4 16 12C11 17 5 13 5 5Zm24 24c-10 0-16-4-16-12 10 0 16 4 16 12Z"
          fill="currentColor"
        />
        <path
          d="M29 5c0 10-4 16-12 16C17 11 21 5 29 5Z"
          fill="currentColor"
          opacity=".6"
        />
      </svg>
      <span>
        collabyrd<span className="logo-dot text-muted">.</span>
      </span>
    </a>
  );
}

export function Avatar({
  name,
  color = "sage",
  small = false,
}: {
  name?: string;
  color?: string;
  small?: boolean;
}) {
  const safeName = (name || "").trim() || "?";
  const initials = safeName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("") || safeName.slice(0, 2).toUpperCase();
  return (
    <span
      className={`avatar inline-flex items-center justify-center rounded-full shrink-0 border border-border bg-sage text-primary font-semibold ${color} ${
        small ? "avatar-small w-8 h-8 text-xs" : "w-11 h-11 text-base"
      }`}
      aria-label={safeName}
    >
      {initials}
    </span>
  );
}

export function Badge({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span
      className={`badge inline-flex items-center w-fit px-2 py-1 text-xs rounded-md font-medium border border-border ${tone === "positive" ? "bg-success-bg text-success" : tone === "warning" ? "bg-soft text-accent" : "bg-soft text-ink"}`}
    >
      {children}
    </span>
  );
}

export {
  Seat,
  Seats,
  SeatSkeleton,
  SeatsSkeleton,
  type SeatProps,
  type SeatsProps,
  type SeatStatus,
  type SeatSize,
} from "./Seat";
import { Seat, Seats } from "./Seat";

export function EmptyState({
  title,
  description,
  action,
  seatCount = 1,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  seatCount?: number;
}) {
  return (
    <div className="bg-surface border border-dashed border-border rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
      {seatCount === 1 ? (
        <Seat status="open" size="lg" decorative />
      ) : (
        <Seats capacity={seatCount} filled={0} size="lg" decorative />
      )}
      <h3 className="text-lg font-medium mt-3 mb-1.5">{title}</h3>
      <p className="text-muted text-sm max-w-md mb-4">{description}</p>
      {action}
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6">
      <div>
        {eyebrow && (
          <p className="eyebrow font-mono text-[11px] uppercase tracking-wider font-semibold text-primary mb-3">
            {eyebrow}
          </p>
        )}
        <h1
          tabIndex={-1}
          className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-tight"
        >
          {title}
        </h1>
        {description && (
          <p className="text-muted text-sm mt-1.5">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (trigger?.isConnected) trigger.focus();
      else document.querySelector<HTMLElement>("main h1")?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog bg-surface text-ink border border-border rounded-2xl p-6 max-w-lg w-[calc(100%-2rem)] shadow-2xl backdrop:bg-black/50"
      aria-labelledby="dialog-title"
      onCancel={onClose}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 id="dialog-title" className="text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          className="icon-button w-10 h-10 rounded-lg inline-flex items-center justify-center hover:bg-soft text-ink"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function HeroNetwork() {
  return (
    <svg
      className="hero-network w-full h-full text-primary opacity-15 pointer-events-none"
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1">
        <path d="m40 120 150-50 130 150 210-60M40 120l60 190 220-90 130 180 80-240M100 310l70 200 280-110M190 70l-20 440 150-290M40 120l410 280" />
      </g>
      {[
        [40, 120],
        [190, 70],
        [320, 220],
        [530, 160],
        [100, 310],
        [170, 510],
        [450, 400],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="currentColor" />
      ))}
    </svg>
  );
}
