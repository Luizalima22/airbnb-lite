// src/services/propertyService.ts
import { supabase } from '@/lib/supabaseClient';

export async function listProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('available', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createProperty(property: {
  host_id: string;
  title: string;
  description?: string;
  price_per_night: number;
  image_url?: string;
  location?: string;
}) {
  const { data, error } = await supabase
    .from('properties')
    .insert([property])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProperty(id: string, property: {
  title?: string;
  description?: string;
  price_per_night?: number;
  image_url?: string;
  location?: string;
  available?: boolean;
}) {
  const { data, error } = await supabase
    .from('properties')
    .update(property)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProperty(id: string) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
