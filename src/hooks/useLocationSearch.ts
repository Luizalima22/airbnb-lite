import { useState, useCallback, useRef } from 'react';

export interface LocationResult {
  id: string;
  name: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  formatted: string;
}

interface NominatimResult {
  place_id?: number;
  osm_id?: number;
  name?: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
  display_name?: string;
}

export const useLocationSearch = () => {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchLocations = useCallback(async (query: string): Promise<LocationResult[]> => {
    if (query.length < 3) {
      return [];
    }

    try {
      // Usando a API do Nominatim (OpenStreetMap) - gratuita e sem necessidade de API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '5',
          countrycodes: 'br,us,ca,mx,ar,pe,co,ve,ec,uy,py,bo,cl,gf,sr,gy', // Principais países das Américas
          'accept-language': 'pt-BR,pt,en'
        })
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar locais');
      }

      const data = await response.json();
      
      return data.map((item: NominatimResult) => {
        // Extrai informações da localização
        const city = item.address?.city || item.address?.town || item.address?.village || item.name;
        const state = item.address?.state;
        const country = item.address?.country;
        
        // Cria um formato limpo da localização
        let cleanFormatted = city || '';
        if (state && state !== city) {
          cleanFormatted += cleanFormatted ? `, ${state}` : state;
        }
        if (country) {
          cleanFormatted += cleanFormatted ? `, ${country}` : country;
        }
        
        return {
          id: item.place_id?.toString() || item.osm_id?.toString() || Math.random().toString(),
          name: city,
          country: country || 'País não identificado',
          state: state,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          formatted: cleanFormatted || item.display_name || 'Local não identificado'
        };
      }).filter((location: LocationResult) => 
        location.name && 
        location.country && 
        !isNaN(location.latitude) && 
        !isNaN(location.longitude)
      );
    } catch (err) {
      console.error('Erro na busca de locais:', err);
      throw new Error('Erro ao buscar locais. Tente novamente.');
    }
  }, []);

  const debouncedSearch = useCallback((query: string) => {
    setError(null);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const locations = await searchLocations(query);
        setResults(locations);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro na busca');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce de 500ms
  }, [searchLocations]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setLoading(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    results,
    loading,
    error,
    searchLocations: debouncedSearch,
    clearResults
  };
};
