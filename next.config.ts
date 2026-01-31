import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // External images use unoptimized to avoid Vercel Image Transformations consumption.
    // TMDB, avatars, etc. are served directly from origin - no optimization needed.
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
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
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
