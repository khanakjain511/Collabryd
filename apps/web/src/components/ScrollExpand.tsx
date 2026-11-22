import React, { useCallback, useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useAppearance } from "../hooks/useAppearance";
import { canAnimate } from "../lib/motion";

const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

export interface ScrollExpandProps {
  src?: string;
  srcSet?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  useWindowScroll?: boolean;
  enabled?: boolean;
  children?: ReactNode;
  restingCTA?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const ScrollExpand: React.FC<ScrollExpandProps> = ({
  src = "/images/campus-team.webp",
  srcSet = "/images/campus-team-small.webp 640w, /images/campus-team.webp 1200w",
  alt = "Generated editorial image of Indian students building a prototype in a makerspace",
  title = "Where campus projects find their missing seats.",
  scrollHint = "Scroll to explore",
  startWidth = 46,
  startHeight = 43,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.08,
  scrollDistance = 0.85,
  holdDistance = 0.12,
  smoothing = 0.1,
  overlayScrim = 0.55,
  useWindowScroll = true,
  enabled = true,
  children,
  restingCTA,
  className = "",
  style,
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const scrimRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);

  const { reducedMotion } = useAppearance();
  const allowMotion = enabled && canAnimate(reducedMotion);

  const applyProgress = useCallback(
    (p: number) => {
      const frame = frameRef.current;
      const media = mediaRef.current;
      if (!frame || !media) return;

      if (!allowMotion) {
        frame.style.clipPath = "inset(0% 0% 0% 0% round 0px)";
        frame.style.width="100%"; frame.style.height="100%"; frame.style.left="0"; frame.style.top="0";
        media.style.transform = "scale(1)";
        if (scrimRef.current) scrimRef.current.style.opacity = `${overlayScrim}`;
        if (titleRef.current) { titleRef.current.style.opacity = "0"; titleRef.current.setAttribute("inert", ""); }
        if (hintRef.current) hintRef.current.style.opacity = "0";
        if (overlayRef.current) {
          overlayRef.current.style.opacity = "1";
          overlayRef.current.style.transform = "translate3d(0, 0, 0)";
          overlayRef.current.style.pointerEvents = "auto";
          overlayRef.current.removeAttribute("inert");
        }
        return;
      }

      const e = smoothstep(0, 1, p);
      const w = startWidth + (100 - startWidth) * e;
      const h = startHeight + (100 - startHeight) * e;
      const ix = Math.max(0, (100 - w) / 2);
      const iy = Math.max(0, (100 - h) / 2);
      const shift = 17 * (1 - e);
      const r = startRadius + (endRadius - startRadius) * e;
      frame.style.width = `${w}%`;
      frame.style.height = `${h}%`;
      frame.style.left = `${ix}%`;
      frame.style.top = `${iy + shift}%`;
      frame.style.clipPath = `inset(0 round ${r}px)`;

      media.style.transform = `scale(${mediaZoom + (1 - mediaZoom) * e})`;

      if (scrimRef.current) scrimRef.current.style.opacity = `${overlayScrim * e}`;

      if (titleRef.current) {
        const out = smoothstep(0.12, 0.5, p);
        titleRef.current.toggleAttribute("inert", p >= 0.5);
        titleRef.current.style.opacity = `${1 - out}`;
        titleRef.current.style.transform = `translate3d(0, ${-24 * out}px, 0)`;
      }

      if (hintRef.current) {
        const gone = smoothstep(0, 0.12, p);
        hintRef.current.style.opacity = `${1 - gone}`;
        hintRef.current.style.transform = `translate3d(0, ${8 * gone}px, 0)`;
      }

      // Overlay is inactive, inert, and pointer-events: none until progress >= 0.68
      const isVisible = p >= 0.68;
      if (overlayRef.current) {
        const inn = smoothstep(0.68, 1, p);
        overlayRef.current.style.opacity = `${inn}`;
        overlayRef.current.style.transform = `translate3d(0, ${16 * (1 - inn)}px, 0)`;
        overlayRef.current.style.pointerEvents = isVisible ? "auto" : "none";
        if (isVisible) {
          overlayRef.current.removeAttribute("inert");
        } else {
          overlayRef.current.setAttribute("inert", "");
        }
      }
    },
    [
      allowMotion,
      endRadius,
      mediaZoom,
      overlayScrim,
      startHeight,
      startRadius,
      startWidth,
    ]
  );

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!root || !track || !stage) return;

    if (!allowMotion) {
      applyProgress(1);
      track.style.height = "auto";
      stage.style.height = "auto";
      return;
    }

    let raf = 0;
    let current = 0;
    let target = 0;
    let stageH = 0;
    let running = false;

    const measure = () => {
      stageH = useWindowScroll ? window.innerHeight : root.clientHeight;
      if (stageH <= 0) return;
      stage.style.height = `${stageH}px`;
      track.style.height = `${
        stageH * (1 + Math.max(0, scrollDistance) + Math.max(0, holdDistance))
      }px`;
    };

    const readProgress = () => {
      const span = stageH * Math.max(0.01, scrollDistance);
      if (useWindowScroll) {
        const top = track.getBoundingClientRect().top;
        return clamp(-top / span, 0, 1);
      }
      return clamp(root.scrollTop / span, 0, 1);
    };

    const tick = () => {
      const k = smoothing <= 0 ? 1 : 1 - Math.exp(-1 / (60 * smoothing));
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.0004) {
        current = target;
        running = false;
      }
      applyProgress(current);
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    const kick = () => {
      if (running) return;
      running = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      target = readProgress();
      if (smoothing <= 0 || reducedMotion) {
        current = target;
        applyProgress(current);
        return;
      }
      kick();
    };

    const onResize = () => {
      measure();
      target = readProgress();
      current = target;
      applyProgress(current);
    };

    measure();
    target = readProgress();
    current = target;
    applyProgress(current);

    const scroller = useWindowScroll ? window : root;
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [allowMotion, applyProgress, holdDistance, reducedMotion, scrollDistance, smoothing, useWindowScroll]);

  return (
    <section
      ref={rootRef}
      className={`relative w-full overflow-x-clip ${className}`.trim()}
      style={style}
      aria-label="Hero Showcase"
    >
      <div ref={trackRef} className="relative w-full" style={allowMotion ? { height: `${(1 + scrollDistance + holdDistance) * 100}vh` } : undefined}>
        <div
          ref={stageRef}
          className="sticky top-0 w-full min-h-[500px] h-screen max-h-[1080px] overflow-hidden select-none"
        >
          {/* Expanding Media Frame */}
          <div
            ref={frameRef}
            className="absolute inset-0 [clip-path:inset(20%_27%_20%_27%_round_24px)] will-change-[clip-path] bg-sage"
          >
            <img
              ref={mediaRef}
              src={src}
              srcSet={srcSet}
              sizes="100vw"
              alt={alt}
              width={1536}
              height={1024}
              fetchPriority="high"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover select-none will-change-transform"
              style={{ objectPosition: "40% 20%", transformOrigin: "40% 25%" }}
            />

            {/* Scrim providing 4.5:1 text contrast for overlay & title */}
            <div
              ref={scrimRef}
              className="absolute inset-0 pointer-events-none opacity-0 bg-[#081c18] transition-opacity"
              aria-hidden="true"
            />

            {/* Overlay Children: disabled & inert until progress >= 0.68 */}
            {children && (
              <div
                ref={overlayRef}
                inert={!allowMotion ? undefined : true}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-12 text-white pointer-events-none opacity-0"
              >
                {children}
              </div>
            )}
          </div>

          {/* Resting State Title (white with scrim drop shadow for guaranteed contrast) */}
          {title && (
            <div
              ref={titleRef}
              className="absolute inset-x-0 top-8 sm:top-10 flex flex-col items-center p-5 text-center text-ink pointer-events-none"
            >
              <h1 className="hero-headline font-sans text-[clamp(2.25rem,5vw,4.5rem)] font-bold tracking-[-0.055em] leading-[1.06] max-w-3xl mx-auto">
                {title}
              </h1>
              {restingCTA && (
                <div className="mt-6 pointer-events-auto flex items-center gap-3">
                  {restingCTA}
                </div>
              )}
            </div>
          )}

          {/* Scroll Cue Hint */}
          {scrollHint && allowMotion && (
            <div
              ref={hintRef}
              className="absolute inset-x-0 bottom-8 flex justify-center text-center text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/80 drop-shadow-md pointer-events-none"
              aria-hidden="true"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink/40 backdrop-blur-xs border border-white/20">
                {scrollHint} ↓
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ScrollExpand;
