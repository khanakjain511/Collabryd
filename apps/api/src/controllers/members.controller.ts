import type { Request, Response } from "express";
import { getValidatedParams } from "../middlewares/index.js";
import { sendSuccess } from "../views/index.js";
import * as membersService from "../services/members.service.js";

export async function listMembersHandler(req: Request, res: Response) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const members = await membersService.listProjectMembers(projectId, req.user);
  sendSuccess(res, members);
}

export async function updateMemberRoleHandler(req: Request, res: Response) {
  const { projectId, userId } = getValidatedParams<{
    projectId: number;
    userId: number;
  }>(req);
  const updated = await membersService.updateMemberRole(
    projectId,
    userId,
    req.body.role,
    req.user!
  );
  sendSuccess(res, updated);
}

export async function removeMemberHandler(req: Request, res: Response) {
  const { projectId, userId } = getValidatedParams<{
    projectId: number;
    userId: number;
  }>(req);
  await membersService.removeProjectMember(projectId, userId, req.user!);
  sendSuccess(res, { message: "Member removed from project" });
}
