'use client';

/**
 * CompetitorCard — GlowCard Edition
 * Competitor events + demographics + risk badge.
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

const AlertIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, color: '#fb7185' }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const UsersIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.48)' }}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, color: 'rgba(255,255,255,0.28)' }}>
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const TargetIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.35)' }}>
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
);

const EVENTS = [
    { id: 1, company: 'Warriors',    title: 'Series 3 — Varets v. Carey',        impact: 'High overlap',   impactColor: '#fb7185', indicator: '#fb7185', time: 'Mar 7, 7:30 PM' },
    { id: 2, company: 'NY Knicks',   title: 'vs. Oklahoma City Thunder',          impact: 'Medium overlap', impactColor: '#fbbf24', indicator: '#fbbf24', time: 'Mar 4, 8:00 PM' },
    { id: 3, company: 'NY Rangers',  title: 'vs. Toronto Maple Leafs',            impact: 'Traffic surge',  impactColor: '#10b981', indicator: '#10b981', time: 'Mar 5, 6:00 PM' },
];

const sf: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    WebkitFontSmoothing: 'antialiased',
};

export default function CompetitorCard() {
    return (
        <GlowCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.03em', lineHeight: 1, ...sf }}>Events</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', padding: '4px 8px', borderRadius: 6 }}>
                    <AlertIcon />
                    <span style={{ color: '#fb7185', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', ...sf }}>Elevated</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.75rem' }}>
                <span className="competitor-count" style={{ color: '#fff', fontWeight: 700, fontSize: 52, lineHeight: 1, letterSpacing: '-0.04em', ...sf }}>6</span>
                <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 700, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4, ...sf }}>Active Local Events</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '0.65rem 0.8rem', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(45,212,191,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <UsersIcon />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', ...sf }}>Primary Draw</span>
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, letterSpacing: '-0.02em', ...sf }}>Gen Z &amp; Millennials</span>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <TargetIcon />
                    <span style={{ color: '#fb7185', fontSize: 11, fontWeight: 700, background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', padding: '3px 9px', borderRadius: 6, letterSpacing: '0.01em', ...sf }}>85% Match</span>
                </div>
            </div>

            <div style={{ width: '100%', height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.18), rgba(255,255,255,0.04), transparent)', marginBottom: '0.85rem' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {EVENTS.map((ev) => (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
                            <div style={{ width: 3, borderRadius: 99, background: ev.indicator, flexShrink: 0, opacity: 0.85 }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, letterSpacing: '-0.02em', ...sf }}>{ev.company}</span>
                                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1, ...sf }}>{ev.title}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                    <CalendarIcon />
                                    <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, ...sf }}>{ev.time}</span>
                                </div>
                            </div>
                        </div>
                        <span style={{ color: ev.impactColor, fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', marginLeft: 8, ...sf }}>
                            {ev.impact}
                        </span>
                    </div>
                ))}
            </div>
        </GlowCard>
    );
}
