# Deployment Guide: Vercel (Frontend) & Render (Backend + Database)

This guide walks you through deploying **Collabryd** into production:
- **Frontend (Vite / React SPA)** on [Vercel](https://vercel.com)
- **Backend (Express REST API & Socket.IO)** on [Render](https://render.com)
- **Database (PostgreSQL)** on [Render](https://render.com) (or Supabase / Neon)

---

## Architecture Overview

```
                      ┌────────────────────────────┐
                      │    Vercel (Frontend)       │
                      │  https://<app>.vercel.app   │
                      └──────────────┬─────────────┘
                                     │
                    API & WebSockets │ (HTTPS / WSS)
                                     ▼
                      ┌────────────────────────────┐
                      │    Render (Backend API)    │
                      │  https://<api>.onrender.com │
                      └──────────────┬─────────────┘
                                     │
                                     ▼
                      ┌────────────────────────────┐
                      │  Render (PostgreSQL DB)    │
                      └────────────────────────────┘
```

---

## Step 1: Deploy Backend & Database on Render

### Option A: Using the Blueprint (`render.yaml`) — Recommended
1. Push your repository to GitHub.
2. Sign in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect your GitHub repository (`Collabryd`).
5. Render detects `render.yaml` automatically and creates:
   - A managed PostgreSQL database (`collabryd-db`).
   - A Web Service (`collabryd-api`).
6. In the service settings, supply the empty required environment variables (e.g. `CORS_ORIGIN`).
7. Click **Apply**. Render will provision the database, run migrations, and launch your API.

### Option B: Manual Setup on Render

#### 1. Create PostgreSQL Database
- Go to **New +** > **PostgreSQL**.
- Name: `collabryd-db`
- Database: `collabryd`
- User: `collabryd`
- Plan: **Free** (or Starter)
- Once created, copy the **Internal Database URL** (if deploying backend on Render) or **External Database URL**.

#### 2. Create Web Service for Backend
- Go to **New +** > **Web Service**.
- Connect your `Collabryd` repository.
- Configure settings:
  - **Name:** `collabryd-api`
  - **Runtime:** `Node`
  - **Region:** Same region as your database (e.g., `Oregon`).
  - **Branch:** `main`
  - **Build Command:**
    ```bash
    pnpm install && pnpm --filter @collabryd/database build && pnpm --filter @repo/api build && pnpm db:migrate
    ```
  - **Start Command:**
    ```bash
    pnpm --filter @repo/api start
    ```
  - **Health Check Path:** `/api/health`
- **Environment Variables:**
  | Variable | Value / Notes |
  | :--- | :--- |
  | `NODE_ENV` | `production` |
  | `DATABASE_URL` | Click *Add from Database* > select `collabryd-db` > `Internal Connection String` |
  | `CORS_ORIGIN` | Your Vercel domain: `https://your-app.vercel.app` (or `*` temporarily) |
  | `JWT_ACCESS_SECRET` | Generate a 32+ character random string (or click *Generate*) |
  | `JWT_REFRESH_SECRET` | Generate a 32+ character random string (or click *Generate*) |
  | `JWT_ACCESS_EXPIRES_IN` | `15m` |
  | `JWT_REFRESH_EXPIRES_IN` | `7d` |
  | `TRUST_PROXY_HOPS` | `1` |
  | `EMAIL_PROVIDER` | `resend` (or `local` if testing without an email service) |
  | `EMAIL_FROM` | `verify@yourdomain.com` (if using Resend) |
  | `RESEND_API_KEY` | Your Resend API key (if using Resend) |
  | `VERIFICATION_PAGE_URL` | `https://your-app.vercel.app/#/verify-campus` |

8. Click **Create Web Service**. Wait for the build and deployment to succeed. Note down your Render backend URL (e.g. `https://collabryd-api.onrender.com`).

---

## Step 2: Deploy Frontend on Vercel

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New…** > **Project**.
3. Import your `Collabryd` repository.
4. In the Project Configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `apps/web` (or leave as root, since `vercel.json` and `apps/web/vercel.json` are preconfigured).
   - If setting Root Directory to `apps/web`:
     - Build Command: `pnpm build`
     - Output Directory: `dist`
   - If keeping Root Directory as `./` (monorepo root):
     - Build Command: `pnpm --filter web build`
     - Output Directory: `apps/web/dist`
5. **Environment Variables**:
   Add the following variables pointing to your Render backend:
   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://collabryd-api.onrender.com/api/v1` | Your Render backend API base |
   | `VITE_SOCKET_URL` | `https://collabryd-api.onrender.com` | Your Render backend Socket.IO origin |
6. Click **Deploy**.

---

## Step 3: Connect Frontend and Backend (CORS)

Once Vercel assigns your live URL (e.g., `https://collabryd.vercel.app`):
1. Go back to your Render Dashboard > `collabryd-api` > **Environment**.
2. Update `CORS_ORIGIN` to match your Vercel URL exactly:
   ```env
   CORS_ORIGIN=https://collabryd.vercel.app
   ```
   *(Multiple origins can be separated by commas if using custom domains, e.g. `https://collabryd.vercel.app,https://collabryd.com`)*.
3. Save changes. Render will automatically redeploy with the updated CORS policy.

---

## Step 4: Verification Checklist

1. **Health Check:**
   Visit `https://collabryd-api.onrender.com/api/health` in your browser. It should return:
   ```json
   { "status": "ok", "service": "collabryd-api" }
   ```
2. **Frontend UI:**
   Visit `https://collabryd.vercel.app`. The landing page, teams, and hackathons should load.
3. **Authentication:**
   Sign up or log in with OTP.
4. **Live Messaging:**
   Open two browser tabs or devices, send a message in chat, and verify real-time Socket.IO synchronization.
5. **Recommendations:**
   Navigate to the Dashboard and verify the "Recommended Teams for You" rail renders matching skills.
