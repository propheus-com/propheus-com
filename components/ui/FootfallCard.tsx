'use client';

/**
 * FootfallCard — GlowCard Edition
 * Animated histogram + live indicator + retail analytics sidebar.
 * Dot / line / pulse are owned by GSAP — this is card content only.
 */

import React, { useEffect, useRef } from 'react';
import { motion, animate } from 'framer-motion';

// --- Icons ---
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-400">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-400">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-400">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white/40">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// --- AnimatedCounter ---
function AnimatedCounter({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration: 2.5,
      ease: 'easeOut',
      onUpdate(v) { node.textContent = Math.round(v).toLocaleString(); },
    });
    return () => controls.stop();
  }, [value]);
  return <span ref={nodeRef} className="footfall-count" />;
}

// --- GlowCard ---
function GlowCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
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
        '--base': '150', '--spread': '30', '--radius': '24', '--border': '1.65',
        '--backdrop': 'rgba(0,0,0,0.97)', '--backup-border': 'rgba(255,255,255,0.08)',
        '--size': '250', '--outer': '1',
        '--border-size': 'calc(var(--border, 1.65) * 1px)',
        '--spotlight-size': 'calc(var(--size, 250) * 1px)',
        '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
        '--saturation': '100', '--lightness': '50',
        '--border-spot-opacity': '1', '--border-light-opacity': '0.4',
        '--bg-spot-opacity': '0.02',
        backgroundImage: `radial-gradient(var(--spotlight-size) var(--spotlight-size) at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), hsl(var(--hue, 150) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--bg-spot-opacity, 0.02)), transparent)`,
        backgroundColor: 'var(--backdrop)',
        backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
        backgroundPosition: '50% 50%',
        border: 'var(--border-size) solid var(--backup-border)',
        position: 'relative',
        touchAction: 'none',
      } as React.CSSProperties}
      className={`rounded-[24px] backdrop-blur-[80px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.95)] ${className}`}
    >
      <div data-glow-inner />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// --- Chart data ---
const CHART_DATA = [
  { val: 15, active: false }, { val: 20, active: false }, { val: 18, active: false },
  { val: 25, active: false }, { val: 35, active: false }, { val: 45, active: false },
  { val: 60, active: false }, { val: 75, active: true },  { val: 85, active: true },
  { val: 65, active: true },  { val: 95, active: true },  { val: 100, active: true },
  { val: 80, active: true },  { val: 90, active: true },  { val: 70, active: true },
  { val: 60, active: true },  { val: 50, active: true },  { val: 35, active: false },
  { val: 25, active: false }, { val: 20, active: false }, { val: 15, active: false },
];

const STATS = [
  { icon: <UsersIcon />, value: '2,847/hr' },
  { icon: <ShoppingBagIcon />, value: '+34%' },
  { icon: <TrendingUpIcon />, value: 'Peak 1pm' },
  { icon: <ClockIcon />, value: '3.2m avg' },
];

// --- Main Export ---
export default function FootfallCard() {
  return (
    <GlowCard className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-white/90 font-semibold text-xl tracking-tight leading-none">Footfall</h3>
      </div>

      {/* Grid: left (chart) + right (stats) */}
      <div className="grid grid-cols-[1fr_auto] gap-8">

        {/* Left column: big number + histogram */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5 mb-6">
            <span className="text-white font-bold text-[56px] leading-[0.9] tracking-tighter">
              <AnimatedCounter value={920} />
            </span>
            <span className="text-white/40 font-medium text-[13px] tracking-wide">visitors/hr</span>
          </div>

          {/* Histogram */}
          <div className="relative h-[90px] w-full mt-auto">
            <div className="absolute top-0 w-full border-t border-white/5 border-dashed" />
            <div className="absolute top-1/2 w-full border-t border-white/5 border-dashed" />
            <div className="absolute bottom-0 w-full border-t border-white/10" />
            <div className="absolute inset-0 flex items-end justify-between gap-0.5 pt-2">
              {CHART_DATA.map((data, idx) => (
                <div key={idx} className="w-full flex justify-center group h-full items-end">
                  <motion.div
                    className={`w-full rounded-t-[2px] ${data.active ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,113,0.3)]' : 'bg-emerald-400/15 group-hover:bg-emerald-400/30 transition-colors'}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${data.val}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.03, ease: 'easeOut' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between items-center mt-2 px-1">
            {['5 AM', '11 AM', '5 PM', '11 PM'].map((label) => (
              <span key={label} className="text-white/30 text-[9px] font-bold tracking-widest uppercase">{label}</span>
            ))}
          </div>
        </div>

        {/* Right column: stats sidebar */}
        <div className="flex flex-col justify-between py-1 border-l border-white/5 pl-6 gap-5">
          {STATS.map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/5">
                {stat.icon}
              </div>
              <span className="text-white/90 font-semibold text-[13px] tracking-tight">{stat.value}</span>
            </div>
          ))}
        </div>

      </div>
    </GlowCard>
  );
}
