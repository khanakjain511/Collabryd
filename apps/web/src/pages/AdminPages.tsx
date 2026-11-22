import { useState } from "react";
import type { FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
import type { Hackathon, Report } from "../types";
import {
  Avatar,
  Badge,
  Dialog,
  EmptyState,
  Icon,
  PageHeading,
} from "../components/ui";
import { Pagination } from "../components/Pagination";
import { paginate } from "../lib/validation";

export function AdminPage({
  demo,
  view = "",
  eventId,
}: {
  demo: DemoData;
  view?: string;
  eventId?: string;
}) {
  const links = [
    ["Overview", ""],
    ["Students", "users"],
    ["Teams", "teams"],
    ["Hackathons", "hackathons"],
    ["Reports", "reports"],
  ];
  return (
    <>
      <PageHeading
        eyebrow="CAMPUS OPERATIONS / DEMO ONLY"
        title="A little care for the community."
        description="These controls update fictional local data. They are not real administrator access or campus approval."
      />
      <div className="filter-tabs admin-links">
        {links.map(([label, path]) => (
          <a
            key={label}
            href={`#/admin${path ? `/${path}` : ""}`}
            className={path === view ? "active" : ""}
            aria-current={path === view ? "page" : undefined}
          >
            {label}
          </a>
        ))}
      </div>
      {!view ? (
        <>
          <div className="admin-summary">
            <a className="panel" href="#/admin/users">
              <span>Awaiting campus review</span>
              <strong>
                {
                  demo.people.filter(
                    (person) => person.status === "Pending review",
                  ).length
                }
              </strong>
              <p>Fictional student profiles</p>
            </a>
            <a className="panel" href="#/admin/reports">
              <span>Open reports</span>
              <strong>
                {
                  demo.reports.filter(
                    (report) =>
                      report.status === "Open" ||
                      report.status === "Investigating",
                  ).length
                }
              </strong>
              <p>Local demonstration only</p>
            </a>
            <a className="panel" href="#/admin/hackathons">
              <span>Published event examples</span>
              <strong>
                {
                  demo.events.filter(
                    (event) =>
                      !event.publication || event.publication === "Published",
                  ).length
                }
              </strong>
              <p>Manage drafts and listings</p>
            </a>
          </div>
          <div className="info-callout">
            <Icon name="lock" />
            <p>
              The live product must enforce admin roles, campus isolation, audit
              logs and authorization on the server. This demo makes the screens
              available so you can explain and test the frontend.
            </p>
          </div>
        </>
      ) : view === "users" ? (
        <StudentReview demo={demo} />
      ) : view === "teams" ? (
        <TeamReview demo={demo} />
      ) : view === "reports" ? (
        <ReportReview demo={demo} />
      ) : view === "hackathons" ? (
        eventId ? (
          <EventEditor id={eventId} demo={demo} />
        ) : (
          <EventReview demo={demo} />
        )
      ) : (
        <EmptyState
          title="This review page isn’t available."
          description="Choose a campus operation from the links above."
        />
      )}
    </>
  );
}

function StudentReview({ demo }: { demo: DemoData }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [suspending, setSuspending] = useState<string | null>(null);
  const people = demo.people.filter(
    (person) =>
      `${person.name} ${person.branch}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!status || (person.status || "Active") === status),
  );
  const results = paginate(people, page);
  return (
    <>
      <div className="filters-bar">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="Search student reviews"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Find an example student"
          />
        </label>
        <label className="filter-select">
          <span className="sr-only">Student review status</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option>Pending review</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </label>
      </div>
      <p className="list-count" aria-live="polite">
        {people.length} example student records
      </p>
      {people.length ? (
        <div className="list-panel">
          {results.items.map((person) => (
            <article className="invitation-row" key={person.id}>
              <Avatar name={person.name} color={person.color} />
              <div>
                <h3>{person.name}</h3>
                <p>
                  {person.branch} · {person.year}
                </p>
                <a className="text-link" href={`#/users/${person.id}`}>
                  View profile <Icon name="arrowUp" size={14} />
                </a>
              </div>
              <Badge>{person.status || "Active"}</Badge>
              <div className="inline-actions">
                {person.status !== "Active" && person.status !== undefined ? (
                  <button
                    className="button button-secondary button-small"
                    type="button"
                    onClick={() => demo.reviewStudent(person.id, "Active")}
                  >
                    {person.status === "Suspended"
                      ? "Restore access"
                      : "Approve example student"}
                  </button>
                ) : (
                  <button
                    className="text-button danger-text"
                    type="button"
                    onClick={() => setSuspending(person.id)}
                  >
                    Suspend example
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No student records match."
          description="Try another search or status."
        />
      )}
      <Pagination
        page={results.page}
        totalPages={results.totalPages}
        onChange={setPage}
      />
      {suspending && (
        <Dialog
          title="Suspend this example profile?"
          onClose={() => setSuspending(null)}
        >
          <p>
            The fictional student will disappear from discovery and cannot
            receive demo invitations. This changes no real enrollment or
            account.
          </p>
          <div className="form-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setSuspending(null)}
            >
              Cancel
            </button>
            <button
              className="button button-danger"
              type="button"
              onClick={() => {
                demo.reviewStudent(suspending, "Suspended");
                setSuspending(null);
              }}
            >
              Suspend example profile
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

function TeamReview({ demo }: { demo: DemoData }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const teams = demo.teams.filter((team) =>
    `${team.name} ${team.domain}`.toLowerCase().includes(search.toLowerCase()),
  );
  const results = paginate(teams, page);
  return (
    <>
      <div className="filters-bar">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="Search team reviews"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search example teams"
          />
        </label>
      </div>
      <p className="list-count">{teams.length} example teams</p>
      {teams.length ? (
        <div className="list-panel">
          {results.items.map((team) => (
            <article className="invitation-row" key={team.id}>
              <span className="summary-icon sage">
                <Icon name="people" />
              </span>
              <div>
                <h3>{team.name}</h3>
                <p>
                  {team.members.length}/{team.capacity} members · {team.domain}
                </p>
                <a className="text-link" href={`#/teams/${team.id}`}>
                  Review team <Icon name="arrowUp" size={14} />
                </a>
              </div>
              <label>
                Recruitment status
                <select
                  aria-label={`${team.name} recruitment status`}
                  value={team.status}
                  onChange={(event) =>
                    demo.moderateTeam(
                      team.id,
                      event.target.value as
                        "Recruiting" | "Closed" | "Archived",
                    )
                  }
                >
                  <option>Recruiting</option>
                  <option>Closed</option>
                  <option>Archived</option>
                </select>
              </label>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No teams match."
          description="Try a different name or domain."
        />
      )}
      <Pagination
        page={results.page}
        totalPages={results.totalPages}
        onChange={setPage}
      />
    </>
  );
}

function ReportReview({ demo }: { demo: DemoData }) {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const reports = demo.reports.filter(
    (report) => !status || report.status === status,
  );
  const results = paginate(reports, page);
  return (
    <>
      <div className="filters-bar">
        <label>
          Report status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All reports</option>
            <option>Open</option>
            <option>Investigating</option>
            <option>Resolved</option>
            <option>Dismissed</option>
          </select>
        </label>
      </div>
      <p className="list-count" aria-live="polite">
        {reports.length} demo reports
      </p>
      {reports.length ? (
        <div className="list-panel">
          {results.items.map((report) => (
            <article className="invitation-row" key={report.id}>
              <span className="summary-icon peach">
                <Icon name="lock" />
              </span>
              <div>
                <h3>{report.target}</h3>
                <p>{report.reason}</p>
              </div>
              <label>
                Review outcome
                <select
                  aria-label={`Report for ${report.target}`}
                  value={report.status}
                  onChange={(event) =>
                    demo.setReports((current) =>
                      current.map((item) =>
                        item.id === report.id
                          ? {
                              ...item,
                              status: event.target.value as Report["status"],
                            }
                          : item,
                      ),
                    )
                  }
                >
                  <option>Open</option>
                  <option>Investigating</option>
                  <option>Resolved</option>
                  <option>Dismissed</option>
                </select>
              </label>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="A quiet review queue."
          description="No reports match this status. Report an example profile to try the review flow."
          action={
            <a href="#/discover" className="button button-secondary">
              Explore people
            </a>
          }
        />
      )}
      <Pagination
        page={results.page}
        totalPages={results.totalPages}
        onChange={setPage}
      />
    </>
  );
}

function EventReview({ demo }: { demo: DemoData }) {
  const [page, setPage] = useState(1);
  const results = paginate(demo.events, page);
  return (
    <>
      <div className="workspace-section-heading">
        <div>
          <h2>Keep the next opportunity clear.</h2>
          <p>Draft, publish, edit or archive fictional event listings.</p>
        </div>
        <a className="button button-primary" href="#/admin/hackathons/create">
          <Icon name="plus" size={17} />
          Create event example
        </a>
      </div>
      <div className="list-panel">
        {results.items.map((event) => (
          <article className="invitation-row" key={event.id}>
            <span className={`summary-icon ${event.color}`}>
              <Icon name="calendar" />
            </span>
            <div>
              <h3>{event.name}</h3>
              <p>
                {event.category} · {event.mode}
              </p>
              <a className="text-link" href={`#/admin/hackathons/${event.id}`}>
                Edit listing <Icon name="arrowUp" size={14} />
              </a>
            </div>
            <label>
              Publication
              <select
                aria-label={`${event.name} publication`}
                value={event.publication || "Published"}
                onChange={(change) =>
                  demo.setEventPublication(
                    event.id,
                    change.target.value as "Draft" | "Published" | "Archived",
                  )
                }
              >
                <option>Draft</option>
                <option>Published</option>
                <option>Archived</option>
              </select>
            </label>
          </article>
        ))}
      </div>
      <Pagination
        page={results.page}
        totalPages={results.totalPages}
        onChange={setPage}
      />
    </>
  );
}

function istInput(value?: string) {
  return value
    ? new Date(new Date(value).getTime() + 330 * 60000)
        .toISOString()
        .slice(0, 16)
    : "";
}

function EventEditor({ id, demo }: { id: string; demo: DemoData }) {
  const [error, setError] = useState("");
  const event = demo.events.find((item) => item.id === id);
  if (id !== "create" && !event)
    return (
      <EmptyState
        title="This listing isn’t available."
        description="Return to event management to create an example."
      />
    );
  function save(submit: FormEvent<HTMLFormElement>) {
    submit.preventDefault();
    const form = new FormData(submit.currentTarget);
    const values: Hackathon = {
      id: event?.id || crypto.randomUUID(),
      name: String(form.get("name")).trim(),
      category: String(form.get("category")),
      description: String(form.get("description")).trim(),
      date: `${form.get("date")}:00+05:30`,
      deadline: `${form.get("deadline")}:00+05:30`,
      mode: String(form.get("mode")),
      color: event?.color || "sage",
      symbol: event?.symbol || "✳",
      organizer: String(form.get("organizer")).trim(),
      eligibility: String(form.get("eligibility")).trim(),
      rules: String(form.get("rules")).trim(),
      officialUrl: String(form.get("officialUrl")).trim(),
      sourceUrl: String(form.get("sourceUrl")).trim(),
      publication: form.get("publication") as
        "Draft" | "Published" | "Archived",
    };
    const result = demo.saveEvent(values);
    if (result) setError(result);
    else window.location.hash = "/admin/hackathons";
  }
  return (
    <>
      <a className="back-link" href="#/admin/hackathons">
        ← Back to event management
      </a>
      <div className="detail-grid">
        <form className="panel stack-form" onSubmit={save}>
          <h2>
            {event ? "Make the details clearer." : "A new reason to build."}
          </h2>
          <label>
            Event name
            <input
              name="name"
              required
              maxLength={100}
              defaultValue={event?.name}
            />
          </label>
          <label>
            Organizer (example)
            <input
              name="organizer"
              required
              defaultValue={
                event?.organizer || (event ? "Example campus organizers" : "")
              }
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              rows={4}
              required
              maxLength={1000}
              defaultValue={event?.description}
            />
          </label>
          <div className="form-columns">
            <label>
              Starts (India Standard Time)
              <input
                name="date"
                type="datetime-local"
                required
                defaultValue={istInput(event?.date)}
              />
            </label>
            <label>
              Deadline (India Standard Time)
              <input
                name="deadline"
                type="datetime-local"
                required
                defaultValue={istInput(event?.deadline)}
              />
            </label>
          </div>
          <div className="form-columns">
            <label>
              Domain
              <select name="category" defaultValue={event?.category}>
                <option>Sustainability</option>
                <option>Social impact</option>
                <option>Developer tools</option>
                <option>Education</option>
                <option>Open exploration</option>
              </select>
            </label>
            <label>
              Format
              <select name="mode" defaultValue={event?.mode}>
                <option>In person</option>
                <option>Online</option>
                <option>Hybrid</option>
              </select>
            </label>
          </div>
          <label>
            Eligibility
            <textarea
              name="eligibility"
              required
              rows={2}
              defaultValue={
                event?.eligibility ||
                (event ? "Example campus students; demonstration only." : "")
              }
            />
          </label>
          <label>
            Team rules
            <textarea
              name="rules"
              rows={3}
              defaultValue={event?.rules}
              placeholder="Example team size and participation requirements"
            />
          </label>
          <label>
            Organizer registration URL (optional)
            <input
              name="officialUrl"
              type="url"
              defaultValue={event?.officialUrl}
              placeholder="https://organizer.example/register"
            />
          </label>
          <label>
            Listing source URL (optional)
            <input
              name="sourceUrl"
              type="url"
              defaultValue={event?.sourceUrl}
              placeholder="https://organizer.example/event"
            />
          </label>
          <label>
            Publication
            <select
              name="publication"
              defaultValue={
                event?.publication || (event ? "Published" : "Draft")
              }
            >
              <option>Draft</option>
              <option>Published</option>
              <option>Archived</option>
            </select>
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            <a className="button button-secondary" href="#/admin/hackathons">
              Cancel
            </a>
            <button className="button button-primary" type="submit">
              Save event example <Icon name="check" size={17} />
            </button>
          </div>
        </form>
        <aside className="panel advice-panel">
          <h2>Good details build trust.</h2>
          <p>
            Use fictional details here. Publication only changes this tab’s
            example catalog. No event is submitted to a real organizer or
            campus.
          </p>
          <p>
            In the live product, approved editors must verify eligibility, time
            zones, official URLs and sources before publishing.
          </p>
        </aside>
      </div>
    </>
  );
}
