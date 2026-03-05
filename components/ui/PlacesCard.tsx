'use client';

import React, { useEffect, useRef } from 'react';

/* ============================================================
   PlacesCard — Nearby Retail Signal Panel
   GlowCard Edition with interactive spotlight border tracking.
   Designed to sit inside the existing sp-topo signal pointer.
   ============================================================ */

// --- Minimalist SVG Brand Icons ---
const AppleIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.9)' }}>
        <path d="M15.46 8.52A4.27 4.27 0 0 0 16.5 5.5a4.34 4.34 0 0 0-2.8 1.45 4.18 4.18 0 0 0-1.08 3 4.15 4.15 0 0 0 2.84-1.43M16.92 18.25c.57-1.4 1.22-3.1 1.22-3.1s-2-.76-2-2.58c0-2.12 1.83-2.9 1.83-2.9a4.83 4.83 0 0 0-3.92-2.12c-1.68-.16-3.23.95-4.1 1.05-1.05.1-2.4-.95-3.83-1a5.2 5.2 0 0 0-4.4 2.62c-1.85 3.2-.48 7.9 1.34 10.53 1.05 1.52 2 2.72 3.32 2.7 1.3-.04 1.85-.85 3.4-.85 1.55 0 2 .85 3.4.85 1.37.02 2.37-1.3 3.34-2.7z" />
    </svg>
);

const NikeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.9)' }}>
        <path d="M22 6.5s-4.8 7.6-11.6 9.4c-3.1.8-6.1.4-8.1-.8-1.5-.9-1.9-2.3-1-3.6.7-1 2.3-1.6 4-1.6 1.4 0 2.8.5 2.8.5s-4.7-.6-6.6 0c-1.5.5-2.2 1.5-1.6 2.6 1.2 2.1 5.9 3.5 10.5 2.2 6.8-2 11.6-8.7 11.6-8.7z" />
    </svg>
);

const StarbucksIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.9)' }}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v12M8.5 10.5h7M8.5 14.5h7" strokeLinecap="round" />
        <path d="M12 6a3 3 0 0 1 3 3v2M12 6a3 3 0 0 0-3 3v2" />
    </svg>
);

const ZaraIcon = () => (
    <span style={{ fontFamily: 'serif', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.05em', fontSize: 10 }}>
        ZARA
    </span>
);

const MapPinIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

// --- Data ---
const PLACES = [
    { id: 'apple',     name: 'Apple',    category: 'Electronics', distance: '120m', icon: <AppleIcon /> },
    { id: 'zara',      name: 'ZARA',           category: 'Apparel',     distance: '250m', icon: <ZaraIcon /> },
    { id: 'starbucks', name: 'Starbucks',      category: 'Coffee Shop', distance: '340m', icon: <StarbucksIcon /> },
    { id: 'nike',      name: 'Nike Flagship',  category: 'Sportswear',  distance: '500m', icon: <NikeIcon /> },
];

// --- GlowCard — Interactive spotlight border tracking ---
function GlowCard({ children }: { children: React.ReactNode }) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const syncPointer = (e: PointerEvent) => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            cardRef.current.style.setProperty('--x', (e.clientX - rect.left).toFixed(2));
            cardRef.current.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2));
            cardRef.current.style.setProperty('--y', (e.clientY - rect.top).toFixed(2));
            cardRef.current.style.setProperty('--yp', (e.clientY / window.innerHeight).toFixed(2));
        };
        document.addEventListener('pointermove', syncPointer);
        return () => document.removeEventListener('pointermove', syncPointer);
    }, []);

    return (
        <div
            ref={cardRef}
            data-glow
            style={{
                '--base': '175',
                '--spread': '20',
                '--radius': '20',
                '--border': '1.5',
                '--backdrop': 'rgba(4, 5, 8, 0.95)',
                '--backup-border': 'rgba(255,255,255,0.12)',
                '--size': '220',
                '--outer': '1',
                '--border-size': 'calc(var(--border, 1.5) * 1px)',
                '--spotlight-size': 'calc(var(--size, 220) * 1px)',
                '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
                '--saturation': '100',
                '--lightness': '45',
                '--border-spot-opacity': '1',
                '--border-light-opacity': '0.3',
                '--bg-spot-opacity': '0.025',
                backgroundImage: `radial-gradient(
                    var(--spotlight-size) var(--spotlight-size) at
                    calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
                    hsl(var(--hue, 175) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 45) * 1%) / var(--bg-spot-opacity, 0.025)), transparent
                )`,
                backgroundColor: 'var(--backdrop)',
                backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
                backgroundPosition: '50% 50%',
                border: 'var(--border-size) solid var(--backup-border)',
                borderRadius: 'calc(var(--radius) * 1px)',
                backdropFilter: 'blur(52px) saturate(200%)',
                boxShadow: '0 24px 48px -12px rgba(0,0,0,0.85)',
                position: 'relative',
                padding: '1.25rem 1.25rem',
                touchAction: 'none',
            } as React.CSSProperties}
        >
            <div data-glow-inner style={{ position: 'absolute', inset: 0, borderRadius: 'calc(var(--radius) * 1px)', border: 'none', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </div>
    );
}

// --- Main export ---
export default function PlacesCard() {
    return (
        <GlowCard>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{
                        color: 'rgba(255,255,255,0.92)',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
                        fontWeight: 500,
                        fontSize: 18,
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                        WebkitFontSmoothing: 'antialiased',
                    }}>
                        Nearby
                    </span>
                    <span style={{
                        color: 'rgba(45,212,191,0.7)',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
                        fontWeight: 600,
                        fontSize: 9,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        WebkitFontSmoothing: 'antialiased',
                    }}>
                        Retail &amp; Leisure
                    </span>
                </div>
                <MapPinIcon />
            </div>

            {/* Places list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {PLACES.map((place) => (
                    <div key={place.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Icon */}
                        <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            {place.icon}
                        </div>

                        {/* Name + category */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{
                                color: 'rgba(255,255,255,0.9)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
                                fontWeight: 500,
                                fontSize: 14,
                                letterSpacing: '-0.02em',
                                lineHeight: 1,
                                WebkitFontSmoothing: 'antialiased',
                            }}>
                                {place.name}
                            </span>
                            <span style={{
                                color: 'rgba(255,255,255,0.38)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
                                fontWeight: 400,
                                fontSize: 12,
                                letterSpacing: '0.01em',
                                WebkitFontSmoothing: 'antialiased',
                            }}>
                                {place.category}
                            </span>
                        </div>

                        {/* Distance */}
                        <span style={{
                            color: 'rgba(45,212,191,0.9)',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
                            fontWeight: 500,
                            fontSize: 12,
                            letterSpacing: '0.02em',
                            WebkitFontSmoothing: 'antialiased',
                        }}>
                            {place.distance}
                        </span>
                    </div>
                ))}
            </div>
        </GlowCard>
    );
}
