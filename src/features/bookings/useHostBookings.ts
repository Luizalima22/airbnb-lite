// src/features/bookings/useHostBookings.ts
"use client";
import { useEffect, useState, useCallback } from 'react';
import { listBookingsByHost } from '@/services/bookingService';

interface Booking {
  id: string;
  property_id: string;
  client_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  created_at: string;
}

export function useHostBookings(host_id: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!host_id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await listBookingsByHost(host_id);
      setBookings(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  }, [host_id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error };
}
