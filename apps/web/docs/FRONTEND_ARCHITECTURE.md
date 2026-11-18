# Frontend architecture and audit

## Current repository evidence

Inspected on 18 November 2026:

| Item | Observed state |
| --- | --- |
| Frontend | `apps/web`, React + TypeScript + Vite; no frontend nested AGENTS.md found |
| Declared runtime dependencies | `react ^19.2.8`, `react-dom ^19.2.8` only |
| Declared dev stack | Vite `^8.3.0`, TypeScript `~6.0.2`, React plugin `^6.1.1`, ESLint `^10.10.0` and hooks/refresh rules |
| Scripts | `dev: vite`, `build: tsc -b && vite build`, `lint: eslint .`, `preview: vite preview` |
| Entry | `src/main.tsx`, `StrictMode`, imports global CSS and App |
| App | Vite/React starter hero, counter, documentation and social links |
| Styling | `src/index.css`, `src/App.css`; starter variables, nested CSS/media rules and automatic dark colors |
| TS configuration | Project references, noEmit, unused symbol checks; no explicit strict flag in inspected app config |
| Metadata | `index.html` title is `web`, starter favicon |
| Assets | Starter React/Vite SVGs and hero image; no approved Collabyrd assets |
| Router/forms/motion | No dedicated packages declared |
| Integration | No frontend API calls, real authentication or product screens found |
| Testing | No frontend test script/suite found in the inspected workspace |
| Dependencies on disk | Frontend `vite`, `tsc`, `eslint` executable paths exist; installed versions were not audited |
| Existing work | Untracked root product blueprint PDF predates this change; preserve it |

No code, build, lint, browser rendering of this app, or server startup was run in the planning phase. Manifest versions describe declarations, not guaranteed installed resolution.

## Keep the code easy to explain

Use ordinary function components, explicit typed props, a small set of CSS classes, native forms and local `useState`. Use `useEffect` only for side effects such as data loading or a browser observer. Readable repetition of a few lines is preferable to an abstraction that hides behavior.

Keep three visible layers:

1. A page decides what data and actions it needs.
2. A small service function loads or updates that data.
3. A component renders the result and calls a callback.

Explainable example flow, not implementation: TeamsPage calls `getTeams(filters)` → stores loading/data/error → renders TeamCard for each result → a details link opens TeamDetailsPage. TeamDetailsPage calls `requestToJoin(teamId)` and refreshes its result after success/conflict. No global event bus, generic repository classes or generated CRUD forms.

## Proposed structure; create only when used

```text
apps/web/
  docs/                      planning and handoff
  src/
    main.tsx                 existing React entry
    App.tsx                  explicit routes and layout composition
    index.css                reset, tokens, global typography
    App.css                  shared layout styles
    pages/                   LandingPage, LoginPage, TeamsPage, ...
    components/
      ui/                    Button, FormField, Alert, ...
      layout/                SiteHeader, SiteFooter, AppLayout
      product/               PersonCard, TeamCard, EventCard
      motion/                one Reveal component
    services/                auth.ts, people.ts, teams.ts, events.ts
    data/                    fictional fixtures and mock service functions
    types/                   small product interfaces
    styles/                  page CSS only when needed
  public/images/             approved optimized local assets
```

Do not create this entire tree in advance. Keep a page-specific form beside its page until another page really needs it. Do not move shared components into `packages/ui`: that expands the user's frontend boundary.

## Proposed decisions

| Concern | Simple recommendation | Reason / trade-off |
| --- | --- | --- |
| Framework | Retain Vite and React | Existing working stack; PDF's Next.js suggestion is optional; public SEO may need later static rendering if required |
| Styling | Plain CSS custom properties and named classes | Already installed, inspectable in browser, no build/config work needed |
| Routing | React Router declarative mode when multi-page work starts | Explicit route table, dynamic IDs and browser history; avoids hand-written router. Not installed/approved yet |
| Marketing initial slice | Single page and native section anchors | No router needed until auth/detail routes are implemented |
| UI state | `useState` in page; props/callbacks | Filters and form state have clear owners; derive visible lists instead of duplicating state |
| Session | One small AuthContext only when live session is integrated | Avoid passing session through every layout; not a general state store |
| Forms | Native constraints + plain validation functions | Easy to explain; server errors remain authoritative; no schema-form engine |
| API | Explicit resource functions wrapping fetch | A short shared response/error helper is enough; no generic SDK or client cache framework |
| Fixtures | Separate functions/data with same resource signatures | Clearly labeled demo mode, can replace services without rewriting cards |
| Motion | CSS + IntersectionObserver | Small dependency surface, consistent with simple-code preference |
| Error boundary | One small root boundary when app expands | Catches render crashes; ordinary try/catch handles fetch/events separately. React's native boundary API uses a class; document this narrow exception |
| TypeScript | Simple interfaces and status unions | Avoid `any`, elaborate generics, type-level programming and disabling compiler checks |

Dependency additions modify the root pnpm lockfile in a workspace. Do not install routing/motion/test packages within a frontend-only approval without resolving that scope first. No need to ask about lockfiles now: no dependency installation is required for this planning result.

## Route and data conventions

Use one explicit route table, meaningful route titles, an unknown-route page and safe return paths for login. Keep query/search filters in URL parameters when discovery pages ship; reset page number when filters change. Validate return destinations as local allowed routes.

Private content is fetched only after session and verification checks, but browser guards are not authorization. Server must derive active campus membership, redact private fields, and reject forbidden mutations. Fetch cancellation/cleanup prevents stale searches replacing newer results. UI never computes authoritative capacity or writes accepted membership locally in live mode.

For browser-history routes the eventual host must serve `index.html` for application routes; configure in the appropriate deployment scope after approval. Do not assume Vite dev-server routing proves production deep links.

## Build and development after approval

Run workspace-local commands from `apps/web` (`pnpm build`, and `pnpm dev` when browser QA is needed). Avoid repository-wide commands that could affect backend work. No Turborepo configuration/commands need changes. If a later task requires them, first resolve the installed turbo package and read its bundled docs per root AGENTS.md.

Use comments to explain intent or an unusual browser/API requirement, not every JSX line. Handoff should trace one real request journey end to end so the student can explain state, props, CSS and service responsibilities.
