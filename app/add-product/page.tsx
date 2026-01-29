'use client';

import React from 'react';
import AddProductForm from '../../components/AddProductForm';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <AddProductForm 
        onCancel={() => router.push('/')} 
        onSuccess={() => router.push('/')}
      />
    </div>
  );
}