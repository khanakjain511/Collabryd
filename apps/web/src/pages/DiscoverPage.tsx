import { useState } from "react";
import type { FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { useListFilters } from "../hooks/useListFilters";
import { Pagination } from "../components/Pagination";
import { paginate, isHttpUrl } from "../lib/validation";
import { Roster, RosterSkills } from "../components/Roster";
import { sortDirection, sortField } from "../lib/roster";
import {
  Avatar,
  Badge,
  Dialog,
  EmptyState,
  Icon,
  PageHeading,
  Seat,
} from "../components/ui";

export function DiscoverPage({ demo }: { demo: DemoData }) {
  const { filters, updateFilters, resetFilters } = useListFilters({
    search: "",
    role: "",
    skill: "",
    branch: "",
    year: "",
    interest: "",
    available: "",
    sort: "default",
    page: "1",
  });
  const activePeople = demo.people.filter(
    (person) => !person.status || person.status === "Active",
  );
  const directory = demo.visible
    ? [demo.profile, ...activePeople]
    : activePeople;
  const roles = [...new Set(directory.map((person) => person.role))];
  const skills = [
    ...new Set(directory.flatMap((person) => person.skills)),
  ].sort();
  const branches = [...new Set(directory.map((person) => person.branch))];
  const years = [...new Set(directory.map((person) => person.year))];
  const people = directory.filter(
    (person) =>
      !demo.blockedIds.includes(person.id) &&
      `${person.name} ${person.skills.join(" ")} ${person.interests}`
        .toLowerCase()
        .includes(filters.search.toLowerCase()) &&
      (!filters.role || person.role === filters.role) &&
      (!filters.skill || person.skills.includes(filters.skill)) &&
      (!filters.branch || person.branch === filters.branch) &&
      (!filters.year || person.year === filters.year) &&
      person.interests.toLowerCase().includes(filters.interest.toLowerCase()) &&
      (!filters.available || person.available),
  );
  const direction = sortDirection(filters.sort);
  if (sortField(filters.sort) === "name")
    people.sort((a, b) => direction * a.name.localeCompare(b.name));
  if (sortField(filters.sort) === "available")
    people.sort(
      (a, b) => direction * (Number(b.available) - Number(a.available)),
    );
  const results = paginate(people, Number(filters.page));
  return (
    <>
      <PageHeading
        eyebrow="YOUR PEOPLE ARE OUT THERE"
        title="Find your missing piece."
        description="Different strengths. Shared curiosity. People to build something with."
      />
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-surface/50 p-3 sm:p-4 rounded-xl border border-border">
        <label className="relative flex items-center flex-1 min-w-[240px]">
          <span className="absolute left-3 text-muted pointer-events-none">
            <Icon name="search" size={18} />
          </span>
          <input
            className="w-full pl-9 pr-3.5 py-2.5 bg-surface border border-input-border rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
            aria-label="Search people by name, skill or interest"
            placeholder="A name, a skill, a shared interest…"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
          />
        </label>
        <label className="block min-w-[140px]">
          <span className="sr-only">Filter by role</span>
          <select
            className="w-full py-2.5 px-3.5 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
            value={filters.role}
            onChange={(event) => updateFilters({ role: event.target.value })}
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
            checked={!!filters.available}
            onChange={(event) =>
              updateFilters({ available: event.target.checked ? "yes" : "" })
            }
          />
          Open to team up
        </label>
        <details className="w-full mt-3 pt-3 border-t border-border group">
          <summary className="text-xs font-semibold text-primary cursor-pointer hover:underline select-none">More filters</summary>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Skill
              <select
                className="py-2 px-3 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary"
                value={filters.skill}
                onChange={(event) =>
                  updateFilters({ skill: event.target.value })
                }
              >
                <option value="">All skills</option>
                {skills.map((skill) => (
                  <option key={skill}>{skill}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Branch
              <select
                className="py-2 px-3 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary"
                value={filters.branch}
                onChange={(event) =>
                  updateFilters({ branch: event.target.value })
                }
              >
                <option value="">All branches</option>
                {branches.map((branch) => (
                  <option key={branch}>{branch}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Year
              <select
                className="py-2 px-3 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary"
                value={filters.year}
                onChange={(event) =>
                  updateFilters({ year: event.target.value })
                }
              >
                <option value="">All years</option>
                {years.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              Interest
              <input
                className="py-2 px-3 bg-surface border border-input-border rounded-lg text-sm text-ink focus:outline-none focus:border-primary"
                value={filters.interest}
                onChange={(event) =>
                  updateFilters({ interest: event.target.value })
                }
                placeholder="A topic you care about"
              />
            </label>
          </div>
        </details>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5 border-b border-border bg-surface/50 rounded-t-xl">
        <p aria-live="polite">
          <strong>{people.length}</strong> example{" "}
          {people.length === 1 ? "person" : "people"} to discover
        </p>
        <div className="flex items-center gap-3">
          <label>
            <span className="sr-only">Sort people</span>
            <select
              className="py-1.5 px-2.5 bg-surface border border-input-border rounded-lg text-xs text-ink focus:outline-none focus:border-primary"
              aria-label="Sort people"
              value={filters.sort}
              onChange={(event) => updateFilters({ sort: event.target.value })}
            >
              <option value="default">Default order</option>
              <option value="name">Name A–Z</option>
              <option value="name-reverse">Name Z–A</option>
              <option value="available">Available first</option>
              <option value="available-reverse">Unavailable first</option>
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
      {people.length ? (
        <Roster
          label="People directory"
          columns={[
            { title: "Name", sort: "name" },
            { title: "Skills" },
            { title: "Availability", sort: "available", descending: true },
          ]}
          sort={filters.sort}
          onSort={(sort) => updateFilters({ sort })}
          rows={results.items.map((person) => ({
            id: person.id,
            cells: [
              <div className="flex items-center gap-3">
                <Avatar name={person.name} color={person.color} />
                <div>
                  <a className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary" href={`#/users/${person.id}`}>
                    {person.name} <Icon name="arrowUp" size={14} />
                  </a>
                  <span className="block text-xs text-muted mt-1">
                    {person.role} · {person.year}
                  </span>
                </div>
              </div>,
              <RosterSkills skills={person.skills} />,
              <div className="flex items-center gap-2 text-xs text-muted">
                <Seat
                  status={person.available ? "open" : "filled"}
                  size="sm"
                  inactive={!person.available}
                  decorative
                />
                <span>
                  {person.available ? "Open to team up" : "Not available"}
                </span>
              </div>,
            ],
          }))}
        />
      ) : (
        <EmptyState
          title="No one here just yet."
          description="Try a different skill or open up your filters."
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
      <p className="flex justify-center items-center gap-2 text-xs text-muted mt-5 leading-relaxed">
        Verified campus members. Skills and interests are self-reported.
      </p>
    </>
  );
}

export function PersonPage({ id, demo }: { id: string; demo: DemoData }) {
  const person =
    id === "you" ? demo.profile : demo.people.find((item) => item.id === id);
  const [dialog, setDialog] = useState<"invite" | "report" | null>(null);
  const [error, setError] = useState("");
  const invited = demo.invitations.some(
    (invitation) =>
      invitation.personId === id && invitation.status === "Pending",
  );
  if (
    !person ||
    demo.blockedIds.includes(id) ||
    (person.status && person.status !== "Active")
  )
    return (
      <EmptyState
        title="This profile isn’t available."
        description="This profile may be hidden, inactive, or blocked."
        action={
          <a
            className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
            href="#/discover"
          >
            Back to discovery
          </a>
        }
      />
    );
  const ownedTeams = demo.teams.filter(
    (team) =>
      team.leaderId === "you" &&
      team.status === "Recruiting" &&
      team.members.length < team.capacity &&
      !team.members.includes(id),
  );
  function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = demo.invitePerson(
      id,
      String(new FormData(event.currentTarget).get("team")),
    );
    if (result) setError(result);
    else {
      setDialog(null);
    }
  }
  function report(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    demo.submitReport(
      person!.name,
      String(new FormData(event.currentTarget).get("reason")),
    );
    setDialog(null);
  }
  return (
    <>
      <a
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-7 transition-colors"
        href="#/discover"
      >
        ← Back to people
      </a>
      <div
        className={`h-28 sm:h-32 rounded-2xl p-6 sm:p-8 flex items-center justify-between overflow-hidden relative mb-6 text-muted border border-border shadow-sm ${person.color}`}
      >
        <span aria-hidden="true">
          Different strengths. Shared possibilities.
        </span>
        <Icon name="spark" size={80} />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-6">
        <Avatar name={person.name} color={person.color} />
        <div className="sm:mr-auto">
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-ink" tabIndex={-1}>
            {person.name}
          </h1>
          <p>
            {person.role} <span>·</span> {person.branch} <span>·</span>{" "}
            {person.year}
          </p>
        </div>
        {id !== "you" && (
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
            onClick={() => {
              setError("");
              setDialog("invite");
            }}
            disabled={invited}
          >
            {invited ? "Invitation sent" : "Invite to your team"}
            <Icon name={invited ? "check" : "plus"} size={18} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-4 block">
            A LITTLE ABOUT ME
          </p>
          <h2>Hi, I’m {person.name.split(" ")[0]}.</h2>
          <p className="text-sm text-muted leading-relaxed mb-6">{person.bio}</p>
          <h3>What I bring</h3>
          <div className="flex flex-wrap gap-1.5 my-3">
            {person.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted mt-1 block">
            Skills and proficiencies are self-reported.
          </p>
          <h3>What gets me curious</h3>
          <p>{person.interests}</p>
          <h3>Experience and availability</h3>
          <p>
            {person.proficiency || "Experience not specified"} · Self-reported
          </p>
          {(person.availableFrom || person.availableUntil) && (
            <p>
              Available {person.availableFrom || "from now"}{" "}
              {person.availableUntil
                ? `through ${person.availableUntil}`
                : "onwards"}
            </p>
          )}
          <h3>More of my work</h3>
          <div className="flex flex-col gap-2.5 my-3">
            {[
              ["GitHub", person.githubUrl],
              ["LinkedIn", person.linkedinUrl],
              ["Portfolio", person.portfolioUrl],
            ]
              .filter(([, url]) => url && isHttpUrl(url))
              .map(([label, url]) => (
                <a
                  className="inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-border pb-1 hover:border-primary hover:text-primary transition-colors"
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label} <Icon name="arrowUp" size={15} />
                  <span className="sr-only">(opens a new tab)</span>
                </a>
              ))}
          </div>
          {!person.githubUrl && !person.linkedinUrl && !person.portfolioUrl && (
            <p>No links added. Sharing a portfolio is optional.</p>
          )}
        </div>
        <aside>
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
            <span
              className={`inline-flex items-center gap-2 text-xs font-medium my-2 ${
                person.available ? "text-ink" : "text-muted"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  person.available
                    ? "bg-emerald-600 dark:bg-emerald-400"
                    : "bg-muted"
                }`}
              />
              {person.available ? "Open to team up" : "Not available right now"}
            </span>
            <h3>Good work starts with a conversation.</h3>
            <p>
              Invite this example person to a team you lead. No real invitation
              will be sent.
            </p>
            {ownedTeams.length === 0 && (
              <a
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-border pb-1 hover:border-primary hover:text-primary transition-colors"
                href="#/teams/create"
              >
                Create a recruiting team <Icon name="arrow" size={16} />
              </a>
            )}
          </div>
          {id !== "you" && (
            <div className="mt-6 pt-4 border-t border-border flex flex-col gap-2">
              <button
                type="button"
                className="border-0 bg-transparent py-1.5 px-0 text-primary text-sm underline underline-offset-4 cursor-pointer hover:text-primary-hover transition-colors font-medium text-left"
                onClick={() => setDialog("report")}
              >
                Report profile
              </button>
              <button
                type="button"
                className="border-0 bg-transparent py-1.5 px-0 text-primary text-sm underline underline-offset-4 cursor-pointer hover:text-primary-hover transition-colors font-medium text-left"
                onClick={() => {
                  demo.setBlockedIds([...demo.blockedIds, id]);
                  demo.setFeedback(
                    "Profile blocked successfully.",
                  );
                  window.location.hash = "/discover";
                }}
              >
                Block profile
              </button>
            </div>
          )}
        </aside>
      </div>
      {dialog === "invite" && (
        <Dialog
          title="A new connection starts here."
          onClose={() => setDialog(null)}
        >
          {ownedTeams.length ? (
            <form className="flex flex-col gap-4 mt-2" onSubmit={invite}>
              <p>
                Choose a recruiting team to invite{" "}
                {person.name.split(" ")[0]}.
              </p>
              <label>
                Your team
                <select name="team" required>
                  {ownedTeams.map((team) => (
                    <option value={team.id} key={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
              {error && (
                <p className="text-xs text-danger font-medium mt-1" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Send team invitation <Icon name="arrowUp" size={18} />
              </button>
            </form>
          ) : (
            <>
              <p>
                You need to lead a recruiting team with an open place first.
              </p>
              <a
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
                href="#/teams/create"
                onClick={() => setDialog(null)}
              >
                Create a team <Icon name="plus" />
              </a>
            </>
          )}
        </Dialog>
      )}
      {dialog === "report" && (
        <Dialog title="Report a concern" onClose={() => setDialog(null)}>
          <form className="flex flex-col gap-4 mt-2" onSubmit={report}>
            <p>
              Submit this report for administrative campus review.
            </p>
            <label>
              What’s the concern?
              <textarea
                name="reason"
                required
                rows={4}
                maxLength={1000}
                placeholder="Include only relevant details."
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
            >
              Submit report
            </button>
          </form>
        </Dialog>
      )}
    </>
  );
}
