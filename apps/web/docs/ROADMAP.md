## Current refinement slice — 19 November 2026

The existing frontend feature inventory is preserved. The local review draft adds coherent theme tokens, readable type, photographic landing/story composition, the requested intro and scroll motion, native account/menu transitions, responsive refinements and locally optimized assets. No backend or new MVP features were added. See PROGRESS for measured checks and AI_HANDOFF for the explicit **no further commits/pushes** instruction. Visual review by the user is pending; build success is not an aesthetic approval.

> Current status: the user approved implementation. A local frontend demo is built; see [PROGRESS.md](PROGRESS.md) and [IMPLEMENTATION.md](IMPLEMENTATION.md). The tables below trace the broader live-product acceptance scope, not a claim of backend completion.

# Implementation roadmap

Implementation was explicitly approved after planning. The frontend demo is built; PROGRESS.md is authoritative for current verified behavior. The full live-product roadmap below remains prospective. The sequence below is proposed and not a committed schedule. No delivery estimate can be honest until deadline, API readiness and ownership are confirmed.

| Phase                     | Work / dependency                                                 | Deliverable and acceptance gate                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 Discovery               | Read complete sources, inspect actual frontend, review references | Evidence-based audit, source boundaries and MVP extraction; F01                                                                                                       |
| 1 Product and UX          | Phase 0                                                           | Journeys, scope traceability, routes and complete proposed copy; unsupported claims removed; F02                                                                      |
| 2 Visual system           | User palette choice + 0-1                                         | Selected teal/ivory tokens, typography/grid/component/motion specs; implemented demo direction; F03                                                                   |
| 3 Asset planning          | Visual direction                                                  | Placement inventory, actionable prompts, manifest; no assets generated before implementation approval; F03                                                            |
| Review gate               | Documentation available                                           | Approve visual composition, simple architecture, reference-effect choice, page inventory and roadmap. Confirm start of implementation. Palette need not be reselected |
| 4 Foundations             | Review gate; package scope if needed                              | Implement only first-page UI tokens/primitives/layout/Reveal; semantic keyboard/reduced-motion behavior; F04                                                          |
| 5 Public site             | Phase 4, approved content/assets                                  | Landing narrative, actual CTA destinations within implemented slice, responsive header/footer/FAQ, labeled examples; F05                                              |
| 6 Identity                | 4-5, route strategy; agreed auth contracts or labeled demo        | Register/login/recovery/verification and role/session access states; no email delivery/security claims from fixtures; F06                                             |
| 7 Profiles                | 6, taxonomy/visibility decisions                                  | Onboarding, edit/privacy profile flow, optional fields and save/error states; F07                                                                                     |
| 7A Discovery              | 7, eligible people/team list contracts                            | Filters, URLs/pagination, profiles and cards with correct access/empty states; F08                                                                                    |
| 7B Teams                  | 6-8, capacity/membership policy                                   | Create/detail/My Teams, join/invite/review states and conflict recovery; F09-F10                                                                                      |
| 7C Events and updates     | Teams + event ownership                                           | Event catalog/detail/provenance/official link/team association, recipient notifications; F11                                                                          |
| 7D Operations/account     | Identity + admin/moderation ownership + policies                  | Report/block, privacy/account lifecycle, campus admin queue/editor; F12                                                                                               |
| 8 Quality and integration | Implemented slices, backend/test environment where needed         | Build, critical journeys, authorization/concurrency coordination, keyboard/motion/reflow/mobile/performance and route checks; F13                                     |
| 9 Handoff                 | Evidence from each completed slice                                | Documentation reflects code, simple explanation of data/state/props/CSS, integration limits and remaining issues; F14                                                 |

Run relevant checks within each implementation slice; phase 8 is a final integrated audit, not the first time forms or accessibility are checked. A frontend demo can be a review milestone at phases 5-7, but does not satisfy full live MVP acceptance.

## Suggested first implementation slice

1. Apply selected CSS tokens and replace starter metadata.
2. Build Button, labeled form field when needed, Header/Footer, native FAQ and one Reveal component.
3. Build the public landing with clearly labeled person/team examples, original SVG network and an approved campus image if desired.
4. Verify narrow/wide layout, navigation, keyboard and reduced motion; then proceed to real auth routes or explicitly labeled demo flow.

No framework migration, backend edits, generic component factory, chat or AI matching. Do not generate all future folders/components in advance.

## Integration and release gates

- **Frontend demo gate:** all mocked behavior identified, no real credentials collected, no claims of actual email/request transmission, reliable local interactions and accessible layout.
- **Live MVP gate:** FR-01 through FR-14 evidence, production API authorization/campus isolation/capacity invariants verified by owners, approved policies/content, real support/moderation and correct dates/provenance.
- **Release gate:** passing relevant quality checks and production deep links; privacy/legal/campus owner review completed where required. Deployment is a separately authorized scope, not part of planning.

## Delivered slice

The frontend demo now covers phases 4-7 with clearly labeled fictional state and a local moderation preview. Phase 8 frontend build/browser verification and phase 9 demo handoff are complete within the limits in PROGRESS. Full backend integration, event publishing administration and live authorization/concurrency tests remain prospective work.
