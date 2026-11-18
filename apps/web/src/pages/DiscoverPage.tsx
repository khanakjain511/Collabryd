import { useState } from "react";
import type { FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { demoPeople } from "../data/demo";
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
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All roles");
  const [available, setAvailable] = useState(false);
  const directory = demo.visible ? [demo.profile, ...demoPeople] : demoPeople;
  const roles = [...new Set(directory.map((person) => person.role))];
  const people = directory.filter(
    (person) =>
      !demo.blockedIds.includes(person.id) &&
      `${person.name} ${person.skills.join(" ")} ${person.interests}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (role === "All roles" || person.role === role) &&
      (!available || person.available),
  );
  function reset() {
    setSearch("");
    setRole("All roles");
    setAvailable(false);
  }
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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="filter-select">
          <span className="sr-only">Filter by role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option>All roles</option>
            {roles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={available}
            onChange={(event) => setAvailable(event.target.checked)}
          />
          Open to team up
        </label>
      </div>
      <div className="results-heading">
        <p aria-live="polite">
          <strong>{people.length}</strong> example{" "}
          {people.length === 1 ? "person" : "people"} to discover
        </p>
        <button type="button" className="text-button" onClick={reset}>
          Reset filters
        </button>
      </div>
      {people.length ? (
        <div className="cards-grid">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No one here just yet."
          description="Try a different skill or open up your filters. Your next collaborator might be one click away."
          action={
            <button
              type="button"
              className="button button-secondary"
              onClick={reset}
            >
              Clear filters
            </button>
          }
        />
      )}
      <p className="quiet-note">
        All profiles are fictional. Skills are self-reported in the intended
        product.
      </p>
    </>
  );
}

export function PersonPage({ id, demo }: { id: string; demo: DemoData }) {
  const person =
    id === "you" ? demo.profile : demoPeople.find((item) => item.id === id);
  const [dialog, setDialog] = useState<"invite" | "report" | null>(null);
  const [error, setError] = useState("");
  const [invited, setInvited] = useState(false);
  if (!person || demo.blockedIds.includes(id))
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
      setInvited(true);
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
