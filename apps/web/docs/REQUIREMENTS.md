# Requirements and traceability

Source labels: **B** = requirement in proposed blueprint; **U** = direct user request; **R** = frontend recommendation. None indicates implemented status. Page specifications: [PAGE_ARCHITECTURE.md](PAGE_ARCHITECTURE.md). Task IDs: [CHECKLIST.md](CHECKLIST.md). Verification scenarios: [QUALITY_PLAN.md](QUALITY_PLAN.md).

| ID | Source | Requirement / acceptance condition | Routes | Components | Task | Test |
| --- | --- | --- | --- | --- | --- | --- |
| FR-01 | B §6 | Pending student cannot access private discovery; verification states explained | Register/login/verify | AuthLayout, FormField, VerificationStatus | F06 | T01 |
| FR-02 | B §6 | Save/reload editable skills and roles without making links mandatory | Onboarding/settings/profile | ProfileForm, SkillTag, ProfileProgress | F07 | T02 |
| FR-03 | B §6 | Filters honor selected skills/availability and eligible campus; pagination retains query | Discover | SearchFilters, PersonCard, Pagination | F08 | T03 |
| FR-04 | B §6 | Creating team produces leader membership and eligible listing | Teams/create | TeamForm, TeamCard | F09 | T04 |
| FR-05 | B §6 | One active join request per applicant/team; pending/cancelled status visible | Teams/:id, My Teams | RequestItem, StatusBadge | F10 | T05 |
| FR-06 | B §6 | Only permitted leader/admin reviews; accepted member appears once | Teams/:id | RequestList, MemberList | F10 | T06 |
| FR-07 | B §6 | Capacity conflict produces refreshed state and helpful feedback | Teams/:id | Alert, MemberList | F10 | T07 |
| FR-08 | B §6 | Accept/decline invitation; handle expired/revoked/full responses | Discover, My Teams | InviteDialog, InviteItem | F10 | T08 |
| FR-09 | B §6 | Published event dates, eligibility, organizer and official link are correct | Hackathons/detail | EventCard, EventDetails | F11 | T09 |
| FR-10 | B §6 | Correct recipient gets notifications; read state persists | Notifications | NotificationItem | F11 | T10 |
| FR-11 | B §6 | Report submitted and visible in authorized moderator queue | Profile/team/report queue | ReportDialog, ReportQueue | F12 | T11 |
| FR-12 | B §6 | Visibility changes persist; restricted details absent from unauthorized API responses | Settings/privacy, profiles | PrivacyForm | F12 | T12 |
| FR-13 | B §6 | Changing IDs cannot expose another campus's private data | All private routes | AccessState | F06, F12 | T13 |
| FR-14 | B §6 | Suspension removes access; deletion follows agreed policy | Settings/account, auth | AccountForm, Alert | F12 | T14 |
| UX-01 | B §5.1 | Landing tells who/what/why; CTA leads to real register/discovery flow | / | SiteHeader, Hero, FeatureGrid, FAQ | F05 | T15 |
| UX-02 | B §7 | Team statuses recruiting/full/closed/archived change available actions | Teams | StatusBadge, TeamActions | F09, F10 | T05-T08 |
| UX-03 | B §7 | Exactly one leader; safe departure requires transfer/archive policy | Team detail | TeamActions, ConfirmDialog | F10 | T06 |
| UX-04 | B §14 | Every async action has loading/success/error; examples identified | All | LoadingState, EmptyState, Alert | F04-F12 | T16 |
| UX-05 | B §5.11 | Campus admin verifies users, curates events, moderates reports | Admin routes | AdminLayout, plain tables, edit forms | F12 | T11, T13 |
| ENG-01 | U | Plain components, obvious names, typed props, local state, no unnecessary dependencies | All | All | F04-F13 | Explain one page in class; audit dependency justification |
| ENG-02 | U | Use best-suited ideas from all four supplied references | Marketing/auth/discovery | HeroNetwork, Reveal, FormField | F03-F06 | Reference mapping review, T17 |
| VIS-01 | U | Premium, convenient, eye-friendly direction | All | Semantic tokens | F03, F04 | Contrast verification + visual review |
| A11Y-01 | B/U | Semantic landmarks, labels, keyboard, focus, reduced motion; target WCAG 2.2 AA | All | All | F13 | T16-T17 |
| PERF-01 | R | Target LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; report actual conditions/results | All | Images/motion | F13 | T18 |

## Boundary acceptance

- No backend, database, root manifest, lockfile, or shared-package edits in this frontend planning change.
- No public real student examples, fake metrics/testimonials, or completed registration claims.
- No AI scores, messaging, task board, cross-campus switcher, or bookmarks in MVP UI unless scope changes explicitly.
- Security tests marked as server integration checks cannot pass on fixtures alone. Mock demonstrations prove UI state behavior only.
- Design and implementation are separate: palette selected; engineering, page inventory and roadmap await review.
