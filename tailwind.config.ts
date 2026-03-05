import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
    content: [
        './app/**/*.{ts,tsx,js,jsx}',
        './components/**/*.{ts,tsx,js,jsx}',
        './lib/**/*.{ts,tsx,js,jsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['var(--font-heading)', 'Playfair Display', 'serif'],
                body: ['var(--font-body)', 'Inter', 'sans-serif'],
            },
            colors: {
                teal: {
                    DEFAULT: '#008A89',
                    light: '#00a5a4',
                    dark: '#006f6e',
                },
                signal: '#00C389',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
};

export default config;
