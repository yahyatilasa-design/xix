/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'tkztavbgtqfusfghoxay.supabase.co', // Ganti dengan domain Supabase project Anda
      },
      {
        protocol: 'https',
        hostname: '**', // Untuk avatar user dari provider auth (Google/Github dll)
      }
    ],
  },
}

module.exports = nextConfig