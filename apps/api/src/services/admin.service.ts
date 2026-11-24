import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import {
  adminAuditLogs,
  db,
  projectMembers,
  projects,
  refreshSessions,
  userProfiles,
  users,
  type AccountStatus,
  type AdminAuditAction,
  type ProjectMemberRole,
  type ProjectStatus,
} from "../models/index.js";
import {
  BadRequestError,
  NotFoundError,
} from "../errors/app-error.js";
import { buildPaginationMeta } from "../utils/pagination.js";
import { dispatchNotifications } from "./notifications.dispatcher.js";

export async function getPlatformMetrics() {
  // Implements R24
  const [result] = await db.execute<{
    active_students: number;
    total_users: number;
    open_projects: number;
    total_projects: number;
    pending_applications: number;
    total_messages_sent: number;
  }>(sql`
    SELECT
      (SELECT COUNT(*)::int FROM collabryd.users WHERE account_status = 'ACTIVE') AS active_students,
      (SELECT COUNT(*)::int FROM collabryd.users) AS total_users,
      (SELECT COUNT(*)::int FROM collabryd.projects WHERE status = 'OPEN') AS open_projects,
      (SELECT COUNT(*)::int FROM collabryd.projects) AS total_projects,
      (SELECT COUNT(*)::int FROM collabryd.applications WHERE status = 'PENDING') AS pending_applications,
      (SELECT COUNT(*)::int FROM collabryd.messages) AS total_messages_sent
  `).then((r) => r.rows);

  return {
    activeStudents: Number(result?.active_students ?? 0),
    totalUsers: Number(result?.total_users ?? 0),
    openProjects: Number(result?.open_projects ?? 0),
    totalProjects: Number(result?.total_projects ?? 0),
    pendingApplications: Number(result?.pending_applications ?? 0),
    totalMessagesSent: Number(result?.total_messages_sent ?? 0),
  };
}

export async function listAuditLogs(query: {
  page: number;
  limit: number;
  action?: AdminAuditAction;
  targetType?: string;
}) {
  const conditions = [];
  if (query.action) {
    conditions.push(eq(adminAuditLogs.action, query.action));
  }
  if (query.targetType) {
    conditions.push(eq(adminAuditLogs.targetType, query.targetType));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(adminAuditLogs)
    .where(whereClause);

  // Implements R25
  const items = await db
    .select({
      logId: adminAuditLogs.logId,
      adminId: adminAuditLogs.adminId,
      adminName: userProfiles.displayName,
      action: adminAuditLogs.action,
      targetType: adminAuditLogs.targetType,
      targetId: adminAuditLogs.targetId,
      details: adminAuditLogs.details,
      createdAt: adminAuditLogs.createdAt,
    })
    .from(adminAuditLogs)
    .leftJoin(userProfiles, eq(adminAuditLogs.adminId, userProfiles.userId))
    .where(whereClause)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(query.limit)
    .offset(offset);

  return {
    items,
    meta: buildPaginationMeta(query.page, query.limit, countRow?.total ?? 0),
  };
}

export async function listUsers(query: {
  page: number;
  limit: number;
  search?: string;
  status?: AccountStatus;
}) {
  const conditions = [];
  if (query.status) {
    conditions.push(eq(users.accountStatus, query.status));
  }
  if (query.search) {
    const pattern = `%${query.search}%`;
    conditions.push(
      or(
        ilike(users.email, pattern),
        ilike(userProfiles.displayName, pattern),
        ilike(userProfiles.department, pattern),
        ilike(userProfiles.courseProgram, pattern)
      )!
    );
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(users)
    .leftJoin(userProfiles, eq(users.userId, userProfiles.userId))
    .where(whereClause);

  const items = await db
    .select({
      userId: users.userId,
      email: users.email,
      accountStatus: users.accountStatus,
      systemRole: users.systemRole,
      createdAt: users.createdAt,
      displayName: userProfiles.displayName,
      department: userProfiles.department,
      courseProgram: userProfiles.courseProgram,
      academicYear: userProfiles.academicYear,
      bio: userProfiles.bio,
      availabilityStatus: userProfiles.availabilityStatus,
      institution: userProfiles.institution,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.userId, userProfiles.userId))
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(query.limit)
    .offset(offset);

  return {
    items,
    meta: buildPaginationMeta(query.page, query.limit, countRow?.total ?? 0),
  };
}

export async function suspendUserAccount(
  adminId: number,
  targetUserId: number,
  reason?: string
) {
  if (adminId === targetUserId) {
    throw new BadRequestError("Administrators cannot suspend their own account");
  }

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ userId: users.userId, accountStatus: users.accountStatus })
      .from(users)
      .where(eq(users.userId, targetUserId))
      .for("update")
      .limit(1);

    if (!existing) {
      throw new NotFoundError("User not found", "USER_NOT_FOUND");
    }

    const [updated] = await tx
      .update(users)
      .set({ accountStatus: "SUSPENDED", updatedAt: new Date() })
      .where(eq(users.userId, targetUserId))
      .returning({
        userId: users.userId,
        email: users.email,
        accountStatus: users.accountStatus,
      });

    // Revoke all active refresh sessions immediately
    await tx
      .update(refreshSessions)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshSessions.userId, targetUserId),
          isNull(refreshSessions.revokedAt)
        )
      );

    await tx.insert(adminAuditLogs).values({
      adminId,
      action: "ACCOUNT_SUSPENDED",
      targetType: "USER",
      targetId: targetUserId,
      details: {
        previousStatus: existing.accountStatus,
        reason: reason ?? null,
      },
    });

    return updated!;
  });
}

export async function activateUserAccount(
  adminId: number,
  targetUserId: number,
  reason?: string
) {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ userId: users.userId, accountStatus: users.accountStatus })
      .from(users)
      .where(eq(users.userId, targetUserId))
      .for("update")
      .limit(1);

    if (!existing) {
      throw new NotFoundError("User not found", "USER_NOT_FOUND");
    }

    const [updated] = await tx
      .update(users)
      .set({ accountStatus: "ACTIVE", updatedAt: new Date() })
      .where(eq(users.userId, targetUserId))
      .returning({
        userId: users.userId,
        email: users.email,
        accountStatus: users.accountStatus,
      });

    await tx.insert(adminAuditLogs).values({
      adminId,
      action: "ACCOUNT_ACTIVATED",
      targetType: "USER",
      targetId: targetUserId,
      details: {
        previousStatus: existing.accountStatus,
        reason: reason ?? null,
      },
    });

    return updated!;
  });
}

export async function moderateProject(
  adminId: number,
  projectId: number,
  input: { status: ProjectStatus; reason: string }
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

    const [updated] = await tx
      .update(projects)
      .set({ status: input.status, updatedAt: new Date() })
      .where(eq(projects.projectId, projectId))
      .returning();

    await tx.insert(adminAuditLogs).values({
      adminId,
      action: "PROJECT_MODERATED",
      targetType: "PROJECT",
      targetId: projectId,
      details: {
        previousStatus: project.status,
        newStatus: input.status,
        reason: input.reason,
      },
    });

    await dispatchNotifications(
      [
        {
          recipientId: project.ownerId,
          type: "PROJECT_STATUS_CHANGED",
          resourceType: "PROJECT",
          resourceId: projectId,
          message: `An administrator changed "${project.title}" status to ${input.status}: ${input.reason}`,
        },
      ],
      tx
    );

    return updated!;
  });
}

export async function overrideProjectMemberRole(
  adminId: number,
  projectId: number,
  targetUserId: number,
  input: { role: ProjectMemberRole; reason: string }
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

    const [member] = await tx
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, targetUserId)
        )
      )
      .limit(1);

    if (!member) {
      throw new NotFoundError("Project member not found", "MEMBER_NOT_FOUND");
    }

    if (targetUserId === project.ownerId && input.role !== "OWNER") {
      throw new BadRequestError("Transfer ownership before demoting the owner", "CANNOT_DEMOTE_SOLE_OWNER");
    }
    if (input.role === "OWNER" && targetUserId !== project.ownerId) {
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
      .set({ role: input.role })
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, targetUserId)
        )
      )
      .returning();

    await tx.insert(adminAuditLogs).values({
      adminId,
      action: "ROLE_OVERRIDE",
      targetType: "PROJECT_MEMBER",
      targetId: targetUserId,
      details: {
        projectId,
        previousRole: member.role,
        newRole: input.role,
        reason: input.reason,
      },
    });

    return updated!;
  });
}
