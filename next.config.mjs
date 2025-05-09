/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
        {
          source: '/api/:path*',
          destination: 'https://marketplace-backend-kfof.onrender.com/api/:path*',
          permanent: true
        }
      ]
  },
  async rewrites() {
    return [
      {
        source: '/api/v0/sdk/:path*',
        destination: 'https://app.dynamicauth.com/api/v0/sdk/:path*',
      },
    ]
  },
  images: {
    domains: ['*'],
    unoptimized: true
  },
};

export default nextConfig;
