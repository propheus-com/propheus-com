'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Icons ---
const ChevronLeft = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const ChevronRight = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9 18l6-6-6-6" />
    </svg>
);

const totalSteps = 3;
const stateLabels = ['Satellite View', 'Aerial View', ''];

// Configurable input cooldown (ms) — applies to buttons and keys
const INPUT_COOLDOWN_MS = 500;
// Accumulated delta threshold — how much total scroll delta to trigger one state change.
// Prevents micro-scrolls from trackpad and requires intentional gesture.
const DELTA_THRESHOLD = 100;
// Gesture reset delay (ms) — after this silence window, reset accumulated delta (new gesture).
const GESTURE_RESET_MS = 250;
// Per-action cooldown (ms) — minimum time between scroll-triggered state changes.
// Prevents a single long trackpad gesture from causing multiple transitions.
const STEP_COOLDOWN_MS = 800;

export default function ActivateAgent({ isMobile = false }: { isMobile?: boolean }) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'hidden'>('idle');
    const [step, setStep] = useState(1);
    const [displayStep, setDisplayStep] = useState(1);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Sync refs so event handlers never read stale closures
    const statusRef = useRef(status);
    statusRef.current = status;
    const stepRef = useRef(step);
    stepRef.current = step;
    const lastActionTimeRef = useRef(0);
    const activeStartTimeRef = useRef(0);
    const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const accumulatedDeltaRef = useRef(0);
    const gestureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const queuedDirectionRef = useRef<'next' | 'prev' | null>(null);
    const isTransitioningRef = useRef(false);
    const lastScrollActionRef = useRef(0);

    // --- Spotlight pointer tracking ---
    useEffect(() => {
        const syncPointer = (e: PointerEvent) => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            cardRef.current.style.setProperty('--x', (e.clientX - rect.left).toFixed(2));
            cardRef.current.style.setProperty('--y', (e.clientY - rect.top).toFixed(2));
        };
        window.addEventListener('pointermove', syncPointer);
        return () => window.removeEventListener('pointermove', syncPointer);
    }, []);

    // --- Cleanup ---
    useEffect(() => {
        return () => {
            if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
            if (gestureTimerRef.current) clearTimeout(gestureTimerRef.current);
        };
    }, []);

    // --- Sync with hero state changes ---
    useEffect(() => {
        const onStateChange = (e: Event) => {
            const { state } = (e as CustomEvent).detail;
            if (state === 0) {
                setStatus('idle'); setStep(1); setDisplayStep(1);
                setDirection('forward'); setIsTransitioning(false);
                // Clear scroll queue so momentum doesn't chain transitions
                queuedDirectionRef.current = null;
                accumulatedDeltaRef.current = 0;
            } else if (state >= 1 && state <= 3) {
                setStep(state);
                setDisplayStep(state);
                setIsTransitioning(false);
                isTransitioningRef.current = false;
                if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
                // Clear scroll queue and enforce cooldown so each state
                // requires a fresh, intentional scroll gesture
                queuedDirectionRef.current = null;
                accumulatedDeltaRef.current = 0;
                lastScrollActionRef.current = Date.now();
                if (statusRef.current === 'hidden') {
                    // Returning from Lenis — fade back in
                    setStatus('active');
                } else {
                    setStatus(prev => (prev === 'loading') ? prev : 'active');
                }
            }
        };
        // Listen for Lenis scroll-back (engine re-enters state 3)
        const onReenter = () => {
            setStatus('active');
            setStep(3);
            setDisplayStep(3);
            setIsTransitioning(false);
            isTransitioningRef.current = false;
            queuedDirectionRef.current = null;
            accumulatedDeltaRef.current = 0;
            lastScrollActionRef.current = Date.now();
        };
        window.addEventListener('propheus:statechange', onStateChange);
        window.addEventListener('propheus:agent-reenter', onReenter);
        return () => {
            window.removeEventListener('propheus:statechange', onStateChange);
            window.removeEventListener('propheus:agent-reenter', onReenter);
        };
    }, []);

    // --- Hide on force-exit (navbar curtain navigation) ---
    useEffect(() => {
        const onForceExit = () => {
            setStatus('hidden');
            statusRef.current = 'hidden';
        };
        window.addEventListener('propheus:force-exit', onForceExit);
        return () => window.removeEventListener('propheus:force-exit', onForceExit);
    }, []);

    // --- Actions ---
    const handleLaunch = useCallback(() => {
        if (statusRef.current !== 'idle') return;
        statusRef.current = 'loading';
        setStatus('loading');
        window.dispatchEvent(new CustomEvent('propheus:launch'));
        setTimeout(() => {
            activeStartTimeRef.current = Date.now();
            setStatus(prev => (prev === 'loading' ? 'active' : prev));
        }, 1000);
    }, []);

    const handleStepChange = useCallback((dir: 'next' | 'prev') => {
        const now = Date.now();
        if (now - lastActionTimeRef.current < INPUT_COOLDOWN_MS) return;
        lastActionTimeRef.current = now;

        const currentStep = stepRef.current;
        const nextStep = dir === 'next' ? currentStep + 1 : currentStep - 1;

        // Going back from step 1 → return to idle (state 0)
        if (nextStep < 1) {
            window.dispatchEvent(new CustomEvent('propheus:reverse'));
            return;
        }

        // At step 3, clicking "next" → auto-scroll Lenis and hide
        if (nextStep > totalSteps) {
            setStatus('hidden');
            statusRef.current = 'hidden';
            window.dispatchEvent(new CustomEvent('propheus:exit-agent'));
            return;
        }

        // Optimistically update step + displayStep immediately
        setDirection(dir === 'next' ? 'forward' : 'backward');
        setStep(nextStep);
        stepRef.current = nextStep;

        setIsTransitioning(true);
        isTransitioningRef.current = true;
        setDisplayStep(nextStep);
        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
        // Safety-only fallback. The real sync point is propheus:statechange from
        // PropheusExperience.finalizeTransition(), which fires isTransitioning=false
        // at the exact moment the animation completes. Canvas transitions take ~2.3s,
        // so this timer must be LONGER than any real transition to avoid premature
        // queue-firing that would skip states.
        transitionTimerRef.current = setTimeout(() => {
            setIsTransitioning(false);
            isTransitioningRef.current = false;
        }, 5000);

        window.dispatchEvent(new CustomEvent(dir === 'next' ? 'propheus:advance' : 'propheus:reverse'));
    }, []);

    // --- Scroll down / right arrow = ACTIVATE (idle) ---
    useEffect(() => {
        if (status !== 'idle') return;
        const onWheel = (e: WheelEvent) => { if (e.deltaY > 0) handleLaunch(); };
        const onKeydown = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); handleLaunch(); }
        };
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('keydown', onKeydown);
        return () => { window.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKeydown); };
    }, [status, handleLaunch]);

    // --- Scroll = nav (active) — delta-accumulator + queued-intent ---
    // Accumulates wheel delta until DELTA_THRESHOLD is crossed → triggers one state change.
    // If a transition is in-progress, queues one pending intent (max 1) so spam scroll
    // progresses through states instead of getting stuck.
    // Uses refs for isTransitioning to avoid re-running the effect (which would wipe queue).
    useEffect(() => {
        if (status !== 'active') return;
        accumulatedDeltaRef.current = 0;

        const onWheel = (e: WheelEvent) => {
            // Reset gesture timer — after silence, accumulated delta resets
            if (gestureTimerRef.current) clearTimeout(gestureTimerRef.current);
            gestureTimerRef.current = setTimeout(() => {
                accumulatedDeltaRef.current = 0;
            }, GESTURE_RESET_MS);

            // Guard against immediate scroll right after becoming active
            if (Date.now() - activeStartTimeRef.current < INPUT_COOLDOWN_MS) return;

            // Per-action cooldown: don't fire again too soon after last scroll action
            if (Date.now() - lastScrollActionRef.current < STEP_COOLDOWN_MS) {
                // But still allow queueing during the cooldown if transitioning
                // Accumulate delta so when cooldown expires, a queued intent is ready
                accumulatedDeltaRef.current += e.deltaY;
                if (Math.abs(accumulatedDeltaRef.current) >= DELTA_THRESHOLD && isTransitioningRef.current) {
                    const dir: 'next' | 'prev' = accumulatedDeltaRef.current > 0 ? 'next' : 'prev';
                    queuedDirectionRef.current = dir;
                    accumulatedDeltaRef.current = 0;
                }
                return;
            }

            // Accumulate delta with direction sign
            accumulatedDeltaRef.current += e.deltaY;

            // Check if threshold is crossed
            if (Math.abs(accumulatedDeltaRef.current) >= DELTA_THRESHOLD) {
                const dir: 'next' | 'prev' = accumulatedDeltaRef.current > 0 ? 'next' : 'prev';
                accumulatedDeltaRef.current = 0; // reset for next gesture

                if (isTransitioningRef.current) {
                    // Queue intent — will fire when current transition ends
                    queuedDirectionRef.current = dir;
                } else {
                    lastScrollActionRef.current = Date.now();
                    handleStepChange(dir);
                }
            }
        };

        window.addEventListener('wheel', onWheel, { passive: true });
        return () => {
            window.removeEventListener('wheel', onWheel);
            if (gestureTimerRef.current) {
                clearTimeout(gestureTimerRef.current);
                gestureTimerRef.current = null;
            }
        };
    }, [status, handleStepChange]);

    // --- Fire queued scroll intent after transition completes ---
    useEffect(() => {
        if (!isTransitioning && queuedDirectionRef.current && status === 'active') {
            const dir = queuedDirectionRef.current;
            queuedDirectionRef.current = null;
            // Use a short timeout to let the state settle before firing next transition
            const timer = setTimeout(() => {
                lastScrollActionRef.current = Date.now();
                handleStepChange(dir);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isTransitioning, status, handleStepChange]);

    // Don't render when hidden
    if (status === 'hidden') return null;

    return (
        <div className="activate-agent-wrapper select-none" style={{
            bottom: status === 'idle' ? '10%' : '5%',
            transition: 'bottom 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
            <motion.div
                ref={cardRef}
                style={{
                    '--spotlight-size': '320px',
                    '--backdrop': 'rgba(8, 8, 8, 0.97)',
                    backgroundImage: `radial-gradient(var(--spotlight-size) var(--spotlight-size) at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), rgba(45, 212, 191, 0.05), transparent)`,
                    backgroundColor: 'var(--backdrop)',
                } as React.CSSProperties}
                animate={{
                    width: status === 'idle'
                        ? (isMobile ? 300 : 520)
                        : status === 'loading' ? (isMobile ? 56 : 76)
                        : (isMobile ? 280 : 460),
                    height: status === 'idle' ? (isMobile ? 60 : 80) : (isMobile ? 56 : 76),
                    scale: 1,
                    opacity: 1,
                }}
                transition={{
                    type: 'spring', stiffness: 200, damping: 26,
                }}
                className="relative border border-white/10 rounded-full flex items-center justify-center overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,1)]"
            >
                <AnimatePresence mode="wait">

                    {/* IDLE — System Standby */}
                    {status === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            className={`flex items-center justify-between w-full ${isMobile ? 'pl-3 pr-1.5 gap-2' : 'pl-6 pr-2.5 gap-4'}`}
                        >
                            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'} min-w-0`}>
                                <div>
                                    <img
                                        src="/PropheusIcon.webp"
                                        alt="Propheus AI Logo"
                                        aria-hidden="true"
                                        className={`${isMobile ? 'w-7 h-7' : 'w-10 h-10'} object-contain rounded-full`}
                                        style={{ filter: 'drop-shadow(0 0 5px rgba(45,212,191,0.65))' }}
                                    />
                                </div>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className={`text-white/40 ${isMobile ? 'text-[7px]' : 'text-[9px]'} font-black uppercase tracking-[0.28em] leading-none`}>System Standby</span>
                                    <span className={`text-white ${isMobile ? 'text-[13px]' : 'text-[18px]'} font-black tracking-tight leading-none`}>Propheus AI</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLaunch}
                                className={`shrink-0 bg-white hover:bg-white/90 text-black font-black ${isMobile ? 'text-[11px] px-4 h-[46px]' : 'text-[13px] px-7 h-[62px]'} uppercase tracking-[0.06em] rounded-full transition-all duration-200 active:scale-95 shadow-[0_2px_24px_rgba(255,255,255,0.12)]`}
                            >
                                Activate
                            </button>
                        </motion.div>
                    )}

                    {/* LOADING — favicon spin + pulse */}
                    {status === 'loading' && (
                        <motion.div
                            key="loader"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.18 } }}
                            className="flex items-center justify-center w-full h-full"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8], rotate: 720 }}
                                transition={{
                                    rotate: { repeat: Infinity, duration: 2, ease: 'linear' },
                                    scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
                                    opacity: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
                                }}
                            >
                                <img
                                    src="/PropheusIcon.webp"
                                    alt=""
                                    aria-hidden="true"
                                    className="w-10 h-10 object-contain rounded-full"
                                    style={{ filter: 'drop-shadow(0 0 5px rgba(45,212,191,0.65))' }}
                                />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ACTIVE — step navigation */}
                    {status === 'active' && (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className="flex items-center justify-between w-full h-full px-2"
                        >
                            <button
                                onClick={() => handleStepChange('prev')}
                                className={`${isMobile ? 'w-8 h-8' : 'w-11 h-11'} rounded-full flex items-center justify-center transition-all shrink-0 outline-none bg-white active:scale-90 shadow-[0_2px_12px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.25)]`}
                            >
                                <ChevronLeft />
                            </button>

                            <div className={`flex-1 flex flex-col items-center justify-center ${isMobile ? 'px-3' : 'px-8'}`}>
                                <div className="flex gap-3 w-full mb-3.5">
                                    {[1, 2, 3].map((i) => {
                                        const filled = i <= step;
                                        const emptyX = direction === 'backward' ? '100%' : '-100%';
                                        return (
                                            <div key={i} className="flex-1 h-[3px] bg-white/[0.05] rounded-full relative overflow-hidden">
                                                <motion.div
                                                    initial={false}
                                                    animate={{ x: filled ? '0%' : emptyX, opacity: filled ? 1 : 0, backgroundColor: i === step ? '#008a89' : '#006f6e' }}
                                                    transition={{ duration: 0.12, ease: 'easeOut' }}
                                                    className={`absolute inset-0 rounded-full ${i === step ? 'shadow-[0_0_20px_rgba(0,138,137,0.5)]' : ''}`}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-3">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={displayStep}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap block" style={{ color: '#008a89' }}
                                        >
                                            {displayStep === 3 ? 'Scroll to Explore' : `0${displayStep}`}
                                        </motion.span>
                                    </AnimatePresence>
                                    <div className="w-[1px] h-2 bg-white/20" />
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={stateLabels[displayStep - 1]}
                                            initial={{ opacity: 0, x: 5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -5 }}
                                            className="text-white/40 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap block"
                                        >
                                            {stateLabels[displayStep - 1]}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>
                            </div>

                            <button
                                onClick={() => handleStepChange('next')}
                                className={`${isMobile ? 'w-8 h-8' : 'w-11 h-11'} rounded-full flex items-center justify-center transition-all shrink-0 outline-none bg-white active:scale-90 shadow-[0_2px_12px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.25)]`}
                            >
                                <ChevronRight />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute inset-0 pointer-events-none rounded-full border border-white/5" />
            </motion.div>
        </div>
    );
}
