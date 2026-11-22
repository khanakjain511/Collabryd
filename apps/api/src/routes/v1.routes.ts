import { Router } from "express";
import { openApiSpec } from "../docs/openapi.js";
import { renderDocsHtml } from "../views/docs.view.js";
import adminRouter from "./admin.routes.js";
import {
  applicationsRouter,
  projectApplicationsRouter,
} from "./applications.routes.js";
import authRouter from "./auth.routes.js";
import catalogRouter from "./catalog.routes.js";
import conversationsRouter from "./conversations.routes.js";
import projectMembersRouter from "./members.routes.js";
import notificationsRouter from "./notifications.routes.js";
import {
  profilesRouter,
  studentsRouter,
} from "./profiles.routes.js";
import {
  projectsRouter,
  recommendationsRouter,
} from "./projects.routes.js";

const v1Router: Router = Router();

// OpenAPI 3.1 contract & lightweight HTML explorer
v1Router.get("/docs", (_req, res) => {
  res.type("html").send(renderDocsHtml());
});
v1Router.get("/docs/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

// Identity, sessions & taxonomy catalogs
v1Router.use("/auth", authRouter);
v1Router.use("/catalog", catalogRouter);

// Student profiles & campus talent discovery
v1Router.use("/profiles", profilesRouter);
v1Router.use("/students", studentsRouter);

// Projects, nested sub-resources, recruitment & recommendations
v1Router.use("/projects/:projectId/applications", projectApplicationsRouter);
v1Router.use("/projects/:projectId/members", projectMembersRouter);
v1Router.use("/projects", projectsRouter);
v1Router.use("/applications", applicationsRouter);
v1Router.use("/recommendations", recommendationsRouter);

// Messaging, notifications & platform administration
v1Router.use("/conversations", conversationsRouter);
v1Router.use("/notifications", notificationsRouter);
v1Router.use("/admin", adminRouter);

export default v1Router;
