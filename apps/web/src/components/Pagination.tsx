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
    <nav className="pagination" aria-label="Results pages">
      <button
        type="button"
        className="button button-secondary button-small"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ← Previous
      </button>
      <span aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="button button-secondary button-small"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next <Icon name="arrow" size={15} />
      </button>
    </nav>
  );
}
