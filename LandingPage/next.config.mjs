/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress hydration errors in development
  reactStrictMode: false,
  // Enable standalone output for Docker
  output: 'standalone',
  // Disable React's built-in hydration warnings
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Enable static image imports
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
};

export default nextConfig;
