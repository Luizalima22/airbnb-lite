'use client';
import { useEffect, useState } from 'react';
import { supabase, ensureSession } from '@/lib/supabaseClient';

interface SessionProviderProps {
  children: React.ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Verifica se existe uma sessão
      await ensureSession();
      setSessionChecked(true);
    };

    checkSession();

    // Listener para mudanças na sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        // Auth state changed silently
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
