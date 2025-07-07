'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { createBooking } from '@/services/bookingService';
import ImageGallery from '@/components/ImageGallery';
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

export default function HostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState('1');
  const [total, setTotal] = useState(0);
  const [nights, setNights] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      setUserId(user?.id || null);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setUserRole(profile?.role || null);
      }
    };
    
    checkAuth();
  }, []);

  // Buscar dados do imóvel
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      setLoading(true);
      
      // Buscar propriedade
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) {
        setError('Erro ao carregar propriedade');
        setLoading(false);
        return;
      }

      setProperty(propertyData);

      // Buscar imagens da propriedade
      const { data: imagesData } = await supabase
        .from('property_images')
        .select('image_url')
        .eq('property_id', id)
        .order('created_at', { ascending: true });

      const images = imagesData?.map(img => img.image_url) || [];
      if (propertyData.image_url && !images.includes(propertyData.image_url)) {
        images.unshift(propertyData.image_url);
      }
      
      setPropertyImages(images);
      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  // Calcular total
  useEffect(() => {
    if (!property || !startDate || !endDate) {
      setTotal(0);
      setNights(0);
      return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nightsCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nightsCount > 0) {
      setNights(nightsCount);
      const subtotal = nightsCount * Number(property.price_per_night);
      const cleaningFee = subtotal * 0.1; // 10% taxa de limpeza
      const serviceFee = subtotal * 0.05; // 5% taxa de serviço
      setTotal(subtotal + cleaningFee + serviceFee);
    } else {
      setNights(0);
      setTotal(0);
    }
  }, [property, startDate, endDate]);

  // Manipular reserva
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!userId) {
      setError('Você precisa estar logado para fazer uma reserva.');
      return;
    }

    if (!property) {
      setError('Dados da propriedade não encontrados.');
      return;
    }

    if (userRole !== 'user_client') {
      setError('Apenas clientes podem fazer reservas.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Selecione as datas de check-in e check-out.');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('A data de check-out deve ser posterior à data de check-in.');
      return;
    }

    if (new Date(startDate) < new Date()) {
      setError('A data de check-in deve ser futura.');
      return;
    }

    try {
      await createBooking({
        property_id: property.id,
        client_id: userId,
        start_date: startDate,
        end_date: endDate,
        total_price: total,
      });
      
      setSuccess('Solicitação de reserva enviada com sucesso! Aguarde a aprovação do anfitrião.');
      setStartDate('');
      setEndDate('');
      setGuests('1');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao enviar solicitação de reserva. Tente novamente.');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-80 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="flex-shrink-0 w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Propriedade não encontrada</h2>
          <p className="text-gray-600 mb-8">A propriedade que você está procurando não existe ou foi removida.</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm sm:text-base">{property.location}</span>
        </div>
      </div>

      {/* Galeria de Imagens */}
      <div className="mb-8">
        {propertyImages.length > 0 ? (
          <ImageGallery images={propertyImages} title={property.title} />
        ) : (
          <div className="relative">
            <Image
              src={property.image_url || '/placeholder-image.svg'}
              alt={property.title}
              width={1200}
              height={600}
              className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informações do Imóvel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sobre este espaço</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </div>

          {/* Informações do Anfitrião */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da estadia</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                </svg>
                <span className="text-sm text-gray-600">Check-in: 15h</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 13h8M8 17h8" />
                </svg>
                <span className="text-sm text-gray-600">Check-out: 11h</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm text-gray-600">Hóspedes: até {guests}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600">
                  {property.available ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Reserva */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  R$ {Number(property.price_per_night).toFixed(2)}
                </span>
                <span className="text-gray-600 ml-1">/ noite</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm text-gray-600">4.9</span>
              </div>
            </div>

            {!property.available && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <svg className="flex-shrink-0 w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      Esta propriedade está temporariamente indisponível
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CHECK-IN
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    disabled={!property.available}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CHECK-OUT
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    required
                    disabled={!property.available}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HÓSPEDES
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    disabled={!property.available}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="1">1 hóspede</option>
                    <option value="2">2 hóspedes</option>
                    <option value="3">3 hóspedes</option>
                    <option value="4">4 hóspedes</option>
                    <option value="5">5 hóspedes</option>
                    <option value="6">6+ hóspedes</option>
                  </select>
                </div>
              </div>

              {/* Resumo de Preços */}
              {nights > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>R$ {Number(property.price_per_night).toFixed(2)} × {nights} noites</span>
                    <span>R$ {(nights * Number(property.price_per_night)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de limpeza</span>
                    <span>R$ {(nights * Number(property.price_per_night) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de serviço</span>
                    <span>R$ {(nights * Number(property.price_per_night) * 0.05).toFixed(2)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!property.available || !userId || userRole !== 'user_client'}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-4 rounded-md font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-rose-500 disabled:hover:to-pink-500"
              >
                {!userId ? 'Faça login para reservar' : 
                 userRole !== 'user_client' ? 'Apenas clientes podem reservar' :
                 !property.available ? 'Propriedade indisponível' :
                 'Solicitar reserva'}
              </button>

              {/* Mensagens de Sucesso e Erro */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="flex-shrink-0 w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="flex-shrink-0 w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {!userId && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Você precisa estar logado para fazer uma reserva
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/auth/login')}
                    className="text-rose-600 hover:text-rose-800 font-medium text-sm"
                  >
                    Fazer login
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
