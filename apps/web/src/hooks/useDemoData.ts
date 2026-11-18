import { useState } from "react";
import {
  demoInvitations,
  demoNotices,
  demoProfile,
  demoRequests,
  demoTeams,
} from "../data/demo";
import type { Notice, Person, Report, Team } from "../types";

export function useDemoData() {
  const [signedIn, setSignedIn] = useState(false);
  const [verified, setVerified] = useState(false);
  const [profile, setProfile] = useState(demoProfile);
  const [teams, setTeams] = useState(demoTeams);
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
  }

  function applyToTeam(teamId: string, message: string) {
    const team = teams.find((item) => item.id === teamId);
    if (
      !team ||
      team.status !== "Recruiting" ||
      team.members.length >= team.capacity
    )
      return "This team is no longer recruiting.";
    if (team.members.includes("you"))
      return "You are already a member of this team.";
    if (
      requests.some(
        (item) =>
          item.teamId === teamId &&
          item.personId === "you" &&
          item.status === "Pending",
      )
    )
      return "You already have a pending request.";
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

  return {
    signedIn,
    setSignedIn,
    verified,
    setVerified,
    profile,
    setProfile,
    teams,
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
  };
}

export type DemoData = ReturnType<typeof useDemoData>;
