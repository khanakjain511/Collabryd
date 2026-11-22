import { z } from "zod";
import { positiveIntIdParam } from "../utils/pagination.js";

export const createDirectConversationSchema = z.object({
  recipientId: z.coerce.number().int().positive(),
});

export const conversationIdParamsSchema = z.object({
  conversationId: positiveIntIdParam,
});

export const projectIdParamsSchema = z.object({
  projectId: positiveIntIdParam,
});

export const listMessagesQuerySchema = z.object({
  afterSequence: z.coerce.number().int().min(0).optional(),
  beforeSequence: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const sendMessageSchema = z.object({
  clientMessageId: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(4000),
});

export const markConversationReadSchema = z.object({
  lastReadSequence: z.coerce.number().int().min(0).optional(),
});
