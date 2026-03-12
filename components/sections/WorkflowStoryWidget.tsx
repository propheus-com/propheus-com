'use client';

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// â”€â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ GlowCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type GlowCardProps = {
    children: React.ReactNode;
    className?: string;
    isActive?: boolean;
    dark?: boolean;
};

const GlowCard = ({ children, className = '', isActive = false, dark = false }: GlowCardProps) => {
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
                backgroundImage: `radial-gradient(400px 400px at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), rgba(13,148,136,${isActive ? '0.08' : '0.03'}), transparent)`,
                backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: `1px solid ${isActive
                    ? (dark ? 'rgba(255,255,255,0.14)' : 'rgba(13,148,136,0.18)')
                    : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
                position: 'relative',
                boxShadow: isActive
                    ? (dark ? '0 8px 64px rgba(0,0,0,0.5), 0 4px 24px rgba(13,148,136,0.1)' : '0 8px 48px rgba(13,148,136,0.14), 0 4px 20px rgba(0,0,0,0.18)')
                    : (dark ? '0 4px 28px rgba(0,0,0,0.4)' : '0 4px 28px rgba(0,0,0,0.14), 0 1px 8px rgba(0,0,0,0.08)'),
                transition: 'border-color 0.6s ease, box-shadow 0.6s ease',
            } as React.CSSProperties}
            className={`rounded-[24px] overflow-hidden ${className}`}
        >
            <div className="relative z-10 w-full h-full">{children}</div>
        </div>
    );
};

// â”€â”€â”€ Data Ingestion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type IngestionItem = { icon: React.ComponentType<{ className?: string }>; label: string };

const DataIngestionSystem = ({ items, active, theme = 'teal', dark = false }: { items: IngestionItem[]; active: boolean; theme?: 'teal' | 'red'; dark?: boolean }) => {
    const isTeal = theme === 'teal';
    const activeColor = isTeal ? '#14b8a6' : '#f43f5e';

    return (
        <div className="relative flex items-center justify-between w-60 shrink-0 h-[160px] z-10">
            <div className="relative h-full w-[120px] z-20">
                {items.map((item, i) => {
                    const Icon = item.icon;
                    const positions = ['top-0', 'top-[60px]', 'top-[120px]'] as const;
                    return (
                        <div
                            key={i}
                            className={`absolute ${positions[i]} w-full h-[40px] flex items-center gap-2.5 px-3 rounded-[10px] border ${dark ? 'bg-[#1e1e20]' : 'bg-white'}`}
                            style={{
                                opacity: active ? 1 : 0.3,
                                transform: 'translateX(0)',
                                transition: `opacity 0.6s cubic-bezier(0,0,0.2,1) ${i * 0.1}s, border-color 0.7s ease, box-shadow 0.7s ease`,
                                borderColor: active ? (dark ? 'rgba(255,255,255,0.12)' : 'rgb(229,231,235)') : (dark ? 'rgba(255,255,255,0.05)' : 'rgb(243,244,246)'),
                                boxShadow: active ? (dark ? '0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)') : (dark ? '0 1px 6px rgba(0,0,0,0.3)' : '0 1px 6px rgba(0,0,0,0.05)'),
                            }}
                        >
                            <div style={{ color: active && isTeal ? '#14b8a6' : active && !isTeal ? '#fb7185' : (dark ? 'rgba(255,255,255,0.2)' : '#e5e7eb'), transition: 'color 0.7s ease' }}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1, color: active ? (dark ? 'rgba(255,255,255,0.85)' : '#1f2937') : (dark ? 'rgba(255,255,255,0.2)' : '#d1d5db'), transition: 'color 0.7s ease' }}>{item.label}</span>
                        </div>
                    );
                })}
            </div>

            <svg className="absolute left-[120px] top-0 w-[120px] h-full pointer-events-none" viewBox="0 0 120 160" preserveAspectRatio="none">
                {[20, 80, 140].map((y, idx) => (
                    <React.Fragment key={idx}>
                        <path d={`M 0 ${y} C 60 ${y}, 60 80, 120 80`} fill="none" stroke={dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} strokeWidth="1" strokeDasharray="3 4" />
                        {active && (
                            <path
                                d={`M 0 ${y} C 60 ${y}, 60 80, 120 80`}
                                fill="none" stroke={activeColor} strokeWidth="2" strokeDasharray="4 6"
                                style={{
                                    animation: `dash-flow-${isTeal ? 'teal' : 'red'} ${isTeal ? 1.2 : 2.2}s linear infinite`,
                                    strokeDashoffset: 0,
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </svg>
        </div>
    );
};

// â”€â”€â”€ Flow Node â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type FlowNodeProps = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle: string;
    active: boolean;
    failed?: boolean;
    theme?: 'teal' | 'red';
    transitionDelay?: number;
    dark?: boolean;
};

const FlowNode = ({ icon: IconComponent, title, subtitle, active, failed = false, theme = 'teal', transitionDelay = 0, dark = false }: FlowNodeProps) => {
    const isTeal = theme === 'teal';

    const iconColor = active && isTeal && !failed ? '#14b8a6'
        : active && failed ? '#f43f5e'
        : active ? (dark ? 'rgba(255,255,255,0.7)' : '#374151')
        : (dark ? 'rgba(255,255,255,0.15)' : '#e5e7eb');
    const iconBorder = active && isTeal && !failed ? 'rgba(20,184,166,0.2)'
        : active && failed ? 'rgba(244,63,94,0.2)'
        : active ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)')
        : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)');
    const titleColor = active && isTeal && !failed ? '#0d9488'
        : active && failed ? '#f43f5e'
        : active ? (dark ? 'rgba(255,255,255,0.88)' : '#111827')
        : (dark ? 'rgba(255,255,255,0.15)' : '#d1d5db');

    return (
        <div
            className={`relative flex flex-col items-center justify-center p-4 rounded-[18px] border w-40 h-[130px] flex-shrink-0 z-10 ${dark ? 'bg-[#1e1e20]' : 'bg-white'}`}
            style={{
                opacity: active ? 1 : 0.32,
                transform: active ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(0)',
                transition: `opacity 0.65s cubic-bezier(0,0,0.2,1) ${transitionDelay}s, transform 0.65s cubic-bezier(0,0,0.2,1) ${transitionDelay}s, border-color 0.6s ease, box-shadow 0.6s ease`,
                borderColor: active ? (dark ? 'rgba(255,255,255,0.12)' : 'rgb(229,231,235)') : (dark ? 'rgba(255,255,255,0.05)' : 'rgb(243,244,246)'),
                boxShadow: active ? (dark ? '0 6px 24px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)' : '0 6px 24px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)') : (dark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.07)'),
            }}
        >
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${dark ? 'bg-[#2a2a2c]' : 'bg-gray-50'}`}
                style={{
                    color: iconColor,
                    borderColor: iconBorder,
                    boxShadow: active && failed ? 'inset 0 0 10px rgba(244,63,94,0.08)' : 'none',
                    transition: 'color 0.7s ease, border-color 0.7s ease, box-shadow 0.7s ease',
                }}
            >
                <div className="w-5 h-5"><IconComponent /></div>
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, textAlign: 'center', color: titleColor, transition: 'color 0.7s ease' }}>
                {title}
            </h4>
            <p style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.04em', textAlign: 'center', marginTop: 6, color: active ? (dark ? 'rgba(255,255,255,0.42)' : '#6b7280') : (dark ? 'rgba(255,255,255,0.15)' : '#d1d5db'), transition: 'color 0.7s ease' }}>
                {subtitle}
            </p>
        </div>
    );
};

// â”€â”€â”€ Data Bus â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DataBus = ({ active, theme = 'teal', transitionDelay = 0, dark = false }: { active: boolean; theme?: 'teal' | 'red'; transitionDelay?: number; dark?: boolean }) => {
    const isTeal = theme === 'teal';
    return (
        <div className="flex-1 h-[2px] relative mx-[-10px] z-0 flex items-center min-w-[30px]">
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <div
                    className="w-full h-full"
                    style={{
                        borderBottom: !isTeal ? `2px dashed ${dark ? 'rgba(255,255,255,0.1)' : 'rgb(209,213,219)'}` : 'none',
                        background: isTeal ? (dark ? 'rgba(255,255,255,0.1)' : 'rgb(229,231,235)') : 'none',
                        borderRadius: isTeal ? '9999px' : '0',
                    }}
                />
            </div>
            <div
                className="absolute inset-0 h-full origin-left rounded-full z-10"
                style={{
                    background: isTeal
                        ? 'linear-gradient(90deg, transparent, #0d9488 60%, #2dd4bf 100%)'
                        : 'linear-gradient(90deg, transparent, rgba(244,63,94,0.8) 100%)',
                    transform: active ? 'scaleX(1)' : 'scaleX(0)',
                    opacity: active ? 1 : 0,
                    transition: `transform 0.9s cubic-bezier(0,0,0.2,1) ${transitionDelay}s, opacity 0.6s ease ${transitionDelay}s`,
                }}
            />
        </div>
    );
};

// â”€â”€â”€ Status Badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const StatusBadge = ({ active, theme = 'teal', label }: { active: boolean; theme?: 'teal' | 'red'; label: string }) => {
    const isTeal = theme === 'teal';
    return (
        <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-colors duration-500
            ${active ? (isTeal ? 'border-teal-500/30 bg-teal-50/50' : 'border-rose-500/30 bg-rose-50/50') : 'border-gray-200 opacity-60'}`}>
            <div className="relative flex items-center justify-center">
                {active && (
                    <div
                        className={`absolute w-1.5 h-1.5 rounded-full ${isTeal ? 'bg-teal-400' : 'bg-rose-500'}`}
                        style={{ animation: 'ping-pulse 2s ease-out infinite' }}
                    />
                )}
                <div className={`w-1.5 h-1.5 rounded-full z-10 ${active ? (isTeal ? 'bg-teal-400' : 'bg-rose-500') : 'bg-white/20'}`} />
            </div>
            <span className={`text-[10px] font-bold tracking-[0.15em] uppercase transition-colors duration-500
                ${active ? (isTeal ? 'text-teal-600' : 'text-rose-500') : 'text-gray-400'}`}>
                {label}
            </span>
        </div>
    );
};

export default function WorkflowStoryWidget({ dark = false }: { dark?: boolean }) {
    const [stage, setStage] = useState(0);
    const rootRef = useRef<HTMLDivElement>(null);

    // Scroll-linked stage progression â€” pinned while animating, driven by Lenis/ScrollTrigger
    // Uses a continuous scrubbable value for buttery scroll feel.
    // scrub: 1.5 adds momentum/inertia; pin distance 2800px allows fine-grained control.
    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;

        // Pin the parent section so the "Old Methods / New Standards" header stays
        // visible during the animation — only the widget div pinning caused the header to scroll away.
        const sectionEl = el.closest('section') ?? el;

        const obj = { value: 0 };
        const tween = gsap.to(obj, {
            value: 9,
            ease: 'none',
            scrollTrigger: {
                trigger: sectionEl,
                start: 'top 80%',
                end: '+=600',
                scrub: 0.4,
                onUpdate(self) {
                    const raw = self.progress * 9;
                    setStage(prev => {
                        const next = Math.round(raw);
                        return next !== prev ? next : prev;
                    });
                },
            },
        });

        return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
        };
    }, []);

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
        <>
            {/* Keyframe injection for dash animations + ping pulse */}
            <style>{`
                @keyframes dash-flow-teal {
                    to { stroke-dashoffset: -40; }
                }
                @keyframes dash-flow-red {
                    to { stroke-dashoffset: -40; }
                }
                @keyframes ping-pulse {
                    0% { transform: scale(1); opacity: 0.4; }
                    80%, 100% { transform: scale(2.5); opacity: 0; }
                }
            `}</style>

            <div ref={rootRef} className="relative w-full max-w-[1280px] mx-auto flex flex-col gap-4" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif", WebkitFontSmoothing: 'antialiased' }}>

                {/* Legacy Track — always active */}
                <GlowCard className="p-5 px-7" isActive dark={dark}>
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                                <h3
                                    className="text-[13px] font-bold tracking-tight"
                                    style={{ color: dark ? 'rgba(255,255,255,0.9)' : '#1f2937' }}
                                >The Old Flow</h3>
                            </div>
                            <span
                                className="text-[11px] tracking-tight font-medium"
                                style={{ color: dark ? 'rgba(255,255,255,0.38)' : '#9ca3af' }}
                            >Reaction-based · Always late</span>
                        </div>
                        <div className="overflow-x-auto no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                        <div style={{ minWidth: '700px' }}>
                            <div className="flex items-center w-full relative h-[160px]">
                                <DataIngestionSystem theme="red" active items={legacyItems} dark={dark} />
                                <FlowNode theme="red" icon={DatabaseIcon} title="Data Dump" subtitle="Cold storage" active transitionDelay={0} dark={dark} />
                                <DataBus theme="red" active transitionDelay={0.02} dark={dark} />
                                <FlowNode theme="red" icon={ProcessIcon} title="Analytics Team" subtitle="Interpretation lag" active transitionDelay={0.02} dark={dark} />
                                <DataBus theme="red" active transitionDelay={0.02} dark={dark} />
                                <FlowNode theme="red" icon={DelayIcon} title="Late Recommendations" subtitle="Market gap" active transitionDelay={0.1} dark={dark} />
                                <DataBus theme="red" active transitionDelay={0.02} dark={dark} />
                                <FlowNode theme="red" icon={FailIcon} title="Lost Opportunity" subtitle="Action window closed" active failed transitionDelay={0.02} dark={dark} />
                            </div>
                        </div>
                        </div>
                    </div>
                </GlowCard>

                {/* VS Divider — always visible */}
                <div className="flex items-center gap-3 px-2">
                    <div className="flex-1 h-px" style={{ background: dark ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)' : 'linear-gradient(to right, transparent, #e5e7eb, transparent)' }} />
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: '50%',
                        background: dark ? '#1a1a1a' : 'white',
                        border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        boxShadow: dark ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
                        fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
                        color: dark ? 'rgba(255,255,255,0.5)' : '#6b7280',
                    }}>VS</div>
                    <div className="flex-1 h-px" style={{ background: dark ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)' : 'linear-gradient(to right, transparent, #e5e7eb, transparent)' }} />
                </div>

                {/* Propheus Track — always active */}
                <GlowCard className="p-8 py-10" isActive dark={dark}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <h3
                                className="text-[36px] font-extrabold tracking-tight"
                                style={{
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundImage: dark
                                        ? 'linear-gradient(to right, #ffffff 0%, #14b8a6 100%)'
                                        : 'linear-gradient(to right, #111827 0%, #14b8a6 100%)',
                                    backgroundClip: 'text',
                                }}
                            >
                                Your Superpower
                            </h3>
                            <span
                                className="text-[14px] tracking-tight font-medium self-end mb-1.5"
                                style={{ color: dark ? 'rgba(255,255,255,0.38)' : '#9ca3af' }}
                            >— Propheus</span>
                        </div>
                        <span
                            className="text-[11px] tracking-tight font-medium"
                            style={{ color: dark ? 'rgba(255,255,255,0.38)' : '#9ca3af' }}
                        >Real-time · AI-driven</span>
                    </div>
                    <div className="overflow-x-auto no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div style={{ minWidth: '800px' }}>
                        <div className="flex items-center w-full relative h-[160px]">
                            <DataIngestionSystem theme="teal" active items={prophItems} dark={dark} />
                            <FlowNode theme="teal" icon={AiEngineIcon} title="AI Engine" subtitle="Real-time logic" active transitionDelay={0} dark={dark} />
                            <DataBus theme="teal" active transitionDelay={0.02} dark={dark} />
                            <FlowNode theme="teal" icon={PriorityIcon} title="Recommendations" subtitle="Impact by priority" active transitionDelay={0.02} dark={dark} />
                            <DataBus theme="teal" active transitionDelay={0.02} dark={dark} />
                            <FlowNode theme="teal" icon={CheckCircleIcon} title="Action Executed" subtitle="Direct automation" active transitionDelay={0.02} dark={dark} />
                        </div>
                    </div>
                    </div>
                </GlowCard>

            </div>
        </>
    );
}
