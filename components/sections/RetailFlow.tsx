'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WorkflowStoryWidget from './WorkflowStoryWidget';
import RotatingText from '@/components/ui/RotatingText';

const DRIVING_WORDS = ['INVENTORY', 'STAFFING', 'PROMOTION', 'ASSORTMENT'];

gsap.registerPlugin(ScrollTrigger);

export default function RetailFlow() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const eyebrowRef = useRef<HTMLSpanElement>(null);
    const line1Ref = useRef<HTMLSpanElement>(null);
    const line2Ref = useRef<HTMLSpanElement>(null);
    const subRef = useRef<HTMLParagraphElement>(null);
    const widgetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Single timeline driven by one ScrollTrigger.
            // Widget excluded — its IntersectionObserver owns its sequence.
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 78%',
                    toggleActions: 'play none none none',
                },
            });

            tl.from(eyebrowRef.current, {
                opacity: 0, y: 16, duration: 0.55, ease: 'power3.out',
            })
            .from(line1Ref.current, {
                opacity: 0, y: 30, duration: 0.75, ease: 'power3.out',
            }, '-=0.2')
            .from(line2Ref.current, {
                opacity: 0, y: 30, duration: 0.75, ease: 'power3.out',
            }, '-=0.55')
            .from(subRef.current, {
                opacity: 0, y: 18, duration: 0.55, ease: 'power3.out',
            }, '-=0.45');
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                background: '#000000',
                padding: 'clamp(100px, 12vw, 160px) clamp(20px, 6vw, 80px)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Subtle white grid */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                    pointerEvents: 'none',
                    maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
                }}
            />

            <div style={{ maxWidth: '1320px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

                {/* Section header */}
                <div style={{ marginBottom: 'clamp(64px, 8vw, 100px)', maxWidth: '680px' }}>
                    <span
                        ref={eyebrowRef}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '9px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: '#14b8a6',
                            marginBottom: '24px',
                        }}
                    >
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#14b8a6', boxShadow: '0 0 10px #14b8a6' }} />
                        Signal Intelligence Platform
                    </span>

                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(3rem, 6vw, 5.5rem)', letterSpacing: '-0.04em', lineHeight: 1, color: 'rgba(255,255,255,0.95)', margin: 0 }}>
                        <span ref={line1Ref} style={{ display: 'block' }}>Old methods.</span>
                        <span ref={line2Ref} style={{ display: 'block', color: 'rgba(255,255,255,0.35)' }}>New standards.</span>
                    </h2>

                    <p
                        ref={subRef}
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontWeight: 400,
                            fontSize: 'clamp(1rem, 1.4vw, 1.15rem)',
                            color: 'rgba(255,255,255,0.3)',
                            marginTop: '22px',
                            lineHeight: 1.65,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Two paths. One choice. Your customers will not wait.
                    </p>
                </div>

                {/* Workflow Widget — IntersectionObserver inside the widget
                     controls when its sequence starts; no GSAP wrapper needed */}
                <div ref={widgetRef}>
                    <WorkflowStoryWidget />
                </div>

                {/* Bottom tagline */}
                <div style={{ marginTop: 'clamp(72px, 9vw, 120px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                    <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, transparent, rgba(20,184,166,0.5), transparent)' }} />
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.6rem, 3.5vw, 3rem)', letterSpacing: '-0.04em', lineHeight: 1.1, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                        Not your regular data dump.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.2vw, 18px)', flexWrap: 'nowrap', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.6rem, 3.5vw, 3rem)', letterSpacing: '-0.04em', color: '#14b8a6', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                            Signal→
                        </span>
                        <div
                            className="driving-pill"
                            style={{
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: 'clamp(1.6rem, 3.5vw, 3rem)',
                                letterSpacing: '-0.04em',
                                lineHeight: 1,
                                padding: '0.08em 0.32em 0.12em',
                                borderRadius: '0.22em',
                                userSelect: 'none',
                                flexShrink: 0,
                                pointerEvents: 'none',
                                width: '7em',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <RotatingText
                                texts={DRIVING_WORDS}
                                splitBy="characters"
                                staggerFrom="last"
                                staggerDuration={0.025}
                                rotationInterval={2200}
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '-120%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                                animatePresenceMode="wait"
                                splitLevelClassName="overflow-hidden"
                                style={{
                                    fontFamily: 'inherit',
                                    fontWeight: 'inherit',
                                    fontSize: 'inherit',
                                    letterSpacing: 'inherit',
                                    lineHeight: 'inherit',
                                    color: '#ffffff',
                                    userSelect: 'none',
                                    pointerEvents: 'none',
                                }}
                            />
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.6rem, 3.5vw, 3rem)', letterSpacing: '-0.04em', color: '#14b8a6', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                            Decisions.
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}