import type { DemoData } from "../hooks/useDemoData";
import { eventDate } from "../data/demo";
import { useListFilters } from "../hooks/useListFilters";
import { Pagination } from "../components/Pagination";
import { isHttpUrl, paginate } from "../lib/validation";
import { EventCard, TeamCard } from "../components/Cards";
import { Badge, EmptyState, Icon, PageHeading } from "../components/ui";

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
          ? new Date(event.date).getTime() >= Date.now()
          : new Date(event.date).getTime() < Date.now())),
  );
  events.sort((a, b) =>
    filters.sort === "name"
      ? a.name.localeCompare(b.name)
      : new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const results = paginate(events, Number(filters.page), 3);
  return (
    <>
      <PageHeading
        eyebrow="A REASON TO SAY “LET’S BUILD”"
        title="Your next beginning has a date."
        description="Explore example hackathons, find an idea that excites you, and bring your people."
      />
      <div className="filters-bar">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="Search hackathons"
            placeholder="What would you love to build?"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
          />
        </label>
        <label className="filter-select">
          <span className="sr-only">Event format</span>
          <select
            value={filters.mode}
            onChange={(event) => updateFilters({ mode: event.target.value })}
          >
            <option value="">All formats</option>
            <option>In person</option>
            <option>Online</option>
            <option>Hybrid</option>
          </select>
        </label>
        <details className="advanced-filters">
          <summary>More event filters</summary>
          <div className="filter-fields">
            <label>
              Domain
              <select
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
            <label>
              Dates
              <select
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
            <label>
              From
              <input
                type="date"
                value={filters.from}
                onChange={(event) =>
                  updateFilters({ from: event.target.value })
                }
              />
            </label>
            <label>
              Until
              <input
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
      <div className="results-heading">
        <p aria-live="polite">
          <strong>{events.length}</strong> fictional events to explore
        </p>
        <div className="inline-actions">
          <label>
            <span className="sr-only">Sort events</span>
            <select
              aria-label="Sort events"
              value={filters.sort}
              onChange={(event) => updateFilters({ sort: event.target.value })}
            >
              <option value="date">Soonest first</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
          <button className="text-button" type="button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      </div>
      {events.length ? (
        <div className="cards-grid">
          {results.items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing on this calendar yet."
          description="Try another search, date range or format."
          action={
            <button
              type="button"
              className="button button-secondary"
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
      <div className="info-callout">
        <Icon name="calendar" />
        <p>
          <strong>A little clarity.</strong> These are fictional events. Dates
          use India Standard Time. Joining a team is not event registration.
          Draft and archived examples are hidden from this catalog.
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
          <a className="button button-primary" href="#/hackathons">
            Explore hackathons
          </a>
        }
      />
    );
  const teams = demo.teams.filter((team) => team.eventId === id);
  return (
    <>
      <a href="#/hackathons" className="back-link">
        ← Back to hackathons
      </a>
      <div className={`event-detail-art ${event.color}`}>
        <div>
          <Badge>FICTIONAL EXAMPLE EVENT</Badge>
          <h1 tabIndex={-1}>{event.name}</h1>
          <p>
            {event.category} · {event.mode}
          </p>
        </div>
        <span aria-hidden="true">{event.symbol}</span>
      </div>
      <div className="detail-grid">
        <section className="panel">
          <p className="eyebrow">A NEW REASON TO BUILD</p>
          <h2>Good ideas deserve a starting line.</h2>
          <p className="profile-about">{event.description}</p>
          <h3>Organizer and eligibility</h3>
          <p>{event.organizer || "Fictional event organizers"}</p>
          <p>
            {event.eligibility ||
              "Example campus opportunity. Real eligibility must come from a verified organizer."}
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
        <aside className="panel event-facts">
          <h3>A few useful details</h3>
          <div>
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
          <div>
            <Icon name="clock" />
            <span>
              Example deadline<strong>{eventDate(event.deadline)}</strong>
              <small>23:59 India Standard Time</small>
            </span>
          </div>
          <div>
            <Icon name="globe" />
            <span>
              Format<strong>{event.mode}</strong>
            </span>
          </div>
          {event.officialUrl && isHttpUrl(event.officialUrl) ? (
            <>
              <a
                href={event.officialUrl}
                className="button button-secondary full-width"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit organizer link <Icon name="arrowUp" size={16} />
                <span className="sr-only">(opens a new tab)</span>
              </a>
              <p className="field-hint">
                External example link. A visit does not register your team.
              </p>
            </>
          ) : (
            <p className="inline-info">
              No official registration link is available for this fictional
              event.
            </p>
          )}
          {event.sourceUrl && isHttpUrl(event.sourceUrl) && (
            <a
              className="text-link"
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Listing source (new tab) <Icon name="arrowUp" size={15} />
            </a>
          )}
          {event.updatedAt && (
            <p className="field-hint">
              Example listing updated {eventDate(event.updatedAt)}.
            </p>
          )}
          <a href="#/teams/create" className="button button-primary full-width">
            Create a demo team <Icon name="plus" size={17} />
          </a>
        </aside>
      </div>
      <div className="workspace-section-heading">
        <div>
          <h2>People building towards this</h2>
          <p>Example teams connected to this hackathon.</p>
        </div>
      </div>
      {teams.length ? (
        <div className="cards-grid">
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
