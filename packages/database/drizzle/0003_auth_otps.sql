SET search_path TO collabryd;

CREATE TABLE IF NOT EXISTS auth_otps (
    otp_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(30) NOT NULL DEFAULT 'SIGNUP' CHECK (purpose IN ('SIGNUP', 'LOGIN')),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_otps_user_purpose ON auth_otps (user_id, purpose);
CREATE INDEX IF NOT EXISTS idx_auth_otps_email_purpose ON auth_otps (email, purpose);
