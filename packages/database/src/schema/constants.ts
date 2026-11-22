import { pgSchema } from "drizzle-orm/pg-core";

export const collabrydSchema = pgSchema("collabryd");

export const ACCOUNT_STATUSES = [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
  "DEACTIVATED",
] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const SYSTEM_ROLES = ["STUDENT", "ADMIN"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const AVAILABILITY_STATUSES = [
  "AVAILABLE",
  "BUSY",
  "NOT_LOOKING",
] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const PROFILE_VISIBILITIES = [
  "PUBLIC",
  "CAMPUS_ONLY",
  "PRIVATE",
] as const;
export type ProfileVisibility = (typeof PROFILE_VISIBILITIES)[number];

export const SOCIAL_PLATFORMS = [
  "GITHUB",
  "LINKEDIN",
  "PORTFOLIO",
  "TWITTER",
  "OTHER",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const PROFICIENCY_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
] as const;
export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];

export const PROJECT_TYPES = [
  "HACKATHON",
  "CAPSTONE",
  "COMPETITION",
  "RESEARCH",
  "OPEN_SOURCE",
  "PERSONAL",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const PROJECT_STATUSES = [
  "DRAFT",
  "OPEN",
  "PAUSED",
  "IN_PROGRESS",
  "COMPLETED",
  "CLOSED",
  "ARCHIVED",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_VISIBILITIES = [
  "PUBLIC",
  "CAMPUS_ONLY",
  "PRIVATE",
] as const;
export type ProjectVisibility = (typeof PROJECT_VISIBILITIES)[number];

export const APPLICATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "CANCELLED",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const PROJECT_MEMBER_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
export type ProjectMemberRole = (typeof PROJECT_MEMBER_ROLES)[number];

export const CONVERSATION_TYPES = ["DIRECT", "GROUP"] as const;
export type ConversationType = (typeof CONVERSATION_TYPES)[number];

export const NOTIFICATION_TYPES = [
  "APPLICATION_RECEIVED",
  "APPLICATION_ACCEPTED",
  "APPLICATION_REJECTED",
  "TEAM_MEMBER_ADDED",
  "TEAM_MEMBER_REMOVED",
  "NEW_MESSAGE",
  "PROJECT_STATUS_CHANGED",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const ADMIN_AUDIT_ACTIONS = [
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_ACTIVATED",
  "PROJECT_MODERATED",
  "ROLE_OVERRIDE",
] as const;
export type AdminAuditAction = (typeof ADMIN_AUDIT_ACTIONS)[number];
