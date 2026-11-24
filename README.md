# Collabryd

**Discover. Connect. Collaborate. Build.**

Collabryd is a campus-first student collaboration and project recruitment platform structured as a Turborepo + pnpm monorepo.

---

## Tech Stack

- **Monorepo:** Turborepo & pnpm workspaces
- **Frontend (`apps/web` — `web`):** React 19, Vite, TypeScript, Tailwind/modern CSS design system
- **Backend (`apps/api` — `@repo/api`):** Express 5, TypeScript, Zod, Argon2id, JWT (rotating refresh sessions), Pino, Helmet, CORS, Rate Limiting, Vitest + Supertest
- **Database (`packages/database` — `@collabryd/database`):** PostgreSQL 18, Drizzle ORM (`collabryd` schema — 23 BCNF tables), checksum-verified SQL migrations & idempotent seed
- **UI Library (`packages/ui` — `@repo/ui`):** Shared React component library
- **Cache/Infra (`docker-compose.yml`):** PostgreSQL 18 (port `5434`) & Redis 8 (port `6379`)

---

## Repository Structure

Start with [the codebase guide](PROJECT_STRUCTURE.md) to trace a request through the API and database.

```text
├── apps/
│   ├── api/                 # Express 5 REST API (routes, modules, middlewares, tests)
│   └── web/                 # Vite + React 19 frontend application
├── packages/
│   ├── database/            # Drizzle ORM schema (23 tables), SQL migrations & seed
│   ├── ui/                  # Shared UI components library (@repo/ui)
│   ├── eslint-config/       # Shared ESLint configuration
│   └── typescript-config/   # Shared TypeScript configurations
├── docs/
│   ├── ARCHITECTURE.md      # Full directory, route, schema & DBMS query mappings
│   ├── BACKEND_ARCHITECTURE.md # Deep-dive backend system & module architecture
│   ├── API.md               # Complete REST API endpoint reference
│   └── dbms/                # Authoritative normalization, ER diagram, SQL & EXPLAIN plans
├── docker-compose.yml       # PostgreSQL 18 + Redis 8 services
├── .env.example             # Environment configuration template
└── turbo.json               # Turborepo task pipeline
```

---

## Quick Start

### 1. Prerequisites
- **Node.js** `>= 24` (or `>= 22` for local dev)
- **pnpm** `11.x` (`corepack enable pnpm`)
- **Docker & Docker Compose**

### 2. Install Dependencies & Configure Environment
```bash
pnpm install
cp .env.example .env
```

### 3. Start PostgreSQL & Redis
```bash
docker compose up -d
docker compose ps
```

### 4. Run Database Migrations & Seed
```bash
pnpm db:migrate
pnpm db:seed
```
Demo seeded accounts (password: `Password123!`):
- Admin: `admin@campus.edu`
- Students: `aarav.sharma@campus.edu`, `diya.verma@campus.edu`, `kabir.mehta@campus.edu`

### 5. Start Development Servers
```bash
# Starts both frontend (web) and backend (api) concurrently
pnpm dev

# Or run services individually:
pnpm backend:dev   # Runs API server on port 3000
pnpm web:dev       # Runs Vite dev server on port 5173
```
- **Web App (Frontend):** `http://localhost:5173`
- **API (Backend):** `http://localhost:3000`
- **Health / Readiness:** `http://localhost:3000/api/health` · `http://localhost:3000/api/health/ready`
- **OpenAPI 3.1 JSON:** `http://localhost:3000/api/v1/docs/openapi.json`
- **Interactive API Explorer:** `http://localhost:3000/api/v1/docs`

---

## Monorepo Scripts Reference

| Script | Command | Description |
|---|---|---|
| **Dev All** | `pnpm dev` | Starts API & Web applications in watch mode with Turbo |
| **Backend Dev** | `pnpm backend:dev` | Starts Express API only |
| **Frontend Dev** | `pnpm web:dev` | Starts Vite React frontend only |
| **Build All** | `pnpm build` | Builds all packages and applications |
| **Lint All** | `pnpm lint` | Runs ESLint across all projects |
| **Format** | `pnpm format` | Formats code with Prettier |
| **Type Check** | `pnpm check-types` | Type-checks all workspaces |
| **Test** | `pnpm test` | Runs unit & integration test suites |
| **DB Migrate** | `pnpm db:migrate` | Runs SQL migrations |
| **DB Seed** | `pnpm db:seed` | Seeds database with demo accounts & projects |

---

## Testing & Verification

```bash
pnpm check-types   # Type-check all workspaces
pnpm build         # Build all apps and packages
pnpm test          # Run unit & PostgreSQL integration tests
```

---

## Documentation
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Complete codebase structure, module boundaries, schema-to-table, and DBMS query mappings
- [docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md) — Deep-dive backend system, modular slices, security invariants & real-time delivery
- [docs/API.md](docs/API.md) — Full REST API reference and error contract
- [docs/dbms/](docs/dbms/) — Authoritative normalization proof, ER diagrams, SQL DDL, queries, and query timings/plans
- [docs/FULLSTACK_INTEGRATION.md](docs/FULLSTACK_INTEGRATION.md) — Fullstack architecture, REST API integration, and real-time delivery

### Backend deployment

Use Node.js 24 or newer. Run `pnpm db:migrate`, then `pnpm backend:build` and `pnpm --filter @repo/api start`. Deploy the compiled API and database package, workspace dependencies and SQL migrations together. Production seeding installs the catalog only. Review any demo accounts already present before deployment. Set `NODE_ENV=production`, independent JWT secrets, the allowed frontend origins and verification mail settings from `.env.example`. The deployment must serve the verification page described in [the API reference](docs/API.md).

The integration suite requires a reachable disposable PostgreSQL database selected through `DATABASE_URL`. It creates and cleans up its own fixtures. Redis is optional for the catalog cache. Rate limiting is per API process.
