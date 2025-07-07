// src/components/LocationSearchInput.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { useLocationSearch, LocationResult } from '@/hooks/useLocationSearch';

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string, location?: LocationResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function LocationSearchInput({
  value,
  onChange,
  placeholder = "Para onde você está indo?",
  className = "",
  disabled = false
}: LocationSearchInputProps) {
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { results, loading, error, searchLocations, clearResults } = useLocationSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length >= 3) {
      searchLocations(newValue);
      setShowResults(true);
    } else {
      clearResults();
      setShowResults(false);
    }
    setSelectedIndex(-1);
  };

  const handleLocationSelect = (location: LocationResult) => {
    onChange(location.formatted, location);
    setShowResults(false);
    setSelectedIndex(-1);
    clearResults();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleLocationSelect(results[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full text-sm text-gray-900 bg-transparent border-none outline-none ${className}`}
          disabled={disabled}
          autoComplete="off"
        />
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-600"></div>
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto mt-1"
        >
          {error && (
            <div className="p-3 text-sm text-red-600 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {results.length === 0 && !loading && !error && value.length >= 3 && (
            <div className="p-4 text-sm text-gray-500 text-center">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Nenhum local encontrado</span>
                <span className="text-xs text-gray-400">Tente buscar por uma cidade, estado ou país</span>
              </div>
            </div>
          )}

          {results.map((location, index) => (
            <button
              key={location.id}
              onClick={() => handleLocationSelect(location)}
              className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-rose-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {location.name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {location.state && `${location.state}, `}{location.country}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Footer with attribution */}
          {results.length > 0 && (
            <div className="p-2 text-xs text-gray-400 text-center border-t border-gray-100 bg-gray-50">
              Dados fornecidos por OpenStreetMap
            </div>
          )}
        </div>
      )}
    </div>
  );
}
