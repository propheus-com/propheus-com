'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, animate, AnimatePresence } from 'framer-motion';

// ─── AnimatedCounter ──────────────────────────────────────────────────────────

const AnimatedCounter = ({ value, delay = 0 }: { value: number; delay?: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    let controls: ReturnType<typeof animate>;
    const t = setTimeout(() => {
      controls = animate(0, value, {
        duration: 2.2,
        ease: [0.16, 1, 0.3, 1],
        onUpdate(v) {
          if (node) node.textContent = Math.round(v).toLocaleString();
        },
      });
    }, delay * 1000);
    return () => { clearTimeout(t); controls?.stop(); };
  }, [value, delay]);

  return <span ref={nodeRef} />;
};

// ─── GaugeCircle ──────────────────────────────────────────────────────────────

const GaugeCircle = ({ percentage, label, color = '#2dd4bf' }: { percentage: number; label: string; color?: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="transparent" />
          <motion.circle
            cx="50" cy="50" r={radius} stroke={color} strokeWidth="10" fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 1 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-black text-[28px] tracking-tighter leading-none">{Math.round(percentage)}%</span>
        </div>
      </div>
      <p className="text-white/70 text-[16px] font-black tracking-[0.2em] uppercase text-center">{label}</p>
    </div>
  );
};

// ─── GlowCard ─────────────────────────────────────────────────────────────────

const GlowCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        cardRef.current.style.setProperty('--x', (e.clientX - rect.left).toFixed(2));
        cardRef.current.style.setProperty('--y', (e.clientY - rect.top).toFixed(2));
      }
    };
    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  return (
    <div
      ref={cardRef}
      data-glow
      style={{
        '--backdrop': 'rgba(0, 0, 0, 0.9)',
        '--border-size': '2px',
        '--spotlight-size': '600px',
        '--hue': '175',
        backgroundImage: `radial-gradient(
          var(--spotlight-size) var(--spotlight-size) at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
          rgba(45, 212, 191, 0.05), transparent
        )`,
        backgroundColor: 'var(--backdrop)',
        border: 'var(--border-size) solid rgba(255, 255, 255, 0.12)',
        position: 'relative',
      } as React.CSSProperties}
      className={`rounded-[32px] overflow-hidden backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.95)] ${className}`}
    >
      <div data-glow-inner></div>
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

// ─── DemographicsWidget ───────────────────────────────────────────────────────

const DemographicsWidget = () => {
  const [expanded, setExpanded] = useState(false);

  const raceData = [
    { label: 'White',    val: 62.4, color: 'bg-white' },
    { label: 'Hispanic', val: 24.5, color: 'bg-teal-400' },
    { label: 'Black',    val: 18.5, color: 'bg-blue-500' },
    { label: 'Asian',    val: 14.0, color: 'bg-zinc-500' },
  ];

  return (
    <div className="w-full max-w-[1600px] apple-typography select-none px-6">
      <GlowCard className="px-10 py-5">

        {/* ── Always-visible collapsed row ── */}
        <div className="flex items-center gap-8">

          {/* Title */}
          <div className="flex items-center gap-3 shrink-0">
            <h2 className="text-white font-black text-[28px] tracking-tight leading-none">Demographics</h2>
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
          </div>

          <div className="w-px h-8 bg-white/10 shrink-0" />

          {/* Population */}
          <div className="flex items-baseline gap-4 shrink-0">
            <div className="flex flex-col">
              <span className="text-white/40 text-[13px] font-black uppercase tracking-[0.2em] mb-0.5">Population</span>
              <span className="text-white font-black text-[40px] leading-none tracking-tighter">
                <AnimatedCounter value={1660664} delay={2.3} />
              </span>
            </div>
            <div className="flex items-center gap-2 self-end pb-[3px]">
              <span className="text-teal-400 text-[20px] font-black tracking-tight">+1.2%</span>
              <span className="text-white/40 text-[14px] font-black uppercase tracking-widest">YoY</span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Expand arrow */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors shrink-0"
            style={{ pointerEvents: 'auto' }}
          >
            <motion.svg
              viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
              className="w-5 h-5"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </button>
        </div>

        {/* ── Expandable section ── */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="flex gap-12 items-center pt-5 mt-4 border-t border-white/10">

                {/* Ethnicity bar + legend */}
                <div className="flex flex-col gap-4 flex-1 min-w-0">
                  {/* Bar */}
                  <div className="h-4 w-full flex rounded-full overflow-hidden bg-white/5">
                    {raceData.map((race, i) => (
                      <motion.div
                        key={i}
                        initial={{ width: 0 }}
                        animate={{ width: `${race.val}%` }}
                        transition={{ duration: 1.6, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className={`${race.color} h-full border-r border-black/40 last:border-0`}
                      />
                    ))}
                  </div>

                  {/* 2×2 legend */}
                  <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                    {raceData.map((race, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, delay: 0.25 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className={`w-3 h-3 rounded-full ${race.color} shrink-0`} />
                        <span className="text-white font-black text-[28px] leading-none tracking-tighter">{race.val}%</span>
                        <span className="text-white/60 text-[17px] font-bold uppercase tracking-wide">{race.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Gauges — side by side */}
                <motion.div
                  className="flex items-center gap-10 pl-10 border-l border-white/10 shrink-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                >
                  <GaugeCircle percentage={28.2} label="Foreign" />
                  <GaugeCircle percentage={36.9} label="Multi" color="#3b82f6" />
                </motion.div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </GlowCard>

      <style>{`
        .apple-typography {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        [data-glow]::before,
        [data-glow]::after {
          pointer-events: none;
          content: "";
          position: absolute;
          inset: calc(var(--border-size) * -1);
          border: var(--border-size) solid transparent;
          border-radius: 32px;
          background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
          background-repeat: no-repeat;
          background-position: 50% 50%;
          mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
        }
        [data-glow]::before {
          background-image: radial-gradient(
            calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
            calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
            hsl(var(--hue, 175) 100% 60% / 1), transparent 100%
          );
          filter: brightness(1.5);
          opacity: 0.7;
        }
        [data-glow]::after {
          background-image: radial-gradient(
            calc(var(--spotlight-size) * 0.4) calc(var(--spotlight-size) * 0.4) at
            calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
            rgba(255, 255, 255, 0.4), transparent 100%
          );
        }
      `}</style>
    </div>
  );
};

// ─── Overlay wrapper (state2 event driven) ────────────────────────────────────

export default function DemographicsWidgetOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Demographics disabled — keep code intact but don't activate
    const show = () => {};
    const hide = () => setVisible(false);
    window.addEventListener('propheus:state1', show);
    window.addEventListener('propheus:state1:exit', hide);
    return () => {
      window.removeEventListener('propheus:state1', show);
      window.removeEventListener('propheus:state1:exit', hide);
    };
  }, []);

  return (
    <div
      className="demographics-overlay"
      style={{
        position: 'absolute',
        bottom: '3%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '1450px',
        padding: '0 1rem',
        zIndex: 8,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            key="demographics"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
            style={{ transformOrigin: 'bottom center', scale: 0.5 }}
            transition={{ duration: 0.9, delay: 2.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <DemographicsWidget />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
