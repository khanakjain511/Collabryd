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
  const member = team.members.includes("you");
  if (!member) return null;
  const others = team.members.filter((id) => id !== "you");
  const outgoing = demo.invitations.filter(
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
    <section className="panel">
      <div className="panel-heading">
        <h2>{leader ? "Manage your team" : "Your membership"}</h2>
        <Badge>{leader ? "Team leader" : "Member"}</Badge>
      </div>
      <div className="inline-actions">
        {leader && (
          <>
            <a
              className="button button-secondary button-small"
              href={`#/teams/${team.id}/edit`}
            >
              Edit team <Icon name="arrowUp" size={15} />
            </a>
            <button
              type="button"
              className="button button-secondary button-small"
              disabled={!others.length}
              onClick={() => open("remove")}
            >
              Remove member
            </button>
            <button
              type="button"
              className="button button-secondary button-small"
              disabled={!others.length || team.status === "Archived"}
              onClick={() => open("transfer")}
            >
              Transfer leadership
            </button>
          </>
        )}
        <button
          type="button"
          className="text-button danger-text"
          onClick={() => open("leave")}
        >
          Leave example team
        </button>
      </div>
      {leader && (
        <p className="field-hint">
          Transfer leadership to another current member, or archive the team,
          before leaving. All actions affect demo data only.
        </p>
      )}
      {leader && outgoing.length > 0 && (
        <div className="outgoing-invites">
          <h3>Invitations you’ve sent</h3>
          {outgoing.map((invitation) => (
            <div className="member-row" key={invitation.id}>
              <div>
                <strong>
                  {demo.people.find(
                    (person) => person.id === invitation.personId,
                  )?.name || "Example person"}
                </strong>
                <span>
                  {invitation.expiresAt
                    ? `Expires ${new Date(invitation.expiresAt).toLocaleDateString("en-IN")}`
                    : "Example invitation"}
                </span>
              </div>
              <Badge>{invitation.status}</Badge>
              {invitation.status === "Pending" && (
                <button
                  className="text-button"
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
                : "Leave this example team?"
          }
          onClose={() => setAction(null)}
        >
          <form className="stack-form" onSubmit={submit}>
            <p>
              {action === "transfer"
                ? "The selected member becomes the leader. You remain a member, but can no longer use leader controls."
                : action === "remove"
                  ? "The member will be removed from this demo team. This opens a place in the membership count."
                  : "Your membership will be removed. A leader must transfer responsibility or archive the team first."}
            </p>
            {action !== "leave" && (
              <label>
                Current member
                <select name="person" required>
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
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setAction(null)}
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary">
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
