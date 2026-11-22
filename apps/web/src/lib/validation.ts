import type { JoinRequest, Team } from "../types";

export function isHttpUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function teamCapacityError(capacity: number, memberCount: number) {
  if (!Number.isInteger(capacity) || capacity < 2 || capacity > 6)
    return "Choose a demo capacity from 2 to 6.";
  if (capacity < memberCount)
    return "Capacity cannot be smaller than the current membership.";
  return "";
}

export function joinRequestError(
  team: Team,
  personId: string,
  requests: JoinRequest[],
) {
  if (team.status !== "Recruiting" || team.members.length >= team.capacity)
    return "This team is no longer recruiting.";
  if (team.members.includes(personId))
    return "You are already a member of this team.";
  if (
    requests.some(
      (request) =>
        request.teamId === team.id &&
        request.personId === personId &&
        request.status === "Pending",
    )
  )
    return "You already have a pending request.";
  return "";
}

export function paginate<T>(items: T[], requestedPage: number, pageSize = 6) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Number.isFinite(requestedPage)
    ? Math.trunc(requestedPage)
    : 1;
  const page = Math.max(1, Math.min(totalPages, safePage));
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    totalPages,
  };
}
