import { supabase } from '@/lib/supabaseClient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user_host' | 'user_client';
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export async function syncUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // Busca a sessão autenticada
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return null;
    }

    const user = session.user;

    // Busca o perfil na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      return null;
    }

    // Se o perfil não existe na tabela, cria um novo
    if (!profile) {
      const newProfile = {
        id: userId,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
        email: user.email!,
        role: (user.user_metadata?.role as 'user_host' | 'user_client') || 'user_client',
        avatar_url: user.user_metadata?.avatar_url || '',
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (createError) {
        // Se o erro é de violação de chave única, tenta buscar o perfil existente
        if (createError.code === '23505') {
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (fetchError) {
            return null;
          }
          
          if (existingProfile) {
            return existingProfile;
          }
        }
        
        // Se falhou por questões de RLS, tenta usar a função RPC
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('create_profile_signup', {
              user_id: userId,
              user_email: user.email,
              user_name: newProfile.name,
              user_role: newProfile.role,
            });

          if (rpcError) {
            throw new Error(`Falha ao criar perfil: ${rpcError.message}`);
          } else if (rpcData && rpcData.length > 0) {
            return rpcData[0];
          }
        } catch (rpcError) {
          console.error('RPC Error:', rpcError);
          // Fallback para API route
          try {
            const response = await fetch('/api/profile/create', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: userId,
                email: user.email,
                role: newProfile.role,
                name: newProfile.name,
              }),
            });
            
            const result = await response.json();
            
            if (response.ok && result.profile) {
              return result.profile;
            }
          } catch (apiError) {
            console.error('API Error:', apiError);
            // Silently fail
          }
        }
        
        throw new Error(`Falha ao criar perfil: ${createError.message || 'Erro desconhecido'}`);
      }

      return createdProfile;
    }

    // Verifica se precisa sincronizar o role
    const metadataRole = user.user_metadata?.role;
    const profileRole = profile.role;

    if (metadataRole && metadataRole !== profileRole) {
      // Atualiza o perfil com o role do metadata
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ role: metadataRole })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        return profile;
      }

      return updatedProfile;
    }

    return profile;
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    return null;
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session?.user) {
      return null;
    }

    const profile = await syncUserProfile(session.user.id);
    return profile;
  } catch (error) {
    console.error('AuthService: Erro ao obter perfil:', error);
    return null;
  }
}

export async function updateUserRole(userId: string, newRole: 'user_host' | 'user_client'): Promise<boolean> {
  try {
    // Atualiza o user_metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { role: newRole }
    });

    if (authError) {
      return false;
    }

    // Atualiza a tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (profileError) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
}
