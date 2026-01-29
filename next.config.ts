import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Optimize for Vercel
  output: 'standalone',
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
};

export default nextConfig;
