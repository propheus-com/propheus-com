import type { Metadata } from 'next';
import { Inter, Playfair_Display, Syne } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import F1EasterEgg from '@/components/F1EasterEgg';
import AnalyticsProvider from '@/components/AnalyticsProvider';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    weight: ['400', '500', '600'],
    display: 'swap',
});

const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    weight: ['500', '600', '700'],
    display: 'swap',
});

const syne = Syne({
    subsets: ['latin'],
    variable: '--font-syne',
    weight: ['600', '700', '800'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Propheus | Physical AI Infrastructure',
    description: 'Propheus — Infrastructure-grade Physical Intelligence',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${playfairDisplay.variable} ${syne.variable}`}>
            <body>
                <SmoothScrollProvider>{children}</SmoothScrollProvider>
                <F1EasterEgg />
                <AnalyticsProvider />
                {/* Umami */}
                <Script
                    src="https://cloud.umami.is/script.js"
                    data-website-id="37ad9696-d934-468b-add1-a93dc02bf586"
                    strategy="afterInteractive"
                />
                {/* Google Analytics 4 */}
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-FFPXX06319"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">{`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-FFPXX06319');
                `}</Script>
            </body>
        </html>
    );
}
