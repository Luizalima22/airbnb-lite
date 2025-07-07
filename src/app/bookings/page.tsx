'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface BookingWithProperty {
  id: string;
  client_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
  created_at: string;
  properties: {
    id: string;
    title: string;
    image_url: string;
    location: string;
    host_id: string;
    profiles: {
      name: string;
      email: string;
    };
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const id = data.session?.user?.id || null;
      if (id) {
        setLoading(true);
        const { data: bookingsData, error } = await supabase
          .from('bookings')
          .select(`
            *,
            properties(
              id,
              title,
              image_url,
              location,
              host_id,
              profiles!properties_host_id_fkey(name, email)
            )
          `)
          .eq('client_id', id)
          .order('created_at', { ascending: false });
        if (error) setError(error.message);
        else setBookings(bookingsData || []);
        setLoading(false);
      } else {
        router.push('/auth/login');
      }
    });
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Confirmada';
      case 'rejected':
        return 'Recusada';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando suas reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Erro ao carregar reservas</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Minhas Viagens</h1>
        <p className="text-gray-600 mt-2">
          Acompanhe suas reservas e planeje suas próximas aventuras
        </p>
      </div>

      {/* Reservas */}
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 3H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-gray-500 mb-6">
            Comece a explorar acomodações incríveis ao redor do mundo
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explorar destinos
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="md:flex">
                {/* Imagem */}
                <div className="md:w-1/3">
                  <div className="h-48 md:h-full relative">
                    <Image
                      src={booking.properties?.image_url || '/placeholder-image.svg'}
                      alt={booking.properties?.title || 'Propriedade'}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {booking.properties?.title}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {booking.properties?.location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  {/* Datas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Check-in</div>
                      <div className="font-semibold">{formatDate(booking.start_date)}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Check-out</div>
                      <div className="font-semibold">{formatDate(booking.end_date)}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Noites</div>
                      <div className="font-semibold">{calculateNights(booking.start_date, booking.end_date)}</div>
                    </div>
                  </div>

                  {/* Anfitrião */}
                  {booking.properties?.profiles && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600">Anfitrião</div>
                      <div className="font-medium">{booking.properties.profiles.name}</div>
                    </div>
                  )}

                  {/* Preço e Status */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600">Total pago</div>
                      <div className="text-xl font-bold text-rose-600">
                        R$ {booking.total_price.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/property/${booking.properties?.id}`)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Ver propriedade
                      </button>
                      
                      {booking.status === 'accepted' && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Contatar anfitrião
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mensagem de status */}
                  {booking.status === 'accepted' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-800 font-medium">Reserva confirmada!</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        Sua reserva foi aceita pelo anfitrião. Você pode entrar em contato para mais detalhes.
                      </p>
                    </div>
                  )}
                  
                  {booking.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-red-800 font-medium">Reserva recusada</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">
                        Infelizmente sua reserva foi recusada. Tente outras datas ou explore outras propriedades.
                      </p>
                    </div>
                  )}
                  
                  {booking.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-yellow-800 font-medium">Aguardando confirmação</span>
                      </div>
                      <p className="text-yellow-700 text-sm mt-1">
                        Sua solicitação foi enviada. O anfitrião irá analisar e responder em breve.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
