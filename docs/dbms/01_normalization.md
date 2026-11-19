# Collabryd — Database Normalization Specification (1NF → 2NF → 3NF → BCNF)

This document presents the complete formal normalization analysis of the Collabryd student collaboration platform data model. The schema is systematically transformed from an unnormalized universal relation (UNF/0NF) through First Normal Form (1NF), Second Normal Form (2NF), Third Normal Form (3NF), and Boyce-Codd Normal Form (BCNF). At each transformation step, candidate keys, functional dependencies (FDs), decomposition rationales, and anomalies eliminated are formally documented.

---

## 1. Unnormalized Form (UNF / 0NF)

### 1.1 Universal Unnormalized Relation Description
Initially, all student profiles, authentication credentials, project listings, required skills, applications, team rosters, chat conversations, and in-app notifications are conceptually captured in a single flat universal structure:

```text
Universal_Collabryd_Data(
    user_id, email, password_hash, account_status, display_name, bio, avatar_url,
    institution, course_program, academic_year, department, preferred_project_type,
    availability_status, profile_visibility,
    { skill_name, skill_category, proficiency_level, years_experience },
    { interest_name, interest_domain },
    { preferred_role_name, role_description },
    { achievement_title, achievement_desc, achievement_issuer, date_achieved },
    { social_platform, social_url },
    { project_id, project_title, project_summary, project_description, project_category,
      project_type, project_status, project_visibility, min_team_size, max_team_size,
      application_deadline, project_start_date,
      { req_skill_name, req_skill_category, is_required },
      { open_role_name, role_open_positions, role_spec },
      { member_user_id, member_role, member_joined_at } },
    { application_id, app_project_id, app_role_name, app_status, app_message, applied_at },
    { conversation_id, conv_type, conv_project_id,
      { conv_member_id, last_read_seq },
      { message_id, msg_sender_id, client_msg_id, sequence_num, msg_content, msg_sent_at } },
    { notification_id, notif_type, notif_resource_type, notif_resource_id, notif_message, notif_is_read, notif_created_at },
    { token_id, token_hash, token_expires_at, token_is_used },
    { session_id, session_token_hash, session_expires_at, session_revoked_at },
    { audit_log_id, admin_id, audit_action, audit_target_type, audit_target_id, audit_details, audit_created_at }
)
```

### 1.2 Characteristics of UNF
- **Repeating Groups:** Skills, interests, achievements, social links, project requirements, team members, applications, chat messages, and notifications represent multi-valued repeating groups.
- **Data Redundancy:** A student who joins three projects or lists five skills duplicates their authentication, profile, and institution details across multiple records.
- **Structural Inconsistency:** Non-atomic cells contain lists of values, making relational querying, constraint checking, and indexing impossible.

---

## 2. First Normal Form (1NF)

### 2.1 Formal Definition of 1NF
A relation $R$ is in First Normal Form (1NF) if and only if:
1. Every attribute domain contains only atomic (indivisible) values.
2. There are no repeating groups or nested relations.
3. Each record is uniquely identifiable by an explicitly defined primary key.

### 2.2 1NF Decomposition
To eliminate repeating groups and flatten the universal relation into atomic rows, we separate each nested repeating group into its own relation, carrying the parent identifier as part of a composite key.

#### 1NF Relation 1: Flat_Users_Profiles
```text
Flat_Users_Profiles(user_id, email, password_hash, account_status, display_name, bio, avatar_url, institution, course_program, academic_year, department, preferred_project_type, availability_status, profile_visibility)
Primary Key: (user_id)
Candidate Keys: {user_id}, {email}
```

#### 1NF Relation 2: Flat_User_Skills
```text
Flat_User_Skills(user_id, skill_name, skill_category, proficiency_level, years_experience)
Primary Key: (user_id, skill_name)
```

#### 1NF Relation 3: Flat_User_Interests
```text
Flat_User_Interests(user_id, interest_name, interest_domain)
Primary Key: (user_id, interest_name)
```

#### 1NF Relation 4: Flat_User_Roles
```text
Flat_User_Roles(user_id, role_name, role_description)
Primary Key: (user_id, role_name)
```

#### 1NF Relation 5: Flat_User_Achievements
```text
Flat_User_Achievements(achievement_id, user_id, achievement_title, achievement_desc, achievement_issuer, date_achieved)
Primary Key: (achievement_id)
```

#### 1NF Relation 6: Flat_User_Social_Links
```text
Flat_User_Social_Links(link_id, user_id, platform, url)
Primary Key: (link_id)
```

#### 1NF Relation 7: Flat_Projects
```text
Flat_Projects(project_id, owner_id, project_title, project_summary, project_description, project_category, project_type, project_status, project_visibility, min_team_size, max_team_size, application_deadline, project_start_date)
Primary Key: (project_id)
```

#### 1NF Relation 8: Flat_Project_Skills
```text
Flat_Project_Skills(project_id, skill_name, skill_category, is_required)
Primary Key: (project_id, skill_name)
```

#### 1NF Relation 9: Flat_Project_Roles
```text
Flat_Project_Roles(project_id, role_name, role_description, open_positions, role_spec)
Primary Key: (project_id, role_name)
```

#### 1NF Relation 10: Flat_Project_Members
```text
Flat_Project_Members(project_id, user_id, member_role, member_joined_at)
Primary Key: (project_id, user_id)
```

#### 1NF Relation 11: Flat_Applications
```text
Flat_Applications(application_id, project_id, applicant_id, role_name, role_description, app_status, app_message, applied_at)
Primary Key: (application_id)
Candidate Key: (project_id, applicant_id) [for active applications]
```

#### 1NF Relation 12: Flat_Conversations
```text
Flat_Conversations(conversation_id, conv_type, conv_project_id)
Primary Key: (conversation_id)
```

#### 1NF Relation 13: Flat_Conversation_Members
```text
Flat_Conversation_Members(conversation_id, user_id, last_read_seq, joined_at)
Primary Key: (conversation_id, user_id)
```

#### 1NF Relation 14: Flat_Messages
```text
Flat_Messages(message_id, conversation_id, sender_id, client_msg_id, sequence_num, msg_content, msg_sent_at)
Primary Key: (message_id)
Candidate Key: (conversation_id, sequence_num), (conversation_id, client_msg_id)
```

#### 1NF Relation 15: Flat_Notifications
```text
Flat_Notifications(notification_id, recipient_id, notif_type, resource_type, resource_id, notif_message, notif_is_read, notif_created_at)
Primary Key: (notification_id)
```

#### 1NF Relation 16: Flat_Auth_Tokens_Sessions
```text
Flat_Email_Tokens(token_id, user_id, token_hash, token_expires_at, token_is_used)
Primary Key: (token_id)

Flat_Refresh_Sessions(session_id, user_id, session_token_hash, session_expires_at, session_revoked_at)
Primary Key: (session_id)
```

#### 1NF Relation 17: Flat_Audit_Logs
```text
Flat_Audit_Logs(audit_log_id, admin_id, audit_action, audit_target_type, audit_target_id, audit_details, audit_created_at)
Primary Key: (audit_log_id)
```

### 2.3 Partial Dependencies in 1NF (Violations of 2NF)
In relations with composite primary keys, partial functional dependencies exist where a non-prime attribute depends only on a proper subset of the composite primary key:

1. **In `Flat_User_Skills(user_id, skill_name, skill_category, proficiency_level, years_experience)`:**
   - Full key: `(user_id, skill_name)`
   - Functional dependency: `skill_name → skill_category`
   - `skill_category` depends solely on `skill_name`, not on `user_id`. This is a partial dependency.

2. **In `Flat_User_Interests(user_id, interest_name, interest_domain)`:**
   - Full key: `(user_id, interest_name)`
   - Functional dependency: `interest_name → interest_domain`
   - `interest_domain` depends solely on `interest_name`. Partial dependency.

3. **In `Flat_User_Roles(user_id, role_name, role_description)`:**
   - Full key: `(user_id, role_name)`
   - Functional dependency: `role_name → role_description`
   - `role_description` depends solely on `role_name`. Partial dependency.

4. **In `Flat_Project_Skills(project_id, skill_name, skill_category, is_required)`:**
   - Full key: `(project_id, skill_name)`
   - Functional dependency: `skill_name → skill_category`
   - `skill_category` depends solely on `skill_name`. Partial dependency.

5. **In `Flat_Project_Roles(project_id, role_name, role_description, open_positions, role_spec)`:**
   - Full key: `(project_id, role_name)`
   - Functional dependency: `role_name → role_description`
   - `role_description` depends solely on `role_name`. Partial dependency.

### 2.4 Anomalies Present in 1NF
- **Insertion Anomaly:** Cannot introduce a new skill (e.g., "GraphQL", Category: "Backend") or role (e.g., "UI/UX Designer") into the system until at least one student registers that skill or a project requires it.
- **Update Anomaly:** If the category of "React" changes from "Frontend" to "Web Client Framework", every record of every user and project referencing "React" must be updated simultaneously. Any missed record creates contradictory data.
- **Deletion Anomaly:** If the only student who possesses the skill "Solidity" unregisters or removes it from their profile, all record of the existence and classification of "Solidity" is permanently lost from the database.

---

## 3. Second Normal Form (2NF)

### 3.1 Formal Definition of 2NF
A relation $R$ is in Second Normal Form (2NF) if and only if:
1. $R$ is in 1NF.
2. Every non-prime attribute of $R$ is fully functionally dependent on every candidate key of $R$. That is, no non-prime attribute is dependent on a proper subset of any candidate key (no partial dependencies).

### 3.2 2NF Decomposition
We decompose the relations exhibiting partial dependencies by extracting the partially dependent attributes into separate entity tables with surrogate canonical primary keys:

#### Extracted Catalogue Relations:
- **`Skills(skill_id, name, category)`**  
  Key: `skill_id`, Candidate Key: `{name}`  
  FD: `skill_id → name, category`; `name → skill_id, category`
- **`Interests(interest_id, name, domain)`**  
  Key: `interest_id`, Candidate Key: `{name}`  
  FD: `interest_id → name, domain`; `name → interest_id, domain`
- **`Roles(role_id, name, description)`**  
  Key: `role_id`, Candidate Key: `{name}`  
  FD: `role_id → name, description`; `name → role_id, description`

#### Recomposed Bridge / Associative Relations:
- **`User_Skills(user_id, skill_id, proficiency_level, years_experience)`**  
  Key: `(user_id, skill_id)`  
  FD: `(user_id, skill_id) → proficiency_level, years_experience`  
  *Both non-prime attributes strictly require both `user_id` and `skill_id`.*
- **`User_Interests(user_id, interest_id)`**  
  Key: `(user_id, interest_id)`  
  *All attributes are prime.*
- **`User_Preferred_Roles(user_id, role_id)`**  
  Key: `(user_id, role_id)`  
  *All attributes are prime.*
- **`Project_Skills(project_id, skill_id, is_required)`**  
  Key: `(project_id, skill_id)`  
  FD: `(project_id, skill_id) → is_required`
- **`Project_Roles(project_role_id, project_id, role_id, open_positions, description)`**  
  Key: `project_role_id`, Candidate Key: `(project_id, role_id)`  
  FD: `(project_id, role_id) → open_positions, description`

### 3.3 Transitive Dependencies in 2NF (Violations of 3NF)
While all partial dependencies are eliminated, transitive dependencies remain where a non-prime attribute depends on another non-prime attribute rather than directly on the primary key:

1. **In `Flat_Users_Profiles(user_id, email, password_hash, account_status, display_name, bio, avatar_url, institution, course_program, academic_year, department, preferred_project_type, availability_status, profile_visibility)`:**
   - Identity and Authentication vs. Public Student Profile metadata.
   - Authentication tokens (`token_hash`) and refresh sessions (`session_token_hash`) are dependent on identity lifecycle, whereas profile details (`display_name`, `bio`, `academic_year`) belong to the profile presentation domain.
   - Storing student profile details together with authentication credentials forces security queries (e.g. login password checks) to scan unnecessary profile columns and bloats table storage.
2. **In `Flat_Applications(application_id, project_id, applicant_id, role_name, role_description, app_status, app_message, applied_at)`:**
   - `application_id → role_name → role_description`
   - Transitive dependency: `role_description` depends on `role_name`, which is not a superkey of `Flat_Applications`.
3. **In `Flat_Messages(message_id, conversation_id, sender_id, client_msg_id, sequence_num, msg_content, msg_sent_at)`:**
   - Sequence ordering is conversation-scoped (`(conversation_id, sequence_num) → message_id`), but client idempotency tracking (`(conversation_id, client_msg_id) → message_id`) also serves as a candidate key.

### 3.4 Anomalies Present in 2NF
- **Insertion Anomaly:** A new student registering on the platform only has an email and password hash; forcing a combined record creates NULL attributes across academic year, department, and bio.
- **Update Anomaly:** Updating role specifications in applications duplicates text and risks diverging from the canonical role description.
- **Deletion Anomaly:** Deactivating or purging an expired verification token would inadvertently delete the user account if modeled within the user record.

---

## 4. Third Normal Form (3NF)

### 4.1 Formal Definition of 3NF
A relation $R$ is in Third Normal Form (3NF) if and only if:
1. $R$ is in 2NF.
2. For every non-trivial functional dependency $X \to A$ in $R$, at least one of the following conditions holds:
   - $X$ is a superkey of $R$, OR
   - $A$ is a prime attribute (part of a candidate key of $R$).

Equivalently, no non-prime attribute is transitively dependent on any candidate key.

### 4.2 3NF Decomposition
We remove transitive dependencies by decomposing relations so that all non-prime attributes depend directly and exclusively on candidate keys.

1. **Separate Authentication Identity from Public Profile:**
   - `users(user_id, email, password_hash, account_status, created_at, updated_at)`
   - `user_profiles(user_id, display_name, bio, avatar_url, institution, course_program, academic_year, department, preferred_project_type, availability_status, profile_visibility, created_at, updated_at)`
   - Primary key of `user_profiles` is `user_id`, enforcing a strict 1-to-1 relationship while decoupling security concerns from profile presentation.

2. **Isolate Verification Tokens and Active Sessions:**
   - `email_verification_tokens(token_id, user_id, token_hash, expires_at, is_used, created_at)`
   - `refresh_sessions(session_id, user_id, token_hash, expires_at, revoked_at, created_at)`
   - Eliminates transitive coupling between security tokens and user accounts.

3. **Separate User Portfolios (Achievements and Links):**
   - `achievements(achievement_id, user_id, title, description, issuer, date_achieved, created_at)`
   - `social_links(link_id, user_id, platform, url, created_at)`

4. **Decouple Applications from Role Definitions:**
   - `applications(application_id, project_id, applicant_id, role_id, status, message, applied_at, reviewed_at)`
   - References `roles(role_id)` via foreign key, eliminating all transitive dependencies on role descriptions.

5. **Decouple Conversations and Messages:**
   - `conversations(conversation_id, type, project_id, created_at)`
   - `conversation_members(conversation_id, user_id, last_read_sequence, joined_at)`
   - `messages(message_id, conversation_id, sender_id, client_message_id, sequence_number, content, created_at)`

6. **Decouple Notifications and Notification Preferences:**
   - `notifications(notification_id, recipient_id, type, resource_type, resource_id, message, is_read, created_at)`
   - `notification_preferences(user_id, email_on_application, email_on_team_change, email_on_message, inapp_notifications)`

7. **Isolate Platform Administration Audit Logging:**
   - `admin_audit_logs(log_id, admin_id, action, target_type, target_id, details, created_at)`

---

## 5. Boyce-Codd Normal Form (BCNF)

### 5.1 Formal Definition of BCNF
A relation $R$ is in Boyce-Codd Normal Form (BCNF) if and only if:
- For every non-trivial functional dependency $X \to Y$ that holds over $R$, **$X$ is a superkey of $R$**.

BCNF is a stricter version of 3NF that eliminates cases where a prime attribute depends on a non-superkey. If a relation is in 3NF and all candidate keys are single attributes, or no non-trivial FDs exist where the left-hand side is not a superkey, the relation is automatically in BCNF.

### 5.2 Comprehensive Verification of Each Relation for BCNF

#### Relation 1: `users`
- **Attributes:** `{user_id, email, password_hash, account_status, created_at, updated_at}`
- **Candidate Keys:** $CK_1 = \{\text{user\_id}\}$, $CK_2 = \{\text{email}\}$
- **Functional Dependencies:**
  - $\text{user\_id} \to \text{email, password\_hash, account\_status, created\_at, updated\_at}$ (LHS is $CK_1$)
  - $\text{email} \to \text{user\_id, password\_hash, account\_status, created\_at, updated\_at}$ (LHS is $CK_2$)
- **Analysis:** Both determinants are candidate keys / superkeys.
- **Normal Form:** **BCNF**.

#### Relation 2: `email_verification_tokens`
- **Attributes:** `{token_id, user_id, token_hash, expires_at, is_used, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{token\_id}\}$, $CK_2 = \{\text{token\_hash}\}$
- **Functional Dependencies:**
  - $\text{token\_id} \to \text{user\_id, token\_hash, expires\_at, is\_used, created\_at}$
  - $\text{token\_hash} \to \text{token\_id, user\_id, expires\_at, is\_used, created\_at}$
- **Analysis:** All determinants are candidate keys.
- **Normal Form:** **BCNF**.

#### Relation 3: `refresh_sessions`
- **Attributes:** `{session_id, user_id, token_hash, expires_at, revoked_at, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{session\_id}\}$, $CK_2 = \{\text{token\_hash}\}$
- **Functional Dependencies:**
  - $\text{session\_id} \to \text{user\_id, token\_hash, expires\_at, revoked\_at, created\_at}$
  - $\text{token\_hash} \to \text{session\_id, user\_id, expires\_at, revoked\_at, created\_at}$
- **Analysis:** All determinants are candidate keys.
- **Normal Form:** **BCNF**.

#### Relation 4: `user_profiles`
- **Attributes:** `{user_id, display_name, bio, avatar_url, institution, course_program, academic_year, department, preferred_project_type, availability_status, profile_visibility, created_at, updated_at}`
- **Candidate Keys:** $CK_1 = \{\text{user\_id}\}$
- **Functional Dependencies:**
  - $\text{user\_id} \to \text{display\_name, bio, avatar\_url, institution, course\_program, academic\_year, department, preferred\_project\_type, availability\_status, profile\_visibility, created\_at, updated\_at}$
- **Analysis:** The only determinant is $\text{user\_id}$, which is the primary key and a superkey.
- **Normal Form:** **BCNF**.

#### Relation 5: `achievements`
- **Attributes:** `{achievement_id, user_id, title, description, issuer, date_achieved, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{achievement\_id}\}$
- **Functional Dependencies:**
  - $\text{achievement\_id} \to \text{user\_id, title, description, issuer, date_achieved, created_at}$
- **Analysis:** Determinant is a superkey.
- **Normal Form:** **BCNF**.

#### Relation 6: `social_links`
- **Attributes:** `{link_id, user_id, platform, url, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{link\_id}\}$
- **Functional Dependencies:**
  - $\text{link\_id} \to \text{user\_id, platform, url, created_at}$
- **Analysis:** Determinant is a superkey.
- **Normal Form:** **BCNF**.

#### Relation 7: `skills`
- **Attributes:** `{skill_id, name, category, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{skill\_id}\}$, $CK_2 = \{\text{name}\}$
- **Functional Dependencies:**
  - $\text{skill\_id} \to \text{name, category, created\_at}$
  - $\text{name} \to \text{skill\_id, category, created\_at}$
- **Analysis:** Both determinants are candidate keys.
- **Normal Form:** **BCNF**.

#### Relation 8: `interests`
- **Attributes:** `{interest_id, name, domain, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{interest\_id}\}$, $CK_2 = \{\text{name}\}$
- **Functional Dependencies:**
  - $\text{interest\_id} \to \text{name, domain, created\_at}$
  - $\text{name} \to \text{interest\_id, domain, created\_at}$
- **Analysis:** Both determinants are candidate keys.
- **Normal Form:** **BCNF**.

#### Relation 9: `roles`
- **Attributes:** `{role_id, name, description, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{role\_id}\}$, $CK_2 = \{\text{name}\}$
- **Functional Dependencies:**
  - $\text{role\_id} \to \text{name, description, created\_at}$
  - $\text{name} \to \text{role\_id, description, created\_at}$
- **Analysis:** Both determinants are candidate keys.
- **Normal Form:** **BCNF**.

#### Relation 10: `user_skills`
- **Attributes:** `{user_id, skill_id, proficiency_level, years_experience, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{user\_id, skill\_id}\}$
- **Functional Dependencies:**
  - $\text{(user\_id, skill\_id)} \to \text{proficiency\_level, years\_experience, created\_at}$
- **Analysis:** The determinant is the composite primary key (superkey).
- **Normal Form:** **BCNF**.

#### Relation 11: `user_interests`
- **Attributes:** `{user_id, interest_id, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{user\_id, interest\_id}\}$
- **Functional Dependencies:**
  - $\text{(user\_id, interest\_id)} \to \text{created\_at}$
- **Analysis:** Determinant is the candidate key.
- **Normal Form:** **BCNF**.

#### Relation 12: `user_preferred_roles`
- **Attributes:** `{user_id, role_id, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{user\_id, role\_id}\}$
- **Functional Dependencies:**
  - $\text{(user\_id, role\_id)} \to \text{created\_at}$
- **Analysis:** Determinant is the candidate key.
- **Normal Form:** **BCNF**.

#### Relation 13: `projects`
- **Attributes:** `{project_id, owner_id, title, summary, description, category, project_type, status, visibility, min_team_size, max_team_size, application_deadline, start_date, created_at, updated_at}`
- **Candidate Keys:** $CK_1 = \{\text{project\_id}\}$
- **Functional Dependencies:**
  - $\text{project\_id} \to \text{owner\_id, title, summary, description, category, project\_type, status, visibility, min\_team\_size, max\_team\_size, application\_deadline, start\_date, created\_at, updated\_at}$
- **Analysis:** Determinant is the primary key and superkey.
- **Normal Form:** **BCNF**.

#### Relation 14: `project_skills`
- **Attributes:** `{project_id, skill_id, is_required, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{project\_id, skill\_id}\}$
- **Functional Dependencies:**
  - $\text{(project\_id, skill\_id)} \to \text{is\_required, created\_at}$
- **Analysis:** Determinant is the candidate key.
- **Normal Form:** **BCNF**.

#### Relation 15: `project_roles`
- **Attributes:** `{project_role_id, project_id, role_id, open_positions, description, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{project\_role\_id}\}$, $CK_2 = \{\text{project\_id, role\_id}\}$
- **Functional Dependencies:**
  - $\text{project\_role\_id} \to \text{project\_id, role\_id, open\_positions, description, created\_at}$
  - $\text{(project\_id, role\_id)} \to \text{project\_role\_id, open\_positions, description, created\_at}$
- **Analysis:** Both determinants are candidate keys.
- **Normal Form:** **BCNF**.

#### Relation 16: `applications`
- **Attributes:** `{application_id, project_id, applicant_id, role_id, status, message, applied_at, reviewed_at}`
- **Candidate Keys:** $CK_1 = \{\text{application\_id}\}$
- **Functional Dependencies:**
  - $\text{application\_id} \to \text{project\_id, applicant\_id, role\_id, status, message, applied\_at, reviewed\_at}$
- **Analysis:** Determinant is the primary key.
- **Normal Form:** **BCNF**.

#### Relation 17: `project_members`
- **Attributes:** `{project_id, user_id, role, joined_at}`
- **Candidate Keys:** $CK_1 = \{\text{project\_id, user\_id}\}$
- **Functional Dependencies:**
  - $\text{(project\_id, user\_id)} \to \text{role, joined\_at}$
- **Analysis:** Determinant is the composite primary key.
- **Normal Form:** **BCNF**.

#### Relation 18: `conversations`
- **Attributes:** `{conversation_id, type, project_id, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{conversation\_id}\}$
- **Functional Dependencies:**
  - $\text{conversation\_id} \to \text{type, project\_id, created\_at}$
- **Analysis:** Determinant is the primary key. For project-group chats, `project_id` is unique and nullable.
- **Normal Form:** **BCNF**.

#### Relation 19: `conversation_members`
- **Attributes:** `{conversation_id, user_id, last_read_sequence, joined_at}`
- **Candidate Keys:** $CK_1 = \{\text{conversation\_id, user\_id}\}$
- **Functional Dependencies:**
  - $\text{(conversation\_id, user\_id)} \to \text{last\_read\_sequence, joined\_at}$
- **Analysis:** Determinant is the composite primary key.
- **Normal Form:** **BCNF**.

#### Relation 20: `messages`
- **Attributes:** `{message_id, conversation_id, sender_id, client_message_id, sequence_number, content, created_at}`
- **Candidate Keys:**
  - $CK_1 = \{\text{message\_id}\}$
  - $CK_2 = \{\text{conversation\_id, sequence\_number}\}$
  - $CK_3 = \{\text{conversation\_id, client\_message\_id}\}$
- **Functional Dependencies:**
  - $\text{message\_id} \to \text{conversation\_id, sender\_id, client\_message\_id, sequence\_number, content, created\_at}$
  - $\text{(conversation\_id, sequence\_number)} \to \text{message\_id, sender\_id, client\_message\_id, content, created\_at}$
  - $\text{(conversation\_id, client\_message\_id)} \to \text{message\_id, sender\_id, sequence\_number, content, created\_at}$
- **Analysis:** Every determinant is a candidate key of the relation.
- **Normal Form:** **BCNF**.

#### Relation 21: `notifications`
- **Attributes:** `{notification_id, recipient_id, type, resource_type, resource_id, message, is_read, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{notification\_id}\}$
- **Functional Dependencies:**
  - $\text{notification\_id} \to \text{recipient\_id, type, resource\_type, resource\_id, message, is\_read, created\_at}$
- **Analysis:** Determinant is the primary key.
- **Normal Form:** **BCNF**.

#### Relation 22: `notification_preferences`
- **Attributes:** `{user_id, email_on_application, email_on_team_change, email_on_message, inapp_notifications}`
- **Candidate Keys:** $CK_1 = \{\text{user\_id}\}$
- **Functional Dependencies:**
  - $\text{user\_id} \to \text{email\_on\_application, email\_on\_team\_change, email\_on\_message, inapp\_notifications}$
- **Analysis:** Determinant is the primary key.
- **Normal Form:** **BCNF**.

#### Relation 23: `admin_audit_logs`
- **Attributes:** `{log_id, admin_id, action, target_type, target_id, details, created_at}`
- **Candidate Keys:** $CK_1 = \{\text{log\_id}\}$
- **Functional Dependencies:**
  - $\text{log\_id} \to \text{admin\_id, action, target\_type, target\_id, details, created\_at}$
- **Analysis:** Determinant is the primary key.
- **Normal Form:** **BCNF**.

---

## 6. Mathematical Verification of Properties

### 6.1 Lossless Join Decomposition
A decomposition of relation $R$ into $R_1$ and $R_2$ is lossless with respect to a set of functional dependencies $F$ if and only if the intersection of their attribute sets forms a superkey of at least one of the decomposed relations:

$$ (R_1 \cap R_2) \to R_1 \quad \text{or} \quad (R_1 \cap R_2) \to R_2 $$

For example, when decomposing `Flat_Users_Profiles` into `users` ($R_1$) and `user_profiles` ($R_2$):
- $R_1 \cap R_2 = \{\text{user\_id}\}$
- In $R_1$, $\text{user\_id} \to R_1$ holds because $\text{user\_id}$ is the primary key of `users`.
- In $R_2$, $\text{user\_id} \to R_2$ holds because $\text{user\_id}$ is the primary key of `user_profiles`.

Similarly, when decomposing `Flat_User_Skills` into `skills` ($R_a$) and `user_skills` ($R_b$):
- $R_a \cap R_b = \{\text{skill\_id}\}$
- $\text{skill\_id}$ is the primary key of `skills` ($R_a \cap R_b \to R_a$).

Hence, all relational decompositions in this schema satisfy the Lossless Join property. No spurious tuples can be generated upon natural joins.

### 6.2 Dependency Preservation
A decomposition $D = \{R_1, R_2, \dots, R_k\}$ preserves dependencies if the union of the projection of the functional dependency set $F$ onto each relation covers $F$:

$$ \left( \bigcup_{i=1}^k \pi_{R_i}(F) \right)^+ = F^+ $$

In our decomposition:
- All functional dependencies involving skills, interests, roles, projects, applications, messages, and users are expressible within individual decomposed relations or direct foreign-key references.
- No dependency spans across multiple relations without its determinant being a candidate key.
Therefore, all functional dependencies are strictly preserved.

---

## 7. Normalization Summary Table

| Table Name | Primary Key | Alternate Keys (Unique) | Determinant Attributes | Normal Form |
|---|---|---|---|---|
| `users` | `user_id` | `email` | `user_id`, `email` | **BCNF** |
| `email_verification_tokens` | `token_id` | `token_hash` | `token_id`, `token_hash` | **BCNF** |
| `refresh_sessions` | `session_id` | `token_hash` | `session_id`, `token_hash` | **BCNF** |
| `user_profiles` | `user_id` | — | `user_id` | **BCNF** |
| `achievements` | `achievement_id` | — | `achievement_id` | **BCNF** |
| `social_links` | `link_id` | — | `link_id` | **BCNF** |
| `skills` | `skill_id` | `name` | `skill_id`, `name` | **BCNF** |
| `interests` | `interest_id` | `name` | `interest_id`, `name` | **BCNF** |
| `roles` | `role_id` | `name` | `role_id`, `name` | **BCNF** |
| `user_skills` | `(user_id, skill_id)` | — | `(user_id, skill_id)` | **BCNF** |
| `user_interests` | `(user_id, interest_id)` | — | `(user_id, interest_id)` | **BCNF** |
| `user_preferred_roles` | `(user_id, role_id)` | — | `(user_id, role_id)` | **BCNF** |
| `projects` | `project_id` | — | `project_id` | **BCNF** |
| `project_skills` | `(project_id, skill_id)` | — | `(project_id, skill_id)` | **BCNF** |
| `project_roles` | `project_role_id` | `(project_id, role_id)` | `project_role_id`, `(project_id, role_id)` | **BCNF** |
| `applications` | `application_id` | `(project_id, applicant_id)`* | `application_id` | **BCNF** |
| `project_members` | `(project_id, user_id)` | — | `(project_id, user_id)` | **BCNF** |
| `conversations` | `conversation_id` | `project_id` (partial) | `conversation_id` | **BCNF** |
| `conversation_members` | `(conversation_id, user_id)` | — | `(conversation_id, user_id)` | **BCNF** |
| `messages` | `message_id` | `(conversation_id, sequence_number)`, `(conversation_id, client_message_id)` | `message_id`, `(conv_id, seq)`, `(conv_id, client_id)` | **BCNF** |
| `notifications` | `notification_id` | — | `notification_id` | **BCNF** |
| `notification_preferences` | `user_id` | — | `user_id` | **BCNF** |
| `admin_audit_logs` | `log_id` | — | `log_id` | **BCNF** |

*\*Note: `(project_id, applicant_id)` unique constraint enforced conditionally on `status = 'PENDING'` to allow re-application after terminal rejection or withdrawal while preventing concurrent duplicate active applications.*

