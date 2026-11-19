import type { Request, Response } from "express";
import {
  getValidatedParams,
  getValidatedQuery,
  sendCreated,
  sendSuccess,
} from "../../common/index.js";
import * as applicationsService from "./applications.service.js";

export async function submitApplicationHandler(req: Request, res: Response) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const application = await applicationsService.submitApplication(
    projectId,
    req.user!,
    req.body
  );
  sendCreated(res, application);
}

export async function listProjectApplicationsHandler(
  req: Request,
  res: Response
) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const query = getValidatedQuery<
    Parameters<typeof applicationsService.listProjectApplications>[2]
  >(req);
  const { items, meta } = await applicationsService.listProjectApplications(
    projectId,
    req.user!,
    query
  );
  sendSuccess(res, items, { pagination: meta });
}

export async function listIncomingApplicationsHandler(
  req: Request,
  res: Response
) {
  const query = getValidatedQuery<
    Parameters<typeof applicationsService.listIncomingApplications>[1]
  >(req);
  const { items, meta } = await applicationsService.listIncomingApplications(
    req.user!.userId,
    query
  );
  sendSuccess(res, items, { pagination: meta });
}

export async function listMyApplicationsHandler(req: Request, res: Response) {
  const query = getValidatedQuery<
    Parameters<typeof applicationsService.listMyApplications>[1]
  >(req);
  const { items, meta } = await applicationsService.listMyApplications(
    req.user!.userId,
    query
  );
  sendSuccess(res, items, { pagination: meta });
}

export async function acceptApplicationHandler(req: Request, res: Response) {
  const { applicationId } = getValidatedParams<{ applicationId: number }>(req);
  const result = await applicationsService.acceptApplication(
    applicationId,
    req.user!
  );
  sendSuccess(res, result);
}

export async function rejectApplicationHandler(req: Request, res: Response) {
  const { applicationId } = getValidatedParams<{ applicationId: number }>(req);
  const result = await applicationsService.rejectApplication(
    applicationId,
    req.user!
  );
  sendSuccess(res, result);
}

export async function withdrawApplicationHandler(req: Request, res: Response) {
  const { applicationId } = getValidatedParams<{ applicationId: number }>(req);
  const result = await applicationsService.withdrawApplication(
    applicationId,
    req.user!.userId
  );
  sendSuccess(res, result);
}
