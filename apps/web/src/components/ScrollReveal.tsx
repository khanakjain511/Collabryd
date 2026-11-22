import React, { Children, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { useAppearance } from "../hooks/useAppearance";
import { canAnimate, loadMotion } from "../lib/motion";

export type RevealSplit = "words" | "chars" | "lines";
export type RevealEffect = "fade" | "rise" | "flip" | "scale";
export type RevealMode = "scrub" | "enter";

export interface ScrollRevealProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  id?: string;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  baseOffset?: number;
  stagger?: number;
  smoothing?: number;
  splitBy?: RevealSplit;
  effect?: RevealEffect;
  mode?: RevealMode;
  duration?: number;
  highlightColor?: string;
  className?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  as: Component = "h2",
  id,
  enableBlur = true,
  baseOpacity = 0.25,
  baseRotation = 0,
  blurStrength = 4,
  baseOffset = 0,
  stagger = 0.05,
  splitBy = "words",
  effect = "fade",
  mode = "scrub",
  duration = 0.8,
  highlightColor = "",
  className = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const { reducedMotion } = useAppearance();
  const allowMotion = canAnimate(reducedMotion);

  const text = useMemo(() => {
    const parts = Children.toArray(children);
    return parts.every((part) => typeof part === "string" || typeof part === "number")
      ? parts.join("")
      : null;
  }, [children]);

  const splitText = useMemo(() => {
    if (text === null) return null;
    return text.split(/(\s+)/).map((word, index) =>
      word.trim() === "" ? (
        word
      ) : (
        <span className="inline-block" data-word key={index}>
          {splitBy === "chars" ? (
            Array.from(word).map((char, charIndex) => (
              <span className="inline-block" data-piece key={charIndex}>
                {char}
              </span>
            ))
          ) : (
            <span className="inline-block" data-piece>
              {word}
            </span>
          )}
        </span>
      )
    );
  }, [text, splitBy]);

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current;
    const textEl = textRef.current;
    if (!el || !textEl || !allowMotion) return;

    let cancelled = false;
    let revert = () => {};

    void loadMotion()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return;

        const ctx = gsap.context(() => {
          const pieces = Array.from(el.querySelectorAll<HTMLElement>("[data-piece]"));
          if (!pieces.length) return;

          if (mode === "enter") {
            gsap.fromTo(
              pieces,
              {
                opacity: baseOpacity,
                y: baseOffset || 12,
                filter: enableBlur ? `blur(${blurStrength}px)` : "none",
              },
              {
                opacity: 1,
                y: 0,
                filter: "none",
                duration,
                stagger,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 85%",
                  toggleActions: "play none none none",
                },
              }
            );
          } else {
            gsap.fromTo(
              pieces,
              {
                opacity: baseOpacity,
                y: baseOffset || 8,
                filter: enableBlur ? `blur(${blurStrength}px)` : "none",
              },
              {
                opacity: 1,
                y: 0,
                filter: "none",
                stagger,
                ease: "none",
                scrollTrigger: {
                  trigger: el,
                  start: "top 90%",
                  end: wordAnimationEnd === "bottom bottom" ? "bottom 60%" : wordAnimationEnd,
                  scrub: true,
                },
              }
            );
          }

          // Font loading recompute
          if (typeof document !== "undefined" && document.fonts?.ready) {
            document.fonts.ready
              .then(() => {
                ScrollTrigger.refresh();
              })
              .catch(() => {});
          }
        }, el);

        revert = () => ctx.revert();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      revert();
    };
  }, [
    allowMotion,
    text,
    splitBy,
    effect,
    mode,
    duration,
    highlightColor,
    enableBlur,
    baseOpacity,
    baseRotation,
    blurStrength,
    baseOffset,
    stagger,
    rotationEnd,
    wordAnimationEnd,
  ]);

  if (!allowMotion) {
    return (
      <Component
        id={id}
        ref={containerRef as React.RefObject<HTMLHeadingElement>}
        className={`my-4 text-ink font-display text-3xl sm:text-5xl font-medium tracking-tight ${className}`.trim()}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      id={id}
      ref={containerRef as React.RefObject<HTMLHeadingElement>}
      className={`my-4 text-ink font-display text-3xl sm:text-5xl font-medium tracking-tight ${className}`.trim()}
      aria-label={text ?? undefined}
    >
      <span
        ref={textRef}
        className={`block leading-snug ${textClassName}`}
        aria-hidden={text === null ? undefined : true}
      >
        {splitText ?? children}
      </span>
    </Component>
  );
};

export default ScrollReveal;
