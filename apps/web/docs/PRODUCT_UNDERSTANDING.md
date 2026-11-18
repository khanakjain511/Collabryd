# Product understanding

Source: `Teammate_Finder_Complete_Product_Blueprint.pdf`, pp. 1-15. This is the proposed product baseline, not evidence that any feature exists. Collabyrd is the repository's working brand; the PDF uses the placeholder Teammate Finder.

## Purpose and positioning

Help verified students on one campus find collaborators outside their immediate class or friend group, fill missing team roles, and form teams around hackathons. The core outcome is an accepted team membership. General social networking is secondary.

Problem: recruitment is scattered across WhatsApp groups, spreadsheets, and personal contacts. Students cannot easily compare skills, interests, availability, and open roles. Team leaders need a clear application queue and accurate capacity.

Recommended positioning: **Find your people. Build your next idea.** Explain immediately that this is a campus-first teammate and hackathon platform. No unsupported claims of AI, guaranteed compatibility, college endorsement, verified professional skill, or nationwide access.

## Audiences and needs

| Persona | Need | Primary journey |
| --- | --- | --- |
| Student seeking a team | Find a relevant opening and know its status | Profile → team filters → details → request → decision |
| Student seeking members | Find complementary people | People filters → profile → invite → response |
| Team leader | Publish roles and review applicants fairly | Create team → review requests → accept/reject → close recruitment |
| Hackathon participant | Understand eligibility, dates, and official registration | Events → rules → organizer link → associated teams |
| Campus administrator | Keep discovery trusted and listings current | Verify/review users → publish events → investigate reports |
| Future platform operator | Manage campus onboarding | Deferred beyond one-campus launch |

## Confirmed blueprint MVP

1. Registration, login/logout, recovery, campus verification, account state handling.
2. Onboarding and editable profiles: academic details, skills/proficiency, interests, preferred roles, availability, optional portfolio links, visibility controls.
3. People search/filter/sort/pagination, permitted profile details, invitation and report/block controls.
4. Team discovery, creation, details, openings, applications, invitations, leader review, capacity feedback, recruitment status, My Teams.
5. Hackathon listings/details with eligibility, time zones, official sources and registration links; associate a team with an event.
6. In-app notifications for recruitment and relevant deadline updates.
7. Moderation basics, account/privacy settings, campus-scoped administration.

The PDF's detailed event page includes bookmarks, but its phase table puts bookmarks in phase 2. Recommendation: defer bookmark controls and `/my-hackathons` until this conflict is resolved. See [DECISIONS.md](DECISIONS.md).

## Later scope and proposals

| Classification | Functionality |
| --- | --- |
| Phase 2 | Connections, direct/team messaging, bookmarks, richer recommendations/event management |
| Phase 3 | Tasks, shared resources, workspaces, project showcases, achievements, analytics |
| Phase 4 | Opt-in cross-campus discovery, inter-college teams and platform administration |
| Not required | Payments, video conferencing, AI/ML scoring |
| Design recommendations | Teal/ivory identity, product-demo hero, subtle reveals, simple local mock mode |
| Unsupported assumptions | Launch campus/domain, enrollment policy, service provider, production API readiness, deployment approval |

Deterministic recommendations are proposed by the blueprint. Example scoring weights are placeholders. The frontend should display server-supplied explanatory reasons such as "Matches your frontend role"; it should not invent compatibility percentages or implement ranking algorithms.

## Core user journeys

### First visit and activation

Landing → register → email verification → campus approval when required → onboarding → dashboard → eligible team search → join request → notification. Pending/suspended users must not receive private directory records. Client navigation guards improve UX; the server enforces permissions.

### Recruitment

Leader creates a team with capacity, roles, skills and optional event → recruiting listing → receives request → reviews profile → accepts/rejects → refreshed authoritative membership → closes recruitment when appropriate. A conflict response must resolve simultaneous accepts; frontend disabled buttons cannot guarantee capacity.

### Invitation

Leader discovers a profile → invites to an owned eligible team → invitation appears in My Teams and notifications → invitee accepts/declines → server rechecks capacity, eligibility and expiry → state refreshes. An invitation is not membership until accepted.

### Event participation

Browse eligible/public events → inspect organizer, dates, rules, provenance → follow official registration → link/create a team. Linking is not registration. Never show "registered" after an external-link click.

### Safety and account control

Student reports/blocks → receives honest feedback → authorized admin reviews report → resolves/dismisses → appropriate updates. User adjusts discovery visibility and can request deletion. Policy/retention details need an owner before release.

## Frontend implications

- Access states: guest, signed-in pending email/review, verified incomplete profile, active student, leader, campus admin, suspended.
- Team, application and invitation statuses need distinct visible labels and action availability.
- Private profiles belong only in eligible authenticated views. Public hero cards must say "Example profile" and use fictional data.
- Forms need loading, inline validation, safe server errors, and preserved user input.
- Product components: PersonCard, TeamCard, EventCard, RequestItem, InviteItem, StatusBadge, FilterPanel, ProfileProgress, ReportDialog.
- Data contracts and policy errors must be explicit before claiming backend integration.
- All essential journeys must work with keyboard input and reduced motion, and at 320 CSS pixels.

## Open questions and dependencies

Launch campus/domain, email versus enrollment approval, team size and simultaneous membership policy, event curation, visibility default, moderation owner, retention/deletion wording and schedule remain unresolved. Proposed default: directory private to verified campus members; no chat; external organizer registration; bookmarks deferred. These defaults are recommendations requiring product confirmation, not implemented policy.

The frontend can be demonstrated with clearly labeled fixtures after implementation approval. Verification, sessions, authorization, membership transactions, email delivery, moderation persistence, uploads, and privacy enforcement depend on backend services owned elsewhere.
