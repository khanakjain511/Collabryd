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
        description="Share your strengths, your interests, and what you’d love to build next."
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
              <p>Keep your profile current to help the right teammates find you.</p>
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
              {onboarding ? "Skip for now" : "Back to overview"}
            </a>
            <button
              className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
              type="submit"
            >
              {onboarding ? "Let’s find your people" : "Save profile"}
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
        Account & session <Icon name="arrowUp" size={16} />
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
            : "Your account session."
        }
        description={
          kind === "privacy"
            ? "Manage visibility, contact boundaries, and notifications."
            : "Manage your account preferences, authentication, and session security."
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
                Campus discovery is visible to verified campus members. Adjust
                your visibility below.
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
                  <strong>Show my profile in campus discovery</strong>
                  <small className="block text-muted">
                    Allow other students to find you in discovery and send invitations.
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
                  <strong>Receive activity notifications</strong>
                  <small className="block text-muted">
                    Receive team invitations, join requests, and application updates.
                  </small>
                </span>
              </label>
              <h3>Blocked profiles</h3>
              {(demo.blockedIds || []).length ? (
                (demo.blockedIds || []).map((id) => (
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
                <p>You haven’t blocked any members.</p>
              )}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-accent text-on-accent hover:bg-accent/90 transition-colors cursor-pointer"
              >
                Save preferences <Icon name="check" size={17} />
              </button>
              {saved && (
                <p className="flex items-center gap-2 text-xs text-muted my-2" role="status">
                  Preferences saved successfully.
                </p>
              )}
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <h2>Account security and session controls.</h2>
              <p>
                Manage your active credentials, security settings, and session status.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-border text-sm">
                <span>Signed in as</span>
                <strong>{demo.profile.name} · Campus Member</strong>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-border text-sm">
                <span>Storage</span>
                <strong>Active encrypted session</strong>
              </div>
              <a
                href="#/reset-password"
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
              >
                Reset password <Icon name="arrowUp" size={17} />
              </a>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2.5 min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-bold bg-transparent text-primary border border-input-border hover:bg-soft transition-colors cursor-pointer"
                onClick={demo.signOut}
              >
                Sign out <Icon name="logout" size={17} />
              </button>
              {demo.deletionRequested ? (
                <p className="flex items-center gap-2 text-xs text-muted my-2" role="status">
                  Account deletion request recorded.
                </p>
              ) : (
                <button
                  type="button"
                  className="border-0 bg-transparent py-1.5 px-0 text-danger text-sm underline underline-offset-4 cursor-pointer hover:opacity-80 transition-opacity font-medium text-left"
                  onClick={() => setConfirmDeletion(true)}
                >
                  Request account deletion
                </button>
              )}
              <p className="text-xs text-muted mt-1 block">
                Account deletion requests are processed in accordance with campus data retention policies.
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
              Your settings directly protect your visibility, credentials, and notification preferences.
            </p>
            <a
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink border-b border-border pb-1 hover:border-primary hover:text-primary transition-colors"
              href="#/privacy"
            >
              Read privacy policy <Icon name="arrowUp" size={16} />
            </a>
          </div>
        </aside>
      </div>
      {confirmDeletion && (
        <Dialog
          title="Confirm account deletion request?"
          onClose={() => setConfirmDeletion(false)}
        >
          <p>
            Submitting this request will schedule your account and profile for removal in accordance with campus retention guidelines.
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
  const notices = (demo.notices || []).filter((notice) => !unreadOnly || !notice.read);
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
          description="The next invitation or team update will appear here."
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
          Activity notifications are paused. You can enable them in{" "}
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
        "Collabryd is a campus-first teammate-finding platform. A place for students to connect complementary skills, form project teams, and build great ideas together.",
      sections: [
        [
          "A clear purpose.",
          "The goal is simple: make it easy to find teammates beyond your immediate circle. Verified profiles, open roles, join requests, and direct invitations bring team formation into one seamless workflow.",
        ],
        [
          "Campus-first community.",
          "Every member is verified through their official campus email. Students can showcase skills, self-organize teams, and discover hackathons with confidence.",
        ],
        [
          "Built for students, by students.",
          "From first hackathon sprints to senior capstones, Collabryd provides the tools to assemble balanced, motivated teams.",
        ],
      ],
    },
    privacy: {
      title: "Clear boundaries. Campus trust.",
      intro:
        "Your privacy and data security are central to Collabryd. Here is how your information is handled.",
      sections: [
        [
          "Verified campus access.",
          "Only registered and verified campus members can explore the directory. You maintain full control over whether your profile is visible in discovery.",
        ],
        [
          "Data protection.",
          "Your account credentials, authentication tokens, and personal details are encrypted. We do not sell student data or share private communications.",
        ],
        [
          "Account controls.",
          "You can update your visibility preferences, pause notifications, block members, or request account deletion at any time in your settings.",
        ],
      ],
    },
    terms: {
      title: "Community guidelines & terms.",
      intro:
        "Collabryd is dedicated to fostering an inclusive, collaborative, and productive campus environment.",
      sections: [
        [
          "Respectful collaboration.",
          "Treat all students, mentors, and teammates with respect. Harassment, unauthorized access, or misrepresentation will result in account suspension.",
        ],
        [
          "Team ownership.",
          "Projects created on Collabryd belong to their respective teams and authors. Organizers and members establish their own intellectual property agreements.",
        ],
        [
          "Hackathons and events.",
          "Event listings provide information and team coordination. Participants must comply with official event rules and organizer guidelines.",
        ],
      ],
    },
    contact: {
      title: "Get in touch.",
      intro:
        "Have questions, feedback, or need help with your campus team?",
      sections: [
        [
          "Campus support.",
          "Reach out to your campus ambassadors or email the project team directly with inquiries, bug reports, or partnership proposals.",
        ],
        [
          "Community feedback.",
          "Collabryd is actively evolving based on student feedback. We welcome your ideas to make campus collaboration even better.",
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
