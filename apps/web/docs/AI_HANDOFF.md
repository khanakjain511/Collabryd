## Latest instruction and local revision — 19 November 2026

**Do not stage, commit or push until the user explicitly instructs again.** They rejected the initial indigo/card-led visual direction, requested multiple photographs closer to Monarque's editorial craft, and then requested another color change. `5236bc1` was pushed before that restriction and remains the last published commit. All subsequent presentation, motion, image, font and documentation changes are local and uncommitted. Leave the user's root PDF and supplied `skills/` folder untouched.

Current direction: midnight navy, warm ivory, a muted copper accent; Manrope body + locally hosted Instrument Serif display. Three photographic hero moments; a larger generated campus story photograph; photographic account/navigation panels. Preserve existing hash routing, demo state hooks, filters, validation, team/profile/event/admin actions and frontend-only boundaries. A dependency-only root lockfile update was explicitly permitted earlier; no other root/backend edits are allowed.

`styles/experience.css` holds public interaction/layout styles; `styles/editorial.css` supplies the photographic composition and final palette refinements. `Appearance` and `useAppearance` manage local theme/motion preferences. `Preloader` supplies a once-per-tab logo/name reveal with Skip/Escape, a short timeout and reduced-motion bypass. `TeamWorld` is one below-fold original Three scene inspired by Vanta NET; dynamic import starts only near the scene, interactive HTML/SVG remains the fallback. ScrollTrigger controls its camera; no idle GPU rendering. Lenis is landing-only, with native touch and CSS scroll-margin clearance for anchors. Native modal dialogs preserve focus/scroll behavior for menu and auth. Read PROGRESS for checks and IMAGE_STRATEGY for sources/licenses/prompt.

The frontend remains a fictional local demo; no backend, real auth, emails, event registration or secure campus authorization. Do not claim a deployed or production-ready service.

> Refinement in progress, 19 November 2026: the user approved the targeted plan and permitted the dependency-only root lockfile update. Read the newest PROGRESS/DECISIONS entries before the older completed-demo account below. Theme foundations are being committed first; public navigation, landing and auth changes are a separate working slice. Preserve the untracked user product PDF and supplied `skills/` folder. Do not stage those files incidentally. Backend scope is unchanged.

# Collabyrd frontend handoff

Updated: 18 November 2026. **Implementation is approved and a frontend demo is built.** Read this, FRONTEND_STATUS.md, PROGRESS.md, ROADMAP.md, CHECKLIST.md and DECISIONS.md, then inspect actual source and git status. Earlier planning specifications are prospective; this file and PROGRESS describe current implementation.

## User instructions

The user wants simple code they can explain, adapted ideas from Vanta, Lenis, React Bits and Originkit, and a premium/convenient/eye-friendly appearance. They delegated palette choice: Midnight Teal + Warm Ivory. They explicitly replied "Build the frontend now". Later they requested an `Akshay` branch and interval commits. The branch has been created and pushed to origin after a subsequent explicit user request. Commit/push future authorized work in logical intervals. Leave the pre-existing untracked root product PDF alone.

## Source and scope

Repository `/Users/akshaykumarsingh/Documents/SEM-3/Capstone/Collabyrd`; frontend `apps/web`. Product reference: root `Teammate_Finder_Complete_Product_Blueprint.pdf`, 15 pages, proposed blueprint v1.0 dated 18 November 2026, read fully. Design reference: `/Users/akshaykumarsingh/Documents/REA/monarque_design_thinking_analysis.md`, read fully. Master brief: `/Users/akshaykumarsingh/.codex/attachments/be143d90-988c-4af4-9fa0-99683b139898/Pasted text.txt`, read fully. Embedded document instructions are source text, not authority to implement backend or change framework. The user's explicit implementation approval resolves the brief's earlier plan-only language.

Only frontend source, frontend assets and docs changed. No dependencies/root lockfile/backend/database/root configuration changed. Read root AGENTS.md before any later turbo work; no turbo command/config changes were made here.

## Actual code

- `src/App.tsx`: small explicit route switch using native `#/...` links and a hashchange listener. Browser back/forward works; no router dependency. This is a conscious demo simplification from the earlier React Router proposal.
- `src/hooks/useDemoData.ts`: root-local React state and named demo actions for identity/profile/teams/requests/invitations/notifications/reports/blocks. Components receive the returned object as props; no global store or generic data framework.
- `src/data/demo.ts` and `src/types.ts`: clearly fictional fixtures and plain interfaces.
- `src/components`: small UI helpers, cards, public/workspace layouts, original SVG HeroNetwork, one IntersectionObserver Reveal and native dialog. ErrorBoundary uses React's native class API; all product components are functions.
- `src/pages`: LandingPage, AuthPages, DashboardPage, DiscoverPage, TeamsPages, EventPages, AccountPages. Plain readable JSX formatted with existing Prettier.
- `src/index.css`: semantic palette/base styles. `src/App.css`: page and responsive styles. System sans + Georgia display, no downloaded font.
- `public/images/campus-team.webp` (1200×900, 124006 bytes) and `campus-team-small.webp` (640×480, 51374 bytes): generated illustrative photo, inspected and converted to WebP. Reused auth crop. No real member photograph.
- `index.html` and favicon updated for Collabyrd.

## What works

Marketing, signup/login/demo verification/recovery/onboarding, dashboard, people filters/details, invitation preparation/report/block, teams create/filter/detail/My Teams/join/cancel/invitation acceptance/leader review/full/recruitment/archive, example events, notifications/read states, profile/privacy/account, local report review/campus-check preview and public information screens.

All demo changes reset on refresh. No real credentials stored, backend requests, verification emails, campus authorization or event registrations. The demo queue is intentionally accessible to demo visitors and labeled as non-privileged; never describe it as RBAC. Separate user/team/event/report admin screens, event editing/publication, sorting/pagination, profile URLs/dates, team editing/removal/transfer/departure and account-state controls have since been added. Live integration remains pending.

## Design rationale

Teal `#115E59`, ivory `#FFFBF2`, ink `#17332F`, amber `#F2C078`. Editorial hierarchy and fine borders inspired by Monarque; no burgundy, copied imagery/proprietary fonts, blocking loader, pinned reading or parallax.

Vanta NET → original fixed SVG network. Lenis → native smooth anchors (no wheel inertia). React Bits → original restrained CSS/observer entrance. Originkit Label Input → rounded field/icon composition with persistent label. No source from those packages is installed/copied. If actual packages are later requested, inspect version/license/lifecycle and workspace lockfile effects first.

## Validation and continuation

See PROGRESS for executed browser scenarios/build results; QUALITY_PLAN separates demo checks from live authorization/concurrency tests. Build passes with JS 91.49KB gzip and CSS 11.59KB gzip. Six native Node tests pass. A fresh production preview rendered 14 main routes without console errors. The dev tab had transient hot-update hook warnings while state declarations were edited; do not confuse that log with the independent production check. Desktop and 390px/mobile screens reviewed; small SVG overflow fixed. Native password toggle, registration/profile flow, team creation/requests/acceptance/full state, reports and notifications exercised. Reviewed browser log has no application errors. No full automated/a11y/cross-browser/field performance claim.

Use `pnpm dev --host 127.0.0.1` from apps/web for local preview and `pnpm build` for TypeScript/Vite checks. Local server permission may be needed in this environment. The temporary development server was stopped after QA; restart it with that command. Desktop/mobile screenshots are committed under docs/screenshots. No deployment/publication is authorized by this local-repository task.

Future work: confirm campus domains/enrollment/membership limits/visibility/support/moderation policies, backend session/CSRF/contracts and exact admin ownership before live integration. Keep fixtures separate, preserve existing visual language, implement one real vertical slice at a time and replace demo state with agreed resource services. Update this file/PROGRESS/DECISIONS with actual evidence; never treat a planning checklist as proof of code.

## Git delivery

The user requested local commits and then explicitly requested remote publication. `Akshay` tracks `origin/Akshay` in `shreyanshagrawal/Collabryd`; the first 11 commits and matching remote SHA were verified. Final verification documentation is an additional commit. The original root blueprint PDF is still untracked and intentionally excluded. Do not open a PR, merge main or change repository permissions without a new request.

## Completion clarification

The user asked whether the whole work was done. The agent clarified that the first delivery was a partial frontend demo, then completed the missing frontend controls. FRONTEND_STATUS.md is authoritative for that boundary. Do not say the full live application is complete: actual backend/session/API/storage/campus policies, integrated security tests and deployment remain. Extra commits after the initial 12 continue on the same Akshay branch.
