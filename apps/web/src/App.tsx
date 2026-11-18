import { useEffect, useState } from "react";
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
  AdminDemoPage,
  InfoPage,
  NotificationsPage,
  ProfileFormPage,
  SettingsPage,
} from "./pages/AccountPages";
import "./App.css";

// Native hash links give this dependency-free demo browser back/forward support.
// Replace this small switch with application routing when integrating the API.
function readPath() {
  return window.location.hash.startsWith("#/")
    ? window.location.hash.slice(1).split("?")[0]
    : "/";
}

function App() {
  const [path, setPath] = useState(readPath);
  const demo = useDemoData();

  useEffect(() => {
    function onNavigation() {
      setPath(readPath());
    }
    window.addEventListener("hashchange", onNavigation);
    return () => window.removeEventListener("hashchange", onNavigation);
  }, []);

  useEffect(() => {
    const title =
      path === "/"
        ? "Good ideas need great people"
        : path.split("/")[1].replaceAll("-", " ");
    document.title = `${title.charAt(0).toUpperCase() + title.slice(1)} · Collabyrd`;
    const section = document.getElementById(window.location.hash.slice(1));
    if (path === "/" && section) {
      section.scrollIntoView();
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    document
      .querySelector<HTMLElement>("main h1")
      ?.focus({ preventScroll: true });
  }, [path, demo.signedIn, demo.verified]);

  const [area, id] = path.slice(1).split("/");
  const authModes = [
    "login",
    "register",
    "verify-campus",
    "forgot-password",
    "reset-password",
  ] as const;
  const authMode = authModes.find((mode) => mode === area);
  let page;
  if (path === "/") page = <LandingPage demo={demo} />;
  else if (authMode) page = <AuthPage key={path} mode={authMode} demo={demo} />;
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
        <div className="container public-events">
          {id ? <EventDetailPage id={id} demo={demo} /> : <EventsPage />}
        </div>
      </PublicLayout>
    );
  else if (!demo.signedIn || !demo.verified)
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
    else if (area === "teams" && id)
      content = <TeamDetailPage key={id} id={id} demo={demo} />;
    else if (area === "teams") content = <TeamsPage demo={demo} />;
    else if (area === "my-teams") content = <MyTeamsPage demo={demo} />;
    else if (area === "hackathons" && id)
      content = <EventDetailPage id={id} demo={demo} />;
    else if (area === "hackathons") content = <EventsPage />;
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
    else if (area === "admin") content = <AdminDemoPage demo={demo} />;
    else return <InfoPage kind="not-found" demo={demo} />;
    page = (
      <AppLayout demo={demo} path={path}>
        {content}
      </AppLayout>
    );
  }
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.querySelector<HTMLElement>("main h1")?.focus();
        }}
      >
        Skip to content
      </a>
      {page}
    </>
  );
}

export default App;
