# Frontend API integration plan

The PDF §11 is a REST sketch and explicitly says endpoint names are proposals. The backend has not been audited in this frontend task. Everything below is a proposed handshake to review with its owner; no endpoint is confirmed operational.

## Simple resource interfaces

Keep named functions in small service files: `getSession`, `register`, `login`, `getPeople`, `getTeam`, `createTeam`, `requestToJoin`, `acceptRequest`, `respondToInvitation`, `getEvents`, `getNotifications`, `submitReport`. Plain fetch plus a short shared response/error helper is sufficient. No generic API repository framework.

Minimum response shapes:

| Type | Fields the UI needs |
| --- | --- |
| Session | user `{id, displayName}`, account status, verification status, active role, onboardingComplete; no client-selected campus authority |
| Person | id, displayName, optional avatarUrl/headline/bio, branch/year, skill summaries, interests, preferredRoles, availability, optional approved public links; private email/phone excluded |
| Team | id, name, description, domain, status, capacity, memberCount, leader summary, openings, optional event summary, server permissions; details include permitted members/request state |
| Opening | id, role, skill summaries, availableSlots, status |
| JoinRequest | id, teamId, permitted applicant summary, openingId, message, status, createdAt |
| Invitation | id, team summary, invitedBy summary, status, expiresAt |
| Event | id, title, organizer, startsAt/endsAt/deadlineAt (ISO timestamps), timezone, mode, eligibility, teamSize/rules, officialUrl, sourceUrl, updatedAt, publication state |
| Notification | id, type, safe display summary, createdAt, readAt, authorized destination identifiers |
| Report | id, permitted target summary, reason/details, status, createdAt; reporter-visible and admin-visible fields differ |

Proposed list response: `{ items: [...], page: 1, pageSize: 20, total: 42 }`. Empty is `items: []`, not a failure. Proposed errors: `{ error: { code: "TEAM_FULL", message: "...", fields?: {...}, retryAfterSeconds?: number } }`. Agree actual names before coding; components should not read arbitrary raw API payloads.

## Proposed contract matrix

All paths start `/api/v1`. **B** = PDF sketch, **R** = additional frontend-required contract to agree. Body fields are minimum proposals, not exhaustive schemas.

| Source / request | Body/query | Response / frontend action |
| --- | --- | --- |
| B `POST /auth/register` | name, institutionEmail, password | Pending session/account status; route to verify; do not expose account existence unnecessarily |
| B `POST /auth/verify-email` | single-use token or approved OTP payload | Verification/campus status; review may still be pending |
| B `POST /auth/login`, `POST /auth/logout` | credentials / no user-selected account ID | Session / 204; clear private client data on logout |
| R `GET /auth/session` | cookie/session | Authoritative session or 401; needed for refresh/deep links |
| R `POST /auth/resend-verification` | session/current email per policy | Cooldown/retry response; no fake sent-email claim |
| R `POST /auth/forgot-password`, `/auth/reset-password` | email / token and new password | Generic recovery response / confirmed reset |
| B `GET /me`, `PATCH /me` | allowed profile fields: academics, skill IDs/proficiency, interests, roles, availability, links, visibility | Redacted own profile; refresh saved value; server validates taxonomy/URLs |
| B `GET /users` | name, skill, role, branch, year, domain, availability, sort, page | Eligible person summaries; server campus isolation |
| B `GET /users/:id` | opaque resource ID | Visible profile or safe 404/403; honor block/privacy |
| B `GET /teams`, `POST /teams` | list filters / name, description, domain, capacity, roles/skill IDs, optional hackathonId | List / 201 team and leader membership |
| B `GET /teams/:id`, `PATCH /teams/:id` | ID / permitted edit fields and recruitment state | Current team, permissions and member count; check exact edit contract |
| B `POST /teams/:id/requests` | openingId if applicable, message | 201 pending request; duplicate request conflict is recoverable |
| B `GET /teams/:id/requests` | pagination | Leader/admin-permitted queue |
| B `POST /requests/:id/accept`, `/reject` | request ID, optional reason if approved | Updated request and team summary; atomic capacity/membership check |
| R `POST /requests/:id/cancel` | own pending request | Cancelled state |
| B `POST /teams/:id/invitations` | inviteeId, optional openingId | Pending invitation; no membership yet |
| B `POST /invitations/:id/respond` | action accept/decline | Updated invitation/team or expiry/capacity conflict |
| R `GET /me/teams`, `/me/requests`, `/me/invitations` | state filter, pagination | My Teams subsets; avoid downloading all campus requests |
| R `POST /teams/:id/members/:userId/remove`, `/transfer-leadership`, `/archive` | target ID / confirmed new leader / state | Authoritative team state; audited server actions, policy to agree |
| B `GET /hackathons`, `GET /hackathons/:id` | date/domain/mode/eligibility/page | Published public/eligible event data and provenance |
| R `POST /teams/:id/hackathons` | hackathonId | Association only; not official registration |
| B `GET /notifications`, `PATCH /notifications` | pagination / permitted read IDs | Recipient-only updates and unread state |
| B `POST /reports` | targetType, targetId, reason, details | Receipt/ID; never expose moderation-only history to reporter |
| R `POST /blocks`, `DELETE /blocks/:id` | target user ID | Updated contact restriction; server applies before invitations |
| R settings account/session/deletion | Confirm agreed endpoints and retention process | No plaintext passwords stored in client; deletion status accurate |
| B `GET /admin/reports` | status/page | Campus-scoped queue |
| R admin user/event/report mutations | verification decisions, event editor fields, report disposition | RBAC, validation and audit results; exact routes unresolved |
| R taxonomy/config read | skills, roles, interests, branches, team limits, approved campus-facing instructions | Render valid choices without hardcoded invented policies |

## HTTP state mapping

| Result | UI treatment |
| --- | --- |
| 400 / validation | Field errors and summary; preserve values, focus first invalid field after submit |
| 401 | Clear private state; login with safe return path |
| 403 | Explain verification or permission state safely; never display unauthorized cached details |
| 404 | Unavailable state; avoid leaking hidden resource existence |
| 409 | Map stable code such as TEAM_FULL, ALREADY_MEMBER, DUPLICATE_REQUEST; refresh affected resource |
| 429 | Retry guidance and server cooldown; do not loop automatic retries |
| 5xx / network | Retry action; preserve form input; do not claim mutation success |
| Cancelled fetch | No misleading user-facing error; don't replace newer query results |

## State and privacy boundaries

Use `loading/data/error` state directly in the owning page. Cancel outdated searches with AbortController; no custom caching library initially. Disable duplicate local submissions, but backend owns uniqueness/idempotency and transaction safety. For a timed-out mutation, refetch status before offering a blind repeat where duplication matters.

Cookie-based session is a proposal for the backend owner. If selected, requests use appropriate credentials and an agreed CSRF contract. Never store passwords/tokens in fixtures, source, localStorage, URLs, logs or screenshots. Vite public environment values are not secrets. Do not send a browser campusId as proof of membership; server derives authorized campus scope. Client route guards and filtered mock arrays provide no security guarantee.

Use server ISO timestamps and explicit event time zones; format dates using Intl.DateTimeFormat and display event zone where important. Agree date-only deadline semantics. Validate external URLs to permitted http/https destinations; external registration links must be visibly labeled.

## Controlled mock mode

- Keep fictional fixtures in `src/data`, separate from components. Fixed opaque IDs and explicit dates make states understandable.
- Separate mock functions expose the same resource signatures; one explicit build/demo selection chooses functions before page use. Avoid a generic plugin/provider registry.
- Demo banner persists in app and auth views. Demo sign-in does not collect/store a real password. Demonstrate sessions with a visible sample-person choice or labeled fixture action.
- Mock updates can use in-memory data; refresh resets them and the UI explains that. Avoid persisting private-looking profile data for convenience.
- Use a few controlled scenarios: empty result, pending request, full team, expired invitation and network error. No randomized failures or fake real-time updates.
- A mock acceptance demonstrates state rendering only. Real verification emails, cross-campus denials, concurrent capacity enforcement, notification delivery and moderation require live integration tests.

Before integration: backend owner supplies schemas/OpenAPI or agreed examples, base URL, session/CSRF/CORS behavior, permissions and test accounts, taxonomy, errors, pagination and mutation semantics. Inspect actual implementation then; do not infer it from this document.
