
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';

export interface CareerNote {
  career_id: string;
  note: string;
  updated_at: string;
}

// Load all personal career notes for the signed-in student.
export async function loadCareerNotes(
  user: User
): Promise<CareerNote[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('career_notes')
    .select('career_id, note, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data ?? []) as CareerNote[];
}

// Save a new note or update an existing note.
export async function saveCareerNote(
  user: User,
  careerId: string,
  note: string
): Promise<void> {
  if (!careerId.trim()) {
    throw new Error('A career ID is required.');
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('career_notes')
    .upsert(
      {
        user_id: user.id,
        career_id: careerId,
        note,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,career_id' }
    );

  if (error) throw error;
}

// Delete a personal note without removing the saved career.
export async function deleteCareerNote(
  user: User,
  careerId: string
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('career_notes')
    .delete()
    .eq('user_id', user.id)
    .eq('career_id', careerId);

  if (error) throw error;
}
