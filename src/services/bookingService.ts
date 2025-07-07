// src/services/bookingService.ts
import { supabase } from '@/lib/supabaseClient';

export async function createBooking(booking: {
  property_id: string;
  client_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
}) {
  // Usa a API route para bypass RLS
  const response = await fetch('/api/booking/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Erro ao criar reserva');
  }
  
  return result.booking;
}

export async function listBookingsByHost(host_id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, properties!inner(host_id)')
    .eq('properties.host_id', host_id);
  if (error) throw error;
  return data;
}

export async function updateBookingStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
