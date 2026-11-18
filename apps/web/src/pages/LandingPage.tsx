import type { DemoData } from "../hooks/useDemoData";
import { demoEvents, demoPeople } from "../data/demo";
import { EventCard, PersonCard } from "../components/Cards";
import { PublicLayout } from "../components/Layout";
import { Reveal } from "../components/Reveal";
import { Avatar, Badge, HeroNetwork, Icon } from "../components/ui";

const questions = [
  [
    "Who is Collabyrd for?",
    "Students who want to find people to build with, join a project team, or recruit for a hackathon. The planned launch starts with one verified campus community.",
  ],
  [
    "Do I need to be an experienced developer?",
    "Not at all. Share your skills honestly, say what you want to learn, and find a role that fits. Teams need different perspectives, not just more lines of code.",
  ],
  [
    "Does joining a team register me for a hackathon?",
    "No. Teams and event registration are separate. Always follow the event organizer’s official registration instructions.",
  ],
  [
    "Can I try the platform right now?",
    "Yes. The frontend demo lets you explore fictional people and teams, create a team, review requests and respond to invitations. It does not create real accounts or send messages.",
  ],
  [
    "Is my profile visible to everyone?",
    "The intended product keeps private discovery inside your verified campus. This demo uses fictional profiles only. Live visibility and campus policies must be confirmed before launch.",
  ],
];

export function LandingPage({ demo }: { demo: DemoData }) {
  return (
    <PublicLayout demo={demo}>
      <section className="hero container">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span className="status-dot" /> YOUR NEXT CHAPTER IS A TEAM EFFORT
          </div>
          <h1 tabIndex={-1}>
            Good ideas need
            <br />
            <em>great people.</em>
            <svg
              className="headline-swish"
              viewBox="0 0 360 18"
              aria-hidden="true"
            >
              <path
                d="M3 13C95 0 235 0 355 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </h1>
          <p className="hero-description">
            Find the people who bring your ideas to life.
            <br className="desktop-break" /> Meet collaborators, form your team,
            and build
            <br className="desktop-break" /> something that matters. Right on
            your campus.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#/register">
              Find your people <Icon name="arrowUp" size={18} />
            </a>
            <button
              type="button"
              className="button button-text"
              onClick={demo.openDemo}
            >
              <span className="play-icon" aria-hidden="true">
                ▷
              </span>{" "}
              Take a look around
            </button>
          </div>
          <div className="hero-footnote">
            <Icon name="lock" size={15} />
            <span>Campus-first. People-focused. Better together.</span>
          </div>
        </div>
        <div className="hero-visual">
          <HeroNetwork />
          <div className="hero-photo-wrap">
            <img
              className="hero-photo"
              src="/images/campus-team.webp"
              srcSet="/images/campus-team-small.webp 640w, /images/campus-team.webp 1200w"
              sizes="(max-width: 700px) 92vw, 48vw"
              width="1200"
              height="900"
              alt="Illustration of university students planning a project together"
              fetchPriority="high"
            />
            <div className="photo-caption">
              <span className="tiny-star" aria-hidden="true">
                ✳
              </span>
              <span>
                THE BEST PART OF AN IDEA?
                <br />
                <strong>The people you build it with.</strong>
              </span>
            </div>
          </div>
          <div className="floating-profile">
            <Avatar name="Maya Sharma" color="peach" />
            <div>
              <strong>
                Maya Sharma <span aria-hidden="true">↗</span>
              </strong>
              <span>Product designer</span>
              <div className="mini-skill">
                Figma <span>·</span> UI/UX
              </div>
            </div>
            <span className="profile-tick">
              <Icon name="check" size={13} />
            </span>
            <span className="floating-example">EXAMPLE PROFILE</span>
          </div>
          <div className="floating-team">
            <span className="team-tiny-icon">
              <Icon name="leaf" size={23} />
            </span>
            <div>
              <strong>A little idea. A growing team.</strong>
              <span>
                <span className="status-dot" /> Looking for a frontend developer
              </span>
            </div>
          </div>
          <span className="hero-spark" aria-hidden="true">
            ✳
          </span>
        </div>
      </section>

      <div className="container hero-bottom">
        <span>FOR THE THINGS YOU WANT TO BUILD</span>
        <div>
          <span>
            <Icon name="code" size={18} />
            Hackathons
          </span>
          <span>
            <Icon name="people" size={18} />
            Side projects
          </span>
          <span>
            <Icon name="spark" size={18} />
            Big little ideas
          </span>
        </div>
        <a href="#how-it-works">
          A good place to start <span aria-hidden="true">↓</span>
        </a>
      </div>

      <section className="section why-section" id="why-collabyrd">
        <div className="container">
          <Reveal>
            <div className="section-intro">
              <p className="eyebrow">
                01 / A LITTLE LESS SEARCHING. A LOT MORE BUILDING.
              </p>
              <h2>
                Your next teammate might be
                <br />
                <em>outside your group chat.</em>
              </h2>
              <p>
                You have the spark. Someone else has the missing skill.
                <br />
                Collabyrd helps you find each other.
              </p>
            </div>
          </Reveal>
          <div className="feature-grid">
            <Reveal className="feature-card feature-dark">
              <div className="feature-heading">
                <span>01</span>
                <Icon name="people" size={28} />
              </div>
              <div className="connection-visual" aria-hidden="true">
                <span className="node node-one">YOU</span>
                <span className="node node-two">DESIGN</span>
                <span className="node node-three">CODE</span>
                <span className="node node-four">IDEAS</span>
                <svg viewBox="0 0 320 180">
                  <path d="m160 70-95 55m95-55 104 55M160 70l10 95" />
                </svg>
              </div>
              <h3>Find your kind of people.</h3>
              <p>
                Discover students who share your curiosity and bring something
                different to the table.
              </p>
              <a href="#/discover">
                Meet your next collaborator <Icon name="arrowUp" size={18} />
              </a>
            </Reveal>
            <Reveal className="feature-card feature-sage">
              <div className="feature-heading">
                <span>02</span>
                <Icon name="code" size={28} />
              </div>
              <div className="roles-visual" aria-hidden="true">
                <span>
                  <span>Frontend developer</span>
                  <span className="role-checked">✓</span>
                </span>
                <span>
                  <span>Product designer</span>
                  <span className="role-checked">✓</span>
                </span>
                <span className="role-open">
                  <span>Your next teammate</span>
                  <span>+</span>
                </span>
              </div>
              <h3>Make room for great things.</h3>
              <p>
                Find a team that needs your skills, or start one and invite the
                people you’re missing.
              </p>
              <a href="#/teams">
                Find your place <Icon name="arrowUp" size={18} />
              </a>
            </Reveal>
            <Reveal className="feature-card feature-ivory">
              <div className="feature-heading">
                <span>03</span>
                <Icon name="calendar" size={28} />
              </div>
              <div className="calendar-visual" aria-hidden="true">
                <span>YOUR NEXT BUILD</span>
                <strong>12</strong>
                <span>
                  DECEMBER <span className="calendar-star">✳</span>
                </span>
              </div>
              <h3>A reason to get started.</h3>
              <p>
                Discover hackathons, explore the possibilities, and turn “we
                should” into “let’s build.”
              </p>
              <a href="#/hackathons">
                Explore what’s next <Icon name="arrowUp" size={18} />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section how-section container" id="how-it-works">
        <Reveal className="how-intro">
          <p className="eyebrow">02 / NO GRAND PLAN REQUIRED</p>
          <h2>
            From “what if”
            <br />
            to <em>“we built it.”</em>
          </h2>
          <p>Four small steps. A whole new set of possibilities.</p>
          <a className="button button-primary" href="#/register">
            Let’s get you started <Icon name="arrowUp" size={18} />
          </a>
          <span className="handwritten">
            Good things start somewhere. <span aria-hidden="true">↗</span>
          </span>
        </Reveal>
        <div className="steps">
          {[
            [
              "Make yourself known.",
              "Share your skills, interests, and the things you’d love to build. A little about you goes a long way.",
            ],
            [
              "Find your missing piece.",
              "Explore people and open roles. Look for complementary skills, a shared interest, or a little of both.",
            ],
            [
              "Say hello. Start a team.",
              "Send a join request or invite someone to your idea. Clear roles and visible requests keep everyone in the loop.",
            ],
            [
              "Build something together.",
              "Choose a hackathon, bring your strengths, and see what a few curious people can make happen.",
            ],
          ].map(([title, description], i) => (
            <Reveal className="step" key={title}>
              <span className="step-number">0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <Icon name="arrowUp" size={20} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section people-section">
        <div className="container">
          <Reveal>
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">
                  03 / DIFFERENT SKILLS. SHARED CURIOSITY.
                </p>
                <h2>
                  People worth
                  <br />
                  <em>building with.</em>
                </h2>
              </div>
              <div>
                <p>
                  Not just a profile. A possible beginning.
                  <br />
                  Meet a few fictional people from our demo.
                </p>
                <a className="text-link" href="#/discover">
                  Discover your people <Icon name="arrowUp" size={18} />
                </a>
              </div>
            </div>
          </Reveal>
          <div className="cards-grid">
            {demoPeople.slice(0, 3).map((person) => (
              <Reveal key={person.id}>
                <PersonCard person={person} compact />
              </Reveal>
            ))}
          </div>
          <div className="quiet-note">
            <Icon name="lock" size={14} /> These are example profiles. Private
            discovery is designed for verified campus members.
          </div>
        </div>
      </section>

      <section className="section events-section container">
        <Reveal>
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">04 / YOUR NEXT “LET’S DO THIS”</p>
              <h2>
                A deadline can be
                <br />
                <em>a beautiful beginning.</em>
              </h2>
            </div>
            <a className="text-link" href="#/hackathons">
              Explore hackathons <Icon name="arrowUp" size={18} />
            </a>
          </div>
        </Reveal>
        <div className="cards-grid">
          {demoEvents.map((event) => (
            <Reveal key={event.id}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>
        <p className="quiet-note">
          Illustrative events for the frontend demo. Official listings and
          registration will come from event organizers.
        </p>
      </section>

      <section className="section faq-section container" id="faq">
        <div>
          <p className="eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</p>
          <h2>
            Good questions.
            <br />
            <em>Honest answers.</em>
          </h2>
          <p>
            Still curious?{" "}
            <a href="#/about">
              Learn about the demo <Icon name="arrowUp" size={14} />
            </a>
          </p>
        </div>
        <div className="faq-list">
          {questions.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span className="faq-plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <HeroNetwork />
          <p className="eyebrow">YOU DON’T HAVE TO BUILD IT ALONE</p>
          <h2>
            Your next team
            <br />
            starts with <em>a hello.</em>
          </h2>
          <p>
            Bring your ideas. Bring your curiosity. We’ll help you find your
            people.
          </p>
          <a className="button button-cream" href="#/register">
            Find your people <Icon name="arrowUp" size={18} />
          </a>
          <span className="final-note">
            <Badge tone="inverse">
              A campus-first community, in the making.
            </Badge>
          </span>
        </div>
      </section>
      <div className="landing-demo-note container">
        <span className="status-dot" />
        <strong>A little transparency:</strong> this is a working frontend demo.
        All profiles, teams and events are examples.{" "}
        <button type="button" onClick={demo.openDemo}>
          Explore the demo <Icon name="arrowUp" size={14} />
        </button>
      </div>
    </PublicLayout>
  );
}
