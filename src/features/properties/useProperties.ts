// src/features/properties/useProperties.ts
"use client";

import { useEffect, useState } from 'react';
import { listProperties } from '@/services/propertyService';

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

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listProperties()
      .then(setProperties)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { properties, loading, error };
}
