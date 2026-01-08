import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api_proxy/:path*',
                // destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
                destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
            },
        ];
    },
};

export default nextConfig;
