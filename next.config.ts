import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove standalone for Vercel deployment (Vercel handles this)
  // output: 'standalone', // Only needed for Docker/self-hosting
  
  // Configure external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.buymeacoffee.com',
        pathname: '/assets/img/**',
      }
    ]
  },
  
  // Optimize for production
  experimental: {
    optimizePackageImports: ['@/utils/rate-limiter', '@/utils/error-monitor']
  },
  
  // Security and performance headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
