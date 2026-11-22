import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useAppearance } from "../hooks/useAppearance";
import { canAnimate } from "../lib/motion";
import { Logo } from "./ui";

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link?: string;
  onClick?: () => void;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  isFixed?: boolean;
  accentColor?: string;
  closeOnClickAway?: boolean;
  isOpen?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  children?: React.ReactNode;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = "right",
  colors = ["var(--color-sage)", "var(--color-primary)"],
  items = [],
  socialItems = [
    { label: "Find People", link: "#/discover" },
    { label: "Explore Teams", link: "#/teams" },
    { label: "Hackathons", link: "#/hackathons" },
  ],
  displaySocials = true,
  displayItemNumbering = true,
  className = "",
  isFixed = true,
  accentColor = "var(--color-accent)",
  closeOnClickAway = true,
  isOpen: controlledIsOpen,
  onMenuOpen,
  onMenuClose,
  triggerRef,
  children,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const open = isControlled ? controlledIsOpen : internalOpen;
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const { reducedMotion } = useAppearance();
  const allowMotion = canAnimate(reducedMotion);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);

  const textInnerRef = useRef<HTMLSpanElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);

  const setOpen = useCallback(
    (nextState: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextState);
      }
      if (nextState) {
        onMenuOpen?.();
      } else {
        onMenuClose?.();
      }
    },
    [isControlled, onMenuOpen, onMenuClose]
  );

  const animateIcon = useCallback(
    (opening: boolean) => {
      const h = plusHRef.current;
      const v = plusVRef.current;
      if (!h || !v) return;

      if (!allowMotion) {
        gsap.set(h, { rotate: opening ? 45 : 0 });
        gsap.set(v, { rotate: opening ? -45 : 90 });
        return;
      }

      if (opening) {
        gsap.to(h, { rotate: 45, duration: 0.35, ease: "power3.out" });
        gsap.to(v, { rotate: -45, duration: 0.35, ease: "power3.out" });
      } else {
        gsap.to(h, { rotate: 0, duration: 0.25, ease: "power3.inOut" });
        gsap.to(v, { rotate: 90, duration: 0.25, ease: "power3.inOut" });
      }
    },
    [allowMotion]
  );

  const animateText = useCallback(
    (opening: boolean) => {
      const inner = textInnerRef.current;
      if (!inner) return;

      if (!allowMotion) {
        gsap.set(inner, { yPercent: opening ? -50 : 0 });
        return;
      }

      gsap.to(inner, {
        yPercent: opening ? -50 : 0,
        duration: 0.35,
        ease: "power3.out",
      });
    },
    [allowMotion]
  );

  const playOpen = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    closeTweenRef.current = null;

    const itemEls = Array.from(panel.querySelectorAll<HTMLElement>("[data-menu-label]"));
    const numberEls = Array.from(panel.querySelectorAll<HTMLElement>("[data-menu-num]"));
    const socialTitle = panel.querySelector<HTMLElement>("[data-socials-title]");
    const socialLinks = Array.from(panel.querySelectorAll<HTMLElement>("[data-socials-link]"));

    const offscreen = position === "left" ? -100 : 100;

    if (!allowMotion) {
      gsap.set([panel, ...layers], { xPercent: 0 });
      if (itemEls.length) gsap.set(itemEls, { yPercent: 0, rotate: 0 });
      if (numberEls.length) gsap.set(numberEls, { opacity: 1 });
      if (socialTitle) gsap.set(socialTitle, { opacity: 1 });
      if (socialLinks.length) gsap.set(socialLinks, { y: 0, opacity: 1 });
      busyRef.current = false;
      return;
    }

    if (itemEls.length) gsap.set(itemEls, { yPercent: 120, rotate: 6 });
    if (numberEls.length) gsap.set(numberEls, { opacity: 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 20, opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        busyRef.current = false;
      },
    });

    layers.forEach((layer, i) => {
      tl.fromTo(
        layer,
        { xPercent: offscreen },
        { xPercent: 0, duration: 0.45, ease: "power4.out" },
        i * 0.06
      );
    });

    const panelStartTime = layers.length ? (layers.length - 1) * 0.06 + 0.06 : 0;
    tl.fromTo(
      panel,
      { xPercent: offscreen },
      { xPercent: 0, duration: 0.55, ease: "power4.out" },
      panelStartTime
    );

    if (itemEls.length) {
      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 0.65, ease: "power4.out", stagger: 0.06 },
        panelStartTime + 0.1
      );
      if (numberEls.length) {
        tl.to(
          numberEls,
          { opacity: 1, duration: 0.4, ease: "power2.out", stagger: 0.05 },
          panelStartTime + 0.15
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsTime = panelStartTime + 0.25;
      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.35 }, socialsTime);
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.05 },
          socialsTime + 0.05
        );
      }
    }

    openTlRef.current = tl;
  }, [allowMotion, position]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === "left" ? -100 : 100;

    if (!allowMotion) {
      gsap.set(all, { xPercent: offscreen });
      busyRef.current = false;
      return;
    }

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.28,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll<HTMLElement>("[data-menu-label]"));
        if (itemEls.length) gsap.set(itemEls, { yPercent: 120, rotate: 6 });
        busyRef.current = false;
      },
    });
  }, [allowMotion, position]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      setOpen(false);
      playClose();
      animateIcon(false);
      animateText(false);
      const trigger = triggerRef?.current || toggleBtnRef.current;
      if (trigger?.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    }
  }, [setOpen, playClose, animateIcon, animateText, triggerRef]);

  // Initial layout & layer capture
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const textInner = textInnerRef.current;

      if (!panel || !plusH || !plusV || !textInner) return;

      let layers: HTMLElement[] = [];
      if (preContainer) {
        layers = Array.from(preContainer.querySelectorAll<HTMLElement>("[data-prelayer]"));
      }
      preLayerElsRef.current = layers;

      const offscreen = position === "left" ? -100 : 100;
      gsap.set([panel, ...layers], { xPercent: offscreen });

      gsap.set(plusH, { rotate: 0 });
      gsap.set(plusV, { rotate: 90 });
      gsap.set(textInner, { yPercent: 0 });
    }, containerRef);

    return () => ctx.revert();
  }, [position]);

  // Sync animation when open state changes externally
  useEffect(() => {
    if (open) {
      playOpen();
      animateIcon(true);
      animateText(true);
    } else {
      playClose();
      animateIcon(false);
      animateText(false);
    }
  }, [open, playOpen, playClose, animateIcon, animateText]);

  // Body scroll lock & Escape key & hashchange
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
      }
      // Focus trapping
      if (e.key === "Tab" && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    const handleHashChange = () => {
      closeMenu();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("hashchange", handleHashChange);

    // Initial focus on open
    const timer = setTimeout(() => {
      if (panelRef.current) {
        const first = panelRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        first?.focus();
      }
    }, 50);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("hashchange", handleHashChange);
      clearTimeout(timer);
    };
  }, [open, closeMenu]);

  // Pointerdown outside handler
  useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const panel = panelRef.current;
      const toggle = triggerRef?.current || toggleBtnRef.current;
      const target = event.target as Node;
      if (panel && !panel.contains(target) && (!toggle || !toggle.contains(target))) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeOnClickAway, open, closeMenu, triggerRef]);

  return (
    <div
      ref={containerRef}
      className={`z-50 ${isFixed ? "fixed inset-0 w-full h-full overflow-hidden" : "w-full h-full"} ${
        !open ? "pointer-events-none" : ""
      } ${className}`.trim()}
      aria-hidden={!open}
    >
      {/* Background Underlay Backdrop */}
      <div
        className={`fixed inset-0 bg-ink/30 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
        onClick={closeMenu}
      />

      {/* Staggered Underlay Pre-layers */}
      <div
        ref={preLayersRef}
        className={`absolute top-0 bottom-0 pointer-events-none z-10 w-full sm:w-[clamp(280px,85vw,480px)] ${
          position === "left" ? "left-0" : "right-0"
        }`}
        aria-hidden="true"
      >
        {colors.map((c, i) => (
          <div
            key={i}
            data-prelayer
            className="absolute inset-0 w-full h-full"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Main Slide Panel */}
      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        inert={!open ? true : undefined}
        className={`absolute top-0 bottom-0 flex flex-col z-20 w-full sm:w-[clamp(280px,85vw,480px)] bg-surface text-ink shadow-2xl overflow-y-auto p-6 sm:p-10 ${
          position === "left" ? "left-0" : "right-0"
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-border">
          <Logo />
          <button
            ref={toggleBtnRef}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-border bg-soft text-ink hover:bg-surface min-h-[44px] min-w-[44px] cursor-pointer transition-colors"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <span
              ref={textInnerRef}
              className="inline-flex flex-col h-[1em] overflow-hidden leading-none font-medium"
              aria-hidden="true"
            >
              <span className="block h-[1em]">Close</span>
              <span className="block h-[1em]">Menu</span>
            </span>
            <span
              ref={iconRef}
              className="relative w-3.5 h-3.5 shrink-0 inline-flex items-center justify-center"
              aria-hidden="true"
            >
              <span
                ref={plusHRef}
                className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-xs -translate-x-1/2 -translate-y-1/2 rotate-45"
              />
              <span
                ref={plusVRef}
                className="absolute left-1/2 top-1/2 w-full h-[2px] bg-current rounded-xs -translate-x-1/2 -translate-y-1/2 -rotate-45"
              />
            </span>
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 flex flex-col justify-center py-8">
          <ul
            className="list-none m-0 p-0 flex flex-col gap-4 sm:gap-6"
            role="list"
          >
            {items.map((it, idx) => (
              <li
                key={it.label + idx}
                className="relative overflow-hidden leading-tight"
              >
                {it.onClick ? (
                  <button
                    type="button"
                    onClick={() => {
                      it.onClick?.();
                      closeMenu();
                    }}
                    aria-label={it.ariaLabel}
                    className="group relative flex items-baseline gap-3 text-left w-full bg-transparent border-0 p-0 cursor-pointer text-ink hover:text-primary transition-colors"
                  >
                    {displayItemNumbering && (
                      <span
                        data-menu-num
                        className="text-xs sm:text-sm font-mono text-muted group-hover:text-primary transition-colors select-none"
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    )}
                    <span
                      data-menu-label
                      className="font-serif text-[clamp(1.75rem,7vw,3.25rem)] font-bold tracking-tight leading-none break-words"
                    >
                      {it.label}
                    </span>
                  </button>
                ) : (
                  <a
                    href={it.link || "#"}
                    onClick={closeMenu}
                    aria-label={it.ariaLabel}
                    className="group relative flex items-baseline gap-3 text-left text-ink hover:text-primary transition-colors"
                  >
                    {displayItemNumbering && (
                      <span
                        data-menu-num
                        className="text-xs sm:text-sm font-mono text-muted group-hover:text-primary transition-colors select-none"
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    )}
                    <span
                      data-menu-label
                      className="font-serif text-[clamp(1.75rem,7vw,3.25rem)] font-bold tracking-tight leading-none break-words"
                    >
                      {it.label}
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Socials / Extra Links Section */}
        {displaySocials && socialItems && socialItems.length > 0 && (
          <div className="mt-auto pt-6 border-t border-border flex flex-col gap-3">
            <h3
              data-socials-title
              className="text-xs font-semibold uppercase tracking-wider text-muted"
              style={{ color: accentColor }}
            >
              Quick Destinations
            </h3>
            <ul className="list-none m-0 p-0 flex flex-wrap items-center gap-3" role="list">
              {socialItems.map((s, i) => (
                <li key={s.label + i}>
                  <a
                    data-socials-link
                    href={s.link}
                    onClick={closeMenu}
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-soft text-ink hover:bg-primary hover:text-on-primary transition-colors min-h-[36px]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Children Actions (e.g. Sign up / Theme toggle) */}
        {children && <div className="pt-6 mt-4 border-t border-border">{children}</div>}
      </aside>
    </div>
  );
};

export default StaggeredMenu;
