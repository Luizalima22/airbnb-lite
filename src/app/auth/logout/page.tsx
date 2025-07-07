'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.signOut().then(() => {
      router.push('/auth/login');
    });
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span className="text-lg">Saindo...</span>
    </div>
  );
}
