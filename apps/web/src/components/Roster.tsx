import { useRef, type ReactNode, type KeyboardEvent } from "react";
import type { Team } from "../types";
import { openSeats, sortDirection, sortField } from "../lib/roster";
import { Badge, Seats, SeatSkeleton, type SeatSize } from "./ui";

type Column = {
  title: string;
  sort?: string;
  descending?: boolean;
};

type Row = { id: string; cells: ReactNode[] };

export function TeamSeats({
  team,
  size = "sm",
}: {
  team: Team;
  size?: SeatSize;
}) {
  const memberCount = team?.members?.length || 0;
  const capacity = team?.capacity || 4;
  const open = openSeats(team);
  return (
    <div className="flex items-center gap-2 text-xs text-muted">
      <Seats
        capacity={capacity}
        filled={memberCount}
        size={size}
        inactive={team?.status !== "Recruiting"}
        decorative
      />
      <span>
        {open
          ? `${open} open`
          : team?.status === "Recruiting"
            ? "Full"
            : team?.status || "Recruiting"}{" "}
        · {memberCount}/{capacity} filled
      </span>
    </div>
  );
}

export function RosterSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div
      className="w-full divide-y divide-border animate-pulse"
      aria-label="Loading roster..."
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3.5 px-4 gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-soft" />
            <div className="space-y-1.5">
              <div className="w-28 h-4 rounded bg-soft" />
              <div className="w-16 h-3 rounded bg-soft" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="w-14 h-5 rounded-md bg-soft" />
            <div className="w-14 h-5 rounded-md bg-soft" />
          </div>
          <div className="flex items-center gap-1.5">
            <SeatSkeleton size="sm" />
            <SeatSkeleton size="sm" />
            <SeatSkeleton size="sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RosterSkills({ skills }: { skills: string[] }) {
  const safeSkills = Array.isArray(skills) ? skills : [];
  return (
    <div className="flex flex-wrap gap-1.5">
      {safeSkills.slice(0, 4).map((skill) => (
        <Badge key={skill}>{skill}</Badge>
      ))}
      {safeSkills.length > 4 && <Badge>+{safeSkills.length - 4} more</Badge>}
      {!safeSkills.length && (
        <span className="text-xs text-muted italic">
          Skills to be decided
        </span>
      )}
    </div>
  );
}

export function Roster({
  label,
  columns,
  rows,
  sort,
  onSort,
}: {
  label: string;
  columns: Column[];
  rows: Row[];
  sort: string;
  onSort: (value: string) => void;
}) {
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const mobileListRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = (
    e: KeyboardEvent<HTMLElement>,
    index: number,
    isMobile: boolean,
  ) => {
    const container = isMobile ? mobileListRef.current : tbodyRef.current;
    if (!container) return;
    const items = Array.from(
      container.querySelectorAll<HTMLElement>('[data-roster-row="true"]'),
    );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[index + 1];
      if (next) next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[index - 1];
      if (prev) prev.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        const primaryLinkOrButton = e.currentTarget.querySelector<HTMLElement>(
          "a[href], button",
        );
        if (primaryLinkOrButton) {
          primaryLinkOrButton.click();
        }
      }
    }
  };

  return (
    <div className="w-full relative">
      <table
        className="hidden md:table w-full border-collapse text-left bg-surface text-sm"
        aria-label={label}
      >
        <thead className="sticky top-[70px] z-10 bg-surface/95 backdrop-blur-xs">
          <tr className="border-b border-border">
            {columns.map(({ title, sort: key, descending }) => {
              const active = key && sortField(sort) === key;
              const direction: "ascending" | "descending" | "none" | undefined =
                key
                  ? active
                    ? Boolean(descending) !== sortDirection(sort) < 0
                      ? "descending"
                      : "ascending"
                    : "none"
                  : undefined;
              return (
                <th
                  key={title}
                  scope="col"
                  aria-sort={direction}
                  className="py-3 px-4 text-xs font-semibold text-muted bg-surface/95 backdrop-blur-xs"
                >
                  {key ? (
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center gap-1 font-semibold text-muted hover:text-ink cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 rounded-sm"
                      onClick={() =>
                        onSort(active && sort === key ? `${key}-reverse` : key)
                      }
                    >
                      {title}{" "}
                      <span aria-hidden="true">
                        {direction === "ascending"
                          ? "↑"
                          : direction === "descending"
                            ? "↓"
                            : "↕"}
                      </span>
                    </button>
                  ) : (
                    title
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody ref={tbodyRef} className="divide-y divide-border">
          {rows.map(({ id, cells }, rowIndex) => (
            <tr
              key={id}
              data-roster-row="true"
              tabIndex={0}
              role="row"
              onKeyDown={(e) => handleKeyDown(e, rowIndex, false)}
              className="hover:bg-soft/40 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 focus-visible:bg-soft/60 cursor-pointer"
            >
              {cells.map((cell, index) =>
                index === 0 ? (
                  <th
                    scope="row"
                    key={index}
                    className="py-3.5 px-4 font-normal text-ink text-left"
                  >
                    {cell}
                  </th>
                ) : (
                  <td key={index} className="py-3.5 px-4 text-ink">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <ul
        ref={mobileListRef}
        className="flex flex-col md:hidden gap-4 p-0 m-0 list-none"
        aria-label={label}
      >
        {rows.map(({ id, cells }, cardIndex) => (
          <li
            key={id}
            data-roster-row="true"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, cardIndex, true)}
            className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2.5 shadow-sm hover:border-teal-700/40 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-700 dark:focus-visible:ring-teal-400 cursor-pointer"
          >
            {cells.map((cell, index) => (
              <div key={index}>
                {index !== 0 && (
                  <span className="block text-xs font-bold text-muted uppercase tracking-wider mb-0.5">
                    {columns[index].title}
                  </span>
                )}
                {cell}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
