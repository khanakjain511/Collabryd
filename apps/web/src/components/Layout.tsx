import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { useSlidingIndicator } from "../hooks/useSlidingIndicator";
import { AppearanceControls } from "./AppearanceControls";
import { CinematicFooter } from "./CinematicFooter";
import { StaggeredMenu } from "./StaggeredMenu";
import { Icon, Logo, Seats } from "./ui";

export type LandingSection =
  "landing-top" | "how-it-works" | "campus-events" | "faq";
type SectionHandler = (section: LandingSection) => void;

export function SiteHeader({
  demo,
  onSection,
}: {
  demo: DemoData;
  onSection?: SectionHandler;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function navigate(section: LandingSection) {
    if (onSection) onSection(section);
    else window.location.hash = `/?section=${section}`;
  }
  const path = location.hash.split("?")[0];
  const [section, setSection] = useState(false);
  const activeIndex =
    section && onSection
      ? 0
      : path.startsWith("#/teams")
        ? 1
        : path.startsWith("#/hackathons")
          ? 2
          : -1;
  const publicNavRef = useRef<HTMLElement>(null);
  const publicIndicatorStyle = useSlidingIndicator(publicNavRef, activeIndex);
  const account = demo.signedIn ? "#/dashboard" : "#/login";

  return (
    <>
      <header className="site-header sticky top-0 z-40 bg-surface text-ink border-b border-border">
        <div className="container header-inner flex justify-between items-center min-h-[70px] gap-4">
          <Logo
            onHome={
              onSection
                ? () => {
                    setSection(false);
                    onSection("landing-top");
                  }
                : undefined
            }
          />
          <nav
            ref={publicNavRef}
            className="hidden"
            aria-label="Public pages"
          >
            <div
              className="bg-surface rounded-lg shadow-xs border border-border/50 pointer-events-none"
              aria-hidden="true"
              style={publicIndicatorStyle}
            />
            <button
              type="button"
              className={`relative z-10 flex-1 flex items-center justify-center h-full text-sm font-semibold rounded-lg transition-colors min-h-[40px] px-3 cursor-pointer ${
                activeIndex === 0 ? "text-ink font-bold" : "text-muted hover:text-ink"
              }`}
              aria-current={activeIndex === 0 ? "location" : undefined}
              onClick={() => {
                setSection(true);
                navigate("how-it-works");
              }}
            >
              How it works
            </button>
            <a
              href="#/teams"
              className={`relative z-10 flex-1 flex items-center justify-center h-full text-sm font-semibold rounded-lg transition-colors min-h-[40px] px-3 ${
                activeIndex === 1 ? "text-ink font-bold" : "text-muted hover:text-ink"
              }`}
              aria-current={activeIndex === 1 ? "page" : undefined}
            >
              Find a team
            </a>
            <a
              href="#/hackathons"
              className={`relative z-10 flex-1 flex items-center justify-center h-full text-sm font-semibold rounded-lg transition-colors min-h-[40px] px-3 ${
                activeIndex === 2 ? "text-ink font-bold" : "text-muted hover:text-ink"
              }`}
              aria-current={activeIndex === 2 ? "page" : undefined}
            >
              Hackathons
            </a>
          </nav>
          <div className="public-actions flex items-center gap-2 sm:gap-3">
            <AppearanceControls />
            <a
              className="login-link hidden sm:inline-flex items-center text-sm font-medium hover:text-primary hover:underline min-h-[44px] px-2"
              href={account}
            >
              {demo.signedIn ? "Workspace" : "Log in"}
            </a>
            <a
              className="hidden sm:inline-flex items-center justify-center rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm min-h-[44px] px-4 py-2"
              href={demo.signedIn ? "#/discover" : "#/register"}
            >
              {demo.signedIn ? "Find people" : "Sign up"}
            </a>
            <button
              type="button"
              ref={trigger}
              className="menu-trigger inline-flex items-center justify-center gap-2 border border-border min-h-[44px] min-w-[44px] rounded-lg bg-surface text-ink px-3 py-2 text-sm font-bold cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="staggered-menu-panel"
              onClick={() => setOpen((prev) => !prev)}
            >
              Menu <span aria-hidden="true">+</span>
            </button>
          </div>
        </div>
      </header>
      <StaggeredMenu
        isOpen={open}
        triggerRef={trigger}
        onMenuClose={() => setOpen(false)}
        items={[
          {
            label: "How it works",
            ariaLabel: "Scroll to how it works section",
            onClick: () => {
              setSection(true);
              navigate("how-it-works");
            },
          },
          {
            label: "Find people",
            ariaLabel: "Navigate to find people",
            link: "#/discover",
          },
          {
            label: "Explore teams",
            ariaLabel: "Navigate to explore teams",
            link: "#/teams",
          },
          {
            label: "Hackathons",
            ariaLabel: "Navigate to hackathons",
            link: "#/hackathons",
          },
        ]}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!demo.signedIn ? (
              <>
                <a
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-lg border border-border bg-surface text-ink hover:bg-soft transition-colors min-h-[44px]"
                  onClick={() => setOpen(false)}
                  href="#/login"
                >
                  Log in
                </a>
                <a
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-lg bg-accent text-on-accent hover:bg-accent/90 transition-colors shadow-sm min-h-[44px]"
                  onClick={() => setOpen(false)}
                  href="#/register"
                >
                  Sign up
                </a>
              </>
            ) : (
              <a
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-lg bg-accent text-on-accent hover:bg-accent/90 transition-colors shadow-sm min-h-[44px]"
                onClick={() => setOpen(false)}
                href="#/dashboard"
              >
                Open workspace
              </a>
            )}
          </div>
          <AppearanceControls showMotion />
        </div>
      </StaggeredMenu>
    </>
  );
}

export function SiteFooter({ onSection }: { onSection?: SectionHandler }) {
  return <CinematicFooter onSection={onSection} />;
}

const appLinks = [
  { label: "Home", href: "#/dashboard", icon: "grid", areas: ["dashboard"] },
  {
    label: "People",
    href: "#/discover",
    icon: "search",
    areas: ["discover", "users"],
  },
  {
    label: "Teams",
    href: "#/teams",
    icon: "people",
    areas: ["teams", "my-teams"],
  },
  {
    label: "Hackathons",
    href: "#/hackathons",
    icon: "calendar",
    areas: ["hackathons"],
  },
  {
    label: "Messages",
    href: "#/messages",
    icon: "mail",
    areas: ["messages"],
  },
  {
    label: "Profile",
    href: "#/settings/profile",
    icon: "settings",
    areas: ["settings", "onboarding", "admin"],
  },
] as const;

export function AppLayout({
  demo,
  path,
  children,
}: {
  demo: DemoData;
  path: string;
  children: ReactNode;
}) {
  const unread = (demo?.notices || []).filter((notice) => !notice.read).length;
  const area = path.split("/")[1];
  const active = appLinks.findIndex((link) =>
    (link.areas as readonly string[]).includes(area),
  );
  const appNavRef = useRef<HTMLElement>(null);
  const appIndicatorStyle = useSlidingIndicator(appNavRef, active);

  return (
    <div className="workspace-shell min-h-screen flex flex-col">
      <div
        className="wash pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
      />
      <header className="workspace-header sticky top-0 z-40 bg-surface text-ink border-b border-border">
        <div className="container workspace-bar flex justify-between items-center min-h-[70px] gap-4">
          <Logo />
          <nav
            ref={appNavRef}
            className="hidden lg:flex relative isolate items-center bg-soft border border-border p-1 rounded-xl h-12 w-full max-w-[590px]"
            aria-label="Workspace"
          >
            <div
              className="bg-surface rounded-lg shadow-xs border border-border/50 pointer-events-none"
              aria-hidden="true"
              style={appIndicatorStyle}
            />
            {appLinks.map(({ label, href, icon }, index) => {
              const isActive = index === active;
              return (
                <a
                  href={href}
                  key={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 h-full text-sm font-semibold rounded-lg transition-colors min-h-[40px] px-2 ${
                    isActive ? "text-ink font-bold" : "text-muted hover:text-ink"
                  }`}
                >
                  <Icon name={icon} size={17} />
                  <span>{label}</span>
                </a>
              );
            })}
          </nav>
          <div className="workspace-actions flex items-center gap-2">
            <AppearanceControls />
            <a
              href="#/notifications"
              className="icon-button workspace-notifications relative"
              aria-label={`Notifications, ${unread} unread`}
              aria-current={area === "notifications" ? "page" : undefined}
            >
              <Icon name="bell" />
              {unread > 0 && <span />}
            </a>
          </div>
        </div>
      </header>
      {(area === "teams" || area === "my-teams") && (
        <nav
          className="container workspace-subnav flex gap-5 border-b border-border py-2.5 text-sm"
          aria-label="Team pages"
        >
          <a
            href="#/teams"
            aria-current={area === "teams" ? "page" : undefined}
          >
            Explore teams
          </a>
          <a
            href="#/my-teams"
            aria-current={area === "my-teams" ? "page" : undefined}
          >
            My teams
          </a>
        </nav>
      )}
      {(area === "settings" || area === "admin") && (
        <nav
          className="container workspace-subnav flex gap-5 border-b border-border py-2.5 text-sm"
          aria-label="Profile and settings pages"
        >
          <a
            href="#/settings/profile"
            aria-current={path === "/settings/profile" ? "page" : undefined}
          >
            Profile
          </a>
          <a
            href="#/settings/privacy"
            aria-current={path === "/settings/privacy" ? "page" : undefined}
          >
            Privacy
          </a>
          <a
            href="#/settings/account"
            aria-current={path === "/settings/account" ? "page" : undefined}
          >
            Account
          </a>
          {demo.isAdmin && (
            <a
              href="#/admin"
              aria-current={area === "admin" ? "page" : undefined}
            >
              Admin review
            </a>
          )}
        </nav>
      )}
      <main id="main" className="workspace-content flex-1 pt-8 pb-24 lg:pb-8 container">
        {demo.feedback && (
          <div
            className="feedback bg-success-bg text-success border border-border rounded-lg px-4 py-2.5 flex items-center gap-2.5 mb-5"
            role="status"
          >
            <Icon name="check" />
            <span className="flex-1 text-sm">{demo.feedback}</span>
            <button
              type="button"
              className="icon-button"
              onClick={() => demo.setFeedback("")}
              aria-label="Dismiss update"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
        {children}
      </main>

      {/* Signed-in Mobile Bottom Tab Bar */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 px-2 shadow-lg"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 items-center justify-items-center max-w-lg mx-auto">
          {appLinks.map(({ label, href, icon }, index) => {
            const isActive = index === active;
            return (
              <a
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] w-full px-1 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted hover:text-ink"
                }`}
              >
                <Icon name={icon} size={20} />
                <span className="mt-1 leading-none">{label}</span>
              </a>
            );
          })}
        </div>
      </nav>

      <footer className="container workspace-footer flex justify-between items-center py-5 border-t border-border text-xs text-muted mb-16 lg:mb-0">
        <Seats capacity={3} filled={2} decorative />
        <a href="#/privacy">Privacy & Terms</a>
      </footer>
    </div>
  );
}

export function PublicLayout({
  demo,
  children,
  onSection,
}: {
  demo: DemoData;
  children: ReactNode;
  onSection?: SectionHandler;
}) {
  return (
    <>
      <div
        className="wash pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
      />
      <SiteHeader demo={demo} onSection={onSection} />
      <main id="main">{children}</main>
      <SiteFooter onSection={onSection} />
    </>
  );
}
