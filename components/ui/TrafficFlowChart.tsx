'use client';

/**
 * TrafficFlowChart — GlowCard Edition
 * Animated bar chart + command toggles + deep analytics grid.
 * Dot / line / pulse are owned by GSAP — this is card content only.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, animate } from 'framer-motion';

// --- Icons ---
const TrendUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-emerald-400">
    <path d="M22 7L13.5 15.5L8.5 10.5L2 17" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 7H22V13" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white/40">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-400">
    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3" />
    <circle cx="6.5" cy="16.5" r="2.5" />
    <circle cx="16.5" cy="16.5" r="2.5" />
  </svg>
);

const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-400">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-amber-400">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-rose-400">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
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
  return <span ref={nodeRef} className="traffic-count" />;
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
        '--base': '175', '--spread': '30', '--radius': '24', '--border': '1.65',
        '--backdrop': 'rgba(0,0,0,0.97)', '--backup-border': 'rgba(255,255,255,0.08)',
        '--size': '250', '--outer': '1',
        '--border-size': 'calc(var(--border, 1.65) * 1px)',
        '--spotlight-size': 'calc(var(--size, 250) * 1px)',
        '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
        '--saturation': '100', '--lightness': '50',
        '--border-spot-opacity': '1', '--border-light-opacity': '0.4',
        '--bg-spot-opacity': '0.02',
        backgroundImage: `radial-gradient(var(--spotlight-size) var(--spotlight-size) at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), hsl(var(--hue, 175) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--bg-spot-opacity, 0.02)), transparent)`,
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

// --- ToggleSwitch ---
function ToggleSwitch({ active }: { active: boolean }) {
  return (
    <div className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors duration-300 ${active ? 'bg-teal-500' : 'bg-white/10'}`}>
      <motion.div
        initial={false}
        animate={{ x: active ? 16 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-4 h-4 bg-white rounded-full shadow-md"
      />
    </div>
  );
}

// --- Data ---
const CHART_DATA = [
  { day: 'S', value: 35 },
  { day: 'M', value: 65 },
  { day: 'T', value: 80 },
  { day: 'W', value: 70 },
  { day: 'T', value: 85 },
  { day: 'F', value: 100, active: true },
  { day: 'S', value: 50 },
];

// --- Main Export ---
export default function TrafficFlowChart() {
  const [controls, setControls] = useState({ sync: true, reroute: false });

  return (
    <GlowCard className="p-6" >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <h3 className="text-white/90 font-semibold text-lg tracking-tight leading-none">Traffic Flow</h3>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,113,0.8)]"
          />
        </div>
      </div>

      {/* Primary stat */}
      <div className="flex flex-col mb-6">
        <span className="text-white font-bold text-[56px] leading-[0.9] tracking-tighter">
          <AnimatedCounter value={1248} />
        </span>
        <div className="flex items-center gap-2 mt-2">
          <TrendUpIcon />
          <span className="text-white/60 text-[13px] font-medium tracking-wide">
            vehicles / hr · <span className="text-emerald-400/90">stable flow</span>
          </span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end justify-between h-[100px] gap-2 mb-6">
        {CHART_DATA.map((data, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-full bg-white/5 rounded-sm relative h-[80px] overflow-hidden group">
              <motion.div
                className={`absolute bottom-0 w-full rounded-sm ${data.active ? 'bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.5)]' : 'bg-white/20 group-hover:bg-white/30 transition-colors'}`}
                initial={{ height: 0 }}
                animate={{ height: `${data.value}%` }}
                transition={{ duration: 0.8, delay: 0.3 + idx * 0.05, ease: 'easeOut' }}
              />
            </div>
            <span className={`text-[10px] font-bold tracking-widest ${data.active ? 'text-teal-400' : 'text-white/30'}`}>{data.day}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-5" />

      {/* Controls & Metrics grid */}
      <div className="grid grid-cols-[3fr_2fr] gap-5">
        {/* Deep analytics 2×2 */}
        <div className="grid grid-cols-2 gap-y-5 gap-x-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-0.5">
              <CarIcon />
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-[0.1em]">Avg Speed</span>
            </div>
            <span className="text-white/90 font-semibold text-lg tracking-tight">34 <span className="text-white/50 text-[11px]">km/h</span></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ActivityIcon />
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-[0.1em]">Congestion</span>
            </div>
            <span className="text-white/90 font-semibold text-lg tracking-tight">42%</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ClockIcon />
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-[0.1em]">Est. Delay</span>
            </div>
            <span className="text-amber-400 font-semibold text-lg tracking-tight">+4 <span className="text-amber-400/60 text-[11px]">min</span></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-0.5">
              <AlertCircleIcon />
              <span className="text-white/40 text-[10px] uppercase font-bold tracking-[0.1em]">Incidents</span>
            </div>
            <span className="text-white/90 font-semibold text-lg tracking-tight">0 <span className="text-white/50 text-[11px]">active</span></span>
          </div>
        </div>

        {/* Command panel */}
        <div className="flex flex-col gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon />
            <span className="text-white/60 text-xs font-semibold tracking-wide uppercase">Command</span>
          </div>
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setControls(prev => ({ ...prev, sync: !prev.sync }))}
          >
            <span className="text-white/70 text-[13px] font-medium group-hover:text-white transition-colors">Signal Sync</span>
            <ToggleSwitch active={controls.sync} />
          </div>
          <div
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setControls(prev => ({ ...prev, reroute: !prev.reroute }))}
          >
            <span className="text-white/70 text-[13px] font-medium group-hover:text-white transition-colors">Fleet Reroute</span>
            <ToggleSwitch active={controls.reroute} />
          </div>
        </div>
      </div>
    </GlowCard>
  );
}
