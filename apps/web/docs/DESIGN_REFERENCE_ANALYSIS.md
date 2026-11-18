# Reference-to-Collabyrd mapping

## Evidence boundaries

Monarque observations come from the supplied `monarque_design_thinking_analysis.md`, not a new live-source audit. Vanta/Lenis READMEs and React Bits TypeScript component excerpts were reviewed live on 18 November 2026. Originkit's functional catalog and Label Input inspector were viewed in the browser because text-only extraction was empty. Nothing from these sources was installed or copied into application code.

## Monarque: retain the composition, adapt the interaction

| Reference section | Purpose, layout and visual model | Reference interaction / motion | Collabyrd translation | Components | Disposition |
| --- | --- | --- | --- | --- | --- |
| Brand preloader | Branded ceremonial first impression; SVG crest | Drawing/loading sequence | Render usable page immediately; only show loaders for actual data work | LoadingState | Remove blocking ceremony |
| Adaptive header | Thin-line navigation and persistent CTA | Hides down-scroll, returns up-scroll; full mobile overlay | Simple sticky header, visible campus/signup path; mobile disclosure menu | SiteHeader, MobileNavigation | Adapt; skip direction-tracking logic |
| Hero collage | Oversized editorial heading surrounded by five event images | Staggered entrance | Clear teammate promise, one editorial campus photo and fictional role/team cards; restrained network graphic | Hero, PersonCard, TeamCard, HeroNetwork | Adapt |
| About/founder | Manifesto and portrait; pinned 300vh composition | Scroll-scrub word reveal; biography modal | Short problem statement in natural document flow; student need replaces founder authority | Section, Reveal | Adapt; remove pinning/modal |
| Services matrix | Four bordered columns with outcome-based copy | Light hover/entrance feedback | Profile, discovery, recruitment, event cards in responsive grid | FeatureGrid, FeatureCard | Retain hierarchy and fine dividers |
| Portfolio carousel | Tactile images, gallery/lightbox | Drag/inertia, keyboard arrows | Team/event examples in readable grid; optional native horizontal scroll only if needed | TeamCard, EventCard | Adapt; no drag-only interaction |
| Heritage venue | Physical exclusivity and compact factual badges | Info tooltip | Explain campus eligibility and visible recruitment state; no invented institutional endorsement | TrustSection, StatusBadge | Reinterpret; remove venue imagery/claims |
| Consultation form | Carefully spaced qualifying fields | Radio feedback, modal submission | Clearly labeled registration/onboarding, inline errors and meaningful states | FormField, PasswordInput, ProfileForm | Adapt; keep actual account journey simple |
| Footer curtain | Dark editorial close, social/contact links | Parallax reveal behind content | Teal final CTA and normal-flow footer with real routes | FinalCTA, SiteFooter | Adapt; remove fixed/parallax positioning |
| Agency easter egg | Hidden creator interaction | Keyboard shortcut scroll | No counterpart needed | None | Remove |
| Privacy | Readable policy hierarchy and controls | Consent/preferences | Policy page based on Collabyrd's actual data handling; owner-supplied legal content | ContentPage | Retain readability; do not copy foreign policy claims |

Preserve: hierarchy, measured section rhythm, subtle borders, clear persistent actions and coherent motion timing. Reinterpret luxury-event imagery and dramatic typography for a welcoming student product. Avoid burgundy, proprietary typefaces/assets, forced reading speed, decorative loaders, custom cursors and hidden shortcuts.

## Four requested references: concrete selections

| Source | Selected element | Planned location | Simplest recommended implementation | Actual-library alternative / cost |
| --- | --- | --- | --- | --- |
| [Vanta](https://github.com/tengbao/vanta) | NET's connected-point metaphor | Hero's decorative visual panel | Small original SVG with a fixed set of nodes/lines; optional single short CSS fade; no physics | Vanta NET + compatible Three.js, lazy initialization and destroy cleanup; WebGL and mobile/compatibility testing required |
| [Lenis](https://github.com/darkroomengineering/lenis) | Consistent smooth anchor travel | Public landing section navigation | Native anchors + CSS `scroll-behavior`, `scroll-margin-top`; native touch/wheel scrolling | One route-scoped Lenis instance with anchors enabled, stylesheet, cleanup, reduced-motion bypass; do not combine two scroll engines |
| [React Bits](https://github.com/DavidHDev/react-bits) | FadeContent's reveal and BlurText's measured headline entrance | Below-fold sections, one hero heading | Original `Reveal` wrapper using IntersectionObserver + opacity/12px translation; headline uses readable whole-text CSS entrance | Current inspected FadeContent imports GSAP/ScrollTrigger; BlurText imports Motion. Copying both adds multiple engines and a larger explanation burden |
| [Originkit Label Input](https://www.originkit.dev/functional/label-input) | Rounded field surface, icon alignment and refined focus | Login/register and profile fields | Native input with persistent `<label>`, padding, border and `:focus-within`; simple icon is decorative | Code export/terms not retrieved. Use as visual inspiration; do not assert its exported code is dependency-free or licensed for copying |

These are proposals for incorporating each reference, not claims that a dependency has been integrated. The user's simplicity requirement favors original, small equivalents. If the user explicitly wants the actual Vanta/Lenis packages, select that option before dependency installation; do not silently substitute and describe it as the original library.

## Unified identity

Selected palette: Midnight Teal + Warm Ivory, per the user's delegated preference. Use generous ivory space, deep readable teal text, fine borders, warm amber highlights and approachable typography. The product interface stays compact and clear; marketing sections can use larger type. Feature labels and application states should remain static and readable.

Hero content stays visible from initial render. Animations never delay a click, move a focused control, hide critical text, or make a form error depend on color. No image or animation is evidence of actual user activity.
