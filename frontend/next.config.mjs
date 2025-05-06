/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable production optimizations
  reactStrictMode: true,
  swcMinify: true,
  serverExternalPackages: ['mongoose'],
  // For containerized deployments with Docker
  output: 'standalone',
  
  // Optimize images
  images: {
    domains: ['localhost', 'your-production-domain.com'],
    minimumCacheTTL: 60,
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Disable type checking during build
  typescript: {
    ignoreBuildErrors: true
  },
  // Add CORS headers to API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  
  // Configure environment variables that should be available to the browser
  // These will be prefixed with NEXT_PUBLIC_
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  
  // Add rewrites to handle API requests or other custom routes
  async rewrites() {
    return [
      // Example for API proxy if needed
      // {
      //   source: '/api/:path*',
      //   destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      // },
    ];
  },
  
  // Enable webpack 5 and optimize the build
  webpack(config) {
    return config;
  },
};

export default nextConfig;
