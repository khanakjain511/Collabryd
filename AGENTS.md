# Agent Instructions — Collabryd

These instructions apply to AI coding agents (including Google Antigravity) working in this repository.

---

## 1. Project Overview

**Collabryd** is a campus-first student collaboration and team recruitment platform designed to help students discover teammates, form project teams, and participate in hackathons and campus initiatives.

### Product Direction

- **Initial Launch:** Single campus deployment.
- **Future Direction:** Expansion to multiple campuses across India.
- **Core Mission:** Discover compatible peers, connect through shared skills and interests, apply to open roles, and form balanced teams.
- **Architecture Priority:** Keep data models and authorization campus-aware and ready for multi-tenant expansion without overengineering the current phase.

Always understand the complete user workflow before implementing changes. Prefer full, functioning flows over disconnected UI or API fragments.

---

## 2. Repository & Technology Context

The project is structured as a monorepo managed with **Turborepo** and **pnpm** (`pnpm@11.x`, Node `>= 24`).

### Core Technology Stack

- **Monorepo Management:** Turborepo & pnpm workspaces
- **Backend (`apps/api` — `@repo/api`):** Express 5, TypeScript, Zod validation, Argon2id password hashing, rotating JWT refresh sessions, Pino logging, Helmet, CORS, Socket.IO real-time events.
- **Frontend (`apps/web` — `web`):** React 19, Vite, TypeScript, accessible light/dark theme system, Node native test runner (`node --test`).
- **Database (`packages/database` — `@collabryd/database`):** PostgreSQL 18, Drizzle ORM (23 BCNF tables in `collabryd` schema), SQL migrations, transactional seed scripts.
- **Cache & Infrastructure (`docker-compose.yml`):**
  - **PostgreSQL 18:** Host port **`5434`** (mapped internally to `5432` to avoid local machine conflicts).
  - **Redis 8 Alpine:** Host port **`6379`** (used for rate-limiting, caching, and session fallback).
- **Shared UI (`packages/ui` — `@repo/ui`):** Reusable React components.

> **Constraint:** Do not introduce Prisma, MongoDB, or another database/ORM unless explicitly requested.

---

## 3. Verified Repository Map

| Workspace / Directory         | Package Name              | Responsibility                                                                                 |
| ----------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/api/`                   | `@repo/api`               | Express 5 REST API, Socket.IO notifications, auth & domain services, tests.                    |
| `apps/web/`                   | `web`                     | React 19 + Vite single-page application, design system, route pages.                           |
| `packages/database/`          | `@collabryd/database`     | Drizzle ORM schema, SQL migrations (`drizzle/`), database client, and seeders.                 |
| `packages/ui/`                | `@repo/ui`                | Shared UI components library.                                                                  |
| `packages/eslint-config/`     | `@repo/eslint-config`     | Shared ESLint configurations across workspaces.                                                |
| `packages/typescript-config/` | `@repo/typescript-config` | Shared TypeScript base configurations.                                                         |
| `docs/`                       | —                         | API contracts (`API.md`), architecture maps (`ARCHITECTURE.md`), DBMS documentation (`dbms/`). |
| `PROJECT_STRUCTURE.md`        | —                         | End-to-end request-to-database architectural guide.                                            |

---

## 4. Key Developer & Agent Commands

All commands use **pnpm** from the repository root:

### Monorepo-Wide Tasks

```bash
pnpm dev           # Starts both API (port 3000) and Web (port 5173) in watch mode
pnpm build         # Builds database package, API, and Web
pnpm check-types   # Type-checks all workspaces
pnpm lint          # Runs ESLint across all workspaces
pnpm format        # Runs Prettier across all TS, TSX, and Markdown files
pnpm test          # Runs unit and integration tests across workspaces
```

### Targeted Workspace Commands

```bash
# Backend (apps/api)
pnpm backend:dev   # or: pnpm --filter @repo/api dev
pnpm backend:build # or: pnpm --filter @repo/api build
pnpm backend:test  # or: pnpm --filter @repo/api test

# Frontend (apps/web)
pnpm web:dev       # or: pnpm --filter web dev
pnpm web:build     # or: pnpm --filter web build
pnpm web:lint      # or: pnpm --filter web lint

# Database (packages/database)
pnpm db:migrate    # or: pnpm --filter @collabryd/database db:migrate
pnpm db:seed       # or: pnpm --filter @collabryd/database db:seed
pnpm --filter @collabryd/database db:generate
pnpm --filter @collabryd/database db:studio
```

---

## 5. First Steps Before Making Changes

1. Inspect the repository structure, active branch, and modified files (`git status`).
2. Read the root and workspace `package.json` files before assuming script names.
3. Identify the owning app or package (`apps/api`, `apps/web`, or `packages/database`).
4. Check existing patterns in the module before creating abstractions or duplicate utilities.
5. Never guess paths, script names, port mappings, or environment keys—verify in code.

---

## 6. Engineering & Architecture Principles

### General Principles

- Write clear, maintainable, production-grade TypeScript. Avoid `any`.
- Keep modules cohesive with clear single responsibilities.
- Validate untrusted input at system boundaries using **Zod**.
- Do not silently swallow errors; log and return semantic HTTP errors.
- Never hardcode secrets, API keys, or credentials. Use `.env` and maintain `.env.example`.

### Monorepo Boundaries

- Keep application code inside its respective app (`apps/api` or `apps/web`).
- Put genuinely shared types/components in `packages/database` or `packages/ui`.
- Never import private source files across app boundaries.
- Respect workspace packages declared in `pnpm-workspace.yaml`.

### Backend Layering (`apps/api`)

Follow the established **Model-View-Controller with Services (MVC+S)** architecture:

- **`src/models/`**: Typed domain data models and database entity re-exports (`@collabryd/database`).
- **`src/views/`**: Presentation response formatters (`response.view.ts` for JSON standards, `docs.view.ts` for HTML API docs).
- **`src/controllers/`**: Thin request controllers extracting validated input, delegating to services, and invoking views.
- **`src/services/`**: Core business logic, domain rules, notification dispatching, and Drizzle database transactions.
- **`src/routes/`**: Route definitions, HTTP method bindings, and middleware pipelines mounted under `/api/v1`.
- **`src/middlewares/`**: Cross-cutting request processing (auth, guards, rate limits, request ID, error handling).
- **`src/schemas/`**: Zod validation schemas for request bodies, query params, and URL parameters.
- **`src/utils/`**: Pure stateless helpers (crypto, JWT tokens, pagination, visibility, cache).
- **`src/errors/`**: Standard application error classes (`AppError`, `NotFoundError`, `ConflictError`, etc.).
- Keep controllers and route handlers thin; never embed raw SQL queries or business logic in route definitions or controllers.

### Database & Drizzle ORM (`packages/database`)

- Maintain all table schemas in `packages/database/src/schema/`.
- Apply changes via migrations (`pnpm db:migrate`); never manually alter production DB tables.
- Use transactions (`db.transaction(async (tx) => { ... })`) whenever multiple writes must succeed or fail atomically.
- Scope queries to the user's verified campus to prevent data exposure across institutions.
- Remember the local PostgreSQL host port is **`5434`** (`DATABASE_PORT=5434`).

### Frontend Guidelines (`apps/web`)

- Use existing components in `src/components/`, typography tokens, and CSS variables.
- Handle all component states: loading, empty, error, and success.
- Ensure forms are accessible, keyboard-navigable, and validate on both client and server.
- Follow React purity and hook rules (do not execute impure calls like `Date.now()` during render).

---

## 7. Security & Privacy

- Treat all client data as untrusted.
- Enforce authentication and role permissions on the backend API, not only in the UI.
- Passwords must be hashed using **Argon2id**.
- JWT access tokens are short-lived; refresh tokens rotate on use with reuse detection.
- Enforce resource ownership (e.g. only project owners can accept members or edit details).
- Sanitize output and prevent leaking database internal errors or stack traces in production.

---

## 8. Testing & Verification Requirements

For every functional change:

1. Run relevant unit and integration tests (`pnpm test` or targeted workspace tests).
2. Run type-checking (`pnpm check-types`).
3. Run linting (`pnpm lint`).
4. Run production builds (`pnpm build`) when changing shared packages or configs.
5. Report the exact commands run and their pass/fail results. Never claim code is verified without running the commands.

---

## 9. Expected Response Format

Keep the final report direct, technical, and structured as follows:

```markdown
Summary: Brief explanation of what was implemented, fixed, or investigated.

Files changed: Exact repository paths modified or added.

Verification: Exact commands run and their results (e.g., pnpm check-types — passed; pnpm test — passed).

Assumptions / limitations: Any assumptions made or infrastructure requirements (e.g. requires running Docker for PostgreSQL).
```

### Concrete Example

```markdown
Summary: Added transactional capacity check to project application acceptance.

Files changed: apps/api/src/modules/applications/applications.service.ts, apps/api/tests/integration/collabryd.e2e.test.ts

Verification: pnpm --filter @repo/api test — passed; pnpm check-types — passed.

Assumptions / limitations: Integration tests require PostgreSQL running on port 5434 via docker compose up -d.
```
