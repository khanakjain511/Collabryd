export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Collabryd API",
    version: "1.0.0",
    description:
      "Campus-first student collaboration and project recruitment REST API backed by PostgreSQL (collabryd schema) and Drizzle ORM.",
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  tags: [
    { name: "Health" },
    { name: "Auth" },
    { name: "Catalog" },
    { name: "Profiles & Students" },
    { name: "Projects" },
    { name: "Applications" },
    { name: "Project Members" },
    { name: "Recommendations" },
    { name: "Conversations & Messages" },
    { name: "Notifications" },
    { name: "Admin" },
  ],
  paths: {
    "/auth/register": {
      post: { tags: ["Auth"], summary: "Register a student account and profile" },
    },
    "/auth/verify-email": {
      post: { tags: ["Auth"], summary: "Verify email token and activate account" },
    },
    "/auth/resend-verification": {
      post: { tags: ["Auth"], summary: "Re-issue email verification token" },
    },
    "/auth/login": {
      post: { tags: ["Auth"], summary: "Authenticate and issue JWT access + refresh tokens" },
    },
    "/auth/refresh": {
      post: { tags: ["Auth"], summary: "Rotate refresh session and issue fresh tokens" },
    },
    "/auth/logout": {
      post: { tags: ["Auth"], summary: "Revoke a refresh session" },
    },
    "/auth/logout-all": {
      post: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        summary: "Revoke all active sessions for current user",
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        summary: "Get current authenticated user and profile",
      },
    },
    "/auth/password": {
      patch: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        summary: "Change password and revoke existing refresh sessions",
      },
    },
    "/catalog/skills": {
      get: { tags: ["Catalog"], summary: "List/search skills with student counts" },
      post: {
        tags: ["Catalog"],
        security: [{ bearerAuth: [] }],
        summary: "Admin: add skill to catalog",
      },
    },
    "/catalog/interests": {
      get: { tags: ["Catalog"], summary: "List/search interests with follower counts" },
      post: {
        tags: ["Catalog"],
        security: [{ bearerAuth: [] }],
        summary: "Admin: add interest to catalog",
      },
    },
    "/catalog/roles": {
      get: { tags: ["Catalog"], summary: "List/search roles with total openings" },
      post: {
        tags: ["Catalog"],
        security: [{ bearerAuth: [] }],
        summary: "Admin: add role to catalog",
      },
    },
    "/profiles/me": {
      get: {
        tags: ["Profiles & Students"],
        security: [{ bearerAuth: [] }],
        summary: "Get full profile, skills, interests, roles, achievements, social links",
      },
      put: {
        tags: ["Profiles & Students"],
        security: [{ bearerAuth: [] }],
        summary: "Create or update own student profile",
      },
    },
    "/profiles/me/skills": {
      post: {
        tags: ["Profiles & Students"],
        security: [{ bearerAuth: [] }],
        summary: "Upsert a single student skill",
      },
      put: {
        tags: ["Profiles & Students"],
        security: [{ bearerAuth: [] }],
        summary: "Replace full student skills portfolio",
      },
    },
    "/profiles/me/skills/{skillId}": {
      delete: { tags: ["Profiles & Students"], security: [{ bearerAuth: [] }], summary: "Remove a profile skill" },
    },
    "/profiles/me/interests": {
      put: { tags: ["Profiles & Students"], security: [{ bearerAuth: [] }], summary: "Replace profile interests" },
    },
    "/profiles/me/preferred-roles": {
      put: { tags: ["Profiles & Students"], security: [{ bearerAuth: [] }], summary: "Replace preferred roles" },
    },
    "/profiles/me/achievements": {
      post: { tags: ["Profiles & Students"], security: [{ bearerAuth: [] }], summary: "Create an achievement" },
    },
    "/profiles/me/achievements/{achievementId}": {
      patch: { tags: ["Profiles & Students"], security: [{ bearerAuth: [] }], summary: "Update an achievement" },
      delete: { tags: ["Profiles & Students"], security: [{ bearerAuth: [] }], summary: "Remove an achievement" },
    },
    "/profiles/me/social-links": {
      post: { tags: ["Profiles & Students"], security: [{ bearerAuth: [] }], summary: "Add a social link" },
    },
    "/profiles/me/social-links/{linkId}": {
      patch: { tags: ["Profiles & Students"], security: [{ bearerAuth: [] }], summary: "Update a social link" },
      delete: { tags: ["Profiles & Students"], security: [{ bearerAuth: [] }], summary: "Remove a social link" },
    },
    "/projects/{projectId}/skills": {
      put: { tags: ["Projects"], security: [{ bearerAuth: [] }], summary: "Replace project skills" },
    },
    "/projects/{projectId}/skills/{skillId}": {
      delete: { tags: ["Projects"], security: [{ bearerAuth: [] }], summary: "Remove a project skill" },
    },
    "/projects/{projectId}/roles": {
      put: { tags: ["Projects"], security: [{ bearerAuth: [] }], summary: "Replace project roles" },
    },
    "/projects/{projectId}/roles/{roleId}": {
      delete: { tags: ["Projects"], security: [{ bearerAuth: [] }], summary: "Remove a project role" },
    },
    "/students": {
      get: {
        tags: ["Profiles & Students"],
        summary: "Discover students filtered by skill, interest, role, availability, institution",
      },
    },
    "/students/{userId}": {
      get: {
        tags: ["Profiles & Students"],
        summary: "Get visibility-checked student profile",
      },
    },
    "/projects": {
      get: {
        tags: ["Projects"],
        summary: "Discover projects filtered by category, type, skill, role, status, search",
      },
      post: {
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        summary: "Create a project with owner membership and group conversation",
      },
    },
    "/projects/{projectId}": {
      get: { tags: ["Projects"], summary: "Get full project detail with team, skills, and roles" },
      patch: {
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        summary: "Update project metadata",
      },
      delete: {
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        summary: "Delete project (owner only)",
      },
    },
    "/projects/{projectId}/status": {
      patch: {
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        summary: "Transition project status and notify members",
      },
    },
    "/projects/{projectId}/capacity": {
      get: { tags: ["Projects"], summary: "Get team member count and remaining capacity" },
    },
    "/projects/{projectId}/recommendations": {
      get: {
        tags: ["Recommendations"],
        security: [{ bearerAuth: [] }],
        summary: "Recommend skill-matched student candidates for project",
      },
    },
    "/recommendations/projects": {
      get: {
        tags: ["Recommendations"],
        security: [{ bearerAuth: [] }],
        summary: "Recommend open projects matching current student skills",
      },
    },
    "/projects/{projectId}/applications": {
      post: {
        tags: ["Applications"],
        security: [{ bearerAuth: [] }],
        summary: "Submit a project application",
      },
      get: {
        tags: ["Applications"],
        security: [{ bearerAuth: [] }],
        summary: "List applications for a project (owner/admin)",
      },
    },
    "/applications/me": {
      get: {
        tags: ["Applications"],
        security: [{ bearerAuth: [] }],
        summary: "List current student's submitted applications",
      },
    },
    "/applications/incoming": {
      get: {
        tags: ["Applications"],
        security: [{ bearerAuth: [] }],
        summary: "List incoming pending applications across managed projects",
      },
    },
    "/applications/{applicationId}/accept": {
      post: {
        tags: ["Applications"],
        security: [{ bearerAuth: [] }],
        summary: "Transactionally accept application, add to team & group chat, and notify",
      },
    },
    "/applications/{applicationId}/reject": {
      post: {
        tags: ["Applications"],
        security: [{ bearerAuth: [] }],
        summary: "Reject pending application and notify applicant",
      },
    },
    "/applications/{applicationId}/withdraw": {
      post: {
        tags: ["Applications"],
        security: [{ bearerAuth: [] }],
        summary: "Withdraw own pending application",
      },
    },
    "/projects/{projectId}/members": {
      get: { tags: ["Project Members"], summary: "List project team roster" },
    },
    "/projects/{projectId}/members/{userId}": {
      patch: {
        tags: ["Project Members"],
        security: [{ bearerAuth: [] }],
        summary: "Update member role or transfer ownership",
      },
      delete: {
        tags: ["Project Members"],
        security: [{ bearerAuth: [] }],
        summary: "Leave project or remove member from team and group chat",
      },
    },
    "/conversations": {
      get: {
        tags: ["Conversations & Messages"],
        security: [{ bearerAuth: [] }],
        summary: "List conversation inbox with unread counts",
      },
    },
    "/conversations/direct": {
      post: {
        tags: ["Conversations & Messages"],
        security: [{ bearerAuth: [] }],
        summary: "Create or fetch direct conversation between two users",
      },
    },
    "/conversations/project/{projectId}": {
      get: {
        tags: ["Conversations & Messages"],
        security: [{ bearerAuth: [] }],
        summary: "Get project group conversation",
      },
    },
    "/conversations/{conversationId}/messages": {
      get: {
        tags: ["Conversations & Messages"],
        security: [{ bearerAuth: [] }],
        summary: "Cursor-paginated conversation message history",
      },
      post: {
        tags: ["Conversations & Messages"],
        security: [{ bearerAuth: [] }],
        summary: "Send sequenced, clientMessageId-idempotent message",
      },
    },
    "/conversations/{conversationId}/read": {
      patch: {
        tags: ["Conversations & Messages"],
        security: [{ bearerAuth: [] }],
        summary: "Update last_read_sequence for conversation",
      },
    },
    "/notifications": {
      get: {
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        summary: "List notifications (supports unreadOnly=true)",
      },
    },
    "/notifications/unread-count": {
      get: {
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        summary: "Get unread notification count",
      },
    },
    "/notifications/read-all": {
      patch: {
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        summary: "Mark all notifications as read",
      },
    },
    "/notifications/{notificationId}/read": {
      patch: {
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        summary: "Mark a single notification as read",
      },
    },
    "/notifications/preferences": {
      get: {
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        summary: "Get notification preferences",
      },
      patch: {
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        summary: "Update notification preferences",
      },
    },
    "/admin/metrics": {
      get: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Platform summary operational metrics",
      },
    },
    "/admin/audit-logs": {
      get: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "List admin audit logs",
      },
    },
    "/admin/users/{userId}/suspend": {
      post: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Suspend user account and revoke active sessions",
      },
    },
    "/admin/users/{userId}/activate": {
      post: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Activate user account",
      },
    },
    "/admin/projects/{projectId}/moderate": {
      post: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Moderate project status with audit log",
      },
    },
    "/admin/projects/{projectId}/members/{userId}/role-override": {
      post: {
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        summary: "Override project member role with audit log",
      },
    },
  },
} as const;
