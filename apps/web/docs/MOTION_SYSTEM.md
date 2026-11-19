# Motion and scrolling

Goal: quiet feedback and polished hierarchy with code the student can explain. Default to CSS transitions/keyframes and one original Reveal component. The selected references inform behavior; they do not require installing every library.

## Motion tokens

| Token / use | Proposed value |
| --- | --- |
| Fast / focus, button | 150ms |
| Regular / menu, form entrance | 220ms |
| Reveal / section | 400ms |
| Hero entrance | 450ms maximum, one time |
| Ease | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Neutral transition | `ease-out` |
| Reveal distance | 12px upward; 0px reduced motion |
| Card stagger | 60ms per visible item, capped at 180ms |
| Hover lift | 2px maximum, marketing cards on hover-capable devices only |
| Observer | threshold 0.1, bottom root margin -24px; observe once |

No bounce, custom cursor, magnetic button, scroll-scrub text, 300vh pinned section, parallax footer, animated numerical claims or perpetual text effects. These would add complexity without improving team formation.

## Pattern plan

| Pattern | Implementation and trigger | Reduced-motion / failure behavior |
| --- | --- | --- |
| Hero entrance | Short whole-heading opacity/transform on mount; supporting text/CTA already readable | Immediately final state; never delay action |
| Reveal | One wrapper observes decorative/section groups; add visible class, unobserve, disconnect on cleanup | Immediate content, no observer needed |
| Card entrance | Reuse Reveal with capped CSS delay | Static grid, normal tab order |
| Hover feedback | Button background/border and link underline; decorative card lift | Color/focus remains, no lift |
| Mobile menu | Disclosure expansion; optional 220ms opacity, hidden/inert content when closed | Immediate open/close; Escape/focus unaffected |
| Form focus | Visible focus outline and border; no label disappearance | Same visible outline |
| Submit state | Replace button text with "Signing in…" / "Saving…", preserve dimensions | Text feedback; no spin required |
| Error / success | Inline Alert and first-invalid focus on submission | Immediate message; no shake, flash or success delay |
| Footer | Normal flow with optional one-time section reveal | Fully readable static footer |

All essential content starts visible. If a reveal uses an initial hidden style, apply it only after successful enhancement and only to non-focusable decorative groups; do not hide long sections/links while waiting for a callback. Focused content must never remain transparent. Catch unsupported IntersectionObserver by rendering normally. Remove every observer/listener on unmount, including StrictMode mount/unmount cycles.

## Scrolling decision

**Recommended baseline:** native touch, wheel and keyboard scroll; CSS smooth anchors only when `prefers-reduced-motion: no-preference`, with `scroll-margin-top` clearing the sticky header. Scroll behavior is enhancement: anchor targets and browser back/forward remain correct if the browser ignores smoothing. No JS scroll-progress tracker needed.

**Optional actual Lenis:** a single landing-only instance, `autoRaf` and anchors enabled, official stylesheet, destroyed on unmount. Disable CSS smoothing when Lenis is active. Nested dialogs keep their own native scroll. Bypass Lenis for reduced motion; handle preference changes without reload. Keep touch native. Verify anchors during active scrolling, sticky elements, keyboard/PageDown, focus destinations and browser restoration. Do not add GSAP just to drive Lenis.

## Vanta choice

Preferred: original static SVG network in one decorative hero panel, reflecting connections between complementary roles. A finite fade-in can add depth without maintaining a render loop.

If actual NET is explicitly selected: load Vanta and a compatible Three.js version after primary content, keep a static fallback, initialize only when eligible, and destroy on route exit/reduced motion/offscreen lifecycle as designed. Avoid type assertions to conceal compatibility problems. Disable on unsupported WebGL or tested constrained devices; do not guess that lower point counts guarantee performance. Continuous background motion requires a visible pause control, with a persistent static alternative. Measure before retaining it.

## React Bits choice

FadeContent and BlurText provide the reference for paced entrances. The currently inspected sources import different engines (GSAP/ScrollTrigger and Motion respectively). Original opacity/transform equivalents are recommended for this project's simple-code requirement. Do not claim the installed component is React Bits when it is only inspired by it. If source is reused later, keep attribution and record its exact dependencies/version/changes.

## Auth transition sequence

On login/register navigation: update route title → focus page heading/main → show form immediately → optional visual-rail entrance. Preserve entered values on validation/server failure. Visibility toggle works without submitting. On successful login use authoritative session status to route to verification, onboarding or dashboard. On pending submit prevent duplicate requests; cancel animation without canceling feedback. Network failure never shows a success celebration.

Verification: keyboard through animated pages, reduced-motion system setting before load and changed live, repeated navigation/StrictMode cleanup, mobile scroll, slow-device recording, missing observer/WebGL fallback. See T17 in [QUALITY_PLAN.md](QUALITY_PLAN.md).
