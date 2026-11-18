# Accessibility, performance and testing

This is a verification plan. No application test, build, accessibility audit or performance run was executed in this documentation-only phase. Palette base-pair contrast and documentation consistency were checked separately.

## Accessibility contract

Target WCAG 2.2 AA. A short checklist does not prove conformance; combine browser checks, assistive technology and automated checks for the finished scope.

- Semantic header/nav/main/footer, one h1, logical headings, skip link, route titles/focus updates. DOM reading order matches visual order.
- Keyboard reaches every action; closed menus contain no reachable hidden controls. Escape closes dialog/menu, focus returns to trigger, native modal keeps focus inside.
- Body text at least 4.5:1 contrast; large text at least 3:1; meaningful control boundaries/focus indicators 3:1 against adjoining colors. No color-only errors, status, selection or availability.
- Persistent labels, autocomplete, descriptive hints and programmatically connected errors. Submit focuses first invalid control and announces summary; do not announce every keystroke. Paste/password managers allowed.
- Design 44px control targets where practical; verify WCAG 2.2 target-size requirements (24×24 CSS px minimum or applicable spacing/exceptions), focus visibility and unobscured focus. Maintain content at 320px/reflow and zoom.
- Native selects, checkboxes, radio groups, details/summary, dialog. Avoid custom widgets whose keyboard model the student would have to recreate.
- Reduced motion before load and changed live; text/actions remain available; no forced scroll pacing or interaction during a blocking animation.
- Images carry contextual alt or decorative empty alt; decorative SVG hidden from assistive technology. No synthetic identity presented as a real student.
- Dynamic status uses polite announcements; blocking error uses alert thoughtfully. No vanished message as the only record of a request failure.

Sources: [WCAG 2.2 reference](https://www.w3.org/WAI/WCAG22/quickref/), [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/), [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).

## Performance plan

Web Vitals targets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile of field visits, separated by mobile/desktop. Local Lighthouse and browser traces are useful lab diagnostics, not proof of field INP or percentile outcomes. See [Web Vitals](https://web.dev/articles/vitals).

Proposed budgets: public initial JS ≤150KB gzip; initial stylesheet ≤30KB gzip; hero photo ≤180KB; optional story photo ≤140KB. Measure actual build output, document budget exceptions, and remove decorative work first. These limits are project goals, not claims about current bundle sizes.

- Keep Vite/React; no multiple animation engines for one page. Do not import entire component registries.
- Prefer transforms/opacity; no layout reads in every scroll event or state updates on every frame.
- Reserve image/card space, avoid icon/font shifts and loading placeholders with mismatched size. System fonts avoid a font download dependency.
- Eager hero/LCP asset, lazy below-fold images. Responsive sources keep mobile payload smaller.
- Paginate directory data. Cancel stale fetches; preserve responsive input during searches. Introduce a small debounce only if API traffic actually requires it.
- Lazy-load optional route/visual code only when it materially reduces initial payload; don't scatter dynamic imports across every tiny component.
- Evaluate optional WebGL against baseline, using slow mobile simulation and representative hardware. Retain static fallback if it fails budgets.
- Test production build, not only Vite development. Record browser/version, viewport, hardware/throttling, cache state, route and repeated-run results.

## Scenario matrix

| ID | Scenario / meaningful assertion | Local fixture coverage | Live backend evidence needed |
| --- | --- | --- | --- |
| T01 | Guest/pending → direct private URL; no private data displayed/fetched; verify status routes correctly | Guard rendering/session fixtures | API refuses private reads without active verification |
| T02 | Fill required profile, skip optional links, save/reload roles/skills; invalid URL field feedback | Form behavior and mock refresh semantics | Persist/reload actual profile, ownership validation |
| T03 | Combine filters/page, no results, reset, detail/back; stale response doesn't overwrite newer query | Filter UI and deterministic fixtures | Server matches allowed scope and actual query semantics |
| T04 | Create team; leader included in member count; required roles/capacity visible | Draft/pending/failure/success UI | Creator membership and eligible publication persisted |
| T05 | Join request pending → cancelled/accepted/rejected/expired; duplicate action handled | Service scenario errors, status labels | Server enforces one pending request and state transitions |
| T06 | Student vs leader review; member removal/leader departure safe | Permissions in UI, confirmation/cancel paths | Direct unauthorized mutations rejected, leader invariant/audit |
| T07 | Two leaders' actions on last slot; one succeeds, loser sees conflict/refreshed full team | 409 UI behavior only | Concurrent server accept test proves capacity invariant |
| T08 | Invitation accept/decline/expired/revoked; full team conflict | All invitation UI states | Eligibility/expiry/capacity validated atomically |
| T09 | Event zone/deadline, external URL label and link; team association not registration | Date display/link behavior | Published data/source provenance/visibility and persistence |
| T10 | Correct notification item/read state/destination | Render/action/error/empty | Recipient isolation, persisted read state and event delivery |
| T11 | Report submit/error/receipt; admin review resolves | Dialog keyboard, form/state views | Report reaches real queue; RBAC and audit enforced |
| T12 | Hide profile/change contact visibility and block | Settings/UI transitions | Unauthorized fields absent from network responses, block honored |
| T13 | Change resource IDs/campus-related query inputs; student opens admin URL | Safe access UI only | Server authorization and campus isolation negative tests |
| T14 | Session expiry/suspension/logout clears private state; deletion request honest | UI access/refresh behavior | Session revocation, lifecycle/retention actually enforced |
| T15 | Landing CTA → register; section anchors/menu/footer paths; no dead link | Browser navigation | Production deep links/hosting rewrite |
| T16 | Keyboard forms/dialog/menu, screen-reader labels/errors, reflow/zoom, contrast, image fallback | Browser/manual + available axe | Real integrated error flows also accessible |
| T17 | Reduced motion before/live; repeated route mount cleanup; animation disabled/unsupported APIs | Browser preferences and fallback simulation | Optional actual library version/hardware regression |
| T18 | Production build payload/trace/mobile performance and image layout stability | Local lab diagnostics | Field data after privacy-approved deployment |

## Practical test tooling

Start with existing TypeScript/Vite build plus purposeful browser walkthroughs after code changes. Do not add test packages merely to test static copy or duplicate implementation. For state-heavy services/forms, propose Vitest + Testing Library; for critical journeys propose Playwright E2E and axe. Their installation affects the workspace lockfile and requires the appropriate scope. No test runner is installed/configured by this plan.

Mock tests must explicitly say "mock". The highest-value integrated journey is register → verify → profile → team request → leader accepts → membership and notification update. Authorization/capacity concurrency tests belong to backend integration ownership even though the frontend displays their outcomes.

## Release checks after implementation

Run frontend `pnpm build` from `apps/web`; inspect every error and actual output. Use existing lint when required by workflow or requested. Then navigate all implemented routes, refresh detail URLs, test back/forward and unknown route, mobile menu, real form failure and success, reduced motion, keyboard and narrow/zoom views. Check Chrome/Firefox/Safari where available; state untested browsers explicitly.

Capture wide and narrow screenshots for layout review and check focus/error/empty states as well as the happy path. Source-only review cannot certify visual quality. Update PROGRESS with exact commands, executed results, environment and unresolved limitations; do not mark a live integration test complete based on a demo.
