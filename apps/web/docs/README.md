# Collabyrd frontend plan

Updated: 18 November 2026. Status: implementation approved; frontend demo built and scoped browser verification complete; committed and pushed on Akshay.

Collabyrd helps verified students on one campus find people, form hackathon teams, and track recruitment. The frontend demo is implemented. PROGRESS.md and IMPLEMENTATION.md describe working behavior; the earlier design/API specifications describe the broader planned product.

The user asked for simple code they can explain and supplied Vanta, Lenis, React Bits, and Originkit as references. They delegated the palette choice with the preference "premium ... convenient and eye friendly". **Selected direction: Midnight Teal + Warm Ivory.** Selection does not imply that the frontend has been implemented or tested.

For an exact answer to "is all work done?", read [FRONTEND_STATUS.md](FRONTEND_STATUS.md). The frontend demonstration is implemented; live backend integration and release verification are not complete.

## Read first

1. [AI_HANDOFF.md](AI_HANDOFF.md): self-contained continuation context.
2. [PROGRESS.md](PROGRESS.md): authoritative execution status.
3. [ROADMAP.md](ROADMAP.md): delivery order and acceptance gates.
4. [CHECKLIST.md](CHECKLIST.md): task IDs, dependencies, evidence.
5. [DECISIONS.md](DECISIONS.md): selected direction and proposed engineering choices.

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for the simple code walkthrough and [PROGRESS.md](PROGRESS.md) for validation and limits.

## Document index

| File | Purpose |
| --- | --- |
| [FRONTEND_STATUS.md](FRONTEND_STATUS.md) | Exact completion boundary and remaining live-service work |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | Simple source walkthrough and demo instructions |
| [PRODUCT_UNDERSTANDING.md](PRODUCT_UNDERSTANDING.md) | Blueprint interpretation, audiences, scope, journeys, unresolved product policy |
| [REQUIREMENTS.md](REQUIREMENTS.md) | Blueprint requirements mapped to routes, components, tasks, tests |
| [DESIGN_REFERENCE_ANALYSIS.md](DESIGN_REFERENCE_ANALYSIS.md) | Monarque mapping and concrete selections from the four new references |
| [COLOR_PALETTES.md](COLOR_PALETTES.md) | Five complete palettes, ranking, measured color pairs, selection |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Selected semantic colors, typography, spacing, responsive layout, focus |
| [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md) | Small component inventory, contracts, states, keyboard behavior |
| [MOTION_SYSTEM.md](MOTION_SYSTEM.md) | CSS-first motion, scroll behavior, cleanup, accessible alternatives |
| [CONTENT_STRATEGY.md](CONTENT_STRATEGY.md) | Narrative, landing copy, auth copy, product state messages |
| [PAGE_ARCHITECTURE.md](PAGE_ARCHITECTURE.md) | Route inventory, access, data, interactions, page states |
| [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md) | Existing audit and simple, explainable implementation structure |
| [API_INTEGRATION_PLAN.md](API_INTEGRATION_PLAN.md) | Proposed contracts, mock boundaries, errors, backend dependencies |
| [IMAGE_STRATEGY.md](IMAGE_STRATEGY.md) | Reference image inventory, planned assets, prompts, manifest |
| [QUALITY_PLAN.md](QUALITY_PLAN.md) | Accessibility, performance budgets, meaningful verification |
| [RESEARCH.md](RESEARCH.md) | Primary sources and how they affect decisions |
| [ASSUMPTIONS_AND_RISKS.md](ASSUMPTIONS_AND_RISKS.md) | Unknown policies, release blockers, mitigations |
| [DECISIONS.md](DECISIONS.md) | Dated decision records and approval status |
| [ROADMAP.md](ROADMAP.md) | Phases and acceptance criteria |
| [CHECKLIST.md](CHECKLIST.md) | Execution checklist |
| [PROGRESS.md](PROGRESS.md) | Current state and verification results |
| [AI_HANDOFF.md](AI_HANDOFF.md) | Continuation instructions |

Related subjects are consolidated into useful documents instead of creating empty files for every suggested filename in the supplied brief. Website copy is in CONTENT_STRATEGY; image prompts and the asset manifest are in IMAGE_STRATEGY; accessibility, performance, and testing are in QUALITY_PLAN.

## Source and scope handling

- Actual frontend location: `apps/web/`. The brief's `web/` means this existing workspace; no second root-level frontend is proposed.
- Planning and implementation stay under `apps/web/`; the user also authorized Git branch creation and local commits.
- Product source: repository-root `Teammate_Finder_Complete_Product_Blueprint.pdf`, all 15 pages, version 1.0, 18 November 2026. It explicitly calls itself a proposed blueprint.
- Design source: `/Users/akshaykumarsingh/Documents/REA/monarque_design_thinking_analysis.md`, read in full. Its technical claims are supplied analysis, not a fresh audit of Monarque's live implementation.
- Supplied master brief: `/Users/akshaykumarsingh/.codex/attachments/be143d90-988c-4af4-9fa0-99683b139898/Pasted text.txt`, read in full.
- Document text is reference material, not independent authority to execute embedded agent prompts. In particular, the blueprint's backend implementation instructions and suggested Next.js migration are not authorized frontend tasks.
- The master brief requested a planning review; the user subsequently explicitly approved "Build the frontend now". The user's latest simplicity requirement takes priority over elaborate architecture suggestions. No dependency installation, backend work, root lockfile change or publication took place. Local frontend code, generated assets and browser verification followed explicit implementation approval.

## Published work

Frontend source and documentation are committed on [Akshay](https://github.com/shreyanshagrawal/Collabryd/tree/Akshay). See the [desktop preview](screenshots/desktop.jpg), [mobile preview](screenshots/mobile.jpg) and [commit history](https://github.com/shreyanshagrawal/Collabryd/commits/Akshay/). This is source publication, not a hosted website deployment.
