import type { Request, Response } from "express";
import { getValidatedParams, getValidatedQuery } from "../middlewares/index.js";
import { sendSuccess } from "../views/index.js";
import * as adminService from "../services/admin.service.js";

export async function getMetricsHandler(_req: Request, res: Response) {
  const metrics = await adminService.getPlatformMetrics();
  sendSuccess(res, metrics);
}

export async function listAuditLogsHandler(req: Request, res: Response) {
  const query = getValidatedQuery<Parameters<typeof adminService.listAuditLogs>[0]>(req);
  const { items, meta } = await adminService.listAuditLogs(query);
  sendSuccess(res, items, { pagination: meta });
}

export async function suspendUserHandler(req: Request, res: Response) {
  const { userId } = getValidatedParams<{ userId: number }>(req);
  const user = await adminService.suspendUserAccount(
    req.user!.userId,
    userId,
    req.body?.reason
  );
  sendSuccess(res, user);
}

export async function activateUserHandler(req: Request, res: Response) {
  const { userId } = getValidatedParams<{ userId: number }>(req);
  const user = await adminService.activateUserAccount(
    req.user!.userId,
    userId,
    req.body?.reason
  );
  sendSuccess(res, user);
}

export async function moderateProjectHandler(req: Request, res: Response) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const project = await adminService.moderateProject(
    req.user!.userId,
    projectId,
    req.body
  );
  sendSuccess(res, project);
}

export async function overrideRoleHandler(req: Request, res: Response) {
  const { projectId, userId } = getValidatedParams<{
    projectId: number;
    userId: number;
  }>(req);
  const member = await adminService.overrideProjectMemberRole(
    req.user!.userId,
    projectId,
    userId,
    req.body
  );
  sendSuccess(res, member);
}
