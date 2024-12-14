import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud']
  },
  env: {
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000'
  }
};

export default nextConfig;
