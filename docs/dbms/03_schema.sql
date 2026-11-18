CREATE SCHEMA IF NOT EXISTS collabryd;
SET search_path TO collabryd;

CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    account_status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (account_status IN ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_verification_tokens (
    token_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_sessions (
    session_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    institution VARCHAR(150) NOT NULL,
    course_program VARCHAR(150) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    department VARCHAR(100),
    preferred_project_type VARCHAR(50),
    availability_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' CHECK (availability_status IN ('AVAILABLE', 'BUSY', 'NOT_LOOKING')),
    profile_visibility VARCHAR(30) NOT NULL DEFAULT 'PUBLIC' CHECK (profile_visibility IN ('PUBLIC', 'CAMPUS_ONLY', 'PRIVATE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE achievements (
    achievement_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    issuer VARCHAR(150),
    date_achieved DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE social_links (
    link_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('GITHUB', 'LINKEDIN', 'PORTFOLIO', 'TWITTER', 'OTHER')),
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
    skill_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interests (
    interest_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    domain VARCHAR(80) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    role_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_skills (
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(skill_id) ON DELETE RESTRICT,
    proficiency_level VARCHAR(20) NOT NULL CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    years_experience NUMERIC(3,1) CHECK (years_experience >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE user_interests (
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    interest_id BIGINT NOT NULL REFERENCES interests(interest_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, interest_id)
);

CREATE TABLE user_preferred_roles (
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(role_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE projects (
    project_id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    summary VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    project_type VARCHAR(40) NOT NULL CHECK (project_type IN ('HACKATHON', 'CAPSTONE', 'COMPETITION', 'RESEARCH', 'OPEN_SOURCE', 'PERSONAL')),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'OPEN', 'PAUSED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'ARCHIVED')),
    visibility VARCHAR(30) NOT NULL DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'CAMPUS_ONLY', 'PRIVATE')),
    min_team_size INTEGER NOT NULL DEFAULT 1 CHECK (min_team_size >= 1),
    max_team_size INTEGER NOT NULL DEFAULT 4 CHECK (max_team_size >= 1),
    application_deadline TIMESTAMPTZ,
    start_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (max_team_size >= min_team_size)
);

CREATE TABLE project_skills (
    project_id BIGINT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(skill_id) ON DELETE RESTRICT,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, skill_id)
);

CREATE TABLE project_roles (
    project_role_id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(role_id) ON DELETE RESTRICT,
    open_positions INTEGER NOT NULL DEFAULT 1 CHECK (open_positions >= 1),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, role_id)
);

CREATE TABLE applications (
    application_id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    applicant_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id BIGINT REFERENCES roles(role_id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'CANCELLED')),
    message TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ
);

CREATE TABLE project_members (
    project_id BIGINT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    role VARCHAR(30) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE conversations (
    conversation_id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('DIRECT', 'GROUP')),
    project_id BIGINT UNIQUE REFERENCES projects(project_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_members (
    conversation_id BIGINT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    last_read_sequence BIGINT NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    message_id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    client_message_id VARCHAR(100) NOT NULL,
    sequence_number BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (conversation_id, sequence_number),
    UNIQUE (conversation_id, client_message_id)
);

CREATE TABLE notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('APPLICATION_RECEIVED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'TEAM_MEMBER_ADDED', 'TEAM_MEMBER_REMOVED', 'NEW_MESSAGE', 'PROJECT_STATUS_CHANGED')),
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_preferences (
    user_id BIGINT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    email_on_application BOOLEAN NOT NULL DEFAULT TRUE,
    email_on_team_change BOOLEAN NOT NULL DEFAULT TRUE,
    email_on_message BOOLEAN NOT NULL DEFAULT FALSE,
    inapp_notifications BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE admin_audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    action VARCHAR(50) NOT NULL CHECK (action IN ('ACCOUNT_SUSPENDED', 'ACCOUNT_ACTIVATED', 'PROJECT_MODERATED', 'ROLE_OVERRIDE')),
    target_type VARCHAR(50) NOT NULL,
    target_id BIGINT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_active_application ON applications(project_id, applicant_id) WHERE status = 'PENDING';
CREATE INDEX idx_users_account_status ON users(account_status);
CREATE INDEX idx_user_profiles_institution ON user_profiles(institution);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX idx_user_interests_interest ON user_interests(interest_id);
CREATE INDEX idx_projects_status_created ON projects(status, created_at DESC);
CREATE INDEX idx_projects_category_type ON projects(category, project_type);
CREATE INDEX idx_project_skills_skill ON project_skills(skill_id);
CREATE INDEX idx_applications_project_status ON applications(project_id, status);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_conversation_members_user ON conversation_members(user_id);
CREATE INDEX idx_messages_conv_seq ON messages(conversation_id, sequence_number);
CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_id, is_read, created_at DESC);

