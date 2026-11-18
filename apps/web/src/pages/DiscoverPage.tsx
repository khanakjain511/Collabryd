import { useState } from "react";
import type { FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { useListFilters } from "../hooks/useListFilters";
import { Pagination } from "../components/Pagination";
import { paginate, isHttpUrl } from "../lib/validation";
import { PersonCard } from "../components/Cards";
import {
  Avatar,
  Badge,
  Dialog,
  EmptyState,
  Icon,
  PageHeading,
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
  if (filters.sort === "name")
    people.sort((a, b) => a.name.localeCompare(b.name));
  if (filters.sort === "available")
    people.sort((a, b) => Number(b.available) - Number(a.available));
  const results = paginate(people, Number(filters.page));
  return (
    <>
      <PageHeading
        eyebrow="YOUR PEOPLE ARE OUT THERE"
        title="Find your missing piece."
        description="Different strengths. Shared curiosity. People to build something with."
      />
      <div className="filters-bar">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="Search people by name, skill or interest"
            placeholder="A name, a skill, a shared interest…"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
          />
        </label>
        <label className="filter-select">
          <span className="sr-only">Filter by role</span>
          <select
            value={filters.role}
            onChange={(event) => updateFilters({ role: event.target.value })}
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={!!filters.available}
            onChange={(event) =>
              updateFilters({ available: event.target.checked ? "yes" : "" })
            }
          />
          Open to team up
        </label>
        <details className="advanced-filters">
          <summary>More filters</summary>
          <div className="filter-fields">
            <label>
              Skill
              <select
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
            <label>
              Branch
              <select
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
            <label>
              Year
              <select
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
            <label>
              Interest
              <input
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
      <div className="results-heading">
        <p aria-live="polite">
          <strong>{people.length}</strong> example{" "}
          {people.length === 1 ? "person" : "people"} to discover
        </p>
        <div className="inline-actions">
          <label>
            <span className="sr-only">Sort people</span>
            <select
              aria-label="Sort people"
              value={filters.sort}
              onChange={(event) => updateFilters({ sort: event.target.value })}
            >
              <option value="default">Default order</option>
              <option value="name">Name A–Z</option>
              <option value="available">Available first</option>
            </select>
          </label>
          <button className="text-button" type="button" onClick={resetFilters}>
            Reset filters
          </button>
        </div>
      </div>
      {people.length ? (
        <div className="cards-grid">
          {results.items.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No one here just yet."
          description="Try a different skill or open up your filters."
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
      <p className="quiet-note">
        All profiles are fictional. Skills are self-reported in the intended
        product.
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
        description="It may be hidden or blocked in this demo session."
        action={
          <a className="button button-secondary" href="#/discover">
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
      <a className="back-link" href="#/discover">
        ← Back to people
      </a>
      <div className={`profile-cover ${person.color}`}>
        <span aria-hidden="true">
          Different strengths. Shared possibilities.
        </span>
        <Icon name="spark" size={80} />
      </div>
      <div className="profile-header">
        <Avatar name={person.name} color={person.color} />
        <div>
          <h1 tabIndex={-1}>{person.name}</h1>
          <p>
            {person.role} <span>·</span> {person.branch} <span>·</span>{" "}
            {person.year}
          </p>
        </div>
        {id !== "you" && (
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setError("");
              setDialog("invite");
            }}
            disabled={invited}
          >
            {invited ? "Demo invite prepared" : "Invite to your team"}
            <Icon name={invited ? "check" : "plus"} size={18} />
          </button>
        )}
      </div>
      <div className="detail-grid">
        <div className="panel">
          <p className="eyebrow">A LITTLE ABOUT ME</p>
          <h2>Hi, I’m {person.name.split(" ")[0]}.</h2>
          <p className="profile-about">{person.bio}</p>
          <h3>What I bring</h3>
          <div className="skill-list">
            {person.skills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </div>
          <p className="field-hint">
            Skills are self-reported. This is an example profile.
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
          <div className="profile-links">
            {[
              ["GitHub", person.githubUrl],
              ["LinkedIn", person.linkedinUrl],
              ["Portfolio", person.portfolioUrl],
            ]
              .filter(([, url]) => url && isHttpUrl(url))
              .map(([label, url]) => (
                <a
                  className="text-link"
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
          <div className="panel">
            <span
              className={`availability ${person.available ? "" : "unavailable"}`}
            >
              <span />
              {person.available ? "Open to team up" : "Not available right now"}
            </span>
            <h3>Good work starts with a conversation.</h3>
            <p>
              Invite this example person to a team you lead. No real invitation
              will be sent.
            </p>
            {ownedTeams.length === 0 && (
              <a className="text-link" href="#/teams/create">
                Create a recruiting team <Icon name="arrow" size={16} />
              </a>
            )}
          </div>
          {id !== "you" && (
            <div className="profile-safety">
              <button
                type="button"
                className="text-button"
                onClick={() => setDialog("report")}
              >
                Report this example profile
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  demo.setBlockedIds([...demo.blockedIds, id]);
                  demo.setFeedback(
                    "Example profile blocked for this demo session.",
                  );
                  window.location.hash = "/discover";
                }}
              >
                Block in this demo
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
            <form className="stack-form" onSubmit={invite}>
              <p>
                Choose a recruiting team for your example invitation to{" "}
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
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="button button-primary">
                Prepare demo invitation <Icon name="arrowUp" size={18} />
              </button>
            </form>
          ) : (
            <>
              <p>
                You need to lead a recruiting team with an open place first.
              </p>
              <a
                className="button button-primary"
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
          <form className="stack-form" onSubmit={report}>
            <p>
              This saves a report in the demo review queue, not a real
              moderation service.
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
            <button type="submit" className="button button-primary">
              Save demo report
            </button>
          </form>
        </Dialog>
      )}
    </>
  );
}
