'use client';
import { useEffect, useState } from 'react';
import { getCurrentUserProfile, updateUserRole, UserProfile } from '@/services/authService';
import { updateProfile } from '@/services/profileService';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState<'user_host' | 'user_client'>('user_client');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userProfile = await getCurrentUserProfile();
        
        if (userProfile) {
          setProfile(userProfile);
          setName(userProfile.name || '');
          setAvatar(userProfile.avatar_url || '');
          setRole(userProfile.role || 'user_client');
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!profile) {
      setError('Perfil não encontrado. Faça login novamente.');
      return;
    }
    
    try {
      // Atualiza o perfil na tabela profiles
      await updateProfile(profile.id, { name, avatar_url: avatar, role });
      
      // Atualiza o role usando o serviço de sincronização
      const roleUpdated = await updateUserRole(profile.id, role);
      
      if (!roleUpdated) {
        throw new Error('Falha ao atualizar role');
      }
      
      setSuccess('Perfil atualizado! Recarregue a página para ver as alterações.');
      
      // Força atualização do menu após um pequeno delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-medium text-gray-900 mb-2">Perfil não encontrado</div>
          <p className="text-gray-600">Faça login novamente para acessar seu perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Informações pessoais</h1>
        <p className="text-gray-600 mt-2">Atualize suas informações e descubra como elas são usadas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Foto do perfil"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-32 h-32 bg-rose-500 rounded-full flex items-center justify-center border-4 border-gray-100">
                    <span className="text-white text-4xl font-medium">
                      {name ? name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">{name || 'Usuário'}</h2>
              <p className="text-gray-600">{profile.email}</p>
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  role === 'user_host' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'bg-green-50 text-green-700'
                }`}>
                  {role === 'user_host' ? '🏠 Anfitrião' : '🧳 Hóspede'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome legal
                </label>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Certifique-se de que corresponde ao nome nos seus documentos de identificação.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL da foto de perfil
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cole a URL de uma imagem para usar como foto de perfil.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Como você usa o Airbnb?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="user_client"
                      checked={role === 'user_client'}
                      onChange={e => setRole(e.target.value as 'user_host' | 'user_client')}
                      className="mt-1 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Sou hóspede</div>
                      <div className="text-sm text-gray-600">Quero alugar imóveis para minhas viagens</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="user_host"
                      checked={role === 'user_host'}
                      onChange={e => setRole(e.target.value as 'user_host' | 'user_client')}
                      className="mt-1 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Sou anfitrião</div>
                      <div className="text-sm text-gray-600">Quero cadastrar e alugar meus imóveis</div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="text-sm text-gray-900">{profile.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Usamos seu endereço de email para enviar confirmações de reserva e atualizações importantes.
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">{success}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Salvar perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
