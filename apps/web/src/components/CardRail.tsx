import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { useAppearance } from "../hooks/useAppearance";

// Native overflow keeps touch and vertical scrolling independent.
export function CardRail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const { reducedMotion } = useAppearance();
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const list = track.current;
    if (!list) return;
    const measure = () =>
      setEdges({
        start: list.scrollLeft < 2,
        end: list.scrollLeft + list.clientWidth >= list.scrollWidth - 2,
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    Array.from(list.children).forEach((item) => observer.observe(item));
    list.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", measure);
    };
  }, [children]);

  function move(direction: number) {
    const list = track.current;
    const first = list?.firstElementChild;
    if (!list || !first) return;
    const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
    list.scrollBy({
      left: direction * (first.getBoundingClientRect().width + gap),
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }

  return (
    <div className="card-rail relative" role="region" aria-label={label}>
      <div
        className="rail-controls flex justify-end gap-1.5 mb-2"
        hidden={edges.start && edges.end}
      >
        <button
          type="button"
          className="rail-button min-w-11 min-h-11 px-2.5 py-1 text-base rounded-lg border border-border bg-surface text-ink hover:bg-soft disabled:opacity-40"
          disabled={edges.start}
          onClick={() => move(-1)}
          aria-label={`Previous ${label.toLowerCase()}`}
        >
          ←
        </button>
        <button
          type="button"
          className="rail-button min-w-11 min-h-11 px-2.5 py-1 text-base rounded-lg border border-border bg-surface text-ink hover:bg-soft disabled:opacity-40"
          disabled={edges.end}
          onClick={() => move(1)}
          aria-label={`Next ${label.toLowerCase()}`}
        >
          →
        </button>
      </div>
      <ul className="rail-track flex gap-4 overflow-x-auto snap-x snap-proximity m-0 p-1" ref={track}>
        {Children.map(children, (child) => (
          <li className="shrink-0 w-[min(85vw,370px)] snap-start [&>article]:h-full">{child}</li>
        ))}
      </ul>
    </div>
  );
}
