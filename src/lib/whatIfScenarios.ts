
import { getSupabaseClient } from './supabase';
import type { UserProfile, WhatIfState } from '../types/career';

export interface SavedWhatIfScenario {
  id: string;
  auth_user_id: string;
  name: string;
  preferences: UserProfile['preferences'];
  priorities: WhatIfState;
  created_at: string;
  updated_at: string;
}

export async function loadWhatIfScenarios(): Promise<SavedWhatIfScenario[]> {
  const supabase = getSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('Please sign in to view your scenarios.');

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
  priorities: WhatIfState
): Promise<SavedWhatIfScenario> {
  const supabase = getSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('Please sign in to save a scenario.');

  const trimmedName = name.trim();

  if (!trimmedName || trimmedName.length > 100) {
    throw new Error('Scenario names must be between 1 and 100 characters.');
  }

  const { data, error } = await supabase
    .from('what_if_scenarios')
    .insert({
      auth_user_id: user.id,
      name: trimmedName,
      preferences,
      priorities,
    })
    .select()
    .single();

  if (error) throw error;

  return data as SavedWhatIfScenario;
}

export async function deleteWhatIfScenario(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('Please sign in to delete a scenario.');

  const { error } = await supabase
    .from('what_if_scenarios')
    .delete()
    .eq('id', id)
    .eq('auth_user_id', user.id);

  if (error) throw error;
}


