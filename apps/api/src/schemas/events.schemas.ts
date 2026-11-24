import { z } from "zod";

export const listEventsQuerySchema = z.object({
  category: z.string().optional(),
  publication: z.enum(["Draft", "Published", "Archived"]).optional(),
  mode: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const createEventSchema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9_-]+$/, "Slug must be lowercase alphanumeric with hyphens or underscores").optional(),
  name: z.string().min(2).max(160),
  category: z.string().min(2).max(80).default("Hackathon"),
  description: z.string().min(10),
  eventDate: z.string().min(4).max(50),
  deadline: z.string().min(4).max(50),
  mode: z.string().max(50).default("Hybrid"),
  color: z.string().max(50).default("sand"),
  symbol: z.string().max(50).default("✳"),
  publication: z.enum(["Draft", "Published", "Archived"]).default("Published"),
  organizer: z.string().max(160).optional(),
  eligibility: z.string().optional(),
  rules: z.string().optional(),
  officialUrl: z.string().url().max(500).optional().or(z.literal("")),
  sourceUrl: z.string().url().max(500).optional().or(z.literal("")),
});

export const updateEventSchema = createEventSchema.partial();

export const updateEventPublicationSchema = z.object({
  publication: z.enum(["Draft", "Published", "Archived"]),
});

export const eventSlugParamsSchema = z.object({
  slug: z.string().min(1),
});
