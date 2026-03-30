import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.buymeacoffee.com",
        pathname: "/assets/img/**",
      },
    ],
  },
};

export default nextConfig;
