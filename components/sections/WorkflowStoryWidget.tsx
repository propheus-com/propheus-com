'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Icons ────────────────────────────────────────────────────────────────────

const DataInputIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 12v10m0 0l-3-3m3 3l3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const ProcessIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const DelayIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const FailIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6m0-6l6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const DatabaseIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M3 5c0 1.66 4.03 3 9 3s9-1.34 9-3M3 5c0-1.66 4.03-3 9-3s9 1.34 9 3m-18 0v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5m-18 7c0 1.66 4.03 3 9 3s9-1.34 9-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const SensorIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5l-4-4-4 4c-2 1.1-3 3-3 5a7 7 0 0 0 7 7z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 18v-4" strokeLinecap="round" /><circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
);
const AiEngineIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M7.757 16.243l-2.121 2.121M16.243 16.243l2.121 2.121M7.757 7.757L5.636 5.636" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" />
    </svg>
);
const PriorityIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
        <path d="M7 6v12" strokeLinecap="round" strokeWidth="2" stroke="currentColor" />
    </svg>
);
const InsightIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 18h6m-5 4h4" strokeLinecap="round" />
    </svg>
);
const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
        <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ─── GlowCard ─────────────────────────────────────────────────────────────────

type GlowCardProps = {
    children: React.ReactNode;
    className?: string;
    isActive?: boolean;
};

const GlowCard = ({ children, className = '', isActive = false }: GlowCardProps) => {
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
            style={{
                backgroundImage: `radial-gradient(450px 450px at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), rgba(255,255,255,${isActive ? '0.04' : '0.01'}), transparent)`,
                backgroundColor: '#000000',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
                position: 'relative',
                transition: 'border-color 1s ease',
            } as React.CSSProperties}
            className={`rounded-[24px] overflow-hidden ${className}`}
        >
            <div className="relative z-10 w-full h-full">{children}</div>
        </div>
    );
};

// ─── Data Ingestion ───────────────────────────────────────────────────────────

type IngestionItem = { icon: React.ComponentType<{ className?: string }>; label: string };

const DataIngestionSystem = ({ items, active, theme = 'teal' }: { items: IngestionItem[]; active: boolean; theme?: 'teal' | 'red' }) => {
    const isTeal = theme === 'teal';
    const activeColor = isTeal ? '#14b8a6' : '#f43f5e';

    return (
        <div className="relative flex items-center justify-between w-60 shrink-0 h-[160px] z-10">
            <div className="relative h-full w-[120px] z-20">
                {items.map((item, i) => {
                    const Icon = item.icon;
                    const positions = ['top-0', 'top-[60px]', 'top-[120px]'] as const;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: active ? 1 : 0, x: active ? 0 : -15 }}
                            transition={{ delay: active ? i * 0.12 : 0, duration: 0.7, ease: [0.22,1,0.36,1] }}
                            className={`absolute ${positions[i]} w-full h-[40px] flex items-center gap-2.5 px-3 rounded-[10px] border bg-[#080808] transition-colors duration-700 ${active ? 'border-white/20' : 'border-white/5'}`}
                        >
                            <div className={`transition-colors duration-700 ${active && isTeal ? 'text-teal-400' : active && !isTeal ? 'text-rose-400' : 'text-white/20'}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] font-semibold tracking-tight leading-none ${active ? 'text-white/90' : 'text-white/40'}`}>{item.label}</span>
                        </motion.div>
                    );
                })}
            </div>

            <svg className="absolute left-[120px] top-0 w-[120px] h-full pointer-events-none" viewBox="0 0 120 160" preserveAspectRatio="none">
                {[20, 80, 140].map((y, idx) => (
                    <React.Fragment key={idx}>
                        <path d={`M 0 ${y} C 60 ${y}, 60 80, 120 80`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 4" />
                        {active && (
                            <motion.path
                                d={`M 0 ${y} C 60 ${y}, 60 80, 120 80`}
                                fill="none" stroke={activeColor} strokeWidth="2" strokeDasharray="4 6"
                                animate={{ strokeDashoffset: [0, -40] }}
                                transition={{ repeat: Infinity, duration: isTeal ? 1.2 : 2.2, ease: 'linear' }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </svg>
        </div>
    );
};

// ─── Flow Node ────────────────────────────────────────────────────────────────

type FlowNodeProps = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle: string;
    active: boolean;
    failed?: boolean;
    theme?: 'teal' | 'red';
};

const FlowNode = ({ icon: IconComponent, title, subtitle, active, failed = false, theme = 'teal' }: FlowNodeProps) => {
    const isTeal = theme === 'teal';
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.97 }}
            transition={{ duration: 0.6 }}
            className={`relative flex flex-col items-center justify-center p-4 rounded-[18px] border transition-colors duration-700 w-40 h-[130px] flex-shrink-0 z-10 bg-black ${active ? 'border-white/20' : 'border-white/5'}`}
            style={{ willChange: 'opacity, transform' }}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-1000 border bg-[#080808]
                ${active && isTeal && !failed ? 'text-teal-400 border-teal-500/20' : ''}
                ${active && failed ? 'text-rose-500 border-rose-500/20 shadow-[inset_0_0_10px_rgba(244,63,94,0.1)]' : ''}
                ${active && !isTeal && !failed ? 'text-white/90 border-white/20' : ''}
                ${!active ? 'text-white/10 border-white/5' : ''}`}
            >
                <div className="w-5 h-5"><IconComponent /></div>
            </div>
            <h4 className={`text-[13px] font-bold tracking-tight text-center leading-tight transition-colors duration-1000
                ${active && isTeal && !failed ? 'text-teal-400' : active && failed ? 'text-rose-500' : active ? 'text-white/90' : 'text-white/30'}`}>
                {title}
            </h4>
            <p className={`text-[9px] font-medium tracking-wide text-center mt-1.5 transition-colors duration-1000 ${active ? 'text-white/50' : 'text-white/20'}`}>
                {subtitle}
            </p>
        </motion.div>
    );
};

// ─── Data Bus ─────────────────────────────────────────────────────────────────

const DataBus = ({ active, duration = 1, delay = 0, theme = 'teal' }: { active: boolean; duration?: number; delay?: number; theme?: 'teal' | 'red' }) => {
    const isTeal = theme === 'teal';
    return (
        <div className="flex-1 h-[2px] relative mx-[-10px] z-0 flex items-center min-w-[30px]">
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div className={`w-full h-full ${!isTeal ? 'border-b-[2px] border-dashed border-white/10' : 'bg-white/5 rounded-full'}`} />
            </div>
            <motion.div
                className="absolute inset-0 h-full origin-left rounded-full z-10"
                style={{
                    background: isTeal
                        ? 'linear-gradient(90deg, transparent, #14b8a6 60%, #fff 100%)'
                        : 'linear-gradient(90deg, transparent, rgba(244,63,94,0.8) 100%)',
                    willChange: 'opacity, transform',
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
                transition={{ duration, delay, ease: isTeal ? 'circOut' : 'linear' }}
            />
        </div>
    );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ active, theme = 'teal', label }: { active: boolean; theme?: 'teal' | 'red'; label: string }) => {
    const isTeal = theme === 'teal';
    return (
        <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border bg-white/[0.02] transition-colors duration-700
            ${active ? (isTeal ? 'border-teal-500/30' : 'border-rose-500/30') : 'border-white/10 opacity-40'}`}>
            <div className="relative flex items-center justify-center">
                {active && (
                    <motion.div
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`absolute w-1.5 h-1.5 rounded-full ${isTeal ? 'bg-teal-400' : 'bg-rose-500'}`}
                    />
                )}
                <div className={`w-1.5 h-1.5 rounded-full z-10 ${active ? (isTeal ? 'bg-teal-400' : 'bg-rose-500') : 'bg-white/20'}`} />
            </div>
            <span className={`text-[10px] font-bold tracking-[0.15em] uppercase transition-colors duration-1000
                ${active ? (isTeal ? 'text-teal-400' : 'text-rose-500') : 'text-white/30'}`}>
                {label}
            </span>
        </div>
    );
};

// ─── Main Widget ──────────────────────────────────────────────────────────────

export default function WorkflowStoryWidget() {
    const [playKey, setPlayKey] = useState(0);
    const [stage, setStage] = useState(0);
    const [started, setStarted] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    // Start only when widget enters the viewport
    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStarted(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.18 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        // First play: require IntersectionObserver to fire.
        // Replays (playKey > 0): always allowed.
        if (!started) return;
        setStage(0);
        const t1 = setTimeout(() => setStage(1), 1800);
        const t2 = setTimeout(() => setStage(2), 3200);
        const t3 = setTimeout(() => setStage(3), 5000);
        const t4 = setTimeout(() => setStage(4), 7000);
        const t5 = setTimeout(() => setStage(5), 8500);
        const t6 = setTimeout(() => setStage(6), 10500);
        const t7 = setTimeout(() => setStage(7), 11500);
        const t8 = setTimeout(() => setStage(8), 12500);
        const t9 = setTimeout(() => setStage(9), 13500);
        return () => { [t1, t2, t3, t4, t5, t6, t7, t8, t9].forEach(clearTimeout); };
    }, [playKey, started]);

    const legacyItems: IngestionItem[] = [
        { icon: DataInputIcon, label: 'Weather' },
        { icon: DelayIcon, label: 'Foot Traffic' },
        { icon: DatabaseIcon, label: 'Consumer Sentiment' },
    ];
    const prophItems: IngestionItem[] = [
        { icon: SensorIcon, label: 'Events' },
        { icon: AiEngineIcon, label: 'Weather' },
        { icon: InsightIcon, label: 'Competitor Promos' },
    ];

    return (
        <div ref={rootRef} className="relative w-full max-w-[1280px] mx-auto flex flex-col gap-6" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>

            {/* Replay button */}
            <div className="flex justify-end px-2">
                <button
                    onClick={() => setPlayKey(prev => prev + 1)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white rounded-full text-[11px] font-bold tracking-widest uppercase transition-all border border-white/10 active:scale-95"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Replay
                </button>
            </div>

            {/* Legacy Track */}
            <GlowCard className="p-8" isActive={stage >= 1 && stage < 6}>
                <div className={`transition-all duration-1000 ${stage >= 6 ? 'opacity-30 scale-[0.99]' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-baseline gap-3">
                            <h3 className="text-[20px] font-bold text-white/90 tracking-tight">The Legacy Flow</h3>
                            <span className="text-[15px] text-white/25 tracking-tight font-medium">— Old ways</span>
                        </div>
                        <StatusBadge active={stage >= 1 && stage < 6} theme="red" label="Legacy State" />
                    </div>
                    <div className="flex items-center w-full relative h-[160px]">
                        <DataIngestionSystem theme="red" active={stage >= 1 && stage < 6} items={legacyItems} />
                        <FlowNode theme="red" icon={DatabaseIcon} title="Data Dump" subtitle="Cold storage" active={stage >= 2} />
                        <DataBus theme="red" active={stage >= 3} duration={1.5} />
                        <FlowNode theme="red" icon={ProcessIcon} title="Analytics Team" subtitle="Interpretation lag" active={stage >= 3} />
                        <DataBus theme="red" active={stage >= 4} duration={1.5} />
                        <FlowNode theme="red" icon={DelayIcon} title="Late Recommendations" subtitle="Market gap" active={stage >= 4} />
                        <DataBus theme="red" active={stage >= 5} duration={1.2} />
                        <FlowNode theme="red" icon={FailIcon} title="Lost Opportunity" subtitle="Action window closed" active={stage >= 5} failed={true} />
                    </div>
                </div>
            </GlowCard>

            {/* Propheus Track */}
            <GlowCard className="p-8" isActive={stage >= 6}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-baseline gap-3">
                        <h3 className={`text-[30px] font-extrabold tracking-tight transition-all duration-1000 ${stage >= 6 ? 'text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-white to-teal-400' : 'text-white/30'}`}
                            style={stage >= 6 ? { backgroundSize: '200% auto', animation: 'gradient-x 5s linear infinite' } : {}}>
                            Your Superpower
                        </h3>
                        <span className="text-[15px] text-white/25 tracking-tight font-medium">— Propheus Retail AI</span>
                    </div>
                    <StatusBadge active={stage >= 6} theme="teal" label="Live Agent Active" />
                </div>
                <div className="flex items-center w-full relative h-[160px]">
                    <DataIngestionSystem theme="teal" active={stage >= 6} items={prophItems} />
                    <FlowNode theme="teal" icon={AiEngineIcon} title="AI Engine" subtitle="Real-time logic" active={stage >= 7} />
                    <DataBus theme="teal" active={stage >= 8} duration={0.8} />
                    <FlowNode theme="teal" icon={PriorityIcon} title="Recommendations" subtitle="Impact by priority" active={stage >= 8} />
                    <DataBus theme="teal" active={stage >= 9} duration={0.8} />
                    <FlowNode theme="teal" icon={CheckCircleIcon} title="Action Executed" subtitle="Direct automation" active={stage >= 9} />
                </div>
            </GlowCard>

            <style>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `}</style>
        </div>
    );
}
