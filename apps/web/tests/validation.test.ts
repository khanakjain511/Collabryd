import test from "node:test";
import assert from "node:assert/strict";
import {
  isHttpUrl,
  joinRequestError,
  paginate,
  teamCapacityError,
} from "../src/lib/validation.ts";
import type { JoinRequest, Team } from "../src/types.ts";

const team: Team = {
  id: "test-team",
  name: "Test team",
  description: "Fictional test fixture",
  domain: "Education",
  roles: ["Designer"],
  skills: ["Figma"],
  members: ["leader", "member"],
  capacity: 3,
  leaderId: "leader",
  eventId: "",
  status: "Recruiting",
};

test("a full or closed team cannot receive a new join request", () => {
  assert.notEqual(
    joinRequestError({ ...team, capacity: 2 }, "candidate", []),
    "",
  );
  assert.notEqual(
    joinRequestError({ ...team, status: "Closed" }, "candidate", []),
    "",
  );
  assert.notEqual(
    joinRequestError({ ...team, status: "Archived" }, "candidate", []),
    "",
  );
  assert.equal(joinRequestError(team, "candidate", []), "");
});

test("membership and pending applications prevent duplicate requests", () => {
  const pending: JoinRequest = {
    id: "request",
    teamId: team.id,
    personId: "candidate",
    message: "Test",
    status: "Pending",
  };
  assert.notEqual(joinRequestError(team, "member", []), "");
  assert.notEqual(joinRequestError(team, "candidate", [pending]), "");
  assert.equal(
    joinRequestError(team, "candidate", [{ ...pending, status: "Cancelled" }]),
    "",
  );
  assert.equal(joinRequestError(team, "different-person", [pending]), "");
  assert.equal(
    joinRequestError(team, "candidate", [
      { ...pending, teamId: "another-team" },
    ]),
    "",
  );
});

test("capacity edits cannot discard current members or accept invalid sizes", () => {
  assert.notEqual(teamCapacityError(2, 3), "");
  for (const capacity of [0, -1, 1, 7, 2.5, NaN, Infinity])
    assert.notEqual(teamCapacityError(capacity, 1), "");
  assert.equal(teamCapacityError(3, 3), "");
  assert.equal(teamCapacityError(6, 3), "");
});

test("optional profile links accept only complete HTTP or HTTPS URLs", () => {
  assert.equal(isHttpUrl(""), true);
  assert.equal(isHttpUrl("https://example.test/profile"), true);
  assert.equal(isHttpUrl("http://example.test/profile"), true);
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "mailto:test@example.test",
    "/relative",
    "not a URL",
  ])
    assert.equal(isHttpUrl(url), false);
});

test("pagination keeps all records across pages without duplicates", () => {
  const records = Array.from({ length: 13 }, (_, index) => `record-${index}`);
  const pages = [1, 2, 3].flatMap((page) => paginate(records, page).items);
  assert.deepEqual(pages, records);
  assert.equal(new Set(pages).size, records.length);
  assert.equal(paginate(records, 3).items.length, 1);
});

test("empty results and malformed URL pages remain usable", () => {
  assert.deepEqual(paginate([], 5), { items: [], page: 1, totalPages: 1 });
  assert.equal(paginate([1, 2, 3], -10, 2).page, 1);
  assert.equal(paginate([1, 2, 3], 100, 2).page, 2);
  assert.equal(paginate([1, 2, 3], NaN, 2).page, 1);
  assert.equal(paginate([1, 2, 3], Infinity, 2).page, 1);
});
