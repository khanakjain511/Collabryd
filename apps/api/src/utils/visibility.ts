import { and, eq, or, sql, type SQL } from "drizzle-orm";
import { projects, userProfiles } from "@collabryd/database";
import type { AuthenticatedUser } from "../types/index.js";

/** Case-insensitive comparison of two institution names for CAMPUS_ONLY visibility. */
export function isSameInstitution(
  a?: string | null,
  b?: string | null
): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Builds the SQL visibility filter for student directory discovery.
 * - Admins see all profiles.
 * - Authenticated campus users see PUBLIC + same-institution CAMPUS_ONLY profiles.
 * - Unauthenticated visitors see PUBLIC profiles only.
 */
export function buildProfileVisibilityCondition(
  viewer?: AuthenticatedUser
): SQL | undefined {
  if (viewer?.systemRole === "ADMIN") return undefined;

  if (viewer?.institution) {
    const normalizedInstitution = viewer.institution.trim().toLowerCase();
    return or(
      eq(userProfiles.profileVisibility, "PUBLIC"),
      and(
        eq(userProfiles.profileVisibility, "CAMPUS_ONLY"),
        sql`LOWER(${userProfiles.institution}) = ${normalizedInstitution}`
      )
    );
  }

  return eq(userProfiles.profileVisibility, "PUBLIC");
}

/**
 * Builds the SQL visibility filter for project discovery.
 * - Admins see all projects.
 * - Authenticated users see PUBLIC + same-campus CAMPUS_ONLY + projects they belong to.
 * - Unauthenticated visitors see PUBLIC projects only.
 */
export function buildProjectVisibilityCondition(
  viewer?: AuthenticatedUser
): SQL | undefined {
  if (viewer?.systemRole === "ADMIN") return undefined;

  if (viewer?.institution) {
    const normalizedInstitution = viewer.institution.trim().toLowerCase();
    return or(
      eq(projects.visibility, "PUBLIC"),
      and(
        eq(projects.visibility, "CAMPUS_ONLY"),
        sql`LOWER(${userProfiles.institution}) = ${normalizedInstitution}`
      ),
      sql`EXISTS (
        SELECT 1 FROM collabryd.project_members pm
        WHERE pm.project_id = ${projects.projectId}
          AND pm.user_id = ${viewer.userId}
      )`
    );
  }

  return eq(projects.visibility, "PUBLIC");
}
