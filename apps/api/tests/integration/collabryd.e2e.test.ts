import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { env } from "../../src/config/env.js";
import request from "supertest";
import { eq, sql } from "drizzle-orm";
import {
  closePool,
  db,
  interests,
  roles,
  skills,
  users,
} from "@collabryd/database";
import { runMigrations } from "@collabryd/database/migrate";
import app from "../../src/app.js";

let dbAvailable = false;

async function checkDatabase(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

describe("Collabryd End-to-End Integration Suite", () => {
  const runSuffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const emailA = `owner.${runSuffix}@campus.edu`;
  const emailB = `applicant1.${runSuffix}@campus.edu`;
  const emailC = `applicant2.${runSuffix}@othercampus.edu`;
  const emailAdmin = `admin.${runSuffix}@campus.edu`;
  const password = "Password123!";

  let providerUserId = 0;
  let userAId = 0;
  let userBId = 0;
  let userCId = 0;
  let adminId = 0;
  let tokenA = "";
  let refreshA = "";
  let tokenB = "";
  let tokenC = "";
  let tokenAdmin = "";

  let skillTsId = 0;
  let skillPyId = 0;
  let interestAiId = 0;
  let roleFeId = 0;

  let projectId = 0;
  let groupConversationId = 0;
  let directConversationId = 0;
  let appBId = 0;
  let appCId = 0;

  beforeAll(async () => {
    dbAvailable = await checkDatabase();
    if (!dbAvailable) return;

    await runMigrations();

    // Ensure baseline catalog rows exist for tests
    const [s1] = await db
      .insert(skills)
      .values({ name: `TypeScript-${runSuffix}`, category: "Languages" })
      .returning();
    const [s2] = await db
      .insert(skills)
      .values({ name: `Python-${runSuffix}`, category: "Languages" })
      .returning();
    const [i1] = await db
      .insert(interests)
      .values({ name: `GenAI-${runSuffix}`, domain: "AI/ML" })
      .returning();
    const [r1] = await db
      .insert(roles)
      .values({ name: `Frontend-${runSuffix}`, description: "Web UI" })
      .returning();

    skillTsId = s1!.skillId;
    skillPyId = s2!.skillId;
    interestAiId = i1!.interestId;
    roleFeId = r1!.roleId;
  });

  afterAll(async () => {
    if (dbAvailable) {
      // Clean up test projects and users safely respecting ON DELETE RESTRICT
      if (projectId) {
        await db.execute(
          sql`DELETE FROM collabryd.projects WHERE project_id = ${projectId}`
        );
      }
      if (directConversationId) {
        await db.execute(
          sql`DELETE FROM collabryd.conversations WHERE conversation_id = ${directConversationId}`
        );
      }
      const ids = [userAId, userBId, userCId, adminId, providerUserId].filter((id) => id > 0);
      for (const id of ids) {
        await db.execute(
          sql`DELETE FROM collabryd.admin_audit_logs WHERE admin_id = ${id}`
        );
        await db.execute(
          sql`DELETE FROM collabryd.messages WHERE sender_id = ${id}`
        );
        await db.execute(
          sql`DELETE FROM collabryd.project_members WHERE user_id = ${id}`
        );
        await db.execute(
          sql`DELETE FROM collabryd.projects WHERE owner_id = ${id}`
        );
        await db.delete(users).where(eq(users.userId, id));
      }
      if (skillTsId) {
        await db.delete(skills).where(eq(skills.skillId, skillTsId));
      }
      if (skillPyId) {
        await db.delete(skills).where(eq(skills.skillId, skillPyId));
      }
      if (interestAiId) {
        await db.delete(interests).where(eq(interests.interestId, interestAiId));
      }
      if (roleFeId) {
        await db.delete(roles).where(eq(roles.roleId, roleFeId));
      }
    }
    await closePool();
  });

  async function registerAndVerify(input: {
    email: string;
    displayName: string;
    institution: string;
  }) {
    const reg = await request(app).post("/api/v1/auth/register").send({
      email: input.email,
      password,
      displayName: input.displayName,
      institution: input.institution,
      courseProgram: "B.Tech CS",
      academicYear: "3rd Year",
    });
    expect(reg.status).toBe(201);
    const verificationToken = reg.body.data.verificationToken as string;
    expect(verificationToken).toBeTruthy();

    const verify = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: verificationToken });
    expect(verify.status).toBe(200);
    expect(verify.body.data.accountStatus).toBe("ACTIVE");

    const login = await request(app).post("/api/v1/auth/login").send({
      email: input.email,
      password,
    });
    expect(login.status).toBe(200);

    return {
      userId: reg.body.data.user.userId as number,
      accessToken: login.body.data.tokens.accessToken as string,
      refreshToken: login.body.data.tokens.refreshToken as string,
    };
  }

  it("1. Health readiness checks PostgreSQL connectivity", async () => {
    if (!dbAvailable) return;
    const res = await request(app).get("/api/health/ready");
    expect(res.status).toBe(200);
    expect(res.body.data.database).toBe("connected");
  });

  it("sends verification and resend mail and preserves the last delivered token on failure", async () => {
    const email = `provider.${runSuffix}@campus.edu`;
    const original = { ...env };
    Object.assign(env, { EMAIL_PROVIDER: "resend", VERIFICATION_PAGE_URL: "https://example.test/verify",
      EMAIL_FROM: "verify@example.test", RESEND_API_KEY: "test" });
    const provider = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 202 }));
    const tokenFromMail = () => {
      const mail = JSON.parse(String(provider.mock.lastCall?.[1]?.body));
      expect(mail.to).toEqual([email]);
      return new URLSearchParams(new URL(mail.text.split(" ").at(-1)).hash.slice(1)).get("token");
    };
    try {
      const reg = await request(app).post("/api/v1/auth/register").send({
        email, password, displayName: "Mail Test", institution: "Campus", courseProgram: "CS", academicYear: "3",
      }).expect(201);
      providerUserId = reg.body.data.user.userId;
      expect(reg.body.data.verificationToken).toBeUndefined();
      const first = tokenFromMail();
      const resend = () => request(app).post("/api/v1/auth/resend-verification").send({ email });
      const secondResponse = await resend().expect(200);
      const second = tokenFromMail();
      expect(second).not.toBe(first);
      provider.mockRejectedValueOnce(new Error("provider unavailable"));
      expect((await resend()).body).toEqual(secondResponse.body);
      await request(app).post("/api/v1/auth/verify-email").send({ token: first }).expect(400);
      await request(app).post("/api/v1/auth/verify-email").send({ token: second }).expect(200);
    } finally {
      Object.assign(env, original);
      provider.mockRestore();
    }
  });

  it("2. Auth lifecycle: unverified login blocked, verify, refresh rotation & reuse detection", async () => {
    if (!dbAvailable) return;

    const reg = await request(app).post("/api/v1/auth/register").send({
      email: emailA,
      password,
      displayName: "Owner Student",
      institution: "IIT Delhi",
      courseProgram: "B.Tech CS",
      academicYear: "3rd Year",
    });
    expect(reg.status).toBe(201);
    userAId = reg.body.data.user.userId;

    // Duplicate email (case-insensitive) blocked
    const dup = await request(app).post("/api/v1/auth/register").send({
      email: emailA.toUpperCase(),
      password,
      displayName: "Dup",
      institution: "IIT Delhi",
      courseProgram: "B.Tech CS",
      academicYear: "3rd Year",
    });
    expect(dup.status).toBe(409);

    // Login before verification blocked
    const unverifiedLogin = await request(app).post("/api/v1/auth/login").send({
      email: emailA,
      password,
    });
    expect(unverifiedLogin.status).toBe(403);
    expect(unverifiedLogin.body.error.code).toBe("EMAIL_NOT_VERIFIED");

    // Verify email
    const verify = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: reg.body.data.verificationToken });
    expect(verify.status).toBe(200);

    // Login succeeds
    const login = await request(app).post("/api/v1/auth/login").send({
      email: emailA,
      password,
    });
    expect(login.status).toBe(200);
    const oldRefresh = login.body.data.tokens.refreshToken as string;

    // Rotate refresh token
    const rotated = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: oldRefresh });
    expect(rotated.status).toBe(200);
    const newRefresh = rotated.body.data.tokens.refreshToken as string;

    // Replay of already-used refresh token triggers reuse detection & revokes all sessions
    const reuse = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: oldRefresh });
    expect(reuse.status).toBe(401);
    expect(reuse.body.error.code).toBe("REFRESH_TOKEN_REUSE_DETECTED");

    const invalidatedNew = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: newRefresh });
    expect(invalidatedNew.status).toBe(401);

    // Re-login cleanly for subsequent tests
    const relogin = await request(app).post("/api/v1/auth/login").send({
      email: emailA,
      password,
    });
    tokenA = relogin.body.data.tokens.accessToken;
    refreshA = relogin.body.data.tokens.refreshToken;
    expect(refreshA).toBeTruthy();

    // Register User B (same campus), User C (different campus), and Admin
    const b = await registerAndVerify({
      email: emailB,
      displayName: "Applicant One",
      institution: "IIT Delhi",
    });
    userBId = b.userId;
    tokenB = b.accessToken;

    const c = await registerAndVerify({
      email: emailC,
      displayName: "Applicant Two",
      institution: "IIT Bombay",
    });
    userCId = c.userId;
    tokenC = c.accessToken;

    const adm = await registerAndVerify({
      email: emailAdmin,
      displayName: "Platform Admin",
      institution: "IIT Delhi",
    });
    adminId = adm.userId;
    await db
      .update(users)
      .set({ systemRole: "ADMIN" })
      .where(eq(users.userId, adminId));
    const admLogin = await request(app).post("/api/v1/auth/login").send({
      email: emailAdmin,
      password,
    });
    tokenAdmin = admLogin.body.data.tokens.accessToken;
  });

  it("3. Profiles, skills, visibility enforcement (CAMPUS_ONLY / PRIVATE), and catalog", async () => {
    if (!dbAvailable) return;

    // Attach skills, interests, preferred roles, achievement, social link to User B
    const putSkills = await request(app)
      .put("/api/v1/profiles/me/skills")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        skills: [
          { skillId: skillTsId, proficiencyLevel: "ADVANCED", yearsExperience: 2.5 },
          { skillId: skillPyId, proficiencyLevel: "INTERMEDIATE", yearsExperience: 1.5 },
        ],
      });
    expect(putSkills.status).toBe(200);
    expect(putSkills.body.data).toHaveLength(2);

    await request(app)
      .put("/api/v1/profiles/me/interests")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ ids: [interestAiId] })
      .expect(200);

    await request(app)
      .put("/api/v1/profiles/me/preferred-roles")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ ids: [roleFeId] })
      .expect(200);

    await request(app)
      .post("/api/v1/profiles/me/achievements")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hackathon Winner", issuer: "TechFest" })
      .expect(201);

    await request(app)
      .post("/api/v1/profiles/me/social-links")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ platform: "GITHUB", url: "https://github.com/applicant-one" })
      .expect(201);

    // Set User B profile to CAMPUS_ONLY
    await request(app)
      .put("/api/v1/profiles/me")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        displayName: "Applicant One",
        institution: "IIT Delhi",
        courseProgram: "B.Tech CS",
        academicYear: "3rd Year",
        profileVisibility: "CAMPUS_ONLY",
      })
      .expect(200);

    // Same campus (User A) can view User B
    await request(app)
      .get(`/api/v1/students/${userBId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    // Different campus (User C) blocked by CAMPUS_ONLY
    const crossCampus = await request(app)
      .get(`/api/v1/students/${userBId}`)
      .set("Authorization", `Bearer ${tokenC}`);
    expect(crossCampus.status).toBe(403);
    expect(crossCampus.body.error.code).toBe("PROFILE_CAMPUS_ONLY");

    // Catalog search returns created skill with studentCount >= 1
    const catSkills = await request(app)
      .get("/api/v1/catalog/skills")
      .query({ search: `TypeScript-${runSuffix}` });
    expect(catSkills.status).toBe(200);
    expect(catSkills.body.data[0].studentCount).toBe(1);
  });

  it("4. Project creation, discovery, capacity, and skill recommendations (R15 & R16)", async () => {
    if (!dbAvailable) return;

    const createRes = await request(app)
      .post("/api/v1/projects")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: `Collabryd Test Project ${runSuffix}`,
        summary: "Building an AI-assisted study platform for campus hackathons.",
        description:
          "Full-stack campus collaboration project requiring TypeScript and Python developers.",
        category: "Artificial Intelligence",
        projectType: "HACKATHON",
        status: "OPEN",
        visibility: "PUBLIC",
        minTeamSize: 1,
        maxTeamSize: 2,
        skills: [
          { skillId: skillTsId, isRequired: true },
          { skillId: skillPyId, isRequired: false },
        ],
        roles: [{ roleId: roleFeId, openPositions: 1, description: "Lead UI" }],
      });

    expect(createRes.status).toBe(201);
    projectId = createRes.body.data.projectId;
    groupConversationId = createRes.body.data.groupConversationId;
    expect(groupConversationId).toBeGreaterThan(0);
    expect(createRes.body.data.currentMemberCount).toBe(1);
    expect(createRes.body.data.remainingCapacity).toBe(1);

    // R15: Project owner gets User B recommended (matched 2 skills)
    const candRecs = await request(app)
      .get(`/api/v1/projects/${projectId}/recommendations`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(candRecs.status).toBe(200);
    expect(candRecs.body.data.some((c: { userId: number }) => c.userId === userBId)).toBe(true);

    // R16: User B gets project recommended
    const projRecs = await request(app)
      .get("/api/v1/recommendations/projects")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(projRecs.status).toBe(200);
    expect(
      projRecs.body.data.some((p: { projectId: number }) => p.projectId === projectId)
    ).toBe(true);
  });

  it("5. Applications lifecycle: duplicate guard, withdraw + reapply, transactional accept & capacity enforcement", async () => {
    if (!dbAvailable) return;

    // Owner cannot apply to own project
    await request(app)
      .post(`/api/v1/projects/${projectId}/applications`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ roleId: roleFeId, message: "Self apply" })
      .expect(400);

    // User B applies
    const app1 = await request(app)
      .post(`/api/v1/projects/${projectId}/applications`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ roleId: roleFeId, message: "First application" });
    expect(app1.status).toBe(201);

    // Duplicate PENDING application blocked by partial unique index
    const dupApp = await request(app)
      .post(`/api/v1/projects/${projectId}/applications`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ roleId: roleFeId, message: "Duplicate" });
    expect(dupApp.status).toBe(409);
    expect(dupApp.body.error.code).toBe("DUPLICATE_PENDING_APPLICATION");

    // Withdraw and re-apply cleanly
    await request(app)
      .post(`/api/v1/applications/${app1.body.data.applicationId}/withdraw`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(200);

    const reapply = await request(app)
      .post(`/api/v1/projects/${projectId}/applications`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ roleId: roleFeId, message: "Re-applied with updated portfolio" });
    expect(reapply.status).toBe(201);
    appBId = reapply.body.data.applicationId;

    // User C also applies
    const appC = await request(app)
      .post(`/api/v1/projects/${projectId}/applications`)
      .set("Authorization", `Bearer ${tokenC}`)
      .send({ roleId: roleFeId, message: "Excited to contribute!" });
    expect(appC.status).toBe(201);
    appCId = appC.body.data.applicationId;

    // Owner sees incoming pending applications (R17)
    const incoming = await request(app)
      .get("/api/v1/applications/incoming")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(incoming.status).toBe(200);
    expect(incoming.body.data.length).toBeGreaterThanOrEqual(2);

    // Owner accepts User B -> team reaches maxTeamSize = 2
    const acceptB = await request(app)
      .post(`/api/v1/applications/${appBId}/accept`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(acceptB.status).toBe(200);
    expect(acceptB.body.data.member.userId).toBe(userBId);
    expect(acceptB.body.data.groupConversationId).toBe(groupConversationId);

    // Owner attempts to accept User C -> blocked at maxTeamSize capacity
    const acceptC = await request(app)
      .post(`/api/v1/applications/${appCId}/accept`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(acceptC.status).toBe(409);
    expect(acceptC.body.error.code).toBe("TEAM_CAPACITY_FULL");

    // Owner rejects User C cleanly
    const rejectC = await request(app)
      .post(`/api/v1/applications/${appCId}/reject`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(rejectC.status).toBe(200);
    expect(rejectC.body.data.status).toBe("REJECTED");
  });

  it("6. Messaging: DM deduplication, sequenced idempotent messages, cursor pagination & unread counts", async () => {
    if (!dbAvailable) return;

    // Create DIRECT conversation A <-> B twice -> returns same conversationId
    const dm1 = await request(app)
      .post("/api/v1/conversations/direct")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ recipientId: userBId });
    expect(dm1.status).toBe(201);
    directConversationId = dm1.body.data.conversationId;

    const dm2 = await request(app)
      .post("/api/v1/conversations/direct")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ recipientId: userAId });
    expect(dm2.status).toBe(200);
    expect(dm2.body.data.conversationId).toBe(directConversationId);

    // Non-member (User C) cannot read project group chat
    await request(app)
      .get(`/api/v1/conversations/${groupConversationId}/messages`)
      .set("Authorization", `Bearer ${tokenC}`)
      .expect(403);

    // Send message #1 to group chat (User A)
    const msg1 = await request(app)
      .post(`/api/v1/conversations/${groupConversationId}/messages`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ clientMessageId: `cli-${runSuffix}-1`, content: "Welcome aboard!" });
    expect(msg1.status).toBe(201);
    expect(msg1.body.data.sequenceNumber).toBe(1);

    // Idempotent retry with same clientMessageId returns existing message without incrementing sequence
    const msg1Retry = await request(app)
      .post(`/api/v1/conversations/${groupConversationId}/messages`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ clientMessageId: `cli-${runSuffix}-1`, content: "Welcome aboard!" });
    expect(msg1Retry.status).toBe(200);
    expect(msg1Retry.body.meta.deduplicated).toBe(true);
    expect(msg1Retry.body.data.sequenceNumber).toBe(1);

    // Send message #2
    const msg2 = await request(app)
      .post(`/api/v1/conversations/${groupConversationId}/messages`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ clientMessageId: `cli-${runSuffix}-2`, content: "Sprint kickoff at 8pm" });
    expect(msg2.status).toBe(201);
    expect(msg2.body.data.sequenceNumber).toBe(2);

    // User B inbox shows 2 unread messages (R20)
    const inboxB = await request(app)
      .get("/api/v1/conversations")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(inboxB.status).toBe(200);
    const groupEntry = inboxB.body.data.find(
      (c: { conversationId: number }) => c.conversationId === groupConversationId
    );
    expect(groupEntry.unreadMessagesCount).toBe(2);

    // Cursor pagination afterSequence=1 returns only message #2 (R22)
    const pageAfter1 = await request(app)
      .get(`/api/v1/conversations/${groupConversationId}/messages`)
      .query({ afterSequence: 1 })
      .set("Authorization", `Bearer ${tokenB}`);
    expect(pageAfter1.status).toBe(200);
    expect(pageAfter1.body.data).toHaveLength(1);
    expect(pageAfter1.body.data[0].sequenceNumber).toBe(2);

    // Mark read -> unread drops to 0
    await request(app)
      .patch(`/api/v1/conversations/${groupConversationId}/read`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({})
      .expect(200);

    const inboxAfterRead = await request(app)
      .get("/api/v1/conversations")
      .set("Authorization", `Bearer ${tokenB}`);
    const groupAfter = inboxAfterRead.body.data.find(
      (c: { conversationId: number }) => c.conversationId === groupConversationId
    );
    expect(groupAfter.unreadMessagesCount).toBe(0);
  });

  it("7. Notifications, preferences, team member removal, and Admin RBAC + audit logs", async () => {
    if (!dbAvailable) return;

    // User B has unread notifications (accepted + messages)
    const unreadRes = await request(app)
      .get("/api/v1/notifications/unread-count")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(unreadRes.status).toBe(200);
    expect(unreadRes.body.data.unreadCount).toBeGreaterThan(0);

    // Mark all read (W10)
    const readAll = await request(app)
      .patch("/api/v1/notifications/read-all")
      .set("Authorization", `Bearer ${tokenB}`);
    expect(readAll.status).toBe(200);
    expect(readAll.body.data.updatedCount).toBeGreaterThan(0);

    // Promote and then remove User B from project -> removed from group chat too
    await request(app)
      .patch(`/api/v1/projects/${projectId}/members/${userBId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ role: "ADMIN" })
      .expect(200);

    await request(app)
      .delete(`/api/v1/projects/${projectId}/members/${userBId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    await request(app)
      .get(`/api/v1/conversations/${groupConversationId}/messages`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(403);

    // Student cannot call admin endpoints
    await request(app)
      .get("/api/v1/admin/metrics")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(403);

    // Admin fetches metrics (R24), suspends User C, moderates project, inspects audit logs (R25)
    const metrics = await request(app)
      .get("/api/v1/admin/metrics")
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(metrics.status).toBe(200);
    expect(metrics.body.data.activeStudents).toBeGreaterThanOrEqual(4);

    await request(app)
      .post(`/api/v1/admin/users/${userCId}/suspend`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ reason: "Spam test" })
      .expect(200);

    // Suspended User C can no longer access authenticated endpoints
    await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${tokenC}`)
      .expect(403);

    await request(app)
      .post(`/api/v1/admin/users/${userCId}/activate`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ reason: "Appeal approved" })
      .expect(200);

    await request(app)
      .post(`/api/v1/admin/projects/${projectId}/moderate`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ status: "PAUSED", reason: "Policy review" })
      .expect(200);

    const auditLogs = await request(app)
      .get("/api/v1/admin/audit-logs")
      .set("Authorization", `Bearer ${tokenAdmin}`);
    expect(auditLogs.status).toBe(200);
    expect(auditLogs.body.data.length).toBeGreaterThanOrEqual(3);
  });
});
