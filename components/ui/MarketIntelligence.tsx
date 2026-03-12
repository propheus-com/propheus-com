'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';

// ══════════════════════════════════════════════════════════════════════════════
// MARKET INTELLIGENCE — TRIAL & ERROR KNOBS
// Edit MI_SCALE to resize the card (1.0 = full size, 0.5 = 50% smaller)
// Edit position via .sp-marketintel in globals.css (top / left values)
// ══════════════════════════════════════════════════════════════════════════════
const MI_SCALE = 0.8;  // adjust to taste

// --- Premium Brand SVG Logos ---
const NikeLogo = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
    <path d="M21 6.5s-4.8 7.6-11.6 9.4c-3.1.8-6.1.4-8.1-.8-1.5-.9-1.9-2.3-1-3.6.7-1 2.3-1.6 4-1.6 1.4 0 2.8.5 2.8.5s-4.7-.6-6.6 0c-1.5.5-2.2 1.5-1.6 2.6 1.2 2.1 5.9 3.5 10.5 2.2 6.8-2 11.6-8.7 11.6-8.7z" />
  </svg>
);

const AdidasLogo = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
    <path d="M2.5 19.5h3l4.5-9h-3zM8.5 19.5h3l4.5-13h-3zM14.5 19.5h3l4.5-17h-3z" />
  </svg>
);

const HMLogo = () => (
  <div className="text-[10px] font-black italic tracking-tighter text-white uppercase">H&M</div>
);

const ZaraLogo = () => (
  <div className="text-[9px] font-serif font-black tracking-tight text-white leading-none">ZARA</div>
);

// --- UI Icons ---
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-teal-400">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-rose-400">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const HeartPulseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-400">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

// --- Numerical Counter ---
const AnimatedCounter = ({ value, prefix = "", suffix = "", delay = 0 }: { value: number; prefix?: string; suffix?: string; delay?: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration: 2,
      delay: delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { node.textContent = `${prefix}${Math.round(v).toLocaleString()}${suffix}`; }
    });
    return () => controls.stop();
  }, [value, prefix, suffix, delay]);
  return <span ref={nodeRef} />;
};

// --- DATA POOLS ---
const EVENT_POOL = [
  { id: 1, title: "Ray Mondal Concert", meta: "Stadium District · 5:00 PM", color: "from-teal-400 to-teal-600" },
  { id: 2, title: "Christmas in the Park", meta: "Central Plaza · All Day", color: "from-blue-400 to-blue-600" },
  { id: 3, title: "Downtown Tech Expo", meta: "Convention Hall · 10:00 AM", color: "from-indigo-400 to-indigo-600" },
  { id: 4, title: "Riverside Marathon", meta: "East Loop · 7:00 AM", color: "from-emerald-400 to-emerald-600" },
];

const PROMO_POOL = [
  { id: 1, brand: "Adidas", type: "Kids Footwear", desc: "Store-wide active", val: "-25%", logo: <AdidasLogo /> },
  { id: 2, brand: "H&M", type: "Summer Shirts", desc: "Seasonal Clearance", val: "-30%", logo: <HMLogo /> },
  { id: 3, brand: "Nike", type: "Performance", desc: "Member Exclusive", val: "-20%", logo: <NikeLogo /> },
  { id: 4, brand: "Zara", type: "Outerwear", desc: "Limited Weekend", val: "-15%", logo: <ZaraLogo /> },
];

// --- INTERACTIVE GLOW CARD ---
const GlowCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        cardRef.current.style.setProperty('--x', (e.clientX - rect.left).toFixed(2));
        cardRef.current.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', (e.clientY - rect.top).toFixed(2));
        cardRef.current.style.setProperty('--yp', (e.clientY / window.innerHeight).toFixed(2));
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
        '--base': '150', '--spread': '30', '--radius': '24', '--border': '2',
        '--backdrop': 'rgba(0,0,0,0.97)', '--backup-border': 'rgba(255,255,255,0.08)',
        '--size': '250', '--outer': '1',
        '--border-size': 'calc(var(--border, 2) * 1px)',
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
      <div data-glow-inner style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', border: 'none', pointerEvents: 'none' }} />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

const EventsCompetitorSentimentWidget = () => {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    const onEnter = () => { setIsVisible(true); setPlayKey(k => k + 1); };
    const onExit  = () => setIsVisible(false);
    window.addEventListener('propheus:state2',      onEnter);
    window.addEventListener('propheus:state2:exit', onExit);
    return () => {
      window.removeEventListener('propheus:state2',      onEnter);
      window.removeEventListener('propheus:state2:exit', onExit);
    };
  }, []);

  useEffect(() => {
    // 3.8s auto-cycle interval for high-velocity feel
    const interval = setInterval(() => {
      setCycleIndex((prev) => (prev + 2) % EVENT_POOL.length);
    }, 3800); 
    return () => clearInterval(interval);
  }, []);

  const activeEvents = [EVENT_POOL[cycleIndex], EVENT_POOL[(cycleIndex + 1) % EVENT_POOL.length]];
  const activePromos = [PROMO_POOL[cycleIndex], PROMO_POOL[(cycleIndex + 1) % PROMO_POOL.length]];

  const sentimentData = [
    { label: 'Positive', value: 65, color: '#2dd4bf' },
    { label: 'Neutral',  value: 20, color: '#3b82f6' },
    { label: 'Negative', value: 15, color: '#f43f5e' },
  ];

  const chartRadius = 32;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * chartRadius;
  const gap = 8;
  let currentOffset = 0;

  return (
    <AnimatePresence>
    {isVisible && (
    <div style={{ transform: `scale(${MI_SCALE})`, transformOrigin: 'center right', display: 'inline-block' }}>
    <motion.div
      key={playKey}
      initial={{ opacity: 0, filter: 'blur(12px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(12px)', transition: { duration: 0.4, ease: 'easeIn' } }}
      transition={{ duration: 1.0, delay: 2.0, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[460px] apple-typography select-none p-2"
    >
      <GlowCard className="p-8 pb-12">
        <div className="flex flex-col h-full">
          
          {/* Unified Header - Consistent weight/opacity/size */}
          <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/5">
            <h2 className="text-white text-[24px] font-black tracking-tight leading-none">
              Market Intelligence
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            
            {/* --- 1. LOCAL EVENTS SECTION --- */}
            <div className="flex flex-col gap-5 p-6 rounded-[28px] bg-white/[0.03] border border-white/5 h-[200px] overflow-hidden relative shadow-inner">
              <div className="flex items-center gap-2.5 mb-2">
                <CalendarIcon />
                <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Local Events</span>
              </div>
              
              <div className="relative flex-1">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`events-${cycleIndex}`}
                    initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-6"
                  >
                    {activeEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-5">
                        <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${event.color} shadow-[0_0_12px_rgba(255,255,255,0.05)]`} />
                        <div className="flex flex-col justify-center">
                          <span className="text-white font-extrabold text-[17px] leading-none tracking-tight mb-2">{event.title}</span>
                          <span className="text-white/40 text-[11px] font-bold tracking-widest uppercase">{event.meta}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* --- 2. PROMO WATCH SECTION --- */}
            <div className="flex flex-col gap-5 p-6 rounded-[28px] bg-white/[0.03] border border-white/5 h-[230px] overflow-hidden relative shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <TagIcon />
                  <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Promo Watch</span>
                </div>
                <div className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                  Live
                </div>
              </div>
              
              <div className="relative flex-1">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`promos-${cycleIndex}`}
                    initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-6"
                  >
                    {activePromos.map((promo) => (
                      <div key={promo.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] shrink-0">
                            {promo.logo}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-2 leading-none mb-1.5">
                              <span className="text-white font-black text-[17px] tracking-tight">{promo.brand}</span>
                              <span className="text-white/20 text-[10px] font-bold uppercase tracking-wider">· {promo.type}</span>
                            </div>
                            <span className="text-white/40 text-[11px] font-bold italic leading-none">{promo.desc}</span>
                          </div>
                        </div>
                        <span className="text-rose-400 font-black text-[22px] tracking-tighter drop-shadow-[0_0_12px_rgba(244,63,94,0.3)] shrink-0">
                          {promo.val}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* --- 3. BRAND SENTIMENT SECTION --- */}
            <div className="flex flex-col gap-6 p-6 rounded-[28px] bg-white/[0.03] border border-white/5 shadow-inner">
              <div className="flex items-center gap-2.5">
                <HeartPulseIcon />
                <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Sentiment Sweep</span>
              </div>
              
              <div className="flex items-center gap-10">
                <div className="relative w-[110px] h-[110px] shrink-0 ml-1">
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <span className="text-white text-[32px] font-black tracking-tighter leading-none mb-0.5">
                      <AnimatedCounter value={78} />
                    </span>
                  </div>
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-2xl overflow-visible">
                    <circle cx="50" cy="50" r={chartRadius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
                    {sentimentData.map((item, i) => {
                      const arcLength = (item.value / 100) * circumference;
                      const dashLength = Math.max(0, arcLength - gap);
                      const startOffset = currentOffset;
                      currentOffset += arcLength; 
                      return (
                        <motion.circle
                          key={item.label}
                          cx="50" cy="50" r={chartRadius} fill="none" stroke={item.color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDashoffset={-startOffset}
                          initial={{ strokeDasharray: `0 ${circumference}` }}
                          animate={{ strokeDasharray: `${dashLength} ${circumference}` }}
                          transition={{ duration: 1.5, delay: 0.2 + (i * 0.15), ease: [0.22, 1, 0.36, 1] }}
                        />
                      );
                    })}
                  </svg>
                </div>

                <div className="flex flex-col gap-4 w-full justify-center pr-2">
                  {sentimentData.map((item) => (
                    <div key={item.label} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.6)] group-hover:scale-125 transition-all duration-500" style={{ backgroundColor: item.color }} />
                        <span className="text-white/50 text-[13px] font-bold uppercase tracking-widest group-hover:text-white transition-colors duration-500">{item.label}</span>
                      </div>
                      <span className="text-white font-black text-[16px] tracking-tighter">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </GlowCard>
    </motion.div>
    </div>
    )}
    </AnimatePresence>
  );
};

export { EventsCompetitorSentimentWidget };

/* ── Compact mobile variant — shows key stats only ── */
export function MobileMarketIntel() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onEnter = () => setIsVisible(true);
    const onExit  = () => setIsVisible(false);
    window.addEventListener('propheus:state2',      onEnter);
    window.addEventListener('propheus:state2:exit', onExit);
    return () => {
      window.removeEventListener('propheus:state2',      onEnter);
      window.removeEventListener('propheus:state2:exit', onExit);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(8px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, delay: 2.0, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlowCard className="p-3">
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif', WebkitFontSmoothing: 'antialiased' }}>
          <h3 style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: 12, letterSpacing: '-0.02em', lineHeight: 1, margin: '0 0 8px' }}>Market Intel</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#2dd4bf', fontWeight: 700, fontSize: 20, lineHeight: 1, letterSpacing: '-0.04em' }}>
                <AnimatedCounter value={3} delay={2.2} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2 }}>Events</div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', minHeight: 28 }} />
            <div>
              <div style={{ color: '#3b82f6', fontWeight: 700, fontSize: 20, lineHeight: 1, letterSpacing: '-0.04em' }}>
                <AnimatedCounter value={78} delay={2.4} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 2 }}>Sentiment</div>
            </div>
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
}

export default function App() {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-[#000] py-12 px-4 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} 
      />
      <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] bg-teal-500/[0.02] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-blue-500/[0.02] blur-[140px] rounded-full pointer-events-none" />
      
      <EventsCompetitorSentimentWidget />
    </div>
  );
}