-- =======================================================================
-- MYRIMAVEN: CAREER EXPLORATION SANDBOX
-- Relational Database Schema (DDL)
-- Compatible with PostgreSQL, MySQL 8+, Supabase, SQLite
-- =======================================================================

-- Drop existing tables (in reverse foreign key dependency order)
DROP TABLE IF EXISTS maya_chat_messages CASCADE;
DROP TABLE IF EXISTS career_comparisons CASCADE;
DROP TABLE IF EXISTS saved_careers CASCADE;
DROP TABLE IF EXISTS career_balance_scenarios CASCADE;
DROP TABLE IF EXISTS career_match_reasons CASCADE;
DROP TABLE IF EXISTS career_work_environments CASCADE;
DROP TABLE IF EXISTS career_skills_to_develop CASCADE;
DROP TABLE IF EXISTS career_skills CASCADE;
DROP TABLE IF EXISTS career_tags CASCADE;
DROP TABLE IF EXISTS careers CASCADE;
DROP TABLE IF EXISTS user_goals CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS user_interests CASCADE;
DROP TABLE IF EXISTS interests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores user identity and academic / career exploration stage
-- -----------------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    current_stage VARCHAR(50) DEFAULT 'College / University', -- 'High school', 'College / University', 'Early career', 'Career switcher'
    exploration_progress INT DEFAULT 85 CHECK (exploration_progress BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------
-- 2. INTERESTS & USER INTERESTS
-- Onboarding Step 2: Curiosity topics
-- -----------------------------------------------------------------------
CREATE TABLE interests (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    icon_name VARCHAR(50) NOT NULL
);

CREATE TABLE user_interests (
    user_id VARCHAR(50) NOT NULL,
    interest_id VARCHAR(50) NOT NULL,
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, interest_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------
-- 3. SKILLS & USER SKILLS
-- Onboarding Step 3: 8 core skills with 1-5 confidence rating
-- -----------------------------------------------------------------------
CREATE TABLE skills (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL
);

CREATE TABLE user_skills (
    user_id VARCHAR(50) NOT NULL,
    skill_id VARCHAR(50) NOT NULL,
    proficiency_level INT NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5), -- 1: Developing, 3: Confident, 5: Superpower
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------
-- 4. USER WORK PREFERENCES
-- Onboarding Step 4: 6 Bilateral sliders (0 to 100)
-- -----------------------------------------------------------------------
CREATE TABLE user_preferences (
    user_id VARCHAR(50) PRIMARY KEY,
    solo_vs_team INT DEFAULT 50 CHECK (solo_vs_team BETWEEN 0 AND 100),                -- 0 = Solo, 100 = Team
    structured_vs_flexible INT DEFAULT 50 CHECK (structured_vs_flexible BETWEEN 0 AND 100), -- 0 = Structured, 100 = Flexible
    office_vs_remote INT DEFAULT 50 CHECK (office_vs_remote BETWEEN 0 AND 100),          -- 0 = Office, 100 = Remote
    people_vs_task INT DEFAULT 50 CHECK (people_vs_task BETWEEN 0 AND 100),              -- 0 = People, 100 = Task
    creative_vs_analytical INT DEFAULT 50 CHECK (creative_vs_analytical BETWEEN 0 AND 100), -- 0 = Creative, 100 = Analytical
    fast_vs_predictable INT DEFAULT 50 CHECK (fast_vs_predictable BETWEEN 0 AND 100),    -- 0 = Fast, 100 = Predictable
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------
-- 5. GOALS & USER GOALS
-- Onboarding Step 5: Prioritized values & ranking
-- -----------------------------------------------------------------------
CREATE TABLE goals (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    icon_name VARCHAR(50) NOT NULL
);

CREATE TABLE user_goals (
    user_id VARCHAR(50) NOT NULL,
    goal_id VARCHAR(50) NOT NULL,
    rank_order INT NOT NULL CHECK (rank_order BETWEEN 1 AND 4), -- 1st, 2nd, 3rd, 4th priority
    PRIMARY KEY (user_id, goal_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------
-- 6. CAREERS TABLE
-- Master catalog of roles, categories, descriptions, fit and watch-outs
-- -----------------------------------------------------------------------
CREATE TABLE careers (
    id VARCHAR(50) PRIMARY KEY,
    slug VARCHAR(60) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    base_match INT NOT NULL CHECK (base_match BETWEEN 0 AND 100),
    description TEXT NOT NULL,
    may_fit_because TEXT NOT NULL,
    watch_out TEXT NOT NULL,
    education_level VARCHAR(50) NOT NULL DEFAULT 'Bachelor''s', -- 'Bachelor''s', 'Advanced', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------
-- 7. CAREER TAGS
-- Pills: 'Collaborative', 'Fast-paced', 'Creative', 'Hybrid', 'Remote', etc.
-- -----------------------------------------------------------------------
CREATE TABLE career_tags (
    id SERIAL PRIMARY KEY,
    career_id VARCHAR(50) NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------
-- 8. CAREER SKILLS & SKILLS TO DEVELOP
-- Daily skills meter (e.g. Communication 95%) and future growth skills
-- -----------------------------------------------------------------------
CREATE TABLE career_skills (
    id SERIAL PRIMARY KEY,
    career_id VARCHAR(50) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    usage_level INT NOT NULL CHECK (usage_level BETWEEN 0 AND 100),
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

CREATE TABLE career_skills_to_develop (
    id SERIAL PRIMARY KEY,
    career_id VARCHAR(50) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------
-- 9. CAREER WORK ENVIRONMENTS
-- Badges: 'Team pods', 'Client-facing', 'Deadline-driven', etc.
-- -----------------------------------------------------------------------
CREATE TABLE career_work_environments (
    id SERIAL PRIMARY KEY,
    career_id VARCHAR(50) NOT NULL,
    environment_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------
-- 10. CAREER MATCH REASONS
-- Detailed "Why this may fit you" boxes on Screen 09
-- -----------------------------------------------------------------------
CREATE TABLE career_match_reasons (
    id SERIAL PRIMARY KEY,
    career_id VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    display_order INT DEFAULT 1,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------
-- 11. CAREER BALANCE SCENARIOS (WHAT-IF SANDBOX)
-- Powers Screen 14: Simulated scores, delta, and scenario notes
-- -----------------------------------------------------------------------
CREATE TABLE career_balance_scenarios (
    career_id VARCHAR(50) PRIMARY KEY,
    scenario_score INT NOT NULL CHECK (scenario_score BETWEEN 0 AND 100),
    delta_value VARCHAR(10) NOT NULL, -- '+10', '-12', 'NEW', etc.
    scenario_note VARCHAR(255),
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------
-- 12. SAVED CAREERS
-- Powers Screen 11: Shortlisted roles
-- -----------------------------------------------------------------------
CREATE TABLE saved_careers (
    user_id VARCHAR(50) NOT NULL,
    career_id VARCHAR(50) NOT NULL,
    user_notes TEXT,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, career_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------
-- 13. CAREER COMPARISONS
-- Powers Screen 12: Active comparative matrix (up to 3 roles)
-- -----------------------------------------------------------------------
CREATE TABLE career_comparisons (
    user_id VARCHAR(50) NOT NULL,
    career_id VARCHAR(50) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, career_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------
-- 14. MAYA CHAT SESSIONS & MESSAGES
-- Powers Maya AI Guide Drawer logs and contextual inquiry
-- -----------------------------------------------------------------------
CREATE TABLE maya_chat_messages (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    career_id VARCHAR(50), -- Optional: context role if asked from Screen 09
    sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'maya')),
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE SET NULL
);

-- =======================================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERING
-- =======================================================================
CREATE INDEX idx_careers_category ON careers(category);
CREATE INDEX idx_careers_match ON careers(base_match DESC);
CREATE INDEX idx_saved_careers_user ON saved_careers(user_id);
CREATE INDEX idx_comparisons_user ON career_comparisons(user_id);
CREATE INDEX idx_maya_messages_user ON maya_chat_messages(user_id, created_at);
