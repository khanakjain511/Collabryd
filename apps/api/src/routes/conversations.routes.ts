import { Router } from "express";
import {
  requireAuth,
  requireConversationMember,
  validate,
} from "../middlewares/index.js";
import * as controller from "../controllers/conversations.controller.js";
import {
  conversationIdParamsSchema,
  createDirectConversationSchema,
  listMessagesQuerySchema,
  markConversationReadSchema,
  projectIdParamsSchema,
  sendMessageSchema,
} from "../schemas/conversations.schemas.js";

const conversationsRouter: Router = Router();

// All conversation routes require an authenticated user
conversationsRouter.use(requireAuth);

/**
 * List all conversations where the logged-in user is an active participant
 */
conversationsRouter.get("/", controller.listConversationsHandler);

/**
 * Initiate or retrieve an existing 1-on-1 direct message conversation (idempotent via advisory lock)
 */
conversationsRouter.post(
  "/direct",
  validate({ body: createDirectConversationSchema }),
  controller.createDirectConversationHandler
);

/**
 * Retrieve the group conversation corresponding to a project team
 */
conversationsRouter.get(
  "/project/:projectId",
  validate({ params: projectIdParamsSchema }),
  controller.getProjectConversationHandler
);

/**
 * Paginate message history for a conversation using keyset cursor pagination
 * Protected by requireConversationMember middleware
 */
conversationsRouter.get(
  "/:conversationId/messages",
  validate({
    params: conversationIdParamsSchema,
    query: listMessagesQuerySchema,
  }),
  requireConversationMember,
  controller.listMessagesHandler
);

/**
 * Send a message into a conversation (sequentially sequenced via row locking)
 * Protected by requireConversationMember middleware
 */
conversationsRouter.post(
  "/:conversationId/messages",
  validate({
    params: conversationIdParamsSchema,
    body: sendMessageSchema,
  }),
  requireConversationMember,
  controller.sendMessageHandler
);

/**
 * Update the caller's read cursor (last_read_message_id) for unread counts
 * Protected by requireConversationMember middleware
 */
conversationsRouter.patch(
  "/:conversationId/read",
  validate({
    params: conversationIdParamsSchema,
    body: markConversationReadSchema,
  }),
  requireConversationMember,
  controller.markReadHandler
);

export default conversationsRouter;
