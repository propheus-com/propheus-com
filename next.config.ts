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
    // Ensure report source HTML files are bundled for serverless route handlers on Vercel.
    outputFileTracingIncludes: {
        '/report/nike-nyc-q7m4x9k2': ['./docs/reports/nike_nyc_report.html'],
        '/report/cfa-nyc-r8t3v1p6': ['./docs/reports/cfa_nyc_retailIntelligence_report.html'],
    },
};

export default nextConfig;
