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
        source: '/dynamic-auth/:path*',
        destination: 'https://app.dynamicauth.com/api/v0/:path*',
        has: [
          {
            type: 'header',
            key: 'content-type',
          },
        ],
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/dynamic-auth/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Origin' },
          { key: 'Content-Type', value: 'application/json' },
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
