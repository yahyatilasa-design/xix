import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'XIX Marketplace',
  description: 'Premium digital marketplace and PPOB platform powered by AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Menggunakan Google Fonts via CDN untuk kemudahan migrasi. Bisa diganti next/font */}
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Tailwind CDN dihapus, gunakan postcss/tailwind lokal di globals.css */}
      </head>
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}