import { relations } from "drizzle-orm";
import { adminAuditLogs } from "./admin.js";
import {
  emailVerificationTokens,
  refreshSessions,
  users,
} from "./auth.js";
import {
  interests,
  roles,
  skills,
  userInterests,
  userPreferredRoles,
  userSkills,
} from "./catalog.js";
import {
  conversationMembers,
  conversations,
  messages,
} from "./messaging.js";
import { notificationPreferences, notifications } from "./notifications.js";
import { achievements, socialLinks, userProfiles } from "./profiles.js";
import {
  applications,
  projectMembers,
  projectRoles,
  projects,
  projectSkills,
} from "./projects.js";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.userId],
    references: [userProfiles.userId],
  }),
  notificationPreferences: one(notificationPreferences, {
    fields: [users.userId],
    references: [notificationPreferences.userId],
  }),
  emailVerificationTokens: many(emailVerificationTokens),
  refreshSessions: many(refreshSessions),
  achievements: many(achievements),
  socialLinks: many(socialLinks),
  skills: many(userSkills),
  interests: many(userInterests),
  preferredRoles: many(userPreferredRoles),
  ownedProjects: many(projects),
  applications: many(applications),
  projectMemberships: many(projectMembers),
  conversationMemberships: many(conversationMembers),
  sentMessages: many(messages),
  notifications: many(notifications),
  adminAuditLogs: many(adminAuditLogs),
}));

export const emailVerificationTokensRelations = relations(
  emailVerificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [emailVerificationTokens.userId],
      references: [users.userId],
    }),
  })
);

export const refreshSessionsRelations = relations(
  refreshSessions,
  ({ one }) => ({
    user: one(users, {
      fields: [refreshSessions.userId],
      references: [users.userId],
    }),
  })
);

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.userId],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.userId],
  }),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  user: one(users, {
    fields: [socialLinks.userId],
    references: [users.userId],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
  projectSkills: many(projectSkills),
}));

export const interestsRelations = relations(interests, ({ many }) => ({
  userInterests: many(userInterests),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userPreferredRoles: many(userPreferredRoles),
  projectRoles: many(projectRoles),
  applications: many(applications),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.userId],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.skillId],
  }),
}));

export const userInterestsRelations = relations(userInterests, ({ one }) => ({
  user: one(users, {
    fields: [userInterests.userId],
    references: [users.userId],
  }),
  interest: one(interests, {
    fields: [userInterests.interestId],
    references: [interests.interestId],
  }),
}));

export const userPreferredRolesRelations = relations(
  userPreferredRoles,
  ({ one }) => ({
    user: one(users, {
      fields: [userPreferredRoles.userId],
      references: [users.userId],
    }),
    role: one(roles, {
      fields: [userPreferredRoles.roleId],
      references: [roles.roleId],
    }),
  })
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.userId],
  }),
  skills: many(projectSkills),
  roles: many(projectRoles),
  applications: many(applications),
  members: many(projectMembers),
  conversation: one(conversations, {
    fields: [projects.projectId],
    references: [conversations.projectId],
  }),
}));

export const projectSkillsRelations = relations(projectSkills, ({ one }) => ({
  project: one(projects, {
    fields: [projectSkills.projectId],
    references: [projects.projectId],
  }),
  skill: one(skills, {
    fields: [projectSkills.skillId],
    references: [skills.skillId],
  }),
}));

export const projectRolesRelations = relations(projectRoles, ({ one }) => ({
  project: one(projects, {
    fields: [projectRoles.projectId],
    references: [projects.projectId],
  }),
  role: one(roles, {
    fields: [projectRoles.roleId],
    references: [roles.roleId],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  project: one(projects, {
    fields: [applications.projectId],
    references: [projects.projectId],
  }),
  applicant: one(users, {
    fields: [applications.applicantId],
    references: [users.userId],
  }),
  role: one(roles, {
    fields: [applications.roleId],
    references: [roles.roleId],
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.projectId],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.userId],
  }),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [conversations.projectId],
      references: [projects.projectId],
    }),
    members: many(conversationMembers),
    messages: many(messages),
  })
);

export const conversationMembersRelations = relations(
  conversationMembers,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationMembers.conversationId],
      references: [conversations.conversationId],
    }),
    user: one(users, {
      fields: [conversationMembers.userId],
      references: [users.userId],
    }),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.conversationId],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.userId],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.userId],
  }),
}));

export const notificationPreferencesRelations = relations(
  notificationPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [notificationPreferences.userId],
      references: [users.userId],
    }),
  })
);

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminAuditLogs.adminId],
    references: [users.userId],
  }),
}));
