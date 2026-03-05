'use client';

import { useEffect, useRef, useState } from 'react';
import RotatingText from '@/components/ui/RotatingText';

const WORDS = ['INVENTORY', 'STAFFING', 'PROMOTION', 'ASSORTMENT'];

export default function DrivingDecisions() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handler = () => setVisible(true);
        window.addEventListener('propheus:state5', handler);
        return () => window.removeEventListener('propheus:state5', handler);
    }, []);

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 10,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0px)' : 'translateY(40px)',
                transition: 'opacity 1.2s cubic-bezier(0.22,1,0.36,1), transform 1.2s cubic-bezier(0.22,1,0.36,1)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'clamp(10px, 2vw, 24px)',
                    justifyContent: 'center',
                }}
            >
                {/* Fixed: "Driving" */}
                <span
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: 'clamp(2rem, 5.5vw, 5.5rem)',
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        color: '#ffffff',
                        userSelect: 'none',
                        textShadow: '0 2px 40px rgba(0,0,0,0.6)',
                    }}
                >
                    Driving
                </span>

                {/* Rotating middle word */}
                <RotatingText
                    texts={WORDS}
                    splitBy="characters"
                    staggerFrom="last"
                    staggerDuration={0.025}
                    rotationInterval={2200}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-120%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    animatePresenceMode="wait"
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: 'clamp(2rem, 5.5vw, 5.5rem)',
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        color: '#0a0a0a',
                        background: '#ffffff',
                        padding: '0.04em 0.28em 0.08em',
                        borderRadius: '0.2em',
                        overflow: 'hidden',
                        boxShadow:
                            '0 0 40px rgba(255,255,255,0.18), 0 0 80px rgba(255,255,255,0.07)',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                    }}
                    splitLevelClassName="overflow-hidden"
                />

                {/* Fixed: "Decisions" */}
                <span
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: 'clamp(2rem, 5.5vw, 5.5rem)',
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        color: '#ffffff',
                        userSelect: 'none',
                        textShadow: '0 2px 40px rgba(0,0,0,0.6)',
                    }}
                >
                    Decisions
                </span>
            </div>
        </div>
    );
}
