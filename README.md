# Collabryd

Welcome to the **Collabryd** repository! This project is structured as a monorepo managed with [Turborepo](https://turbo.build/repo) and [pnpm](https://pnpm.io/).

---

## 🛠 Tech Stack

- **Monorepo Manager:** Turborepo & pnpm workspaces
- **Backend (`apps/api`):** Express 5, TypeScript, Node.js (`tsx`)
- **Frontend (`apps/web`):** React 19, Vite, TypeScript
- **Database & ORM (`packages/database`):** PostgreSQL 18 (via Docker), Drizzle ORM, `pg`
- **Tooling & Configs:** ESLint, Prettier, TypeScript 7

---

## 📁 Repository Structure

```text
├── apps/
│   ├── api/                 # Express REST API (backend)
│   └── web/                 # Vite + React application (frontend)
├── packages/
│   ├── database/            # Drizzle ORM schema, migrations & DB client (@collabryd/database)
│   ├── ui/                  # Shared UI components library (@repo/ui)
│   ├── eslint-config/       # Shared ESLint configuration (@repo/eslint-config)
│   └── typescript-config/   # Shared TypeScript configurations (@repo/typescript-config)
├── docker-compose.yml       # PostgreSQL 18 database service
├── pnpm-workspace.yaml      # Monorepo workspace definitions
└── turbo.json               # Turborepo task pipeline configuration
```

---

## 📋 Prerequisites

Before setting up the repository, make sure you have the following installed on your machine:

1. **Node.js** `>= 24.0.0`
   - Check version: `node -v`
   - Recommended: Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) (`nvm use 24` or `fnm use 24`)
2. **pnpm** `11.x` (or enable via corepack)
   - Enable via corepack: `corepack enable pnpm`
   - Check version: `pnpm -v`
3. **Docker & Docker Compose** (for running local PostgreSQL)
   - [Install Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS / Windows / Linux)
   - Make sure Docker daemon is running: `docker info`

---

## 🚀 Quick Start Guide

Follow these steps in order to get the entire project up and running locally.

### 1. Clone the repository

```bash
git clone https://github.com/shreyanshagrawal/Collabryd.git
cd Collabryd
```

### 2. Install dependencies

Install all monorepo dependencies across apps and packages:

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example `.env.example` file to create your local `.env`:

```bash
cp .env.example .env
```

The default values in `.env` are configured for local development:

```env
BACKEND_PORT: PORT
POSTGRES_USER=Database_user_name
POSTGRES_PASSWORD: Database_password
POSTGRES_DB=Database_name
DATABASE_PORT: 5434
```

> **Note:** The local PostgreSQL port is mapped to host port **`5434`** (instead of standard `5432`) to avoid collisions if you already have a local PostgreSQL instance running.

---

### 4. Start the Database (Docker)

Start the PostgreSQL 18 container in the background:

```bash
docker compose up -d
```

To verify the container is healthy and running:

```bash
docker compose ps
```

---

### 5. Apply Database Migrations

Generate and run Drizzle migrations to ensure your local database schema is up-to-date:

```bash
pnpm --filter @collabryd/database db:migrate
```

_(Optional)_ If you are rapidly prototyping schema changes during development, you can push schema changes directly:

```bash
pnpm --filter @collabryd/database db:push
```

---

### 6. Run the Development Servers

Start all applications (frontend and backend) concurrently via Turborepo:

```bash
```

### 3. Set up environment variables

Copy the example `.env.example` file to create your local `.env`:

```bash
cp .env.example .env
```

The default values in `.env` are configured for local development:

```env
BACKEND_PORT: 3000
POSTGRES_USER=collabryd
POSTGRES_PASSWORD: teammate_password
POSTGRES_DB=collabryd
DATABASE_PORT: 5434
```

> **Note:** The local PostgreSQL port is mapped to host port **`5434`** (instead of standard `5432`) to avoid collisions if you already have a local PostgreSQL instance running.

---

### 4. Start the Database (Docker)

Start the PostgreSQL 18 container in the background:

```bash
docker compose up -d
```

To verify the container is healthy and running:

```bash
docker compose ps
```

---

### 5. Apply Database Migrations

Generate and run Drizzle migrations to ensure your local database schema is up-to-date:

```bash
pnpm --filter @collabryd/database db:migrate
```

*(Optional)* If you are rapidly prototyping schema changes during development, you can push schema changes directly:

```bash
pnpm --filter @collabryd/database db:push
```

---

### 6. Run the Development Servers

Start all applications (frontend and backend) concurrently via Turborepo:

```bash
pnpm dev
```

This starts:
This starts:
- 🌐 **Frontend (Web):** [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend (API):** [http://localhost:3000](http://localhost:3000)

- 🌐 **Frontend (Web):** [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend (API):** [http://localhost:3000](http://localhost:3000)

Verify the API is healthy by visiting:

```bash
curl http://localhost:3000/api/health
# Response: {"success":true,"message":"API is running"}
```

---

## 🗄️ Database Management & Drizzle Studio

The database client and schema live in `packages/database`. You can manage the database with the following commands:

| Command                                         | Description                                                                               |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm --filter @collabryd/database db:generate` | Generate migration SQL files based on schema changes in `src/schema/`                     |
| `pnpm --filter @collabryd/database db:migrate`  | Apply pending migrations to the PostgreSQL database                                       |
| `pnpm --filter @collabryd/database db:push`     | Directly sync database schema without creating migration files                            |
| `pnpm --filter @collabryd/database db:studio`   | Launch Drizzle Studio GUI at [https://local.drizzle.studio](https://local.drizzle.studio) |

To stop the PostgreSQL container:

```bash
docker compose down
```

To stop the container and delete existing database data volumes:

```bash
docker compose down -v
```

---

## 📜 Monorepo Scripts Reference

Run these commands from the root directory:

| Script         | Command            | Description                                            |
| -------------- | ------------------ | ------------------------------------------------------ |
| **Start Dev**  | `pnpm dev`         | Starts API & Web applications in watch mode with Turbo |
| **Build All**  | `pnpm build`       | Builds all packages and applications                   |
| **Lint**       | `pnpm lint`        | Runs ESLint across all projects                        |
| **Format**     | `pnpm format`      | Formats all TS, TSX, and Markdown files using Prettier |
| **Type Check** | `pnpm check-types` | Validates TypeScript types across all workspaces       |

### Running Commands for Specific Apps

Turborepo and pnpm support targeting specific workspaces with the `--filter` flag:

```bash
# Run only API backend
pnpm --filter @repo/api dev

# Run only Web frontend
pnpm --filter web dev

# Run a script inside packages/database
pnpm --filter @collabryd/database <script>
```

---

## ❓ Troubleshooting & FAQs

### Database Connection Refused

- Ensure the Docker container is active: `docker compose ps`
- Check container logs: `docker compose logs postgres`
- Verify that port `5434` is not blocked or occupied by another process.

### Port 3000 or 5173 Already in Use

- Change `BACKEND_PORT` in your root `.env` file to another port (e.g. `3001`).
- Vite will automatically attempt the next available port (e.g. `5174`) if `5173` is busy.

### TypeScript / Workspace Resolution Issues

- If a workspace package isn't resolved properly after pulling new changes, run:
  ```bash
  pnpm install
  pnpm build
  ```

Verify the API is healthy by visiting:
```bash
curl http://localhost:3000/api/health
# Response: {"success":true,"message":"API is running"}
```

---

## 🗄️ Database Management & Drizzle Studio

The database client and schema live in `packages/database`. You can manage the database with the following commands:

| Command | Description |
|---|---|
| `pnpm --filter @collabryd/database db:generate` | Generate migration SQL files based on schema changes in `src/schema/` |
| `pnpm --filter @collabryd/database db:migrate` | Apply pending migrations to the PostgreSQL database |
| `pnpm --filter @collabryd/database db:push` | Directly sync database schema without creating migration files |
| `pnpm --filter @collabryd/database db:studio` | Launch Drizzle Studio GUI at [https://local.drizzle.studio](https://local.drizzle.studio) |

To stop the PostgreSQL container:
```bash
docker compose down
```
To stop the container and delete existing database data volumes:
```bash
docker compose down -v
```

---

## 📜 Monorepo Scripts Reference

Run these commands from the root directory:

| Script | Command | Description |
|---|---|---|
| **Start Dev** | `pnpm dev` | Starts API & Web applications in watch mode with Turbo |
| **Build All** | `pnpm build` | Builds all packages and applications |
| **Lint** | `pnpm lint` | Runs ESLint across all projects |
| **Format** | `pnpm format` | Formats all TS, TSX, and Markdown files using Prettier |
| **Type Check** | `pnpm check-types` | Validates TypeScript types across all workspaces |

### Running Commands for Specific Apps

Turborepo and pnpm support targeting specific workspaces with the `--filter` flag:

```bash
# Run only API backend
pnpm --filter @repo/api dev

# Run only Web frontend
pnpm --filter web dev

# Run a script inside packages/database
pnpm --filter @collabryd/database <script>
```

---

## ❓ Troubleshooting & FAQs

### Database Connection Refused
- Ensure the Docker container is active: `docker compose ps`
- Check container logs: `docker compose logs postgres`
- Verify that port `5434` is not blocked or occupied by another process.

### Port 3000 or 5173 Already in Use
- Change `BACKEND_PORT` in your root `.env` file to another port (e.g. `3001`).
- Vite will automatically attempt the next available port (e.g. `5174`) if `5173` is busy.

### TypeScript / Workspace Resolution Issues
- If a workspace package isn't resolved properly after pulling new changes, run:
  ```bash
  pnpm install
  pnpm build
  ```
