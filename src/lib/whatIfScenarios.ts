
import { getSupabaseClient } from './supabase';
import type { UserProfile, WhatIfState } from '../types/career';

export interface SavedWhatIfScenario {
  id: string;
  auth_user_id: string;
  name: string;
  preferences: UserProfile['preferences'];
  priorities: WhatIfState;
  // Null for scenarios saved before interests and skills were supported.
  interests: string[] | null;
  skills: UserProfile['skills'] | null;
  created_at: string;
  updated_at: string;
}

async function requireUser() {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) {
    throw new Error('Please sign in to manage your scenarios.');
  }

  return { supabase, user };
}

export async function loadWhatIfScenarios(): Promise<SavedWhatIfScenario[]> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from('what_if_scenarios')
    .select('*')
    .eq('auth_user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as SavedWhatIfScenario[];
}

export async function saveWhatIfScenario(
  name: string,
  preferences: UserProfile['preferences'],
  priorities: WhatIfState,
  interests: string[],
  skills: UserProfile['skills']
): Promise<SavedWhatIfScenario> {
  const { supabase, user } = await requireUser();
  const trimmedName = name.trim();

  if (!trimmedName || trimmedName.length > 100) {
    throw new Error(
      'Scenario names must be between 1 and 100 characters.'
    );
  }

  const { data, error } = await supabase
    .from('what_if_scenarios')
    .insert({
      auth_user_id: user.id,
      name: trimmedName,
      preferences,
      priorities,
      interests: [...interests],
      skills: { ...skills },
    })
    .select()
    .single();

  if (error) throw error;

  return data as SavedWhatIfScenario;
}

export async function deleteWhatIfScenario(
  id: string
): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('what_if_scenarios')
    .delete()
    .eq('id', id)
    .eq('auth_user_id', user.id);

  if (error) throw error;
}
