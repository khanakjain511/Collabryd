import type { Team } from "../types";

export function sortField(value: string) {
  return value.replace(/-reverse$/, "");
}

export function sortDirection(value: string) {
  return value.endsWith("-reverse") ? -1 : 1;
}

export function openSeats(team: Team) {
  return team.status === "Recruiting"
    ? Math.max(0, team.capacity - team.members.length)
    : 0;
}
