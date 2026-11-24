CREATE TABLE IF NOT EXISTS "collabryd"."events" (
  "event_id" bigserial PRIMARY KEY,
  "slug" varchar(120) NOT NULL,
  "name" varchar(160) NOT NULL,
  "category" varchar(80) NOT NULL DEFAULT 'Hackathon',
  "description" text NOT NULL,
  "event_date" varchar(50) NOT NULL,
  "deadline" varchar(50) NOT NULL,
  "mode" varchar(50) NOT NULL DEFAULT 'Hybrid',
  "color" varchar(50) NOT NULL DEFAULT 'sand',
  "symbol" varchar(50) NOT NULL DEFAULT '✳',
  "publication" varchar(30) NOT NULL DEFAULT 'Published',
  "organizer" varchar(160) DEFAULT 'Campus Event Organizers',
  "eligibility" text DEFAULT 'Open to all registered campus students.',
  "rules" text,
  "official_url" varchar(500),
  "source_url" varchar(500),
  "created_by" integer REFERENCES "collabryd"."users"("user_id") ON DELETE SET NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_idx" ON "collabryd"."events" ("slug");
CREATE INDEX IF NOT EXISTS "events_publication_idx" ON "collabryd"."events" ("publication");
CREATE INDEX IF NOT EXISTS "events_date_idx" ON "collabryd"."events" ("event_date");

-- Seed initial campus hackathons
INSERT INTO "collabryd"."events" (
  "slug", "name", "category", "description", "event_date", "deadline", "mode", "color", "symbol", "publication", "organizer", "eligibility", "rules"
) VALUES
  ('green-campus-hack', 'Green Campus Hackathon', 'Sustainability', 'A weekend of building thoughtful solutions for a greener campus. Bring a small team and a problem worth solving.', '2026-10-18', '2026-10-10', 'In-person', 'sage', '🌱', 'Published', 'Campus Sustainability Council', 'Open to all enrolled students', 'Teams of 2 to 4 students. Hardware and software prototypes welcome.'),
  ('speed-prototype-sprint', 'Speed Prototype Sprint', 'Open build', 'An open-theme innovation sprint. Turn your favourite “what if” into a working prototype with your team.', '2026-11-02', '2026-10-25', 'Hybrid', 'sand', '⚡', 'Published', 'Makerspace Club & Design Lab', 'Undergraduates and postgraduates across all branches.', 'Teams of 2 to 5 members. Final working prototype demo required.'),
  ('open-data-jam', 'Campus Open Data Jam', 'Public interest', 'Analyze public transit, campus library usage and schedule patterns to create helpful tools for students.', '2026-11-20', '2026-11-15', 'Online', 'clay', '📊', 'Published', 'Data Science Society', 'Open to all students with basic Python or SQL interest.', 'Solo or teams of up to 4. Public dataset analysis and visualization.')
ON CONFLICT ("slug") DO NOTHING;
