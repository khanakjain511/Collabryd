import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
import {
  applications,
  conversationMembers,
  conversations,
  db,
  projectMembers,
  projects,
  roles,
  userProfiles,
  type ApplicationStatus,
} from "../models/index.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors/app-error.js";
import type { AuthenticatedUser } from "../types/index.js";
import { buildPaginationMeta } from "../utils/pagination.js";
import { dispatchNotifications } from "./notifications.dispatcher.js";
import {
  assertCanViewProject,
  assertProjectManager,
} from "./projects.service.js";

export async function submitApplication(
  projectId: number,
  applicant: AuthenticatedUser,
  input: { roleId?: number | null; message?: string | null }
) {
  return db.transaction(async (tx) => {
    const [project] = await tx
      .select({
        projectId: projects.projectId,
        ownerId: projects.ownerId,
        title: projects.title,
        status: projects.status,
        visibility: projects.visibility,
        maxTeamSize: projects.maxTeamSize,
        applicationDeadline: projects.applicationDeadline,
        ownerInstitution: userProfiles.institution,
      })
      .from(projects)
      .leftJoin(userProfiles, eq(projects.ownerId, userProfiles.userId))
      .where(eq(projects.projectId, projectId))
      .limit(1);

    if (!project) {
      throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
    }

    await assertCanViewProject(project, applicant);

    if (project.status !== "OPEN") {
      throw new BadRequestError(
        `Project is currently ${project.status} and not accepting applications`,
        "PROJECT_NOT_OPEN"
      );
    }

    if (
      project.applicationDeadline &&
      project.applicationDeadline.getTime() < Date.now()
    ) {
      throw new BadRequestError(
        "The application deadline for this project has passed",
        "APPLICATION_DEADLINE_PASSED"
      );
    }

    if (project.ownerId === applicant.userId) {
      throw new BadRequestError(
        "Project owners cannot apply to their own project",
        "CANNOT_APPLY_OWN_PROJECT"
      );
    }

    const [existingMember] = await tx
      .select({ userId: projectMembers.userId })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, applicant.userId)
        )
      )
      .limit(1);

    if (existingMember) {
      throw new ConflictError(
        "You are already a member of this project",
        "ALREADY_PROJECT_MEMBER"
      );
    }

    const [memberCountRow] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId));

    if ((memberCountRow?.count ?? 0) >= project.maxTeamSize) {
      throw new ConflictError(
        "This project team has already reached maximum capacity",
        "TEAM_CAPACITY_FULL"
      );
    }

    if (input.roleId) {
      const [roleRow] = await tx
        .select({ roleId: roles.roleId })
        .from(roles)
        .where(eq(roles.roleId, input.roleId))
        .limit(1);
      if (!roleRow) {
        throw new BadRequestError("Selected role does not exist", "INVALID_ROLE");
      }
    }

    // W07: Insert PENDING application (uq_active_application enforces single PENDING per applicant/project)
    const [created] = await tx
      .insert(applications)
      .values({
        projectId,
        applicantId: applicant.userId,
        roleId: input.roleId ?? null,
        status: "PENDING",
        message: input.message ?? null,
      })
      .returning();

    const [applicantProfile] = await tx
      .select({ displayName: userProfiles.displayName })
      .from(userProfiles)
      .where(eq(userProfiles.userId, applicant.userId))
      .limit(1);

    const managers = await tx
      .select({ userId: projectMembers.userId })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          inArray(projectMembers.role, ["OWNER", "ADMIN"])
        )
      );

    await dispatchNotifications(
      managers.map((m) => ({
        recipientId: m.userId,
        type: "APPLICATION_RECEIVED",
        resourceType: "APPLICATION",
        resourceId: created!.applicationId,
        message: `${applicantProfile?.displayName ?? "A student"} applied to join "${project.title}".`,
      })),
      tx
    );

    return created!;
  });
}

export async function listProjectApplications(
  projectId: number,
  actor: AuthenticatedUser,
  query: { page: number; limit: number; status?: ApplicationStatus }
) {
  await assertProjectManager(projectId, actor);

  const conditions = [eq(applications.projectId, projectId)];
  if (query.status) {
    conditions.push(eq(applications.status, query.status));
  }
  const whereClause = and(...conditions);
  const offset = (query.page - 1) * query.limit;

  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(applications)
    .where(whereClause);

  const items = await db
    .select({
      applicationId: applications.applicationId,
      projectId: applications.projectId,
      applicantId: applications.applicantId,
      applicantName: userProfiles.displayName,
      applicantAvatarUrl: userProfiles.avatarUrl,
      courseProgram: userProfiles.courseProgram,
      academicYear: userProfiles.academicYear,
      roleId: applications.roleId,
      appliedRole: roles.name,
      status: applications.status,
      message: applications.message,
      appliedAt: applications.appliedAt,
      reviewedAt: applications.reviewedAt,
    })
    .from(applications)
    .innerJoin(userProfiles, eq(applications.applicantId, userProfiles.userId))
    .leftJoin(roles, eq(applications.roleId, roles.roleId))
    .where(whereClause)
    .orderBy(asc(applications.appliedAt))
    .limit(query.limit)
    .offset(offset);

  return {
    items,
    meta: buildPaginationMeta(query.page, query.limit, countRow?.total ?? 0),
  };
}

export async function listIncomingApplications(
  managerUserId: number,
  query: { page: number; limit: number; status?: ApplicationStatus }
) {
  // Implements R17: pending (or filtered) applications across projects managed by user
  const statusFilter = query.status ?? "PENDING";
  const offset = (query.page - 1) * query.limit;

  const managedProjects = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.userId, managerUserId),
        inArray(projectMembers.role, ["OWNER", "ADMIN"])
      )
    );

  const projectIds = managedProjects.map((p) => p.projectId);
  if (projectIds.length === 0) {
    return {
      items: [],
      meta: buildPaginationMeta(query.page, query.limit, 0),
    };
  }

  const whereClause = and(
    inArray(applications.projectId, projectIds),
    eq(applications.status, statusFilter)
  );

  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(applications)
    .where(whereClause);

  const items = await db
    .select({
      applicationId: applications.applicationId,
      projectId: applications.projectId,
      projectTitle: projects.title,
      applicantId: applications.applicantId,
      applicantName: userProfiles.displayName,
      courseProgram: userProfiles.courseProgram,
      appliedRole: roles.name,
      status: applications.status,
      message: applications.message,
      appliedAt: applications.appliedAt,
      reviewedAt: applications.reviewedAt,
    })
    .from(applications)
    .innerJoin(projects, eq(applications.projectId, projects.projectId))
    .innerJoin(userProfiles, eq(applications.applicantId, userProfiles.userId))
    .leftJoin(roles, eq(applications.roleId, roles.roleId))
    .where(whereClause)
    .orderBy(asc(applications.appliedAt))
    .limit(query.limit)
    .offset(offset);

  return {
    items,
    meta: buildPaginationMeta(query.page, query.limit, countRow?.total ?? 0),
  };
}

export async function listMyApplications(
  applicantId: number,
  query: { page: number; limit: number; status?: ApplicationStatus }
) {
  // Implements R18: student's submitted applications tracker
  const conditions = [eq(applications.applicantId, applicantId)];
  if (query.status) {
    conditions.push(eq(applications.status, query.status));
  }
  const whereClause = and(...conditions);
  const offset = (query.page - 1) * query.limit;

  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(applications)
    .where(whereClause);

  const items = await db
    .select({
      applicationId: applications.applicationId,
      projectId: projects.projectId,
      projectTitle: projects.title,
      projectStatus: projects.status,
      ownerName: userProfiles.displayName,
      roleId: applications.roleId,
      appliedRole: roles.name,
      status: applications.status,
      message: applications.message,
      appliedAt: applications.appliedAt,
      reviewedAt: applications.reviewedAt,
    })
    .from(applications)
    .innerJoin(projects, eq(applications.projectId, projects.projectId))
    .innerJoin(userProfiles, eq(projects.ownerId, userProfiles.userId))
    .leftJoin(roles, eq(applications.roleId, roles.roleId))
    .where(whereClause)
    .orderBy(desc(applications.appliedAt))
    .limit(query.limit)
    .offset(offset);

  return {
    items,
    meta: buildPaginationMeta(query.page, query.limit, countRow?.total ?? 0),
  };
}

export async function acceptApplication(
  applicationId: number,
  actor: AuthenticatedUser
) {
  return db.transaction(async (tx) => {
    const [app] = await tx
      .select()
      .from(applications)
      .where(eq(applications.applicationId, applicationId))
      .for("update")
      .limit(1);

    if (!app) {
      throw new NotFoundError("Application not found", "APPLICATION_NOT_FOUND");
    }

    if (app.status !== "PENDING") {
      throw new ConflictError(
        `Only PENDING applications can be accepted (current status: ${app.status})`,
        "APPLICATION_NOT_PENDING"
      );
    }

    // Lock the project row to serialize concurrent capacity checks
    const [project] = await tx
      .select()
      .from(projects)
      .where(eq(projects.projectId, app.projectId))
      .for("update")
      .limit(1);

    if (!project) {
      throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
    }

    if (actor.systemRole !== "ADMIN") {
      const [actorMembership] = await tx
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, project.projectId),
            eq(projectMembers.userId, actor.userId)
          )
        )
        .limit(1);

      if (
        actorMembership?.role !== "OWNER" &&
        actorMembership?.role !== "ADMIN"
      ) {
        throw new ForbiddenError(
          "Only project owners or admins can accept applications"
        );
      }
    }

    if (
      project.status === "CLOSED" ||
      project.status === "ARCHIVED" ||
      project.status === "COMPLETED"
    ) {
      throw new BadRequestError(
        `Cannot accept applications when project is ${project.status}`,
        "PROJECT_CLOSED"
      );
    }

    const currentMembers = await tx
      .select({ userId: projectMembers.userId })
      .from(projectMembers)
      .where(eq(projectMembers.projectId, project.projectId));

    if (currentMembers.some((m) => m.userId === app.applicantId)) {
      throw new ConflictError(
        "Applicant is already a member of this project",
        "ALREADY_PROJECT_MEMBER"
      );
    }

    if (currentMembers.length >= project.maxTeamSize) {
      throw new ConflictError(
        "Project team has reached maximum capacity",
        "TEAM_CAPACITY_FULL"
      );
    }

    // W08: mark application ACCEPTED
    const [updatedApp] = await tx
      .update(applications)
      .set({
        status: "ACCEPTED",
        reviewedAt: new Date(),
      })
      .where(eq(applications.applicationId, applicationId))
      .returning();

    const [member] = await tx
      .insert(projectMembers)
      .values({
        projectId: project.projectId,
        userId: app.applicantId,
        role: "MEMBER",
      })
      .returning();

    // Ensure project group conversation exists and add new member
    let [groupConv] = await tx
      .select({ conversationId: conversations.conversationId })
      .from(conversations)
      .where(eq(conversations.projectId, project.projectId))
      .limit(1);

    if (!groupConv) {
      const [createdConv] = await tx
        .insert(conversations)
        .values({ type: "GROUP", projectId: project.projectId })
        .returning({ conversationId: conversations.conversationId });
      groupConv = createdConv!;
    }

    await tx
      .insert(conversationMembers)
      .values({
        conversationId: groupConv.conversationId,
        userId: app.applicantId,
        lastReadSequence: 0,
      })
      .onConflictDoNothing();

    const [applicantProfile] = await tx
      .select({ displayName: userProfiles.displayName })
      .from(userProfiles)
      .where(eq(userProfiles.userId, app.applicantId))
      .limit(1);

    const notificationPayloads = [
      {
        recipientId: app.applicantId,
        type: "APPLICATION_ACCEPTED" as const,
        resourceType: "PROJECT",
        resourceId: project.projectId,
        message: `Your application to join "${project.title}" has been accepted!`,
      },
      ...currentMembers
        .filter((m) => m.userId !== actor.userId)
        .map((m) => ({
          recipientId: m.userId,
          type: "TEAM_MEMBER_ADDED" as const,
          resourceType: "PROJECT",
          resourceId: project.projectId,
          message: `${applicantProfile?.displayName ?? "A new member"} joined "${project.title}".`,
        })),
    ];

    await dispatchNotifications(notificationPayloads, tx);

    return {
      application: updatedApp!,
      member: member!,
      groupConversationId: groupConv.conversationId,
    };
  });
}

export async function rejectApplication(
  applicationId: number,
  actor: AuthenticatedUser
) {
  return db.transaction(async (tx) => {
    const [app] = await tx
      .select()
      .from(applications)
      .where(eq(applications.applicationId, applicationId))
      .for("update")
      .limit(1);

    if (!app) {
      throw new NotFoundError("Application not found", "APPLICATION_NOT_FOUND");
    }

    if (app.status !== "PENDING") {
      throw new ConflictError(
        `Only PENDING applications can be rejected (current status: ${app.status})`,
        "APPLICATION_NOT_PENDING"
      );
    }

    const [project] = await tx
      .select({ projectId: projects.projectId, title: projects.title })
      .from(projects)
      .where(eq(projects.projectId, app.projectId))
      .limit(1);

    if (!project) {
      throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
    }

    if (actor.systemRole !== "ADMIN") {
      const [actorMembership] = await tx
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, project.projectId),
            eq(projectMembers.userId, actor.userId)
          )
        )
        .limit(1);

      if (
        actorMembership?.role !== "OWNER" &&
        actorMembership?.role !== "ADMIN"
      ) {
        throw new ForbiddenError(
          "Only project owners or admins can reject applications"
        );
      }
    }

    const [updated] = await tx
      .update(applications)
      .set({
        status: "REJECTED",
        reviewedAt: new Date(),
      })
      .where(eq(applications.applicationId, applicationId))
      .returning();

    await dispatchNotifications(
      [
        {
          recipientId: app.applicantId,
          type: "APPLICATION_REJECTED",
          resourceType: "APPLICATION",
          resourceId: applicationId,
          message: `Your application to "${project.title}" was not selected at this time.`,
        },
      ],
      tx
    );

    return updated!;
  });
}

export async function withdrawApplication(
  applicationId: number,
  applicantId: number
) {
  return db.transaction(async (tx) => {
    const [app] = await tx
      .select()
      .from(applications)
      .where(eq(applications.applicationId, applicationId))
      .for("update")
      .limit(1);

    if (!app) {
      throw new NotFoundError("Application not found", "APPLICATION_NOT_FOUND");
    }

    if (app.applicantId !== applicantId) {
      throw new ForbiddenError(
        "Only the applicant can withdraw their application"
      );
    }

    if (app.status !== "PENDING") {
      throw new ConflictError(
        `Only PENDING applications can be withdrawn (current status: ${app.status})`,
        "APPLICATION_NOT_PENDING"
      );
    }

    const [updated] = await tx
      .update(applications)
      .set({
        status: "WITHDRAWN",
        reviewedAt: new Date(),
      })
      .where(
        and(
          eq(applications.applicationId, applicationId),
          ne(applications.status, "WITHDRAWN")
        )
      )
      .returning();

    return updated!;
  });
}
