'use client';

/**
 * PromoWatchCard — GlowCard Edition
 * Big promo count + scrollable promo list + risk footer.
 * Dot / line / pulse are owned by GSAP — this is card content only.
 */

import React, { useEffect, useRef } from 'react';

function GlowCard({ children }: { children: React.ReactNode }) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sync = (e: PointerEvent) => {
            if (!cardRef.current) return;
            const r = cardRef.current.getBoundingClientRect();
            cardRef.current.style.setProperty('--x', (e.clientX - r.left).toFixed(2));
            cardRef.current.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2));
            cardRef.current.style.setProperty('--y', (e.clientY - r.top).toFixed(2));
            cardRef.current.style.setProperty('--yp', (e.clientY / window.innerHeight).toFixed(2));
        };
        document.addEventListener('pointermove', sync);
        return () => document.removeEventListener('pointermove', sync);
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

const TagIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.48)' }}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
);

const RiskIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, color: '#fb7185' }}>
        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
        <polyline points="16 17 22 17 22 11" />
    </svg>
);

const ClockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.28)' }}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

const PROMOS = [
    { id: 1, store: 'STORE B',      title: 'Flash Sale',     value: '-20%',  valueColor: '#fb7185', indicator: '#fb7185', time: 'Ends in 2h' },
    { id: 2, store: 'STORE C',      title: 'BOGO Active',    value: 'x2',    valueColor: '#fbbf24', indicator: '#fbbf24', time: 'Ongoing' },
    { id: 3, store: 'ONLINE',       title: 'Free Shipping',  value: '$0',    valueColor: '#10b981', indicator: '#10b981', time: 'Ends today' },
    { id: 4, store: 'ALL REGIONS',  title: 'Clearance',      value: '50%',   valueColor: '#a78bfa', indicator: '#a78bfa', time: 'Last day' },
    { id: 5, store: 'PARTNER',      title: 'Loyalty Boost',  value: '+500',  valueColor: '#60a5fa', indicator: '#60a5fa', time: 'Weekend' },
];

const sf: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    WebkitFontSmoothing: 'antialiased',
};

export default function PromoWatchCard() {
    return (
        <GlowCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.03em', lineHeight: 1, ...sf }}>Competitor Promo</span>
                <TagIcon />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.85rem' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 52, lineHeight: 1, letterSpacing: '-0.04em', ...sf }}>29</span>
                <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4, ...sf }}>Active Promos</span>
            </div>

            <div style={{ width: '100%', height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.18), rgba(255,255,255,0.04), transparent)', marginBottom: '0.85rem' }} />

            <div className="promo-scroll" style={{ maxHeight: 170, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingRight: 4, marginRight: -4 }}>
                {PROMOS.map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
                            <div style={{ width: 3, borderRadius: 99, background: p.indicator, flexShrink: 0, opacity: 0.85 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}>
                                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1, ...sf }}>{p.store}</span>
                                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, letterSpacing: '-0.02em', ...sf }}>{p.title}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                    <ClockIcon />
                                    <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, ...sf }}>{p.time}</span>
                                </div>
                            </div>
                        </div>
                        <span style={{ color: p.valueColor, fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em', ...sf }}>{p.value}</span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem', marginTop: '0.85rem', position: 'relative' }}>
                <RiskIcon />
                <span style={{ color: 'rgba(255,255,255,0.48)', fontSize: 11, fontWeight: 500, ...sf }}>Margin risk:</span>
                <span style={{ color: '#fb7185', fontSize: 11, fontWeight: 600, letterSpacing: '-0.01em', ...sf }}>High</span>
            </div>
        </GlowCard>
    );
}
