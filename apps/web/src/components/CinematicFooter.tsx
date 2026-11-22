import React, { useEffect, useRef, useState } from "react";
import { useAppearance } from "../hooks/useAppearance";
import { canAnimate, loadMotion } from "../lib/motion";

interface MagneticProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  as?: "a" | "button";
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export function MagneticPill({
  as: Component = "a",
  children,
  className = "",
  ...props
}: MagneticProps) {
  const elRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useAppearance();

  useEffect(() => {
    const el = elRef.current;
    if (!el || reducedMotion) return;

    const finePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!finePointer) return;

    let revert = () => {};
    let cancelled = false;

    void loadMotion()
      .then(({ gsap }) => {
        if (cancelled) return;
        const ctx = gsap.context(() => {
          const onMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(el, {
              x: x * 0.35,
              y: y * 0.35,
              scale: 1.04,
              ease: "power2.out",
              duration: 0.3,
            });
          };

          const onLeave = () => {
            gsap.to(el, {
              x: 0,
              y: 0,
              scale: 1,
              ease: "power3.out",
              duration: 0.3,
            });
          };

          el.addEventListener("mousemove", onMove);
          el.addEventListener("mouseleave", onLeave);
          return () => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseleave", onLeave);
            gsap.killTweensOf(el);
          };
        }, el);

        revert = () => ctx.revert();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      revert();
    };
  }, [reducedMotion]);

  if (Component === "button") {
    return (
      <button
        ref={elRef as React.RefObject<HTMLButtonElement>}
        className={className}
        type="button"
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      ref={elRef as React.RefObject<HTMLAnchorElement>}
      className={className}
      {...props}
    >
      {children}
    </a>
  );
}

const marqueeItems = [
  "Campus Discovery",
  "Hackathon Teams",
  "Student Profiles",
  "Open Seat Matching",
  "Ideas Into Projects",
  "Direct Connections",
];

export type LandingSection = "landing-top" | "how-it-works" | "campus-events" | "faq";

export function CinematicFooter({
  onSection,
}: {
  onSection?: (section: LandingSection) => void;
}) {
  const { reducedMotion } = useAppearance();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);

  const [isCurtain, setIsCurtain] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkCurtain = () => {
      const isEligible =
        Boolean(onSection) &&
        !reducedMotion &&
        window.innerWidth >= 768 &&
        window.innerHeight >= 600;
      setIsCurtain(isEligible);
    };

    checkCurtain();
    window.addEventListener("resize", checkCurtain, { passive: true });
    return () => window.removeEventListener("resize", checkCurtain);
  }, [onSection, reducedMotion]);

  // Parallax and scroll reveal for giant text
  useEffect(() => {
    if (!isCurtain || !canAnimate(reducedMotion)) return;
    const wrapper = wrapperRef.current;
    const giantText = giantTextRef.current;
    if (!wrapper || !giantText) return;

    let cancelled = false;
    let revert = () => {};

    void loadMotion()
      .then(({ gsap }) => {
        if (cancelled) return;
        const ctx = gsap.context(() => {
          gsap.fromTo(
            giantText,
            { y: "12vh", opacity: 0.2 },
            {
              y: "0vh",
              opacity: 0.85,
              ease: "none",
              scrollTrigger: {
                trigger: wrapper,
                start: "top bottom",
                end: "bottom bottom",
                scrub: true,
              },
            }
          );
        }, wrapper);
        revert = () => ctx.revert();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      revert();
    };
  }, [isCurtain, reducedMotion]);

  const scrollToTop = () => {
    if (onSection) {
      onSection("landing-top");
      return;
    }
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "instant" : "smooth",
      });
    }
  };

  const footerContent = (
    <footer
      ref={footerRef}
      className={`cinematic-footer ${
        isCurtain
          ? "fixed bottom-0 left-0 w-full h-[min(850px,calc(100vh-70px))] max-h-screen flex flex-col justify-between overflow-hidden bg-surface text-ink z-0 border-t border-border"
          : "relative w-full flex flex-col justify-between overflow-hidden bg-surface text-ink pt-12 pb-6 border-t border-border"
      }`}
    >
      {/* Ambient background wash */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 wash opacity-60"
        aria-hidden="true"
      />

      {/* Marquee Banner */}
      <div className="relative w-full overflow-hidden border-y border-border/70 bg-soft/80 backdrop-blur-sm py-3 -rotate-1 scale-[1.02] shadow-xs">
        <div className="flex w-max animate-[footer-scroll-marquee_40s_linear_infinite] text-xs font-bold tracking-[0.2em] uppercase text-muted">
          <div className="flex items-center gap-8 px-4 select-none">
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <React.Fragment key={idx}>
                <span>{item}</span>
                <span className="text-primary font-bold">✦</span>
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-8 px-4 select-none" aria-hidden="true">
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <React.Fragment key={idx}>
                <span>{item}</span>
                <span className="text-primary font-bold">✦</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="footer-center relative z-10 flex flex-col items-center justify-center text-center px-4 py-6 max-w-4xl mx-auto w-full">
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-ink mb-6">
          Ready to begin?
        </h2>
        {/* Primary Action Pills */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full mb-8">
          <MagneticPill
            as="a"
            href="#/teams"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm sm:text-base font-bold bg-primary text-on-primary shadow-sm hover:bg-primary-hover transition-colors min-h-[48px] focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Find a Team
          </MagneticPill>
          <MagneticPill
            as="a"
            href="#/discover"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm sm:text-base font-bold bg-soft text-ink border border-border hover:bg-surface transition-colors min-h-[48px] focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Discover People
          </MagneticPill>
          <MagneticPill
            as="a"
            href="#/hackathons"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm sm:text-base font-bold bg-accent text-on-accent shadow-sm hover:bg-accent-hover transition-colors min-h-[48px] focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            Join Hackathons
          </MagneticPill>
        </div>

        {/* Secondary Info Pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted">
          <a
            href="#/about"
            className="px-4 py-2 rounded-full border border-border/80 bg-surface/70 hover:text-ink hover:border-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary"
          >
            About
          </a>
          <a
            href="#/privacy"
            className="px-4 py-2 rounded-full border border-border/80 bg-surface/70 hover:text-ink hover:border-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary"
          >
            Privacy Policy
          </a>
          <a
            href="#/terms"
            className="px-4 py-2 rounded-full border border-border/80 bg-surface/70 hover:text-ink hover:border-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary"
          >
            Terms of Service
          </a>
          <a
            href="#/contact"
            className="px-4 py-2 rounded-full border border-border/80 bg-surface/70 hover:text-ink hover:border-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary"
          >
            Support
          </a>
        </div>
      </div>

      {/* Giant COLLABYRD Wordmark */}
      <div
        ref={giantTextRef}
        className="footer-wordmark text-center select-none pointer-events-none"
        aria-hidden="true"
      >
        <span className="font-serif text-[clamp(2.75rem,14vw,24rem)] font-bold tracking-tight text-primary/80 leading-none inline-block whitespace-nowrap">
          COLLABYRD
        </span>
      </div>

      {/* Bottom Bar */}
      <div className="footer-credits relative z-10 container flex items-center justify-between gap-4 text-xs text-muted">
        <p className="m-0 select-none">
          © {new Date().getFullYear()} Collabyrd. Purposeful campus teammate discovery.
        </p>

        <MagneticPill
          as="button"
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface text-ink hover:bg-soft transition-colors text-xs font-semibold focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
          aria-label="Back to top"
        >
          Back to top ↑
        </MagneticPill>
      </div>
    </footer>
  );

  if (isCurtain) {
    return (
      <div
        ref={wrapperRef}
        className="relative w-full h-[min(850px,calc(100vh-70px))] max-h-screen"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        {footerContent}
      </div>
    );
  }

  return footerContent;
}

export default CinematicFooter;
