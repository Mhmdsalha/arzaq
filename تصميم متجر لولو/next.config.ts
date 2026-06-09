import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    qualities: [75, 100],
  },
  webpack(config) {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
