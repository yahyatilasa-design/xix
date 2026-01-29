'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ServiceView from '../../../components/ServiceView';
import { SERVICES } from '../../../constants';
import { fetchExchangeRates } from '../../../services/currencyService';
import { CurrencyCode } from '../../../types';

export default function ServicePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [rates, setRates] = useState<Partial<Record<CurrencyCode, number>>>({ IDR: 1 });
  
  // Find service config based on URL slug
  const service = SERVICES.find(s => s.nameKey === params.slug);

  useEffect(() => {
    fetchExchangeRates().then(setRates).catch(console.error);
  }, []);

  if (!service) {
      return (
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
              Service Not Found
          </div>
      );
  }

  return (
      <div className="min-h-screen bg-zinc-950">
          <ServiceView 
              service={service} 
              onBack={() => router.push('/')}
              currency="IDR" // Defaulting to IDR for simpler service view logic or context can be added
              rates={rates}
          />
      </div>
  );
}