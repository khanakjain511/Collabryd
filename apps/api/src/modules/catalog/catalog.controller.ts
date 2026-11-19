import type { Request, Response } from "express";
import {
  getValidatedQuery,
  sendCreated,
  sendSuccess,
} from "../../common/index.js";
import * as catalogService from "./catalog.service.js";

export async function listSkillsHandler(req: Request, res: Response) {
  const query = getValidatedQuery<Parameters<typeof catalogService.listSkills>[0]>(req);
  const { items, meta } = await catalogService.listSkills(query);
  sendSuccess(res, items, { pagination: meta });
}

export async function listInterestsHandler(req: Request, res: Response) {
  const query = getValidatedQuery<Parameters<typeof catalogService.listInterests>[0]>(req);
  const { items, meta } = await catalogService.listInterests(query);
  sendSuccess(res, items, { pagination: meta });
}

export async function listRolesHandler(req: Request, res: Response) {
  const query = getValidatedQuery<Parameters<typeof catalogService.listRoles>[0]>(req);
  const { items, meta } = await catalogService.listRoles(query);
  sendSuccess(res, items, { pagination: meta });
}

export async function createSkillHandler(req: Request, res: Response) {
  const skill = await catalogService.createSkill(req.body);
  sendCreated(res, skill);
}

export async function createInterestHandler(req: Request, res: Response) {
  const interest = await catalogService.createInterest(req.body);
  sendCreated(res, interest);
}

export async function createRoleHandler(req: Request, res: Response) {
  const role = await catalogService.createRole(req.body);
  sendCreated(res, role);
}
