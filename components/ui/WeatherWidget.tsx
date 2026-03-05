'use client';

/**
 * WeatherWidget — GlowCard Edition
 * Weather + retail impact metrics in glassmorphic dark shell.
 * Dot / line / pulse are owned by GSAP — this is card content only.
 */

import React, { useEffect, useRef } from 'react';

export type WeatherCondition = 'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm' | 'mist';

export interface WeatherWidgetProps {
    temperature?: number;
    condition?: WeatherCondition;
    isDay?: boolean;
    className?: string;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const SunIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, color: '#FBBF24', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.4))' }}>
        <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.2" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" />
    </svg>
);

const FootfallIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.45)' }}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DeliveryIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.45)' }}>
        <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
    </svg>
);

const TrendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.45)' }}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ─── GlowCard ────────────────────────────────────────────────────────────────

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
                '--base': '175', '--spread': '20', '--radius': '20', '--border': '1.5',
                '--backdrop': 'rgba(4,5,8,0.95)', '--backup-border': 'rgba(255,255,255,0.12)',
                '--size': '220', '--outer': '1',
                '--border-size': 'calc(var(--border, 1.5) * 1px)',
                '--spotlight-size': 'calc(var(--size, 220) * 1px)',
                '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
                '--saturation': '100', '--lightness': '45',
                '--border-spot-opacity': '1', '--border-light-opacity': '0.3',
                '--bg-spot-opacity': '0.025',
                backgroundImage: `radial-gradient(var(--spotlight-size) var(--spotlight-size) at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), hsl(var(--hue, 175) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 45) * 1%) / var(--bg-spot-opacity, 0.025)), transparent)`,
                backgroundColor: 'var(--backdrop)',
                backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
                backgroundPosition: '50% 50%',
                border: 'var(--border-size) solid var(--backup-border)',
                borderRadius: 'calc(var(--radius) * 1px)',
                backdropFilter: 'blur(52px) saturate(200%)',
                boxShadow: '0 24px 48px -12px rgba(0,0,0,0.85)',
                position: 'relative',
                padding: '1.25rem',
                touchAction: 'none',
            } as React.CSSProperties}
        >
            <div data-glow-inner style={{ position: 'absolute', inset: 0, borderRadius: 'calc(var(--radius) * 1px)', border: 'none', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WeatherWidget({
    temperature = 18,
    condition = 'clear',
    isDay = true,
}: WeatherWidgetProps) {
    const sf: React.CSSProperties = {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        WebkitFontSmoothing: 'antialiased',
    };

    return (
        <GlowCard>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', ...sf }}>
                <span style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.03em', lineHeight: 1 }}>Weather</span>
                <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 700, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Retail Impact</span>
            </div>

            {/* Temperature row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <SunIcon />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 52, lineHeight: 1, letterSpacing: '-0.04em', ...sf }}>{temperature}</span>
                        <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500, fontSize: 22, marginTop: 4, ...sf }}>°</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 700, fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', marginTop: 4, ...sf }}>Ambient Temp</span>
                </div>
            </div>

            {/* Divider */}
            <div style={{ width: '100%', height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.18), rgba(255,255,255,0.04), transparent)', margin: '1rem 0' }} />

            {/* Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <FootfallIcon />
                        <span style={{ color: 'rgba(255,255,255,0.48)', fontSize: 12, fontWeight: 500, letterSpacing: '0.02em', ...sf }}>Footfall trend</span>
                    </div>
                    <span style={{ color: 'rgba(45,212,191,0.95)', fontWeight: 600, fontSize: 12, background: 'rgba(45,212,191,0.1)', padding: '2px 8px', borderRadius: 6, ...sf }}>+15%</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <DeliveryIcon />
                        <span style={{ color: 'rgba(255,255,255,0.48)', fontSize: 12, fontWeight: 500, letterSpacing: '0.02em', ...sf }}>Delivery ops</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500, fontSize: 12, ...sf }}>Optimal</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <TrendIcon />
                        <span style={{ color: 'rgba(255,255,255,0.48)', fontSize: 12, fontWeight: 500, letterSpacing: '0.02em', ...sf }}>Key category</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 500, fontSize: 12, ...sf }}>Cold Drinks</span>
                </div>
            </div>
        </GlowCard>
    );
}
