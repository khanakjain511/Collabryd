import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const WEB_ROOT = path.resolve(import.meta.dirname, "..");
const SEAT_PATH = path.join(WEB_ROOT, "src/components/Seat.tsx");
const UI_PATH = path.join(WEB_ROOT, "src/components/ui.tsx");
const PRELOADER_PATH = path.join(WEB_ROOT, "src/components/Preloader.tsx");
const ROSTER_PATH = path.join(WEB_ROOT, "src/components/Roster.tsx");
const CARDS_PATH = path.join(WEB_ROOT, "src/components/Cards.tsx");
const LANDING_PATH = path.join(WEB_ROOT, "src/pages/LandingPage.tsx");
const TEAMS_PATH = path.join(WEB_ROOT, "src/pages/TeamsPages.tsx");
const DISCOVER_PATH = path.join(WEB_ROOT, "src/pages/DiscoverPage.tsx");
const EVENTS_PATH = path.join(WEB_ROOT, "src/pages/EventPages.tsx");

// --- 1. Filled vs Open States & Non-Color Shape Differentiation ---
test("Seat.tsx implements filled, open, and skeleton states with solid vs dashed non-color distinction", () => {
  const content = fs.readFileSync(SEAT_PATH, "utf8");

  // Filled state styling: solid border, primary background, white text/pip
  assert.ok(
    content.includes("border-2 border-solid border-primary bg-primary text-on-primary"),
    "Filled state must use solid border-primary, bg-primary, text-on-primary",
  );

  // Open state styling: dashed border, seat-open token, translucent fill
  assert.ok(
    content.includes("border-2 border-dashed border-seat-open bg-seat-open/10 text-seat-open"),
    "Open state must use dashed border-seat-open, bg-seat-open/10, text-seat-open",
  );

  // Skeleton state styling: neutral pulsing
  assert.ok(
    content.includes("border-2 border-solid border-border bg-soft animate-pulse"),
    "Skeleton state must use border-border bg-soft animate-pulse",
  );

  // Non-color shape differentiation:
  // Open seats show '+' glyph (or dashed pip at sm); filled seats show occupant initials or solid pip.
  assert.ok(
    content.includes('aria-hidden="true"') && content.includes("+"),
    "Open state must render '+' indicator for non-color shape differentiation",
  );
  assert.ok(
    content.includes("occupantName.trim().charAt(0).toUpperCase()"),
    "Filled state must render uppercase occupant initial glyph for non-color identification",
  );
  assert.ok(
    content.includes("bg-on-primary/90 pointer-events-none"),
    "Filled state must render solid inner disk pip when occupant name is absent",
  );
});

// --- 2. Sizing Hierarchy (sm, md, lg) ---
test("Seat.tsx provides sm (12-14px), md (20-24px), and lg (32-40px) sizes with box-border", () => {
  const content = fs.readFileSync(SEAT_PATH, "utf8");

  // sm: 12-14px pip range (w-3.5 = 14px)
  assert.ok(
    content.includes('"w-3.5 h-3.5 min-w-[14px] min-h-[14px] text-[8px]"'),
    "sm size must match 12-14px pip dimension range",
  );

  // md: 20-24px preview card range (w-6 = 24px)
  assert.ok(
    content.includes('"w-6 h-6 min-w-[24px] min-h-[24px] text-xs"'),
    "md size must match 20-24px card preview dimension range",
  );

  // lg: 32-40px hero/detail range (w-10 = 40px)
  assert.ok(
    content.includes('"w-10 h-10 min-w-[40px] min-h-[40px] text-base"'),
    "lg size must match 32-40px hero/detail dimension range",
  );

  // box-border geometry ensures 0 layout shift between states
  assert.ok(
    content.includes("box-border"),
    "Seat element must specify box-border to prevent layout shift between solid and dashed borders",
  );
});

// --- 3. Accessibility & Decorative Mode ---
test("Seat.tsx adheres to WCAG 2.1 accessibility and decorative contract", () => {
  const content = fs.readFileSync(SEAT_PATH, "utf8");

  // Non-decorative ARIA semantics
  assert.ok(
    content.includes('role={decorative ? undefined : "img"}'),
    "Non-decorative seat renders role='img'",
  );
  assert.ok(
    content.includes('aria-hidden={decorative ? true : undefined}'),
    "Decorative seat sets aria-hidden=true",
  );
  assert.ok(
    content.includes('status === "open"\n      ? "Open seat"'),
    "Open seat aria-label evaluates to 'Open seat'",
  );
  assert.ok(
    content.includes('`Filled by ${occupantName || "teammate"}`'),
    "Filled seat aria-label announces occupant or fallback 'teammate'",
  );

  // Interactive button support
  assert.ok(
    content.includes("onClick && !decorative"),
    "Provides interactive button rendering when onClick is provided",
  );
  assert.ok(
    content.includes("focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"),
    "Interactive seat provides visible keyboard focus ring",
  );
});

test("Seats group component maintains semantics, capacity, and backwards compatibility", () => {
  const content = fs.readFileSync(SEAT_PATH, "utf8");

  // Preserves .seats class
  assert.ok(
    content.includes("seats inline-flex items-center"),
    "Preserves .seats class for CSS keyframe hooks",
  );

  // Accessible group semantics
  assert.ok(
    content.includes('role={decorative ? undefined : "group"}'),
    "Composite seats render role='group' when non-decorative",
  );
  assert.ok(
    content.includes('`${filled} of ${capacity} seats filled (${openCount} open)`'),
    "Composite seats calculate clear group summary aria-label",
  );

  // Backwards-compatible large prop
  assert.ok(
    content.includes('effectiveSize: SeatSize = size ?? (large ? "lg" : "sm")'),
    "large=true maps to size='lg'",
  );

  // Child seats decorative inside group
  assert.ok(
    content.includes("decorative={true}"),
    "Child seats inside group are decorative to avoid assistive technology verbosity",
  );

  // Capacity overflow indicator
  assert.ok(
    content.includes("+{capacity - visible}"),
    "Renders +N indicator when capacity exceeds visible threshold",
  );

  // Skeletons
  assert.ok(
    content.includes("export function SeatSkeleton"),
    "Exports SeatSkeleton component",
  );
  assert.ok(
    content.includes("export function SeatsSkeleton"),
    "Exports SeatsSkeleton component",
  );
});

// --- 4. Preloader Duration & Skippability ---
test("Intro docks identity, remains skippable, and cleans animations", () => {
 const source = fs.readFileSync(PRELOADER_PATH, "utf8");
 assert.ok(source.includes("await rise.finished"));
 assert.ok(source.includes("header .logo"));
 assert.ok(source.includes("Skip intro"));
 assert.ok(source.includes("if (reducedMotion) { onComplete(); return; }"));
 assert.ok(source.includes("animations.forEach(a=>a.cancel())"));
 assert.ok(source.includes('document.body.style.overflow=previous'));
});

// --- 7. App-Wide Integration Across Routes & Components ---
test("UI and App components integrate Seat and Seats across routes", () => {
  // ui.tsx exports and EmptyState
  const uiSource = fs.readFileSync(UI_PATH, "utf8");
  assert.ok(
    uiSource.includes('export {\n  Seat,\n  Seats,\n  SeatSkeleton,\n  SeatsSkeleton,'),
    "ui.tsx re-exports Seat primitives",
  );
  assert.ok(
    uiSource.includes('<Seat status="open" size="lg" decorative />'),
    "EmptyState renders large open seat as focal indicator",
  );

  // Roster.tsx
  const rosterSource = fs.readFileSync(ROSTER_PATH, "utf8");
  assert.ok(
    rosterSource.includes("size = \"sm\""),
    "TeamSeats accepts size prop defaulting to sm",
  );
  assert.ok(
    rosterSource.includes("export function RosterSkeleton"),
    "Roster.tsx exports RosterSkeleton",
  );

  // Cards.tsx
  const cardsSource = fs.readFileSync(CARDS_PATH, "utf8");
  assert.ok(
    cardsSource.includes('<TeamSeats team={team} size="md" />'),
    "TeamCard passes size='md' to TeamSeats",
  );
  assert.ok(
    cardsSource.includes("export function TeamCardSkeleton"),
    "Cards.tsx exports TeamCardSkeleton",
  );

  // LandingPage.tsx
  const landingSource = fs.readFileSync(LANDING_PATH, "utf8");
  assert.ok(
    landingSource.includes('size="md"') && landingSource.includes("TeamPreview"),
    "LandingPage TeamPreview uses size='md'",
  );
  assert.ok(
    landingSource.includes('<Seat status="open" size="sm" decorative />'),
    "LandingPage role picker renders open seat indicator",
  );

  // TeamsPages.tsx
  const teamsSource = fs.readFileSync(TEAMS_PATH, "utf8");
  assert.ok(
    teamsSource.includes('<Seat status="open" size="md" decorative />'),
    "TeamDetailPage renders explicit open seat slot cards for unfilled capacity",
  );
  assert.ok(
    teamsSource.includes('<TeamSeats team={team} size="md" />'),
    "TeamDetailPage passes size='md' to TeamSeats",
  );

  // DiscoverPage.tsx
  const discoverSource = fs.readFileSync(DISCOVER_PATH, "utf8");
  assert.ok(
    discoverSource.includes('status={person.available ? "open" : "filled"}'),
    "DiscoverPage uses atomic Seat with person.available status",
  );

  // EventPages.tsx
  const eventsSource = fs.readFileSync(EVENTS_PATH, "utf8");
  assert.ok(
    eventsSource.includes('status="filled" size="sm" inactive decorative'),
    "EventPages uses atomic Seat for full events",
  );
});
