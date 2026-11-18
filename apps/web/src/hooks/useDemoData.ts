import { useState } from "react";
import {
  demoInvitations,
  demoNotices,
  demoProfile,
  demoRequests,
  demoTeams,
  demoPeople,
  demoPendingStudent,
  demoEvents,
} from "../data/demo";
import type { Hackathon, Notice, Person, Report, Team } from "../types";
import {
  isHttpUrl,
  joinRequestError,
  teamCapacityError,
} from "../lib/validation";

export function useDemoData() {
  const [signedIn, setSignedIn] = useState(false);
  const [verified, setVerified] = useState(false);
  const [profile, setProfile] = useState(demoProfile);
  const [teams, setTeams] = useState(demoTeams);
  const [people, setPeople] = useState([...demoPeople, demoPendingStudent]);
  const [events, setEvents] = useState(demoEvents);
  const [requests, setRequests] = useState(demoRequests);
  const [invitations, setInvitations] = useState(demoInvitations);
  const [notices, setNotices] = useState(demoNotices);
  const [reports, setReports] = useState<Report[]>([]);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);
  const [feedback, setFeedback] = useState("");

  // Demo data lives here, so it survives page navigation and resets on refresh.
  function notify(message: string, href = "#/notifications") {
    setFeedback(message);
    const notice: Notice = {
      id: crypto.randomUUID(),
      title: message,
      description: "Saved in this demo session only.",
      href,
      read: false,
    };
    setNotices((current) => [notice, ...current]);
  }

  function openDemo() {
    setSignedIn(true);
    setVerified(true);
    window.location.hash = "/dashboard";
  }

  function signOut() {
    setSignedIn(false);
    setVerified(false);
    setFeedback("");
    window.location.hash = "/";
  }

  function saveProfile(next: Person) {
    setProfile(next);
    notify("Your demo profile has been updated.", "#/settings/profile");
  }

  function createTeam(
    values: Omit<Team, "id" | "members" | "leaderId" | "status">,
  ) {
    const capacityError = teamCapacityError(values.capacity, 1);
    if (capacityError) return capacityError;
    const team: Team = {
      ...values,
      id: crypto.randomUUID(),
      members: ["you"],
      leaderId: "you",
      status: "Recruiting",
    };
    setTeams((current) => [team, ...current]);
    notify("Your example team is ready.", `#/teams/${team.id}`);
    window.location.hash = `/teams/${team.id}`;
    return "";
  }

  function applyToTeam(teamId: string, message: string) {
    const team = teams.find((item) => item.id === teamId);
    if (!team) return "This team is no longer available.";
    const error = joinRequestError(team, "you", requests);
    if (error) return error;
    setRequests((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        teamId,
        personId: "you",
        message,
        status: "Pending",
      },
    ]);
    notify("Your demo join request is pending.", "#/my-teams");
    return "";
  }

  function reviewRequest(id: string, accept: boolean) {
    const request = requests.find((item) => item.id === id);
    const team = teams.find((item) => item.id === request?.teamId);
    if (
      !request ||
      request.status !== "Pending" ||
      !team ||
      team.leaderId !== "you"
    )
      return;
    if (
      accept &&
      (team.members.length >= team.capacity || team.status !== "Recruiting")
    ) {
      setFeedback(
        "This team is full or no longer recruiting. The request is still pending.",
      );
      return;
    }
    setRequests((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: accept ? "Accepted" : "Declined" }
          : item,
      ),
    );
    if (accept)
      setTeams((current) =>
        current.map((item) =>
          item.id === team.id
            ? {
                ...item,
                members: [...new Set([...item.members, request.personId])],
              }
            : item,
        ),
      );
    notify(
      accept
        ? "Your demo team has a new member."
        : "The demo request was declined.",
      `#/teams/${team.id}`,
    );
  }

  function cancelRequest(id: string) {
    setRequests((current) =>
      current.map((item) =>
        item.id === id && item.personId === "you" && item.status === "Pending"
          ? { ...item, status: "Cancelled" }
          : item,
      ),
    );
    notify("Your demo request was cancelled.", "#/my-teams");
  }

  function respondToInvite(id: string, accept: boolean) {
    const invitation = invitations.find((item) => item.id === id);
    const team = teams.find((item) => item.id === invitation?.teamId);
    if (!invitation || invitation.status !== "Pending" || !team) return;
    if ((invitation.personId || "you") !== "you") return;
    if (
      invitation.expiresAt &&
      new Date(invitation.expiresAt).getTime() <= Date.now()
    ) {
      setInvitations((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "Expired" } : item,
        ),
      );
      setFeedback(
        "This demo invitation has expired. Ask the team leader for a new one.",
      );
      return;
    }
    if (
      accept &&
      (team.members.length >= team.capacity || team.status !== "Recruiting")
    ) {
      setFeedback(
        "This team has no open places now. The invitation could not be accepted.",
      );
      return;
    }
    setInvitations((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: accept ? "Accepted" : "Declined" }
          : item,
      ),
    );
    if (accept)
      setTeams((current) =>
        current.map((item) =>
          item.id === team.id
            ? { ...item, members: [...new Set([...item.members, "you"])] }
            : item,
        ),
      );
    notify(
      accept
        ? "You joined an example team."
        : "The demo invitation was declined.",
      "#/my-teams",
    );
  }

  function invitePerson(personId: string, teamId: string) {
    const team = teams.find((item) => item.id === teamId);
    if (
      !team ||
      team.leaderId !== "you" ||
      team.status !== "Recruiting" ||
      team.members.length >= team.capacity ||
      team.members.includes(personId)
    )
      return "Choose an owned recruiting team with an open place.";
    const person = people.find((item) => item.id === personId);
    if (
      !person ||
      blockedIds.includes(personId) ||
      (person.status && person.status !== "Active")
    )
      return "This profile cannot receive an invitation.";
    if (
      invitations.some(
        (item) =>
          item.teamId === teamId &&
          item.personId === personId &&
          item.status === "Pending",
      )
    )
      return "This person already has a pending invitation to that team.";
    setInvitations((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        teamId,
        personId,
        status: "Pending",
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
    ]);
    notify(
      "Demo invitation prepared. No message was sent to a real person.",
      `#/teams/${teamId}`,
    );
    return "";
  }

  function changeTeamStatus(id: string, status: Team["status"]) {
    setTeams((current) =>
      current.map((team) =>
        team.id === id && team.leaderId === "you" ? { ...team, status } : team,
      ),
    );
    notify(`Demo recruitment is now ${status.toLowerCase()}.`, `#/teams/${id}`);
  }

  function submitReport(target: string, reason: string) {
    setReports((current) => [
      ...current,
      { id: crypto.randomUUID(), target, reason, status: "Open" },
    ]);
    setFeedback(
      "Report saved to the demo review queue. It was not sent to a real moderator.",
    );
  }

  function updateTeam(id: string, values: Partial<Team>) {
    const team = teams.find((item) => item.id === id);
    if (!team || team.leaderId !== "you")
      return "Only the example team leader can edit this team.";
    const error = teamCapacityError(
      values.capacity ?? team.capacity,
      team.members.length,
    );
    if (error) return error;
    setTeams((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...values,
              id: item.id,
              leaderId: item.leaderId,
              members: item.members,
            }
          : item,
      ),
    );
    notify("Your example team has been updated.", `#/teams/${id}`);
    return "";
  }

  function removeMember(teamId: string, personId: string) {
    const team = teams.find((item) => item.id === teamId);
    if (!team || team.leaderId !== "you" || personId === team.leaderId)
      return "Transfer leadership before removing the leader.";
    setTeams((current) =>
      current.map((item) =>
        item.id === teamId
          ? { ...item, members: item.members.filter((id) => id !== personId) }
          : item,
      ),
    );
    notify(
      "The member was removed from this example team.",
      `#/teams/${teamId}`,
    );
    return "";
  }

  function transferLeadership(teamId: string, personId: string) {
    const team = teams.find((item) => item.id === teamId);
    if (
      !team ||
      team.leaderId !== "you" ||
      personId === "you" ||
      !team.members.includes(personId)
    )
      return "Choose another current member to lead the team.";
    setTeams((current) =>
      current.map((item) =>
        item.id === teamId ? { ...item, leaderId: personId } : item,
      ),
    );
    notify(
      "Demo leadership transferred. You remain a member.",
      `#/teams/${teamId}`,
    );
    return "";
  }

  function leaveTeam(teamId: string) {
    const team = teams.find((item) => item.id === teamId);
    if (!team) return "This team is unavailable.";
    if (team.leaderId === "you" && team.status !== "Archived")
      return "Transfer leadership or archive the team before leaving.";
    setTeams((current) =>
      current.map((item) =>
        item.id === teamId
          ? {
              ...item,
              members: item.members.filter((id) => id !== "you"),
              leaderId: item.leaderId === "you" ? "" : item.leaderId,
            }
          : item,
      ),
    );
    notify("You left the example team.", "#/my-teams");
    return "";
  }

  function revokeInvitation(id: string) {
    const invitation = invitations.find((item) => item.id === id);
    const team = teams.find((item) => item.id === invitation?.teamId);
    if (!team || team.leaderId !== "you" || invitation?.status !== "Pending")
      return;
    setInvitations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "Revoked" } : item,
      ),
    );
    notify("The demo invitation was revoked.", `#/teams/${team.id}`);
  }

  function reviewStudent(id: string, status: NonNullable<Person["status"]>) {
    setPeople((current) =>
      current.map((person) =>
        person.id === id ? { ...person, status } : person,
      ),
    );
    notify(
      `Example student status changed to ${status.toLowerCase()}.`,
      "#/admin/users",
    );
  }

  function moderateTeam(id: string, status: Team["status"]) {
    setTeams((current) =>
      current.map((team) => (team.id === id ? { ...team, status } : team)),
    );
    notify(
      `Example team status changed to ${status.toLowerCase()}.`,
      "#/admin/teams",
    );
  }

  function saveEvent(values: Hackathon) {
    if (
      !isHttpUrl(values.officialUrl || "") ||
      !isHttpUrl(values.sourceUrl || "")
    )
      return "Use a full http:// or https:// link.";
    if (
      !values.name.trim() ||
      !values.organizer?.trim() ||
      !values.eligibility?.trim()
    )
      return "Add the event name, organizer and eligibility.";
    if (
      !Number.isFinite(new Date(values.date).getTime()) ||
      !Number.isFinite(new Date(values.deadline).getTime())
    )
      return "Add valid event and deadline dates.";
    if (new Date(values.deadline).getTime() > new Date(values.date).getTime())
      return "The registration deadline must be on or before the start.";
    const event = { ...values, updatedAt: new Date().toISOString() };
    setEvents((current) =>
      current.some((item) => item.id === event.id)
        ? current.map((item) => (item.id === event.id ? event : item))
        : [...current, event],
    );
    notify(
      "Example event saved. Draft and archived events are hidden from the public catalog.",
      "#/admin/hackathons",
    );
    return "";
  }

  function setEventPublication(
    id: string,
    publication: NonNullable<Hackathon["publication"]>,
  ) {
    setEvents((current) =>
      current.map((event) =>
        event.id === id
          ? { ...event, publication, updatedAt: new Date().toISOString() }
          : event,
      ),
    );
    notify(
      `Example event is now ${publication.toLowerCase()}.`,
      "#/admin/hackathons",
    );
  }

  return {
    signedIn,
    setSignedIn,
    verified,
    setVerified,
    profile,
    setProfile,
    teams,
    people,
    events,
    requests,
    invitations,
    notices,
    setNotices,
    reports,
    setReports,
    blockedIds,
    setBlockedIds,
    visible,
    setVisible,
    feedback,
    setFeedback,
    openDemo,
    signOut,
    saveProfile,
    createTeam,
    applyToTeam,
    reviewRequest,
    cancelRequest,
    respondToInvite,
    invitePerson,
    changeTeamStatus,
    submitReport,
    updateTeam,
    removeMember,
    transferLeadership,
    leaveTeam,
    revokeInvitation,
    reviewStudent,
    moderateTeam,
    saveEvent,
    setEventPublication,
  };
}

export type DemoData = ReturnType<typeof useDemoData>;
