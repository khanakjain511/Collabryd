import { useState } from "react";

// String filters also fit naturally in the URL, so Back restores the same search.
export function useListFilters(defaults: Record<string, string>) {
  const [filters, setFilters] = useState(() => {
    const query = new URLSearchParams(window.location.hash.split("?")[1]);
    const initial = { ...defaults };
    for (const key of Object.keys(defaults))
      initial[key] = query.get(key) ?? defaults[key];
    return initial;
  });

  function updateFilters(changes: Record<string, string>) {
    const next: Record<string, string> = { ...filters, page: "1", ...changes };
    setFilters(next);
    const query = new URLSearchParams();
    for (const key of Object.keys(next)) {
      if (next[key] && next[key] !== defaults[key]) query.set(key, next[key]);
    }
    const path = window.location.hash.split("?")[0];
    window.history.replaceState(
      null,
      "",
      path + (query.size ? `?${query}` : ""),
    );
  }

  function resetFilters() {
    updateFilters(defaults);
  }
  return { filters, updateFilters, resetFilters };
}
