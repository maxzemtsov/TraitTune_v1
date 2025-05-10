-- TraitTune MVP Initial Schema
-- Version: 0001
-- Date: 2025-05-08

-- Enable RLS for all new tables by default
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC;

-- Helper function for GDPR "right to erase"
CREATE OR REPLACE FUNCTION delete_user_cascade(uid uuid)
RETURNS void AS $$
BEGIN
  -- Delete related data first to avoid foreign key violations
  DELETE FROM user_responses WHERE user_id = uid;
  DELETE FROM open_responses WHERE user_id = uid;
  DELETE FROM user_results WHERE user_id = uid;
  DELETE FROM team_members WHERE user_id = uid;
  -- Finally, delete the user
  DELETE FROM users WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dimensions Table: Stores the 15 personality dimensions
CREATE TABLE IF NOT EXISTS dimensions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., Optimistic–Realistic
  description TEXT, -- Detailed description of the dimension
  segment_details JSONB -- JSON object describing each of the 5 segments
);
ALTER TABLE dimensions ENABLE ROW LEVEL SECURITY;

-- Questions Table: Stores all core questions (Likert, Forced-choice, Scenario, Check)
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  dimension_id INTEGER REFERENCES dimensions(id) ON DELETE CASCADE,
  segment_level INTEGER NOT NULL CHECK (segment_level >= 1 AND segment_level <= 5),
  question_type TEXT NOT NULL CHECK (question_type IN (
    'Likert', 'Forced-choice', 'Scenario', 'Check_consistency', 'Check_social'
  )),
  is_reverse BOOLEAN DEFAULT FALSE,
  text_en TEXT NOT NULL,
  text_ru TEXT NOT NULL,
  usecase_tag TEXT, -- e.g., startup, corporate, student
  irt_difficulty FLOAT, -- b parameter (-3 to +3)
  irt_discriminativeness FLOAT, -- a parameter (0.5 to 2.5)
  irt_guessing FLOAT -- c parameter (0.05–0.10 for Forced-choice/Scenario)
);
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_questions_dimension_id ON questions(dimension_id);
CREATE INDEX IF NOT EXISTS idx_questions_segment_level ON questions(segment_level);
CREATE INDEX IF NOT EXISTS idx_questions_question_type ON questions(question_type);

-- Answer Options Table: Stores options for closed-ended questions
CREATE TABLE IF NOT EXISTS answer_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  text_en TEXT NOT NULL,
  text_ru TEXT NOT NULL,
  score_value FLOAT -- e.g., +1, 0, -1, or Likert scale value 1-5
);
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_answer_options_question_id ON answer_options(question_id);

-- Open Questions Table: Stores open-ended questions
CREATE TABLE IF NOT EXISTS open_questions (
  id SERIAL PRIMARY KEY,
  dimension_id INTEGER REFERENCES dimensions(id) ON DELETE CASCADE,
  segment_level INTEGER CHECK (segment_level >= 1 AND segment_level <= 5), -- Can be null if not segment specific
  text_en TEXT NOT NULL,
  text_ru TEXT NOT NULL,
  usecase_tag TEXT
);
ALTER TABLE open_questions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_open_questions_dimension_id ON open_questions(dimension_id);

-- Users Table: Stores user data
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  role TEXT, -- e.g., founder, student, manager
  metadata JSONB, -- e.g., industry, language_preference (en/ru)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- User Responses Table: Stores closed-ended responses
CREATE TABLE IF NOT EXISTS user_responses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- Can be a separate session table or just a UUID for grouping
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  answer_option_id INTEGER REFERENCES answer_options(id) ON DELETE CASCADE,
  response_time_ms INTEGER, -- Response time in milliseconds
  timestamp TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_user_responses_user_id ON user_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_session_id ON user_responses(session_id);

-- Open Responses Table: Stores open-ended responses and LLM analysis
CREATE TABLE IF NOT EXISTS open_responses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  question_id INTEGER REFERENCES open_questions(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  llm_interpretation TEXT,
  llm_confidence FLOAT,
  word_count INTEGER,
  response_time_ms INTEGER,
  attempt_number INTEGER DEFAULT 1,
  input_mode TEXT, -- e.g., text, voice (future)
  timestamp TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE open_responses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_open_responses_user_id ON open_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_open_responses_session_id ON open_responses(session_id);

-- User Results Table: Stores assessment results
CREATE TABLE IF NOT EXISTS user_results (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  dimension_id INTEGER REFERENCES dimensions(id) ON DELETE CASCADE,
  theta FLOAT, -- Estimated trait level
  segment INTEGER CHECK (segment >= 1 AND segment <= 5),
  confidence_score FLOAT, -- Confidence in the theta estimate (0-1)
  reliability_score FLOAT, -- Reliability of responses for this dimension (0-1 or 0-100)
  retake_recommended BOOLEAN DEFAULT FALSE,
  assessment_date TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, session_id, dimension_id) -- Ensure one result per dimension per session
);
ALTER TABLE user_results ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_user_results_user_id ON user_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_results_session_id ON user_results(session_id);

-- Teams Table: For team-based reporting
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  team_name TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Team Members Table: Links users to teams
CREATE TABLE IF NOT EXISTS team_members (
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_in_team TEXT, -- e.g., Leader, Member
  PRIMARY KEY (team_id, user_id)
);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Interpretation Templates Table: For report generation
CREATE TABLE IF NOT EXISTS interpretation_templates (
  id SERIAL PRIMARY KEY,
  dimension_id INTEGER REFERENCES dimensions(id) ON DELETE CASCADE,
  segment INTEGER NOT NULL CHECK (segment >= 1 AND segment <= 5),
  report_type TEXT NOT NULL, -- e.g., individual, manager, team
  template_text_en TEXT NOT NULL,
  template_text_ru TEXT NOT NULL,
  usecase_tag TEXT
);
ALTER TABLE interpretation_templates ENABLE ROW LEVEL SECURITY;

-- Consistency Prompts Table: For LLM-based clarification of inconsistent responses
CREATE TABLE IF NOT EXISTS consistency_prompts (
  id SERIAL PRIMARY KEY,
  prompt_key TEXT UNIQUE NOT NULL, -- e.g., LIKERT_NEUTRAL_CLARIFICATION
  prompt_text_en TEXT NOT NULL,
  prompt_text_ru TEXT NOT NULL
);
ALTER TABLE consistency_prompts ENABLE ROW LEVEL SECURITY;

-- Question Templates Table: For dynamic LLM-generated questions (Post-MVP)
CREATE TABLE IF NOT EXISTS question_templates (
  id SERIAL PRIMARY KEY,
  template_key TEXT UNIQUE NOT NULL,
  template_text_en TEXT NOT NULL,
  template_text_ru TEXT NOT NULL,
  dimension_id INTEGER REFERENCES dimensions(id) ON DELETE CASCADE,
  usecase_tag TEXT
);
ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;

-- Question Embeddings Table: Placeholder for future vector storage (Post-MVP)
CREATE TABLE IF NOT EXISTS question_embeddings (
  id SERIAL PRIMARY KEY,
  question_id INTEGER UNIQUE, -- Can reference questions(id) or open_questions(id)
  embedding VECTOR(384), -- Example dimension, adjust as needed for Sentence-BERT or other models
  language CHAR(2) NOT NULL CHECK (language IN ('en', 'ru'))
);
ALTER TABLE question_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Examples - to be refined based on specific service roles and user access patterns)

-- Users can manage their own data
CREATE POLICY "Users can select their own user data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own user data" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Users cannot delete themselves directly, use delete_user_cascade function by a privileged role or trigger

-- Users can manage their own responses
CREATE POLICY "Users can manage their own user_responses" ON user_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own open_responses" ON open_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own user_results" ON user_results FOR ALL USING (auth.uid() = user_id);

-- Public tables (read-only for authenticated users, or specific service roles)
CREATE POLICY "Authenticated users can read dimensions" ON dimensions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read questions" ON questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read answer_options" ON answer_options FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read open_questions" ON open_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read interpretation_templates" ON interpretation_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read consistency_prompts" ON consistency_prompts FOR SELECT USING (auth.role() = 'authenticated');

-- Team management policies (example - more granular control needed)
-- Allow users to create teams
CREATE POLICY "Users can insert teams" ON teams FOR INSERT WITH CHECK (auth.uid() = created_by);
-- Allow users to view teams they are members of or created
CREATE POLICY "Users can view their teams" ON teams FOR SELECT USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = id AND tm.user_id = auth.uid()));
-- Allow team creators to manage their teams (update/delete)
CREATE POLICY "Team creators can update their teams" ON teams FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Team creators can delete their teams" ON teams FOR DELETE USING (auth.uid() = created_by);

-- Allow users to manage their membership in teams
CREATE POLICY "Users can manage their own team_members entries" ON team_members FOR ALL USING (auth.uid() = user_id);
-- Allow team creators to add/remove members (requires more complex logic or service role)

-- Service role for backend services (full access - ensure this role is secure)
-- CREATE POLICY "Allow service_role full access" ON ALL TABLES FOR ALL USING (auth.role() = 'service_role');
-- It's generally better to grant specific permissions to service roles rather than blanket access.

COMMENT ON TABLE questions IS 'Stores 1,200 core questions (Likert, Forced-choice, Scenario, Check_consistency, Check_social) and their attributes.';
COMMENT ON TABLE open_questions IS 'Stores 225 open-ended questions designed to elicit free-text responses.';
COMMENT ON FUNCTION delete_user_cascade IS 'Deletes a user and all their associated data in a cascading manner for GDPR compliance.';


