import { and, asc, desc, eq, gt, inArray, lt, ne, sql } from "drizzle-orm";
import {
  conversationMembers,
  conversations,
  db,
  messages,
  projectMembers,
  projects,
  userProfiles,
  users,
} from "../models/index.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../errors/app-error.js";
import { dispatchNotifications } from "./notifications.dispatcher.js";

export async function listUserConversations(userId: number) {
  // Implements R20: student conversation inbox with unread counts
  const inboxRows = await db
    .select({
      conversationId: conversations.conversationId,
      type: conversations.type,
      projectId: conversations.projectId,
      projectTitle: projects.title,
      lastReadSequence: conversationMembers.lastReadSequence,
      latestSequence: sql<number>`coalesce(max(${messages.sequenceNumber}), 0)::int`,
      unreadMessagesCount: sql<number>`greatest(coalesce(max(${messages.sequenceNumber}), 0) - ${conversationMembers.lastReadSequence}, 0)::int`,
      createdAt: conversations.createdAt,
    })
    .from(conversationMembers)
    .innerJoin(
      conversations,
      eq(conversationMembers.conversationId, conversations.conversationId)
    )
    .leftJoin(projects, eq(conversations.projectId, projects.projectId))
    .leftJoin(messages, eq(conversations.conversationId, messages.conversationId))
    .where(eq(conversationMembers.userId, userId))
    .groupBy(
      conversations.conversationId,
      conversations.type,
      conversations.projectId,
      projects.title,
      conversationMembers.lastReadSequence,
      conversations.createdAt
    )
    .orderBy(
      desc(sql`coalesce(max(${messages.sequenceNumber}), 0)`),
      desc(conversations.createdAt)
    );

  const convIds = inboxRows.map((r) => r.conversationId);
  const participantsMap = new Map<
    number,
    Array<{ userId: number; displayName: string; avatarUrl: string | null }>
  >();

  if (convIds.length > 0) {
    const memberRows = await db
      .select({
        conversationId: conversationMembers.conversationId,
        userId: conversationMembers.userId,
        displayName: userProfiles.displayName,
        avatarUrl: userProfiles.avatarUrl,
      })
      .from(conversationMembers)
      .innerJoin(
        userProfiles,
        eq(conversationMembers.userId, userProfiles.userId)
      )
      .where(inArray(conversationMembers.conversationId, convIds));

    for (const m of memberRows) {
      const list = participantsMap.get(m.conversationId) ?? [];
      list.push({
        userId: m.userId,
        displayName: m.displayName,
        avatarUrl: m.avatarUrl,
      });
      participantsMap.set(m.conversationId, list);
    }
  }

  return inboxRows.map((row) => ({
    ...row,
    participants: participantsMap.get(row.conversationId) ?? [],
  }));
}

export async function createOrGetDirectConversation(
  userId: number,
  recipientId: number
) {
  if (userId === recipientId) {
    throw new BadRequestError(
      "Cannot start a direct conversation with yourself",
      "SELF_CONVERSATION_NOT_ALLOWED"
    );
  }

  const [recipient] = await db
    .select({
      userId: users.userId,
      accountStatus: users.accountStatus,
    })
    .from(users)
    .where(eq(users.userId, recipientId))
    .limit(1);

  if (!recipient || recipient.accountStatus !== "ACTIVE") {
    throw new NotFoundError("Recipient user not found", "RECIPIENT_NOT_FOUND");
  }

  const [lowId, highId] =
    userId < recipientId ? [userId, recipientId] : [recipientId, userId];
  const lockKey = `collabryd:dm:${lowId}:${highId}`;

  return db.transaction(async (tx) => {
    // Transaction-scoped advisory lock prevents concurrent duplicate DIRECT chats
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`);

    // Implements R21: lookup existing DIRECT conversation between the two users
    const existingResult = await tx.execute<{ conversation_id: string | number }>(
      sql`
        SELECT c.conversation_id
        FROM collabryd.conversations c
        JOIN collabryd.conversation_members cm1 ON c.conversation_id = cm1.conversation_id
        JOIN collabryd.conversation_members cm2 ON c.conversation_id = cm2.conversation_id
        WHERE c.type = 'DIRECT'
          AND cm1.user_id = ${lowId}
          AND cm2.user_id = ${highId}
        LIMIT 1
      `
    );

    const existingId = existingResult.rows[0]?.conversation_id;
    if (existingId !== undefined) {
      const [conv] = await tx
        .select()
        .from(conversations)
        .where(eq(conversations.conversationId, Number(existingId)))
        .limit(1);
      return { conversation: conv!, created: false };
    }

    const [created] = await tx
      .insert(conversations)
      .values({ type: "DIRECT", projectId: null })
      .returning();

    await tx.insert(conversationMembers).values([
      { conversationId: created!.conversationId, userId: lowId },
      { conversationId: created!.conversationId, userId: highId },
    ]);

    return { conversation: created!, created: true };
  });
}

export async function getProjectConversation(
  projectId: number,
  userId: number
) {
  const [membership] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    )
    .limit(1);

  if (!membership) {
    throw new ForbiddenError(
      "Only project members can access the project group conversation",
      "NOT_PROJECT_MEMBER"
    );
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.projectId, projectId))
    .limit(1);

  if (!conv) {
    throw new NotFoundError(
      "Project group conversation not found",
      "CONVERSATION_NOT_FOUND"
    );
  }

  const participants = await db
    .select({
      userId: conversationMembers.userId,
      displayName: userProfiles.displayName,
      avatarUrl: userProfiles.avatarUrl,
      lastReadSequence: conversationMembers.lastReadSequence,
      joinedAt: conversationMembers.joinedAt,
    })
    .from(conversationMembers)
    .innerJoin(
      userProfiles,
      eq(conversationMembers.userId, userProfiles.userId)
    )
    .where(eq(conversationMembers.conversationId, conv.conversationId));

  return { ...conv, participants };
}

export async function assertConversationMember(
  conversationId: number,
  userId: number
): Promise<void> {
  const [member] = await db
    .select({ userId: conversationMembers.userId })
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, userId)
      )
    )
    .limit(1);

  if (!member) {
    throw new ForbiddenError(
      "You are not a participant in this conversation",
      "NOT_CONVERSATION_MEMBER"
    );
  }
}

export async function listConversationMessages(
  conversationId: number,
  userId: number,
  query: {
    afterSequence?: number;
    beforeSequence?: number;
    limit: number;
  }
) {
  await assertConversationMember(conversationId, userId);

  const conditions = [eq(messages.conversationId, conversationId)];

  if (query.afterSequence !== undefined) {
    // Implements R22: forward cursor pagination
    conditions.push(gt(messages.sequenceNumber, query.afterSequence));
    const items = await db
      .select({
        messageId: messages.messageId,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        senderName: userProfiles.displayName,
        senderAvatarUrl: userProfiles.avatarUrl,
        clientMessageId: messages.clientMessageId,
        sequenceNumber: messages.sequenceNumber,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .innerJoin(userProfiles, eq(messages.senderId, userProfiles.userId))
      .where(and(...conditions))
      .orderBy(asc(messages.sequenceNumber))
      .limit(query.limit);

    return {
      items,
      nextAfterSequence:
        items.length > 0 ? items[items.length - 1]!.sequenceNumber : null,
    };
  }

  if (query.beforeSequence !== undefined) {
    conditions.push(lt(messages.sequenceNumber, query.beforeSequence));
  }

  // Fetch latest page descending then return in chronological order
  const descItems = await db
    .select({
      messageId: messages.messageId,
      conversationId: messages.conversationId,
      senderId: messages.senderId,
      senderName: userProfiles.displayName,
      senderAvatarUrl: userProfiles.avatarUrl,
      clientMessageId: messages.clientMessageId,
      sequenceNumber: messages.sequenceNumber,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(userProfiles, eq(messages.senderId, userProfiles.userId))
    .where(and(...conditions))
    .orderBy(desc(messages.sequenceNumber))
    .limit(query.limit);

  const items = descItems.reverse();
  return {
    items,
    nextBeforeSequence: items.length > 0 ? items[0]!.sequenceNumber : null,
    nextAfterSequence:
      items.length > 0 ? items[items.length - 1]!.sequenceNumber : null,
  };
}

export async function sendMessage(
  conversationId: number,
  senderId: number,
  input: { clientMessageId: string; content: string }
) {
  const result = await db.transaction(async (tx) => {
    const [membership] = await tx
      .select({ userId: conversationMembers.userId })
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, senderId)
        )
      )
      .for("update")
      .limit(1);

    if (!membership) {
      throw new ForbiddenError(
        "You are not a participant in this conversation",
        "NOT_CONVERSATION_MEMBER"
      );
    }

    // Lock conversation row to guarantee strictly monotonic, race-free sequence_number
    const [conv] = await tx
      .select()
      .from(conversations)
      .where(eq(conversations.conversationId, conversationId))
      .for("update")
      .limit(1);

    if (!conv) {
      throw new NotFoundError("Conversation not found", "CONVERSATION_NOT_FOUND");
    }

    // Idempotent retry check via (conversation_id, client_message_id)
    const [existing] = await tx
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.clientMessageId, input.clientMessageId)
        )
      )
      .limit(1);

    if (existing) {
      if (existing.senderId !== senderId || existing.content !== input.content) {
        throw new ConflictError("Client message ID already used for a different message", "DUPLICATE_CLIENT_MESSAGE_ID");
      }
      return { message: existing, deduplicated: true, senderName: null };
    }

    const [maxSeqRow] = await tx
      .select({
        maxSeq: sql<number>`coalesce(max(${messages.sequenceNumber}), 0)::int`,
      })
      .from(messages)
      .where(eq(messages.conversationId, conversationId));

    const nextSeq = (maxSeqRow?.maxSeq ?? 0) + 1;

    // W09: insert sequenced message
    const [inserted] = await tx
      .insert(messages)
      .values({
        conversationId,
        senderId,
        clientMessageId: input.clientMessageId,
        sequenceNumber: nextSeq,
        content: input.content,
      })
      .returning();

    // Advance sender's own read cursor
    await tx
      .update(conversationMembers)
      .set({
        lastReadSequence: sql`GREATEST(${conversationMembers.lastReadSequence}, ${nextSeq})`,
      })
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, senderId)
        )
      );

    // PostgreSQL publishes this wake-up only after commit, including on other API instances.
    await tx.execute(sql`SELECT pg_notify('collabryd_chat', ${String(conversationId)})`);

    // Notify other participants
    const [senderProfile] = await tx
      .select({ displayName: userProfiles.displayName })
      .from(userProfiles)
      .where(eq(userProfiles.userId, senderId))
      .limit(1);

    const otherMembers = await tx
      .select({ userId: conversationMembers.userId })
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          ne(conversationMembers.userId, senderId)
        )
      );

    const preview =
      input.content.length > 80
        ? `${input.content.slice(0, 77)}...`
        : input.content;

    await dispatchNotifications(
      otherMembers.map((m) => ({
        recipientId: m.userId,
        type: "NEW_MESSAGE",
        resourceType: "CONVERSATION",
        resourceId: conversationId,
        message: `${senderProfile?.displayName ?? "Someone"}: ${preview}`,
      })),
      tx
    );

    return {
      message: inserted!,
      deduplicated: false,
      senderName: senderProfile?.displayName ?? null,
    };
  });

  return {
    message: result.message,
    deduplicated: result.deduplicated,
  };
}

export async function markConversationRead(
  conversationId: number,
  userId: number,
  requestedSequence?: number
) {
  await assertConversationMember(conversationId, userId);

  const [maxSeqRow] = await db
    .select({
      maxSeq: sql<number>`coalesce(max(${messages.sequenceNumber}), 0)::int`,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId));

  const latestSeq = maxSeqRow?.maxSeq ?? 0;
  const targetSeq =
    requestedSequence !== undefined
      ? Math.min(requestedSequence, latestSeq)
      : latestSeq;

  const member = and(eq(conversationMembers.conversationId, conversationId),
    eq(conversationMembers.userId, userId));
  return db.transaction(async (tx) => {
    const [updated] = await tx.update(conversationMembers)
      .set({ lastReadSequence: targetSeq })
      .where(and(member, lt(conversationMembers.lastReadSequence, targetSeq)))
      .returning();
    if (updated) {
      await tx.execute(sql`SELECT pg_notify('collabryd_chat', ${`read:${userId}`})`);
      return updated;
    }
    const [current] = await tx.select().from(conversationMembers).where(member).limit(1);
    if (!current) throw new ForbiddenError("Conversation membership ended", "NOT_CONVERSATION_MEMBER");
    return current;
  });
}
