import { useState } from "react";
import type { FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { Pagination } from "../components/Pagination";
import { TeamManagement } from "../components/TeamManagement";
import { useListFilters } from "../hooks/useListFilters";
import { paginate } from "../lib/validation";
import { TeamCard } from "../components/Cards";
import {
  Avatar,
  Badge,
  Dialog,
  EmptyState,
  Icon,
  PageHeading,
} from "../components/ui";

export function TeamsPage({ demo }: { demo: DemoData }) {
  const { filters, updateFilters, resetFilters } = useListFilters({
    search: "",
    domain: "",
    role: "",
    event: "",
    open: "",
    sort: "default",
    page: "1",
  });
  const domains = [...new Set(demo.teams.map((team) => team.domain))];
  const roles = [...new Set(demo.teams.flatMap((team) => team.roles))];
  const teams = demo.teams.filter(
    (team) =>
      `${team.name} ${team.description} ${team.roles.join(" ")} ${team.skills.join(" ")}`
        .toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      (!filters.domain || team.domain === filters.domain) &&
      (!filters.role || team.roles.includes(filters.role)) &&
      (!filters.event || team.eventId === filters.event) &&
      (!filters.open ||
        (team.status === "Recruiting" && team.members.length < team.capacity)),
  );
  if (filters.sort === "name")
    teams.sort((a, b) => a.name.localeCompare(b.name));
  if (filters.sort === "places")
    teams.sort(
      (a, b) => b.capacity - b.members.length - (a.capacity - a.members.length),
    );
  const results = paginate(teams, Number(filters.page), 3);
  return (
    <>
      <PageHeading
        eyebrow="A PLACE FOR WHAT YOU BRING"
        title="Small teams. Big possibilities."
        description="Find a role that fits, a problem you care about, or the start of something new."
        action={
          <a href="#/teams/create" className="button button-primary">
            <Icon name="plus" size={18} />
            Start a team
          </a>
        }
      />
      <div className="filters-bar">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="Search teams, roles or skills"
            placeholder="A team, a role, an idea…"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
          />
        </label>
        <label className="filter-select">
          <span className="sr-only">Filter by domain</span>
          <select
            value={filters.domain}
            onChange={(event) => updateFilters({ domain: event.target.value })}
          >
            <option value="">All domains</option>
            {domains.map((domain) => (
              <option key={domain}>{domain}</option>
            ))}
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={!!filters.open}
            onChange={(event) =>
              updateFilters({ open: event.target.checked ? "yes" : "" })
            }
          />
          Open places only
        </label>
        <details className="advanced-filters">
          <summary>More team filters</summary>
          <div className="filter-fields">
            <label>
              Open role
              <select
                value={filters.role}
                onChange={(event) =>
                  updateFilters({ role: event.target.value })
                }
              >
                <option value="">All roles</option>
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <label>
              Hackathon
              <select
                value={filters.event}
                onChange={(event) =>
                  updateFilters({ event: event.target.value })
                }
              >
                <option value="">Any event</option>
                {demo.events
                  .filter(
                    (event) =>
                      !event.publication || event.publication === "Published",
                  )
                  .map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        </details>
      </div>
      <div className="results-heading">
        <p aria-live="polite">
          <strong>{teams.length}</strong> example{" "}
          {teams.length === 1 ? "team" : "teams"}
        </p>
        <div className="inline-actions">
          <label>
            <span className="sr-only">Sort teams</span>
            <select
              aria-label="Sort teams"
              value={filters.sort}
              onChange={(event) => updateFilters({ sort: event.target.value })}
            >
              <option value="default">Default order</option>
              <option value="name">Name A–Z</option>
              <option value="places">Most open places</option>
            </select>
          </label>
          <button type="button" className="text-button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      </div>
      {teams.length ? (
        <div className="cards-grid">
          {results.items.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="A little room for a new idea."
          description="No teams match these filters. Try another search or create your own team."
          action={
            <button
              className="button button-secondary"
              type="button"
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
    </>
  );
}

export function CreateTeamPage({ demo, id }: { demo: DemoData; id?: string }) {
  const [error, setError] = useState("");
  const team = demo.teams.find((item) => item.id === id);
  if (id && (!team || team.leaderId !== "you"))
    return (
      <EmptyState
        title="This team can’t be edited here."
        description="Only the current example team leader can change these details."
        action={
          <a className="button button-secondary" href="#/my-teams">
            Back to your teams
          </a>
        }
      />
    );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = {
      name: String(data.get("name")).trim(),
      description: String(data.get("description")).trim(),
      domain: String(data.get("domain")),
      capacity: Number(data.get("capacity")),
      roles: String(data.get("roles"))
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      skills: String(data.get("skills"))
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      eventId: String(data.get("event")),
    };
    if (!values.name || !values.description || !values.roles.length) {
      setError("Add a team name, description and at least one open role.");
      return;
    }
    const result = id ? demo.updateTeam(id, values) : demo.createTeam(values);
    if (result) setError(result);
    else if (id) window.location.hash = `/teams/${id}`;
  }
  return (
    <>
      <a className="back-link" href="#/teams">
        ← Back to teams
      </a>
      <PageHeading
        eyebrow="MAKE ROOM FOR SOMETHING GOOD"
        title={
          id
            ? "Make your team’s next step clearer."
            : "Every team starts with an idea."
        }
        description="Tell people what you’re thinking about and who you’d love to build it with."
      />
      <div className="detail-grid">
        <form className="panel stack-form" onSubmit={submit}>
          <label>
            Give your team a name
            <input
              name="name"
              defaultValue={team?.name}
              required
              maxLength={60}
              placeholder="Something worth calling yourselves"
            />
          </label>
          <label>
            What are you building?
            <textarea
              name="description"
              defaultValue={team?.description}
              required
              rows={4}
              maxLength={800}
              placeholder="A little about the problem, the idea, and what you hope to make."
            />
          </label>
          <div className="form-columns">
            <label>
              Project domain
              <select name="domain" defaultValue={team?.domain}>
                <option>Sustainability</option>
                <option>Social impact</option>
                <option>Developer tools</option>
                <option>Education</option>
                <option>Open exploration</option>
              </select>
            </label>
            <label>
              Team capacity, including you
              <input
                name="capacity"
                type="number"
                min={Math.max(2, team?.members.length || 1)}
                max={6}
                defaultValue={team?.capacity || 4}
                required
              />
              <span className="field-hint">
                Demo limit: 2–6. Live limits depend on event policy.
              </span>
            </label>
          </div>
          <label>
            Who are you looking for?
            <input
              name="roles"
              defaultValue={team?.roles.join(", ")}
              required
              placeholder="Product designer, Backend developer"
            />
            <span className="field-hint">Separate roles with commas.</span>
          </label>
          <label>
            Helpful skills
            <input
              name="skills"
              defaultValue={team?.skills.join(", ")}
              placeholder="React, Python, Figma"
            />
            <span className="field-hint">
              Separate skills with commas. It’s okay to leave this open.
            </span>
          </label>
          <label>
            Building towards a hackathon?
            <select name="event" defaultValue={team?.eventId || ""}>
              <option value="">No event yet — just an idea</option>
              {demo.events
                .filter(
                  (event) =>
                    !event.publication || event.publication === "Published",
                )
                .map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} (example)
                  </option>
                ))}
            </select>
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            <a href="#/teams" className="button button-secondary">
              Not just yet
            </a>
            <button type="submit" className="button button-primary">
              {id ? "Save team changes" : "Bring your team to life"}{" "}
              <Icon name="arrowUp" size={18} />
            </button>
          </div>
        </form>
        <aside className="panel advice-panel">
          <span className="advice-star" aria-hidden="true">
            ✳
          </span>
          <h2>
            Great teammates
            <br />
            start with <em>clear expectations.</em>
          </h2>
          <p>
            Share the problem, the commitment, and the skills you need. A little
            clarity makes saying hello a lot easier.
          </p>
          <ul className="check-list">
            <li>
              <Icon name="check" />
              Keep your idea understandable
            </li>
            <li>
              <Icon name="check" />
              Be honest about the time needed
            </li>
            <li>
              <Icon name="check" />
              Make space for different strengths
            </li>
          </ul>
          <p className="field-hint">
            This creates an example team for this session only.
          </p>
        </aside>
      </div>
    </>
  );
}

export function TeamDetailPage({ id, demo }: { id: string; demo: DemoData }) {
  const team = demo.teams.find((item) => item.id === id);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [archiving, setArchiving] = useState(false);
  if (!team)
    return (
      <EmptyState
        title="This team isn’t here."
        description="It may have been removed, or the demo was refreshed."
        action={
          <a href="#/teams" className="button button-secondary">
            Explore teams
          </a>
        }
      />
    );
  const leader = team.leaderId === "you";
  const member = team.members.includes("you");
  const full = team.members.length >= team.capacity;
  const ownRequest = demo.requests.find(
    (item) =>
      item.teamId === id &&
      item.personId === "you" &&
      item.status === "Pending",
  );
  const event = demo.events.find((item) => item.id === team.eventId);
  const teamRequests = demo.requests.filter((item) => item.teamId === id);
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = demo.applyToTeam(
      id,
      String(new FormData(event.currentTarget).get("message")),
    );
    if (result) setError(result);
    else setJoining(false);
  }
  return (
    <>
      <a className="back-link" href="#/teams">
        ← Back to teams
      </a>
      <div className="team-detail-heading">
        <span className="team-symbol sage">
          <Icon
            name={team.domain === "Sustainability" ? "leaf" : "code"}
            size={34}
          />
        </span>
        <div>
          <p className="eyebrow">{team.domain} / EXAMPLE TEAM</p>
          <h1 tabIndex={-1}>{team.name}</h1>
        </div>
        <Badge
          tone={team.status === "Recruiting" && !full ? "positive" : "neutral"}
        >
          {full && team.status === "Recruiting" ? "Full" : team.status}
        </Badge>
      </div>
      <div className="detail-grid">
        <div>
          <section className="panel">
            <p className="eyebrow">THE IDEA</p>
            <h2>A little about what we’re building.</h2>
            <p className="profile-about">{team.description}</p>
            <h3>The missing pieces</h3>
            <div className="skill-list">
              {team.roles.map((role) => (
                <Badge key={role}>{role}</Badge>
              ))}
            </div>
            <h3>Skills we’d love to have around</h3>
            <div className="skill-list">
              {team.skills.length ? (
                team.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)
              ) : (
                <p>Open to different strengths.</p>
              )}
            </div>
          </section>
          <TeamManagement team={team} demo={demo} />
          <section className="panel team-members">
            <div className="panel-heading">
              <h2>The people behind the idea</h2>
              <span>
                {team.members.length}/{team.capacity} members
              </span>
            </div>
            {team.members.map((personId) => {
              const person =
                personId === "you"
                  ? demo.profile
                  : demo.people.find((item) => item.id === personId);
              return (
                person && (
                  <div className="member-row" key={person.id}>
                    <Avatar name={person.name} color={person.color} small />
                    <div>
                      <a href={`#/users/${person.id}`}>{person.name}</a>
                      <span>{person.role}</span>
                    </div>
                    {person.id === team.leaderId && <Badge>Team lead</Badge>}
                    {person.id === "you" && (
                      <span className="field-hint">You</span>
                    )}
                  </div>
                )
              );
            })}
          </section>
          {leader && (
            <section className="panel">
              <div className="panel-heading">
                <h2>People who want to join</h2>
                <Badge>
                  {
                    teamRequests.filter((item) => item.status === "Pending")
                      .length
                  }{" "}
                  pending
                </Badge>
              </div>
              {teamRequests.length ? (
                teamRequests.map((request) => {
                  const applicant =
                    request.personId === "you"
                      ? demo.profile
                      : demo.people.find(
                          (person) => person.id === request.personId,
                        );
                  return (
                    <div className="request-card" key={request.id}>
                      <div className="request-person">
                        <Avatar
                          name={applicant?.name || "Example person"}
                          color={applicant?.color}
                          small
                        />
                        <div>
                          <a href={`#/users/${request.personId}`}>
                            <strong>{applicant?.name}</strong>
                          </a>
                          <p>{request.message}</p>
                        </div>
                        <Badge>{request.status}</Badge>
                      </div>
                      {request.status === "Pending" && (
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="button button-primary button-small"
                            onClick={() => demo.reviewRequest(request.id, true)}
                            disabled={full || team.status !== "Recruiting"}
                          >
                            Accept request
                          </button>
                          <button
                            type="button"
                            className="button button-secondary button-small"
                            onClick={() =>
                              demo.reviewRequest(request.id, false)
                            }
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p>No requests yet. Your team is still finding its people.</p>
              )}
            </section>
          )}
        </div>
        <aside>
          <section className="panel join-panel">
            <div className="panel-heading">
              <Icon name="people" />
              <span>
                {team.capacity - team.members.length} open{" "}
                {team.capacity - team.members.length === 1 ? "place" : "places"}
              </span>
            </div>
            <h2>
              {member
                ? "You’re part of this idea."
                : "Your missing piece might be here."}
            </h2>
            <p>
              {leader
                ? "You lead this example team. Review requests below, or invite someone from discovery."
                : member
                  ? "You’re a member of this example team. Bring your strengths and see what happens."
                  : "Tell the team a little about yourself and what you’d like to contribute."}
            </p>
            {member ? (
              <a href="#/discover" className="button button-primary full-width">
                {leader ? "Find teammates" : "Explore people"}
                <Icon name="arrowUp" size={16} />
              </a>
            ) : ownRequest ? (
              <>
                <Badge tone="positive">Your request is pending</Badge>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => demo.cancelRequest(ownRequest.id)}
                >
                  Cancel demo request
                </button>
              </>
            ) : (
              <button
                type="button"
                className="button button-primary full-width"
                disabled={full || team.status !== "Recruiting"}
                onClick={() => {
                  setError("");
                  setJoining(true);
                }}
              >
                {full
                  ? "This team is full"
                  : team.status !== "Recruiting"
                    ? "Recruitment closed"
                    : "Say hello to the team"}
                {!full && team.status === "Recruiting" && (
                  <Icon name="arrowUp" size={17} />
                )}
              </button>
            )}
            <span className="field-hint">
              Demo actions only. Nothing is sent to real people.
            </span>
          </section>
          {event && (
            <section className="panel">
              <p className="eyebrow">BUILDING TOWARDS</p>
              <h3>{event.name}</h3>
              <p>
                {event.category} · {event.mode}
              </p>
              <a className="text-link" href={`#/hackathons/${event.id}`}>
                Explore the example event <Icon name="arrow" size={16} />
              </a>
            </section>
          )}
          {leader && (
            <section className="panel">
              <h3>Your team, your next step.</h3>
              <p>
                Keep recruitment open while you’re looking. Closing it preserves
                existing members.
              </p>
              <button
                type="button"
                className="button button-secondary full-width"
                onClick={() =>
                  demo.changeTeamStatus(
                    id,
                    team.status === "Recruiting" ? "Closed" : "Recruiting",
                  )
                }
                disabled={team.status === "Archived"}
              >
                {team.status === "Recruiting"
                  ? "Close recruitment"
                  : "Reopen recruitment"}
              </button>
              <button
                type="button"
                className="text-button danger-text"
                onClick={() => setArchiving(true)}
                disabled={team.status === "Archived"}
              >
                Archive example team
              </button>
            </section>
          )}
        </aside>
      </div>
      {joining && (
        <Dialog
          title={`Say hello to ${team.name}`}
          onClose={() => setJoining(false)}
        >
          <form className="stack-form" onSubmit={apply}>
            <p>
              Share the role you’d like to take and what you can bring. Your
              request will stay in this demo only.
            </p>
            <label>
              A little introduction
              <textarea
                name="message"
                rows={4}
                maxLength={800}
                required
                placeholder="Hi! I’d love to help with…"
              />
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button type="submit" className="button button-primary">
              Send demo join request <Icon name="arrowUp" size={18} />
            </button>
          </form>
        </Dialog>
      )}
      {archiving && (
        <Dialog
          title="Give this idea a little rest?"
          onClose={() => setArchiving(false)}
        >
          <p>
            Archiving closes recruitment and moves the team to your archived
            examples. Existing members remain listed.
          </p>
          <div className="form-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setArchiving(false)}
            >
              Keep building
            </button>
            <button
              type="button"
              className="button button-danger"
              onClick={() => {
                demo.changeTeamStatus(id, "Archived");
                setArchiving(false);
              }}
            >
              Archive demo team
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

export function MyTeamsPage({ demo }: { demo: DemoData }) {
  const [tab, setTab] = useState("Your teams");
  const tabs = [
    "Your teams",
    "Created by you",
    "Invitations",
    "Applications",
    "Archived",
  ];
  const teams = demo.teams.filter((team) =>
    tab === "Archived"
      ? team.members.includes("you") && team.status === "Archived"
      : team.status !== "Archived" &&
        (tab === "Created by you"
          ? team.leaderId === "you"
          : team.members.includes("you")),
  );
  const applications = demo.requests.filter((item) => item.personId === "you");
  const receivedInvitations = demo.invitations.filter(
    (item) => (item.personId || "you") === "you",
  );
  return (
    <>
      <PageHeading
        eyebrow="THE PEOPLE YOU’RE BUILDING WITH"
        title="Your little corner of possibility."
        description="Teams, invitations, and the next steps that bring people together."
        action={
          <a className="button button-primary" href="#/teams/create">
            <Icon name="plus" size={17} />
            Start a team
          </a>
        }
      />
      <div className="filter-tabs" aria-label="Team list filter">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === tab}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item}
            {item === "Invitations" && (
              <span>
                {
                  receivedInvitations.filter(
                    (invite) => invite.status === "Pending",
                  ).length
                }
              </span>
            )}
          </button>
        ))}
      </div>
      {tab === "Invitations" ? (
        receivedInvitations.length ? (
          <div className="list-panel">
            {receivedInvitations.map((invitation) => {
              const team = demo.teams.find(
                (item) => item.id === invitation.teamId,
              );
              return (
                <article className="invitation-row" key={invitation.id}>
                  <span className="summary-icon peach">
                    <Icon name="mail" />
                  </span>
                  <div>
                    <h3>
                      {team?.name || "Example team"} thinks you’d be a good fit.
                    </h3>
                    <p>An example invitation. Take a look before you decide.</p>
                    <a
                      className="text-link"
                      href={`#/teams/${invitation.teamId}`}
                    >
                      View team <Icon name="arrowUp" size={15} />
                    </a>
                  </div>
                  {invitation.status === "Pending" ? (
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="button button-primary button-small"
                        onClick={() =>
                          demo.respondToInvite(invitation.id, true)
                        }
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="button button-secondary button-small"
                        onClick={() =>
                          demo.respondToInvite(invitation.id, false)
                        }
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <Badge>{invitation.status}</Badge>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No invitations just yet."
            description="A clear profile makes it easier for people to find you."
          />
        )
      ) : tab === "Applications" ? (
        applications.length ? (
          <div className="list-panel">
            {applications.map((request) => (
              <article className="invitation-row" key={request.id}>
                <span className="summary-icon sage">
                  <Icon name="people" />
                </span>
                <div>
                  <h3>
                    {
                      demo.teams.find((team) => team.id === request.teamId)
                        ?.name
                    }
                  </h3>
                  <p>{request.message}</p>
                  <a className="text-link" href={`#/teams/${request.teamId}`}>
                    View team <Icon name="arrowUp" size={14} />
                  </a>
                </div>
                <Badge>{request.status}</Badge>
                {request.status === "Pending" && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => demo.cancelRequest(request.id)}
                  >
                    Cancel request
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your next team is still out there."
            description="Send a join request to a team that needs what you bring."
            action={
              <a href="#/teams" className="button button-primary">
                Explore teams <Icon name="arrowUp" size={17} />
              </a>
            }
          />
        )
      ) : teams.length ? (
        <div className="cards-grid">
          {teams.map((team) => (
            <TeamCard team={team} key={team.id} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            tab === "Archived"
              ? "No ideas on pause."
              : "Your first team is still ahead."
          }
          description="A good idea gets better with the right people."
          action={
            <a className="button button-primary" href="#/teams">
              Find a team <Icon name="arrowUp" size={17} />
            </a>
          }
        />
      )}
    </>
  );
}
