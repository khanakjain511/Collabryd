import type { Request, Response } from "express";
import {
  getValidatedParams,
  getValidatedQuery,
  sendCreated,
  sendSuccess,
} from "../../common/index.js";
import * as profilesService from "./profiles.service.js";

export async function getOwnProfileHandler(req: Request, res: Response) {
  const profile = await profilesService.getOwnFullProfile(req.user!.userId);
  sendSuccess(res, profile);
}

export async function upsertOwnProfileHandler(req: Request, res: Response) {
  const profile = await profilesService.upsertOwnProfile(
    req.user!.userId,
    req.body
  );
  sendSuccess(res, profile);
}

export async function upsertSkillHandler(req: Request, res: Response) {
  const skill = await profilesService.upsertUserSkill(
    req.user!.userId,
    req.body
  );
  sendCreated(res, skill);
}

export async function replaceSkillsHandler(req: Request, res: Response) {
  const skills = await profilesService.replaceUserSkills(
    req.user!.userId,
    req.body.skills
  );
  sendSuccess(res, skills);
}

export async function removeSkillHandler(req: Request, res: Response) {
  const { skillId } = getValidatedParams<{ skillId: number }>(req);
  await profilesService.removeUserSkill(req.user!.userId, skillId);
  sendSuccess(res, { message: "Skill removed from profile" });
}

export async function replaceInterestsHandler(req: Request, res: Response) {
  const interests = await profilesService.replaceUserInterests(
    req.user!.userId,
    req.body.ids
  );
  sendSuccess(res, interests);
}

export async function replacePreferredRolesHandler(req: Request, res: Response) {
  const preferredRoles = await profilesService.replaceUserPreferredRoles(
    req.user!.userId,
    req.body.ids
  );
  sendSuccess(res, preferredRoles);
}

export async function addAchievementHandler(req: Request, res: Response) {
  const item = await profilesService.addAchievement(req.user!.userId, req.body);
  sendCreated(res, item);
}

export async function updateAchievementHandler(req: Request, res: Response) {
  const { achievementId } = getValidatedParams<{ achievementId: number }>(req);
  const item = await profilesService.updateAchievement(
    req.user!.userId,
    achievementId,
    req.body
  );
  sendSuccess(res, item);
}

export async function deleteAchievementHandler(req: Request, res: Response) {
  const { achievementId } = getValidatedParams<{ achievementId: number }>(req);
  await profilesService.deleteAchievement(req.user!.userId, achievementId);
  sendSuccess(res, { message: "Achievement deleted" });
}

export async function addSocialLinkHandler(req: Request, res: Response) {
  const item = await profilesService.addSocialLink(req.user!.userId, req.body);
  sendCreated(res, item);
}

export async function updateSocialLinkHandler(req: Request, res: Response) {
  const { linkId } = getValidatedParams<{ linkId: number }>(req);
  const item = await profilesService.updateSocialLink(
    req.user!.userId,
    linkId,
    req.body
  );
  sendSuccess(res, item);
}

export async function deleteSocialLinkHandler(req: Request, res: Response) {
  const { linkId } = getValidatedParams<{ linkId: number }>(req);
  await profilesService.deleteSocialLink(req.user!.userId, linkId);
  sendSuccess(res, { message: "Social link deleted" });
}

export async function discoverStudentsHandler(req: Request, res: Response) {
  const query = getValidatedQuery<Parameters<typeof profilesService.discoverStudents>[0]>(req);
  const { items, meta } = await profilesService.discoverStudents(
    query,
    req.user
  );
  sendSuccess(res, items, { pagination: meta });
}

export async function getStudentProfileHandler(req: Request, res: Response) {
  const { userId } = getValidatedParams<{ userId: number }>(req);
  const profile = await profilesService.getStudentProfileById(userId, req.user);
  sendSuccess(res, profile);
}
