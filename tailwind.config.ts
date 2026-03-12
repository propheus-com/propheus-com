import type { Config } from 'tailwindcss';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default;

function addVariablesForColors({ addBase, theme }: any) {
    const allColors = flattenColorPalette(theme('colors'));
    const newVars = Object.fromEntries(
        Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
    );
    addBase({ ':root': newVars });
}

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
            animation: {
                aurora: 'aurora 60s linear infinite',
            },
            keyframes: {
                aurora: {
                    from: { backgroundPosition: '50% 50%, 50% 50%' },
                    to: { backgroundPosition: '350% 50%, 350% 50%' },
                },
            },
        },
    },
    plugins: [addVariablesForColors],
};

export default config;
