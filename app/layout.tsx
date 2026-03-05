import type { Metadata } from 'next';
import { Inter, Playfair_Display, Syne } from 'next/font/google';
import './globals.css';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-body',
    weight: ['400', '500', '600'],
    display: 'swap',
});

const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-heading',
    weight: ['500', '600', '700'],
    display: 'swap',
});

const syne = Syne({
    subsets: ['latin'],
    variable: '--font-display',
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
            </body>
        </html>
    );
}
