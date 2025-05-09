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
        has: [
          {
            type: 'header',
            key: 'origin',
            value: '(.*)',
          },
        ],
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/api/v0/sdk/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },
  images: {
    domains: ['*'],
    unoptimized: true
  },
};

export default nextConfig;
