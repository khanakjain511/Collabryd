import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { Pagination } from "../components/Pagination";
import { TeamManagement } from "../components/TeamManagement";
import { useListFilters } from "../hooks/useListFilters";
import { paginate } from "../lib/validation";
import { TeamCard } from "../components/Cards";
import { Roster, RosterSkills, TeamSeats } from "../components/Roster";
import { openSeats, sortDirection, sortField } from "../lib/roster";
import {
  conversationsApi,
  recommendationsApi,
  type RecommendedCandidate,
} from "../lib/api";
import {
  Avatar,
  Badge,
  Dialog,
  EmptyState,
  Icon,
  PageHeading,
  Seat,
  Seats,
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
      `${team.name || ""} ${team.description || ""} ${(team.roles || []).join(" ")} ${(team.skills || []).join(" ")}`
        .toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      (!filters.domain || team.domain === filters.domain) &&
      (!filters.role || (team.roles || []).includes(filters.role)) &&
      (!filters.event || team.eventId === filters.event) &&
      (!filters.open ||
        (team.status === "Recruiting" && (team.members?.length || 0) < (team.capacity || 4))),
  );
  const direction = sortDirection(filters.sort);
  if (sortField(filters.sort) === "name")
    teams.sort((a, b) => direction * a.name.localeCompare(b.name));
  if (sortField(filters.sort) === "places")
    teams.sort((a, b) => direction * (openSeats(b) - openSeats(a)));
  const results = paginate(teams, Number(filters.page), 3);
  return (
    <>
      <PageHeading
        eyebrow="A PLACE FOR WHAT YOU BRING"
        title="Small teams. Big possibilities."
        description="Find a role that fits, a problem you care about, or the start of something new."
        action={
          <a
            href="#/teams/create"
            className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
          >
            <Icon name="plus" size={18} />
            Start a team
          </a>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-surface/50 p-3 sm:p-4 rounded-xl border border-border">
        <label className="relative flex items-center flex-1 min-w-[240px]">
          <span className="absolute left-3 text-muted pointer-events-none">
            <Icon name="search" size={18} />
          </span>
          <input
            className="w-full pl-9 pr-3.5 py-2.5 bg-surface border border-input-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
            aria-label="Search teams, roles or skills"
            placeholder="A team, a role, an idea…"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
          />
        </label>
        <label className="block min-w-[140px]">
          <span className="sr-only">Filter by domain</span>
          <select
            className="w-full py-2.5 px-3.5 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
            value={filters.domain}
            onChange={(event) => updateFilters({ domain: event.target.value })}
          >
            <option value="">All domains</option>
            {domains.map((domain) => (
              <option key={domain}>{domain}</option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
            checked={!!filters.open}
            onChange={(event) =>
              updateFilters({ open: event.target.checked ? "yes" : "" })
            }
          />
          Open places only
        </label>
        <details className="w-full mt-3 pt-3 border-t border-border group">
          <summary className="text-xs font-semibold text-primary cursor-pointer hover:underline select-none">More team filters</summary>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Open role
              <select
                className="py-2 px-3 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary"
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
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Hackathon
              <select
                className="py-2 px-3 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary"
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5 border-b border-border bg-surface/50 rounded-t-xl">
        <p aria-live="polite">
          <strong>{teams.length}</strong> example{" "}
          {teams.length === 1 ? "team" : "teams"}
        </p>
        <div className="flex items-center gap-3">
          <label>
            <span className="sr-only">Sort teams</span>
            <select
              className="py-1.5 px-2.5 bg-surface border border-input-border rounded-lg text-xs text-ink focus:outline-none focus:border-primary"
              aria-label="Sort teams"
              value={filters.sort}
              onChange={(event) => updateFilters({ sort: event.target.value })}
            >
              <option value="default">Default order</option>
              <option value="name">Name A–Z</option>
              <option value="name-reverse">Name Z–A</option>
              <option value="places">Most open seats</option>
              <option value="places-reverse">Fewest open seats</option>
            </select>
          </label>
          <button
            type="button"
            className="border-0 bg-transparent py-1.5 px-0 text-primary text-sm underline underline-offset-4 cursor-pointer hover:text-primary-hover transition-colors font-medium"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </div>
      </div>
      {teams.length ? (
        <Roster
          label="Teams roster"
          columns={[
            { title: "Team", sort: "name" },
            { title: "Skills and roles" },
            { title: "Seats", sort: "places", descending: true },
          ]}
          sort={filters.sort}
          onSort={(sort) => updateFilters({ sort })}
          rows={results.items.map((team) => ({
            id: team.id,
            cells: [
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-soft text-primary grid place-items-center shrink-0">
                  <Icon
                    name={team.domain === "Sustainability" ? "leaf" : "people"}
                    size={20}
                  />
                </span>
                <div>
                  <a className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary" href={`#/teams/${team.id}`}>
                    {team.name} <Icon name="arrowUp" size={14} />
                  </a>
                  <span className="block text-xs text-muted mt-1">{team.domain}</span>
                </div>
              </div>,
              <RosterSkills
                skills={[...new Set([...team.roles, ...team.skills])]}
              />,
              <TeamSeats team={team} />,
            ],
          }))}
        />
      ) : (
        <EmptyState
          title="A little room for a new idea."
          description="No teams match these filters. Try another search or create your own team."
          action={
            <button
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
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
        description="Only the current team leader can change these details."
        action={
          <a
            className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
            href="#/my-teams"
          >
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
      <a
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-7 transition-colors"
        href="#/teams"
      >
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
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <form
          className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4"
          onSubmit={submit}
        >
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <span className="text-xs text-muted mt-1 block">
                Team size limit: 2–6 members.
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
            <span className="text-xs text-muted mt-1 block">
              Separate roles with commas.
            </span>
          </label>
          <label>
            Helpful skills
            <input
              name="skills"
              defaultValue={team?.skills.join(", ")}
              placeholder="React, Python, Figma"
            />
            <span className="text-xs text-muted mt-1 block">
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
            <p className="text-xs text-danger font-medium mt-1" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <a
              href="#/teams"
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
            >
              Not just yet
            </a>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
            >
              {id ? "Save team changes" : "Bring your team to life"}{" "}
              <Icon name="arrowUp" size={18} />
            </button>
          </div>
        </form>
        <aside className="bg-soft border border-border rounded-xl p-6 shadow-sm flex flex-col gap-3">
          <span className="text-accent text-lg inline-block mr-1" aria-hidden="true">
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
          <ul className="list-none p-0 my-4 grid gap-2.5">
            <li className="flex items-center gap-2 text-sm text-ink">
              <Icon name="check" />
              Keep your idea understandable
            </li>
            <li className="flex items-center gap-2 text-sm text-ink">
              <Icon name="check" />
              Be honest about the time needed
            </li>
            <li className="flex items-center gap-2 text-sm text-ink">
              <Icon name="check" />
              Make space for different strengths
            </li>
          </ul>
          <p className="text-xs text-muted mt-1 block">
            Teams can recruit members and submit project applications.
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
  const [recommendedCandidates, setRecommendedCandidates] = useState<RecommendedCandidate[]>([]);

  const pid = Number(id);
  const isLeader = team?.leaderId === "you";

  useEffect(() => {
    if (isLeader && Number.isFinite(pid) && pid > 0) {
      recommendationsApi
        .getRecommendedCandidates(pid, 6)
        .then((candidates) => {
          setRecommendedCandidates(candidates);
        })
        .catch(() => {});
    }
  }, [isLeader, pid]);

  if (!team)
    return (
      <EmptyState
        title="This team isn’t here."
        description="It may have been removed or archived."
        action={
          <a
            href="#/teams"
            className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
          >
            Explore teams
          </a>
        }
      />
    );
  const leader = team.leaderId === "you";
  const members = team?.members || [];
  const member = members.includes("you");
  const capacity = team?.capacity || 4;
  const full = members.length >= capacity;
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
      <a
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-7 transition-colors"
        href="#/teams"
      >
        ← Back to teams
      </a>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <span className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-success-bg text-success grid place-items-center shrink-0">
          <Icon
            name={team.domain === "Sustainability" ? "leaf" : "code"}
            size={34}
          />
        </span>
        <div className="sm:mr-auto">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-2 block">
            {team.domain} / PROJECT TEAM
          </p>
          <h1 tabIndex={-1}>{team.name}</h1>
        </div>
        <Badge
          tone={team.status === "Recruiting" && !full ? "positive" : "neutral"}
        >
          {full && team.status === "Recruiting" ? "Full" : team.status}
        </Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div>
          <section className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
            <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-4 block">
              THE IDEA
            </p>
            <h2>A little about what we’re building.</h2>
            <p className="text-sm text-muted leading-relaxed mb-6">
              {team.description}
            </p>
            <h3>The missing pieces</h3>
            <div className="flex flex-wrap gap-1.5 my-3">
              {team.roles.map((role) => (
                <Badge key={role}>{role}</Badge>
              ))}
            </div>
            <h3>Skills we’d love to have around</h3>
            <div className="flex flex-wrap gap-1.5 my-3">
              {(team.skills || []).length ? (
                (team.skills || []).map((skill) => <Badge key={skill}>{skill}</Badge>)
              ) : (
                <p>Open to different strengths.</p>
              )}
            </div>
          </section>
          <TeamManagement team={team} demo={demo} />
          <section className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2>The people behind the idea</h2>
              <TeamSeats team={team} size="md" />
            </div>
            {members.map((personId) => {
              const person =
                personId === "you"
                  ? demo.profile
                  : demo.people.find((item) => item.id === personId);
              return (
                person && (
                  <div
                    className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-b-0"
                    key={person.id}
                  >
                    <Avatar name={person.name} color={person.color} small />
                    <div className="mr-auto">
                      <a className="text-sm font-semibold" href={`#/users/${person.id}`}>{person.name}</a>
                      <span className="block text-xs text-muted">{person.role}</span>
                    </div>
                    {person.id === team.leaderId && <Badge>Team lead</Badge>}
                    {person.id === "you" && (
                      <span className="text-xs text-muted">You</span>
                    )}
                  </div>
                )
              );
            })}
            {Array.from({
              length: Math.max(0, capacity - members.length),
            }).map((_, i) => (
              <div
                className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-b-0"
                key={`open-slot-${i}`}
              >
                <div className="flex items-center gap-3">
                  <Seat status="open" size="md" decorative />
                  <div>
                    <strong className="text-sm font-semibold text-ink">
                      Open seat {members.length + i + 1}
                    </strong>
                    <p className="text-xs text-muted">
                      {(team.roles || [])[members.length + i] ||
                        "Open contributor role"}
                    </p>
                  </div>
                </div>
                <Badge tone="positive">Recruiting</Badge>
              </div>
            ))}
          </section>
          {leader && (
            <section className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between gap-4 mb-4">
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
                    <div
                      className="py-4 border-b border-border last:border-b-0"
                      key={request.id}
                    >
                      <div className="flex items-start gap-3">
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
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
                            onClick={() => demo.reviewRequest(request.id, true)}
                            disabled={full || team.status !== "Recruiting"}
                          >
                            Accept request
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
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
          {leader && (recommendedCandidates || []).length > 0 && (
            <section className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-1">
                    <Icon name="spark" size={12} />
                    SKILL MATCH RECOMMENDATIONS
                  </div>
                  <h2>Candidates matching your project</h2>
                  <p className="text-xs text-muted">
                    Students whose registered skills match what your team is looking for.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedCandidates.map((cand) => (
                  <div
                    key={cand.userId}
                    className="p-3.5 border border-border rounded-lg bg-surface/60 hover:border-primary transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <strong className="text-sm font-semibold text-ink">
                          {cand.displayName}
                        </strong>
                        <Badge tone="positive">
                          {cand.matchingSkillsCount} match{cand.matchingSkillsCount === 1 ? "" : "es"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted mb-2">
                        {cand.courseProgram || cand.institution || "Student"} · {cand.academicYear || "Enrolled"}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(cand.matchedSkills || []).map((s) => (
                          <span
                            key={s}
                            className="text-[11px] px-1.5 py-0.5 rounded bg-sage/60 text-primary font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                      <a
                        href={`#/users/${cand.userId}`}
                        className="text-primary font-bold hover:underline"
                      >
                        View profile
                      </a>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline cursor-pointer"
                        onClick={() => {
                          const err = demo.invitePerson(String(cand.userId), team.id);
                          if (err) setError(err);
                        }}
                      >
                        Invite to team
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside>
          <section className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 mb-4">
              <Seats
                capacity={capacity}
                filled={members.length}
                size="sm"
                decorative
              />
              <span className="text-xs text-muted font-medium">
                {Math.max(0, capacity - members.length)} open{" "}
                {Math.max(0, capacity - members.length) === 1 ? "place" : "places"}
              </span>
            </div>
            <h2>
              {member
                ? "You’re part of this idea."
                : "Your missing piece might be here."}
            </h2>
            <p>
              {leader
                ? "You lead this team. Review requests below, or invite someone from discovery."
                : member
                  ? "You’re a member of this team. Bring your strengths and see what happens."
                  : "Tell the team a little about yourself and what you’d like to contribute."}
            </p>
            {member ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors cursor-pointer"
                  onClick={async () => {
                    const pid = Number(team.id);
                    if (Number.isFinite(pid)) {
                      try {
                        const conv = await conversationsApi.getProjectConversation(pid);
                        window.location.hash = `/messages/${conv.conversationId}`;
                      } catch {
                        window.location.hash = "/messages";
                      }
                    } else {
                      window.location.hash = "/messages";
                    }
                  }}
                >
                  <Icon name="mail" size={16} />
                  Open Team Chat
                </button>
                <a
                  href="#/discover"
                  className="w-full inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
                >
                  {leader ? "Find teammates" : "Explore people"}
                  <Icon name="arrowUp" size={16} />
                </a>
              </div>
            ) : ownRequest ? (
              <>
                <Badge tone="positive">Your request is pending</Badge>
                <button
                  type="button"
                  className="border-0 bg-transparent py-1.5 px-0 text-primary text-sm underline underline-offset-4 cursor-pointer hover:text-primary-hover transition-colors font-medium"
                  onClick={() => demo.cancelRequest(ownRequest.id)}
                >
                  Cancel request
                </button>
              </>
            ) : (
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
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
          </section>
          {event && (
            <section className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
              <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-4 block">
                BUILDING TOWARDS
              </p>
              <h3>{event.name}</h3>
              <p>
                {event.category} · {event.mode}
              </p>
              <a
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-border pb-1 hover:border-primary hover:text-primary transition-colors"
                href={`#/hackathons/${event.id}`}
              >
                Explore the example event <Icon name="arrow" size={16} />
              </a>
            </section>
          )}
          {leader && (
            <section className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
              <h3>Your team, your next step.</h3>
              <p>
                Keep recruitment open while you’re looking. Closing it preserves
                existing members.
              </p>
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
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
                className="border-0 bg-transparent py-1.5 px-0 text-danger text-sm underline underline-offset-4 cursor-pointer hover:opacity-80 transition-opacity font-medium"
                onClick={() => setArchiving(true)}
                disabled={team.status === "Archived"}
              >
                Archive team
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
          <form className="flex flex-col gap-4 mt-2" onSubmit={apply}>
            <p>
              Share the role you’d like to take and what you can bring.
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
              <p role="alert" className="text-xs text-danger font-medium mt-1">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
            >
              Send join request <Icon name="arrowUp" size={18} />
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
            teams. Existing members remain listed.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
              onClick={() => setArchiving(false)}
            >
              Keep building
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-danger text-white hover:bg-danger/90 transition-colors cursor-pointer"
              onClick={() => {
                demo.changeTeamStatus(id, "Archived");
                setArchiving(false);
              }}
            >
              Archive team
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
          <a
            className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
            href="#/teams/create"
          >
            <Icon name="plus" size={17} />
            Start a team
          </a>
        }
      />
      <div className="flex flex-wrap gap-2 mb-6" aria-label="Team list filter">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === tab}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              tab === item
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface text-ink border-border hover:border-primary"
            }`}
            onClick={() => setTab(item)}
          >
            {item}
            {item === "Invitations" && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
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
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm divide-y divide-border">
            {receivedInvitations.map((invitation) => {
              const team = demo.teams.find(
                (item) => item.id === invitation.teamId,
              );
              return (
                <article
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-soft/30 transition-colors"
                  key={invitation.id}
                >
                  <span className="w-11 h-11 rounded-xl bg-[#f4e6d6] text-[#6a4726] dark:bg-[#3c3026] dark:text-[#f1cba4] grid place-items-center shrink-0">
                    <Icon name="mail" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink text-base">
                      {team?.name || "Team"} thinks you’d be a good fit.
                    </h3>
                    <p className="text-sm text-muted">
                      You have received an invitation to join this team.
                    </p>
                    <a
                      className="inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-border pb-1 hover:border-primary hover:text-primary transition-colors"
                      href={`#/teams/${invitation.teamId}`}
                    >
                      View team <Icon name="arrowUp" size={15} />
                    </a>
                  </div>
                  {invitation.status === "Pending" ? (
                    <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
                        onClick={() =>
                          demo.respondToInvite(invitation.id, true)
                        }
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
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
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm divide-y divide-border">
            {applications.map((request) => (
              <article
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-soft/30 transition-colors"
                key={request.id}
              >
                <span className="w-11 h-11 rounded-xl bg-success-bg text-success grid place-items-center shrink-0">
                  <Icon name="people" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink text-base">
                    {
                      demo.teams.find((team) => team.id === request.teamId)
                        ?.name
                    }
                  </h3>
                  <p className="text-sm text-muted">{request.message}</p>
                  <a
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-border pb-1 hover:border-primary hover:text-primary transition-colors"
                    href={`#/teams/${request.teamId}`}
                  >
                    View team <Icon name="arrowUp" size={14} />
                  </a>
                </div>
                <Badge>{request.status}</Badge>
                {request.status === "Pending" && (
                  <button
                    type="button"
                    className="border-0 bg-transparent py-1.5 px-0 text-primary text-sm underline underline-offset-4 cursor-pointer hover:text-primary-hover transition-colors font-medium"
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
              <a
                href="#/teams"
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Explore teams <Icon name="arrowUp" size={17} />
              </a>
            }
          />
        )
      ) : teams.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
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
            <a
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
              href="#/teams"
            >
              Find a team <Icon name="arrowUp" size={17} />
            </a>
          }
        />
      )}
    </>
  );
}
