# Component plan

Create components when a page needs them. Props below are concise contracts, not an instruction to build a generic UI framework. All props use simple TypeScript interfaces; native input/button attributes should pass through where useful.

## Shared rules

- Sizes: controls small 36px (non-primary desktop use), regular 44px, large 48px. Mobile actions target 44px minimum.
- States: idle, hover, keyboard focus, disabled, loading, error where relevant. Loading has text; disabled has a visible reason when not obvious.
- Navigation links and action buttons are separate semantic elements; do not use a polymorphic `as` component factory.
- Common responsiveness: width follows container, long labels wrap, status text never clips, controls remain reachable by touch.
- Common motion: 150ms focus/hover colors; optional 2px hover lift only on decorative marketing cards. Never move app controls during interaction.
- Common tests: verify behavior/accessibility, not snapshots of every style or trivial render assertions.

## Foundation inventory

| Component / purpose | Main props and variants | State and keyboard contract | Responsive / motion / dependencies | Example use and meaningful check |
| --- | --- | --- | --- | --- |
| Button: mutations | `children`, `onClick`, `type`, `variant: primary/secondary/danger`, `loading`, `disabled`; regular/large | Native Enter/Space, disabled duplicate submit, loading text; focus stays stable | Full width on narrow forms; CSS only | Submit profile; verify single pending submission and restored ability after error |
| IconButton: compact actions | `label`, `children`, `onClick`, `disabled` | Accessible label, native activation; tooltip unnecessary for meaning | 44px target, no layout movement | Close menu; test label and focus return |
| FormField: persistent label/error layout | `id`, `label`, `hint`, `error`, `required`, `children` | Connect label, hint and error IDs; invalid state communicated | One column; Originkit-inspired border focus; no dependency | Email input; verify associated label and error |
| PasswordInput | Input attributes, visible state owned inside | Show/hide button has changing accessible name and `type=button`; preserve selection/value and autocomplete | No shaking; CSS focus | Login password; test toggle does not submit or clear |
| Native input/textarea/select | Standard `name/value/onChange`, rows/options | Native keyboard; no custom combobox | Min width 0, 44px control; use inside FormField | Branch select; test keyboard choice and preserved value |
| Native checkbox/radio | Standard checked/change; grouped in fieldset | Native Space and radio arrow behavior | Whole label clickable, visible focus | Availability/privacy setting; test saved selection |
| StatusBadge / SkillTag | `label`, `tone`; static only | Text conveys state; no interactive role on static tags | Wrap naturally; no pulsing | Pending request and React skill; verify label not color-only |
| Avatar | `name`, optional `src`, small/regular | Image alt based on context; initials fallback | Fixed dimensions to avoid shift | PersonCard; test failed image fallback |
| Alert | `title`, `children`, `tone` | New blocking error uses alert once; routine success uses polite status | Wrapping text; immediate appearance | Capacity conflict; test message and recovery action |
| LoadingState / Skeleton | `label`, optional skeleton shape | Loading label announced; placeholder shapes hidden to AT; container busy | Reserve final size; no shimmer in reduced motion | Fetch teams; test transitions to error/empty/success |
| EmptyState / ErrorState | `title`, `description`, optional action | Action is native link/button; retry preserves context | Centered but concise; no dependency | No teams match; test reset filters works |
| Dialog / ConfirmDialog | `title`, `open`, `onClose`, body/actions | Native dialog showModal, Escape, initial focus, return focus; cancel default for destructive action | Fits small screen, internal scroll, no zoom | Report or archive; test trap/return and cancel path |
| FAQ | Array of question/answer | Native details/summary, Enter/Space | Stacked, no animated height necessary | Landing questions; verify keyboard expansion |
| Pagination | `page`, `totalPages`, `onChange` or links | Current page announced, Previous/Next named; no unusable disabled links | Wrap; navigation focus/announcements clear | Discovery; test last page/filter reset |
| ProfileProgress | `completeCount`, `totalCount`, next-step link | Text describes completeness, not ability; native progress where appropriate | Static bar; no animated counter | Dashboard; test zero/complete and optional fields skipped |

Prefer an inline persistent Alert to a toast for critical outcomes. A non-critical Toast can be added only if multiple pages need transient feedback; it needs a polite live region, manual dismiss and enough reading time. Defer tooltips, drag handles, custom dropdowns, switches, custom tabs and progress spinners until an actual interaction needs them. My Teams can start with simple filter buttons and `aria-pressed`; use a full tab keyboard model only if real tab panels are chosen.

## Layout and motion

| Component | Contract and composition | Behavior and verification |
| --- | --- | --- |
| SiteHeader / MobileNavigation | Public links, logged-in action when known; `menuOpen` local state | Sticky, keyboard-operable disclosure button with expanded/control IDs; close on link and Escape; no hidden focusable links |
| SiteFooter | Real route links and product identity | Normal flow, no placeholder hrefs/social links; wrap on mobile |
| Container / Section | Children, optional label/id, className | Max-width/gutters shared CSS; preserve semantic heading order; avoid a component for every div |
| AuthLayout | Heading, introduction, form children, optional shared visual | One form column on mobile, visual rail desktop; heading/focus announces route |
| AppLayout | Session summary, navigation, main children | Sidebar desktop, labeled mobile nav with space reserved; main landmark and skip link |
| AdminLayout | Authorized navigation, main children | Role-aware UI, server authorization required; no admin data fetched for students |
| Reveal | Children, optional delay, className | One-time observer; disconnect on cleanup; content visible if observer unavailable; reduced motion immediate |
| HeroNetwork | Decorative SVG only | `aria-hidden`, pointer-events none; static lines/nodes; no information encoded only in graphic |

## Product inventory

| Component | Props / variants | Interaction and states | Use / verification |
| --- | --- | --- | --- |
| PersonCard | `person`, `demo?: boolean`; compact/full | Profile link, skills/availability; invite through explicit action, no entire nested clickable card | Public examples visibly fictional; private data respects response visibility |
| TeamCard | `team`; recruiting/full/closed/archived | Detail link, capacity includes leader, role tags; no join without checking detail/state | Discover teams; count/status matches service data |
| EventCard / EventDetails | `event`; upcoming/ongoing/past | Time zone, deadline, organizer/source, labeled external link | Official registration isn't platform registration; test date and URL |
| SearchFilters | `filters`, `onChange`, `onReset` | Native form/select/checks; results announcement; URL page reset | People/teams/events; test combination, empty result and back navigation |
| ProfileForm | Profile + save callback | Academic/skills/interests/roles/availability/link sections; errors and pending save | Onboarding/edit; optional social links never block completion |
| TeamForm | Initial team, skills/roles, event choices, save callback | Capacity according to server policy; preview, save/failure; retains text | Create/edit; no client-only limit claimed authoritative |
| RequestItem / InviteItem | Entity + permitted callbacks | Explicit status label, pending actions, expired/conflict feedback | My Teams/review; duplicate click and stale response handled |
| MemberList / TeamActions | Team and service-provided permissions | Leader/member badges; edit/review/close/remove only when allowed | Detail; server still rejects tampered unauthorized calls |
| NotificationItem | Notification + mark-read callback | Unread label, destination, timestamp; pending/error | List; mark read persists and invalid destination handled |
| ReportDialog / ReportQueue | Target/reason and submit; reports for admin | Descriptive label; confirm receipt only from service; admin decision states | Safety workflow; student can't load moderator queue |
| AccessState | Session/verification/permission state | Verify/login/support action, no private content underneath | Route gating and expired session; direct URL tests |

No MatchIndicator percentage component until a validated server contract and meaningful explanation exist. No ChatWindow, TaskBoard or workspace components in MVP.
