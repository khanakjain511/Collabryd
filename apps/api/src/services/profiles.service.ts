import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import {
  achievements,
  db,
  interests,
  roles,
  skills,
  socialLinks,
  userInterests,
  userPreferredRoles,
  userProfiles,
  users,
  userSkills,
  type AvailabilityStatus,
  type ProficiencyLevel,
  type ProfileVisibility,
  type SocialPlatform,
} from "../models/index.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../errors/app-error.js";
import type { AuthenticatedUser } from "../types/index.js";
import { buildPaginationMeta } from "../utils/pagination.js";
import {
  buildProfileVisibilityCondition,
  isSameInstitution,
} from "../utils/visibility.js";

async function loadPortfolioDetails(userId: number) {
  const [userSkillRows, userInterestRows, userRoleRows, achievementRows, linkRows] =
    await Promise.all([
      // R03
      db
        .select({
          skillId: skills.skillId,
          name: skills.name,
          category: skills.category,
          proficiencyLevel: userSkills.proficiencyLevel,
          yearsExperience: userSkills.yearsExperience,
        })
        .from(userSkills)
        .innerJoin(skills, eq(userSkills.skillId, skills.skillId))
        .where(eq(userSkills.userId, userId))
        .orderBy(desc(userSkills.yearsExperience), asc(skills.name)),

      db
        .select({
          interestId: interests.interestId,
          name: interests.name,
          domain: interests.domain,
        })
        .from(userInterests)
        .innerJoin(interests, eq(userInterests.interestId, interests.interestId))
        .where(eq(userInterests.userId, userId))
        .orderBy(asc(interests.name)),

      db
        .select({
          roleId: roles.roleId,
          name: roles.name,
          description: roles.description,
        })
        .from(userPreferredRoles)
        .innerJoin(roles, eq(userPreferredRoles.roleId, roles.roleId))
        .where(eq(userPreferredRoles.userId, userId))
        .orderBy(asc(roles.name)),

      db
        .select()
        .from(achievements)
        .where(eq(achievements.userId, userId))
        .orderBy(desc(achievements.dateAchieved), desc(achievements.createdAt)),

      db
        .select()
        .from(socialLinks)
        .where(eq(socialLinks.userId, userId))
        .orderBy(asc(socialLinks.platform), asc(socialLinks.linkId)),
    ]);

  return {
    skills: userSkillRows.map((s) => ({
      ...s,
      yearsExperience:
        s.yearsExperience !== null ? Number(s.yearsExperience) : null,
    })),
    interests: userInterestRows,
    preferredRoles: userRoleRows,
    achievements: achievementRows,
    socialLinks: linkRows,
  };
}

export async function getOwnFullProfile(userId: number) {
  // R02
  const [base] = await db
    .select({
      userId: users.userId,
      email: users.email,
      accountStatus: users.accountStatus,
      systemRole: users.systemRole,
      displayName: userProfiles.displayName,
      bio: userProfiles.bio,
      avatarUrl: userProfiles.avatarUrl,
      institution: userProfiles.institution,
      courseProgram: userProfiles.courseProgram,
      academicYear: userProfiles.academicYear,
      department: userProfiles.department,
      preferredProjectType: userProfiles.preferredProjectType,
      availabilityStatus: userProfiles.availabilityStatus,
      profileVisibility: userProfiles.profileVisibility,
      createdAt: userProfiles.createdAt,
      updatedAt: userProfiles.updatedAt,
    })
    .from(users)
    .innerJoin(userProfiles, eq(users.userId, userProfiles.userId))
    .where(eq(users.userId, userId))
    .limit(1);

  if (!base) {
    throw new NotFoundError("Profile not found", "PROFILE_NOT_FOUND");
  }

  const portfolio = await loadPortfolioDetails(userId);
  return { ...base, ...portfolio };
}

export async function getStudentProfileById(
  targetUserId: number,
  viewer?: AuthenticatedUser
) {
  const [base] = await db
    .select({
      userId: userProfiles.userId,
      accountStatus: users.accountStatus,
      displayName: userProfiles.displayName,
      bio: userProfiles.bio,
      avatarUrl: userProfiles.avatarUrl,
      institution: userProfiles.institution,
      courseProgram: userProfiles.courseProgram,
      academicYear: userProfiles.academicYear,
      department: userProfiles.department,
      preferredProjectType: userProfiles.preferredProjectType,
      availabilityStatus: userProfiles.availabilityStatus,
      profileVisibility: userProfiles.profileVisibility,
    })
    .from(userProfiles)
    .innerJoin(users, eq(userProfiles.userId, users.userId))
    .where(eq(userProfiles.userId, targetUserId))
    .limit(1);

  if (!base) {
    throw new NotFoundError("Student profile not found", "PROFILE_NOT_FOUND");
  }

  const isSelf = viewer?.userId === targetUserId;
  const isAdmin = viewer?.systemRole === "ADMIN";

  if (!isSelf && !isAdmin) {
    if (base.accountStatus !== "ACTIVE") {
      throw new NotFoundError("Student profile not found", "PROFILE_NOT_FOUND");
    }
    if (base.profileVisibility === "PRIVATE") {
      throw new ForbiddenError("This student profile is private", "PROFILE_PRIVATE");
    }
    if (
      base.profileVisibility === "CAMPUS_ONLY" &&
      !isSameInstitution(viewer?.institution, base.institution)
    ) {
      throw new ForbiddenError(
        "This student profile is visible to campus members only",
        "PROFILE_CAMPUS_ONLY"
      );
    }
  }

  const portfolio = await loadPortfolioDetails(targetUserId);
  const { accountStatus: _status, ...publicProfile } = base;
  return { ...publicProfile, ...portfolio };
}

export async function discoverStudents(
  query: {
    page: number;
    limit: number;
    search?: string;
    skillId?: number;
    interestId?: number;
    roleId?: number;
    availabilityStatus?: AvailabilityStatus;
    institution?: string;
    academicYear?: string;
  },
  viewer?: AuthenticatedUser
) {
  const conditions = [eq(users.accountStatus, "ACTIVE")];

  const visibilityCondition = buildProfileVisibilityCondition(viewer);
  if (visibilityCondition) {
    conditions.push(visibilityCondition);
  }

  if (query.search) {
    const pattern = `%${query.search}%`;
    conditions.push(
      or(
        ilike(userProfiles.displayName, pattern),
        ilike(userProfiles.bio, pattern),
        ilike(userProfiles.courseProgram, pattern),
        ilike(userProfiles.department, pattern)
      )!
    );
  }
  if (query.availabilityStatus) {
    conditions.push(eq(userProfiles.availabilityStatus, query.availabilityStatus));
  }
  if (query.institution) {
    conditions.push(ilike(userProfiles.institution, `%${query.institution}%`));
  }
  if (query.academicYear) {
    conditions.push(eq(userProfiles.academicYear, query.academicYear));
  }
  if (query.skillId) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM collabryd.user_skills us WHERE us.user_id = ${users.userId} AND us.skill_id = ${query.skillId})`
    );
  }
  if (query.interestId) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM collabryd.user_interests ui WHERE ui.user_id = ${users.userId} AND ui.interest_id = ${query.interestId})`
    );
  }
  if (query.roleId) {
    conditions.push(
      sql`EXISTS (SELECT 1 FROM collabryd.user_preferred_roles upr WHERE upr.user_id = ${users.userId} AND upr.role_id = ${query.roleId})`
    );
  }

  const whereClause = and(...conditions);
  const offset = (query.page - 1) * query.limit;

  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(userProfiles)
    .innerJoin(users, eq(userProfiles.userId, users.userId))
    .where(whereClause);

  const items = await db
    .select({
      userId: userProfiles.userId,
      displayName: userProfiles.displayName,
      bio: userProfiles.bio,
      avatarUrl: userProfiles.avatarUrl,
      institution: userProfiles.institution,
      courseProgram: userProfiles.courseProgram,
      academicYear: userProfiles.academicYear,
      department: userProfiles.department,
      preferredProjectType: userProfiles.preferredProjectType,
      availabilityStatus: userProfiles.availabilityStatus,
      profileVisibility: userProfiles.profileVisibility,
    })
    .from(userProfiles)
    .innerJoin(users, eq(userProfiles.userId, users.userId))
    .where(whereClause)
    .orderBy(asc(userProfiles.displayName))
    .limit(query.limit)
    .offset(offset);

  // Batch-load skills for the returned page to avoid N+1 queries
  const userIds = items.map((i) => i.userId);
  const skillsByUser = new Map<
    number,
    Array<{
      skillId: number;
      name: string;
      proficiencyLevel: ProficiencyLevel;
    }>
  >();

  if (userIds.length > 0) {
    const skillRows = await db
      .select({
        userId: userSkills.userId,
        skillId: skills.skillId,
        name: skills.name,
        proficiencyLevel: userSkills.proficiencyLevel,
      })
      .from(userSkills)
      .innerJoin(skills, eq(userSkills.skillId, skills.skillId))
      .where(inArray(userSkills.userId, userIds));

    for (const row of skillRows) {
      const list = skillsByUser.get(row.userId) ?? [];
      list.push({
        skillId: row.skillId,
        name: row.name,
        proficiencyLevel: row.proficiencyLevel,
      });
      skillsByUser.set(row.userId, list);
    }
  }

  return {
    items: items.map((student) => ({
      ...student,
      skills: skillsByUser.get(student.userId) ?? [],
    })),
    meta: buildPaginationMeta(query.page, query.limit, countRow?.total ?? 0),
  };
}

export async function upsertOwnProfile(
  userId: number,
  input: {
    displayName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    institution: string;
    courseProgram: string;
    academicYear: string;
    department?: string | null;
    preferredProjectType?: string | null;
    availabilityStatus?: AvailabilityStatus;
    profileVisibility?: ProfileVisibility;
  }
) {
  // W04: upsert student profile
  const [saved] = await db
    .insert(userProfiles)
    .values({
      userId,
      displayName: input.displayName,
      bio: input.bio ?? null,
      avatarUrl: input.avatarUrl ?? null,
      institution: input.institution,
      courseProgram: input.courseProgram,
      academicYear: input.academicYear,
      department: input.department ?? null,
      preferredProjectType: input.preferredProjectType ?? null,
      availabilityStatus: input.availabilityStatus ?? "AVAILABLE",
      profileVisibility: input.profileVisibility ?? "PUBLIC",
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        displayName: input.displayName,
        bio: input.bio ?? null,
        avatarUrl: input.avatarUrl ?? null,
        institution: input.institution,
        courseProgram: input.courseProgram,
        academicYear: input.academicYear,
        department: input.department ?? null,
        preferredProjectType: input.preferredProjectType ?? null,
        ...(input.availabilityStatus
          ? { availabilityStatus: input.availabilityStatus }
          : {}),
        ...(input.profileVisibility
          ? { profileVisibility: input.profileVisibility }
          : {}),
        updatedAt: new Date(),
      },
    })
    .returning();

  return saved!;
}

export async function upsertUserSkill(
  userId: number,
  input: {
    skillId: number;
    proficiencyLevel: ProficiencyLevel;
    yearsExperience?: number | null;
  }
) {
  const [skillExists] = await db
    .select({ skillId: skills.skillId })
    .from(skills)
    .where(eq(skills.skillId, input.skillId))
    .limit(1);

  if (!skillExists) {
    throw new NotFoundError("Skill not found in catalog", "SKILL_NOT_FOUND");
  }

  const yearsStr =
    input.yearsExperience !== undefined && input.yearsExperience !== null
      ? input.yearsExperience.toFixed(1)
      : null;

  // W05
  const [saved] = await db
    .insert(userSkills)
    .values({
      userId,
      skillId: input.skillId,
      proficiencyLevel: input.proficiencyLevel,
      yearsExperience: yearsStr,
    })
    .onConflictDoUpdate({
      target: [userSkills.userId, userSkills.skillId],
      set: {
        proficiencyLevel: input.proficiencyLevel,
        yearsExperience: yearsStr,
      },
    })
    .returning();

  return {
    ...saved!,
    yearsExperience:
      saved!.yearsExperience !== null ? Number(saved!.yearsExperience) : null,
  };
}

export async function replaceUserSkills(
  userId: number,
  items: Array<{
    skillId: number;
    proficiencyLevel: ProficiencyLevel;
    yearsExperience?: number | null;
  }>
) {
  const uniqueIds = Array.from(new Set(items.map((i) => i.skillId)));
  if (uniqueIds.length !== items.length) {
    throw new BadRequestError("Duplicate skillId in request", "DUPLICATE_SKILL");
  }

  if (uniqueIds.length > 0) {
    const found = await db
      .select({ skillId: skills.skillId })
      .from(skills)
      .where(inArray(skills.skillId, uniqueIds));
    if (found.length !== uniqueIds.length) {
      throw new BadRequestError("One or more skill IDs do not exist", "INVALID_SKILL_ID");
    }
  }

  await db.transaction(async (tx) => {
    await tx.delete(userSkills).where(eq(userSkills.userId, userId));
    if (items.length > 0) {
      await tx.insert(userSkills).values(
        items.map((item) => ({
          userId,
          skillId: item.skillId,
          proficiencyLevel: item.proficiencyLevel,
          yearsExperience:
            item.yearsExperience !== undefined && item.yearsExperience !== null
              ? item.yearsExperience.toFixed(1)
              : null,
        }))
      );
    }
  });

  return (await loadPortfolioDetails(userId)).skills;
}

export async function removeUserSkill(
  userId: number,
  skillId: number
): Promise<void> {
  const deleted = await db
    .delete(userSkills)
    .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)))
    .returning({ skillId: userSkills.skillId });

  if (deleted.length === 0) {
    throw new NotFoundError("Skill association not found");
  }
}

export async function replaceUserInterests(userId: number, ids: number[]) {
  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length > 0) {
    const found = await db
      .select({ interestId: interests.interestId })
      .from(interests)
      .where(inArray(interests.interestId, uniqueIds));
    if (found.length !== uniqueIds.length) {
      throw new BadRequestError("One or more interest IDs do not exist");
    }
  }

  await db.transaction(async (tx) => {
    await tx.delete(userInterests).where(eq(userInterests.userId, userId));
    if (uniqueIds.length > 0) {
      await tx
        .insert(userInterests)
        .values(uniqueIds.map((interestId) => ({ userId, interestId })));
    }
  });

  return (await loadPortfolioDetails(userId)).interests;
}

export async function replaceUserPreferredRoles(userId: number, ids: number[]) {
  const uniqueIds = Array.from(new Set(ids));
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
    await tx
      .delete(userPreferredRoles)
      .where(eq(userPreferredRoles.userId, userId));
    if (uniqueIds.length > 0) {
      await tx
        .insert(userPreferredRoles)
        .values(uniqueIds.map((roleId) => ({ userId, roleId })));
    }
  });

  return (await loadPortfolioDetails(userId)).preferredRoles;
}

export async function addAchievement(
  userId: number,
  input: {
    title: string;
    description?: string | null;
    issuer?: string | null;
    dateAchieved?: string | null;
  }
) {
  const [created] = await db
    .insert(achievements)
    .values({
      userId,
      title: input.title,
      description: input.description ?? null,
      issuer: input.issuer ?? null,
      dateAchieved: input.dateAchieved ?? null,
    })
    .returning();
  return created!;
}

export async function updateAchievement(
  userId: number,
  achievementId: number,
  input: Partial<{
    title: string;
    description: string | null;
    issuer: string | null;
    dateAchieved: string | null;
  }>
) {
  const [updated] = await db
    .update(achievements)
    .set(input)
    .where(
      and(
        eq(achievements.achievementId, achievementId),
        eq(achievements.userId, userId)
      )
    )
    .returning();

  if (!updated) {
    throw new NotFoundError("Achievement not found");
  }
  return updated;
}

export async function deleteAchievement(
  userId: number,
  achievementId: number
): Promise<void> {
  const deleted = await db
    .delete(achievements)
    .where(
      and(
        eq(achievements.achievementId, achievementId),
        eq(achievements.userId, userId)
      )
    )
    .returning({ achievementId: achievements.achievementId });

  if (deleted.length === 0) {
    throw new NotFoundError("Achievement not found");
  }
}

export async function addSocialLink(
  userId: number,
  input: { platform: SocialPlatform; url: string }
) {
  const [created] = await db
    .insert(socialLinks)
    .values({ userId, platform: input.platform, url: input.url })
    .returning();
  return created!;
}

export async function updateSocialLink(
  userId: number,
  linkId: number,
  input: Partial<{ platform: SocialPlatform; url: string }>
) {
  const [updated] = await db
    .update(socialLinks)
    .set(input)
    .where(and(eq(socialLinks.linkId, linkId), eq(socialLinks.userId, userId)))
    .returning();

  if (!updated) {
    throw new NotFoundError("Social link not found");
  }
  return updated;
}

export async function deleteSocialLink(
  userId: number,
  linkId: number
): Promise<void> {
  const deleted = await db
    .delete(socialLinks)
    .where(and(eq(socialLinks.linkId, linkId), eq(socialLinks.userId, userId)))
    .returning({ linkId: socialLinks.linkId });

  if (deleted.length === 0) {
    throw new NotFoundError("Social link not found");
  }
}
