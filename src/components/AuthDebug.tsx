"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUserProfile, UserProfile } from '@/services/authService';
import type { Session } from '@supabase/supabase-js';

interface AuthDebugProps {
  show?: boolean;
}

export default function AuthDebug({ show = false }: AuthDebugProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    const updateAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session) {
          const userProfile = await getCurrentUserProfile();
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('AuthDebug error:', error);
      } finally {
        setLoading(false);
      }
    };

    updateAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      updateAuth();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Mostrar apenas se explicitamente habilitado ou se há problemas
  if (!isVisible && session && profile) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white text-xs p-3 rounded-lg max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">Auth Debug</span>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-white hover:text-gray-300"
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>
      
      {isVisible && (
        <div className="space-y-2">
          <div>
            <strong>Status:</strong> {loading ? 'Carregando...' : session ? 'Logado' : 'Não logado'}
          </div>
          
          {session && (
            <div>
              <strong>User ID:</strong> {session.user.id.substring(0, 8)}...
            </div>
          )}
          
          {profile && (
            <div>
              <strong>Role:</strong> {profile.role}
            </div>
          )}
          
          {profile && (
            <div>
              <strong>Name:</strong> {profile.name}
            </div>
          )}
          
          <div>
            <strong>Timestamp:</strong> {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
