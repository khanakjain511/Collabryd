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
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <form
          className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4"
          onSubmit={save}
        >
          <div className="flex items-center gap-4 mb-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <span className="text-xs text-muted mt-1 block">
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
            <span className="text-xs text-muted mt-1 block">
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
          <label className="inline-flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
            <input
              name="available"
              type="checkbox"
              className="w-4 h-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
              defaultChecked={demo.profile.available}
            />
            I’m open to teaming up
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <fieldset className="grid gap-3 mt-4 border-0 p-0">
            <legend className="text-sm font-semibold text-ink">Your work, if you’d like to share it</legend>
            <p className="text-xs text-muted mt-1 block">
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
            <p className="text-xs text-danger font-medium mt-1" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <a
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
              href="#/dashboard"
            >
              {onboarding ? "Use the sample profile" : "Back to overview"}
            </a>
            <button
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
              type="submit"
            >
              {onboarding ? "Let’s find your people" : "Save demo profile"}
              <Icon name="arrowUp" size={17} />
            </button>
          </div>
        </form>
        <aside>
          <div className="bg-soft border border-border rounded-xl p-6 shadow-sm flex flex-col gap-3">
            <span className="text-accent text-lg inline-block mr-1" aria-hidden="true">
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
    <nav className="flex flex-wrap gap-4 mb-6" aria-label="Settings pages">
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
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
          {kind === "privacy" ? (
            <form
              className="flex flex-col gap-4"
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
              <label className="flex items-center justify-between py-4 border-b border-border text-sm text-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
                  checked={demo.visible}
                  onChange={(event) => {
                    demo.setVisible(event.target.checked);
                    setSaved(false);
                  }}
                />
                <span>
                  <strong>Show my example profile in discovery</strong>
                  <small className="block text-muted">
                    This previews a visibility preference. Nothing is uploaded.
                  </small>
                </span>
              </label>
              <label className="flex items-center justify-between py-4 border-b border-border text-sm text-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-input-border text-primary focus:ring-primary accent-primary cursor-pointer"
                  checked={demo.notificationsEnabled}
                  onChange={(event) => {
                    demo.setNotificationsEnabled(event.target.checked);
                    setSaved(false);
                  }}
                />
                <span>
                  <strong>Receive local activity updates</strong>
                  <small className="block text-muted">
                    Pause new demo notifications. Action confirmations still
                    stay visible.
                  </small>
                </span>
              </label>
              <h3>Blocked example profiles</h3>
              {demo.blockedIds.length ? (
                demo.blockedIds.map((id) => (
                  <div
                    className="flex items-center justify-between p-3 sm:px-4 border-b border-border text-sm last:border-b-0"
                    key={id}
                  >
                    <span>
                      {demo.people.find((person) => person.id === id)?.name}
                    </span>
                    <button
                      type="button"
                      className="border-0 bg-transparent py-1.5 px-0 text-primary text-sm underline underline-offset-4 cursor-pointer hover:text-primary-hover transition-colors font-medium"
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
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Save demo preferences <Icon name="check" size={17} />
              </button>
              {saved && (
                <p className="flex items-center gap-2 text-xs text-muted my-2" role="status">
                  Preference saved for this demo session. It resets on refresh.
                </p>
              )}
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <h2>A clean slate, whenever you want.</h2>
              <p>
                No real account, email verification, password, or server session
                exists. Team and profile changes are held in memory until you
                refresh this page.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-border text-sm">
                <span>Signed in as</span>
                <strong>{demo.profile.name} · example student</strong>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-border text-sm">
                <span>Storage</span>
                <strong>Browser memory only</strong>
              </div>
              <a
                href="#/reset-password"
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
              >
                Preview password recovery <Icon name="arrowUp" size={17} />
              </a>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
                onClick={demo.signOut}
              >
                Leave the demo <Icon name="logout" size={17} />
              </button>
              <button
                type="button"
                className="border-0 bg-transparent py-1.5 px-0 text-danger text-sm underline underline-offset-4 cursor-pointer hover:opacity-80 transition-opacity font-medium text-left"
                onClick={() => {
                  window.location.hash = "/";
                  window.location.reload();
                }}
              >
                Reset all demo changes
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
                onClick={() =>
                  demo.setProfile({ ...demo.profile, status: "Suspended" })
                }
              >
                Preview suspended-account access
              </button>
              {demo.deletionRequested ? (
                <p className="flex items-center gap-2 text-xs text-muted my-2" role="status">
                  Demo deletion request recorded. No account or real data was
                  deleted.
                </p>
              ) : (
                <button
                  type="button"
                  className="border-0 bg-transparent py-1.5 px-0 text-danger text-sm underline underline-offset-4 cursor-pointer hover:opacity-80 transition-opacity font-medium text-left"
                  onClick={() => setConfirmDeletion(true)}
                >
                  Preview account deletion request
                </button>
              )}
              <p className="text-xs text-muted mt-1 block">
                Real account deletion, retention and password policies will need
                a connected backend and campus policy.
              </p>
            </div>
          )}
        </div>
        <aside>
          <SettingsLinks />
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
            <Icon name="lock" size={26} />
            <h3>Trust starts with clear boundaries.</h3>
            <p>
              Demo controls show interface behavior. They do not prove
              server-side privacy, security, or campus permissions.
            </p>
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-border pb-1 hover:border-primary hover:text-primary transition-colors"
              href="#/privacy"
            >
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
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
              onClick={() => setConfirmDeletion(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-danger text-white hover:bg-danger/90 transition-colors cursor-pointer"
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
            className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
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
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          aria-pressed={!unreadOnly}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            !unreadOnly
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface text-ink border-border hover:border-primary"
          }`}
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
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            unreadOnly
              ? "bg-primary text-on-primary border-primary"
              : "bg-surface text-ink border-border hover:border-primary"
          }`}
          onClick={() => {
            setUnreadOnly(true);
            setPage(1);
          }}
        >
          Unread
        </button>
      </div>
      {notices.length ? (
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm divide-y divide-border">
          {results.items.map((notice) => (
            <article
              className={`flex items-start gap-4 p-4 sm:p-5 border-b border-border last:border-b-0 transition-colors ${
                notice.read ? "bg-surface" : "bg-soft/70"
              }`}
              key={notice.id}
            >
              <span className="w-11 h-11 rounded-xl bg-success-bg text-success grid place-items-center shrink-0">
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
                  <h3 className="font-semibold text-ink text-base">{notice.title}</h3>
                </a>
                <p className="text-sm text-muted">{notice.description}</p>
                <span className="text-xs text-muted mt-1 block">
                  Example campus · Demo session{" "}
                  {notice.read ? "· Read" : "· Unread"}
                </span>
              </div>
              {!notice.read && (
                <button
                  className="w-10 h-10 rounded-lg inline-flex items-center justify-center text-muted hover:text-ink hover:bg-soft transition-colors cursor-pointer ml-auto"
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
            <a
              href="#/discover"
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
            >
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
        <p className="flex items-center gap-2 text-xs text-muted my-2">
          New local activity updates are paused. You can enable them in{" "}
          <a href="#/settings/privacy" className="text-primary underline">privacy settings</a>.
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
          "Your example profile and team changes live in browser memory for this tab. They reset on refresh. Theme and reduced-motion preferences are saved locally in this browser. No account details or passwords are sent to a Collabyrd backend or stored by this app. Use fictional details only.",
        ],
        [
          "What you see.",
          "All example people, teams and hackathons are fictional. Campus scenes combine AI-generated illustrations and licensed stock photography; they do not depict verified Collabyrd members or imply endorsement. Images and fonts are served locally with the frontend.",
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
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
          <EmptyState
            title="A little off the beaten path."
            description="This page doesn’t exist, but your next beginning is just over here."
            action={
              <a
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
                href="#/"
              >
                Back to Collabyrd <Icon name="arrowUp" size={17} />
              </a>
            }
          />
        </div>
      </PublicLayout>
    );
  return (
    <PublicLayout demo={demo}>
      <article className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase mb-3 block">
          COLLABYRD / {kind.toUpperCase()}
        </p>
        <h1 tabIndex={-1}>{page.title}</h1>
        <p className="text-base sm:text-lg text-ink leading-relaxed mb-8">{page.intro}</p>
        {page.sections.map(([title, body]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
        <div className="flex flex-wrap items-center gap-4 mt-8">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
            onClick={demo.openDemo}
          >
            Take a look around <Icon name="arrowUp" size={17} />
          </button>
          <a
            href="#/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-border pb-1 hover:border-primary hover:text-primary transition-colors"
          >
            Back to the beginning <Icon name="arrow" size={17} />
          </a>
        </div>
      </article>
    </PublicLayout>
  );
}
