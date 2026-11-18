import { useState } from "react";
import type { FormEvent } from "react";
import type { DemoData } from "../hooks/useDemoData";
import { PublicLayout } from "../components/Layout";
import {
  Avatar,
  Dialog,
  EmptyState,
  Icon,
  PageHeading,
} from "../components/ui";
import { isHttpUrl, paginate } from "../lib/validation";
import { Pagination } from "../components/Pagination";

export function ProfileFormPage({
  demo,
  onboarding = false,
}: {
  demo: DemoData;
  onboarding?: boolean;
}) {
  const [error, setError] = useState("");
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const githubUrl = String(form.get("githubUrl")).trim();
    const linkedinUrl = String(form.get("linkedinUrl")).trim();
    const portfolioUrl = String(form.get("portfolioUrl")).trim();
    const availableFrom = String(form.get("availableFrom"));
    const availableUntil = String(form.get("availableUntil"));
    if (![githubUrl, linkedinUrl, portfolioUrl].every(isHttpUrl)) {
      setError(
        "Use a full http:// or https:// link, or leave optional links empty.",
      );
      return;
    }
    if (availableFrom && availableUntil && availableFrom > availableUntil) {
      setError("The availability end date must be on or after the start date.");
      return;
    }
    if (
      !String(form.get("name")).trim() ||
      !String(form.get("skills")).trim()
    ) {
      setError("Add your name and at least one skill.");
      return;
    }
    setError("");
    demo.saveProfile({
      ...demo.profile,
      name: String(form.get("name")).trim(),
      role: String(form.get("role")),
      branch: String(form.get("branch")),
      year: String(form.get("year")),
      skills: String(form.get("skills"))
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      interests: String(form.get("interests")),
      bio: String(form.get("bio")),
      available: form.get("available") === "on",
      proficiency: form.get("proficiency") as
        "Learning" | "Comfortable" | "Experienced",
      availableFrom,
      availableUntil,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    });
    if (onboarding) window.location.hash = "/dashboard";
  }
  return (
    <>
      <PageHeading
        eyebrow={
          onboarding
            ? "A LITTLE ABOUT YOU GOES A LONG WAY"
            : "MAKE YOURSELF KNOWN"
        }
        title={
          onboarding
            ? "There’s a place for what you bring."
            : "Your profile. Your story."
        }
        description="Share your strengths, your interests, and what you’d love to build next. Use fictional details in this demo."
      />
      <div className="detail-grid">
        <form className="panel stack-form" onSubmit={save}>
          <div className="profile-form-intro">
            <Avatar name={demo.profile.name} color={demo.profile.color} />
            <div>
              <h2>A good place to begin.</h2>
              <p>All changes stay in this demo session.</p>
            </div>
          </div>
          <label>
            Your name
            <input
              name="name"
              required
              maxLength={80}
              defaultValue={demo.profile.name}
              autoComplete="name"
            />
          </label>
          <div className="form-columns">
            <label>
              Branch
              <select name="branch" defaultValue={demo.profile.branch}>
                <option>Computer Science</option>
                <option>Information Technology</option>
                <option>Design</option>
                <option>Electronics</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Year
              <select name="year" defaultValue={demo.profile.year}>
                <option>1st year</option>
                <option>2nd year</option>
                <option>3rd year</option>
                <option>4th year</option>
                <option>Postgraduate</option>
              </select>
            </label>
          </div>
          <label>
            Preferred role
            <select name="role" defaultValue={demo.profile.role}>
              <option>Frontend developer</option>
              <option>Backend developer</option>
              <option>Full-stack developer</option>
              <option>Product designer</option>
              <option>AI/ML engineer</option>
              <option>Mobile developer</option>
              <option>Exploring</option>
            </select>
          </label>
          <label>
            Skills you’d like to bring
            <input
              name="skills"
              defaultValue={demo.profile.skills.join(", ")}
              required
              maxLength={200}
            />
            <span className="field-hint">
              Separate skills with commas. Skills are self-reported.
            </span>
          </label>
          <label>
            Experience with your listed skills
            <select
              name="proficiency"
              defaultValue={demo.profile.proficiency || "Learning"}
            >
              <option>Learning</option>
              <option>Comfortable</option>
              <option>Experienced</option>
            </select>
            <span className="field-hint">
              Self-reported, not a certification. Describe differences in your
              bio.
            </span>
          </label>
          <label>
            What gets you curious?
            <input
              name="interests"
              defaultValue={demo.profile.interests}
              maxLength={200}
            />
          </label>
          <label>
            A little about you
            <textarea
              name="bio"
              rows={4}
              defaultValue={demo.profile.bio}
              maxLength={600}
            />
          </label>
          <label className="checkbox-label">
            <input
              name="available"
              type="checkbox"
              defaultChecked={demo.profile.available}
            />
            I’m open to teaming up
          </label>
          <div className="form-columns">
            <label>
              Available from (optional)
              <input
                name="availableFrom"
                type="date"
                defaultValue={demo.profile.availableFrom}
              />
            </label>
            <label>
              Available until (optional)
              <input
                name="availableUntil"
                type="date"
                defaultValue={demo.profile.availableUntil}
              />
            </label>
          </div>
          <fieldset className="optional-links">
            <legend>Your work, if you’d like to share it</legend>
            <p className="field-hint">
              These links are optional. Use fictional details in the demo.
            </p>
            <label>
              GitHub URL
              <input
                name="githubUrl"
                type="url"
                placeholder="https://github.com/your-profile"
                defaultValue={demo.profile.githubUrl}
              />
            </label>
            <label>
              LinkedIn URL
              <input
                name="linkedinUrl"
                type="url"
                placeholder="https://www.linkedin.com/in/your-profile"
                defaultValue={demo.profile.linkedinUrl}
              />
            </label>
            <label>
              Portfolio URL
              <input
                name="portfolioUrl"
                type="url"
                placeholder="https://your-work.example"
                defaultValue={demo.profile.portfolioUrl}
              />
            </label>
          </fieldset>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            <a className="button button-secondary" href="#/dashboard">
              {onboarding ? "Use the sample profile" : "Back to overview"}
            </a>
            <button className="button button-primary" type="submit">
              {onboarding ? "Let’s find your people" : "Save demo profile"}
              <Icon name="arrowUp" size={17} />
            </button>
          </div>
        </form>
        <aside>
          <div className="panel advice-panel">
            <span className="advice-star" aria-hidden="true">
              ✳
            </span>
            <h2>
              A person.
              <br />
              <em>Not a résumé.</em>
            </h2>
            <p>
              You don’t need to know everything. A little honesty about your
              skills and what you’re curious about helps the right people find
              you.
            </p>
            <p>
              Optional links can wait. Your interest in building something is a
              good start.
            </p>
          </div>
          <SettingsLinks />
        </aside>
      </div>
    </>
  );
}

function SettingsLinks() {
  return (
    <nav className="settings-links" aria-label="Settings pages">
      <a href="#/settings/profile">
        Profile <Icon name="arrowUp" size={16} />
      </a>
      <a href="#/settings/privacy">
        Privacy & visibility <Icon name="arrowUp" size={16} />
      </a>
      <a href="#/settings/account">
        Account & demo session <Icon name="arrowUp" size={16} />
      </a>
    </nav>
  );
}

export function SettingsPage({
  kind,
  demo,
}: {
  kind: "privacy" | "account";
  demo: DemoData;
}) {
  const [saved, setSaved] = useState(false);
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="YOUR SPACE. YOUR CHOICES."
        title={
          kind === "privacy"
            ? "A little control feels good."
            : "Your demo session."
        }
        description={
          kind === "privacy"
            ? "Preview the controls that make campus collaboration more comfortable."
            : "Everything here is a frontend demonstration, not a real student account."
        }
      />
      <div className="detail-grid">
        <div className="panel">
          {kind === "privacy" ? (
            <form
              className="stack-form"
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(true);
              }}
            >
              <h2>Who can discover you?</h2>
              <p>
                The intended live product limits private discovery to verified
                campus members. This demo does not publish your sample profile
                anywhere.
              </p>
              <label className="checkbox-label setting-toggle">
                <input
                  type="checkbox"
                  checked={demo.visible}
                  onChange={(event) => {
                    demo.setVisible(event.target.checked);
                    setSaved(false);
                  }}
                />
                <span>
                  <strong>Show my example profile in discovery</strong>
                  <small>
                    This previews a visibility preference. Nothing is uploaded.
                  </small>
                </span>
              </label>
              <label className="checkbox-label setting-toggle">
                <input
                  type="checkbox"
                  checked={demo.notificationsEnabled}
                  onChange={(event) => {
                    demo.setNotificationsEnabled(event.target.checked);
                    setSaved(false);
                  }}
                />
                <span>
                  <strong>Receive local activity updates</strong>
                  <small>
                    Pause new demo notifications. Action confirmations still
                    stay visible.
                  </small>
                </span>
              </label>
              <h3>Blocked example profiles</h3>
              {demo.blockedIds.length ? (
                demo.blockedIds.map((id) => (
                  <div className="blocked-row" key={id}>
                    <span>
                      {demo.people.find((person) => person.id === id)?.name}
                    </span>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() =>
                        demo.setBlockedIds(
                          demo.blockedIds.filter((item) => item !== id),
                        )
                      }
                    >
                      Unblock
                    </button>
                  </div>
                ))
              ) : (
                <p>You haven’t blocked any example people.</p>
              )}
              <button type="submit" className="button button-primary">
                Save demo preferences <Icon name="check" size={17} />
              </button>
              {saved && (
                <p className="inline-info" role="status">
                  Preference saved for this demo session. It resets on refresh.
                </p>
              )}
            </form>
          ) : (
            <div className="stack-form">
              <h2>A clean slate, whenever you want.</h2>
              <p>
                No real account, email verification, password, or server session
                exists. Team and profile changes are held in memory until you
                refresh this page.
              </p>
              <div className="account-detail">
                <span>Signed in as</span>
                <strong>{demo.profile.name} · example student</strong>
              </div>
              <div className="account-detail">
                <span>Storage</span>
                <strong>Browser memory only</strong>
              </div>
              <a href="#/reset-password" className="button button-secondary">
                Preview password recovery <Icon name="arrowUp" size={17} />
              </a>
              <button
                type="button"
                className="button button-secondary"
                onClick={demo.signOut}
              >
                Leave the demo <Icon name="logout" size={17} />
              </button>
              <button
                type="button"
                className="text-button danger-text"
                onClick={() => {
                  window.location.hash = "/";
                  window.location.reload();
                }}
              >
                Reset all demo changes
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  demo.setProfile({ ...demo.profile, status: "Suspended" })
                }
              >
                Preview suspended-account access
              </button>
              {demo.deletionRequested ? (
                <p className="inline-info" role="status">
                  Demo deletion request recorded. No account or real data was
                  deleted.
                </p>
              ) : (
                <button
                  type="button"
                  className="text-button danger-text"
                  onClick={() => setConfirmDeletion(true)}
                >
                  Preview account deletion request
                </button>
              )}
              <p className="field-hint">
                Real account deletion, retention and password policies will need
                a connected backend and campus policy.
              </p>
            </div>
          )}
        </div>
        <aside>
          <SettingsLinks />
          <div className="panel">
            <Icon name="lock" size={26} />
            <h3>Trust starts with clear boundaries.</h3>
            <p>
              Demo controls show interface behavior. They do not prove
              server-side privacy, security, or campus permissions.
            </p>
            <a className="text-link" href="#/privacy">
              Read demo information <Icon name="arrowUp" size={16} />
            </a>
          </div>
        </aside>
      </div>
      {confirmDeletion && (
        <Dialog
          title="Preview an account deletion request?"
          onClose={() => setConfirmDeletion(false)}
        >
          <p>
            This records a local request only. No real account or data will be
            deleted. A live product must explain its retention policy and
            confirm the server outcome.
          </p>
          <div className="form-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setConfirmDeletion(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button-danger"
              onClick={() => {
                demo.setDeletionRequested(true);
                setConfirmDeletion(false);
              }}
            >
              Record demo deletion request
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

export function NotificationsPage({ demo }: { demo: DemoData }) {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const notices = demo.notices.filter((notice) => !unreadOnly || !notice.read);
  const results = paginate(notices, page);
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE SOMETHING HAPPENED"
        title="The latest from your corner."
        description="Invitations, team updates, and small steps forward."
        action={
          <button
            type="button"
            className="button button-secondary"
            onClick={() =>
              demo.setNotices(
                demo.notices.map((notice) => ({ ...notice, read: true })),
              )
            }
          >
            <Icon name="check" size={17} />
            Mark all as read
          </button>
        }
      />
      <div className="filter-tabs">
        <button
          type="button"
          aria-pressed={!unreadOnly}
          className={!unreadOnly ? "active" : ""}
          onClick={() => {
            setUnreadOnly(false);
            setPage(1);
          }}
        >
          All updates
        </button>
        <button
          type="button"
          aria-pressed={unreadOnly}
          className={unreadOnly ? "active" : ""}
          onClick={() => {
            setUnreadOnly(true);
            setPage(1);
          }}
        >
          Unread
        </button>
      </div>
      {notices.length ? (
        <div className="list-panel">
          {results.items.map((notice) => (
            <article
              className={`notice-row ${notice.read ? "" : "notice-unread"}`}
              key={notice.id}
            >
              <span className="summary-icon sage">
                <Icon name="bell" />
              </span>
              <div>
                <a
                  href={notice.href}
                  onClick={() =>
                    demo.setNotices(
                      demo.notices.map((item) =>
                        item.id === notice.id ? { ...item, read: true } : item,
                      ),
                    )
                  }
                >
                  <h3>{notice.title}</h3>
                </a>
                <p>{notice.description}</p>
                <span className="field-hint">
                  Example campus · Demo session{" "}
                  {notice.read ? "· Read" : "· Unread"}
                </span>
              </div>
              {!notice.read && (
                <button
                  className="icon-button"
                  type="button"
                  aria-label={`Mark ${notice.title} as read`}
                  onClick={() =>
                    demo.setNotices(
                      demo.notices.map((item) =>
                        item.id === notice.id ? { ...item, read: true } : item,
                      ),
                    )
                  }
                >
                  <Icon name="check" size={18} />
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="All caught up. That feels nice."
          description="The next invitation or team update will appear here in this demo."
          action={
            <a href="#/discover" className="button button-primary">
              Meet some people <Icon name="arrowUp" size={17} />
            </a>
          }
        />
      )}
      <Pagination
        page={results.page}
        totalPages={results.totalPages}
        onChange={setPage}
      />
      {!demo.notificationsEnabled && (
        <p className="inline-info">
          New local activity updates are paused. You can enable them in{" "}
          <a href="#/settings/privacy">privacy settings</a>.
        </p>
      )}
    </>
  );
}

export function InfoPage({ kind, demo }: { kind: string; demo: DemoData }) {
  const content: Record<
    string,
    { title: string; intro: string; sections: [string, string][] }
  > = {
    about: {
      title: "Some things are better built together.",
      intro:
        "Collabyrd is a campus-first teammate-finding concept. A place for students to meet complementary skills, form teams, and find their next reason to build.",
      sections: [
        [
          "A clear purpose.",
          "The goal is simple: make it easier to find people beyond your immediate circle. Profiles, open roles, join requests and invitations bring the first steps of team formation into one place.",
        ],
        [
          "A working frontend, in the making.",
          "This local demo uses fictional people, teams and events. You can explore, create an example team, review requests and try the interface. No real accounts, messages, registrations or emails are created. Changes reset when you refresh.",
        ],
        [
          "A thoughtful starting point.",
          "The planned MVP begins with one verified campus. Live verification, privacy enforcement, membership transactions, moderation and event curation need backend integration and an agreed campus policy. Chat, workspaces, AI scoring and cross-campus discovery are outside this initial frontend.",
        ],
      ],
    },
    privacy: {
      title: "Clear boundaries. A little more trust.",
      intro:
        "Privacy information for this frontend demonstration. This is not the privacy notice for a launched campus service.",
      sections: [
        [
          "What this demo stores.",
          "Your example profile and team changes live in browser memory for this tab. They reset on refresh. No account details or passwords are sent to a Collabyrd backend or stored by this app. Use fictional details only.",
        ],
        [
          "What you see.",
          "All example people, teams and hackathons are fictional. The campus collaboration photograph is AI-generated illustrative imagery. Static assets are served with the frontend.",
        ],
        [
          "Before a real launch.",
          "A live platform will need an owner-approved notice describing data collection, purposes, permissions, retention, deletion, support contacts and campus rules. Browser visibility controls alone cannot enforce privacy.",
        ],
      ],
    },
    terms: {
      title: "A preview, with honest expectations.",
      intro:
        "This frontend is an educational product demonstration, not an operating student service or institutional offering.",
      sections: [
        [
          "Use example details.",
          "Do not enter a real password or sensitive student information. No real account is created. Demo actions affect fictional local data only.",
        ],
        [
          "No official event registration.",
          "The displayed events are examples. No organizer endorsement, prizes, eligibility rules or registrations are being offered. Team membership in the demo does not register you for a hackathon.",
        ],
        [
          "The live product needs its own rules.",
          "Campus eligibility, moderation, content ownership, acceptable use, retention and service terms require real policy decisions before launch. No generated policy text here claims legal compliance.",
        ],
      ],
    },
    contact: {
      title: "Good questions deserve a real answer.",
      intro:
        "This demo has no monitored inbox or support service. We won’t send your message into an empty form.",
      sections: [
        [
          "For the current project.",
          "Share feedback with the project team or in the conversation where you’re reviewing Collabyrd. A real support contact will be added when the service owner and campus launch are confirmed.",
        ],
        [
          "Want to understand what works?",
          "Explore the demo to try people filters, team creation, join requests, leader review, invitations, profile editing and the local moderation queue. Everything is labeled as example data.",
        ],
      ],
    },
  };
  const page = content[kind];
  if (!page)
    return (
      <PublicLayout demo={demo}>
        <div className="container info-page">
          <EmptyState
            title="A little off the beaten path."
            description="This page doesn’t exist, but your next beginning is just over here."
            action={
              <a className="button button-primary" href="#/">
                Back to Collabyrd <Icon name="arrowUp" size={17} />
              </a>
            }
          />
        </div>
      </PublicLayout>
    );
  return (
    <PublicLayout demo={demo}>
      <article className="container info-page">
        <p className="eyebrow">COLLABYRD / {kind.toUpperCase()}</p>
        <h1 tabIndex={-1}>{page.title}</h1>
        <p className="info-intro">{page.intro}</p>
        {page.sections.map(([title, body]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
        <div className="hero-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={demo.openDemo}
          >
            Take a look around <Icon name="arrowUp" size={17} />
          </button>
          <a href="#/" className="text-link">
            Back to the beginning <Icon name="arrow" size={17} />
          </a>
        </div>
      </article>
    </PublicLayout>
  );
}
