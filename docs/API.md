# Collabryd Backend API Reference

Base URL (local): `http://localhost:3000`  
API Version Prefix: `/api/v1`  
OpenAPI 3.1 JSON: `GET /api/v1/docs/openapi.json`

---

## Response Conventions

### Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "TEAM_CAPACITY_FULL",
    "message": "Project team has reached maximum capacity",
    "details": {}
  }
}
```

### Authentication
Send the JWT access token in the `Authorization` header:
```http
Authorization: Bearer <accessToken>
```

---

## Endpoints Overview

### Health & Documentation
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Liveness probe |
| `GET` | `/api/health/ready` | Public | PostgreSQL & Redis readiness probe |
| `GET` | `/api/v1/docs` | Public | Lightweight interactive HTML API explorer |
| `GET` | `/api/v1/docs/openapi.json` | Public | OpenAPI 3.1 JSON specification |

### Auth (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create user (`PENDING_VERIFICATION`), profile, default preferences, and verification token |
| `POST` | `/auth/verify-email` | Public | Consume verification token and activate user (`ACTIVE`) |
| `POST` | `/auth/resend-verification` | Public | Issue a fresh verification token (anti-enumeration safe) |
| `POST` | `/auth/login` | Public | Authenticate with Argon2id and issue access + refresh JWTs |
| `POST` | `/auth/refresh` | Public | Rotate refresh session; revokes all sessions on reuse detection |
| `POST` | `/auth/logout` | Public | Revoke the provided refresh token |
| `POST` | `/auth/logout-all` | Bearer | Revoke all active refresh sessions for the user |
| `GET` | `/auth/me` | Bearer | Return current user and profile summary |
| `PATCH` | `/auth/password` | Bearer | Update password and revoke all existing refresh sessions |

### Catalog (`/api/v1/catalog`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/catalog/skills` | Public | Search/list skills with student counts (`?search=&category=&page=&limit=`) |
| `POST` | `/catalog/skills` | Admin | Add a canonical skill |
| `GET` | `/catalog/interests` | Public | Search/list interests with follower counts (`?search=&domain=`) |
| `POST` | `/catalog/interests` | Admin | Add a canonical interest |
| `GET` | `/catalog/roles` | Public | Search/list roles with total project openings (`?search=`) |
| `POST` | `/catalog/roles` | Admin | Add a canonical role |

### Profiles & Student Discovery (`/api/v1/profiles`, `/api/v1/students`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/profiles/me` | Bearer | Full own profile with skills, interests, preferred roles, achievements, social links |
| `PUT` | `/profiles/me` | Bearer | Upsert own student profile |
| `POST` | `/profiles/me/skills` | Bearer | Add or update a single skill proficiency & experience |
| `PUT` | `/profiles/me/skills` | Bearer | Atomically replace full skills list |
| `DELETE` | `/profiles/me/skills/:skillId` | Bearer | Remove a skill from own profile |
| `PUT` | `/profiles/me/interests` | Bearer | Atomically replace own interests |
| `PUT` | `/profiles/me/preferred-roles` | Bearer | Atomically replace own preferred roles |
| `POST/PATCH/DELETE` | `/profiles/me/achievements(/:achievementId)` | Bearer | Manage achievements |
| `POST/PATCH/DELETE` | `/profiles/me/social-links(/:linkId)` | Bearer | Manage social links |
| `GET` | `/students` | Optional | Visibility-aware student discovery (`?search=&skillId=&interestId=&roleId=&availabilityStatus=&institution=&academicYear=`) |
| `GET` | `/students/:userId` | Optional | View student profile respecting `PUBLIC`, `CAMPUS_ONLY`, `PRIVATE` |

### Projects & Recommendations (`/api/v1/projects`, `/api/v1/recommendations`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/projects` | Optional | Discover projects (`?status=&category=&projectType=&skillId=&skillName=&roleId=&ownerId=&search=`) |
| `POST` | `/projects` | Bearer | Transactionally create project, `OWNER` membership, `GROUP` conversation, initial skills & roles |
| `GET` | `/projects/:projectId` | Optional | Project detail with owner, skills, open roles, team roster, capacity |
| `PATCH` | `/projects/:projectId` | Owner/Admin | Update project metadata and team size limits |
| `PATCH` | `/projects/:projectId/status` | Owner/Admin | Transition project status and notify team members |
| `DELETE` | `/projects/:projectId` | Owner | Delete project |
| `PUT/DELETE` | `/projects/:projectId/skills(/:skillId)` | Owner/Admin | Manage required/optional project skills |
| `PUT/DELETE` | `/projects/:projectId/roles(/:roleId)` | Owner/Admin | Manage open project roles |
| `GET` | `/projects/:projectId/capacity` | Optional | Team member count & remaining capacity |
| `GET` | `/projects/:projectId/recommendations` | Owner/Admin | Skill-ranked candidate recommendations (`R15`) |
| `GET` | `/recommendations/projects` | Bearer | Skill-ranked open project recommendations (`R16`) |

### Applications & Project Members
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/projects/:projectId/applications` | Bearer | Submit application (enforces open status, deadline, capacity, single `PENDING` per applicant/project) |
| `GET` | `/projects/:projectId/applications` | Owner/Admin | List applications for a project |
| `GET` | `/applications/me` | Bearer | Track own submitted applications (`R18`) |
| `GET` | `/applications/incoming` | Bearer | Incoming applications across managed projects (`R17`) |
| `POST` | `/applications/:applicationId/accept` | Owner/Admin | Row-locked transactional accept -> add to `project_members` & `GROUP` chat -> notify |
| `POST` | `/applications/:applicationId/reject` | Owner/Admin | Reject pending application and notify applicant |
| `POST` | `/applications/:applicationId/withdraw` | Applicant | Withdraw own pending application |
| `GET` | `/projects/:projectId/members` | Optional | List project team roster (`R13`) |
| `PATCH` | `/projects/:projectId/members/:userId` | Owner | Change member role or transfer project ownership |
| `DELETE` | `/projects/:projectId/members/:userId` | Self/Owner/Admin | Leave or remove member from team and project group conversation |

### Conversations & Messages (`/api/v1/conversations`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/conversations` | Bearer | Conversation inbox with unread message counts (`R20`) |
| `POST` | `/conversations/direct` | Bearer | Advisory-locked idempotent direct conversation creation (`R21`) |
| `GET` | `/conversations/project/:projectId` | Member | Get project group conversation |
| `GET` | `/conversations/:conversationId/messages` | Participant | Cursor-paginated messages (`?afterSequence=&beforeSequence=&limit=`, `R22`) |
| `POST` | `/conversations/:conversationId/messages` | Participant | Row-locked sequential message send with `clientMessageId` idempotency (`W09`) |
| `PATCH` | `/conversations/:conversationId/read` | Participant | Advance `last_read_sequence` |

### Notifications (`/api/v1/notifications`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications` | Bearer | List notifications (`?unreadOnly=true`) |
| `GET` | `/notifications/unread-count` | Bearer | Unread notification counter |
| `PATCH` | `/notifications/:notificationId/read` | Bearer | Mark single notification read |
| `PATCH` | `/notifications/read-all` | Bearer | Mark all unread notifications read (`W10`) |
| `GET/PATCH` | `/notifications/preferences` | Bearer | Read/update email & in-app notification preferences |

### Administration (`/api/v1/admin`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/metrics` | Admin | Operational platform metrics (`R24`) |
| `GET` | `/admin/audit-logs` | Admin | Paginated admin audit logs (`R25`) |
| `POST` | `/admin/users/:userId/suspend` | Admin | Suspend account, revoke active sessions, log audit entry |
| `POST` | `/admin/users/:userId/activate` | Admin | Reactivate account, log audit entry |
| `POST` | `/admin/projects/:projectId/moderate` | Admin | Moderate project status, notify owner, log audit entry |
| `POST` | `/admin/projects/:projectId/members/:userId/role-override` | Admin | Override project member role, log audit entry |

---

## Schema Alignment Notes

- `packages/database/drizzle/0000_collabryd_schema.sql` preserves `dbms/03_schema.sql` verbatim (all 23 tables in schema `collabryd`, all `CHECK` constraints, `ON DELETE` rules, partial unique index `uq_active_application`, and indexes).
- `packages/database/drizzle/0001_backend_extensions.sql` adds strictly backward-compatible extensions:
  - `users.system_role` (`STUDENT` | `ADMIN`, default `STUDENT`) for RBAC on `/api/v1/admin/*` and `admin_audit_logs`.
  - `CHECK (type <> 'DIRECT' OR project_id IS NULL)` on `conversations`.
  - Missing query-plan indexes (`uq_users_email_lower`, `idx_projects_owner`, `idx_project_members_user`, plus child FK indexes).
- **Future Multi-Campus Evolution:** `user_profiles.institution` is preserved for single-campus v1. Pan-India expansion should introduce a `campuses` table and `campus_id` foreign keys in a dedicated migration.
