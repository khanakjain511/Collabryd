import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const WEB_ROOT = path.resolve(import.meta.dirname, "..");
const CSS_PATH = path.join(WEB_ROOT, "src/index.css");

// 1. AST / Lexical Parser for CSS Layer Conformance
function analyzeCSSLayers(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const violations: { line: number; prelude: string; reason: string }[] = [];
  let pos = 0;
  const len = content.length;

  function skipWhitespaceAndComments() {
    while (pos < len) {
      if (content.slice(pos, pos + 2) === "/*") {
        const end = content.indexOf("*/", pos + 2);
        if (end === -1) { pos = len; break; }
        pos = end + 2;
      } else if (/\s/.test(content[pos])) {
        pos++;
      } else {
        break;
      }
    }
  }

  while (pos < len) {
    skipWhitespaceAndComments();
    if (pos >= len) break;

    const startPos = pos;
    let braceOrSemi = -1;
    let inString: string | null = null;

    for (let i = pos; i < len; i++) {
      const ch = content[i];
      if (inString) {
        if (ch === inString && content[i - 1] !== "\\") inString = null;
      } else if (ch === '"' || ch === "'") {
        inString = ch;
      } else if (content.slice(i, i + 2) === "/*") {
        const commentEnd = content.indexOf("*/", i + 2);
        if (commentEnd !== -1) i = commentEnd + 1;
      } else if (ch === ";" || ch === "{") {
        braceOrSemi = i;
        break;
      }
    }

    if (braceOrSemi === -1) break;

    const prelude = content.slice(startPos, braceOrSemi).trim();
    const lineNum = content.slice(0, startPos).split("\n").length;

    if (content[braceOrSemi] === ";") {
      if (!prelude.startsWith("@import") && !prelude.startsWith("@custom-variant")) {
        violations.push({ line: lineNum, prelude, reason: "Unexpected unlayered statement" });
      }
      pos = braceOrSemi + 1;
    } else if (content[braceOrSemi] === "{") {
      let depth = 1;
      let bodyEnd = -1;
      let str: string | null = null;

      for (let i = braceOrSemi + 1; i < len; i++) {
        const ch = content[i];
        if (str) {
          if (ch === str && content[i - 1] !== "\\") str = null;
        } else if (ch === '"' || ch === "'") {
          str = ch;
        } else if (content.slice(i, i + 2) === "/*") {
          const commentEnd = content.indexOf("*/", i + 2);
          if (commentEnd !== -1) i = commentEnd + 1;
        } else if (ch === "{") {
          depth++;
        } else if (ch === "}") {
          depth--;
          if (depth === 0) {
            bodyEnd = i;
            break;
          }
        }
      }

      const isAllowedAtRule =
        prelude.startsWith("@theme") ||
        prelude.startsWith("@font-face") ||
        prelude.startsWith("@keyframes") ||
        prelude.startsWith("@layer") ||
        prelude.startsWith("@utility");

      if (!isAllowedAtRule) {
        violations.push({
          line: lineNum,
          prelude: prelude.replace(/\s+/g, " ").slice(0, 70),
          reason: "Unlayered rule selector. Must be wrapped in @layer base, @layer utilities, or @utility.",
        });
      }

      pos = bodyEnd + 1;
    }
  }

  return { content, violations };
}

test("src/index.css contains zero unlayered plain CSS selectors", () => {
  const { violations } = analyzeCSSLayers(CSS_PATH);
  if (violations.length > 0) {
    const errorMsg = violations
      .map((v) => `Line ${v.line}: [${v.prelude}] -> ${v.reason}`)
      .join("\n");
    assert.fail(`Found ${violations.length} unlayered rule violations in src/index.css:\n${errorMsg}`);
  }
  assert.equal(violations.length, 0);
});

test("src/index.css respects line budget (<= 350 lines)", () => {
  const content = fs.readFileSync(CSS_PATH, "utf8");
  const lineCount = content.split("\n").length;
  assert.ok(
    lineCount <= 350,
    `src/index.css line count is ${lineCount}, exceeding the 350-line limit for a clean Tailwind v4 entry point.`
  );
});

test("src/index.css properly encloses animations in @layer utilities or @utility", () => {
  const content = fs.readFileSync(CSS_PATH, "utf8");
  assert.ok(content.includes("@import \"tailwindcss\";"), "Missing @import 'tailwindcss';");
  assert.ok(content.includes("@theme"), "Missing @theme configuration block");
  // Ensure that no animation classes are declared outside of @layer utilities or @utility
  assert.ok(!content.includes("\n.intro-curtain {"), "intro-curtain declared as unlayered class");
  assert.ok(!content.includes("\n.reveal-enter {"), "reveal-enter declared as unlayered class");
});

test("apps/web/src/**/*.tsx contains zero banned legacy classes", () => {
  const BANNED_LEGACY_CLASSES = [
    "dashboard-banner", "filters-bar", "filter-tabs", "search-field",
    "filter-select", "filter-fields", "advanced-filters", "list-panel",
    "results-heading", "detail-grid", "team-detail-heading", "team-members",
    "profile-about", "member-row", "inline-actions", "danger-text",
    "advice-panel", "advice-star", "join-panel", "form-columns",
    "checkbox-label", "check-list", "roster-table", "roster-cards",
    "dialog-heading", "verification-panel", "verification-icon", "access-page",
    "access-symbol", "input-with-icon", "password-toggle", "inline-info",
    "button-primary", "button-secondary", "button-danger", "button-small",
    "cards-grid", "field-hint", "form-error", "form-actions", "stack-form",
    "empty-state", "page-heading", "summary-icon"
  ];

  function getTsxFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) files.push(...getTsxFiles(full));
      else if (entry.name.endsWith(".tsx")) files.push(full);
    }
    return files;
  }

  const tsxFiles = getTsxFiles(path.join(WEB_ROOT, "src"));
  const occurrences: { file: string; line: number; cls: string }[] = [];

  for (const file of tsxFiles) {
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      for (const cls of BANNED_LEGACY_CLASSES) {
        const regex = new RegExp(`(?<=['"\`\\s])${cls}(?=['"\`\\s])`);
        if (regex.test(line)) {
          occurrences.push({ file: path.relative(WEB_ROOT, file), line: index + 1, cls });
        }
      }
    });
  }

  if (occurrences.length > 0) {
    const details = occurrences
      .map((o) => `${o.file}:${o.line} uses banned legacy class "${o.cls}"`)
      .join("\n");
    assert.fail(`Found ${occurrences.length} legacy class references in JSX files:\n${details}`);
  }
  assert.equal(occurrences.length, 0);
});
