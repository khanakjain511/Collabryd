import { openApiSpec } from "../docs/openapi.js";

export function renderDocsHtml(): string {
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
  <title>${openApiSpec.info.title} — API Reference (MVC Architecture)</title>
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
