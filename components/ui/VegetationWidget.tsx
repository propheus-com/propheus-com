'use client';

/**
 * VegetationWidget — Satellite Lens v5.0
 *
 * Layout: Circular satellite lens on the left overlaps the right-aligned data
 * panel (panel sits behind, circle z-30 on top, bridge connects them).
 * The signal dot + line are provided externally by the CSS signal-pointer
 * system (sp-vegetation), identical to WeatherWidget.
 *
 * Visibility managed via propheus:state1 / propheus:state1:exit events.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowCard from './GlowCard';

// ─── Constants ────────────────────────────────────────────────────────────────

const CIRCLE_SIZE = 280;   // diameter of the circular lens
const PANEL_OVERLAP = 100;    // how many px the circle overlaps the data panel (reduced so text is visible)
const RADIUS = 110;   // gauge arc radius (SVG viewBox 300 × 300)
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SEGMENT_GAP = 0;     // SVG units of gap between adjacent arcs

const SEGMENTS = [
    { label: 'Vegetation', value: 84, color: '#10b981' },
    { label: 'Sand', value: 10, color: '#eab308' },
    { label: 'Barren', value: 6, color: '#94a3b8' },
] as const;

// Pre-compute per-segment start-rotation offsets
const calculatedSegments = (() => {
    let rot = 0;
    return SEGMENTS.map(seg => {
        const offset = rot + SEGMENT_GAP / 2;
        rot += (seg.value / 100) * 360;
        return { ...seg, rotationOffset: offset };
    });
})();

// ─── Fast exit transition helper ─────────────────────────────────────────────
const fastExit = { duration: 0.35, ease: 'easeIn' as const };

// ─── MetricRow ────────────────────────────────────────────────────────────────

function MetricRow({ label, value, color }: {
    label: string; value: number; color: string; delay?: number;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{
                color: 'rgba(255,255,255,0.2)', fontSize: 8, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 4, lineHeight: 1,
            }}>
                {label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 22, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {value}%
                </span>
                <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: color, boxShadow: `0 0 10px ${color}`, flexShrink: 0,
                }} />
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VegetationWidget() {
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
        const onExit = () => setIsVisible(false);
        window.addEventListener('propheus:state2', onState2);
        window.addEventListener('propheus:state1', onEnter);
        window.addEventListener('propheus:state1:exit', onExit);
        return () => {
            window.removeEventListener('propheus:state2', onState2);
            window.removeEventListener('propheus:state1', onEnter);
            window.removeEventListener('propheus:state1:exit', onExit);
        };
    }, []);

    return (
        <div style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
            WebkitFontSmoothing: 'antialiased',
            userSelect: 'none',
        }}>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        key={playKey}
                        style={{
                            position: 'relative',
                            width: CIRCLE_SIZE,        // wrapper = circle diameter → signal line centres on circle
                            height: CIRCLE_SIZE,
                            overflow: 'visible',
                        }}
                    >
                        {/* ── DATA PANEL — z-20, sits behind circle ── */}
                        <motion.div
                            initial={{ opacity: 0, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, filter: 'blur(10px)', transition: fastExit }}
                            transition={{ duration: 0.85, delay: entryDelay, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                position: 'absolute',
                                // top: '0%',
                                // transform: 'translateY(-10%)',
                                left: PANEL_OVERLAP,   // circle overlaps left portion
                                width: 300,            // wide enough for visible text content
                                zIndex: 20,
                            }}
                        >
                            <GlowCard baseHue={160} style={{ padding: '28px 24px 28px', paddingLeft: CIRCLE_SIZE - PANEL_OVERLAP + 16 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'flex-end' }}>

                                    {/* Header */}
                                    <div style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                                        paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        width: '100%',
                                    }}>
                                        <h3 style={{
                                            color: 'rgba(255,255,255,0.92)', fontWeight: 600, fontSize: 18,
                                            letterSpacing: '-0.03em',
                                            lineHeight: 1, margin: 0,
                                        }}>
                                            Vegetation
                                        </h3>
                                        <p style={{
                                            color: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 800,
                                            textTransform: 'uppercase', letterSpacing: '0.2em',
                                            margin: '6px 0 0',
                                        }}>
                                            index
                                        </p>
                                    </div>

                                    {/* Metric rows */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, width: '100%', alignItems: 'flex-end' }}>
                                        {calculatedSegments.map((seg) => (
                                            <MetricRow
                                                key={seg.label}
                                                label={seg.label}
                                                value={seg.value}
                                                color={seg.color}
                                            />
                                        ))}
                                    </div>

                                </div>
                            </GlowCard>
                        </motion.div>

                        {/* ── SATELLITE LENS — z-30, sits in front of the panel, centred vertically ── */}
                        <motion.div
                            initial={{ opacity: 0, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, filter: 'blur(10px)', transition: fastExit }}
                            transition={{ duration: 0.85, delay: entryDelay }}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: 0,
                                transform: 'translateY(-50%)',
                                width: CIRCLE_SIZE, height: CIRCLE_SIZE,
                                zIndex: 30,
                            }}
                        >
                            <GlowCard isCircular baseHue={160} style={{ width: '100%', height: '100%' }}>
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>

                                    {/* Satellite image — smooth animated zoom / pan */}
                                    <div style={{
                                        position: 'absolute', inset: 22,
                                        borderRadius: '50%', overflow: 'hidden',
                                        background: '#000', zIndex: 0,
                                    }}>
                                        <motion.img
                                            src="/assets/veg.webp"
                                            alt="Satellite Analysis"
                                            animate={{
                                                scale: [1.15, 1.28, 1.2, 1.35, 1.18, 1.15],
                                                x: [0, 12, -6, 8, -10, 0],
                                                y: [0, -8, 10, -5, 6, 0],
                                            }}
                                            transition={{
                                                duration: 22,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                                            }}
                                            style={{
                                                width: '100%', height: '100%',
                                                objectFit: 'cover',
                                                filter: 'brightness(0.72) contrast(1.05)',
                                            }}
                                        />



                                        {/* Atmospheric depth */}
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, rgba(0,0,0,0.6) 100%)',
                                            zIndex: 5, pointerEvents: 'none',
                                        }} />

                                        {/* Optical scan grid */}
                                        <div style={{
                                            position: 'absolute', inset: 0, zIndex: 6,
                                            opacity: 0.08,
                                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                            backgroundSize: '18px 18px',
                                            pointerEvents: 'none',
                                        }} />
                                    </div>

                                    {/* Gauge ring SVG — rotated -90° so arcs start at 12 o'clock */}
                                    <svg
                                        style={{
                                            position: 'absolute', inset: 0,
                                            width: '100%', height: '100%',
                                            transform: 'rotate(-90deg)',
                                            overflow: 'visible', zIndex: 30,
                                            pointerEvents: 'none',
                                        }}
                                        viewBox="0 0 300 300"
                                    >
                                        <circle cx="150" cy="150" r={RADIUS}
                                            stroke="rgba(255,255,255,0.06)"
                                            strokeWidth="18" fill="none" />

                                        {calculatedSegments.map((seg, i) => {
                                            const dashLength = Math.max(0, (seg.value / 100) * CIRCUMFERENCE - SEGMENT_GAP);
                                            const dashOffset = CIRCUMFERENCE - dashLength;
                                            return (
                                                <motion.circle
                                                    key={seg.label}
                                                    cx="150" cy="150" r={RADIUS}
                                                    stroke={seg.color} strokeWidth="18" fill="none"
                                                    strokeDasharray={CIRCUMFERENCE}
                                                    initial={{ strokeDashoffset: CIRCUMFERENCE }}
                                                    animate={{ strokeDashoffset: dashOffset }}
                                                    exit={{ strokeDashoffset: CIRCUMFERENCE, transition: fastExit }}
                                                    transition={{
                                                        duration: 2.5,
                                                        ease: [0.16, 1, 0.3, 1],
                                                        delay: entryDelay + 0.5 + i * 0.1,
                                                    }}
                                                    style={{
                                                        transform: `rotate(${seg.rotationOffset}deg)`,
                                                        transformOrigin: '50% 50%',
                                                    }}
                                                    strokeLinecap="round"
                                                />
                                            );
                                        })}
                                    </svg>

                                </div>
                            </GlowCard>
                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
