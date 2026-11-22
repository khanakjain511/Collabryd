import { useEffect, useRef } from "react";
import { useAppearance } from "../hooks/useAppearance";

// One identity: draw the mark, lift the word, then dock it into the real header.
export function Preloader({ onComplete }: { onComplete: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useAppearance();
  useEffect(() => {
    if (reducedMotion) { onComplete(); return; }
    const root = ref.current;
    if (!root) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    root.querySelector('button')?.focus();
    const word = root.querySelector<HTMLElement>('.arrival-word')!;
    const mark = root.querySelector<SVGElement>('svg')!;
    const animations: Animation[] = [];
    let cancelled = false;
    async function play() {
      animations.push(mark.animate([{opacity:0, transform:'scale(.8)'},{opacity:1, transform:'scale(1)'}], {duration:650,fill:'both',easing:'ease-out'}));
      const rise = word.animate([{transform:'translateY(150%)',opacity:0},{transform:'translateY(0)',opacity:1}], {delay:450,duration:850,fill:'both',easing:'cubic-bezier(.2,.8,.2,1)'});
      animations.push(rise);
      try {
        await rise.finished;
        if (cancelled) return;
        const target = document.querySelector<HTMLElement>('header .logo');
        const targetWord = target?.querySelector('span') ?? target;
        const a = word.getBoundingClientRect(), b = targetWord?.getBoundingClientRect();
        if (b) animations.push(word.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${b.left-a.left}px,${b.top-a.top}px) scale(${b.width/a.width})`}],{duration:850,fill:'forwards',easing:'cubic-bezier(.65,0,.15,1)'}));
        animations.push(mark.animate([{opacity:1},{opacity:0}],{duration:400,fill:'forwards'}));
        const exit = root!.animate([{backgroundColor:'var(--color-canvas)'},{backgroundColor:'transparent'}],{delay:650,duration:450,fill:'forwards'});
        animations.push(exit); await exit.finished;
        if (!cancelled) onComplete();
      } catch { /* Animation cancelled on skip or navigation. */ }
    }
    void play();
    return () => { cancelled = true; animations.forEach(a=>a.cancel()); document.body.style.overflow=previous; };
  }, [onComplete,reducedMotion]);
  if (reducedMotion) return null;
  return <div ref={ref} className="arrival-screen" role="dialog" aria-modal="true" aria-label="Welcome to Collabyrd" onKeyDown={e=>{if(e.key==='Escape')onComplete();if(e.key==='Tab'){e.preventDefault();ref.current?.querySelector('button')?.focus();}}}>
    <svg viewBox="0 0 34 34" width="80" height="80" aria-hidden="true"><path d="M5 5c10 0 16 4 16 12C11 17 5 13 5 5ZM29 29c-10 0-16-4-16-12 10 0 16 4 16 12ZM29 5c0 10-4 16-12 16C17 11 21 5 29 5Z" fill="none" stroke="currentColor" strokeWidth=".8" pathLength="1" /></svg>
    <span className="arrival-word">collabyrd.</span>
    <button type="button" onClick={onComplete}>Skip intro ↗</button>
  </div>;
}
