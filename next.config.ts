import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    eslint: {
        // ESLint runs separately in CI; don't block the Vercel build on it
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Type errors are caught in dev; keep builds fast on Vercel
        ignoreBuildErrors: false,
    },
};

export default nextConfig;
