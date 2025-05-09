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
  images: {
    domains: ['*'],
    unoptimized: true
  },
};

export default nextConfig;
