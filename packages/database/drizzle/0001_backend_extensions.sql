-- Additive backend extensions over dbms/03_schema.sql
-- Strictly backward-compatible: adds platform admin role, conversation integrity check,
-- and performance indexes identified from dbms/plans/ execution plans.
SET search_path TO collabryd;

-- 1. Platform RBAC role to authorize admin_audit_logs actions safely
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS system_role VARCHAR(20) NOT NULL DEFAULT 'STUDENT';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_system_role_check'
          AND connamespace = 'collabryd'::regnamespace
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT users_system_role_check
            CHECK (system_role IN ('STUDENT', 'ADMIN'));
    END IF;
END $$;

-- 2. Prevent DIRECT conversations from binding to a project_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'conversations_direct_project_null_check'
          AND connamespace = 'collabryd'::regnamespace
    ) THEN
        ALTER TABLE conversations
            ADD CONSTRAINT conversations_direct_project_null_check
            CHECK (type <> 'DIRECT' OR project_id IS NULL);
    END IF;
END $$;

-- 3. Performance & integrity indexes identified from EXPLAIN ANALYZE plans
-- Fixes Seq Scan in R01 (WHERE LOWER(u.email) = ...) and prevents case-variant duplicate emails
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users (LOWER(email));

-- Fixes Seq Scan on projects in R17 (WHERE p.owner_id = $1)
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects (owner_id);

-- Fixes Seq Scan on project_members in R16 (WHERE user_id = $1)
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members (user_id);

-- Supporting FK and ordering indexes for child entities and audit reports
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements (user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_user ON social_links (user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user ON email_verification_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_sessions_user ON refresh_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs (created_at DESC);
