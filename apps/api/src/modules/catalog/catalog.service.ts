import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import {
  db,
  interests,
  projectRoles,
  roles,
  skills,
  userInterests,
  userSkills,
} from "@collabryd/database";
import {
  getOrSetCache,
  invalidateCachePrefix,
} from "../../common/cache/cache.service.js";
import { buildPaginationMeta } from "../../common/utils/pagination.js";

const CATALOG_CACHE_TTL_SECONDS = 60;

/** Lists and searches skills with student usage counts (R07), cached via Redis. */
export async function listSkills(query: {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}) {
  const cacheKey = `catalog:skills:${query.page}:${query.limit}:${query.search ?? ""}:${query.category ?? ""}`;

  return getOrSetCache(cacheKey, CATALOG_CACHE_TTL_SECONDS, async () => {
    const conditions = [];
    if (query.search) {
      conditions.push(ilike(skills.name, `%${query.search}%`));
    }
    if (query.category) {
      conditions.push(eq(skills.category, query.category));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [countRow] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(skills)
      .where(whereClause);

    const items = await db
      .select({
        skillId: skills.skillId,
        name: skills.name,
        category: skills.category,
        studentCount: sql<number>`count(${userSkills.userId})::int`,
      })
      .from(skills)
      .leftJoin(userSkills, eq(skills.skillId, userSkills.skillId))
      .where(whereClause)
      .groupBy(skills.skillId, skills.name, skills.category)
      .orderBy(desc(sql`count(${userSkills.userId})`), asc(skills.name))
      .limit(query.limit)
      .offset(offset);

    return {
      items,
      meta: buildPaginationMeta(query.page, query.limit, countRow?.total ?? 0),
    };
  });
}

/** Lists and searches interest domains with follower counts (R08), cached via Redis. */
export async function listInterests(query: {
  page: number;
  limit: number;
  search?: string;
  domain?: string;
}) {
  const cacheKey = `catalog:interests:${query.page}:${query.limit}:${query.search ?? ""}:${query.domain ?? ""}`;

  return getOrSetCache(cacheKey, CATALOG_CACHE_TTL_SECONDS, async () => {
    const conditions = [];
    if (query.search) {
      conditions.push(ilike(interests.name, `%${query.search}%`));
    }
    if (query.domain) {
      conditions.push(eq(interests.domain, query.domain));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [countRow] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(interests)
      .where(whereClause);

    const items = await db
      .select({
        interestId: interests.interestId,
        name: interests.name,
        domain: interests.domain,
        followerCount: sql<number>`count(${userInterests.userId})::int`,
      })
      .from(interests)
      .leftJoin(
        userInterests,
        eq(interests.interestId, userInterests.interestId)
      )
      .where(whereClause)
      .groupBy(interests.interestId, interests.name, interests.domain)
      .orderBy(desc(sql`count(${userInterests.userId})`), asc(interests.name))
      .limit(query.limit)
      .offset(offset);

    return {
      items,
      meta: buildPaginationMeta(query.page, query.limit, countRow?.total ?? 0),
    };
  });
}

/** Lists canonical roles with total open project positions (R09), cached via Redis. */
export async function listRoles(query: {
  page: number;
  limit: number;
  search?: string;
}) {
  const cacheKey = `catalog:roles:${query.page}:${query.limit}:${query.search ?? ""}`;

  return getOrSetCache(cacheKey, CATALOG_CACHE_TTL_SECONDS, async () => {
    const whereClause = query.search
      ? ilike(roles.name, `%${query.search}%`)
      : undefined;
    const offset = (query.page - 1) * query.limit;

    const [countRow] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(roles)
      .where(whereClause);

    const items = await db
      .select({
        roleId: roles.roleId,
        name: roles.name,
        description: roles.description,
        totalOpenings: sql<number>`coalesce(sum(${projectRoles.openPositions}), 0)::int`,
      })
      .from(roles)
      .leftJoin(projectRoles, eq(roles.roleId, projectRoles.roleId))
      .where(whereClause)
      .groupBy(roles.roleId, roles.name, roles.description)
      .orderBy(
        desc(sql`coalesce(sum(${projectRoles.openPositions}), 0)`),
        asc(roles.name)
      )
      .limit(query.limit)
      .offset(offset);

    return {
      items,
      meta: buildPaginationMeta(query.page, query.limit, countRow?.total ?? 0),
    };
  });
}

export async function createSkill(input: { name: string; category: string }) {
  const [created] = await db.insert(skills).values(input).returning();
  await invalidateCachePrefix("catalog:skills:");
  return created!;
}

export async function createInterest(input: { name: string; domain: string }) {
  const [created] = await db.insert(interests).values(input).returning();
  await invalidateCachePrefix("catalog:interests:");
  return created!;
}

export async function createRole(input: {
  name: string;
  description?: string;
}) {
  const [created] = await db
    .insert(roles)
    .values({ name: input.name, description: input.description ?? null })
    .returning();
  await invalidateCachePrefix("catalog:roles:");
  return created!;
}
