// src/services/profileService.ts
import { supabase } from '@/lib/supabaseClient';

export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(id: string, updates: Partial<{ name: string; avatar_url: string; role: string; }>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
}
