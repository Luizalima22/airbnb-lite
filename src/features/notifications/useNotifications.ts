// src/features/notifications/useNotifications.ts
"use client";
import { useEffect, useState } from 'react';
import { listNotifications } from '@/services/notificationService';

interface Notification {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function useNotifications(user_id: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user_id) return;
    setLoading(true);
    listNotifications(user_id)
      .then(setNotifications)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user_id]);

  return { notifications, loading, error };
}
