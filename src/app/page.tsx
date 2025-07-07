"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useProperties } from '@/features/properties/useProperties';
import LocationSearchInput from '@/components/LocationSearchInput';
import LocationValidationIndicator from '@/components/LocationValidationIndicator';
import { LocationResult } from '@/hooks/useLocationSearch';

export default function Home() {
  const { properties, loading, error } = useProperties();
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');

  const handleLocationChange = (value: string, location?: LocationResult) => {
    setSearchLocation(value);
    setSelectedLocation(location || null);
  };

  const handleSearch = () => {
    if (!searchLocation.trim()) {
      alert('Por favor, informe um destino para buscar.');
      return;
    }

    if (searchLocation.length >= 3 && !selectedLocation) {
      alert('Por favor, selecione um local válido da lista de sugestões para garantir resultados precisos.');
      return;
    }

    if (selectedLocation) {
      // Aqui você pode implementar a lógica de busca real
      console.log('Buscando por:', {
        location: selectedLocation,
        checkIn,
        checkOut,
        guests
      });
      // Redirecionar para página de resultados ou filtrar propriedades
      // Por exemplo: router.push(`/properties?location=${encodeURIComponent(selectedLocation.name)}&checkin=${checkIn}&checkout=${checkOut}&guests=${guests}`);
      alert(`Buscando acomodações em ${selectedLocation.name}, ${selectedLocation.country}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div className="text-xl font-medium mb-2">Algo deu errado</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-rose-50 to-pink-100 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Encontre seu próximo destino
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubra lugares únicos para se hospedar com anfitriões locais em mais de 190 países
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-full shadow-lg border border-gray-200 p-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="flex flex-col px-6 py-4 border-r border-gray-200 md:border-r-0 md:border-b-0">
                <label className="text-xs font-medium text-gray-700 mb-1">Onde</label>
                <LocationSearchInput
                  value={searchLocation}
                  onChange={handleLocationChange}
                  placeholder="Buscar destinos"
                  className="text-sm placeholder-gray-500"
                />
              </div>
              
              <div className="flex flex-col px-6 py-4 border-r border-gray-200 md:border-r-0">
                <label className="text-xs font-medium text-gray-700 mb-1">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="text-sm text-gray-900 bg-transparent border-none outline-none"
                />
              </div>
              
              <div className="flex flex-col px-6 py-4 border-r border-gray-200 md:border-r-0">
                <label className="text-xs font-medium text-gray-700 mb-1">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="text-sm text-gray-900 bg-transparent border-none outline-none"
                />
              </div>
              
              <div className="flex items-center px-6 py-4">
                <div className="flex flex-col flex-1">
                  <label className="text-xs font-medium text-gray-700 mb-1">Hóspedes</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="text-sm text-gray-900 bg-transparent border-none outline-none"
                  >
                    <option value="1">1 hóspede</option>
                    <option value="2">2 hóspedes</option>
                    <option value="3">3 hóspedes</option>
                    <option value="4">4 hóspedes</option>
                    <option value="5+">5+ hóspedes</option>
                  </select>
                </div>
                <button 
                  onClick={handleSearch}
                  className="bg-rose-600 hover:bg-rose-700 text-white p-4 rounded-full transition-colors ml-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Location validation indicator */}
            {searchLocation && (
              <div className="px-6 pb-3">
                <LocationValidationIndicator
                  searchText={searchLocation}
                  selectedLocation={selectedLocation}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Destinations Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Acomodações em destaque</h2>
          <p className="text-gray-600 text-lg">Lugares únicos para se hospedar selecionados pelos nossos anfitriões</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <Link 
              key={property.id} 
              href={`/host/${property.id}`} 
              className="group block"
            >
              <div className="relative overflow-hidden rounded-xl">
                <Image 
                  src={property.image_url || '/placeholder-image.svg'} 
                  alt={property.title} 
                  width={320}
                  height={256}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <button className="absolute top-3 right-3 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all">
                  <svg className="w-5 h-5 text-gray-600 hover:text-rose-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-rose-600 transition-colors">
                    {property.location}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-gray-600">4.9</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-2 truncate">{property.title}</p>
                <p className="text-gray-600 text-sm mb-2">5-10 de dez</p>
                
                <div className="flex items-baseline space-x-1">
                  <span className="text-gray-900 font-semibold">
                    R$ {property.price_per_night}
                  </span>
                  <span className="text-gray-600 text-sm">/ noite</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {properties.length === 0 && (
          <div className="text-center py-20">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum imóvel disponível</h3>
            <p className="text-gray-600">Volte mais tarde para ver novas acomodações incríveis</p>
          </div>
        )}
      </div>

      {/* Host Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Torne-se um anfitrião
              </h2>
              <p className="text-xl text-rose-100 mb-8">
                Ganhe dinheiro extra hospedando pessoas do mundo todo na sua propriedade
              </p>
              <Link
                href="/auth/signup?role=user_host"
                className="inline-block bg-white text-rose-600 hover:bg-rose-50 font-medium px-8 py-3 rounded-lg transition-colors"
              >
                Comece a hospedar
              </Link>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder-image.svg"
                  alt="Torne-se um anfitrião"
                  width={640}
                  height={256}
                  className="w-full h-64 object-cover rounded-lg opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
