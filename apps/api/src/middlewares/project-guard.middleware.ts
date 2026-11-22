import type { NextFunction, Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db, projectMembers } from "@collabryd/database";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../errors/app-error.js";

/**
 * Helper to fetch a user's membership role in a project.
 */
async function fetchMemberRole(projectId: number, userId: number) {
  const [member] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    )
    .limit(1);

  return member?.role ?? null;
}

/**
 * Middleware that guarantees the authenticated user is a Project Manager (OWNER or ADMIN),
 * or a system-level ADMIN.
 * Expects `projectId` in `req.params`.
 */
export async function requireProjectManager(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
  }

  const projectId = Number(req.params.projectId);
  if (!projectId || Number.isNaN(projectId)) {
    throw new NotFoundError("Invalid project ID parameter", "PROJECT_NOT_FOUND");
  }

  if (req.user.systemRole === "ADMIN") {
    req.projectRole = "ADMIN";
    return next();
  }

  const role = await fetchMemberRole(projectId, req.user.userId);
  if (!role || (role !== "OWNER" && role !== "ADMIN")) {
    throw new ForbiddenError(
      "Only project owners or admins can perform this action",
      "PROJECT_MANAGER_REQUIRED"
    );
  }

  req.projectRole = role;
  next();
}

/**
 * Middleware that guarantees the authenticated user is the sole Project OWNER,
 * or a system-level ADMIN.
 * Used for critical operations like ownership transfer or project deletion.
 */
export async function requireProjectOwner(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
  }

  const projectId = Number(req.params.projectId);
  if (!projectId || Number.isNaN(projectId)) {
    throw new NotFoundError("Invalid project ID parameter", "PROJECT_NOT_FOUND");
  }

  if (req.user.systemRole === "ADMIN") {
    req.projectRole = "OWNER";
    return next();
  }

  const role = await fetchMemberRole(projectId, req.user.userId);
  if (role !== "OWNER") {
    throw new ForbiddenError(
      "Only the project owner can perform this action",
      "PROJECT_OWNER_REQUIRED"
    );
  }

  req.projectRole = role;
  next();
}

/**
 * Middleware that guarantees the authenticated user is an active member of the project.
 */
export async function requireProjectMember(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
  }

  const projectId = Number(req.params.projectId);
  if (!projectId || Number.isNaN(projectId)) {
    throw new NotFoundError("Invalid project ID parameter", "PROJECT_NOT_FOUND");
  }

  if (req.user.systemRole === "ADMIN") {
    return next();
  }

  const role = await fetchMemberRole(projectId, req.user.userId);
  if (!role) {
    throw new ForbiddenError(
      "You are not a member of this project",
      "PROJECT_MEMBER_REQUIRED"
    );
  }

  req.projectRole = role;
  next();
}
