import type { DemoData } from "../hooks/useDemoData";
import { EventCard, PersonCard, TeamCard } from "../components/Cards";
import { Avatar, Icon, PageHeading } from "../components/ui";

export function DashboardPage({ demo }: { demo: DemoData }) {
  const pending = demo.invitations.filter(
    (item) => item.status === "Pending" && (item.personId || "you") === "you",
  );
  return (
    <>
      <PageHeading
        eyebrow="A NEW DAY. A NEW POSSIBILITY."
        title={`Hey ${demo.profile.name.split(" ")[0]}, let’s build something.`}
        description="A few people, a good idea, and somewhere to start."
        action={
          <a className="button button-primary" href="#/teams/create">
            <Icon name="plus" size={18} />
            Create a team
          </a>
        }
      />
      <div className="dashboard-banner">
        <div>
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h2>
            Great things start
            <br />
            with <em>the right people.</em>
          </h2>
          <p>Your campus has more to offer than your group chat.</p>
          <a className="button button-cream" href="#/discover">
            Find your people <Icon name="arrowUp" size={17} />
          </a>
        </div>
        <div className="dashboard-orbit" aria-hidden="true">
          <span className="orbit-ring" />
          <span className="orbit-ring orbit-inner" />
          <span className="orbit-center">YOU</span>
          <Avatar name="Maya Sharma" color="peach" />
          <Avatar name="Arjun Mehta" color="sage" />
          <Avatar name="Zoya Khan" color="lavender" />
          <span className="orbit-star">✳</span>
        </div>
      </div>
      <div className="dashboard-summary">
        <a href="#/my-teams">
          <span className="summary-icon sage">
            <Icon name="people" />
          </span>
          <span>
            <strong>
              {demo.teams.filter((team) => team.members.includes("you")).length}{" "}
              demo team
              {demo.teams.filter((team) => team.members.includes("you"))
                .length === 1
                ? ""
                : "s"}
            </strong>
            <span>A place to make things happen</span>
          </span>
          <Icon name="arrowUp" size={18} />
        </a>
        <a href="#/my-teams">
          <span className="summary-icon peach">
            <Icon name="mail" />
          </span>
          <span>
            <strong>
              {pending.length} open invitation{pending.length === 1 ? "" : "s"}
            </strong>
            <span>Someone thinks you’d be a good fit</span>
          </span>
          <Icon name="arrowUp" size={18} />
        </a>
        <a href="#/settings/profile">
          <span className="summary-icon lavender">
            <Icon name="spark" />
          </span>
          <span>
            <strong>Make your profile yours</strong>
            <span>Your skills are a good place to start</span>
          </span>
          <Icon name="arrowUp" size={18} />
        </a>
      </div>
      <div className="workspace-section-heading">
        <div>
          <h2>People you could click with</h2>
          <p>
            Complementary skills. A shared curiosity. Example profiles to
            explore.
          </p>
        </div>
        <a className="text-link" href="#/discover">
          Meet everyone <Icon name="arrow" size={17} />
        </a>
      </div>
      <div className="cards-grid">
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
      <div className="workspace-section-heading">
        <div>
          <h2>A team with room for you</h2>
          <p>Good ideas looking for their missing piece.</p>
        </div>
        <a className="text-link" href="#/teams">
          Explore teams <Icon name="arrow" size={17} />
        </a>
      </div>
      <div className="cards-grid">
        {demo.teams.slice(0, 3).map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
      <div className="workspace-section-heading">
        <div>
          <h2>Something to build towards</h2>
          <p>Fictional events. Real possibilities for your frontend demo.</p>
        </div>
        <a className="text-link" href="#/hackathons">
          All hackathons <Icon name="arrow" size={17} />
        </a>
      </div>
      <div className="cards-grid">
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
