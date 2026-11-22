import type { NextFunction, Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { conversationMembers, db } from "@collabryd/database";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../errors/app-error.js";

/**
 * Middleware that guarantees the authenticated user is an active member of the conversation,
 * or a system-level ADMIN.
 * Expects `conversationId` in `req.params`.
 */
export async function requireConversationMember(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required", "AUTH_REQUIRED");
  }

  const conversationId = Number(req.params.conversationId);
  if (!conversationId || Number.isNaN(conversationId)) {
    throw new NotFoundError(
      "Invalid conversation ID parameter",
      "CONVERSATION_NOT_FOUND"
    );
  }

  if (req.user.systemRole === "ADMIN") {
    return next();
  }

  const [membership] = await db
    .select({ conversationId: conversationMembers.conversationId })
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, req.user.userId)
      )
    )
    .limit(1);

  if (!membership) {
    throw new ForbiddenError(
      "You are not a member of this conversation",
      "NOT_CONVERSATION_MEMBER"
    );
  }

  next();
}
