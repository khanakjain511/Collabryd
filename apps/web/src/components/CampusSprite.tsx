import { lazy, Suspense, useState, type ComponentType } from "react";
import { useAppearance } from "../hooks/useAppearance";
// Originkit renderer with a React StrictMode cleanup compatibility fix.
const sprites = import.meta.glob<{ default: ComponentType<{ background: string; follow: "page" }> }>("./originkit/ui/cobalt-sprite.tsx");
const CobaltSprite = lazy(sprites["./originkit/ui/cobalt-sprite.tsx"]);

export function CampusSprite() {
  const [visible, setVisible] = useState(true);
  const { reducedMotion } = useAppearance();
  if (!visible || reducedMotion) return null;
  return (
    <aside className="campus-sprite" aria-label="Cobalt campus companion">
      <button type="button" onClick={() => setVisible(false)} aria-label="Hide campus companion">×</button>
      <div aria-hidden="true" className="sprite-frame">
        <Suspense fallback={null}><CobaltSprite background="#070c0b" follow="page" /></Suspense>
      </div>
    </aside>
  );
}
