'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';

/**
 * Premium Parking Analytics Widget (GlowCard Edition)
 * Features:
 * 1. Apple-style heavy glassmorphism with interactive Spotlight Border.
 * 2. Absolute positioning to act as a map overlay (pulse & line connectors).
 * 3. Segmented capacity visualizers for individual parking levels.
 * 4. Staggered fluid entrance animations & high-performance counters.
 */

// --- Minimalist SVG Icons ---
const ParkingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-white/60">
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M9 16V8h4a3 3 0 0 1 0 6H9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-400">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- Animated Counter ---
const AnimatedCounter = ({ value, prefix = "", suffix = "", delay = 0 }: { value: number; prefix?: string; suffix?: string; delay?: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    
    const controls = animate(0, value, {
      duration: 2.2,
      delay: delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = `${prefix}${Math.round(v).toLocaleString()}${suffix}`;
      }
    });

    return () => controls.stop();
  }, [value, prefix, suffix, delay]);

  return <span ref={nodeRef} />;
};

// --- INTERACTIVE MATTE GLASS CARD ---
const GlowCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--yp', (e.clientY / window.innerHeight).toFixed(2));
      }
    };

    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const baseStyles: Record<string, string | number> = {
    '--base': '175',       
    '--spread': '20',      
    '--radius': '24',      
    '--border': '2',     
    '--backdrop': 'rgba(0, 0, 0, 0.97)',
    '--backup-border': 'rgba(255, 255, 255, 0.1)',
    '--size': '250',       
    '--outer': '1',
    '--border-size': 'calc(var(--border, 1.5) * 1px)',
    '--spotlight-size': 'calc(var(--size, 250) * 1px)',
    '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
    '--saturation': '100',
    '--lightness': '45',
    '--border-spot-opacity': '1',
    '--border-light-opacity': '0.4',
    '--bg-spot-opacity': '0.02', 
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 175) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 45) * 1%) / var(--bg-spot-opacity, 0.02)), transparent
    )`,
    backgroundColor: 'var(--backdrop)',
    backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
    backgroundPosition: '50% 50%',
    border: 'var(--border-size) solid var(--backup-border)',
    position: 'relative',
    touchAction: 'none',
  };

  return (
    <div
      ref={cardRef}
      data-glow
      style={baseStyles as React.CSSProperties}
      className={`rounded-[24px] backdrop-blur-[80px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.9)] ${className}`}
    >
      <div data-glow-inner></div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// --- DATA ---
const LEVELS = [
  { name: 'L1 • Premium', available: 4, total: 20, occ: 80, color: 'bg-rose-400' },
  { name: 'L2 • Standard', available: 15, total: 36, occ: 58, color: 'bg-amber-400' },
  { name: 'L3 • Economy', available: 20, total: 30, occ: 33, color: 'bg-teal-400' },
];

// --- MAIN WIDGET COMPONENT ---
const ParkingWidget = ({ direction = 'right', isVisible = true }: { direction?: 'up' | 'down' | 'left' | 'right'; isVisible?: boolean }) => {
  const lineLength = 110; 

  const getLayoutStyles = () => {
    switch (direction) {
      case 'up': return { line: { bottom: '50%', left: '50%', width: '2px', height: lineLength, transformOrigin: 'bottom center', x: '-50%' }, card: { bottom: `calc(50% + ${lineLength}px)`, left: '50%', x: '-50%', originY: 1 } };
      case 'down': return { line: { top: '50%', left: '50%', width: '2px', height: lineLength, transformOrigin: 'top center', x: '-50%' }, card: { top: `calc(50% + ${lineLength}px)`, left: '50%', x: '-50%', originY: 0 } };
      case 'left': return { line: { right: '50%', top: '50%', height: '2px', width: lineLength, transformOrigin: 'center right', y: '-50%' }, card: { right: `calc(50% + ${lineLength}px)`, top: '50%', y: '-50%', originX: 1 } };
      case 'right': return { line: { left: '50%', top: '50%', height: '2px', width: lineLength, transformOrigin: 'center left', y: '-50%' }, card: { left: `calc(50% + ${lineLength}px)`, top: '50%', y: '-50%', originX: 0 } };
    }
  };

  const layout = getLayoutStyles()!
  const delayLine = 0.6;
  const delayCard = 1.0;

  const lineVariants = {
    hidden: { scaleY: direction === 'up' || direction === 'down' ? 0 : 1, scaleX: direction === 'left' || direction === 'right' ? 0 : 1, opacity: 0 },
    visible: { scaleY: 1, scaleX: 1, opacity: 0.8, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: delayLine, opacity: { duration: 0.1, delay: delayLine } } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, filter: "blur(10px)" },
    visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 100, damping: 20, delay: delayCard, when: "beforeChildren" as const, staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  return (
    <div className="absolute top-1/2 left-1/2 w-0 h-0 z-10 apple-typography">
      <AnimatePresence>
        {isVisible && (
          <>
            {/* 1. Pulse Marker */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20 pointer-events-none"
            >
              <div className="relative flex items-center justify-center w-24 h-24">
                <motion.div animate={{ scale: [0.5, 3.5], opacity: [0, 0.5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }} className="absolute w-8 h-8 rounded-full border border-teal-400/80" />
                <motion.div animate={{ scale: [0.5, 3.5], opacity: [0, 0.3, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut", delay: 2.15 }} className="absolute w-8 h-8 rounded-full border border-teal-400/80" />
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }} className="relative z-30 w-4 h-4 bg-teal-400 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.9)]" />
              </div>
            </motion.div>

            {/* 2. Connecting Line */}
            <motion.div
              initial="hidden" animate="visible" exit="hidden" variants={lineVariants}
              style={{ position: 'absolute', background: 'linear-gradient(to bottom right, #2dd4bf, rgba(45,212,191,0.2))', ...layout.line }}
              className="z-10 pointer-events-none"
            />

            {/* 3. Glassmorphic Glow Card */}
            <motion.div
              initial="hidden" animate="visible" exit="hidden" variants={cardVariants}
              style={{ position: 'absolute', transformOrigin: `${layout.card.originX !== undefined ? layout.card.originX * 100 : 50}% ${layout.card.originY !== undefined ? layout.card.originY * 100 : 50}%`, ...layout.card }}
              className="w-[330px] z-30" 
            >
              <GlowCard className="p-6">
                
                {/* Header Row */}
                <motion.div variants={itemVariants} className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2.5">
                    <ParkingIcon />
                    <h3 className="text-white/90 font-semibold text-lg tracking-tight leading-none">Parking Status</h3>
                  </div>
                  {/* Live Status Badge */}
                  <div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                    <motion.div 
                      animate={{ opacity: [1, 0.4, 1] }} 
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-teal-400"
                    />
                    <span className="text-teal-400 text-[9px] font-bold uppercase tracking-wider">Live</span>
                  </div>
                </motion.div>

                {/* Primary Stat Area */}
                <motion.div variants={itemVariants} className="flex flex-col mb-6">
                  <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Available Spaces</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-bold text-[56px] leading-[0.9] tracking-tighter drop-shadow-md">
                      <AnimatedCounter value={39} delay={1.2} />
                    </span>
                    <span className="text-white/30 font-medium text-[16px]">/ 86</span>
                  </div>
                </motion.div>

                {/* Overall Capacity Visualizer */}
                <motion.div variants={itemVariants} className="flex flex-col gap-2 mb-6">
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                    {/* Occupied Area */}
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: '54.6%' }} // 47 occupied
                      transition={{ duration: 1.5, ease: "easeOut", delay: 1.5 }}
                      className="bg-white/20 h-full border-r border-[#000]"
                    />
                    {/* Available Area */}
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: '45.4%' }} // 39 available
                      transition={{ duration: 1.5, ease: "easeOut", delay: 1.5 }}
                      className="bg-teal-400 h-full relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                    </motion.div>
                  </div>
                  <div className="flex justify-between items-center px-0.5">
                    <span className="text-white/40 text-[9px] uppercase tracking-[0.1em] font-bold">55% Full</span>
                    <span className="text-teal-400 text-[9px] uppercase tracking-[0.1em] font-bold">45% Open</span>
                  </div>
                </motion.div>

                {/* Deep Analytics: Level Breakdown */}
                <motion.div variants={itemVariants} className="flex flex-col gap-4 pt-5 border-t border-white/10">
                  <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">Level Occupancy</span>
                  
                  <div className="flex flex-col gap-3.5">
                    {LEVELS.map((level, idx) => (
                      <div className="flex items-center justify-between group" key={idx}>
                        <span className="text-white/70 text-[12px] font-medium tracking-wide group-hover:text-white transition-colors">{level.name}</span>
                        <div className="flex items-center gap-3">
                          {/* Mini Progress Bar */}
                          <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              className={`h-full ${level.color}`} 
                              initial={{ width: 0 }} 
                              animate={{ width: `${level.occ}%` }} 
                              transition={{ duration: 1.2, delay: 1.8 + (idx * 0.1), ease: "easeOut" }}
                            />
                          </div>
                          {/* Value */}
                          <span className="text-white/90 text-[12px] font-semibold w-5 text-right">
                            {level.available}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Footer Analytics: EV Chargers */}
                <motion.div variants={itemVariants} className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ZapIcon />
                    <span className="text-white/50 text-xs font-medium tracking-wide">EV Chargers</span>
                  </div>
                  <span className="text-emerald-400 text-[11px] font-semibold tracking-wide bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded">
                    4 / 6 Open
                  </span>
                </motion.div>

              </GlowCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- CARD-ONLY EXPORT — used inside signal-pointer system in HeroExperience ---
export const ParkingAnalyticsCard = ({ isMobile = false }: { isMobile?: boolean }) => {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, filter: "blur(10px)" },
    visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 100, damping: 20, when: "beforeChildren" as const, staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  if (isMobile) {
    return (
      <motion.div initial="hidden" animate="visible" variants={cardVariants}>
        <GlowCard className="p-3">
          <motion.div variants={itemVariants}>
            <h3 className="text-white/90 font-semibold text-xs tracking-tight leading-none mb-1.5">Parking</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-white font-bold text-2xl leading-[0.9] tracking-tighter drop-shadow-md">
                <AnimatedCounter value={39} delay={1.0} />
              </span>
              <span className="text-white/30 font-medium text-[10px]">/ 86 open</span>
            </div>
          </motion.div>
        </GlowCard>
      </motion.div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={cardVariants} className="w-[330px]">
      <GlowCard className="p-6">
        <motion.div variants={itemVariants} className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2.5">
            <ParkingIcon />
            <h3 className="text-white/90 font-semibold text-lg tracking-tight leading-none">Parking Status</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-2 py-1 rounded shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span className="text-teal-400 text-[9px] font-bold uppercase tracking-wider">Live</span>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex flex-col mb-6">
          <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Available Spaces</span>
          <div className="flex items-baseline gap-2">
            <span className="text-white font-bold text-[56px] leading-[0.9] tracking-tighter drop-shadow-md">
              <AnimatedCounter value={39} delay={1.0} />
            </span>
            <span className="text-white/30 font-medium text-[16px]">/ 86</span>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex flex-col gap-2 mb-6">
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex shadow-inner">
            <motion.div initial={{ width: 0 }} animate={{ width: '54.6%' }} transition={{ duration: 1.5, ease: "easeOut", delay: 1.2 }} className="bg-white/20 h-full border-r border-[#000]" />
            <motion.div initial={{ width: 0 }} animate={{ width: '45.4%' }} transition={{ duration: 1.5, ease: "easeOut", delay: 1.2 }} className="bg-teal-400 h-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
            </motion.div>
          </div>
          <div className="flex justify-between items-center px-0.5">
            <span className="text-white/40 text-[9px] uppercase tracking-[0.1em] font-bold">55% Full</span>
            <span className="text-teal-400 text-[9px] uppercase tracking-[0.1em] font-bold">45% Open</span>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex flex-col gap-4 pt-5 border-t border-white/10">
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">Level Occupancy</span>
          <div className="flex flex-col gap-3.5">
            {LEVELS.map((level, idx) => (
              <div className="flex items-center justify-between group" key={idx}>
                <span className="text-white/70 text-[12px] font-medium tracking-wide group-hover:text-white transition-colors">{level.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <motion.div className={`h-full ${level.color}`} initial={{ width: 0 }} animate={{ width: `${level.occ}%` }} transition={{ duration: 1.2, delay: 1.4 + (idx * 0.1), ease: "easeOut" }} />
                  </div>
                  <span className="text-white/90 text-[12px] font-semibold w-5 text-right">{level.available}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ZapIcon />
            <span className="text-white/50 text-xs font-medium tracking-wide">EV Chargers</span>
          </div>
          <span className="text-emerald-400 text-[11px] font-semibold tracking-wide bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded">4 / 6 Open</span>
        </motion.div>
      </GlowCard>
    </motion.div>
  );
};

export default function App() {
  // Can be 'up', 'down', 'left', 'right'
  const direction = 'right';

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#0a0f18]">
      
      {/* GLOBAL STYLES (Typography + GlowCard Masks) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .apple-typography {
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* --- GLOW CARD STYLES --- */
        [data-glow]::before,
        [data-glow]::after {
          pointer-events: none;
          content: "";
          position: absolute;
          inset: calc(var(--border-size) * -1);
          border: var(--border-size) solid transparent;
          border-radius: calc(var(--radius) * 1px);
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
            calc(var(--x, 0) * 1px)
            calc(var(--y, 0) * 1px),
            hsl(var(--hue, 175) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
          );
          filter: brightness(2);
        }
        
        [data-glow]::after {
          background-image: radial-gradient(
            calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
            calc(var(--x, 0) * 1px)
            calc(var(--y, 0) * 1px),
            hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
          );
        }
        
        [data-glow] > [data-glow-inner] {
          position: absolute;
          inset: 0;
          will-change: filter;
          opacity: var(--outer, 1);
          border-radius: calc(var(--radius) * 1px);
          border-width: calc(var(--border-size) * 20);
          filter: blur(calc(var(--border-size) * 10));
          background: none;
          pointer-events: none;
          border: none;
        }
      `}</style>

      {/* The Widget */}
      <ParkingWidget direction={direction} />
    </div>
  );
}