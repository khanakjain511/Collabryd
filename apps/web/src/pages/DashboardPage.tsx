import { useEffect, useState } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { EventCard, PersonCard, TeamCard } from "../components/Cards";
import { Badge, EmptyState, Icon, PageHeading } from "../components/ui";
import { CardRail } from "../components/CardRail";
import { openSeats } from "../lib/roster";
import { recommendationsApi, type RecommendedProject } from "../lib/api";

export function DashboardPage({ demo }: { demo: DemoData }) {
  const [recommendedTeams, setRecommendedTeams] = useState<RecommendedProject[]>([]);

  useEffect(() => {
    if (demo.signedIn) {
      recommendationsApi
        .getRecommendedProjects(6)
        .then((recs) => {
          setRecommendedTeams(recs);
        })
        .catch(() => {});
    }
  }, [demo.signedIn]);

  const pending = demo.invitations.filter(
    (item) => item.status === "Pending" && (item.personId || "you") === "you",
  );
  const recruiting = demo.teams.filter((team) => openSeats(team) > 0);
  return (
    <>
      <PageHeading
        eyebrow="A NEW DAY. A NEW POSSIBILITY."
        title={`Hey ${demo.profile.name.split(" ")[0]}, let’s build something.`}
        description="A few people, a good idea, and somewhere to start."
        action={
          <a
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm"
            href="#/teams/create"
          >
            <Icon name="plus" size={18} />
            Create a team
          </a>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface border border-border rounded-2xl p-6 sm:p-8 items-center mb-8">
        <div>
          <span className="eyebrow text-xs uppercase tracking-wider font-semibold text-primary mb-2 block">
            YOUR NEXT CHAPTER
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold leading-tight mb-3">
            Great things start
            <br />
            with <em className="text-primary italic">the right people.</em>
          </h2>
          <p className="text-sm text-muted mb-5 leading-relaxed">
            Your campus has more to offer than your group chat.
          </p>
          <a
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer shadow-sm"
            href="#/discover"
          >
            Find your people <Icon name="arrowUp" size={17} />
          </a>
        </div>
        <img
          className="dashboard-photo w-full h-48 sm:h-60 rounded-xl object-cover shadow-sm"
          src="/images/campus-team-small.webp"
          alt="Generated editorial image of Indian students collaborating in a makerspace"
          width="720"
          height="480"
        />
      </div>
      <div className="dashboard-summary grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <a
          href="#/my-teams"
          className="bg-surface border border-border rounded-xl p-4 sm:p-5 flex items-center gap-4 hover:border-primary transition-colors"
        >
          <span className="bg-sage text-primary w-11 h-11 rounded-xl grid place-items-center shrink-0">
            <Icon name="people" />
          </span>
          <span className="flex flex-col flex-1">
            <strong className="text-sm font-semibold">
              {(demo.teams || []).filter((team) => (team.members || []).includes("you")).length}{" "}
              team
              {(demo.teams || []).filter((team) => (team.members || []).includes("you"))
                .length === 1
                ? ""
                : "s"}
            </strong>
            <span className="text-xs text-muted">
              A place to make things happen
            </span>
          </span>
          <Icon name="arrowUp" size={18} />
        </a>
        <a
          href="#/my-teams"
          className="bg-surface border border-border rounded-xl p-4 sm:p-5 flex items-center gap-4 hover:border-primary transition-colors"
        >
          <span className="bg-soft text-accent w-11 h-11 rounded-xl grid place-items-center shrink-0">
            <Icon name="mail" />
          </span>
          <span className="flex flex-col flex-1">
            <strong className="text-sm font-semibold">
              {pending.length} open invitation{pending.length === 1 ? "" : "s"}
            </strong>
            <span className="text-xs text-muted">
              Someone thinks you’d be a good fit
            </span>
          </span>
          <Icon name="arrowUp" size={18} />
        </a>
        <a
          href="#/settings/profile"
          className="bg-surface border border-border rounded-xl p-4 sm:p-5 flex items-center gap-4 hover:border-primary transition-colors"
        >
          <span className="bg-sage text-teal-800 dark:text-teal-200 w-11 h-11 rounded-xl grid place-items-center shrink-0">
            <Icon name="spark" />
          </span>
          <span className="flex flex-col flex-1">
            <strong className="text-sm font-semibold">
              Make your profile yours
            </strong>
            <span className="text-xs text-muted">
              Your skills are a good place to start
            </span>
          </span>
          <Icon name="arrowUp" size={18} />
        </a>
      </div>
      <div className="workspace-section-heading flex justify-between items-end gap-4 my-8">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-medium">
            People you could click with
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Complementary skills. A shared curiosity. Profiles to explore.
          </p>
        </div>
        <a
          className="text-link inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline"
          href="#/discover"
        >
          Meet everyone <Icon name="arrow" size={17} />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {demo.people
          .filter(
            (person) =>
              !demo.blockedIds.includes(person.id) &&
              (!person.status || person.status === "Active"),
          )
          .slice(0, 3)
          .map((person) => (
            <PersonCard key={person.id} person={person} compact />
          ))}
      </div>

      {recommendedTeams.length > 0 && (
        <>
          <div className="workspace-section-heading flex justify-between items-end gap-4 my-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-1">
                <Icon name="spark" size={12} />
                MATCHED TO YOUR SKILLS
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-medium">
                Recommended Teams for You
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Open projects looking for the exact skills in your profile.
              </p>
            </div>
            <a
              className="text-link inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline"
              href="#/teams"
            >
              All teams <Icon name="arrow" size={17} />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {recommendedTeams.map((rec) => (
              <div
                key={rec.projectId}
                className="bg-surface border border-border rounded-xl p-5 hover:border-primary transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {rec.category}
                    </span>
                    <Badge tone="positive">
                      {rec.matchedSkillsCount} skill match{rec.matchedSkillsCount === 1 ? "" : "es"}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-1">
                    <a
                      href={`#/teams/${rec.projectId}`}
                      className="hover:text-primary transition-colors"
                    >
                      {rec.title}
                    </a>
                  </h3>
                  <p className="text-xs text-muted mb-3 line-clamp-2">
                    {rec.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(rec.matchedSkills || []).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-0.5 rounded bg-sage/60 text-primary font-medium"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted">
                  <span>Led by {rec.ownerName}</span>
                  <a
                    href={`#/teams/${rec.projectId}`}
                    className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View team <Icon name="arrowUp" size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="workspace-section-heading flex justify-between items-end gap-4 my-8">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-medium">
            A team with room for you
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Good ideas looking for their missing piece.
          </p>
        </div>
        <a
          className="text-link inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline"
          href="#/teams"
        >
          Explore teams <Icon name="arrow" size={17} />
        </a>
      </div>
      {recruiting.length ? (
        <CardRail label="Recruiting teams">
          {recruiting.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </CardRail>
      ) : (
        <EmptyState
          title="No recruiting teams"
          description="Start a team and list the skills you’re looking for."
        />
      )}
      <div className="workspace-section-heading flex justify-between items-end gap-4 my-8">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-medium">
            Something to build towards
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Upcoming campus events and hackathons to build towards.
          </p>
        </div>
        <a
          className="text-link inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:underline"
          href="#/hackathons"
        >
          All hackathons <Icon name="arrow" size={17} />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {demo.events
          .filter(
            (event) => !event.publication || event.publication === "Published",
          )
          .slice(0, 3)
          .map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
      </div>
    </>
  );
}
