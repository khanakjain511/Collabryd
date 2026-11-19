import type { Request, Response } from "express";
import {
  getValidatedParams,
  getValidatedQuery,
  sendCreated,
  sendSuccess,
} from "../../common/index.js";
import * as projectsService from "./projects.service.js";

export async function createProjectHandler(req: Request, res: Response) {
  const project = await projectsService.createProject(
    req.user!.userId,
    req.body
  );
  sendCreated(res, project);
}

export async function listProjectsHandler(req: Request, res: Response) {
  const query = getValidatedQuery<Parameters<typeof projectsService.listProjects>[0]>(req);
  const { items, meta } = await projectsService.listProjects(query, req.user);
  sendSuccess(res, items, { pagination: meta });
}

export async function getProjectHandler(req: Request, res: Response) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const project = await projectsService.getProjectById(projectId, req.user);
  sendSuccess(res, project);
}

export async function updateProjectHandler(req: Request, res: Response) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const updated = await projectsService.updateProject(
    projectId,
    req.user!,
    req.body
  );
  sendSuccess(res, updated);
}

export async function updateProjectStatusHandler(req: Request, res: Response) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const updated = await projectsService.updateProjectStatus(
    projectId,
    req.user!,
    req.body.status
  );
  sendSuccess(res, updated);
}

export async function deleteProjectHandler(req: Request, res: Response) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  await projectsService.deleteProject(projectId, req.user!);
  sendSuccess(res, { message: "Project deleted successfully" });
}

export async function replaceProjectSkillsHandler(req: Request, res: Response) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const skills = await projectsService.replaceProjectSkills(
    projectId,
    req.user!,
    req.body.skills
  );
  sendSuccess(res, skills);
}

export async function removeProjectSkillHandler(req: Request, res: Response) {
  const { projectId, skillId } = getValidatedParams<{
    projectId: number;
    skillId: number;
  }>(req);
  await projectsService.removeProjectSkill(projectId, skillId, req.user!);
  sendSuccess(res, { message: "Skill removed from project" });
}

export async function replaceProjectRolesHandler(req: Request, res: Response) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const roles = await projectsService.replaceProjectRoles(
    projectId,
    req.user!,
    req.body.roles
  );
  sendSuccess(res, roles);
}

export async function removeProjectRoleHandler(req: Request, res: Response) {
  const { projectId, roleId } = getValidatedParams<{
    projectId: number;
    roleId: number;
  }>(req);
  await projectsService.removeProjectRole(projectId, roleId, req.user!);
  sendSuccess(res, { message: "Role removed from project" });
}

export async function getProjectCapacityHandler(req: Request, res: Response) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const capacity = await projectsService.getProjectCapacity(projectId);
  sendSuccess(res, capacity);
}

export async function recommendCandidatesHandler(req: Request, res: Response) {
  const { projectId } = getValidatedParams<{ projectId: number }>(req);
  const { limit } = getValidatedQuery<{ limit: number }>(req);
  const candidates = await projectsService.recommendCandidatesForProject(
    projectId,
    req.user!,
    limit
  );
  sendSuccess(res, candidates);
}

export async function recommendProjectsHandler(req: Request, res: Response) {
  const { limit } = getValidatedQuery<{ limit: number }>(req);
  const recommended = await projectsService.recommendProjectsForStudent(
    req.user!,
    limit
  );
  sendSuccess(res, recommended);
}
