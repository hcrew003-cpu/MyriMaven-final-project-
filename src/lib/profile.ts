import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '../types/career';
import { getSupabaseClient } from './supabase';

const interestIds: Record<string, string> = {
  Business: 'business',
  Communication: 'communication',
  Creativity: 'creative',
  Entrepreneurship: 'entrepreneurship',
  Environment: 'environment',
  Healthcare: 'healthcare',
  'Helping People': 'people',
  Leadership: 'leadership',
  'Problem Solving': 'problem-solving',
  Technology: 'tech',
  'Working with Children': 'children',
  'Working with Data': 'data',
};

const skillIds: Record<string, string> = {
  'Analytical Thinking': 'skill_analyt',
  Communication: 'skill_comm',
  Creativity: 'skill_creat',
  Leadership: 'skill_lead',
  Organization: 'skill_org',
  'Problem Solving': 'skill_prob',
  Research: 'skill_res',
  Teamwork: 'skill_team',
};

const goalIds: Record<string, string> = {
  Creativity: 'goal_creativity',
  Flexibility: 'goal_flex',
  Growth: 'goal_growth',
  'Helping others': 'goal_help',
  'Income potential': 'goal_income',
  'Job stability': 'goal_stability',
  Leadership: 'goal_leadership',
  'Making an impact': 'goal_impact',
  'Work-life balance': 'goal_balance',
};

function getId(mapping: Record<string, string>, label: string): string {
  const id = mapping[label];
  if (!id) throw new Error(`Unknown onboarding option: ${label}`);
  return id;
}

export async function saveUserProfile(user: User, profile: UserProfile) {
  const supabase = getSupabaseClient();

  // Reuse this user's existing profile row when available.
  const { data: existing, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (lookupError) throw lookupError;

  const userId = existing?.id ?? user.id;

  const { error: userError } = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        auth_user_id: user.id,
        name: profile.name,
        email: user.email,
        current_stage: profile.careerStage,
      },
      { onConflict: 'id' }
    );

  if (userError) throw userError;

  const { error: preferenceError } = await supabase
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        solo_vs_team: profile.preferences.soloVsTeam,
        structured_vs_flexible: profile.preferences.structuredVsFlexible,
        office_vs_remote: profile.preferences.officeVsRemote,
        people_vs_task: profile.preferences.peopleVsTask,
        creative_vs_analytical: profile.preferences.creativeVsAnalytical,
        fast_vs_predictable: profile.preferences.fastVsPredictable,
      },
      { onConflict: 'user_id' }
    );

  if (preferenceError) throw preferenceError;

  // Replace this user's selections while leaving all other users untouched.
  const tables = ['user_interests', 'user_skills', 'user_goals'] as const;

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }

  if (profile.interests.length) {
    const { error } = await supabase.from('user_interests').insert(
      profile.interests.map((label) => ({
        user_id: userId,
        interest_id: getId(interestIds, label),
      }))
    );
    if (error) throw error;
  }

  const skills = Object.entries(profile.skills);
  if (skills.length) {
    const { error } = await supabase.from('user_skills').insert(
      skills.map(([label, level]) => ({
        user_id: userId,
        skill_id: getId(skillIds, label),
        proficiency_level: level,
      }))
    );
    if (error) throw error;
  }

  if (profile.goals.length) {
    const { error } = await supabase.from('user_goals').insert(
      profile.goals.map((label, index) => ({
        user_id: userId,
        goal_id: getId(goalIds, label),
        rank_order: index + 1,
      }))
    );
    if (error) throw error;
  }
}

export async function loadUserProfile(
  user: User
): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();

  const { data: account, error: accountError } = await supabase
    .from('users')
    .select('id, name, current_stage')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (accountError) throw accountError;
  if (!account) return null;

  const [interestsResult, skillsResult, goalsResult, preferencesResult] =
    await Promise.all([
      supabase.from('user_interests').select('interest_id').eq('user_id', account.id),
      supabase.from('user_skills').select('skill_id, proficiency_level').eq('user_id', account.id),
      supabase.from('user_goals').select('goal_id, rank_order').eq('user_id', account.id),
      supabase.from('user_preferences').select('*').eq('user_id', account.id).maybeSingle(),
    ]);

  for (const result of [
    interestsResult,
    skillsResult,
    goalsResult,
    preferencesResult,
  ]) {
    if (result.error) throw result.error;
  }

  const labelFor = (mapping: Record<string, string>, id: string) =>
    Object.entries(mapping).find(([, value]) => value === id)?.[0];

  const skills: Record<string, number> = {};
  for (const row of skillsResult.data ?? []) {
    const label = labelFor(skillIds, row.skill_id);
    if (label) skills[label] = row.proficiency_level;
  }

  const preferences = preferencesResult.data;

  return {
    name: account.name ?? '',
    careerStage: account.current_stage ?? '',
    interests: (interestsResult.data ?? [])
      .map((row) => labelFor(interestIds, row.interest_id))
      .filter((label): label is string => Boolean(label)),
    skills,
    preferences: {
      soloVsTeam: preferences?.solo_vs_team ?? 50,
      structuredVsFlexible: preferences?.structured_vs_flexible ?? 50,
      officeVsRemote: preferences?.office_vs_remote ?? 50,
      peopleVsTask: preferences?.people_vs_task ?? 50,
      creativeVsAnalytical: preferences?.creative_vs_analytical ?? 50,
      fastVsPredictable: preferences?.fast_vs_predictable ?? 50,
    },
    goals: (goalsResult.data ?? [])
      .sort((a, b) => a.rank_order - b.rank_order)
      .map((row) => labelFor(goalIds, row.goal_id))
      .filter((label): label is string => Boolean(label)),
  };
}
