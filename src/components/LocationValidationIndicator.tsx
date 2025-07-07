// src/components/LocationValidationIndicator.tsx
'use client';
import { LocationResult } from '@/hooks/useLocationSearch';

interface LocationValidationIndicatorProps {
  searchText: string;
  selectedLocation: LocationResult | null;
  className?: string;
}

export default function LocationValidationIndicator({
  searchText,
  selectedLocation,
  className = ""
}: LocationValidationIndicatorProps) {
  if (!searchText || searchText.length < 3) {
    return null;
  }

  if (selectedLocation) {
    return (
      <div className={`flex items-center space-x-2 text-green-600 ${className}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm">
          Local válido: {selectedLocation.name}, {selectedLocation.country}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 text-amber-600 ${className}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-sm">
        Selecione um local válido da lista de sugestões
      </span>
    </div>
  );
}
