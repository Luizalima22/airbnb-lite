'use client';
import { useEffect, useState } from 'react';
import { getCurrentUserProfile, UserProfile } from '@/services/authService';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function UserStatus() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Primeiro verifica se há sessão autenticada
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          return;
        }
        
        const user = session.user;
        setAuthUser(user);
        
        // Verifica se há perfil na tabela
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          // Se não encontrou perfil, tenta criar um via getCurrentUserProfile
        } else if (existingProfile) {
          setProfile(existingProfile);
          return;
        }
        
        // Tenta usar o serviço para obter/criar perfil
        const userProfile = await getCurrentUserProfile();
        
        if (userProfile) {
          setProfile(userProfile);
        }
        
      } catch (error) {
        console.error('Error loading profile:', error);
        // Falha silenciosa na obtenção do perfil
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) return <div className="text-center py-4">Verificando status...</div>;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold mb-2">Status do Usuário</h3>
      {profile ? (
        <div className="text-sm space-y-1">
          <p><strong>Logado como:</strong> {profile.name} ({profile.email})</p>
          <p><strong>Tipo:</strong> {profile.role === 'user_host' ? 'Anfitrião' : 'Cliente'}</p>
          <p><strong>ID:</strong> {profile.id}</p>
        </div>
      ) : authUser ? (
        <div className="text-sm space-y-1">
          <p className="text-orange-600">Usuário autenticado mas sem perfil na tabela</p>
          <p><strong>ID do Auth:</strong> {authUser.id}</p>
          <p><strong>Email:</strong> {authUser.email}</p>
        </div>
      ) : (
        <p className="text-sm">Não logado</p>
      )}
    </div>
  );
}
