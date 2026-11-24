import { useState } from "react";
import type { FormEvent } from "react";
import type { Team } from "../types";
import type { DemoData } from "../hooks/useDemoData";
import { Badge, Dialog, Icon } from "./ui";

export function TeamManagement({ team, demo }: { team: Team; demo: DemoData }) {
  const [action, setAction] = useState<"remove" | "transfer" | "leave" | null>(
    null,
  );
  const [error, setError] = useState("");
  const leader = team.leaderId === "you";
  const members = team?.members || [];
  const member = members.includes("you");
  if (!member) return null;
  const others = members.filter((id) => id !== "you");
  const outgoing = (demo?.invitations || []).filter(
    (invitation) =>
      invitation.teamId === team.id &&
      invitation.personId &&
      invitation.personId !== "you",
  );
  function open(next: "remove" | "transfer" | "leave") {
    setError("");
    setAction(next);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const personId = String(new FormData(event.currentTarget).get("person"));
    const result =
      action === "transfer"
        ? demo.transferLeadership(team.id, personId)
        : action === "remove"
          ? demo.removeMember(team.id, personId)
          : demo.leaveTeam(team.id);
    if (result) setError(result);
    else {
      setAction(null);
      if (action === "leave") window.location.hash = "/my-teams";
    }
  }
  return (
    <section className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {leader ? "Manage your team" : "Your membership"}
        </h2>
        <Badge>{leader ? "Team leader" : "Member"}</Badge>
      </div>
      <div className="flex flex-wrap gap-2 items-center my-4">
        {leader && (
          <>
            <a
              className="text-xs py-1.5 px-3 rounded-lg border border-border bg-surface text-ink inline-flex items-center gap-1.5 hover:bg-soft cursor-pointer transition-colors"
              href={`#/teams/${team.id}/edit`}
            >
              Edit team <Icon name="arrowUp" size={15} />
            </a>
            <button
              type="button"
              className="text-xs py-1.5 px-3 rounded-lg border border-border bg-surface text-ink inline-flex items-center gap-1.5 hover:bg-soft cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!others.length}
              onClick={() => open("remove")}
            >
              Remove member
            </button>
            <button
              type="button"
              className="text-xs py-1.5 px-3 rounded-lg border border-border bg-surface text-ink inline-flex items-center gap-1.5 hover:bg-soft cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!others.length || team.status === "Archived"}
              onClick={() => open("transfer")}
            >
              Transfer leadership
            </button>
          </>
        )}
        <button
          type="button"
          className="text-danger hover:underline text-xs cursor-pointer font-medium"
          onClick={() => open("leave")}
        >
          Leave team
        </button>
      </div>
      {leader && (
        <p className="text-xs text-muted mt-2">
          Transfer leadership to another current member, or archive the team,
          before leaving.
        </p>
      )}
      {leader && outgoing.length > 0 && (
        <div className="outgoing-invites mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold mb-3">Invitations you’ve sent</h3>
          {outgoing.map((invitation) => (
            <div
              className="flex items-center justify-between gap-3 py-3 border-b border-border last:border-0"
              key={invitation.id}
            >
              <div className="flex flex-col gap-0.5">
                <strong className="text-sm font-medium">
                  {demo.people.find(
                    (person) => person.id === invitation.personId,
                  )?.name || "Member"}
                </strong>
                <span className="text-xs text-muted">
                  {invitation.expiresAt
                    ? `Expires ${new Date(invitation.expiresAt).toLocaleDateString("en-IN")}`
                    : "Team invitation"}
                </span>
              </div>
              <Badge>{invitation.status}</Badge>
              {invitation.status === "Pending" && (
                <button
                  className="text-button text-xs text-primary hover:underline"
                  type="button"
                  onClick={() => demo.revokeInvitation(invitation.id)}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {action && (
        <Dialog
          title={
            action === "transfer"
              ? "Pass the next chapter on."
              : action === "remove"
                ? "Remove a team member?"
                : "Leave this team?"
          }
          onClose={() => setAction(null)}
        >
          <form className="flex flex-col gap-4" onSubmit={submit}>
            <p className="text-sm text-muted">
              {action === "transfer"
                ? "The selected member becomes the leader. You remain a member, but can no longer use leader controls."
                : action === "remove"
                  ? "The member will be removed from this team. This opens a place in the membership count."
                  : "Your membership will be removed. A leader must transfer responsibility or archive the team first."}
            </p>
            {action !== "leave" && (
              <label className="text-xs font-semibold text-ink flex flex-col gap-1.5">
                Current member
                <select name="person" required className="mt-1">
                  {others.map((id) => (
                    <option key={id} value={id}>
                      {demo.people.find((person) => person.id === id)?.name ||
                        id}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {error && (
              <p className="text-xs text-danger font-medium mt-1" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-3 items-center mt-4">
              <button
                type="button"
                className="flex-1 py-2 px-4 rounded-lg border border-border bg-surface text-ink hover:bg-soft transition-colors cursor-pointer text-sm font-medium"
                onClick={() => setAction(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer text-sm font-bold shadow-sm"
              >
                {action === "transfer"
                  ? "Confirm transfer"
                  : action === "remove"
                    ? "Remove member"
                    : "Leave team"}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </section>
  );
}
