import type { HTMLAttributes, ReactNode } from "react";

export type SeatStatus = "filled" | "open" | "skeleton";
export type SeatSize = "sm" | "md" | "lg";

export interface SeatProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  status: SeatStatus;
  size?: SeatSize;
  occupantName?: string;
  className?: string;
  decorative?: boolean;
  inactive?: boolean;
  onClick?: () => void;
}

const SIZE_CLASSES: Record<SeatSize, string> = {
  sm: "w-3.5 h-3.5 min-w-[14px] min-h-[14px] text-[8px]",
  md: "w-6 h-6 min-w-[24px] min-h-[24px] text-xs",
  lg: "w-10 h-10 min-w-[40px] min-h-[40px] text-base",
};

export function Seat({
  status,
  size = "md",
  occupantName,
  className = "",
  decorative = false,
  inactive = false,
  onClick,
  ...rest
}: SeatProps) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  let statusClass: string;
  let content: ReactNode = null;

  if (status === "filled") {
    statusClass = "border-2 border-solid border-primary bg-primary text-on-primary shadow-xs";
    if (occupantName && size !== "sm") {
      const initial = occupantName.trim().charAt(0).toUpperCase();
      content = (
        <span className="font-bold leading-none select-none" aria-hidden="true">
          {initial}
        </span>
      );
    } else {
      content = (
        <span
          className={`${size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5"} rounded-full bg-on-primary/90 pointer-events-none`}
          aria-hidden="true"
        />
      );
    }
  } else if (status === "open") {
    statusClass = "border-2 border-dashed border-seat-open bg-seat-open/10 text-seat-open";
    if (size !== "sm") {
      content = (
        <span className="font-bold leading-none select-none" aria-hidden="true">
          +
        </span>
      );
    } else {
      content = (
        <span
          className="w-1 h-1 rounded-full border border-dashed border-seat-open pointer-events-none opacity-60"
          aria-hidden="true"
        />
      );
    }
  } else {
    // skeleton
    statusClass = "border-2 border-solid border-border bg-soft animate-pulse";
  }

  const inactiveClass = inactive ? "opacity-40 grayscale pointer-events-none" : "";

  const accessibleLabel = decorative
    ? undefined
    : status === "open"
      ? "Open seat"
      : status === "filled"
        ? `Filled by ${occupantName || "teammate"}`
        : "Loading seat";

  const baseClasses =
    `inline-flex items-center justify-center rounded-full box-border select-none shrink-0 transition-all duration-300 ease-out ${sizeClass} ${statusClass} ${inactiveClass} ${className}`.trim();

  if (onClick && !decorative) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={accessibleLabel}
        disabled={inactive}
        className={`${baseClasses} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95`}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={accessibleLabel}
      className={baseClasses}
      {...rest}
    >
      {content}
    </span>
  );
}

export interface SeatsProps extends HTMLAttributes<HTMLSpanElement> {
  capacity: number;
  filled: number;
  size?: SeatSize;
  large?: boolean; // Backwards-compatible
  names?: string[];
  occupants?: string[];
  decorative?: boolean;
  inactive?: boolean;
  label?: string;
  className?: string;
}

export function Seats({
  capacity,
  filled,
  size,
  large = false,
  names,
  occupants,
  decorative = false,
  inactive = false,
  label,
  className = "",
  ...rest
}: SeatsProps) {
  const effectiveSize: SeatSize = size ?? (large ? "lg" : "sm");
  const gapClass =
    effectiveSize === "lg" ? "gap-2" : effectiveSize === "md" ? "gap-1.5" : "gap-1";
  const visible = Math.min(capacity, 6);
  const openCount = Math.max(0, capacity - filled);
  const memberNames = names ?? occupants;

  const groupLabel = decorative
    ? undefined
    : (label ?? `${filled} of ${capacity} seats filled (${openCount} open)`);

  return (
    <span
      role={decorative ? undefined : "group"}
      aria-hidden={decorative ? true : undefined}
      aria-label={groupLabel}
      className={`seats inline-flex items-center ${gapClass} ${className}`.trim()}
      {...rest}
    >
      {Array.from({ length: visible }, (_, index) => {
        const isFilled = index < filled;
        const occupant = memberNames?.[index];
        return (
          <Seat
            key={index}
            status={isFilled ? "filled" : "open"}
            size={effectiveSize}
            occupantName={occupant}
            inactive={inactive}
            decorative={true}
          />
        );
      })}
      {capacity > visible && (
        <span
          className="text-xs text-muted font-medium ml-0.5 select-none"
          aria-hidden="true"
        >
          +{capacity - visible}
        </span>
      )}
    </span>
  );
}

export function SeatSkeleton({
  size = "md",
  className = "",
}: {
  size?: SeatSize;
  className?: string;
}) {
  return <Seat status="skeleton" size={size} decorative className={className} />;
}

export function SeatsSkeleton({
  count = 3,
  size = "sm",
  className = "",
}: {
  count?: number;
  size?: SeatSize;
  className?: string;
}) {
  const gapClass = size === "lg" ? "gap-2" : size === "md" ? "gap-1.5" : "gap-1";
  return (
    <span
      className={`inline-flex items-center ${gapClass} ${className}`.trim()}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SeatSkeleton key={i} size={size} />
      ))}
    </span>
  );
}
