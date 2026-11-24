import { useCallback, useEffect, useRef, useState } from "react";
import type Lenis from "lenis";
import type { DemoData } from "../hooks/useDemoData";
import { useAppearance } from "../hooks/useAppearance";
import { loadMotion, motionStage, scrollToSection } from "../lib/motion";
import { PublicLayout, type LandingSection } from "../components/Layout";
import { Avatar, Badge, Icon, Seat, Seats } from "../components/ui";
import { HorizontalScrollSection } from "../components/HorizontalScrollSection";
import { ScrollExpand } from "../components/ScrollExpand";
import { ScrollReveal } from "../components/ScrollReveal";
import { demoPeople, demoTeams, eventDate } from "../data/demo";

const example = demoTeams.find((team) => team.id === "greenbyte")!;
const roles = [
  { title: "Product designer", person: "maya" },
  { title: "Frontend developer", person: "tara" },
];

function TeamPreview() {
  const [selected, setSelected] = useState(roles[0]);
  const person = demoPeople.find(({ id }) => id === selected.person)!;
  return (
    <article
      className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-lg max-w-xl mx-auto w-full"
      aria-label="Featured team"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="grid place-items-center w-11 h-11 rounded-xl bg-sage text-primary shrink-0">
          <Icon name="leaf" />
        </span>
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-primary">
            Featured team
          </span>
          <h3 className="font-display text-2xl sm:text-3xl font-medium">{example.name}</h3>
        </div>
        <div className="ml-auto grid justify-items-start gap-1 text-muted text-xs">
          <Seats
            capacity={example.capacity}
            filled={example.members.length}
            size="md"
            decorative
          />
          <span>
            {example.members.length} of {example.capacity} seats filled
          </span>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted mb-4">
        {example.description}
      </p>
      <div
        className="flex flex-wrap gap-2 my-4"
        role="group"
        aria-label="Open roles"
      >
        {roles.map((role) => (
          <button
            type="button"
            key={role.person}
            aria-pressed={selected === role}
            onClick={() => setSelected(role)}
            className={`inline-flex items-center gap-2 min-h-[44px] rounded-lg px-3 py-2 border text-xs font-bold transition-colors cursor-pointer ${
              selected === role
                ? "border-primary bg-primary text-on-primary"
                : "border-border bg-surface text-ink hover:bg-soft"
            }`}
          >
            <Seat status="open" size="sm" decorative />
            {role.title}
          </button>
        ))}
      </div>
      <div
        className="flex flex-wrap items-center gap-2.5 p-3 bg-soft rounded-xl"
        aria-live="polite"
      >
        <Avatar name={person.name} color={person.color} />
        <div className="grid gap-0.5 mr-auto">
          <strong className="text-sm font-semibold">{person.name}</strong>
          <span className="text-xs text-muted">{person.role}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {person.skills.slice(0, 2).map((skill) => (
            <Badge key={skill}>{skill}</Badge>
          ))}
        </div>
      </div>
      <a
        className="inline-flex items-center gap-2 font-medium text-sm text-primary hover:underline mt-4"
        href={`#/teams/${example.id}`}
      >
        View full team profile <Icon name="arrowUp" size={15} />
      </a>
    </article>
  );
}

const howItWorksSteps = [
  {
    step: "01",
    title: "Define Open Seats",
    description:
      "Start with a project vision. Outline the specific roles, skills, and time commitment required for each open seat.",
    icon: "grid",
    badge: "Step 1",
  },
  {
    step: "02",
    title: "Discover Campus Peers",
    description:
      "Filter by skills, semester, and hackathon interest. See project interests, skills, and collaborator availability.",
    icon: "search",
    badge: "Step 2",
  },
  {
    step: "03",
    title: "Connect & Lock Roster",
    description:
      "Send a request with a short introduction. Review invitations and bring complementary skills into your roster.",
    icon: "people",
    badge: "Step 3",
  },
  {
    step: "04",
    title: "Compete & Build",
    description:
      "Enter campus hackathons, submit unified project proposals, and turn student side-projects into shipped products.",
    icon: "calendar",
    badge: "Step 4",
  },
];

export function LandingPage({
  demo,
  active = true,
}: {
  demo: DemoData;
  active?: boolean;
}) {
  const { reducedMotion } = useAppearance();
  const lenis = useRef<Lenis | null>(null);
  const scrollTo = useCallback(
    (id: LandingSection) => {
      scrollToSection(id, lenis.current, reducedMotion);
    },
    [reducedMotion],
  );

  useEffect(() => {
    if (!active || reducedMotion || motionStage < 2) return;
    let activeEffect = true;
    let session: { destroy: () => void; lenis: Lenis } | null = null;

    void loadMotion()
      .then(({ initScrollInfra }) => {
        if (!activeEffect) return;
        session = initScrollInfra();
        lenis.current = session.lenis;
      })
      .catch(() => {});

    return () => {
      activeEffect = false;
      if (session) {
        session.destroy();
        session = null;
      }
      lenis.current = null;
    };
  }, [active, reducedMotion]);

  useEffect(() => {
    if (!active) return;
    const navigate = () => {
      const id = new URLSearchParams(location.hash.split("?")[1]).get(
        "section",
      );
      if (id === "how-it-works" || id === "campus-events" || id === "faq")
        scrollTo(id);
    };
    navigate();
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, [active, scrollTo]);

  const [today] = useState(Date.now);
  const events = demo.events
    .filter(
      (event) =>
        (!event.publication || event.publication === "Published") &&
        new Date(event.date).getTime() >= today,
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);
  const accountLink = demo.signedIn ? "#/discover" : "#/register";

  return (
    <PublicLayout demo={demo} onSection={scrollTo}>
      {/* 1. HERO: ScrollExpand with useWindowScroll */}
      <div id="landing-top" className="scroll-mt-20 overflow-x-clip">
        <ScrollExpand
          title="Every team starts with an open seat."
          scrollHint="Scroll to expand"
          useWindowScroll
          restingCTA={
            <div className="flex flex-wrap justify-center items-center gap-3">
              <a
                href={accountLink}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-md min-h-[48px]"
              >
                Find teammates <Icon name="arrowUp" size={17} />
              </a>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border border-border bg-surface text-ink hover:bg-soft transition-colors cursor-pointer min-h-[48px]"
                onClick={demo.openDemo}
              >
                Explore workspace
              </button>
            </div>
          }
        >
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
            <span className="text-xs uppercase font-extrabold tracking-widest text-primary mb-3 bg-surface/95 px-3 py-1 rounded-full text-ink shadow-xs">
              Campus Teammate Discovery
            </span>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white drop-shadow-md">
              Find partners with the exact skills your project needs.
            </h2>
            <p className="text-base sm:text-lg text-white/90 max-w-xl mb-6 drop-shadow-sm leading-relaxed">
              Explore student skills, find open roles, and build a team for your next campus project.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="#/discover"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-md min-h-[48px]"
              >
                Discover People <Icon name="arrowUp" size={16} />
              </a>
              <a
                href="#/teams"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-surface text-ink hover:bg-soft transition-colors shadow-md min-h-[48px]"
              >
                Explore Teams
              </a>
            </div>
          </div>
        </ScrollExpand>
      </div>

      {/* 2. MANIFESTO: ScrollReveal with 3 short statements max */}
      <section className="py-16 sm:py-24 bg-soft border-y border-border" id="manifesto">
        <div className="container max-w-4xl mx-auto text-center px-4">
          <span className="text-xs uppercase font-extrabold tracking-wider text-accent mb-3 block">
            Our Purpose
          </span>
          <ScrollReveal as="h2" className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-ink mb-6">
            Great ideas stall without the right teammates.
          </ScrollReveal>
          <ScrollReveal as="h3" className="text-2xl sm:text-4xl font-serif text-muted font-normal max-w-2xl mx-auto mb-6">
            We replace chaotic group chats with transparent, seat-based project matching.
          </ScrollReveal>
          <ScrollReveal as="p" className="text-lg sm:text-xl text-ink font-medium max-w-xl mx-auto">
            Find the missing piece of your build today.
          </ScrollReveal>
        </div>
      </section>

      {/* 3. HORIZONTAL SCROLL CARDS: How it Works */}
      <HorizontalScrollSection
        id="how-it-works"
        eyebrow="Workflow"
        title="How team discovery works on Collabyrd"
        description="Four transparent steps from project idea to a complete, balanced team."
        className="bg-surface border-b border-border scroll-mt-20"
      >
        {howItWorksSteps.map((s, index) => (
          <div
            key={s.step}
            className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-canvas border border-border h-full shadow-xs hover:border-primary transition-colors min-h-[300px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-serif font-bold text-primary">{s.step}</span>
                <span className="text-xs uppercase font-bold px-2.5 py-1 rounded-md bg-sage text-primary">
                  {s.badge}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-ink mb-3">{s.title}</h3>
              <p className="text-sm text-muted leading-relaxed m-0">{s.description}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted">
              <div className="flex items-center gap-4">
                <Seats capacity={4} filled={index + 1} size="md" />
                <span className="font-mono text-[11px]">{index === 3 ? "READY TO BUILD" : `${3 - index} OPEN SEATS`}</span>
              </div>
              <Icon name="check" size={16} />
            </div>
          </div>
        ))}
      </HorizontalScrollSection>

      {/* 4. INTERACTIVE TEAM PREVIEW */}
      <section className="py-14 sm:py-20 bg-soft border-b border-border">
        <div className="container grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-16">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-primary mb-2 block">
              Find your complementary skill
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-4">
              See who could fill your open seat.
            </h2>
            <p className="text-base text-muted my-4 max-w-lg leading-relaxed">
              Every team clearly visualizes occupied positions and vacancy requirements. Explore roles to see what skills candidates bring to the table.
            </p>
            <a
              className="inline-flex items-center gap-2 font-medium text-sm text-primary hover:underline"
              href="#/teams"
            >
              Explore all active teams <Icon name="arrowUp" size={15} />
            </a>
          </div>
          <TeamPreview />
        </div>
      </section>

      {/* 5. HORIZONTAL SCROLL CARDS: Featured Hackathons */}
      <HorizontalScrollSection
        id="campus-events"
        eyebrow="Events"
        title="Upcoming campus hackathons"
        description="Find a squad and register for hackathons across institutions."
        className="bg-surface border-b border-border scroll-mt-20"
      >
        {events.map((event) => (
          <a
            key={event.id}
            href={`#/hackathons/${event.id}`}
            className="flex flex-col justify-between p-6 rounded-2xl bg-canvas border border-border h-full shadow-xs hover:border-primary transition-colors min-h-[260px] group text-left"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="p-2 rounded-lg bg-soft text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <Icon name="calendar" size={18} />
                </span>
                <span className="text-xs font-semibold text-muted">
                  {eventDate(event.date)}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-ink group-hover:text-primary transition-colors mb-2">
                {event.name}
              </h3>
              <p className="text-xs text-muted m-0 line-clamp-2">
                {event.category} · {event.mode}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-primary">
              <span>View details & teams</span>
              <Icon name="arrowUp" size={14} />
            </div>
          </a>
        ))}
      </HorizontalScrollSection>

      {/* 6. COLLABORATION SHOWCASE */}
      <section className="bg-inverse-bg py-14 sm:py-24 text-on-inverse">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <img
            src="/images/campus-team.webp"
            srcSet="/images/campus-team-small.webp 640w, /images/campus-team.webp 1200w"
            sizes="(max-width: 640px) 92vw, 47vw"
            alt="Generated editorial image of Indian students sketching a project in a campus library"
            width={1536}
            height={1024}
            loading="lazy"
            decoding="async"
            className="rounded-2xl shadow-xl w-full object-cover"
          />
          <div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-on-inverse mb-4">
              Start with one conversation.
            </h2>
            <p className="text-base text-inverse-muted mb-6 leading-relaxed max-w-md">
              Share the skills you enjoy using, see who’s open to teaming up, and build a project you’re proud to showcase.
            </p>
            <a
              href={accountLink}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm min-h-[44px]"
            >
              Find teammates <Icon name="arrowUp" size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section
        className="container grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 py-14 sm:py-24 scroll-mt-20"
        id="faq"
      >
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-primary mb-2 block">
            Questions & Answers
          </span>
          <h2 tabIndex={-1} className="font-serif text-3xl sm:text-5xl font-bold text-ink">
            Good to know
          </h2>
          <p className="text-muted text-base mt-4 max-w-md">
            Common questions about teammate matching, hackathon registration, and open seat workflows.
          </p>
        </div>
        <div className="divide-y divide-border">
          <details className="py-4">
            <summary className="font-bold cursor-pointer text-base py-2 text-ink">
              Who is Collabyrd for?
            </summary>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Students looking for teammates on their campus. Whether you're building a semester capstone or preparing for a national hackathon, Collabyrd connects you with complementary peers.
            </p>
          </details>
          <details className="py-4">
            <summary className="font-bold cursor-pointer text-base py-2 text-ink">
              Can I start a team without a hackathon?
            </summary>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Yes. You can build a team for any campus project, research initiative, or startup idea and configure the exact open seat criteria.
            </p>
          </details>
          <details className="py-4">
            <summary className="font-bold cursor-pointer text-base py-2 text-ink">
              Does joining a team register me for an event?
            </summary>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Event registration happens with the official hackathon organizer. Collabyrd helps you discover the right people to build a winning submission with.
            </p>
          </details>
        </div>
      </section>
    </PublicLayout>
  );
}

export default LandingPage;
