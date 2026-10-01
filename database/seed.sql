-- =======================================================================
-- MYRIMAVEN: CAREER EXPLORATION SANDBOX
-- Seed Data Script
-- Populates all careers, skills, interests, goals, and demo user data
-- =======================================================================

-- 1. SEED INTERESTS
INSERT INTO interests (id, label, description, icon_name) VALUES
('tech', 'Technology', 'Apps, AI & building', 'Cpu'),
('business', 'Business', 'Startups & strategy', 'Briefcase'),
('people', 'Helping People', 'Support & care', 'HeartHandshake'),
('creative', 'Creativity', 'Design & storytelling', 'Palette'),
('environment', 'Environment', 'Climate & nature', 'Leaf'),
('problem-solving', 'Problem Solving', 'Puzzles & systems', 'Puzzle'),
('leadership', 'Leadership', 'Guide & inspire', 'Crown'),
('data', 'Working with Data', 'Numbers & patterns', 'BarChart3'),
('communication', 'Communication', 'Writing & speaking', 'Megaphone'),
('children', 'Working with Children', 'Teach & mentor', 'Smile'),
('healthcare', 'Healthcare', 'Health & wellbeing', 'Stethoscope'),
('entrepreneurship', 'Entrepreneurship', 'Build your own thing', 'Rocket');

-- 2. SEED SKILLS
INSERT INTO skills (id, name, description) VALUES
('skill_comm', 'Communication', 'Explaining ideas clearly'),
('skill_lead', 'Leadership', 'Guiding groups forward'),
('skill_org', 'Organization', 'Plans, systems, follow-through'),
('skill_prob', 'Problem Solving', 'Untangling tricky challenges'),
('skill_res', 'Research', 'Finding & judging information'),
('skill_creat', 'Creativity', 'Fresh ideas & making things'),
('skill_team', 'Teamwork', 'Collaborating well'),
('skill_analyt', 'Analytical Thinking', 'Data & logical reasoning');

-- 3. SEED GOALS
INSERT INTO goals (id, label, description, icon_name) VALUES
('goal_growth', 'Growth', 'Keep learning & advancing', 'TrendingUp'),
('goal_leadership', 'Leadership', 'Guide teams & decisions', 'Users'),
('goal_balance', 'Work-life balance', 'Work that fits your life', 'Scale'),
('goal_income', 'Income potential', 'Strong earning upside', 'Banknote'),
('goal_help', 'Helping others', 'Make a daily difference', 'Heart'),
('goal_stability', 'Job stability', 'Steady & secure', 'ShieldCheck'),
('goal_creativity', 'Creativity', 'Expressive work', 'Sparkles'),
('goal_impact', 'Making an impact', 'Change at scale', 'Globe'),
('goal_flex', 'Flexibility', 'Location & hours freedom', 'Compass');

-- 4. SEED MASTER CAREERS
INSERT INTO careers (id, slug, title, category, base_match, description, may_fit_because, watch_out, education_level) VALUES
('marketing-manager', 'marketing-manager', 'Marketing Manager', 'Business · Marketing', 94, 
 'Marketing managers plan and lead campaigns that connect products with the right audiences — blending research, messaging, creativity, and coordination across teams.',
 'your communication strength + business interest + collaborative style.',
 'Tight deadlines + constant collaboration — tough if you crave solo, predictable days. Budgets shift, feedback is constant, and results aren''t always immediate.',
 'Bachelor''s'),

('product-designer', 'product-designer', 'Product Designer', 'Creative · Technology', 91,
 'Research, prototype and shape digital experiences that solve real user friction points while balancing business goals.',
 'your creativity + problem solving + growth goal.',
 'Heavy feedback loops; you''ll defend design choices often against engineering and business constraints.',
 'Bachelor''s'),

('project-manager', 'project-manager', 'Project Manager', 'Business · Operations', 88,
 'Keep teams, timelines and goals moving together smoothly by anticipating risks, removing blockers, and maintaining alignment.',
 'your organization (5/5) + leadership interest.',
 'Lots of coordination overhead, status updates, and conflict mediation when schedules slip.',
 'Bachelor''s'),

('content-strategist', 'content-strategist', 'Content Strategist', 'Creative · Communications', 84,
 'Plan stories and messages across channels to build audience trust, articulate brand perspective, and drive meaningful action.',
 'your communication + creativity combo.',
 'Success can be slow to measure; needs patience with organic distribution and editorial approval delays.',
 'Bachelor''s'),

('hr-specialist', 'hr-specialist', 'HR Specialist', 'Business · People Operations', 79,
 'Support hiring, workplace culture, onboarding, and employee growth so individuals and organizations thrive together.',
 'your people interest + teamwork.',
 'Emotionally heavy situations + policy constraints. You must balance company risk with human advocacy.',
 'Bachelor''s'),

('data-analyst', 'data-analyst', 'Data Analyst', 'Technology · Analytics', 72,
 'Turn numbers into decisions teams act on by modeling queries, creating visual dashboards, and surfacing unexpected trends.',
 'your problem solving + organization.',
 'Long solo focus blocks — less collaborative day-to-day than you might usually prefer.',
 'Bachelor''s'),

('counsellor', 'counsellor', 'Counsellor', 'Healthcare · Social Services', 75,
 'Support people through major life transitions, challenges, emotional roadblocks, and relationship hurdles with structured guidance.',
 'high empathy, active listening and personal growth focus.',
 'Secondary trauma exposure; demands solid personal boundaries to avoid burnout.',
 'Advanced'),

('teacher', 'teacher', 'Teacher', 'Education · Mentorship', 81,
 'Inspire classrooms every day by translating curriculum into engaging discussions, creative activities, and formative growth.',
 'communication strength, mentorship and community contribution.',
 'Rigid daily schedule, extracurricular grading load, and systemic administrative hurdles.',
 'Bachelor''s'),

('nurse', 'nurse', 'Nurse', 'Healthcare · Clinical Care', 74,
 'Deliver acute, compassionate care to patients and families while coordinating with clinical specialists in fast-moving medical units.',
 'deep care for human wellbeing, rapid teamwork, and high job stability.',
 'Physically demanding shifts, weekend/holiday rotations, and high-stress emergency moments.',
 'Bachelor''s'),

('librarian', 'librarian', 'Librarian', 'Education · Information Science', 68,
 'Curate community knowledge, run literacy programs, and assist researchers in finding reputable information in calm, welcoming public spaces.',
 'deep appreciation for research, organization, and accessible civic resources.',
 'Municipal budget limits and slower career advancement tiers.',
 'Advanced'),

('ux-designer', 'ux-designer', 'UX Designer', 'Creative · Technology', 94,
 'Design intuitive digital experiences by mapping user journeys, testing prototypes, and turning messy workflows into elegant interfaces.',
 'your creativity + empathy + analytical approach to design.',
 'Balancing client feature wish-lists with technical feasibility and deadlines.',
 'Bachelor''s'),

('software-developer', 'software-developer', 'Software Developer', 'Technology · Engineering', 76,
 'Build robust apps, APIs, and systems with clean code, testing suites, and scalable cloud architectures.',
 'structured logic, continuous learning upside and deep focus.',
 'High cognitive fatigue and rapid technological obsolescence requiring constant reskilling.',
 'Bachelor''s');

-- 5. SEED WHAT-IF SCENARIOS
INSERT INTO career_balance_scenarios (career_id, scenario_score, delta_value, scenario_note) VALUES
('counsellor', 93, 'NEW', 'Support people through change with personal pacing.'),
('teacher', 90, '+9', 'Inspire classrooms with predictable term schedules.'),
('hr-specialist', 87, '+8', 'Grow healthy workplace environments.'),
('product-designer', 86, '-5', 'Critique cycles require resilience.'),
('nurse', 84, '+10', 'Care with evergreen job stability.'),
('marketing-manager', 82, '-12', 'Still strong — pace trade-off grew.'),
('project-manager', 81, '-7', 'Coordination burden remains steady.'),
('librarian', 80, 'NEW', 'Calm, curious, community-rooted.');

-- 6. SEED DEMO USER (Priya)
INSERT INTO users (id, name, email, current_stage, exploration_progress) VALUES
('user_priya_01', 'Priya', 'priya@university.ca', 'College / University', 85);

INSERT INTO user_preferences (user_id, solo_vs_team, structured_vs_flexible, office_vs_remote, people_vs_task, creative_vs_analytical, fast_vs_predictable) VALUES
('user_priya_01', 72, 68, 45, 48, 32, 28);

INSERT INTO saved_careers (user_id, career_id) VALUES
('user_priya_01', 'marketing-manager'),
('user_priya_01', 'product-designer'),
('user_priya_01', 'project-manager');

INSERT INTO career_comparisons (user_id, career_id) VALUES
('user_priya_01', 'marketing-manager'),
('user_priya_01', 'product-designer'),
('user_priya_01', 'project-manager');
