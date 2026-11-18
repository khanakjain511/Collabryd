import { useState } from "react";
import type { ReactNode } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { Avatar, Icon, Logo } from "./ui";

export function SiteHeader({ demo }: { demo: DemoData }) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          event.currentTarget
            .querySelector<HTMLButtonElement>(".mobile-menu")
            ?.focus();
        }
      }}
    >
      <div className="container header-inner">
        <Logo />
        <nav
          className={`public-nav ${open ? "is-open" : ""}`}
          aria-label="Main navigation"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          <a href="#how-it-works" onClick={() => setOpen(false)}>
            How it works
          </a>
          <a href="#/teams" onClick={() => setOpen(false)}>
            Find your team
          </a>
          <a href="#/hackathons" onClick={() => setOpen(false)}>
            Hackathons
          </a>
          <a href="#faq" onClick={() => setOpen(false)}>
            FAQ
          </a>
        </nav>
        <div className="header-actions">
          <a
            className="login-link"
            href={demo.signedIn ? "#/dashboard" : "#/login"}
          >
            {demo.signedIn ? "Dashboard" : "Log in"}
          </a>
          <a className="button button-primary button-small" href="#/register">
            Get started <Icon name="arrowUp" size={16} />
          </a>
          <button
            type="button"
            className="icon-button mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        >
          {[
            ["How it works", "#how-it-works"],
            ["Find your team", "#/teams"],
            ["Hackathons", "#/hackathons"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
              <Icon name="arrowUp" />
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Logo />
          <p>
            Find people. Form teams.
            <br />
            Build something that matters.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <span>EXPLORE</span>
            <a href="#/discover">Find people</a>
            <a href="#/teams">Find a team</a>
            <a href="#/hackathons">Hackathons</a>
          </div>
          <div>
            <span>COLLABYRD</span>
            <a href="#/about">Our story</a>
            <a href="#/contact">Get in touch</a>
            <a href="#/privacy">Privacy</a>
            <a href="#/terms">Terms</a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Collabyrd. A campus-first idea.
        </span>
        <span>
          Built for the things we can do together{" "}
          <span aria-hidden="true">↗</span>
        </span>
      </div>
    </footer>
  );
}

const appLinks = [
  { label: "Overview", href: "#/dashboard", icon: "grid" },
  { label: "Discover people", href: "#/discover", icon: "search" },
  { label: "Explore teams", href: "#/teams", icon: "people" },
  { label: "My teams", href: "#/my-teams", icon: "code" },
  { label: "Hackathons", href: "#/hackathons", icon: "calendar" },
  { label: "Notifications", href: "#/notifications", icon: "bell" },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = demo.notices.filter((notice) => !notice.read).length;
  return (
    <div
      className="app-shell"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          event.currentTarget
            .querySelector<HTMLButtonElement>(".app-menu-button")
            ?.focus();
        }
      }}
    >
      <aside
        id="workspace-navigation"
        className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}
      >
        <Logo />
        <span className="workspace-label">YOUR CAMPUS, YOUR PEOPLE</span>
        <nav aria-label="Workspace">
          {appLinks.map((link) => (
            <a
              href={link.href}
              key={link.href}
              onClick={() => setMenuOpen(false)}
              className={path === link.href.slice(1) ? "active" : ""}
              aria-current={path === link.href.slice(1) ? "page" : undefined}
            >
              <Icon name={link.icon} />
              {link.label}
              {link.icon === "bell" && unread > 0 && (
                <span className="nav-count">{unread}</span>
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-note">
          <Icon name="spark" />
          <h3>
            Small team.
            <br />
            Big possibilities.
          </h3>
          <p>There’s a place for what you bring.</p>
          <a href="#/teams/create" onClick={() => setMenuOpen(false)}>
            Start a team <Icon name="arrowUp" size={16} />
          </a>
        </div>
        <div className="sidebar-bottom">
          <a href="#/settings/profile" onClick={() => setMenuOpen(false)}>
            <Icon name="settings" />
            Settings
          </a>
          <a href="#/admin" onClick={() => setMenuOpen(false)}>
            <Icon name="lock" />
            Demo review queue
          </a>
          <button type="button" onClick={demo.signOut}>
            <Icon name="logout" />
            Leave demo
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <button
            type="button"
            className="icon-button app-menu-button"
            aria-label="Toggle workspace navigation"
            aria-controls="workspace-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name="menu" />
          </button>
          <span className="campus-label">
            <span className="status-dot" /> Campus workspace{" "}
            <span className="subtle">/ example campus</span>
          </span>
          <div className="topbar-actions">
            <a
              href="#/notifications"
              className="icon-button notification-link"
              aria-label={`${unread} unread notifications`}
            >
              <Icon name="bell" />
              {unread > 0 && <span />}
            </a>
            <a href="#/settings/profile" className="profile-link">
              <Avatar name={demo.profile.name} small />
              <span>{demo.profile.name.split(" ")[0]}</span>
            </a>
          </div>
        </header>
        <div className="demo-strip">
          <span>
            <strong>Frontend demo</strong> · Fictional people and events.
            Changes reset on refresh.
          </span>
          <a href="#/about">
            About this demo <Icon name="arrowUp" size={13} />
          </a>
        </div>
        <main id="main" className="workspace-content">
          {demo.feedback && (
            <div className="feedback" role="status">
              <Icon name="check" />
              <span>{demo.feedback}</span>
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
        <footer className="app-footer">
          Made for collaboration. Designed for your campus.
          <a href="#/privacy">
            Privacy & demo information <Icon name="arrowUp" size={14} />
          </a>
        </footer>
      </div>
    </div>
  );
}

export function PublicLayout({
  demo,
  children,
}: {
  demo: DemoData;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader demo={demo} />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
