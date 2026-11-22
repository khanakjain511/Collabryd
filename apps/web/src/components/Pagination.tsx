import { Icon } from "./ui";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav
      className="pagination flex items-center justify-center gap-4 mt-8"
      aria-label="Results pages"
    >
      <button
        type="button"
        className="text-xs py-1.5 px-3 rounded-lg border border-border bg-surface text-ink inline-flex items-center gap-2 hover:bg-soft cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ← Previous
      </button>
      <span aria-live="polite" className="text-xs text-muted font-medium">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="text-xs py-1.5 px-3 rounded-lg border border-border bg-surface text-ink inline-flex items-center gap-2 hover:bg-soft cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next <Icon name="arrow" size={15} />
      </button>
    </nav>
  );
}
