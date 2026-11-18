# Collabryd

**Discover. Connect. Collaborate. Build.**

Collabryd is a campus-first student collaboration and project recruitment platform structured as a Turborepo + pnpm monorepo.

---

## Tech Stack

- **Monorepo:** Turborepo & pnpm workspaces
- **Backend (`apps/api` — `@repo/api`):** Express 5, TypeScript, Zod, Argon2id, JWT (rotating refresh sessions), Pino, Helmet, CORS, Rate Limiting, Vitest + Supertest
- **Database (`packages/database` — `@collabryd/database`):** PostgreSQL 18, Drizzle ORM (`collabryd` schema — 23 BCNF tables), checksum-verified SQL migrations & idempotent seed
- **Cache/Infra (`docker-compose.yml`):** PostgreSQL 18 (port `5434`) & Redis 8 (port `6379`)

---

## Repository Structure

```text
├── apps/
│   └── api/                 # Express 5 REST API (routes, modules, middlewares, tests)
├── packages/
│   ├── database/            # Drizzle ORM schema (23 tables), SQL migrations & seed
│   ├── eslint-config/       # Shared ESLint configuration
│   └── typescript-config/   # Shared TypeScript configurations
├── docs/
│   ├── ARCHITECTURE.md      # Full directory, route, schema & DBMS query mappings
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
pnpm dev
# Or individually:
pnpm backend:dev
```
- **API:** `http://localhost:3000`
- **Health / Readiness:** `http://localhost:3000/api/health` · `http://localhost:3000/api/health/ready`
- **OpenAPI 3.1 JSON:** `http://localhost:3000/api/v1/docs/openapi.json`
- **Interactive API Explorer:** `http://localhost:3000/api/v1/docs`

---

## Testing & Verification

```bash
pnpm check-types   # Type-check all workspaces
pnpm build         # Build all apps and packages
pnpm test          # Run unit & PostgreSQL integration tests
```

## Documentation
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Complete codebase structure, module boundaries, schema-to-table, and DBMS query mappings
- [docs/API.md](docs/API.md) — Full REST API reference and error contract
- [docs/dbms/](docs/dbms/) — Authoritative normalization proof, ER diagrams, SQL DDL, queries, and query timings/plans
