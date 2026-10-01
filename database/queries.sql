-- =======================================================================
-- MYRIMAVEN: CAREER EXPLORATION SANDBOX
-- Application SQL Queries Reference
-- Grouped by screen and functional feature
-- =======================================================================

-- =======================================================================
-- SCREEN 01–07: ONBOARDING & PROFILE SETUP
-- =======================================================================

-- 1. Create a new student/explorer user
INSERT INTO users (id, name, email, current_stage, exploration_progress)
VALUES ('user_priya_01', 'Priya', 'priya@university.ca', 'College / University', 85)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = CURRENT_TIMESTAMP;

-- 2. Save selected interests (Screen 03: minimum 3 required)
INSERT INTO user_interests (user_id, interest_id)
VALUES 
    ('user_priya_01', 'tech'),
    ('user_priya_01', 'business'),
    ('user_priya_01', 'creative'),
    ('user_priya_01', 'problem-solving'),
    ('user_priya_01', 'leadership'),
    ('user_priya_01', 'communication')
ON CONFLICT (user_id, interest_id) DO NOTHING;

-- 3. Save skill confidence ratings (Screen 04: 1 to 5 scale)
INSERT INTO user_skills (user_id, skill_id, proficiency_level)
VALUES
    ('user_priya_01', 'skill_comm', 5),       -- Communication (Superpower)
    ('user_priya_01', 'skill_org', 5),        -- Organization (Superpower)
    ('user_priya_01', 'skill_lead', 4),       -- Leadership
    ('user_priya_01', 'skill_creat', 4),      -- Creativity
    ('user_priya_01', 'skill_prob', 3),       -- Problem Solving
    ('user_priya_01', 'skill_team', 3),       -- Teamwork
    ('user_priya_01', 'skill_analyt', 3),     -- Analytical Thinking
    ('user_priya_01', 'skill_res', 2)         -- Research
ON CONFLICT (user_id, skill_id) DO UPDATE SET proficiency_level = EXCLUDED.proficiency_level;

-- 4. Save bilateral slider work preferences (Screen 05: 0 to 100)
INSERT INTO user_preferences (
    user_id, 
    solo_vs_team, 
    structured_vs_flexible, 
    office_vs_remote, 
    people_vs_task, 
    creative_vs_analytical, 
    fast_vs_predictable
)
VALUES (
    'user_priya_01', 
    72,  -- Leans team collaboration
    68,  -- Leans flexible & creative ambiguity
    45,  -- Hybrid curious (2-3 days remote)
    48,  -- Balanced people/task
    32,  -- Leans creative expression
    28   -- Leans fast-paced & changing
)
ON CONFLICT (user_id) DO UPDATE SET
    solo_vs_team = EXCLUDED.solo_vs_team,
    structured_vs_flexible = EXCLUDED.structured_vs_flexible,
    office_vs_remote = EXCLUDED.office_vs_remote,
    people_vs_task = EXCLUDED.people_vs_task,
    creative_vs_analytical = EXCLUDED.creative_vs_analytical,
    fast_vs_predictable = EXCLUDED.fast_vs_predictable,
    updated_at = CURRENT_TIMESTAMP;

-- 5. Save top prioritized goals & values (Screen 06: ranked 1 to 4)
INSERT INTO user_goals (user_id, goal_id, rank_order)
VALUES
    ('user_priya_01', 'goal_growth', 1),     -- #1 Priority: Growth & Advancement
    ('user_priya_01', 'goal_leadership', 2), -- #2 Priority: Leadership
    ('user_priya_01', 'goal_balance', 3)     -- #3 Priority: Work-life balance
ON CONFLICT (user_id, goal_id) DO UPDATE SET rank_order = EXCLUDED.rank_order;

-- 6. Fetch complete profile summary for review (Screen 07)
SELECT 
    u.id, 
    u.name, 
    u.current_stage,
    p.solo_vs_team, 
    p.structured_vs_flexible, 
    p.office_vs_remote,
    p.creative_vs_analytical
FROM users u
LEFT JOIN user_preferences p ON u.id = p.user_id
WHERE u.id = 'user_priya_01';

-- 7. Fetch user's top strengths (4/5 and 5/5)
SELECT s.name AS strength_name, us.proficiency_level
FROM user_skills us
JOIN skills s ON us.skill_id = s.id
WHERE us.user_id = 'user_priya_01' AND us.proficiency_level >= 4
ORDER BY us.proficiency_level DESC;


-- =======================================================================
-- SCREEN 08: AI RECOMMENDATIONS
-- =======================================================================

-- 8. Fetch all personalized career matches ordered by match score
SELECT 
    c.id,
    c.title,
    c.category,
    c.base_match,
    c.description,
    c.may_fit_because,
    c.watch_out,
    c.education_level,
    CASE WHEN sc.career_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_saved,
    CASE WHEN cc.career_id IS NOT NULL THEN TRUE ELSE FALSE END AS in_compare
FROM careers c
LEFT JOIN saved_careers sc ON c.id = sc.career_id AND sc.user_id = 'user_priya_01'
LEFT JOIN career_comparisons cc ON c.id = cc.career_id AND cc.user_id = 'user_priya_01'
ORDER BY c.base_match DESC;

-- 9. Filter matches by category or high match threshold (e.g. 90%+)
SELECT id, title, category, base_match
FROM careers
WHERE base_match >= 90
ORDER BY base_match DESC;

-- 10. Fetch all tags associated with recommended careers
SELECT career_id, tag_name
FROM career_tags
WHERE career_id IN ('marketing-manager', 'product-designer', 'project-manager');


-- =======================================================================
-- SCREEN 09: CAREER PROFILE DETAIL
-- =======================================================================

-- 11. Fetch single career profile header & overview
SELECT 
    id, 
    title, 
    category, 
    base_match, 
    description, 
    may_fit_because, 
    watch_out, 
    education_level
FROM careers
WHERE id = 'marketing-manager';

-- 12. Fetch the 4 structured "Why this may fit you" reason cards
SELECT title, description, icon_name, display_order
FROM career_match_reasons
WHERE career_id = 'marketing-manager'
ORDER BY display_order ASC;

-- 13. Fetch skills breakdown meters (Communication 95%, Creativity 85%, etc.)
SELECT skill_name, usage_level
FROM career_skills
WHERE career_id = 'marketing-manager'
ORDER BY usage_level DESC;

-- 14. Fetch skills to develop and work environment badges
SELECT 'skill_to_develop' AS type, skill_name AS detail
FROM career_skills_to_develop
WHERE career_id = 'marketing-manager'
UNION ALL
SELECT 'work_environment' AS type, environment_name AS detail
FROM career_work_environments
WHERE career_id = 'marketing-manager';


-- =======================================================================
-- SCREEN 10: EXPLORE DIRECTORY & SEARCH
-- =======================================================================

-- 15. Dynamic search query across title, description, skills, and tags
SELECT DISTINCT 
    c.id, 
    c.title, 
    c.category, 
    c.base_match, 
    c.description, 
    c.education_level
FROM careers c
LEFT JOIN career_tags ct ON c.id = ct.career_id
LEFT JOIN career_skills cs ON c.id = cs.career_id
WHERE 
    (LOWER(c.title) LIKE '%design%' 
     OR LOWER(c.description) LIKE '%design%' 
     OR LOWER(ct.tag_name) LIKE '%design%' 
     OR LOWER(cs.skill_name) LIKE '%design%')
    AND (c.category LIKE '%Creative%' OR 'All' = 'All')
    AND (c.education_level = 'Bachelor''s' OR 'All' = 'All')
ORDER BY c.base_match DESC;


-- =======================================================================
-- SCREEN 11: SAVED CAREERS
-- =======================================================================

-- 16. Toggle Save: Add a career to user's saved shortlist
INSERT INTO saved_careers (user_id, career_id, user_notes)
VALUES ('user_priya_01', 'product-designer', 'Excited about Figma prototyping and remote flexibility')
ON CONFLICT (user_id, career_id) DO NOTHING;

-- 17. Toggle Save: Remove career from shortlist
DELETE FROM saved_careers
WHERE user_id = 'user_priya_01' AND career_id = 'product-designer';

-- 18. Retrieve all saved careers with match score for shortlist view
SELECT 
    c.id,
    c.title,
    c.category,
    c.base_match,
    c.description,
    sc.user_notes,
    sc.saved_at
FROM saved_careers sc
JOIN careers c ON sc.career_id = c.id
WHERE sc.user_id = 'user_priya_01'
ORDER BY sc.saved_at DESC;


-- =======================================================================
-- SCREEN 12: SIDE-BY-SIDE COMPARISON
-- =======================================================================

-- 19. Add a career to compare matrix (capped at 3)
INSERT INTO career_comparisons (user_id, career_id)
VALUES ('user_priya_01', 'project-manager')
ON CONFLICT (user_id, career_id) DO NOTHING;

-- 20. Fetch side-by-side comparison data for 3 active careers
SELECT 
    c.id,
    c.title,
    c.category,
    c.base_match,
    c.education_level,
    c.may_fit_because,
    c.watch_out
FROM careers c
JOIN career_comparisons cc ON c.id = cc.career_id
WHERE cc.user_id = 'user_priya_01'
ORDER BY c.base_match DESC;


-- =======================================================================
-- SCREEN 13: DASHBOARD METRICS
-- =======================================================================

-- 21. Student Dashboard metric counters
SELECT 
    (SELECT COUNT(*) FROM careers) AS total_recommended_roles,
    (SELECT COUNT(*) FROM saved_careers WHERE user_id = 'user_priya_01') AS total_saved_roles,
    (SELECT COUNT(*) FROM career_comparisons WHERE user_id = 'user_priya_01') AS total_comparing,
    (SELECT exploration_progress FROM users WHERE id = 'user_priya_01') AS exploration_score;

-- 22. Top 3 matched careers for dashboard widgets
SELECT id, title, category, base_match, description
FROM careers
ORDER BY base_match DESC
LIMIT 3;


-- =======================================================================
-- SCREEN 14: WHAT-IF EXPLORATION SANDBOX
-- =======================================================================

-- 23. Real-time simulated reshuffling (e.g. Work-Life Balance + Helping Others active)
SELECT 
    c.id,
    c.title,
    c.category,
    c.base_match AS original_score,
    COALESCE(s.scenario_score, c.base_match) AS simulated_score,
    COALESCE(s.delta_value, '0') AS score_delta,
    s.scenario_note
FROM careers c
LEFT JOIN career_balance_scenarios s ON c.id = s.career_id
ORDER BY simulated_score DESC;

-- 24. Find top rising careers when prioritizing social impact and wellbeing
SELECT 
    c.title, 
    c.base_match, 
    s.scenario_score, 
    s.delta_value
FROM career_balance_scenarios s
JOIN careers c ON s.career_id = c.id
WHERE s.delta_value = 'NEW' OR CAST(REPLACE(s.delta_value, '+', '') AS INT) > 0
ORDER BY s.scenario_score DESC;


-- =======================================================================
-- MAYA AI GUIDE CHAT LOGS
-- =======================================================================

-- 25. Log a message from user or Maya
INSERT INTO maya_chat_messages (user_id, career_id, sender, message_text)
VALUES 
    ('user_priya_01', 'marketing-manager', 'user', 'What does an average Tuesday look like for a Marketing Manager?'),
    ('user_priya_01', 'marketing-manager', 'maya', 'Mornings involve cross-functional syncs and creative briefs. Mid-day is campaign analysis. The key tradeoff is deadline-driven shifts!');

-- 26. Fetch conversation thread history for Maya panel
SELECT sender, message_text, created_at
FROM maya_chat_messages
WHERE user_id = 'user_priya_01'
ORDER BY created_at ASC;
