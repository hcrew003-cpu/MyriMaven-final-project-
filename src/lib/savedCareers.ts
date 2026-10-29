
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

async function getCareerUserId(user: User): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (error) throw error;

  return data.id;
}

export async function loadSavedCareers(user: User): Promise<string[]> {
  const supabase = getSupabaseClient();
  const userId = await getCareerUserId(user);

  const { data, error } = await supabase
    .from('saved_careers')
    .select('career_id')
    .eq('user_id', userId);

  if (error) throw error;

  return (data ?? []).map((row) => row.career_id);
}

export async function addSavedCareer(
  user: User,
  careerId: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const userId = await getCareerUserId(user);

  const { error } = await supabase
    .from('saved_careers')
    .insert({
      user_id: userId,
      career_id: careerId,
    });

  if (error) throw error;
}

export async function removeSavedCareer(
  user: User,
  careerId: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const userId = await getCareerUserId(user);

  const { error } = await supabase
    .from('saved_careers')
    .delete()
    .eq('user_id', userId)
    .eq('career_id', careerId);

  if (error) throw error;
}
