import path from "node:path";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import { closePool, db } from "./client.js";
import {
  achievements,
  applications,
  conversationMembers,
  conversations,
  interests,
  messages,
  notificationPreferences,
  notifications,
  projectMembers,
  projectRoles,
  projects,
  projectSkills,
  roles,
  skills,
  socialLinks,
  userInterests,
  userPreferredRoles,
  userProfiles,
  users,
  userSkills,
} from "./schema/index.js";

const __filename = fileURLToPath(import.meta.url);

// Pre-computed Argon2id hash for demo password: "Password123!"
// Generated dynamically when argon2 is available, or overridden via SEED_PASSWORD_HASH.
async function hashDemoPassword(plain: string): Promise<string> {
  try {
    const argon2 = await import("argon2");
    return await argon2.hash(plain, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });
  } catch {
    if (process.env.SEED_PASSWORD_HASH) {
      return process.env.SEED_PASSWORD_HASH;
    }
    throw new Error(
      "Unable to hash demo password: install argon2 or provide SEED_PASSWORD_HASH"
    );
  }
}

export async function seedDatabase(): Promise<void> {
  const catalogSkills = [
    { name: "TypeScript", category: "Languages" },
    { name: "Python", category: "Languages" },
    { name: "Go", category: "Languages" },
    { name: "Rust", category: "Languages" },
    { name: "C++", category: "Languages" },
    { name: "React", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "Tailwind CSS", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "Express", category: "Backend" },
    { name: "FastAPI", category: "Backend" },
    { name: "PostgreSQL", category: "Database" },
    { name: "Redis", category: "Database" },
    { name: "Docker", category: "DevOps" },
    { name: "Kubernetes", category: "DevOps" },
    { name: "PyTorch", category: "AI/ML" },
    { name: "LangChain", category: "AI/ML" },
    { name: "Flutter", category: "Mobile" },
    { name: "Figma", category: "Design" },
    { name: "Solidity", category: "Web3" },
  ];

  const catalogInterests = [
    { name: "Generative AI", domain: "AI/ML" },
    { name: "Computer Vision", domain: "AI/ML" },
    { name: "Distributed Systems", domain: "Systems" },
    { name: "Developer Tools", domain: "Software Engineering" },
    { name: "FinTech", domain: "Product" },
    { name: "EdTech", domain: "Product" },
    { name: "Cybersecurity", domain: "Security" },
    { name: "Robotics & IoT", domain: "Hardware" },
    { name: "Open Source", domain: "Community" },
    { name: "UI/UX Design", domain: "Design" },
  ];

  const catalogRoles = [
    {
      name: "Backend Engineer",
      description: "Designs APIs, databases, and scalable server architectures.",
    },
    {
      name: "Frontend Engineer",
      description: "Builds responsive web interfaces and client-side state.",
    },
    {
      name: "Full-Stack Developer",
      description: "Contributes across frontend, backend, and deployment.",
    },
    {
      name: "ML Engineer",
      description: "Trains, evaluates, and deploys machine learning models.",
    },
    {
      name: "UI/UX Designer",
      description: "Crafts wireframes, prototypes, and visual design systems.",
    },
    {
      name: "Mobile Developer",
      description: "Develops cross-platform or native iOS/Android applications.",
    },
    {
      name: "DevOps Engineer",
      description: "Manages CI/CD pipelines, containers, and cloud infra.",
    },
    {
      name: "Product Manager",
      description: "Coordinates roadmap, user research, and sprint priorities.",
    },
  ];

  await db.insert(skills).values(catalogSkills).onConflictDoNothing();
  await db.insert(interests).values(catalogInterests).onConflictDoNothing();
  await db.insert(roles).values(catalogRoles).onConflictDoNothing();

  const allSkills = await db.select().from(skills);
  const allInterests = await db.select().from(interests);
  const allRoles = await db.select().from(roles);

  const skillByName = new Map(allSkills.map((s) => [s.name, s.skillId]));
  const interestByName = new Map(
    allInterests.map((i) => [i.name, i.interestId])
  );
  const roleByName = new Map(allRoles.map((r) => [r.name, r.roleId]));

  const passwordHash = await hashDemoPassword("Password123!");

  const demoUsers = [
    {
      email: "admin@campus.edu",
      systemRole: "ADMIN" as const,
      profile: {
        displayName: "Campus Admin",
        bio: "Platform administrator for Collabryd Campus.",
        institution: "IIT Delhi",
        courseProgram: "Administration",
        academicYear: "Staff",
        department: "Student Affairs",
        preferredProjectType: "OPEN_SOURCE",
        availabilityStatus: "NOT_LOOKING" as const,
        profileVisibility: "CAMPUS_ONLY" as const,
      },
      skills: [{ name: "PostgreSQL", level: "EXPERT" as const, years: "5.0" }],
      interests: ["Open Source"],
      roles: ["Product Manager"],
    },
    {
      email: "aarav.sharma@campus.edu",
      systemRole: "STUDENT" as const,
      profile: {
        displayName: "Aarav Sharma",
        bio: "Backend & distributed systems enthusiast building campus developer tools.",
        institution: "IIT Delhi",
        courseProgram: "B.Tech Computer Science",
        academicYear: "3rd Year",
        department: "Computer Science",
        preferredProjectType: "HACKATHON",
        availabilityStatus: "AVAILABLE" as const,
        profileVisibility: "PUBLIC" as const,
      },
      skills: [
        { name: "TypeScript", level: "ADVANCED" as const, years: "2.5" },
        { name: "Node.js", level: "ADVANCED" as const, years: "2.5" },
        { name: "PostgreSQL", level: "INTERMEDIATE" as const, years: "1.5" },
        { name: "Docker", level: "INTERMEDIATE" as const, years: "1.0" },
      ],
      interests: ["Distributed Systems", "Developer Tools"],
      roles: ["Backend Engineer", "Full-Stack Developer"],
    },
    {
      email: "diya.verma@campus.edu",
      systemRole: "STUDENT" as const,
      profile: {
        displayName: "Diya Verma",
        bio: "ML researcher focused on multimodal LLMs and applied AI products.",
        institution: "IIT Delhi",
        courseProgram: "B.Tech AI & Data Science",
        academicYear: "4th Year",
        department: "Artificial Intelligence",
        preferredProjectType: "RESEARCH",
        availabilityStatus: "AVAILABLE" as const,
        profileVisibility: "PUBLIC" as const,
      },
      skills: [
        { name: "Python", level: "EXPERT" as const, years: "3.5" },
        { name: "PyTorch", level: "ADVANCED" as const, years: "2.0" },
        { name: "FastAPI", level: "ADVANCED" as const, years: "2.0" },
        { name: "LangChain", level: "INTERMEDIATE" as const, years: "1.0" },
      ],
      interests: ["Generative AI", "Computer Vision"],
      roles: ["ML Engineer", "Backend Engineer"],
    },
    {
      email: "kabir.mehta@campus.edu",
      systemRole: "STUDENT" as const,
      profile: {
        displayName: "Kabir Mehta",
        bio: "Frontend engineer and product designer crafting fast, accessible UIs.",
        institution: "IIT Delhi",
        courseProgram: "B.Des + CS Minor",
        academicYear: "2nd Year",
        department: "Design",
        preferredProjectType: "HACKATHON",
        availabilityStatus: "AVAILABLE" as const,
        profileVisibility: "CAMPUS_ONLY" as const,
      },
      skills: [
        { name: "React", level: "ADVANCED" as const, years: "2.0" },
        { name: "TypeScript", level: "INTERMEDIATE" as const, years: "1.5" },
        { name: "Tailwind CSS", level: "EXPERT" as const, years: "2.5" },
        { name: "Figma", level: "ADVANCED" as const, years: "3.0" },
      ],
      interests: ["UI/UX Design", "EdTech"],
      roles: ["Frontend Engineer", "UI/UX Designer"],
    },
  ];

  const userIdByEmail = new Map<string, number>();

  for (const item of demoUsers) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, item.email));

    let userId: number;
    if (existing.length > 0 && existing[0]) {
      userId = existing[0].userId;
    } else {
      const [inserted] = await db
        .insert(users)
        .values({
          email: item.email,
          passwordHash,
          accountStatus: "ACTIVE",
          systemRole: item.systemRole,
        })
        .returning({ userId: users.userId });
      userId = inserted!.userId;
    }

    userIdByEmail.set(item.email, userId);

    await db
      .insert(userProfiles)
      .values({ userId, ...item.profile })
      .onConflictDoNothing();

    await db
      .insert(notificationPreferences)
      .values({ userId })
      .onConflictDoNothing();

    for (const s of item.skills) {
      const skillId = skillByName.get(s.name);
      if (skillId) {
        await db
          .insert(userSkills)
          .values({
            userId,
            skillId,
            proficiencyLevel: s.level,
            yearsExperience: s.years,
          })
          .onConflictDoNothing();
      }
    }

    for (const iName of item.interests) {
      const interestId = interestByName.get(iName);
      if (interestId) {
        await db
          .insert(userInterests)
          .values({ userId, interestId })
          .onConflictDoNothing();
      }
    }

    for (const rName of item.roles) {
      const roleId = roleByName.get(rName);
      if (roleId) {
        await db
          .insert(userPreferredRoles)
          .values({ userId, roleId })
          .onConflictDoNothing();
      }
    }
  }

  const aaravId = userIdByEmail.get("aarav.sharma@campus.edu")!;
  const diyaId = userIdByEmail.get("diya.verma@campus.edu")!;
  const kabirId = userIdByEmail.get("kabir.mehta@campus.edu")!;

  const existingAchievements = await db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, aaravId));
  if (existingAchievements.length === 0) {
    await db.insert(achievements).values({
      userId: aaravId,
      title: "Winner — Smart Campus Hackathon 2025",
      description: "Built a real-time shuttle tracking backend serving 4,000+ students.",
      issuer: "IIT Delhi Tech Club",
      dateAchieved: "2025-10-15",
    });
  }

  const existingLinks = await db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.userId, aaravId));
  if (existingLinks.length === 0) {
    await db.insert(socialLinks).values({
      userId: aaravId,
      platform: "GITHUB",
      url: "https://github.com/aarav-campus",
    });
  }

  const existingProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerId, diyaId));

  if (existingProjects.length === 0) {
    const [project] = await db
      .insert(projects)
      .values({
        ownerId: diyaId,
        title: "CampusMind — Academic Paper Copilot",
        summary: "RAG-powered study assistant trained on open-access lecture notes.",
        description:
          "We are building an open-source campus research assistant that indexes course PDFs, cites exact page spans, and lets study groups collaborate in real time.",
        category: "Artificial Intelligence",
        projectType: "HACKATHON",
        status: "OPEN",
        visibility: "PUBLIC",
        minTeamSize: 2,
        maxTeamSize: 4,
      })
      .returning();

    const projectId = project!.projectId;

    await db.insert(projectMembers).values([
      { projectId, userId: diyaId, role: "OWNER" },
      { projectId, userId: aaravId, role: "ADMIN" },
    ]);

    const projSkills = [
      { skillId: skillByName.get("Python")!, isRequired: true },
      { skillId: skillByName.get("TypeScript")!, isRequired: true },
      { skillId: skillByName.get("React")!, isRequired: true },
      { skillId: skillByName.get("PostgreSQL")!, isRequired: false },
    ];
    await db
      .insert(projectSkills)
      .values(projSkills.map((s) => ({ projectId, ...s })))
      .onConflictDoNothing();

    await db
      .insert(projectRoles)
      .values([
        {
          projectId,
          roleId: roleByName.get("Frontend Engineer")!,
          openPositions: 1,
          description: "Own the React + Tailwind PDF viewer and citation UI.",
        },
        {
          projectId,
          roleId: roleByName.get("UI/UX Designer")!,
          openPositions: 1,
          description: "Design intuitive study room and search flows.",
        },
      ])
      .onConflictDoNothing();

    const [groupConv] = await db
      .insert(conversations)
      .values({ type: "GROUP", projectId })
      .returning();

    await db.insert(conversationMembers).values([
      {
        conversationId: groupConv!.conversationId,
        userId: diyaId,
        lastReadSequence: 1,
      },
      {
        conversationId: groupConv!.conversationId,
        userId: aaravId,
        lastReadSequence: 0,
      },
    ]);

    await db.insert(messages).values({
      conversationId: groupConv!.conversationId,
      senderId: diyaId,
      clientMessageId: "seed-msg-welcome-1",
      sequenceNumber: 1,
      content: "Welcome to CampusMind! Let's finalize the API contract tonight.",
    });

    const [app] = await db
      .insert(applications)
      .values({
        projectId,
        applicantId: kabirId,
        roleId: roleByName.get("Frontend Engineer")!,
        status: "PENDING",
        message: "Love the idea! I have built PDF annotation UIs with React and Tailwind.",
      })
      .returning();

    await db.insert(notifications).values({
      recipientId: diyaId,
      type: "APPLICATION_RECEIVED",
      resourceType: "APPLICATION",
      resourceId: app!.applicationId,
      message: "Kabir Mehta applied for Frontend Engineer on CampusMind — Academic Paper Copilot.",
    });
  }
}

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectExecution) {
  seedDatabase()
    .then(() => {
      console.log("Database seed completed successfully.");
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exitCode = 1;
    })
    .finally(() => closePool());
}
