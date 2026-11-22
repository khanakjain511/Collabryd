import { describe, expect, it } from "vitest";
import request from "supertest";
import {
  generateSecureToken,
  hashPassword,
  sha256,
  verifyPassword,
} from "../../src/utils/crypto.js";
import {
  parseDurationToMs,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../src/utils/jwt.js";
import { buildPaginationMeta } from "../../src/utils/pagination.js";
import { isSameInstitution } from "../../src/utils/visibility.js";
import { getOrSetCache } from "../../src/utils/cache.js";
import { mapPostgresError } from "../../src/errors/app-error.js";
import { registerSchema } from "../../src/schemas/auth.schemas.js";
import { createProjectSchema } from "../../src/schemas/projects.schemas.js";
import app from "../../src/app.js";

describe("Core utilities & security primitives", () => {
  it("hashes and verifies passwords using Argon2id", async () => {
    const hash = await hashPassword("Str0ngPass!");
    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(verifyPassword(hash, "Str0ngPass!")).resolves.toBe(true);
    await expect(verifyPassword(hash, "WrongPass1")).resolves.toBe(false);
  });

  it("generates high-entropy tokens and deterministic SHA-256 hashes", () => {
    const t1 = generateSecureToken(32);
    const t2 = generateSecureToken(32);
    expect(t1).toHaveLength(64);
    expect(t1).not.toBe(t2);
    expect(sha256(t1)).toBe(sha256(t1));
    expect(sha256(t1)).not.toBe(sha256(t2));
  });

  it("signs and verifies access and refresh JWTs with strict type separation", () => {
    const access = signAccessToken({
      userId: 42,
      email: "student@campus.edu",
      systemRole: "STUDENT",
    });
    const refresh = signRefreshToken({ userId: 42, jti: "session-jti-1" });

    const decodedAccess = verifyAccessToken(access);
    expect(decodedAccess.userId).toBe(42);
    expect(decodedAccess.systemRole).toBe("STUDENT");

    const decodedRefresh = verifyRefreshToken(refresh);
    expect(decodedRefresh.userId).toBe(42);
    expect(decodedRefresh.jti).toBe("session-jti-1");

    expect(() => verifyAccessToken(refresh)).toThrow();
    expect(() => verifyRefreshToken(access)).toThrow();
  });

  it("parses duration strings accurately", () => {
    expect(parseDurationToMs("15m")).toBe(900_000);
    expect(parseDurationToMs("7d")).toBe(604_800_000);
    expect(() => parseDurationToMs("invalid")).toThrow();
  });

  it("computes pagination metadata accurately", () => {
    expect(buildPaginationMeta(2, 10, 25)).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
  });

  it("maps PostgreSQL constraint errors to semantic HTTP AppErrors", () => {
    const dupEmail = mapPostgresError({
      code: "23505",
      constraint: "uq_users_email_lower",
    });
    expect(dupEmail?.statusCode).toBe(409);
    expect(dupEmail?.code).toBe("EMAIL_ALREADY_EXISTS");

    const dupApp = mapPostgresError({
      code: "23505",
      constraint: "uq_active_application",
    });
    expect(dupApp?.statusCode).toBe(409);
    expect(dupApp?.code).toBe("DUPLICATE_PENDING_APPLICATION");

    const fkErr = mapPostgresError({ cause: { code: "23503" } });
    expect(fkErr?.statusCode).toBe(400);
    expect(fkErr?.code).toBe("FOREIGN_KEY_VIOLATION");

    const checkErr = mapPostgresError({ code: "23514" });
    expect(checkErr?.statusCode).toBe(400);
    expect(checkErr?.code).toBe("CHECK_VIOLATION");
  });
  it("compares campus institutions case-insensitively and safely handles nulls", () => {
    expect(isSameInstitution("IIT Delhi", "  iit delhi ")).toBe(true);
    expect(isSameInstitution("IIT Delhi", "IIT Bombay")).toBe(false);
    expect(isSameInstitution(null, "IIT Delhi")).toBe(false);
  });

  it("falls back transparently to loader when Redis cache is disabled", async () => {
    const value = await getOrSetCache("catalog:test", 60, async () => ({
      items: ["TypeScript"],
    }));
    expect(value).toEqual({ items: ["TypeScript"] });
  });
});

describe("Zod validation schemas", () => {
  it("enforces strong password policy on registration", () => {
    const weak = registerSchema.safeParse({
      email: "a@campus.edu",
      password: "weak",
      displayName: "Aarav",
      institution: "IIT Delhi",
      courseProgram: "B.Tech CS",
      academicYear: "3rd Year",
    });
    expect(weak.success).toBe(false);
  });

  it("enforces maxTeamSize >= minTeamSize on project creation", () => {
    const badRange = createProjectSchema.safeParse({
      title: "Distributed Cache",
      summary: "A fast campus distributed cache built in Go.",
      description: "Detailed technical description for campus distributed cache.",
      category: "Systems",
      projectType: "PERSONAL",
      minTeamSize: 5,
      maxTeamSize: 2,
    });
    expect(badRange.success).toBe(false);
  });
});

describe("HTTP transport basics", () => {
  it("serves GET /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("API is running");
  });

  it("reports oversized JSON requests as 413", async () => {
    await request(app).post("/api/v1/auth/login").send({ padding: "x".repeat(1024 * 1024) }).expect(413);
  });

  it("serves OpenAPI 3.1 spec at GET /api/v1/docs/openapi.json", async () => {
    const res = await request(app).get("/api/v1/docs/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe("3.1.0");
    expect(res.body.paths["/auth/register"]).toBeDefined();
  });

  it("serves interactive HTML docs at GET /api/v1/docs", async () => {
    const res = await request(app).get("/api/v1/docs");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain("Collabryd API");
  });

  it("returns structured 404 JSON for unknown routes", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
