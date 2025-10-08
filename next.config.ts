import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'igtvuceodcowgzacwmex.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/avatars/**',
      }
    ],
  }
};

export default nextConfig;
