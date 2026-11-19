import type { Request, Response } from "express";
import {
  getValidatedParams,
  getValidatedQuery,
  sendCreated,
  sendSuccess,
} from "../../common/index.js";
import * as conversationsService from "./conversations.service.js";

export async function listConversationsHandler(req: Request, res: Response) {
  const items = await conversationsService.listUserConversations(
    req.user!.userId
  );
  sendSuccess(res, items);
}

export async function createDirectConversationHandler(
  req: Request,
  res: Response
) {
  const { conversation, created } =
    await conversationsService.createOrGetDirectConversation(
      req.user!.userId,
      req.body.recipientId
    );
  if (created) {
    sendCreated(res, conversation);
  } else {
    sendSuccess(res, conversation);
  }
}

export async function getProjectConversationHandler(
  req: Request,
  res: Response
) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const conversation = await conversationsService.getProjectConversation(
    projectId,
    req.user!.userId
  );
  sendSuccess(res, conversation);
}

export async function listMessagesHandler(req: Request, res: Response) {
  const { conversationId } = getValidatedParams<{ conversationId: number }>(req);
  const query = getValidatedQuery<
    Parameters<typeof conversationsService.listConversationMessages>[2]
  >(req);
  const result = await conversationsService.listConversationMessages(
    conversationId,
    req.user!.userId,
    query
  );
  sendSuccess(res, result.items, {
    cursor: {
      nextAfterSequence: result.nextAfterSequence,
      ...("nextBeforeSequence" in result
        ? { nextBeforeSequence: result.nextBeforeSequence }
        : {}),
    },
  });
}

export async function sendMessageHandler(req: Request, res: Response) {
  const { conversationId } = getValidatedParams<{ conversationId: number }>(req);
  const { message, deduplicated } = await conversationsService.sendMessage(
    conversationId,
    req.user!.userId,
    req.body
  );
  if (deduplicated) {
    sendSuccess(res, message, { deduplicated: true });
  } else {
    sendCreated(res, message);
  }
}

export async function markReadHandler(req: Request, res: Response) {
  const { conversationId } = getValidatedParams<{ conversationId: number }>(req);
  const updated = await conversationsService.markConversationRead(
    conversationId,
    req.user!.userId,
    req.body?.lastReadSequence
  );
  sendSuccess(res, updated);
}
