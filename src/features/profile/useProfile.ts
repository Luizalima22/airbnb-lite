// src/features/profile/useProfile.ts
"use client";
import { useEffect, useState, useCallback } from 'react';
import { getProfile } from '@/services/profileService';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'user_host' | 'user_client';
  avatar_url: string;
  created_at: string;
}

export function useProfile(id: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getProfile(id);
      setProfile(data);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return { profile, loading, error, refreshProfile };
}
