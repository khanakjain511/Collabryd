import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useAppearance } from "./hooks/useAppearance";
import { useDemoData } from "./hooks/useDemoData";
import { AppLayout, PublicLayout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { AccessPage, AuthPage } from "./pages/AuthPages";
import { DashboardPage } from "./pages/DashboardPage";
import { DiscoverPage, PersonPage } from "./pages/DiscoverPage";
import {
  CreateTeamPage,
  MyTeamsPage,
  TeamDetailPage,
  TeamsPage,
} from "./pages/TeamsPages";
import { EventDetailPage, EventsPage } from "./pages/EventPages";
import {
  InfoPage,
  NotificationsPage,
  ProfileFormPage,
  SettingsPage,
} from "./pages/AccountPages";
import { MessagesPage } from "./pages/MessagesPage";
import { AdminPage } from "./pages/AdminPages";
import { CampusSprite } from "./components/CampusSprite";
import { Preloader } from "./components/Preloader";
import { EmptyState } from "./components/ui";

// Native hash links keep browser back/forward support without a router library.
// Replace this small switch with application routing when integrating the API.
function readPath() {
  if (window.location.hash.startsWith("#token=")) return "/verify-campus";
  return window.location.hash.startsWith("#/")
    ? window.location.hash.slice(1).split("?")[0]
    : "/";
}

function App() {
  const [path, setPath] = useState(readPath);
  const [crossfade, setCrossfade] = useState(false);
  const demo = useDemoData();
  const { reducedMotion } = useAppearance();
  const [intro, setIntro] = useState(() => {
    if (readPath() !== "/") return false;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return false;
    }
    try {
      const motion = localStorage.getItem("collabyrd-motion");
      if (motion === "reduced" || motion === "off") return false;
      return sessionStorage.getItem("collabyrd-intro") !== "seen";
    } catch {
      return true;
    }
  });
  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem("collabyrd-intro", "seen");
    } catch {
      /* Optional storage. */
    }
    setIntro(false);
  }, []);

  useEffect(() => {
    if (reducedMotion && intro) {
      queueMicrotask(finishIntro);
    }
  }, [reducedMotion, intro, finishIntro]);

  useEffect(() => {
    function onNavigation() {
      const next = readPath();
      if (next === path) return;
      const accountRoutes = [
        "/login",
        "/register",
        "/verify-campus",
        "/forgot-password",
        "/reset-password",
        "/onboarding",
      ];
      const isAccountSwitch =
        accountRoutes.includes(path) && accountRoutes.includes(next);
      if (isAccountSwitch && !reducedMotion && document.startViewTransition) {
        const transition = document.startViewTransition(() => {
          flushSync(() => {
            setPath(readPath());
            setCrossfade(false);
          });
        });
        void transition.ready.catch(() => {});
      } else {
        setCrossfade(isAccountSwitch && !reducedMotion);
        setPath(next);
      }
    }
    window.addEventListener("hashchange", onNavigation);
    return () => window.removeEventListener("hashchange", onNavigation);
  }, [path, reducedMotion]);

  useEffect(() => {
    const title =
      path === "/"
        ? "Every team starts with an open seat"
        : path.split("/")[1].replaceAll("-", " ");
    document.title = `${title.charAt(0).toUpperCase() + title.slice(1)} · Collabyrd`;
    if (intro || (path === "/" && location.hash.includes("?section="))) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    document
      .querySelector<HTMLElement>("main h1")
      ?.focus({ preventScroll: true });
  }, [path, intro, demo.signedIn, demo.verified, demo.profile.status]);

  const [area, id, action] = path.slice(1).split("/");
  const authModes = [
    "login",
    "register",
    "verify-campus",
    "forgot-password",
    "reset-password",
  ] as const;
  const authMode = authModes.find((mode) => mode === area);
  let page;
  if (path === "/") page = <LandingPage demo={demo} active={!intro} />;
  else if (authMode)
    page = (
      <AuthPage
        mode={authMode}
        demo={demo}
        crossfade={crossfade && !reducedMotion}
      />
    );
  else if (["about", "contact", "privacy", "terms"].includes(area))
    page = <InfoPage kind={area} demo={demo} />;
  else if (
    ![
      "dashboard",
      "discover",
      "users",
      "teams",
      "my-teams",
      "hackathons",
      "messages",
      "notifications",
      "onboarding",
      "settings",
      "admin",
    ].includes(area)
  )
    page = <InfoPage kind="not-found" demo={demo} />;
  else if (area === "hackathons" && !demo.signedIn)
    page = (
      <PublicLayout demo={demo}>
        <div className="container public-events py-8">
          {id ? (
            <EventDetailPage id={id} demo={demo} />
          ) : (
            <EventsPage demo={demo} />
          )}
        </div>
      </PublicLayout>
    );
  else if (
    !demo.signedIn ||
    !demo.verified ||
    demo.profile.status === "Suspended"
  )
    page = (
      <PublicLayout demo={demo}>
        <AccessPage demo={demo} />
      </PublicLayout>
    );
  else {
    let content;
    if (area === "dashboard") content = <DashboardPage demo={demo} />;
    else if (area === "discover") content = <DiscoverPage demo={demo} />;
    else if (area === "users")
      content = <PersonPage key={id} id={id} demo={demo} />;
    else if (area === "teams" && id === "create")
      content = <CreateTeamPage demo={demo} />;
    else if (area === "teams" && id && action === "edit")
      content = <CreateTeamPage key={path} id={id} demo={demo} />;
    else if (area === "teams" && id)
      content = <TeamDetailPage key={id} id={id} demo={demo} />;
    else if (area === "teams") content = <TeamsPage demo={demo} />;
    else if (area === "my-teams") content = <MyTeamsPage demo={demo} />;
    else if (area === "hackathons" && id)
      content = <EventDetailPage id={id} demo={demo} />;
    else if (area === "hackathons") content = <EventsPage demo={demo} />;
    else if (area === "messages")
      content = <MessagesPage key={path} conversationId={id} demo={demo} />;
    else if (area === "notifications")
      content = <NotificationsPage demo={demo} />;
    else if (area === "onboarding" || (area === "settings" && id === "profile"))
      content = (
        <ProfileFormPage
          key={path}
          demo={demo}
          onboarding={area === "onboarding"}
        />
      );
    else if (area === "settings" && (id === "privacy" || id === "account"))
      content = <SettingsPage key={id} kind={id} demo={demo} />;
    else if (area === "admin") {
      if (!demo.isAdmin) {
        content = (
          <EmptyState
            title="Administrator access required"
            description="You need campus administrator privileges to access this control panel."
            action={
              <a
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors cursor-pointer"
                href="#/dashboard"
              >
                Go to Dashboard
              </a>
            }
          />
        );
      } else {
        content = <AdminPage key={path} view={id} eventId={action} demo={demo} />;
      }
    } else return <InfoPage kind="not-found" demo={demo} />;
    page = (
      <AppLayout demo={demo} path={path}>
        {content}
      </AppLayout>
    );
  }
  return (
    <>
      <a
        className="skip-link fixed left-5 -top-20 focus:top-3 z-[120] bg-primary text-on-primary py-3.5 px-5 rounded-lg font-semibold transition-[top]"
        inert={intro}
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.querySelector<HTMLElement>("main h1")?.focus();
        }}
      >
        Skip to content
      </a>
      <div inert={intro}>{page}</div>
      {!intro && <CampusSprite />}
      {intro && <Preloader onComplete={finishIntro} />}
    </>
  );
}

export default App;
