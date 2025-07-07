'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RecoverPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError('Erro ao enviar email de recuperação: ' + error.message);
      } else {
        setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setEmail('');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleRecover} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4 border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Recuperar Senha</h2>
        <p className="text-gray-600 text-sm mb-4">
          Digite seu email para receber um link de recuperação de senha.
        </p>
        
        <input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input input-bordered w-full bg-gray-50 border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-yellow-500"
          required
        />
        
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}
        
        <button 
          type="submit" 
          disabled={loading}
          className="btn w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
        </button>
        
        <div className="text-center mt-4">
          <a 
            href="/auth/login" 
            className="text-yellow-600 hover:text-yellow-800 text-sm underline"
          >
            ← Voltar para o login
          </a>
        </div>
      </form>
    </div>
  );
}
