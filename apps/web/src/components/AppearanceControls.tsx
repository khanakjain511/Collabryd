import { useAppearance } from "../hooks/useAppearance";

export function AppearanceControls({ showMotion = false }: { showMotion?: boolean }) {
  const { theme, reducedMotion, toggleTheme, toggleMotion } = useAppearance();

  return (
    <div className="appearance-controls flex items-center gap-1">
      <button
        type="button"
        className="icon-button w-10 h-10 border-0 bg-transparent text-ink inline-flex items-center justify-center rounded-lg shrink-0 cursor-pointer hover:bg-soft focus-visible:outline-2 focus-visible:outline-primary transition-colors"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-pressed={theme === "dark"}
        onClick={toggleTheme}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          {theme === "light" ? (
            <path d="M20.4 14.1A8.7 8.7 0 0 1 9.9 3.6 8.7 8.7 0 1 0 20.4 14.1Z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
            </>
          )}
        </svg>
      </button>

      {showMotion && <button
        type="button"
        className="icon-button motion-control w-10 h-10 border-0 bg-transparent text-ink inline-flex items-center justify-center rounded-lg shrink-0 cursor-pointer hover:bg-soft focus-visible:outline-2 focus-visible:outline-primary transition-colors"
        aria-label={reducedMotion ? "Enable motion" : "Reduce motion"}
        aria-pressed={reducedMotion}
        title={
          reducedMotion
            ? "Motion reduced (click to enable)"
            : "Full motion (click to reduce)"
        }
        onClick={toggleMotion}
      >
        <svg
          viewBox="0 0 24 24"
          width="19"
          height="19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          {reducedMotion ? (
            <path d="m8 5 11 7-11 7Z" />
          ) : (
            <path d="M9 5v14M15 5v14" />
          )}
        </svg>
      </button>}
    </div>
  );
}
