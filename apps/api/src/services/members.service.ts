import { and, asc, eq, sql } from "drizzle-orm";
import {
  conversationMembers,
  conversations,
  db,
  projectMembers,
  projects,
  userProfiles,
  type ProjectMemberRole,
} from "../models/index.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../errors/app-error.js";
import type { AuthenticatedUser } from "../types/index.js";
import { dispatchNotifications } from "./notifications.dispatcher.js";
import { requireVisibleProject } from "./projects.service.js";

export async function listProjectMembers(
  projectId: number,
  viewer?: AuthenticatedUser
) {
  await requireVisibleProject(projectId, viewer);

  // Implements R13
  return db
    .select({
      projectId: projectMembers.projectId,
      userId: projectMembers.userId,
      displayName: userProfiles.displayName,
      avatarUrl: userProfiles.avatarUrl,
      courseProgram: userProfiles.courseProgram,
      academicYear: userProfiles.academicYear,
      role: projectMembers.role,
      joinedAt: projectMembers.joinedAt,
    })
    .from(projectMembers)
    .innerJoin(userProfiles, eq(projectMembers.userId, userProfiles.userId))
    .where(eq(projectMembers.projectId, projectId))
    .orderBy(
      sql`CASE ${projectMembers.role} WHEN 'OWNER' THEN 1 WHEN 'ADMIN' THEN 2 ELSE 3 END`,
      asc(projectMembers.joinedAt)
    );
}

export async function updateMemberRole(
  projectId: number,
  targetUserId: number,
  newRole: ProjectMemberRole,
  actor: AuthenticatedUser
) {
  return db.transaction(async (tx) => {
    const [project] = await tx
      .select()
      .from(projects)
      .where(eq(projects.projectId, projectId))
      .for("update")
      .limit(1);

    if (!project) {
      throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
    }

    if (project.ownerId !== actor.userId && actor.systemRole !== "ADMIN") {
      throw new ForbiddenError(
        "Only the project owner can change member roles",
        "OWNER_REQUIRED"
      );
    }

    const [target] = await tx
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, targetUserId)
        )
      )
      .limit(1);

    if (!target) {
      throw new NotFoundError("Project member not found", "MEMBER_NOT_FOUND");
    }

    if (target.userId === project.ownerId && newRole !== "OWNER") {
      throw new BadRequestError(
        "Transfer ownership to another member before stepping down as OWNER",
        "CANNOT_DEMOTE_SOLE_OWNER"
      );
    }

    // Ownership transfer: atomically demote previous owner to ADMIN and update projects.owner_id
    if (newRole === "OWNER" && targetUserId !== project.ownerId) {
      await tx
        .update(projectMembers)
        .set({ role: "ADMIN" })
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, project.ownerId)
          )
        );

      await tx
        .update(projects)
        .set({ ownerId: targetUserId, updatedAt: new Date() })
        .where(eq(projects.projectId, projectId));
    }

    const [updated] = await tx
      .update(projectMembers)
      .set({ role: newRole })
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, targetUserId)
        )
      )
      .returning();

    return updated!;
  });
}

export async function removeProjectMember(
  projectId: number,
  targetUserId: number,
  actor: AuthenticatedUser
): Promise<void> {
  await db.transaction(async (tx) => {
    const [project] = await tx
      .select()
      .from(projects)
      .where(eq(projects.projectId, projectId))
      .for("update")
      .limit(1);

    if (!project) {
      throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
    }

    const [target] = await tx
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, targetUserId)
        )
      )
      .limit(1);

    if (!target) {
      throw new NotFoundError("Project member not found", "MEMBER_NOT_FOUND");
    }

    if (target.role === "OWNER") {
      throw new BadRequestError(
        "Project owner cannot be removed. Transfer ownership or delete the project.",
        "CANNOT_REMOVE_OWNER"
      );
    }

    const isSelf = actor.userId === targetUserId;
    if (!isSelf && actor.systemRole !== "ADMIN") {
      const [actorMembership] = await tx
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, actor.userId)
          )
        )
        .limit(1);

      if (!actorMembership) {
        throw new ForbiddenError("You are not a member of this project");
      }
      if (actorMembership.role === "MEMBER") {
        throw new ForbiddenError("Members can only remove themselves");
      }
      if (actorMembership.role === "ADMIN" && target.role === "ADMIN") {
        throw new ForbiddenError("Only the project owner can remove admins");
      }
    }

    await tx
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, targetUserId)
        )
      );

    // Also remove from project group conversation
    const [groupConv] = await tx
      .select({ conversationId: conversations.conversationId })
      .from(conversations)
      .where(eq(conversations.projectId, projectId))
      .limit(1);

    if (groupConv) {
      await tx
        .delete(conversationMembers)
        .where(
          and(
            eq(conversationMembers.conversationId, groupConv.conversationId),
            eq(conversationMembers.userId, targetUserId)
          )
        );
    }

    if (!isSelf) {
      await dispatchNotifications(
        [
          {
            recipientId: targetUserId,
            type: "TEAM_MEMBER_REMOVED",
            resourceType: "PROJECT",
            resourceId: projectId,
            message: `You were removed from project "${project.title}".`,
          },
        ],
        tx
      );
    }
  });
}
