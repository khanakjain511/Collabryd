import type { Hackathon, Person, Team } from "../types";
import { eventDate } from "../data/demo";
import { Avatar, Badge, Icon, SeatsSkeleton } from "./ui";
import { TeamSeats } from "./Roster";

export function PersonCard({
  person,
  compact = false,
}: {
  person: Person;
  compact?: boolean;
}) {
  return (
    <article
      className={`person-card bg-surface border border-border rounded-xl p-6 flex flex-col h-full ${compact ? "compact" : ""}`}
    >
      <div className="person-card-top flex items-center justify-between mb-5">
        <Avatar name={person.name} color={person.color} />
        <span
          className={`availability inline-flex items-center gap-1.5 text-xs text-ink ${person.available ? "" : "unavailable text-muted"}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${person.available ? "bg-success" : "bg-muted"}`}
          />
          {person.available ? "Open to team up" : "Not available"}
        </span>
      </div>
      <a
        className="card-title flex items-center justify-between gap-2"
        href={`#/users/${person.id}`}
      >
        <h3 className="font-display text-2xl font-medium">{person.name}</h3>
        <Icon name="arrowUp" size={18} />
      </a>
      <p className="person-role text-sm text-ink my-1">{person.role}</p>
      <p className="person-meta text-xs text-muted mb-4">
        {person.branch} <span className="px-1">·</span> {person.year}
      </p>
      <div className="skill-list flex flex-wrap gap-1.5">
        {person.skills.map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
      {!compact && (
        <p className="person-bio text-sm leading-relaxed text-muted mt-4 flex-1">
          {person.bio}
        </p>
      )}
      <div className="card-bottom flex items-center justify-between gap-2 border-t border-border pt-4 mt-5 text-sm">
        <span className="text-xs text-muted">Campus member</span>
        <a
          href={`#/users/${person.id}`}
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          Say hello <Icon name="arrow" size={17} />
        </a>
      </div>
    </article>
  );
}

export function TeamCard({ team }: { team: Team }) {
  const memberCount = team?.members?.length || 0;
  const capacity = team?.capacity || 4;
  const full = memberCount >= capacity;
  return (
    <article className="team-card bg-surface border border-border rounded-xl p-6 flex flex-col h-full">
      <div className="team-card-top flex items-center justify-between mb-5">
        <span
          className={`w-10 h-10 rounded-lg grid place-items-center ${team.domain === "Sustainability" ? "bg-sage text-primary" : team.domain === "Social impact" ? "bg-peach text-accent" : "bg-lavender text-teal-800 dark:text-teal-200"}`}
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
      <p className="eyebrow small-eyebrow text-xs tracking-wider uppercase font-semibold text-primary mb-1">
        {team.domain}
      </p>
      <h3 className="font-display text-2xl font-medium">
        <a href={`#/teams/${team.id}`}>{team.name}</a>
      </h3>
      <p className="team-description text-sm leading-relaxed text-muted flex-1 mb-4">
        {team.description}
      </p>
      <span className="small-label text-xs font-bold text-muted uppercase tracking-wider mb-2">
        LOOKING FOR
      </span>
      <div className="skill-list flex flex-wrap gap-1.5 mb-4">
        {team.roles.map((role) => (
          <Badge key={role}>{role}</Badge>
        ))}
      </div>
      <div className="card-bottom flex items-center justify-between gap-2 border-t border-border pt-4 mt-auto text-sm">
        <TeamSeats team={team} size="md" />
        <a
          href={`#/teams/${team.id}`}
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          View team <Icon name="arrow" size={17} />
        </a>
      </div>
    </article>
  );
}

export function TeamCardSkeleton() {
  return (
    <article
      className="team-card bg-surface border border-border rounded-xl p-6 flex flex-col h-full animate-pulse"
      aria-label="Loading team card"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="w-10 h-10 rounded-lg bg-soft" />
        <div className="w-16 h-5 rounded-md bg-soft" />
      </div>
      <div className="w-20 h-3 rounded bg-soft mb-2" />
      <div className="w-3/4 h-6 rounded bg-soft mb-3" />
      <div className="w-full h-12 rounded bg-soft mb-4" />
      <div className="flex gap-1.5 mb-6">
        <div className="w-16 h-5 rounded-md bg-soft" />
        <div className="w-16 h-5 rounded-md bg-soft" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
        <SeatsSkeleton count={3} size="md" />
        <div className="w-20 h-4 rounded bg-soft" />
      </div>
    </article>
  );
}

export function EventCard({ event }: { event: Hackathon }) {
  return (
    <article className="event-card flex flex-col border border-border rounded-xl overflow-hidden bg-surface">
      <a
        href={`#/hackathons/${event.id}`}
        className={`event-art relative flex flex-col min-h-[180px] p-5 overflow-hidden ${event.color}`}
        aria-label={`View ${event.name}`}
      >
        <span className="event-art-label text-xs tracking-wider font-bold uppercase">
          EXAMPLE HACKATHON
        </span>
        <span
          className="event-art-symbol absolute right-5 top-10 text-6xl opacity-40 pointer-events-none"
          aria-hidden="true"
        >
          {event.symbol}
        </span>
        <span className="event-art-name font-display text-2xl sm:text-3xl font-medium mt-auto z-10 leading-tight">
          {event.name}
        </span>
        <span className="event-art-arrow absolute bottom-4 right-4">
          <Icon name="arrowUp" size={24} />
        </span>
      </a>
      <div className="event-info p-5">
        <div className="event-meta flex justify-between items-center text-xs text-muted mb-2">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="calendar" size={15} />
            {eventDate(event.date)}
          </span>
          <span>{event.mode}</span>
        </div>
        <h3 className="text-base font-semibold mb-1">
          <a href={`#/hackathons/${event.id}`} className="hover:text-primary">
            {event.name}
          </a>
        </h3>
        <p className="text-xs text-muted">
          {event.category} <span className="px-1">·</span> A new reason to build
          together
        </p>
      </div>
    </article>
  );
}
