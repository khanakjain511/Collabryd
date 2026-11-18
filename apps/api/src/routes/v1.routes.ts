import { Router } from "express";
import { openApiSpec } from "../docs/openapi.js";
import { adminRouter } from "../modules/admin/index.js";
import {
  applicationsRouter,
  projectApplicationsRouter,
} from "../modules/applications/index.js";
import { authRouter } from "../modules/auth/index.js";
import { catalogRouter } from "../modules/catalog/index.js";
import { conversationsRouter } from "../modules/conversations/index.js";
import { projectMembersRouter } from "../modules/members/index.js";
import { notificationsRouter } from "../modules/notifications/index.js";
import {
  profilesRouter,
  studentsRouter,
} from "../modules/profiles/index.js";
import {
  projectsRouter,
  recommendationsRouter,
} from "../modules/projects/index.js";

const v1Router: Router = Router();

function renderDocsHtml(): string {
  const rows = Object.entries(openApiSpec.paths)
    .flatMap(([routePath, methods]) =>
      Object.entries(methods).map(([method, meta]) => {
        const summary = "summary" in meta ? String(meta.summary) : "";
        const tag = "tags" in meta && Array.isArray(meta.tags) ? meta.tags[0] : "";
        return `<tr><td><strong>${method.toUpperCase()}</strong></td><td><code>/api/v1${routePath}</code></td><td>${tag}</td><td>${summary}</td></tr>`;
      })
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${openApiSpec.info.title} — API Reference</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 1080px; margin: 2rem auto; padding: 0 1rem; color: #111827; }
    h1 { margin-bottom: 0.25rem; }
    p.meta { color: #4b5563; margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.92rem; }
    th, td { text-align: left; padding: 0.6rem 0.75rem; border-bottom: 1px solid #e5e7eb; }
    th { background: #f9fafb; font-weight: 600; }
    code { background: #f3f4f6; padding: 0.15rem 0.35rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${openApiSpec.info.title} (v${openApiSpec.info.version})</h1>
  <p class="meta">${openApiSpec.info.description} · <a href="/api/v1/docs/openapi.json">OpenAPI 3.1 JSON</a></p>
  <table>
    <thead><tr><th>Method</th><th>Path</th><th>Domain</th><th>Summary</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

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
