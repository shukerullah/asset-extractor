import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
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
