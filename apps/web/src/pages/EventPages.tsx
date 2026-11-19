import { useState } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { demoEvents, eventDate } from "../data/demo";
import { EventCard, TeamCard } from "../components/Cards";
import { Badge, EmptyState, Icon, PageHeading } from "../components/ui";

export function EventsPage() {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("All formats");
  const events = demoEvents.filter(
    (event) =>
      `${event.name} ${event.category}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (mode === "All formats" || event.mode === mode),
  );
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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="filter-select">
          <span className="sr-only">Event format</span>
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value)}
          >
            <option>All formats</option>
            <option>In person</option>
            <option>Online</option>
            <option>Hybrid</option>
          </select>
        </label>
      </div>
      <div className="results-heading">
        <p aria-live="polite">
          <strong>{events.length}</strong> fictional events to explore
        </p>
        <span className="field-hint">Dates shown in India Standard Time</span>
      </div>
      {events.length ? (
        <div className="cards-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing on this calendar yet."
          description="Try another search or a different format."
          action={
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setSearch("");
                setMode("All formats");
              }}
            >
              Clear filters
            </button>
          }
        />
      )}
      <div className="info-callout">
        <Icon name="calendar" />
        <p>
          <strong>A little clarity.</strong> These are fictional example events.
          The live product will link to organizer-managed registration. Joining
          a team is not event registration.
        </p>
      </div>
    </>
  );
}

export function EventDetailPage({ id, demo }: { id: string; demo: DemoData }) {
  const event = demoEvents.find((item) => item.id === id);
  if (!event)
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
          <p className="inline-info">
            No official registration link is available for this fictional event.
          </p>
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
