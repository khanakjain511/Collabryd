# Research and applicability

Reviewed: 18 November 2026. Primary-source guidance informs proposals; it does not establish implementation, legal compliance, accessibility conformance or production performance. Current documentation may differ from installed packages; recheck the actual installed version when adopting a dependency.

## Local sources

| Source | Evidence and consequence |
| --- | --- |
| Product blueprint, all 15 pages | Proposed one-campus MVP, explicit permissions, states, REST sketch and open policy decisions. Preserve Vite instead of assuming its suggested Next.js stack is mandatory |
| Supplied Monarque analysis, entire document | Reference hierarchy, fine borders, collage, scroll theater and form styling. Adapt composition while discarding pinned reading/parallax/ceremonial loader |
| Supplied master brief, entire document | Planning/design/handoff expectations and proposed documentation structure. Consolidate related documents; no implementation performed |
| `apps/web/package.json`, entry, App, CSS, TS/Vite/ESLint config, index.html | React/Vite starter; minimal runtime dependencies, existing ordinary CSS, no actual product implementation |
| Root AGENTS.md | Installed turbo docs must precede any turbo config/command changes. This task needs neither; no turbo invocation made |

## Requested visual sources

| Primary source | Reviewed detail | Collabyrd decision and trade-off |
| --- | --- | --- |
| [Vanta README](https://github.com/tengbao/vanta/blob/master/README.md) and [NET source](https://github.com/tengbao/vanta/blob/master/src/vanta.net.js) | Background renderer lifecycle and network nodes/lines; configurable effect; explicit cleanup | Prefer original fixed SVG network to keep the code understandable. Actual WebGL optional, not installed, requires compatible Three.js and measured fallback |
| [Lenis README](https://github.com/darkroomengineering/lenis/blob/main/README.md) | Initialization/stylesheet, anchor option, destroy lifecycle, React support | Native anchors/CSS first. A single actual Lenis instance is possible if smooth wheel inertia is specifically chosen; cleanup and reduced-motion bypass required |
| [React Bits Blur Text docs](https://reactbits.dev/text-animations/blur-text) | Soft text entrance and TypeScript/plain CSS choices | Take restrained pacing; whole-text entrance avoids elaborate word/letter animation |
| [FadeContent source](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Animations/FadeContent/FadeContent.tsx), [BlurText source](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/TextAnimations/BlurText/BlurText.tsx) | First 80 lines of each verified imports: GSAP/ScrollTrigger for FadeContent and Motion for BlurText | Do not describe them as zero-dependency. Original CSS/observer equivalents avoid multiple engines |
| [React Bits license](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) | Current MIT plus Commons Clause conditions distinguish app use from redistribution of components themselves | No code copied in planning. Preserve notices and inspect exact source license if reusing component code later |
| [Originkit functional catalog](https://www.originkit.dev/functional), [Label Input inspector](https://www.originkit.dev/functional/label-input) | Browser verified named Label Input example with rounded outlined field, icon and focusable input; screenshot visually reviewed | Borrow rounded field composition, add persistent native label and accessible error text. Export/source/terms not retrieved; do not claim source adoption |

No repository clone, package install or website source execution was needed. GitHub connector reads supported component-source inspection; Originkit required read-only browser fallback after text extraction yielded no useful content.

## Engineering, accessibility and performance

| Primary source | Relevant guidance | Application / alternatives considered |
| --- | --- | --- |
| [React: Thinking in React](https://react.dev/learn/thinking-in-react) | Component hierarchy and deliberate state ownership | Page owns loading/filter/form state, children receive props; avoid global store and duplicated derived state |
| [React: error boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) | Render failures need a boundary, separate from ordinary async errors | One root boundary when implementing product app; small class is a documented native-API exception, no boundary library needed |
| [React Router declarative installation](https://reactrouter.com/start/declarative/installation) | Declarative navigation and routes fit an existing React client | Proposed when multi-page work begins; no framework migration or custom history router |
| [Vite features](https://vite.dev/guide/features) | Existing app supports ordinary CSS and module imports | Retain toolchain; consider lazy imports only where payload reduction justifies them |
| [MDN IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) | Visibility callbacks without a hand-rolled scroll polling loop | One original Reveal component; cannot replace continuous scroll-scrubbing where that is actually needed, which MVP avoids |
| [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) | Detect user's preference for reduced non-essential movement | CSS/static fallback; destroy any optional JS enhancement when preference changes |
| [MDN scroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior) | Native smoothing for navigation/programmatic scrolling | Anchors can improve section travel; do not misrepresent it as Lenis-like wheel inertia |
| [Motion reduced motion](https://motion.dev/docs/react-use-reduced-motion) | React-specific preference hook | Considered for complex component motion; unnecessary dependency for proposed CSS effects |
| [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()) | Scrubbing/pinning and media-dependent cleanup | Appropriate for elaborate scenes; not needed for short one-time reveals; do not use deprecated ScrollTrigger.matchMedia |
| [MDN client form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) | Native constraints improve feedback; client validation is bypassable | Plain validation functions plus server errors; no schema/form framework at current scope |
| [MDN autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete) | Identify name/email/current/new password purposes | Password manager-friendly auth; allow paste, no custom challenge to remember passwords |
| [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) | Native modal behavior and focus semantics | Use for report/confirm; test initial and restored focus, Escape and overflow rather than invent modal framework |
| [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) | Explain errors and connect guidance to inputs | Inline errors, summary, focus handling and live status; no shake-only feedback |
| [WCAG 2.2 reference](https://www.w3.org/WAI/WCAG22/quickref/) | Contrast, keyboard, focus, reflow, input identification and target size | Specific acceptance checks in QUALITY_PLAN; standards target, not a conformance claim |
| [Web Vitals](https://web.dev/articles/vitals) | LCP/INP/CLS thresholds and field measurement | Set measurable targets, distinguish local lab checks from 75th-percentile field evidence |
| [MDN img](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img) | Intrinsic sizing, responsive image attributes and loading | Reserve image space, eager hero when LCP, lazy below-fold and responsive local derivatives |

## Decisions produced

Keep React/Vite/ordinary CSS; favor native controls, local state and named fetch functions. Select small equivalents of reference effects, with explicit actual-library alternatives. Keep sensitive policy and server authorization with backend owners. Palette selection and evidence are recorded in [DECISIONS.md](DECISIONS.md); performance and accessibility remain verification work after implementation.
