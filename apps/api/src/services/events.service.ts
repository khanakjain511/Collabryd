import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@collabryd/database";
import { events, type Event, type NewEvent } from "../models/events.model.js";
import { ConflictError, NotFoundError } from "../errors/app-error.js";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listEvents(filters: {
  category?: string;
  publication?: "Draft" | "Published" | "Archived";
  mode?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (filters.publication) {
    conditions.push(eq(events.publication, filters.publication));
  }
  if (filters.category) {
    conditions.push(eq(events.category, filters.category));
  }
  if (filters.mode) {
    conditions.push(eq(events.mode, filters.mode));
  }
  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(or(ilike(events.name, term), ilike(events.description, term)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, totalRow] = await Promise.all([
    db
      .select()
      .from(events)
      .where(whereClause)
      .orderBy(events.eventDate)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(whereClause),
  ]);

  const total = totalRow[0]?.count ?? 0;

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEventBySlug(slug: string): Promise<Event> {
  const [event] = await db
    .select()
    .from(events)
    .where(or(eq(events.slug, slug), eq(sql`${events.eventId}::text`, slug)))
    .limit(1);

  if (!event) {
    throw new NotFoundError("Event listing not found", "EVENT_NOT_FOUND");
  }

  return event;
}

export async function createEvent(
  userId: number | undefined,
  input: {
    slug?: string;
    name: string;
    category?: string;
    description: string;
    eventDate: string;
    deadline: string;
    mode?: string;
    color?: string;
    symbol?: string;
    publication?: "Draft" | "Published" | "Archived";
    organizer?: string;
    eligibility?: string;
    rules?: string;
    officialUrl?: string;
    sourceUrl?: string;
  }
): Promise<Event> {
  const slug = input.slug?.trim() || slugify(input.name);

  // Check unique slug
  const [existing] = await db
    .select({ eventId: events.eventId })
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1);

  if (existing) {
    throw new ConflictError("An event with this slug or title already exists", "DUPLICATE_EVENT_SLUG");
  }

  const [created] = await db
    .insert(events)
    .values({
      slug,
      name: input.name.trim(),
      category: input.category?.trim() || "Hackathon",
      description: input.description.trim(),
      eventDate: input.eventDate.trim(),
      deadline: input.deadline.trim(),
      mode: input.mode?.trim() || "Hybrid",
      color: input.color?.trim() || "sand",
      symbol: input.symbol?.trim() || "✳",
      publication: input.publication || "Published",
      organizer: input.organizer?.trim() || "Campus Event Organizers",
      eligibility: input.eligibility?.trim() || "Open to all registered campus students.",
      rules: input.rules?.trim(),
      officialUrl: input.officialUrl?.trim() || null,
      sourceUrl: input.sourceUrl?.trim() || null,
      createdBy: userId,
    })
    .returning();

  return created!;
}

export async function updateEvent(
  slugOrId: string,
  input: Partial<{
    name: string;
    category: string;
    description: string;
    eventDate: string;
    deadline: string;
    mode: string;
    color: string;
    symbol: string;
    publication: "Draft" | "Published" | "Archived";
    organizer: string;
    eligibility: string;
    rules: string;
    officialUrl: string;
    sourceUrl: string;
  }>
): Promise<Event> {
  const existing = await getEventBySlug(slugOrId);

  const [updated] = await db
    .update(events)
    .set({
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.category ? { category: input.category.trim() } : {}),
      ...(input.description ? { description: input.description.trim() } : {}),
      ...(input.eventDate ? { eventDate: input.eventDate.trim() } : {}),
      ...(input.deadline ? { deadline: input.deadline.trim() } : {}),
      ...(input.mode ? { mode: input.mode.trim() } : {}),
      ...(input.color ? { color: input.color.trim() } : {}),
      ...(input.symbol ? { symbol: input.symbol.trim() } : {}),
      ...(input.publication ? { publication: input.publication } : {}),
      ...(input.organizer !== undefined ? { organizer: input.organizer.trim() } : {}),
      ...(input.eligibility !== undefined ? { eligibility: input.eligibility.trim() } : {}),
      ...(input.rules !== undefined ? { rules: input.rules.trim() } : {}),
      ...(input.officialUrl !== undefined ? { officialUrl: input.officialUrl.trim() || null } : {}),
      ...(input.sourceUrl !== undefined ? { sourceUrl: input.sourceUrl.trim() || null } : {}),
      updatedAt: new Date(),
    })
    .where(eq(events.eventId, existing.eventId))
    .returning();

  return updated!;
}

export async function setEventPublication(
  slugOrId: string,
  publication: "Draft" | "Published" | "Archived"
): Promise<Event> {
  const existing = await getEventBySlug(slugOrId);

  const [updated] = await db
    .update(events)
    .set({
      publication,
      updatedAt: new Date(),
    })
    .where(eq(events.eventId, existing.eventId))
    .returning();

  return updated!;
}

export async function deleteEvent(slugOrId: string): Promise<void> {
  const existing = await getEventBySlug(slugOrId);
  await db.delete(events).where(eq(events.eventId, existing.eventId));
}
