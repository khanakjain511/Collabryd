import type { Hackathon, Person, Team } from "../types";
import { eventDate } from "../data/demo";
import { Avatar, Badge, Icon } from "./ui";

export function PersonCard({
  person,
  compact = false,
}: {
  person: Person;
  compact?: boolean;
}) {
  return (
    <article className={`person-card ${compact ? "compact" : ""}`}>
      <div className="person-card-top">
        <Avatar name={person.name} color={person.color} />
        <span
          className={`availability ${person.available ? "" : "unavailable"}`}
        >
          <span />
          {person.available ? "Open to team up" : "Not available"}
        </span>
      </div>
      <a className="card-title" href={`#/users/${person.id}`}>
        <h3>{person.name}</h3>
        <Icon name="arrowUp" size={18} />
      </a>
      <p className="person-role">{person.role}</p>
      <p className="person-meta">
        {person.branch} <span>·</span> {person.year}
      </p>
      <div className="skill-list">
        {person.skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
      {!compact && <p className="person-bio">{person.bio}</p>}
      <div className="card-bottom">
        <span>Example profile</span>
        <a href={`#/users/${person.id}`}>
          Say hello <Icon name="arrow" size={17} />
        </a>
      </div>
    </article>
  );
}

export function TeamCard({ team }: { team: Team }) {
  const full = team.members.length >= team.capacity;
  return (
    <article className="team-card">
      <div className="team-card-top">
        <span
          className={`team-symbol ${team.domain === "Sustainability" ? "sage" : team.domain === "Social impact" ? "peach" : "lavender"}`}
        >
          <Icon
            name={
              team.domain === "Sustainability"
                ? "leaf"
                : team.domain === "Social impact"
                  ? "spark"
                  : "code"
            }
            size={24}
          />
        </span>
        <Badge
          tone={team.status !== "Recruiting" || full ? "neutral" : "positive"}
        >
          {team.status === "Recruiting" && full ? "Full" : team.status}
        </Badge>
      </div>
      <p className="eyebrow small-eyebrow">{team.domain}</p>
      <h3>
        <a href={`#/teams/${team.id}`}>{team.name}</a>
      </h3>
      <p className="team-description">{team.description}</p>
      <span className="small-label">LOOKING FOR</span>
      <div className="skill-list">
        {team.roles.map((role) => (
          <Badge key={role}>{role}</Badge>
        ))}
      </div>
      <div className="card-bottom">
        <span>
          <Icon name="people" size={15} /> {team.members.length}/{team.capacity}{" "}
          members
        </span>
        <a href={`#/teams/${team.id}`}>
          View team <Icon name="arrow" size={17} />
        </a>
      </div>
    </article>
  );
}

export function EventCard({ event }: { event: Hackathon }) {
  return (
    <article className="event-card">
      <a
        href={`#/hackathons/${event.id}`}
        className={`event-art ${event.color}`}
        aria-label={`View ${event.name}`}
      >
        <span className="event-art-label">EXAMPLE HACKATHON</span>
        <span className="event-art-symbol" aria-hidden="true">
          {event.symbol}
        </span>
        <span className="event-art-name">{event.name}</span>
        <span className="event-art-arrow">
          <Icon name="arrowUp" size={24} />
        </span>
      </a>
      <div className="event-info">
        <div className="event-meta">
          <span>
            <Icon name="calendar" size={15} />
            {eventDate(event.date)}
          </span>
          <span>{event.mode}</span>
        </div>
        <h3>
          <a href={`#/hackathons/${event.id}`}>{event.name}</a>
        </h3>
        <p>
          {event.category} <span>·</span> A new reason to build together
        </p>
      </div>
    </article>
  );
}
