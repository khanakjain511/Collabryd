import { useState } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { eventDate } from "../data/demo";
import { useListFilters } from "../hooks/useListFilters";
import { Pagination } from "../components/Pagination";
import { isHttpUrl, paginate } from "../lib/validation";
import { TeamCard } from "../components/Cards";
import { Roster, RosterSkills } from "../components/Roster";
import { openSeats, sortDirection, sortField } from "../lib/roster";
import { Badge, EmptyState, Icon, PageHeading, Seat, Seats } from "../components/ui";

export function EventsPage({ demo }: { demo: DemoData }) {
  const { filters, updateFilters, resetFilters } = useListFilters({
    search: "",
    mode: "",
    category: "",
    from: "",
    until: "",
    time: "",
    sort: "date",
    page: "1",
  });
  const [now] = useState(() => Date.now());
  const catalog = demo.events.filter(
    (event) => !event.publication || event.publication === "Published",
  );
  const categories = [...new Set(catalog.map((event) => event.category))];
  const events = catalog.filter(
    (event) =>
      `${event.name} ${event.category}`
        .toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      (!filters.mode || event.mode === filters.mode) &&
      (!filters.category || event.category === filters.category) &&
      (!filters.from || event.date.slice(0, 10) >= filters.from) &&
      (!filters.until || event.date.slice(0, 10) <= filters.until) &&
      (!filters.time ||
        (filters.time === "upcoming"
          ? new Date(event.date).getTime() >= now
          : new Date(event.date).getTime() < now)),
  );
  const direction = sortDirection(filters.sort);
  const recruiting = demo.teams.filter((team) => openSeats(team) > 0);
  events.sort(
    (a, b) =>
      direction *
      (sortField(filters.sort) === "name"
        ? a.name.localeCompare(b.name)
        : new Date(a.date).getTime() - new Date(b.date).getTime()),
  );
  const results = paginate(events, Number(filters.page), 3);
  return (
    <>
      <PageHeading
        eyebrow="A REASON TO SAY “LET’S BUILD”"
        title="Your next beginning has a date."
        description="Explore example hackathons, find an idea that excites you, and bring your people."
      />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-surface/50 p-3 sm:p-4 rounded-xl border border-border">
        <label className="relative flex items-center flex-1 min-w-[240px]">
          <span className="absolute left-3 text-muted pointer-events-none">
            <Icon name="search" size={18} />
          </span>
          <input
            className="w-full pl-9 pr-3.5 py-2.5 bg-surface border border-input-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
            aria-label="Search hackathons"
            placeholder="What would you love to build?"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
          />
        </label>
        <label className="block min-w-[140px]">
          <span className="sr-only">Event format</span>
          <select
            className="w-full py-2.5 px-3.5 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
            value={filters.mode}
            onChange={(event) => updateFilters({ mode: event.target.value })}
          >
            <option value="">All formats</option>
            <option>In person</option>
            <option>Online</option>
            <option>Hybrid</option>
          </select>
        </label>
        <details className="w-full mt-3 pt-3 border-t border-border group">
          <summary className="text-xs font-semibold text-primary cursor-pointer hover:underline select-none">More event filters</summary>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Domain
              <select
                className="py-2 px-3 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary"
                value={filters.category}
                onChange={(event) =>
                  updateFilters({ category: event.target.value })
                }
              >
                <option value="">All domains</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Dates
              <select
                className="py-2 px-3 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary"
                value={filters.time}
                onChange={(event) =>
                  updateFilters({ time: event.target.value })
                }
              >
                <option value="">All dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Date passed</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              From
              <input
                className="py-2 px-3 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary"
                type="date"
                value={filters.from}
                onChange={(event) =>
                  updateFilters({ from: event.target.value })
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Until
              <input
                className="py-2 px-3 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary"
                type="date"
                value={filters.until}
                onChange={(event) =>
                  updateFilters({ until: event.target.value })
                }
              />
            </label>
          </div>
        </details>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5 border-b border-border bg-surface/50 rounded-t-xl">
        <p aria-live="polite">
          <strong>{events.length}</strong> events to explore
        </p>
        <div className="flex items-center gap-3">
          <label>
            <span className="sr-only">Sort events</span>
            <select
              className="py-1.5 px-2.5 bg-surface border border-input-border rounded-lg text-xs text-ink focus:outline-none focus:border-primary"
              aria-label="Sort events"
              value={filters.sort}
              onChange={(event) => updateFilters({ sort: event.target.value })}
            >
              <option value="date">Soonest first</option>
              <option value="date-reverse">Latest first</option>
              <option value="name">Name A–Z</option>
              <option value="name-reverse">Name Z–A</option>
            </select>
          </label>
          <button
            className="border-0 bg-transparent py-1.5 px-0 text-primary text-sm underline underline-offset-4 cursor-pointer hover:text-primary-hover transition-colors font-medium"
            type="button"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </div>
      </div>
      {events.length ? (
        <Roster
          label="Hackathon roster"
          columns={[
            { title: "Hackathon", sort: "name" },
            { title: "Date", sort: "date" },
            { title: "Recruiting teams" },
          ]}
          sort={filters.sort}
          onSort={(sort) => updateFilters({ sort })}
          rows={results.items.map((event) => {
            const teams = recruiting.filter(
              (team) => team.eventId === event.id,
            );
            const open = teams.reduce(
              (total, team) => total + openSeats(team),
              0,
            );
            const skills = [...new Set(teams.flatMap((team) => team.skills))];
            return {
              id: event.id,
              cells: [
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-soft text-primary grid place-items-center shrink-0">
                    <Icon name="calendar" size={20} />
                  </span>
                  <div>
                    <a className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary" href={`#/hackathons/${event.id}`}>
                      {event.name} <Icon name="arrowUp" size={14} />
                    </a>
                    <span className="block text-xs text-muted mt-1">{event.category}</span>
                  </div>
                </div>,
                <div className="flex flex-col gap-0.5 text-xs text-muted">
                  <time className="font-medium text-ink" dateTime={event.date}>{eventDate(event.date)}</time>
                  <span>{event.mode}</span>
                </div>,
                <div className="flex items-center gap-2 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    {open > 0 ? (
                      <Seats capacity={Math.min(open, 4)} filled={0} size="sm" decorative />
                    ) : (
                      <Seat status="filled" size="sm" inactive decorative />
                    )}
                    <span>
                      {open
                        ? `${open} open ${open === 1 ? "seat" : "seats"}`
                        : "No open seats"}
                    </span>
                  </div>
                  {skills.length > 0 && <RosterSkills skills={skills} />}
                </div>,
              ],
            };
          })}
        />
      ) : (
        <EmptyState
          title="Nothing on this calendar yet."
          description="Try another search, date range or format."
          action={
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          }
        />
      )}
      <Pagination
        page={results.page}
        totalPages={results.totalPages}
        onChange={(page) => updateFilters({ page: String(page) })}
      />
      <div className="bg-soft border-l-4 border-primary p-4 rounded-r-xl my-5 text-sm text-ink leading-relaxed flex items-start gap-3">
        <Icon name="calendar" />
        <p>
          <strong>Calendar Notes.</strong> Dates use India Standard Time. Joining a team is not event registration.
        </p>
      </div>
    </>
  );
}

export function EventDetailPage({ id, demo }: { id: string; demo: DemoData }) {
  const event = demo.events.find((item) => item.id === id);
  if (!event || (event.publication && event.publication !== "Published"))
    return (
      <EmptyState
        title="This event isn’t on the calendar."
        description="Find another reason to build something together."
        action={
          <a
            className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
            href="#/hackathons"
          >
            Explore hackathons
          </a>
        }
      />
    );
  const teams = demo.teams.filter((team) => team.eventId === id);
  return (
    <>
      <a
        href="#/hackathons"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-7 transition-colors"
      >
        ← Back to hackathons
      </a>
      <div
        className={`min-h-[240px] rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-end bg-surface border border-border mb-8 shadow-sm ${event.color}`}
      >
        <div>
          <Badge tone="positive">{event.category || "HACKATHON"}</Badge>
          <h1
            className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-ink mt-3 mb-1"
            tabIndex={-1}
          >
            {event.name}
          </h1>
          <p>
            {event.category} · {event.mode}
          </p>
        </div>
        <span aria-hidden="true">{event.symbol}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <section className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-4 block">
            A NEW REASON TO BUILD
          </p>
          <h2>Good ideas deserve a starting line.</h2>
          <p className="text-sm text-muted leading-relaxed mb-6">{event.description}</p>
          <h3>Organizer and eligibility</h3>
          <p>{event.organizer || "Campus Event Organizers"}</p>
          <p>
            {event.eligibility ||
              "Open to all registered campus students."}
          </p>
          {event.rules && (
            <>
              <h3>Team rules</h3>
              <p>{event.rules}</p>
            </>
          )}
          <h3>What to expect</h3>
          <p>
            This example event demonstrates how students could discover an
            opportunity, understand its format and find a team. It has no real
            organizer, prizes, registration or verified rules.
          </p>
          <h3>Bring a team. Bring your curiosity.</h3>
          <p>
            Explore example teams connected to this event, or create your own.
            Live eligibility and team-size rules will come from the organizer.
          </p>
        </section>
        <aside className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h3>A few useful details</h3>
          <div className="flex items-start gap-3 p-3.5 bg-canvas/60 rounded-lg border border-border/60">
            <Icon name="calendar" />
            <span>
              Starts<strong>{eventDate(event.date)}</strong>
              <small>
                {new Intl.DateTimeFormat("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                }).format(new Date(event.date))}{" "}
                India Standard Time
              </small>
            </span>
          </div>
          <div className="flex items-start gap-3 p-3.5 bg-canvas/60 rounded-lg border border-border/60">
            <Icon name="clock" />
            <span>
              Example deadline<strong>{eventDate(event.deadline)}</strong>
              <small>23:59 India Standard Time</small>
            </span>
          </div>
          <div className="flex items-start gap-3 p-3.5 bg-canvas/60 rounded-lg border border-border/60">
            <Icon name="globe" />
            <span>
              Format<strong>{event.mode}</strong>
            </span>
          </div>
          {event.officialUrl && isHttpUrl(event.officialUrl) ? (
            <>
              <a
                href={event.officialUrl}
                className="w-full inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit organizer link <Icon name="arrowUp" size={16} />
                <span className="sr-only">(opens a new tab)</span>
              </a>
              <p className="text-xs text-muted mt-1 block">
                External event link. Ensure your team registers directly with the organizer.
              </p>
            </>
          ) : (
            <p className="flex items-center gap-2 text-xs text-muted my-2">
              No official registration link is available for this event.
            </p>
          )}
          {event.sourceUrl && isHttpUrl(event.sourceUrl) && (
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-border pb-1 hover:border-primary hover:text-primary transition-colors"
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Listing source (new tab) <Icon name="arrowUp" size={15} />
            </a>
          )}
          {event.updatedAt && (
            <p className="text-xs text-muted mt-1 block">
              Listing updated {eventDate(event.updatedAt)}.
            </p>
          )}
          <a
            href="#/teams/create"
            className="w-full inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
          >
            Create a team <Icon name="plus" size={17} />
          </a>
        </aside>
      </div>
      <div className="flex justify-between items-end gap-4 my-8">
        <div>
          <h2>People building towards this</h2>
          <p>Teams connected to this hackathon.</p>
        </div>
      </div>
      {teams.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Be the first to start something."
          description="Your team could give this idea its beginning."
        />
      )}
    </>
  );
}
