'use client';
import { useEffect, useState } from 'react';
import { useProfile } from '@/features/profile/useProfile';
import { useHostBookings } from '@/features/bookings/useHostBookings';
import { listProperties } from '@/services/propertyService';
import { deleteProperty } from '@/services/propertyService';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

interface Property {
  id: string;
  title: string;
  description: string;
  price_per_night: number;
  location: string;
  image_url: string;
  host_id: string;
  available: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { loading: loadingProfile } = useProfile(userId || '');
  const { bookings, loading: loadingBookings } = useHostBookings(userId || '');

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      setIsInitialized(true);
    };
    
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!userId || !isInitialized) return;
    
    setLoadingProps(true);
    listProperties()
      .then(props => setProperties(props.filter((p: Property) => p.host_id === userId)))
      .finally(() => setLoadingProps(false));
  }, [userId, isInitialized]);

  // Só mostra loading se ainda não inicializou ou se está carregando dados essenciais
  if (!isInitialized || (isInitialized && (loadingProfile || loadingBookings || loadingProps))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário após inicialização, redireciona
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar o dashboard.</p>
          <Link href="/auth/login" className="text-rose-600 hover:text-rose-700 font-medium">
            Fazer login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard do Anfitrião</h1>
        <p className="text-gray-600">Gerencie seus imóveis e reservas</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total de Imóveis</dt>
                <dd className="text-lg font-medium text-gray-900">{properties.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Reservas Ativas</dt>
                <dd className="text-lg font-medium text-gray-900">{bookings.filter(b => b.status === 'accepted').length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Faturamento</dt>
                <dd className="text-lg font-medium text-gray-900">
                  R$ {bookings.filter(b => b.status === 'accepted').reduce((acc, b) => acc + Number(b.total_price), 0).toFixed(2)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Imóveis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Seus Imóveis</h2>
            <Link
              href="/property/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Imóvel
            </Link>
          </div>
        </div>
        <div className="px-6 py-4">
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum imóvel cadastrado</h3>
              <p className="mt-1 text-sm text-gray-500">Comece cadastrando seu primeiro imóvel.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Image 
                      src={property.image_url || '/placeholder-image.svg'} 
                      alt={property.title} 
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{property.title}</h3>
                      <p className="text-sm text-gray-500">{property.location}</p>
                      <p className="text-sm font-medium text-gray-900">R$ {property.price_per_night}/noite</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      property.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {property.available ? 'Disponível' : 'Indisponível'}
                    </span>
                    <a
                      href={`/property/edit/${property.id}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </a>
                    <button
                      onClick={async () => {
                        if (confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
                          try {
                            await deleteProperty(property.id);
                            setProperties((prev) => prev.filter((prop) => prop.id !== property.id));
                          } catch (error) {
                            console.error('Error deleting property:', error);
                            alert('Erro ao excluir imóvel. Tente novamente.');
                          }
                        }
                      }}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir
                    </button>
                    <button
                      onClick={async () => {
                        await fetch('/api/property/toggle', {
                          method: 'POST',
                          body: JSON.stringify({ id: property.id, available: !property.available }),
                          headers: { 'Content-Type': 'application/json' },
                        });
                        setProperties((prev) => prev.map((prop) => prop.id === property.id ? { ...prop, available: !prop.available } : prop));
                      }}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                        property.available 
                          ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                          : 'text-green-700 bg-green-100 hover:bg-green-200'
                      }`}
                    >
                      {property.available ? 'Indisponibilizar' : 'Disponibilizar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Seção de Reservas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Solicitações de Reserva</h2>
        </div>
        <div className="px-6 py-4">
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma reserva</h3>
              <p className="mt-1 text-sm text-gray-500">Quando recebermos reservas, elas aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Reserva #{booking.id.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-500">Cliente: {booking.client_id}</p>
                      <p className="text-sm text-gray-500">Valor: R$ {booking.total_price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status === 'pending' ? 'Pendente' :
                         booking.status === 'accepted' ? 'Aceita' : 'Recusada'}
                      </span>
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={async () => {
                              try {
                                // Atualiza o status da reserva
                                const statusResponse = await fetch('/api/booking/status', {
                                  method: 'POST',
                                  body: JSON.stringify({ id: booking.id, status: 'accepted' }),
                                  headers: { 'Content-Type': 'application/json' },
                                });

                                if (!statusResponse.ok) {
                                  const errorData = await statusResponse.json();
                                  throw new Error(errorData.error || 'Erro ao aceitar reserva');
                                }

                                // Envia notificação para o cliente
                                await fetch('/api/notification/send', {
                                  method: 'POST',
                                  body: JSON.stringify({ 
                                    user_id: booking.client_id, 
                                    message: 'Sua reserva foi aceita!' 
                                  }),
                                  headers: { 'Content-Type': 'application/json' },
                                });

                                // Atualiza o estado local
                                bookings.map(b => 
                                  b.id === booking.id ? { ...b, status: 'accepted' } : b
                                );
                                
                                // Força re-render ou recarrega a página
                                window.location.reload();
                                
                              } catch (error) {
                                console.error('Erro ao aceitar reserva:', error);
                                alert('Erro ao aceitar reserva. Tente novamente.');
                              }
                            }}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            Aceitar
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                // Atualiza o status da reserva
                                const statusResponse = await fetch('/api/booking/status', {
                                  method: 'POST',
                                  body: JSON.stringify({ id: booking.id, status: 'rejected' }),
                                  headers: { 'Content-Type': 'application/json' },
                                });

                                if (!statusResponse.ok) {
                                  const errorData = await statusResponse.json();
                                  throw new Error(errorData.error || 'Erro ao recusar reserva');
                                }

                                // Envia notificação para o cliente
                                await fetch('/api/notification/send', {
                                  method: 'POST',
                                  body: JSON.stringify({ 
                                    user_id: booking.client_id, 
                                    message: 'Sua reserva foi recusada.' 
                                  }),
                                  headers: { 'Content-Type': 'application/json' },
                                });

                                // Força re-render ou recarrega a página
                                window.location.reload();
                                
                              } catch (error) {
                                console.error('Erro ao recusar reserva:', error);
                                alert('Erro ao recusar reserva. Tente novamente.');
                              }
                            }}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            Recusar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
