"use client";
import { useEffect, useState, useRef } from 'react';
import { getCurrentUserProfile, UserProfile } from '@/services/authService';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoleMenu() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Função para atualizar o perfil
    const updateProfile = async () => {
      setLoading(true);
      
      try {
        const userProfile = await getCurrentUserProfile();
        setProfile(userProfile);
      } catch (error) {
        console.error('RoleMenu: Erro ao buscar perfil:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    
    updateProfile();
    
    // Listener para mudanças de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      updateProfile();
    });
    
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);
  
  const handleNavigation = (path: string) => {
    setShowUserMenu(false);
    router.push(path);
  };
  
  const role = profile?.role;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-rose-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span className="font-bold text-xl text-rose-600 hidden sm:block">airbnb</span>
            </Link>
          </div>

          {/* Navigation Pills - Center */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
            >
              Acomodações
            </Link>
            <Link 
              href="#" 
              className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
            >
              Experiências
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : profile === null ? (
              <>
                {/* Host your home link */}
                <Link 
                  href="/auth/signup?role=user_host" 
                  className="hidden sm:block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-full text-sm font-medium transition-colors hover:bg-gray-50"
                >
                  Anuncie seu espaço no Airbnb
                </Link>
                
                {/* Language selector */}
                <button className="p-3 hover:bg-gray-50 rounded-full transition-colors">
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 border border-gray-300 rounded-full py-2 px-3 hover:shadow-md transition-all"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <div className="w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <Link href="/auth/signup" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                        Cadastre-se
                      </Link>
                      <Link href="/auth/login" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        Entrar
                      </Link>
                      <hr className="my-2" />
                      <Link href="/auth/signup?role=user_host" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        Anuncie seu espaço no Airbnb
                      </Link>
                      <Link href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        Centro de Ajuda
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Host link */}
                {role === 'user_host' && (
                  <Link 
                    href="/property/new" 
                    className="hidden sm:block text-gray-700 hover:text-gray-900 px-3 py-2 rounded-full text-sm font-medium transition-colors hover:bg-gray-50"
                  >
                    Anuncie seu espaço
                  </Link>
                )}
                
                {/* Language selector */}
                <button className="p-3 hover:bg-gray-50 rounded-full transition-colors">
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </button>

                {/* User menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 border border-gray-300 rounded-full py-2 px-3 hover:shadow-md transition-all"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <div className="w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                        <p className="text-xs text-gray-500">{profile.email}</p>
                      </div>
                      
                      {role === 'user_host' && (
                        <>
                          <button 
                            onClick={() => handleNavigation('/dashboard')}
                            className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Dashboard
                          </button>
                          <button 
                            onClick={() => handleNavigation('/property/new')}
                            className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Cadastrar Imóvel
                          </button>
                        </>
                      )}
                      
                      {role === 'user_client' && (
                        <button 
                          onClick={() => handleNavigation('/bookings')}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Minhas Reservas
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleNavigation('/profile')}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Perfil
                      </button>
                      <button 
                        onClick={() => handleNavigation('/notifications')}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Notificações
                      </button>
                      
                      <hr className="my-2" />
                      
                      {role === 'user_client' && (
                        <Link href="/auth/signup?role=user_host" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                          Anuncie seu espaço no Airbnb
                        </Link>
                      )}
                      <Link href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        Centro de Ajuda
                      </Link>
                      
                      <hr className="my-2" />
                      
                      <Link href="/auth/logout" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        Sair
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
