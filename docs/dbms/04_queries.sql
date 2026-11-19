SET search_path TO collabryd;

-- R01: READ
SELECT u.user_id, u.email, u.password_hash, u.account_status, up.display_name
FROM users u
JOIN user_profiles up ON u.user_id = up.user_id
WHERE LOWER(u.email) = 'aarav.sharma1@university.edu';

-- R02: READ
SELECT u.user_id, u.email, up.display_name, up.bio, up.avatar_url, up.institution,
       up.course_program, up.academic_year, up.department, up.availability_status
FROM users u
JOIN user_profiles up ON u.user_id = up.user_id
WHERE u.user_id = 42;

-- R03: READ
SELECT s.skill_id, s.name AS skill_name, s.category, us.proficiency_level, us.years_experience
FROM user_skills us
JOIN skills s ON us.skill_id = s.skill_id
WHERE us.user_id = 42
ORDER BY us.years_experience DESC, s.name ASC;

-- R04: READ
SELECT i.interest_id, i.name AS interest_name, i.domain, r.role_id, r.name AS preferred_role
FROM users u
LEFT JOIN user_interests ui ON u.user_id = ui.user_id
LEFT JOIN interests i ON ui.interest_id = i.interest_id
LEFT JOIN user_preferred_roles upr ON u.user_id = upr.user_id
LEFT JOIN roles r ON upr.role_id = r.role_id
WHERE u.user_id = 42;

-- R05: READ
SELECT u.user_id, a.title AS achievement_title, a.issuer, a.date_achieved, sl.platform, sl.url
FROM users u
LEFT JOIN achievements a ON u.user_id = a.user_id
LEFT JOIN social_links sl ON u.user_id = sl.user_id
WHERE u.user_id = 42;

-- R06: READ
SELECT up.user_id, up.display_name, up.bio, up.avatar_url, up.institution,
       up.course_program, up.academic_year, up.availability_status
FROM user_profiles up
JOIN users u ON up.user_id = u.user_id
WHERE up.user_id = 15 AND u.account_status = 'ACTIVE' AND up.profile_visibility != 'PRIVATE';

-- R07: READ
SELECT s.skill_id, s.name, s.category, COUNT(us.user_id) AS student_count
FROM skills s
LEFT JOIN user_skills us ON s.skill_id = us.skill_id
WHERE s.name ILIKE 'React%'
GROUP BY s.skill_id, s.name, s.category
ORDER BY student_count DESC;

-- R08: READ
SELECT i.interest_id, i.name, i.domain, COUNT(ui.user_id) AS follower_count
FROM interests i
LEFT JOIN user_interests ui ON i.interest_id = ui.interest_id
WHERE i.domain = 'AI/ML'
GROUP BY i.interest_id, i.name, i.domain
ORDER BY follower_count DESC;

-- R09: READ
SELECT r.role_id, r.name, r.description, COALESCE(SUM(pr.open_positions), 0) AS total_openings
FROM roles r
LEFT JOIN project_roles pr ON r.role_id = pr.role_id
GROUP BY r.role_id, r.name, r.description
ORDER BY total_openings DESC, r.name ASC;

-- R10: READ
SELECT p.project_id, p.title, p.summary, p.category, p.project_type, p.status,
       p.min_team_size, p.max_team_size, up.display_name AS owner_name, p.created_at
FROM projects p
JOIN users u ON p.owner_id = u.user_id
JOIN user_profiles up ON u.user_id = up.user_id
WHERE p.status = 'OPEN' AND p.category = 'Artificial Intelligence' AND p.project_type = 'HACKATHON'
ORDER BY p.created_at DESC
LIMIT 10;

-- R11: READ
SELECT p.project_id, p.title, p.summary, p.status, s.name AS matched_skill, ps.is_required
FROM projects p
JOIN project_skills ps ON p.project_id = ps.project_id
JOIN skills s ON ps.skill_id = s.skill_id
WHERE p.status = 'OPEN' AND s.name = 'Python'
ORDER BY p.created_at DESC
LIMIT 15;

-- R12: READ
SELECT p.project_id, p.title, p.description, p.category, p.project_type, p.status,
       p.min_team_size, p.max_team_size, p.application_deadline, up.display_name AS owner_name,
       s.name AS skill_name, ps.is_required
FROM projects p
JOIN users u ON p.owner_id = u.user_id
JOIN user_profiles up ON u.user_id = up.user_id
JOIN project_skills ps ON p.project_id = ps.project_id
JOIN skills s ON ps.skill_id = s.skill_id
WHERE p.project_id = 5;

-- R13: READ
SELECT pm.project_id, pm.user_id, up.display_name, pm.role AS project_membership_role,
       up.course_program, up.academic_year, pm.joined_at
FROM project_members pm
JOIN users u ON pm.user_id = u.user_id
JOIN user_profiles up ON u.user_id = up.user_id
WHERE pm.project_id = 5
ORDER BY CASE pm.role WHEN 'OWNER' THEN 1 WHEN 'ADMIN' THEN 2 ELSE 3 END, pm.joined_at ASC;

-- R14: READ
SELECT pr.project_role_id, pr.project_id, r.name AS role_name, pr.open_positions, pr.description
FROM project_roles pr
JOIN roles r ON pr.role_id = r.role_id
WHERE pr.project_id = 5;

-- R15: READ
SELECT u.user_id, up.display_name, up.institution, up.academic_year,
       COUNT(DISTINCT ps.skill_id) AS matching_skills_count,
       STRING_AGG(s.name, ', ' ORDER BY s.name) AS matched_skills
FROM users u
JOIN user_profiles up ON u.user_id = up.user_id
JOIN user_skills us ON u.user_id = us.user_id
JOIN project_skills ps ON us.skill_id = ps.skill_id
JOIN skills s ON ps.skill_id = s.skill_id
WHERE ps.project_id = 5
  AND u.account_status = 'ACTIVE'
  AND u.user_id NOT IN (SELECT user_id FROM project_members WHERE project_id = 5)
GROUP BY u.user_id, up.display_name, up.institution, up.academic_year
HAVING COUNT(DISTINCT ps.skill_id) >= 1
ORDER BY matching_skills_count DESC
LIMIT 10;

-- R16: READ
SELECT p.project_id, p.title, p.category, p.project_type, p.max_team_size,
       COUNT(DISTINCT ps.skill_id) AS matched_skills_count
FROM projects p
JOIN project_skills ps ON p.project_id = ps.project_id
JOIN user_skills us ON ps.skill_id = us.skill_id
WHERE us.user_id = 15
  AND p.status = 'OPEN'
  AND p.owner_id != 15
  AND p.project_id NOT IN (SELECT project_id FROM project_members WHERE user_id = 15)
GROUP BY p.project_id, p.title, p.category, p.project_type, p.max_team_size
ORDER BY matched_skills_count DESC, p.created_at DESC
LIMIT 10;

-- R17: READ
SELECT a.application_id, a.project_id, p.title AS project_title, a.applicant_id,
       up.display_name AS applicant_name, up.course_program, r.name AS applied_role,
       a.message, a.applied_at
FROM applications a
JOIN projects p ON a.project_id = p.project_id
JOIN users u ON a.applicant_id = u.user_id
JOIN user_profiles up ON u.user_id = up.user_id
LEFT JOIN roles r ON a.role_id = r.role_id
WHERE p.owner_id = 12 AND a.status = 'PENDING'
ORDER BY a.applied_at ASC;

-- R18: READ
SELECT a.application_id, p.project_id, p.title AS project_title, p.status AS project_status,
       up.display_name AS owner_name, r.name AS applied_role, a.status AS application_status, a.applied_at
FROM applications a
JOIN projects p ON a.project_id = p.project_id
JOIN users u ON p.owner_id = u.user_id
JOIN user_profiles up ON u.user_id = up.user_id
LEFT JOIN roles r ON a.role_id = r.role_id
WHERE a.applicant_id = 105
ORDER BY a.applied_at DESC;

-- R19: READ
SELECT p.project_id, p.status, p.max_team_size,
       COUNT(pm.user_id) AS current_member_count,
       (p.max_team_size - COUNT(pm.user_id)) AS remaining_capacity
FROM projects p
LEFT JOIN project_members pm ON p.project_id = pm.project_id
WHERE p.project_id = 5
GROUP BY p.project_id, p.status, p.max_team_size;

-- R20: READ
SELECT c.conversation_id, c.type, p.title AS project_title,
       cm.last_read_sequence, MAX(m.sequence_number) AS latest_sequence,
       (COALESCE(MAX(m.sequence_number), 0) - cm.last_read_sequence) AS unread_messages_count
FROM conversation_members cm
JOIN conversations c ON cm.conversation_id = c.conversation_id
LEFT JOIN projects p ON c.project_id = p.project_id
LEFT JOIN messages m ON c.conversation_id = m.conversation_id
WHERE cm.user_id = 12
GROUP BY c.conversation_id, c.type, p.title, cm.last_read_sequence
ORDER BY latest_sequence DESC NULLS LAST;

-- R21: READ
SELECT c.conversation_id
FROM conversations c
JOIN conversation_members cm1 ON c.conversation_id = cm1.conversation_id
JOIN conversation_members cm2 ON c.conversation_id = cm2.conversation_id
WHERE c.type = 'DIRECT' AND cm1.user_id = 12 AND cm2.user_id = 45;

-- R22: READ
SELECT m.message_id, m.conversation_id, m.sender_id, up.display_name AS sender_name,
       m.sequence_number, m.content, m.created_at
FROM messages m
JOIN users u ON m.sender_id = u.user_id
JOIN user_profiles up ON u.user_id = up.user_id
WHERE m.conversation_id = 1 AND m.sequence_number > 5
ORDER BY m.sequence_number ASC
LIMIT 20;

-- R23: READ
SELECT notification_id, recipient_id, type, resource_type, resource_id, message, created_at
FROM notifications
WHERE recipient_id = 12 AND is_read = FALSE
ORDER BY created_at DESC
LIMIT 10;

-- R24: READ
SELECT
    (SELECT COUNT(*) FROM users WHERE account_status = 'ACTIVE') AS active_students,
    (SELECT COUNT(*) FROM projects WHERE status = 'OPEN') AS open_projects,
    (SELECT COUNT(*) FROM applications WHERE status = 'PENDING') AS pending_applications,
    (SELECT COUNT(*) FROM messages) AS total_messages_sent;

-- R25: READ
SELECT al.log_id, al.admin_id, up.display_name AS admin_name, al.action,
       al.target_type, al.target_id, al.details, al.created_at
FROM admin_audit_logs al
JOIN users u ON al.admin_id = u.user_id
JOIN user_profiles up ON u.user_id = up.user_id
ORDER BY al.created_at DESC
LIMIT 20;

-- W01: WRITE
INSERT INTO users (email, password_hash, account_status)
VALUES ('new.student@university.edu', '$argon2id$v=19$m=65536,t=3,p=4$fakehash123', 'PENDING_VERIFICATION')
RETURNING user_id, email, account_status;

-- W02: WRITE
INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, is_used)
VALUES (1, 'verification_token_hash_xyz789', NOW() + INTERVAL '24 hours', FALSE)
RETURNING token_id, user_id, expires_at;

-- W03: WRITE
UPDATE users
SET account_status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1;

-- W04: WRITE
INSERT INTO user_profiles (user_id, display_name, bio, institution, course_program, academic_year, department, preferred_project_type, availability_status, profile_visibility)
VALUES (1, 'Aarav Sharma', 'Passionate fullstack builder', 'IIT Delhi', 'B.Tech CS', '3rd Year', 'Computer Science', 'HACKATHON', 'AVAILABLE', 'PUBLIC')
ON CONFLICT (user_id) DO UPDATE
SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, updated_at = CURRENT_TIMESTAMP;

-- W05: WRITE
INSERT INTO user_skills (user_id, skill_id, proficiency_level, years_experience)
VALUES (1, 1, 'ADVANCED', 2.5)
ON CONFLICT (user_id, skill_id) DO UPDATE
SET proficiency_level = EXCLUDED.proficiency_level, years_experience = EXCLUDED.years_experience;

-- W06: WRITE
INSERT INTO projects (owner_id, title, summary, description, category, project_type, status, visibility, min_team_size, max_team_size, application_deadline, start_date)
VALUES (1, 'Decentralized Campus Identity', 'Decentralized credential verifier for student bodies', 'Full description for project', 'Blockchain', 'HACKATHON', 'DRAFT', 'PUBLIC', 2, 4, NOW() + INTERVAL '30 days', CURRENT_DATE)
RETURNING project_id, title, status;

-- W07: WRITE
INSERT INTO applications (project_id, applicant_id, role_id, status, message)
VALUES (2, 50, 1, 'PENDING', 'Excited to contribute to the frontend architecture and UI!')
RETURNING application_id, project_id, applicant_id, status;

-- W08: WRITE
UPDATE applications
SET status = 'ACCEPTED', reviewed_at = CURRENT_TIMESTAMP
WHERE application_id = 10 AND status = 'PENDING';

-- W09: WRITE
INSERT INTO messages (conversation_id, sender_id, client_message_id, sequence_number, content)
VALUES (1, 1, 'cli_msg_unique_uuid_9999', 16, 'Integration tests passed. Ready for code review.')
RETURNING message_id, conversation_id, sequence_number, created_at;

-- W10: WRITE
UPDATE notifications
SET is_read = TRUE
WHERE recipient_id = 12 AND is_read = FALSE;

