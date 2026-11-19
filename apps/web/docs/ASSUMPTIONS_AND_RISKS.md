# Assumptions, open questions and risks

Missing policy does not block writing a frontend plan or later honest demo, but it can block real integration/release. Do not make up backend readiness, deadlines or campus endorsement.

| ID | Unknown / impact | Recommendation or options | Owner / gate |
| --- | --- | --- | --- |
| O01 | Launch campus and institutional domains not identified | One configured campus; derive allowed guidance from server config | Product/backend before live verification |
| O02 | Email ownership vs enrollment review | Support pending-email and pending-review UI; policy decides activation | Campus/product before live signup |
| O03 | Maximum team size, event membership restrictions | Server-supplied constraints; event policy overrides campus default | Product/backend before membership integration |
| O04 | Default profile visibility/contact permissions | Campus-only discovery; user controls optional details; confirm exact default | Product/privacy owner before release |
| O05 | Who creates/verifies event listings | Campus admin with source URL and updated date; official external registration | Operations/product before event release |
| O06 | Moderation staffing, escalation, blocks and appeals | Assign campus moderator and real support channel | Campus/product before release |
| O07 | Privacy/retention/deletion/minor policy and legal copy | Owner supplies policies; frontend reflects actual behavior | Policy owner; release blocker |
| O08 | API/session/CSRF/errors and taxonomy readiness | Read actual API and agree examples before live integration | Backend/frontend coordination |
| O09 | Deadline, hosting/budget and production deep-link setup | No schedule/provider assumption; deploy only under a separate authorized task | Product; release gate |
| O10 | Bookmark scope contradiction | Defer; no save button or My Hackathons route in initial UI | Product plan review |
| O11 | Intro vs scope table chat ambiguity | Defer chat; no promise of live messaging in MVP | Product plan review |
| O12 | Brief spelling Collabryd vs repository Collabyrd | Use repository Collabyrd in planning; confirm before branding export | Product before final assets |
| O13 | Scope of campus admin frontend ownership | Include in full MVP plan; explicitly assign elsewhere if student work excludes it | Product before F12 |
| O14 | Actual libraries or simplest equivalents | Recommend SVG/CSS/native/observer equivalents; document loss of physics/inertia | User implementation review |
| O15 | Dependency additions touch root workspace lockfile | No installs now; later request narrowly scoped lockfile permission if needed | Before package addition |

## Risk register

| Risk | Consequence | Mitigation / verification |
| --- | --- | --- |
| Overengineering for a college explanation | Student can't explain code or maintain it | Plain function components, CSS, state/service flow; include walkthrough during handoff |
| Adding four effect libraries | Larger payload, conflicting loops and accessibility issues | Pick bounded patterns; native equivalents baseline; actual libs only when justified |
| Fake successful auth/requests | Demo mistaken for a working service | Persistent demo label, explicit local-only feedback; production integration scenario evidence |
| Private directory leaks | User/campus privacy breached | Guest contains no real private fixtures; server-scoped reads, negative authorization tests |
| Capacity race / stale invite | UI appears to overfill team | Backend atomic accept; refresh conflict; mock only demonstrates response rendering |
| Campus policy invented in copy | Incorrect eligibility promise | Config-driven guidance; review O01-O07; no hardcoded domain/password rules |
| Scope creep into messaging/workspace/AI | Core team formation delayed | MVP traceability and deferred route list; product approval before expansion |
| Slow or distracting hero | Poor mobile readability and interaction | Fixed SVG/simple photo; finite entrance; measured optional visual budgets |
| Generated photo defects or false identity | Low trust / misleading imagery | Inspect crops/anatomy, label illustration/demo; initials for fictional avatars |
| Unsupported accessibility claims | Inaccessible forms despite polished appearance | Keyboard, assistive tech, contrast, reflow and reduced-motion checks; no claim before evidence |
| Documentation drift | Next assistant mistakes plans for code | PROGRESS evidence, inspect repository each continuation, update decision status |
| Root/backend writes via workspace tools | Exceeds intended frontend scope | Documentation only here; workspace-local implementation commands later; review lockfile effects |
| Unapproved contact/policy text | Dead support path or inaccurate notice | Owner content required before public release; do not invent addresses or legal assurances |

No backend defects are asserted: its implementation was outside this task's audit. No known application bug audit was performed; the present frontend is simply still the starter.
