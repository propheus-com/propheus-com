'use client';

/**
 * SentimentPieChart — GlowCard Edition
 * Animated SVG donut chart with legend grid + analytics footer.
 * Dot / line / pulse are owned by GSAP — this is card content only.
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// --- GlowCard ---
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

// --- Chart data ---
const CHART_DATA = [
    { label: 'Positive', value: 45, color: '#10b981' },
    { label: 'Neutral',  value: 30, color: '#3b82f6' },
    { label: 'Mixed',    value: 15, color: '#fbbf24' },
    { label: 'Negative', value: 10, color: '#fb7185' },
];

const RADIUS = 42;
const STROKE = 10;
const CIRC = 2 * Math.PI * RADIUS;
const GAP = 16;

const sf: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    WebkitFontSmoothing: 'antialiased',
};

export default function SentimentPieChart() {
    let offset = 0;

    return (
        <GlowCard>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1.25rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: 16, letterSpacing: '-0.03em', lineHeight: 1, ...sf }}>
                    Consumer Sentiment
                </span>
                <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 500, fontSize: 10, letterSpacing: '0.05em', ...sf }}>
                    Real-time perception index
                </span>
            </div>

            {/* Donut chart */}
            <div style={{ position: 'relative', width: '100%', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0 1rem' }}>
                {/* Center score */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
                    <motion.span
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 100, delay: 1.5 }}
                        style={{ color: '#fff', fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4, ...sf }}
                    >
                        78
                    </motion.span>
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', ...sf }}>
                        Index Score
                    </span>
                </div>

                {/* SVG */}
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', overflow: 'visible', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
                    <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE} />
                    {CHART_DATA.map((item, i) => {
                        const arcLen = (item.value / 100) * CIRC;
                        const dash = Math.max(0, arcLen - GAP);
                        const startOff = offset;
                        offset += arcLen;
                        return (
                            <motion.circle
                                key={item.label}
                                cx="50" cy="50" r={RADIUS}
                                fill="none"
                                stroke={item.color}
                                strokeWidth={STROKE}
                                strokeLinecap="round"
                                strokeDashoffset={-startOff}
                                initial={{ strokeDasharray: `0 ${CIRC}` }}
                                animate={{ strokeDasharray: `${dash} ${CIRC}` }}
                                transition={{ duration: 1.2, delay: 1.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Legend 2x2 grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 1rem', marginBottom: '1rem', padding: '0 2px' }}>
                {CHART_DATA.map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                            <span style={{ color: 'rgba(255,255,255,0.48)', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em', ...sf }}>{item.label}</span>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: 11, fontWeight: 600, ...sf }}>{item.value}%</span>
                    </div>
                ))}
            </div>

            {/* Footer analytics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.85rem 2px 0' }}>
                {[
                    { label: 'Volume', value: '1.2M', color: 'rgba(255,255,255,0.88)' },
                    { label: 'Confidence', value: '98%', color: 'rgba(255,255,255,0.88)' },
                    { label: 'Volatility', value: 'Low', color: '#10b981' },
                ].map((m) => (
                    <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', ...sf }}>{m.label}</span>
                        <span style={{ color: m.color, fontSize: 11, fontWeight: 600, letterSpacing: '-0.01em', ...sf }}>{m.value}</span>
                    </div>
                ))}
            </div>
        </GlowCard>
    );
}
