'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// ─── Brand Logos ───────────────────────────────────────────────────────────────

const AppleLogo = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white/90">
        <path d="M15.46 8.52A4.27 4.27 0 0 0 16.5 5.5a4.34 4.34 0 0 0-2.8 1.45 4.18 4.18 0 0 0-1.08 3 4.15 4.15 0 0 0 2.84-1.43M16.92 18.25c.57-1.4 1.22-3.1 1.22-3.1s-2-.76-2-2.58c0-2.12 1.83-2.9 1.83-2.9a4.83 4.83 0 0 0-3.92-2.12c-1.68-.16-3.23.95-4.1 1.05-1.05.1-2.4-.95-3.83-1a5.2 5.2 0 0 0-4.4 2.62c-1.85 3.2-.48 7.9 1.34 10.53 1.05 1.52 2 2.72 3.32 2.7 1.3-.04 1.85-.85 3.4-.85 1.55 0 2 .85 3.4.85 1.37.02 2.37-1.3 3.34-2.7z" />
    </svg>
);

const NikeLogo = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
        <path d="M22 6.5s-4.8 7.6-11.6 9.4c-3.1.8-6.1.4-8.1-.8-1.5-.9-1.9-2.3-1-3.6.7-1 2.3-1.6 4-1.6 1.4 0 2.8.5 2.8.5s-4.7-.6-6.6 0c-1.5.5-2.2 1.5-1.6 2.6 1.2 2.1 5.9 3.5 10.5 2.2 6.8-2 11.6-8.7 11.6-8.7z" />
    </svg>
);

const StarbucksLogo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#006241" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3z" strokeLinecap="round" />
    </svg>
);

const ZaraLogo = () => (
    <span className="text-[10px] font-serif font-black tracking-tighter leading-none select-none text-white">ZARA</span>
);

const TargetLogo = () => (
    <svg viewBox="0 0 24 24" fill="#CC0000" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" fill="white" />
        <circle cx="12" cy="12" r="3" fill="#CC0000" />
    </svg>
);

const SephoraLogo = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" fill="#FF3366" />
        <rect x="4" y="2" width="16" height="2" fill="#FF3366" />
    </svg>
);

const MacysLogo = () => (
    <svg viewBox="0 0 24 24" fill="#E21A22" className="w-5 h-5">
        <path d="M12 1.7L15.1 8h6.9l-5.6 4.1L18.5 19l-6.5-4.2L5.5 19l2.1-6.9L2 8h6.9z" />
    </svg>
);

const HMLogo = () => (
    <span className="text-[11px] font-bold leading-none px-0.5" style={{ color: '#E50012', fontStyle: 'italic' }}>H&amp;M</span>
);

const NordstromLogo = () => (
    <span className="text-[8px] font-light tracking-[0.18em] text-white/80 leading-none">NORDSTROM</span>
);

const LululemonLogo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#E4002B" strokeWidth="2" className="w-5 h-5">
        <path d="M12 4C8 4 5 7 5 11c0 5 7 9 7 9s7-4 7-9c0-4-3-7-7-7z" />
    </svg>
);

const GucciLogo = () => (
    <span className="text-[9px] tracking-[0.22em] text-white/85 leading-none font-light">GUCCI</span>
);

const LouisVuittonLogo = () => (
    <span className="text-[8px] tracking-[0.12em] text-white/85 leading-none font-semibold">LV</span>
);

// ─── Stable deterministic marker positions ────────────────────────────────────

type MarkerDef = {
    id: number;
    name: string;
    logo: React.ReactNode;
    x: number; // % of viewport width
    y: number; // % of viewport height
    delay: number; // seconds after propheus:state2 fires (includes 2s initial hold)
};

// Hand-placed clusters so markers sit over the building mass and never at sea.
// The city canvas shows buildings concentrated in the lower 55–82% of the frame,
// spread across the full width but denser toward center-right.
// Each entry: [x%, y%]  — "anchor point" at the geo-dot.
const PLACED: [number, number][] = [
    // Left cluster — low-rise urban grid
    [8,  72],
    [14, 66],
    [20, 74],
    [26, 68],
    // Centre-left cluster — mid-density blocks
    [33, 62],
    [39, 70],
    [45, 65],
    // Centre cluster — downtown towers
    [53, 63],
    [59, 66],
    [64, 72],
    // Right cluster — skyscrapers + foreground buildings
    [72, 62],
    [80, 68],
    [88, 74],
];

// 13 unique brand slots — one per PLACED position, no repeats visible at once
const STORE_LOGOS = [
    { name: 'Apple',     logo: <AppleLogo /> },
    { name: 'Nike',      logo: <NikeLogo /> },
    { name: 'Starbucks', logo: <StarbucksLogo /> },
    { name: 'Zara',      logo: <ZaraLogo /> },
    { name: 'Target',    logo: <TargetLogo /> },
    { name: 'Sephora',   logo: <SephoraLogo /> },
    { name: "Macy's",    logo: <MacysLogo /> },
    { name: 'H&M',       logo: <HMLogo /> },
    { name: 'Nordstrom', logo: <NordstromLogo /> },
    { name: 'Lululemon', logo: <LululemonLogo /> },
    { name: 'Gucci',     logo: <GucciLogo /> },
    { name: 'Louis V.',  logo: <LouisVuittonLogo /> },
    { name: 'Zara',      logo: <ZaraLogo /> },  // 13th slot
];

const MARKERS: MarkerDef[] = PLACED.map(([x, y], i) => ({
    id: i,
    ...STORE_LOGOS[i],
    x,
    y,
    // 2s event hold + left-to-right stagger of 0.13s per marker
    delay: 2.0 + i * 0.13,
}));

// ─── Individual Marker ────────────────────────────────────────────────────────

type MarkerProps = MarkerDef & { playKey: number };

const StoreMarker = ({ name, logo, x, y, delay, playKey }: MarkerProps) => (
    <div
        style={{ left: `${x}%`, top: `${y}%`, position: 'absolute' }}
        className="flex flex-col items-center -translate-x-1/2 -translate-y-[calc(100%-6px)]"
    >
        {/* Brand pill */}
        <motion.div
            key={`pill-${playKey}`}
            initial={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-black backdrop-blur-sm shadow-[0_8px_20px_rgba(0,0,0,0.7)] z-20"
        >
            <div className="text-white flex items-center justify-center">
                {logo}
            </div>
            <div className="w-px h-3.5 bg-white/30" />
            <span className="text-white text-[11px] font-bold tracking-wide uppercase">
                {name}
            </span>
        </motion.div>

        {/* Anchor line */}
        <div className="relative w-px h-7 overflow-hidden">
            <motion.div
                key={`line-${playKey}`}
                initial={{ y: '-100%' }}
                animate={{ y: '0%' }}
                transition={{ delay: delay + 0.3, duration: 0.5, ease: 'circOut' }}
                className="absolute inset-0 bg-gradient-to-b from-white/40 via-teal-400/60 to-teal-400/10"
            />
        </div>

        {/* Geo dot */}
        <div className="relative flex items-center justify-center h-3">
            <motion.div
                key={`dot-${playKey}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay + 0.55, type: 'spring', stiffness: 240, damping: 14 }}
                className="w-[7px] h-[7px] bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.85)] z-10"
            />
            {/* Pulse ring */}
            <motion.div
                key={`pulse-${playKey}`}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ scale: [1, 3.8], opacity: [0.5, 0] }}
                transition={{
                    delay: delay + 0.9,
                    repeat: Infinity,
                    duration: 2.6,
                    ease: [0.25, 0.1, 0.25, 1],
                }}
                className="absolute w-[7px] h-[7px] bg-teal-400 rounded-full"
            />
        </div>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export default function StoreMapMarkers() {
    const [active, setActive] = useState(false);
    const [playKey, setPlayKey] = useState(0);

    useEffect(() => {
        const onEnter = () => { setActive(true); setPlayKey(k => k + 1); };
        const onExit = () => setActive(false);

        window.addEventListener('propheus:state2', onEnter);
        window.addEventListener('propheus:state2:exit', onExit);
        return () => {
            window.removeEventListener('propheus:state2', onEnter);
            window.removeEventListener('propheus:state2:exit', onExit);
        };
    }, []);

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
                opacity: active ? 1 : 0,
                transition: 'opacity 0.9s cubic-bezier(0.22,1,0.36,1)',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
                WebkitFontSmoothing: 'antialiased',
            }}
        >
            {MARKERS.map(m => (
                <StoreMarker key={m.id} {...m} playKey={playKey} />
            ))}
        </div>
    );
}
