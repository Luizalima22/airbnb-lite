'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Função para verificar se o email está registrado
  const checkEmailRegistered = async (email: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();
      
      return !!profile;
    } catch {
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Verifica se o email está registrado para dar mensagem mais específica
      const emailExists = await checkEmailRegistered(email);
      // setIsEmailRegistered(emailExists);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setError('E-mail não confirmado. Por favor, acesse seu e-mail e confirme sua conta antes de fazer login.');
      } else if (error.message.toLowerCase().includes('invalid login credentials') || 
                 error.message.toLowerCase().includes('invalid credentials')) {
        if (emailExists) {
          setError('Senha incorreta. Verifique sua senha ou use a opção "Recuperar senha".');
        } else {
          setError('Email não encontrado em nosso sistema. Crie uma conta primeiro.');
        }
      } else if (error.message.toLowerCase().includes('user not found')) {
        setError('Usuário não encontrado. Verifique seu email ou crie uma conta se ainda não tem cadastro.');
      } else if (error.message.toLowerCase().includes('wrong password')) {
        setError('Senha incorreta. Verifique sua senha ou use a opção "Recuperar senha".');
      } else if (error.message.toLowerCase().includes('email')) {
        setError('Email não encontrado. Verifique se o email está correto ou crie uma conta.');
      } else {
        setError(`Erro no login: ${error.message}`);
      }
      setLoading(false);
      return;
    }
    
    if (data && data.user) {
      // Aguarda um pouco para garantir que a sessão seja configurada
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se a sessão foi criada corretamente
      await supabase.auth.getSession();
      
      // Busca perfil na tabela profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (!profile) {
        // Cria o perfil se não existir
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || '',
          role: data.user.user_metadata?.role || 'user_client',
        });
      }
      
      router.push('/');
    }
    setLoading(false);
  };

  // Função para reenviar e-mail de confirmação
  const handleResendConfirmation = async () => {
    setError(null);
    setInfo(null);
    if (!email) {
      setError('Informe o e-mail para reenviar a confirmação.');
      return;
    }
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      setError('Erro ao reenviar confirmação: ' + error.message);
    } else {
      setInfo('E-mail de confirmação reenviado! Verifique sua caixa de entrada.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <svg className="w-12 h-12 text-rose-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Bem-vindo ao Airbnb
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Entre na sua conta para continuar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Endereço de email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="text-rose-600 hover:text-rose-700 font-medium"
                >
                  Reenviar confirmação
                </button>
              </div>

              <div className="text-sm">
                <a
                  href="/auth/recover"
                  className="text-rose-600 hover:text-rose-700 font-medium"
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                    {(error.includes('Email não encontrado em nosso sistema') || 
                      error.includes('Usuário não encontrado') || 
                      error.includes('Email não encontrado')) && (
                      <div className="mt-2">
                        <a 
                          href="/auth/signup" 
                          className="text-sm text-red-600 hover:text-red-500 underline font-medium"
                        >
                          Criar uma conta nova
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {info && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      {info}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou</span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-center text-sm text-gray-600">
                Não tem uma conta?{' '}
                <a href="/auth/signup" className="font-medium text-rose-600 hover:text-rose-700">
                  Cadastre-se
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
