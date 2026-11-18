import { and, asc, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import {
  conversationMembers,
  conversations,
  db,
  projectMembers,
  projectRoles,
  projects,
  projectSkills,
  roles,
  skills,
  userProfiles,
  users,
  userSkills,
  type ProjectMemberRole,
  type ProjectStatus,
  type ProjectType,
  type ProjectVisibility,
} from "@collabryd/database";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../common/errors/app-error.js";
import type { AuthenticatedUser } from "../../common/types/express.js";
import { buildPaginationMeta } from "../../common/utils/pagination.js";
import {
  buildProjectVisibilityCondition,
  isSameInstitution,
} from "../../common/utils/visibility.js";
import { dispatchNotifications } from "../notifications/notifications.dispatcher.js";

export async function getProjectMembershipRole(
  projectId: number,
  userId: number
): Promise<ProjectMemberRole | null> {
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

export async function assertProjectManager(
  projectId: number,
  user: AuthenticatedUser
): Promise<void> {
  if (user.systemRole === "ADMIN") return;
  const role = await getProjectMembershipRole(projectId, user.userId);
  if (role !== "OWNER" && role !== "ADMIN") {
    throw new ForbiddenError(
      "Only project owners or admins can manage this project",
      "PROJECT_MANAGER_REQUIRED"
    );
  }
}

export async function assertCanViewProject(
  project: {
    projectId: number;
    ownerId: number;
    visibility: ProjectVisibility;
    status: ProjectStatus;
    ownerInstitution: string | null;
  },
  viewer?: AuthenticatedUser
): Promise<void> {
  if (viewer?.systemRole === "ADMIN") return;
  if (viewer?.userId === project.ownerId) return;

  if (viewer) {
    const memberRole = await getProjectMembershipRole(
      project.projectId,
      viewer.userId
    );
    if (memberRole !== null) return;
  }

  if (project.status === "DRAFT") {
    throw new ForbiddenError("Draft projects are only visible to team members");
  }

  if (project.visibility === "PRIVATE") {
    throw new ForbiddenError(
      "This project is private",
      "PROJECT_PRIVATE"
    );
  }

  if (
    project.visibility === "CAMPUS_ONLY" &&
    !isSameInstitution(viewer?.institution, project.ownerInstitution)
  ) {
    throw new ForbiddenError(
      "This project is restricted to campus members",
      "PROJECT_CAMPUS_ONLY"
    );
  }
}

export async function createProject(
  ownerId: number,
  input: {
    title: string;
    summary: string;
    description: string;
    category: string;
    projectType: ProjectType;
    status: "DRAFT" | "OPEN";
    visibility: ProjectVisibility;
    minTeamSize: number;
    maxTeamSize: number;
    applicationDeadline?: Date | null;
    startDate?: string | null;
    skills?: Array<{ skillId: number; isRequired: boolean }>;
    roles?: Array<{
      roleId: number;
      openPositions: number;
      description?: string | null;
    }>;
  }
) {
  if (input.skills && input.skills.length > 0) {
    const ids = Array.from(new Set(input.skills.map((s) => s.skillId)));
    if (ids.length !== input.skills.length) {
      throw new BadRequestError("Duplicate skillId in project skills");
    }
    const existing = await db
      .select({ skillId: skills.skillId })
      .from(skills)
      .where(inArray(skills.skillId, ids));
    if (existing.length !== ids.length) {
      throw new BadRequestError("One or more skill IDs do not exist");
    }
  }

  if (input.roles && input.roles.length > 0) {
    const ids = Array.from(new Set(input.roles.map((r) => r.roleId)));
    if (ids.length !== input.roles.length) {
      throw new BadRequestError("Duplicate roleId in project roles");
    }
    const existing = await db
      .select({ roleId: roles.roleId })
      .from(roles)
      .where(inArray(roles.roleId, ids));
    if (existing.length !== ids.length) {
      throw new BadRequestError("One or more role IDs do not exist");
    }
  }

  const projectId = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(projects)
      .values({
        ownerId,
        title: input.title,
        summary: input.summary,
        description: input.description,
        category: input.category,
        projectType: input.projectType,
        status: input.status,
        visibility: input.visibility,
        minTeamSize: input.minTeamSize,
        maxTeamSize: input.maxTeamSize,
        applicationDeadline: input.applicationDeadline ?? null,
        startDate: input.startDate ?? null,
      })
      .returning({ projectId: projects.projectId });

    const newProjectId = created!.projectId;

    await tx.insert(projectMembers).values({
      projectId: newProjectId,
      userId: ownerId,
      role: "OWNER",
    });

    const [groupConv] = await tx
      .insert(conversations)
      .values({
        type: "GROUP",
        projectId: newProjectId,
      })
      .returning({ conversationId: conversations.conversationId });

    await tx.insert(conversationMembers).values({
      conversationId: groupConv!.conversationId,
      userId: ownerId,
      lastReadSequence: 0,
    });

    if (input.skills && input.skills.length > 0) {
      await tx.insert(projectSkills).values(
        input.skills.map((s) => ({
          projectId: newProjectId,
          skillId: s.skillId,
          isRequired: s.isRequired,
        }))
      );
    }

    if (input.roles && input.roles.length > 0) {
      await tx.insert(projectRoles).values(
        input.roles.map((r) => ({
          projectId: newProjectId,
          roleId: r.roleId,
          openPositions: r.openPositions,
          description: r.description ?? null,
        }))
      );
    }

    return newProjectId;
  });

  return getProjectById(projectId, {
    userId: ownerId,
    email: "",
    accountStatus: "ACTIVE",
    systemRole: "STUDENT",
  });
}

export async function listProjects(
  query: {
    page: number;
    limit: number;
    status?: ProjectStatus;
    category?: string;
    projectType?: ProjectType;
    skillId?: number;
    skillName?: string;
    roleId?: number;
    ownerId?: number;
    search?: string;
  },
  viewer?: AuthenticatedUser
) {
  const conditions = [];

  const isViewingOwnProjects =
    viewer && query.ownerId && viewer.userId === query.ownerId;

  if (query.status) {
    conditions.push(eq(projects.status, query.status));
  } else if (!isViewingOwnProjects && viewer?.systemRole !== "ADMIN") {
    conditions.push(eq(projects.status, "OPEN"));
  }

  if (query.ownerId) {
    conditions.push(eq(projects.ownerId, query.ownerId));
  }
  if (query.category) {
    conditions.push(eq(projects.category, query.category));
  }
  if (query.projectType) {
    conditions.push(eq(projects.projectType, query.projectType));
  }
  if (query.search) {
    const pattern = `%${query.search}%`;
    conditions.push(
      or(
        ilike(projects.title, pattern),
        ilike(projects.summary, pattern),
        ilike(projects.description, pattern)
      )!
    );
  }
  if (query.skillId) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM collabryd.project_skills ps WHERE ps.project_id = ${projects.projectId} AND ps.skill_id = ${query.skillId})`
    );
  }
  if (query.skillName) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM collabryd.project_skills ps
        JOIN collabryd.skills s ON s.skill_id = ps.skill_id
        WHERE ps.project_id = ${projects.projectId} AND LOWER(s.name) = ${query.skillName.toLowerCase()}
      )`
    );
  }
  if (query.roleId) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM collabryd.project_roles pr WHERE pr.project_id = ${projects.projectId} AND pr.role_id = ${query.roleId})`
    );
  }

  // Visibility scoping
  if (!isViewingOwnProjects) {
    const visibilityCondition = buildProjectVisibilityCondition(viewer);
    if (visibilityCondition) {
      conditions.push(visibilityCondition);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(projects)
    .innerJoin(userProfiles, eq(projects.ownerId, userProfiles.userId))
    .where(whereClause);

  // R10 / R11 style directory query
  const rows = await db
    .select({
      projectId: projects.projectId,
      ownerId: projects.ownerId,
      ownerName: userProfiles.displayName,
      ownerInstitution: userProfiles.institution,
      title: projects.title,
      summary: projects.summary,
      category: projects.category,
      projectType: projects.projectType,
      status: projects.status,
      visibility: projects.visibility,
      minTeamSize: projects.minTeamSize,
      maxTeamSize: projects.maxTeamSize,
      applicationDeadline: projects.applicationDeadline,
      startDate: projects.startDate,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .innerJoin(userProfiles, eq(projects.ownerId, userProfiles.userId))
    .where(whereClause)
    .orderBy(desc(projects.createdAt))
    .limit(query.limit)
    .offset(offset);

  const projectIds = rows.map((r) => r.projectId);
  const skillsMap = new Map<
    number,
    Array<{ skillId: number; name: string; isRequired: boolean }>
  >();
  const memberCountMap = new Map<number, number>();

  if (projectIds.length > 0) {
    const [skillRows, memberCounts] = await Promise.all([
      db
        .select({
          projectId: projectSkills.projectId,
          skillId: skills.skillId,
          name: skills.name,
          isRequired: projectSkills.isRequired,
        })
        .from(projectSkills)
        .innerJoin(skills, eq(projectSkills.skillId, skills.skillId))
        .where(inArray(projectSkills.projectId, projectIds)),

      db
        .select({
          projectId: projectMembers.projectId,
          memberCount: sql<number>`count(*)::int`,
        })
        .from(projectMembers)
        .where(inArray(projectMembers.projectId, projectIds))
        .groupBy(projectMembers.projectId),
    ]);

    for (const s of skillRows) {
      const list = skillsMap.get(s.projectId) ?? [];
      list.push({
        skillId: s.skillId,
        name: s.name,
        isRequired: s.isRequired,
      });
      skillsMap.set(s.projectId, list);
    }

    for (const mc of memberCounts) {
      memberCountMap.set(mc.projectId, mc.memberCount);
    }
  }

  return {
    items: rows.map((r) => {
      const currentMemberCount = memberCountMap.get(r.projectId) ?? 0;
      return {
        ...r,
        currentMemberCount,
        remainingCapacity: Math.max(0, r.maxTeamSize - currentMemberCount),
        skills: skillsMap.get(r.projectId) ?? [],
      };
    }),
    meta: buildPaginationMeta(query.page, query.limit, countRow?.total ?? 0),
  };
}

export async function getProjectById(
  projectId: number,
  viewer?: AuthenticatedUser
) {
  const [project] = await db
    .select({
      projectId: projects.projectId,
      ownerId: projects.ownerId,
      ownerName: userProfiles.displayName,
      ownerInstitution: userProfiles.institution,
      ownerAvatarUrl: userProfiles.avatarUrl,
      title: projects.title,
      summary: projects.summary,
      description: projects.description,
      category: projects.category,
      projectType: projects.projectType,
      status: projects.status,
      visibility: projects.visibility,
      minTeamSize: projects.minTeamSize,
      maxTeamSize: projects.maxTeamSize,
      applicationDeadline: projects.applicationDeadline,
      startDate: projects.startDate,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
    })
    .from(projects)
    .leftJoin(userProfiles, eq(projects.ownerId, userProfiles.userId))
    .where(eq(projects.projectId, projectId))
    .limit(1);

  if (!project) {
    throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
  }

  await assertCanViewProject(project, viewer);

  const [skillRows, roleRows, memberRows, convRow] = await Promise.all([
    // R12 skills
    db
      .select({
        skillId: skills.skillId,
        name: skills.name,
        category: skills.category,
        isRequired: projectSkills.isRequired,
      })
      .from(projectSkills)
      .innerJoin(skills, eq(projectSkills.skillId, skills.skillId))
      .where(eq(projectSkills.projectId, projectId))
      .orderBy(desc(projectSkills.isRequired), asc(skills.name)),

    // R14 roles
    db
      .select({
        projectRoleId: projectRoles.projectRoleId,
        roleId: roles.roleId,
        roleName: roles.name,
        openPositions: projectRoles.openPositions,
        description: projectRoles.description,
      })
      .from(projectRoles)
      .innerJoin(roles, eq(projectRoles.roleId, roles.roleId))
      .where(eq(projectRoles.projectId, projectId))
      .orderBy(asc(roles.name)),

    // R13 members
    db
      .select({
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
      ),

    db
      .select({ conversationId: conversations.conversationId })
      .from(conversations)
      .where(eq(conversations.projectId, projectId))
      .limit(1),
  ]);

  const currentMemberCount = memberRows.length;

  return {
    ...project,
    currentMemberCount,
    remainingCapacity: Math.max(0, project.maxTeamSize - currentMemberCount),
    groupConversationId: convRow[0]?.conversationId ?? null,
    skills: skillRows,
    roles: roleRows,
    members: memberRows,
  };
}

export async function updateProject(
  projectId: number,
  actor: AuthenticatedUser,
  input: Partial<{
    title: string;
    summary: string;
    description: string;
    category: string;
    projectType: ProjectType;
    visibility: ProjectVisibility;
    minTeamSize: number;
    maxTeamSize: number;
    applicationDeadline: Date | null;
    startDate: string | null;
  }>
) {
  await assertProjectManager(projectId, actor);

  const [existing] = await db
    .select()
    .from(projects)
    .where(eq(projects.projectId, projectId))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
  }

  const nextMin = input.minTeamSize ?? existing.minTeamSize;
  const nextMax = input.maxTeamSize ?? existing.maxTeamSize;
  if (nextMax < nextMin) {
    throw new BadRequestError(
      "maxTeamSize must be greater than or equal to minTeamSize",
      "INVALID_TEAM_SIZE_RANGE"
    );
  }

  const [memberCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId));

  if (nextMax < (memberCountRow?.count ?? 0)) {
    throw new BadRequestError(
      `maxTeamSize cannot be smaller than current team size (${memberCountRow?.count})`,
      "TEAM_SIZE_BELOW_CURRENT_MEMBERS"
    );
  }

  const [updated] = await db
    .update(projects)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(projects.projectId, projectId))
    .returning();

  return updated!;
}

export async function updateProjectStatus(
  projectId: number,
  actor: AuthenticatedUser,
  status: ProjectStatus
) {
  await assertProjectManager(projectId, actor);

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(projects)
      .where(eq(projects.projectId, projectId))
      .for("update")
      .limit(1);

    if (!existing) {
      throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
    }

    const [updated] = await tx
      .update(projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(projects.projectId, projectId))
      .returning();

    if (existing.status !== status) {
      const members = await tx
        .select({ userId: projectMembers.userId })
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, projectId),
            ne(projectMembers.userId, actor.userId)
          )
        );

      await dispatchNotifications(
        members.map((m) => ({
          recipientId: m.userId,
          type: "PROJECT_STATUS_CHANGED",
          resourceType: "PROJECT",
          resourceId: projectId,
          message: `Project "${existing.title}" status changed from ${existing.status} to ${status}.`,
        })),
        tx
      );
    }

    return updated!;
  });
}

export async function deleteProject(
  projectId: number,
  actor: AuthenticatedUser
): Promise<void> {
  const [project] = await db
    .select({ ownerId: projects.ownerId })
    .from(projects)
    .where(eq(projects.projectId, projectId))
    .limit(1);

  if (!project) {
    throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
  }

  if (project.ownerId !== actor.userId && actor.systemRole !== "ADMIN") {
    throw new ForbiddenError(
      "Only the project owner can delete a project",
      "OWNER_REQUIRED"
    );
  }

  await db.delete(projects).where(eq(projects.projectId, projectId));
}

export async function replaceProjectSkills(
  projectId: number,
  actor: AuthenticatedUser,
  items: Array<{ skillId: number; isRequired: boolean }>
) {
  await assertProjectManager(projectId, actor);

  const uniqueIds = Array.from(new Set(items.map((s) => s.skillId)));
  if (uniqueIds.length !== items.length) {
    throw new BadRequestError("Duplicate skillId in request");
  }
  if (uniqueIds.length > 0) {
    const found = await db
      .select({ skillId: skills.skillId })
      .from(skills)
      .where(inArray(skills.skillId, uniqueIds));
    if (found.length !== uniqueIds.length) {
      throw new BadRequestError("One or more skill IDs do not exist");
    }
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(projectSkills)
      .where(eq(projectSkills.projectId, projectId));
    if (items.length > 0) {
      await tx.insert(projectSkills).values(
        items.map((item) => ({
          projectId,
          skillId: item.skillId,
          isRequired: item.isRequired,
        }))
      );
    }
  });

  return db
    .select({
      skillId: skills.skillId,
      name: skills.name,
      category: skills.category,
      isRequired: projectSkills.isRequired,
    })
    .from(projectSkills)
    .innerJoin(skills, eq(projectSkills.skillId, skills.skillId))
    .where(eq(projectSkills.projectId, projectId))
    .orderBy(desc(projectSkills.isRequired), asc(skills.name));
}

export async function removeProjectSkill(
  projectId: number,
  skillId: number,
  actor: AuthenticatedUser
): Promise<void> {
  await assertProjectManager(projectId, actor);
  const deleted = await db
    .delete(projectSkills)
    .where(
      and(
        eq(projectSkills.projectId, projectId),
        eq(projectSkills.skillId, skillId)
      )
    )
    .returning({ skillId: projectSkills.skillId });

  if (deleted.length === 0) {
    throw new NotFoundError("Project skill association not found");
  }
}

export async function replaceProjectRoles(
  projectId: number,
  actor: AuthenticatedUser,
  items: Array<{
    roleId: number;
    openPositions: number;
    description?: string | null;
  }>
) {
  await assertProjectManager(projectId, actor);

  const uniqueIds = Array.from(new Set(items.map((r) => r.roleId)));
  if (uniqueIds.length !== items.length) {
    throw new BadRequestError("Duplicate roleId in request");
  }
  if (uniqueIds.length > 0) {
    const found = await db
      .select({ roleId: roles.roleId })
      .from(roles)
      .where(inArray(roles.roleId, uniqueIds));
    if (found.length !== uniqueIds.length) {
      throw new BadRequestError("One or more role IDs do not exist");
    }
  }

  await db.transaction(async (tx) => {
    await tx.delete(projectRoles).where(eq(projectRoles.projectId, projectId));
    if (items.length > 0) {
      await tx.insert(projectRoles).values(
        items.map((item) => ({
          projectId,
          roleId: item.roleId,
          openPositions: item.openPositions,
          description: item.description ?? null,
        }))
      );
    }
  });

  return db
    .select({
      projectRoleId: projectRoles.projectRoleId,
      roleId: roles.roleId,
      roleName: roles.name,
      openPositions: projectRoles.openPositions,
      description: projectRoles.description,
    })
    .from(projectRoles)
    .innerJoin(roles, eq(projectRoles.roleId, roles.roleId))
    .where(eq(projectRoles.projectId, projectId))
    .orderBy(asc(roles.name));
}

export async function removeProjectRole(
  projectId: number,
  roleId: number,
  actor: AuthenticatedUser
): Promise<void> {
  await assertProjectManager(projectId, actor);
  const deleted = await db
    .delete(projectRoles)
    .where(
      and(
        eq(projectRoles.projectId, projectId),
        eq(projectRoles.roleId, roleId)
      )
    )
    .returning({ roleId: projectRoles.roleId });

  if (deleted.length === 0) {
    throw new NotFoundError("Project role not found");
  }
}

export async function getProjectCapacity(projectId: number) {
  // Implements R19
  const [row] = await db
    .select({
      projectId: projects.projectId,
      status: projects.status,
      minTeamSize: projects.minTeamSize,
      maxTeamSize: projects.maxTeamSize,
      currentMemberCount: sql<number>`count(${projectMembers.userId})::int`,
      remainingCapacity: sql<number>`(${projects.maxTeamSize} - count(${projectMembers.userId}))::int`,
    })
    .from(projects)
    .leftJoin(projectMembers, eq(projects.projectId, projectMembers.projectId))
    .where(eq(projects.projectId, projectId))
    .groupBy(
      projects.projectId,
      projects.status,
      projects.minTeamSize,
      projects.maxTeamSize
    );

  if (!row) {
    throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
  }

  return row;
}

export async function recommendCandidatesForProject(
  projectId: number,
  actor: AuthenticatedUser,
  limit = 10
) {
  await assertProjectManager(projectId, actor);

  // Implements R15: rank active, non-member, non-private candidates by skill overlap
  const rows = await db
    .select({
      userId: users.userId,
      displayName: userProfiles.displayName,
      institution: userProfiles.institution,
      courseProgram: userProfiles.courseProgram,
      academicYear: userProfiles.academicYear,
      availabilityStatus: userProfiles.availabilityStatus,
      matchingSkillsCount: sql<number>`count(distinct ${projectSkills.skillId})::int`,
      matchedSkills: sql<string>`string_agg(${skills.name}, ', ' ORDER BY ${skills.name})`,
    })
    .from(users)
    .innerJoin(userProfiles, eq(users.userId, userProfiles.userId))
    .innerJoin(userSkills, eq(users.userId, userSkills.userId))
    .innerJoin(projectSkills, eq(userSkills.skillId, projectSkills.skillId))
    .innerJoin(skills, eq(projectSkills.skillId, skills.skillId))
    .where(
      and(
        eq(projectSkills.projectId, projectId),
        eq(users.accountStatus, "ACTIVE"),
        ne(userProfiles.profileVisibility, "PRIVATE"),
        sql`${users.userId} NOT IN (SELECT pm.user_id FROM collabryd.project_members pm WHERE pm.project_id = ${projectId})`
      )
    )
    .groupBy(
      users.userId,
      userProfiles.displayName,
      userProfiles.institution,
      userProfiles.courseProgram,
      userProfiles.academicYear,
      userProfiles.availabilityStatus
    )
    .orderBy(
      desc(sql`count(distinct ${projectSkills.skillId})`),
      asc(userProfiles.displayName)
    )
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    matchedSkills: r.matchedSkills ? r.matchedSkills.split(", ") : [],
  }));
}

export async function recommendProjectsForStudent(
  user: AuthenticatedUser,
  limit = 10
) {
  // Implements R16: rank open projects matching student's skills where student is not owner/member
  const visibilityCond = user.institution
    ? or(
        eq(projects.visibility, "PUBLIC"),
        and(
          eq(projects.visibility, "CAMPUS_ONLY"),
          sql`LOWER(${userProfiles.institution}) = ${user.institution.trim().toLowerCase()}`
        )
      )!
    : eq(projects.visibility, "PUBLIC");

  const rows = await db
    .select({
      projectId: projects.projectId,
      title: projects.title,
      summary: projects.summary,
      category: projects.category,
      projectType: projects.projectType,
      maxTeamSize: projects.maxTeamSize,
      ownerName: userProfiles.displayName,
      createdAt: projects.createdAt,
      matchedSkillsCount: sql<number>`count(distinct ${projectSkills.skillId})::int`,
      matchedSkills: sql<string>`string_agg(${skills.name}, ', ' ORDER BY ${skills.name})`,
    })
    .from(projects)
    .innerJoin(userProfiles, eq(projects.ownerId, userProfiles.userId))
    .innerJoin(projectSkills, eq(projects.projectId, projectSkills.projectId))
    .innerJoin(userSkills, eq(projectSkills.skillId, userSkills.skillId))
    .innerJoin(skills, eq(projectSkills.skillId, skills.skillId))
    .where(
      and(
        eq(userSkills.userId, user.userId),
        eq(projects.status, "OPEN"),
        ne(projects.ownerId, user.userId),
        visibilityCond,
        sql`${projects.projectId} NOT IN (SELECT pm.project_id FROM collabryd.project_members pm WHERE pm.user_id = ${user.userId})`
      )
    )
    .groupBy(
      projects.projectId,
      projects.title,
      projects.summary,
      projects.category,
      projects.projectType,
      projects.maxTeamSize,
      userProfiles.displayName,
      projects.createdAt
    )
    .orderBy(
      desc(sql`count(distinct ${projectSkills.skillId})`),
      desc(projects.createdAt)
    )
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    matchedSkills: r.matchedSkills ? r.matchedSkills.split(", ") : [],
  }));
}
