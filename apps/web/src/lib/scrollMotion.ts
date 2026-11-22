import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export interface ScrollInfraSession {
  lenis: Lenis;
  destroy: () => void;
  refresh: () => void;
}

export function initScrollInfra(): ScrollInfraSession {
  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.12,
    smoothWheel: true,
    anchors: false,
  });

  gsap.ticker.lagSmoothing(0);
  const tick = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tick);

  lenis.on("scroll", ScrollTrigger.update);

  const refresh = () => {
    ScrollTrigger.refresh();
  };

  if (typeof document !== "undefined" && document.fonts?.ready) {
    document.fonts.ready.then(refresh).catch(() => {});
  }

  let cleanMedia = () => {};
  if (typeof window !== "undefined") {
    const onWindowLoad = () => refresh();
    window.addEventListener("load", onWindowLoad, { once: true });

    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("main img"));
    const pending = imgs.filter((img) => !img.complete);
    const onImgLoad = () => refresh();
    pending.forEach((img) => {
      img.addEventListener("load", onImgLoad, { once: true });
      img.addEventListener("error", onImgLoad, { once: true });
    });

    cleanMedia = () => {
      window.removeEventListener("load", onWindowLoad);
      pending.forEach((img) => {
        img.removeEventListener("load", onImgLoad);
        img.removeEventListener("error", onImgLoad);
      });
    };
  }

  let isDestroyed = false;
  const destroy = () => {
    if (isDestroyed) return;
    isDestroyed = true;

    cleanMedia();
    gsap.ticker.remove(tick);
    lenis.destroy();

    const triggers = ScrollTrigger.getAll();
    for (let i = triggers.length - 1; i >= 0; i--) {
      triggers[i].kill(true);
    }
    ScrollTrigger.clearMatchMedia();

    if (ScrollTrigger.getAll().length !== 0) {
      console.warn("ScrollTrigger cleanup leak:", ScrollTrigger.getAll().length);
    }
  };

  return { lenis, destroy, refresh };
}

export { gsap, ScrollTrigger, Lenis };
