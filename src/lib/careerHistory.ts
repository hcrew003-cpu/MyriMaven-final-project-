
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

export interface CareerHistoryItem {
  id: string;
  career_id: string;
  career_title: string;
  viewed_at: string;
}

const HISTORY_LIMIT = 20;

export async function loadCareerHistory(
  user: User
): Promise<CareerHistoryItem[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('career_history')
    .select('id, career_id, career_title, viewed_at')
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(HISTORY_LIMIT);

  if (error) throw error;

  return (data ?? []) as CareerHistoryItem[];
}

export async function recordCareerView(
  user: User,
  careerId: string,
  careerTitle: string
): Promise<void> {
  if (!careerId.trim() || !careerTitle.trim()) {
    return;
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('career_history')
    .upsert(
      {
        user_id: user.id,
        career_id: careerId,
        career_title: careerTitle,
        viewed_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,career_id',
      }
    );

  if (error) throw error;
}

export async function clearCareerHistory(
  user: User
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('career_history')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}
