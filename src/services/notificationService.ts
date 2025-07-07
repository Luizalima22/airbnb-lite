// src/services/notificationService.ts
import { supabase } from '@/lib/supabaseClient';

export async function createNotification(notification: {
  user_id: string;
  message: string;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listNotifications(user_id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
