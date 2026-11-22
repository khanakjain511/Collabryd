import { Children, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { loadMotion } from "../lib/motion";
import { useAppearance } from "../hooks/useAppearance";

export interface HorizontalScrollSectionProps {
  id?: string;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode[];
  className?: string;
}

// React Bits ScrollStack's depth/scale treatment, driven along the horizontal axis.
// Native scrolling keeps trackpad, touch, scrollbar and keyboard behavior intact.
export function HorizontalScrollSection({ id, title, eyebrow, description, children, className = "" }: HorizontalScrollSectionProps) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const { reducedMotion } = useAppearance();
  const [active, setActive] = useState(0);
  const items = Children.toArray(children);

  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const slots = Array.from(root.children) as HTMLElement[];
    let frame = 0;
    const update = () => {
      frame = 0;
      const width = slots[0]?.offsetWidth ?? 1;
      const stride = width + 24;
      const progress = root.scrollLeft / stride;
      setActive(Math.min(slots.length - 1, Math.round(progress)));
      slots.forEach((slot, index) => {
        const depth = Math.max(0, Math.min(2, progress - index));
        const card = slot.firstElementChild as HTMLElement;
        card.style.transform = reducedMotion ? "" : `scale(${1 - depth * .045})`;
        card.style.setProperty("--stack-dim", reducedMotion ? "0" : String(depth * .09));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    update();
    root.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("scroll", schedule);
    };
  }, [children, reducedMotion]);

  useEffect(() => {
    const outer = section.current, list = track.current;
    if (!outer || !list || reducedMotion) return;
    let cancelled = false;
    let cleanup = () => {};
    void loadMotion().then(({gsap, ScrollTrigger}) => {
      if (cancelled) return;
      const distance = () => list.scrollWidth - list.clientWidth;
      const size = () => { outer.style.height = `${window.innerHeight + distance()}px`; };
      size();
      const tween = gsap.fromTo(list,{scrollLeft:0},{scrollLeft:distance,ease:'none',scrollTrigger:{trigger:outer,start:'top top+=70',end:()=>`+=${distance()}`,scrub:.35,invalidateOnRefresh:true,onRefreshInit:size}});
      ScrollTrigger.refresh();
      cleanup = () => { tween.scrollTrigger?.kill(); tween.kill(); outer.style.height=''; };
    }).catch(() => { outer.style.height = ""; });
    return () => { cancelled=true; cleanup(); };
  },[reducedMotion]);

  function move(index: number, keyboard = false) {
    const root = track.current;
    const first = root?.firstElementChild as HTMLElement | null;
    if (!root || !first) return;
    root.scrollTo({
      left: Math.max(0, Math.min(items.length - 1, index)) * (first.offsetWidth + 24),
      behavior: reducedMotion || keyboard ? "instant" : "smooth",
    });
  }

  return (
    <section ref={section} id={id} className={`horizontal-story ${className}`} aria-label={title}>
      <div className={reducedMotion ? "py-16" : "sticky top-[70px] py-10 overflow-hidden"}>
      <div className="container mb-8 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          {eyebrow && <span className="section-kicker">{eyebrow}</span>}
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-3">{title}</h2>
          {description && <p className="text-muted m-0 max-w-xl">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted" aria-live="polite">{active + 1} / {items.length}</span>
          <button className="stack-control" aria-label={`Previous ${eyebrow || title}`} disabled={active === 0} onClick={() => move(active - 1)}>←</button>
          <button className="stack-control" aria-label={`Next ${eyebrow || title}`} disabled={active === items.length - 1} onClick={() => move(active + 1)}>→</button>
        </div>
      </div>
      <ul ref={track} className="horizontal-stack container" tabIndex={0} aria-label={`${title} cards`}
        data-reduced={reducedMotion || undefined}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(active + (event.key === "ArrowRight" ? 1 : -1), true);
          }
        }}>
        {items.map((child, index) => (
          <li key={index} style={{ left: reducedMotion ? undefined : index * 18, zIndex: index + 1 }}
            onFocusCapture={() => move(index, true)}>
            <div className="stack-card">{child}</div>
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}
export default HorizontalScrollSection;
