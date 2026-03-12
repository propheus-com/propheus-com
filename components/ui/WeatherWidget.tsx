'use client';

/**
 * WeatherWidget — Streamlined v2
 * - Rotating sun (framer-motion)
 * - Cycling temperature (18→19→20→18) with random 2-4s intervals
 * - Removed footfall / delivery / key-category rows (cleaner)
 * - Uses shared GlowCard with 2.5px border for visible glow interaction
 * - Managed by GSAP signal pointer — no self-managed visibility
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowCard from './GlowCard';

// ─── Temperature cycling ──────────────────────────────────────────────────────

const TEMP_CYCLE = [18, 19, 20];

function useCyclingTemp(initial: number) {
    const [temp, setTemp] = useState(initial);

    useEffect(() => {
        let idx = 0;
        let timer: ReturnType<typeof setTimeout>;

        const schedule = () => {
            timer = setTimeout(() => {
                idx = (idx + 1) % TEMP_CYCLE.length;
                setTemp(TEMP_CYCLE[idx]);
                schedule();
            }, 2000 + Math.random() * 2000); // 2–4 s randomised
        };

        schedule();
        return () => clearTimeout(timer);
    }, []);

    return temp;
}

// ─── Sun icon ─────────────────────────────────────────────────────────────────

const SunSvg = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{
            width: 52,
            height: 52,
            color: '#FBBF24',
            filter: 'drop-shadow(0 0 14px rgba(251,191,36,0.55))',
        }}
    >
        <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.18" />
        <path
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
            strokeLinecap="round"
        />
    </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export type WeatherCondition = 'clear' | 'clouds' | 'rain' | 'snow' | 'thunderstorm' | 'mist';

export interface WeatherWidgetProps {
    temperature?: number;
    condition?: WeatherCondition;
    isDay?: boolean;
    className?: string;
}

export default function WeatherWidget({ temperature = 18, isMobile = false }: WeatherWidgetProps & { isMobile?: boolean }) {
    const displayTemp = useCyclingTemp(temperature);

    const [isVisible, setIsVisible] = useState(false);
    const [playKey, setPlayKey] = useState(0);
    const [entryDelay, setEntryDelay] = useState(0.3);
    const comingBack = useRef(false);

    useEffect(() => {
        const onState2 = () => { comingBack.current = true; };
        const onEnter = () => {
            const delay = comingBack.current ? 2.0 : 0.3;
            comingBack.current = false;
            setEntryDelay(delay);
            setIsVisible(true);
            setPlayKey(k => k + 1);
        };
        const onExit  = () => setIsVisible(false);
        window.addEventListener('propheus:state2',      onState2);
        window.addEventListener('propheus:state1',      onEnter);
        window.addEventListener('propheus:state1:exit', onExit);
        return () => {
            window.removeEventListener('propheus:state2',      onState2);
            window.removeEventListener('propheus:state1',      onEnter);
            window.removeEventListener('propheus:state1:exit', onExit);
        };
    }, []);

    if (!isVisible) return null;

    const sf: React.CSSProperties = {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        WebkitFontSmoothing: 'antialiased',
    };

    if (isMobile) {
        return (
            <AnimatePresence>
              {isVisible && (
                <motion.div
                  key={playKey}
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  transition={{ duration: 0.85, delay: entryDelay, ease: [0.22, 1, 0.36, 1] }}
                >
                    <GlowCard style={{ padding: '0.45rem 0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                    style={{ width: 26, height: 26, color: '#FBBF24', filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.55))' }}>
                                    <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.18" />
                                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeLinecap="round" />
                                </svg>
                            </motion.div>
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <motion.span
                                    key={displayTemp}
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    style={{ color: '#fff', fontWeight: 700, fontSize: 22, lineHeight: 1, letterSpacing: '-0.04em', ...sf }}
                                >{displayTemp}</motion.span>
                                <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500, fontSize: 11, marginTop: 1, ...sf }}>°</span>
                            </div>
                        </div>
                    </GlowCard>
                </motion.div>
              )}
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
          {isVisible && (
            <motion.div
              key={playKey}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.85, delay: entryDelay, ease: [0.22, 1, 0.36, 1] }}
            >
        <GlowCard style={{ padding: '1.1rem 1.25rem' }}>
            {/* Header row */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 20,
                marginBottom: '1.3rem',
                ...sf,
            }}>
                <span style={{ color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: 18, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    Weather
                </span>
                
                <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3 }}>
                    Retail Impact
                </span>
            </div>

            {/* Temperature row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
                {/* Slowly rotating sun */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <SunSvg />
                </motion.div>

                {/* Temperature display — crossfades on change */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <motion.span
                            key={displayTemp}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            style={{ color: '#fff', fontWeight: 700, fontSize: 52, lineHeight: 1, letterSpacing: '-0.04em', ...sf }}
                        >
                            {displayTemp}
                        </motion.span>
                        <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500, fontSize: 22, marginTop: 4, ...sf }}>°</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 700, fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', marginTop: 4, ...sf }}>
                        Ambient Temp
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: '0.85rem' }} />

            {/* Data rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Row 1: Foot traffic correlation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.13em', ...sf }}>
                        Foot Traffic 
                    </span>
                    <span style={{ color: '#2dd4bf', fontWeight: 800, fontSize: 11, letterSpacing: '0.06em', filter: 'drop-shadow(0 0 6px rgba(45,212,191,0.4))', ...sf }}>
                        HIGH ↑
                    </span>
                </div>
                {/* Row 2: Optimal window */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.13em', ...sf }}>
                        Key Category
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', ...sf }}>
                        Beverages
                    </span>
                </div>
            </div>
        </GlowCard>
            </motion.div>
          )}
        </AnimatePresence>
    );
}
