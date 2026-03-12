// @ts-nocheck
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ShoppingCart, Plane, Smartphone, ArrowRight } from 'lucide-react';

/**
 * Premium Industries / Partnerships Widget
 * Features:
 * 1. Deep glassmorphism overlapping a dynamic "Ken Burns" image layer.
 * 2. LayoutId-powered sliding pill navigation.
 * 3. Segmented progress ring with harmonic icon transitions.
 * 4. Refined "See details" button with tactile hover physics.
 *
 * Images: drop replacements into public/assets/Industries/
 * Expected filenames: retail.jpg, cpg.jpg, travel.jpg, o2o.jpg
 */

const partnerships = [
  {
    id: 'retail',
    name: 'Retail',
    image: '/assets/Industries/retail.webp',
    quote: "Your stores are alive with signals most teams never see. Foot traffic patterns, live weather, what competitors are doing next door—right now. Propheus reads all of it and gives your managers something they can actually act on, before the floor feels it.",
    icon: Store,
    accent: '#2dd4bf'
  },
  {
    id: 'cpg',
    name: 'CPG',
    image: '/assets/Industries/cpg.webp',
    quote: "Market size is a guess until you map it to the ground. We layer demand signals, place dynamics, and real-time sentiment onto your distribution footprint—so you see exactly where your product belongs, and what’s quietly stopping it from getting there.",
    icon: ShoppingCart,
    accent: '#3b82f6'
  },
  {
    id: 'travel',
    name: 'Travel',
    image: '/assets/Industries/travel.webp',
    quote: "The moment something sells out, pricing windows open and close in minutes. We connect live venue data, crowd patterns, and local signals so your revenue teams always know which way the market is moving—not an hour later.",
    icon: Plane,
    accent: '#818cf8'
  },
  {
    id: 'o2o',
    name: 'O2O',
    image: '/assets/Industries/o2o.webp',
    quote: "Every zone has its own pulse. Delivery pressure, demand spikes, competitive gaps. We surface the live signals behind each one so you can tune pricing, staffing, and supply without waiting on the weekly report.",
    icon: Smartphone,
    accent: '#2dd4bf'
  }
];

// --- INTERACTIVE GLOW CARD COMPONENT ---
const GlowCard = ({ children, className = '' }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const syncPointer = (e) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
      }
    };
    window.addEventListener('pointermove', syncPointer);
    return () => window.removeEventListener('pointermove', syncPointer);
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        '--backdrop': 'rgba(10, 15, 12, 0.85)',
        '--border-size': '1.5px',
        '--spotlight-size': '400px',
        backgroundImage: `radial-gradient(var(--spotlight-size) var(--spotlight-size) at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), rgba(45, 212, 191, 0.08), transparent)`,
        backgroundColor: 'var(--backdrop)',
        border: 'var(--border-size) solid rgba(255, 255, 255, 0.08)',
      }}
      className={`rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] relative ${className}`}
    >
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default function IndustriesWidget() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePartner = partnerships[activeIndex];
  const Icon = activePartner.icon;

  // Preload all images on mount so tab switching is instant
  useEffect(() => {
    partnerships.forEach(p => {
      const img = new window.Image();
      img.src = p.image;
    });
  }, []);

  return (
    <div className="bg-transparent flex items-center justify-center py-8 md:py-12 px-6 md:px-16 apple-typography overflow-hidden">
      
      {/* Main Container */}
      <div className="relative flex flex-col md:flex-row items-center justify-between w-full max-w-[1400px] h-full mx-auto">
        
        {/* Left Side: Cinematic Background Layer */}
        <div className="relative w-full md:w-10/12 h-[300px] md:h-[750px] rounded-[48px] overflow-hidden bg-zinc-900 group shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePartner.id}
              initial={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.97, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={activePartner.image} 
                alt={activePartner.name}
                className="w-full h-full object-cover brightness-[0.6]"
              />
              {/* Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Overlapping Glow Card */}
        <div className="relative mt-[-40px] md:mt-0 md:absolute md:right-0 w-full md:w-[540px] z-20">
          <GlowCard className="p-8 md:p-12 flex flex-col gap-6">
            
            {/* Tabs Navigation (Sliding Pill) */}
            <nav className="industries-widget-tabs flex items-center gap-2 p-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] w-fit max-w-full overflow-x-auto">
              {partnerships.map((partner, index) => (
                <button
                  key={partner.id}
                  onClick={() => setActiveIndex(index)}
                  className={`relative px-5 py-2 text-[12px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 z-10 ${
                    activeIndex === index ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {activeIndex === index && (
                    <motion.div
                      layoutId="industry-pill"
                      className="absolute inset-0 bg-white/[0.1] rounded-full shadow-sm"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{partner.name}</span>
                </button>
              ))}
            </nav>

            {/* Dynamic Content */}
            <div className="flex flex-col gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePartner.id}
                  initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col"
                >
                  <p className="text-xl md:text-[26px] leading-[1.3] font-medium tracking-tight text-gray-200 mt-10">
                    {activePartner.quote}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Bottom Footer: Progress Ring & CTA */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                
                {/* Circular Icon Ring */}
                <div className="relative w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="38" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" fill="none" />
                    <motion.circle 
                      cx="40" cy="40" r="38" 
                      stroke={activePartner.accent} 
                      strokeWidth="2.5" 
                      fill="none" 
                      strokeLinecap="round"
                      strokeDasharray="239"
                      initial={{ strokeDashoffset: 239 }}
                      animate={{ strokeDashoffset: 239 - (239 * ((activeIndex + 1) / partnerships.length)) }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </svg>
                  <div className="text-gray-300 transition-transform duration-500 hover:scale-110">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                </div>

                {/* CTA Button (Signature Hover Physics) */}
                <motion.a
                  href={`/industries#${activePartner.id}`}
                  whileHover="hover"
                  whileTap="tap"
                  className="group flex items-center gap-1.5 md:gap-2 bg-white/[0.1] text-white px-3 py-2 md:px-5 md:py-3 lg:px-8 lg:py-4 rounded-full text-[10px] md:text-[12px] lg:text-[13px] font-black uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:bg-white/[0.15] transition-colors no-underline border border-white/[0.08]"
                >
                  <span>See the details</span>
                  <motion.div
                    variants={{
                      hover: { x: 5 },
                      tap: { x: 0 }
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    <ArrowRight size={16} strokeWidth={3} />
                  </motion.div>
                </motion.a>
              </div>
            </div>

          </GlowCard>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .apple-typography {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </div>
  );
}
