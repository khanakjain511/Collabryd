# Page architecture

Routes derive from blueprint §4-5. This is a proposed full MVP inventory; implement in slices from [ROADMAP.md](ROADMAP.md). No routes exist beyond the current starter. `:id` denotes a resource ID, not a trusted permission. Shared contracts below apply to each route unless its row states otherwise.

## Shared page contracts

- Every page: descriptive title, one h1, main landmark, visible focus, correct heading order, readable at 320px and zoom. App shell sidebar at wide widths; compact labeled mobile navigation. Active navigation announced.
- Public information: no auth required; no private profile records. Loading only for actual remote content; error does not remove static navigation/copy. Empty featured listings simply omit fake counts and show honest state.
- Auth: native labeled form, inline field errors, generic account-existence-safe feedback, pending submit, route-level network failure. Correct autofill, password visibility and reduced motion. No decorative transition blocks entry.
- Private pages: check session, active verification and role before fetching data; show login/verify/access state as appropriate. Data state: loading → results or empty; request failure → retry. Retain filter/form state on recoverable error. Route titles/focus update on navigation.
- Mutations: pending disables repeat action; success reflects authoritative response; failure gives inline reason and recovery. Conflict refreshes data; forbidden/expired session returns to safe access state. Empty and loading states must not masquerade as success.
- Motion: use short optional entrances only; lists/forms work with all effects off. Images have size/alt/crop contracts.
- Data contracts are proposals, not backend claims: see [API_INTEGRATION_PLAN.md](API_INTEGRATION_PLAN.md).

## Public and identity

| Route / access | Purpose and entry → exit | Sections / components | Data and interactions | Distinct state / CTA |
| --- | --- | --- | --- | --- |
| `/` guest/public | Explain product; direct visit → register/events | Header, Hero, problem, features, how-it-works, trust, approved event preview, FAQ, final CTA, footer | Static approved copy, clearly fictional examples, public eligible event previews only | Find teammates → `/register`; Explore hackathons → catalog; no real public people cards |
| `/about` public | Product explanation; footer → register | ContentPage, product principles | Static copy approved by owner | Create profile; no fabricated founder credentials |
| `/contact` public | Get help; header/footer/error → support channel | ContentPage, contact information | Real contact channel pending; a simple mail link if approved | No nonfunctional contact form; actual channel required before release |
| `/privacy`, `/terms` public | Explain real rules; auth/footer → previous flow | Accessible text sections, headings, update date | Owner-approved policies; no third-party legal copy | Missing policy is a release blocker, not invented prose |
| `/register` public | Start eligible account; hero/login → verify | AuthLayout, FormField, PasswordInput | Name/email/password, policy acknowledgment only when policy exists | Creating/success/service error/unsupported institution; Create account |
| `/login` public | Restore session; header/guard → verify/onboarding/dashboard | AuthLayout, FormField, PasswordInput | Email/password, safe local return path | Credentials/network/throttled; Log in |
| `/forgot-password` public | Request recovery; login → generic sent status | AuthLayout, email field | Recovery request | Same response regardless account existence; Send reset link |
| `/reset-password` public/token | Set new password; email → login | AuthLayout, new/confirm password | Single-use reset token, policy requirements from server | Invalid/expired token → request new link; Save password |
| `/verify-campus` pending session | Complete verification; register/login → onboarding | VerificationStatus, resend/change-email/help | Server email/campus/review state, resend cooldown | Expired link, pending review, unsupported domain, resend failure; Check status / Resend |
| `/onboarding` verified/incomplete | Build useful profile; verify → dashboard | ProfileForm, ProfileProgress | Academics, skills, interests, roles, availability, optional links, visibility | Save pending/failure, skip optional; Save profile |

## Student and leader pages

| Route / persona | Purpose and entry → exit | Components / sections | Data, interactions and CTA | Distinct empty/error considerations |
| --- | --- | --- | --- | --- |
| `/dashboard` active student | Next useful action; login/onboarding → people/team/event | AppLayout, ProfileProgress, TeamCard, PersonCard, EventCard, pending summaries | Eligible recommendations (reason only), pending items, event deadlines; Explore teams / Create team | First-use guidance, no invented counts; independent section failure should not blank whole page |
| `/discover` active student | Find peers; dashboard/nav → profile | SearchFilters, PersonCard, Pagination | Name, skill, role, branch, year, domain, availability, sort; View profile | No results → Clear filters; preserve query on detail/back |
| `/users/:id` eligible viewer | Evaluate colleague; discover/request → invite/report | ProfileSummary, SkillTag, Avatar, ReportDialog | Redacted public-to-campus profile, roles/availability, optional links; Invite to team | Hidden/not found, blocked contact, no owned recruiting team, self-profile; skills labeled self-reported |
| `/teams` active student | Find open role; nav/event → team | SearchFilters, TeamCard, Pagination | Event/domain/role/skill/capacity filtering; View team / Create team | No matches/reset; full/closed status still clear if shown |
| `/teams/create` active student | Publish recruitment; dashboard/My Teams → detail | TeamForm, skill/role selectors | Name, description, domain, visibility, server capacity limits, optional event; Create team | Invalid capacity/policy, event inaccessible, failed save preserves draft |
| `/teams/:id` student/member/leader | Evaluate or manage team; listing/notification → request/review | TeamDetails, MemberList, TeamActions, RequestList, InviteDialog | Team, roles, member count, event, server permissions; Request to join / Review requests | Full/closed/archived, duplicate request, pending application, forbidden edits, capacity race; leader actions only where allowed |
| `/my-teams` active student | Track membership and recruitment; nav/notification → detail | Filter buttons, TeamCard, RequestItem, InviteItem | Joined/created/pending invitations/sent applications/archived; Accept/Decline/Cancel | Empty per filter; invitation expired/revoked; leader departure must transfer/archive according to agreed rules |
| `/hackathons` guest preview / eligible student | Find opportunity; hero/nav → detail | SearchFilters, EventCard, Pagination | Published eligible/public events, date/domain/mode/eligibility filters; View event | No public data leaks; no events → honest empty state |
| `/hackathons/:id` public-if-published-and-public / eligible student | Check rules and form team; catalog → organizer/teams | EventDetails, EventCard, TeamCard | Dates/timezone, organizer, size/rules, source/updated date, official URL, associated teams | Past/closed registration labeled; private team listing stays gated; Visit official registration |
| `/notifications` active student | Act on updates; nav → relevant detail | NotificationItem, read filters, Pagination | Invitation/request/deadline updates, recipient-scoped read state; Mark as read | All caught up; stale target unavailable; no fabricated delivery claim |
| `/settings/profile` active student | Edit profile; avatar/nav → dashboard | ProfileForm | Same profile data as onboarding; Save changes | Save failure retains values, optional links skipped |
| `/settings/account` signed-in, limited for pending | Manage account; account menu → sign out/support | AccountForm, ConfirmDialog | Logout/session/password/deletion request according to contract | No deletion-complete claim before server confirmation; policy/retention pending |
| `/settings/privacy` active student | Control discovery/contact; settings → return | PrivacyForm, native checkboxes | Visibility/notification options, block controls; Save changes | Hidden profile implications explained; unauthorized data must be removed by server |

Use an edit panel on team detail to keep routes small; an extra `/teams/:id/edit` route is optional, not required by the blueprint. No detail modal is needed for profile/team pages.

## Campus administration

| Route | Intent / access | Required sections/components/data | Interactions and states |
| --- | --- | --- | --- |
| `/admin` | Campus admin summary | AdminLayout, outstanding counts from real API | Go to queue; empty/error per section |
| `/admin/users` | Verify/suspend authorized campus users | Paginated table, filters, verification detail, confirmation form | Approve/reject/review/suspend; server role check, concurrent state changes, audit result |
| `/admin/teams` | Review campus recruitment | Paginated team list/detail, moderation actions | Inspect/close as permitted; do not inherit leader rights without API authorization |
| `/admin/hackathons` | Curate event listings | Table and create/edit panel; dates/time zone, eligibility, source and official URL | Draft/save/publish/archive; date/link validation, publish failure, no fabricated organizer connection |
| `/admin/reports` | Handle safety reports | ReportQueue, detail panel, status/history | Open → investigating → resolved/dismissed; authorized writes, empty/error/refresh after conflict |

Admin pages are part of blueprint MVP operations, but production integration depends on backend ownership and role contracts. If delivery scope is student-only, explicitly assign the admin experience elsewhere rather than silently claiming the full MVP is complete.

## Deferred / excluded routes

`/connections`, `/messages`, `/my-hackathons` (bookmark ambiguity), `/projects`, `/projects/:id`, `/teams/:id/workspace`, `/platform/campuses`, `/platform/audit`. Do not put dead navigation links to them in the MVP.

Unknown routes show a readable Not Found page with Home or Dashboard link. Error pages must not reveal whether a private hidden profile exists.
