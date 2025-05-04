/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'projectK',
  },
  // Fix for the images.domains deprecation warning
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
    ],
  },
  // Allow middleware to access environment variables
  experimental: {
    serverComponentsExternalPackages: ['jose'],
  },
}

module.exports = nextConfig
