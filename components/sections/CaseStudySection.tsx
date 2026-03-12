'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import CardSwap, { Card, type CardSwapHandle } from '@/components/ui/CardSwap';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────
   Case study data
   Card images: public/casestudy/case-1.jpg etc.
───────────────────────────────────────────────────────── */
const CASES = [
    {
        id: '01',
        tag: 'Coffee / Retail',
        tagColor: '#008a89',
        glowColor: 'rgba(0,138,137,0.22)',
        title: 'Market Expansion for a leading coffee chain',
        body: 'The coffee chain saw real demand at micro-market level with Digital Atlas — identifying whitespace, reducing cannibalization, and prioritizing high-yield catchments.',
        metrics: [
            { value: '+23%', label: 'more viable zones' },
            { value: '+15%', label: 'revenue uplift' },
        ],
        cardGradient: 'linear-gradient(145deg, #07181d 0%, #0a2a2e 45%, #084038 80%, #0d5c4a 100%)',
        cardAccent: '#008a89',
        sparkPoints: '0,24 14,18 26,20 40,10 54,14 68,5 80,2',
        videoSrc: '/assets/casestudy/1.mp4',
    },
    {
        id: '02',
        tag: 'Mobility / Super App',
        tagColor: '#6366f1',
        glowColor: 'rgba(99,102,241,0.18)',
        title: 'Physical Observability for a leading multi-service super app',
        body: 'They turned static place data into live, context-rich intelligence — enriching every POI with pickup/drop points, rush hours, and weather/event effects.',
        metrics: [
            { value: '−15%', label: 'driver wait times' },
            { value: '+12%', label: 'booking conversions' },
        ],
        cardGradient: 'linear-gradient(145deg, #0c0d28 0%, #141747 45%, #0f2060 80%, #0b1a4a 100%)',
        cardAccent: '#818cf8',
        sparkPoints: '0,22 14,16 26,19 40,7 54,11 68,3 80,1',
        videoSrc: '/assets/casestudy/2.mp4',
    },
    {
        id: '03',
        tag: 'FMCG / Field Sales',
        tagColor: '#ea580c',
        glowColor: 'rgba(234,88,12,0.16)',
        title: 'Product recommendations & field-rep enablement',
        body: 'The brand fused its sales data with Digital Atlas real-world signals — demographics, anchor POIs and more — to score SKU potential and deliver ranked, outlet-specific lists for reps.',
        metrics: [
            { value: '+12%', label: 'sales uplift' },
            { value: '+11%', label: 'effective recommendations' },
        ],
        cardGradient: 'linear-gradient(145deg, #1a0b05 0%, #2e1205 45%, #3d2210 80%, #2a1a08 100%)',
        cardAccent: '#fb923c',
        sparkPoints: '0,20 14,15 26,17 40,8 54,12 68,4 80,2',
        videoSrc: '/assets/casestudy/3.mp4',
    },
];

/* ─────────────────────────────────────────────────────────
   Sparkline — top-right of each card
───────────────────────────────────────────────────────── */
function Sparkline({ points, color }: { points: string; color: string }) {
    return (
        <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
            <polyline
                points={points}
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.8}
            />
            <circle cx={parseFloat(points.split(' ').pop()!.split(',')[0])} cy={parseFloat(points.split(' ').pop()!.split(',')[1])} r="3" fill={color} />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────────
   Nav arrow button
───────────────────────────────────────────────────────── */
function NavBtn({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
    const btnRef = useRef<HTMLButtonElement>(null);
    return (
        <button
            ref={btnRef}
            onClick={onClick}
            aria-label={dir === 'prev' ? 'Previous case study' : 'Next case study'}
            onMouseEnter={() => gsap.to(btnRef.current, { scale: 1.1, duration: 0.2, ease: 'power2.out' })}
            onMouseLeave={() => gsap.to(btnRef.current, { scale: 1, duration: 0.25, ease: 'power2.out' })}
            onMouseDown={() => gsap.to(btnRef.current, { scale: 0.92, duration: 0.1 })}
            onMouseUp={() => gsap.to(btnRef.current, { scale: 1.02, duration: 0.2, ease: 'power2.out' })}
            style={{
                width: '46px', height: '46px',
                borderRadius: '999px',
                border: '1px solid rgba(0,0,0,0.16)',
                background: 'linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0.06))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: '#111',
                fontSize: '0.9rem',
                boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
            }}
        >
            <svg
                width="15"
                height="15"
                viewBox="0 0 20 20"
                aria-hidden="true"
                style={{ transform: dir === 'prev' ? 'scaleX(-1)' : undefined }}
            >
                <path
                    d="M5 10h9M10 5l4 5-4 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}

/* ─────────────────────────────────────────────────────────
   Main section
───────────────────────────────────────────────────────── */
export default function CaseStudySection() {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const cardSwapRef = useRef<CardSwapHandle>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const cs = CASES[activeIndex];

    /* ── Responsive — detect ≤768 for CardSwap sizing ── */
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)');
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    /* ── Swap callbacks ── */
    const handleFrontChange = useCallback((cardIdx: number) => {
        const el = contentRef.current;
        if (!el) { setActiveIndex(cardIdx); return; }

        // Kill any in-flight tweens so spam-clicking doesn't flicker.
        gsap.killTweensOf(el);

        setActiveIndex(cardIdx);
        gsap.fromTo(
            el,
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' },
        );
    }, []);

    const goNext = useCallback(() => { cardSwapRef.current?.next(); }, []);
    const goPrev = useCallback(() => { cardSwapRef.current?.prev(); }, []);

    /* ── Keyboard navigation ── */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goNext, goPrev]);

    /* ── Lens-style scroll animations for header + panels ── */
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Section wrapper — fades and rises into view
            gsap.from(sectionRef.current, {
                opacity: 0, y: 40,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 90%',
                    end: 'top 68%',
                    scrub: 0.8,
                },
            });

            // Eyebrow slides + slightly scales in
            gsap.from('.cs2-eyebrow', {
                x: -40,
                scale: 0.96,
                opacity: 0,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 78%',
                    end: 'top 52%',
                    scrub: 0.9,
                },
            });

            // Headline: smooth premium sweep (no manual clipPath to avoid flicker)
            gsap.from('.cs2-h2 span', {
                yPercent: 30,
                skewY: 4,
                opacity: 0,
                transformOrigin: 'top left',
                stagger: 0.18,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 72%',
                    end: 'top 38%',
                    scrub: 1.1,
                },
            });

            // Sub-copy rises and tightens tracking as you scroll
            gsap.from('.cs2-sub', {
                y: 48,
                opacity: 0,
                letterSpacing: '0.15em',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    end: 'top 40%',
                    scrub: 0.9,
                },
            });

            // Panels subtly parallax in lens-style as you scroll
            gsap.from('.cs2-left-panel', {
                y: 50,
                opacity: 0,
                scrollTrigger: {
                    trigger: '.cs2-grid',
                    start: 'top 80%',
                    end: 'top 40%',
                    scrub: 0.9,
                },
            });
            gsap.from('.cs2-right-panel', {
                y: 60,
                opacity: 0,
                scrollTrigger: {
                    trigger: '.cs2-grid',
                    start: 'top 82%',
                    end: 'top 42%',
                    scrub: 0.9,
                },
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} style={{ background: '#ffffff', position: 'relative', overflow: 'hidden' }}>

            {/* Subtle grid overlay */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
                    backgroundSize: '72px 72px',
                    maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)',
                }}
            />

            {/* ── Header ── */}
            <div className="cs2-header" style={{
                maxWidth: '1320px', margin: '0 auto',
                padding: 'clamp(100px,12vw,160px) clamp(24px,6vw,80px) 0',
            }}>
                <span className="cs2-eyebrow" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '9px',
                    fontFamily: 'var(--font-body)', fontSize: '0.62rem', fontWeight: 700,
                    letterSpacing: '0.22em', textTransform: 'uppercase', color: '#008a89',
                    marginBottom: '28px',
                }}>
                    <span style={{
                        display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%',
                        background: '#008a89', boxShadow: '0 0 10px rgba(0,138,137,0.55)',
                    }} />
                    Case Studies
                </span>

                <h2
                    className="cs2-h2"
                    style={{
                        margin: '0 0 22px',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        letterSpacing: '-0.05em',
                        lineHeight: 0.98,
                        color: '#111111',
                    }}
                >
                    <span style={{
                        display: 'block',
                        fontSize: 'clamp(3rem, 6vw, 5.6rem)',
                    }}>
                        Proof in the real world.
                    </span>
                    <span style={{
                        display: 'block',
                        fontSize: 'clamp(1.8rem, 3.4vw, 2.9rem)',
                        color: 'rgb(153, 153, 153)',
                        letterSpacing: '-0.035em', lineHeight: 1.1,
                        marginTop: '10px',
                    }} className="cs2-subtitle">
                        Digital Atlas intelligence, applied.
                    </span>
                </h2>

                <p className="cs2-sub" style={{
                    fontFamily: 'var(--font-body)', fontSize: 'clamp(0.9rem,1.2vw,1.05rem)',
                    color: '#777', lineHeight: 1.72, maxWidth: '500px',
                    letterSpacing: '-0.01em', marginTop: '24px',
                }}>
                    From whitespace identification to field-rep enablement — three industries, one platform.
                </p>
            </div>

            {/* ── Two-column grid ── */}
            <div className="cs2-grid" style={{
                maxWidth: '1320px', margin: '0 auto',
                padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px) clamp(80px,10vw,120px)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(40px,5vw,80px)',
                alignItems: 'center',
            }}>

                {/* ── Left: Data panel ── */}
                <div className="cs2-left-panel" style={{ position: 'relative' }}>

                    {/* Dim watermark case number */}
                    <div aria-hidden style={{
                        position: 'absolute', top: '-0.15em', left: '-0.06em',
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: 'clamp(9rem,14vw,13rem)', lineHeight: 1,
                        letterSpacing: '-0.06em', color: 'rgba(0,0,0,0.04)',
                        userSelect: 'none', pointerEvents: 'none', zIndex: 0,
                    }}>{cs.id}</div>

                    <div ref={contentRef} style={{ position: 'relative', zIndex: 1 }}>

                        {/* Tag */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px',
                        }}>
                            <div style={{
                                width: '5px', height: '5px', borderRadius: '50%',
                                background: cs.tagColor, flexShrink: 0,
                                boxShadow: `0 0 8px ${cs.glowColor}`,
                            }} />
                            <span style={{
                                fontFamily: 'var(--font-body)', fontSize: '0.6rem', fontWeight: 700,
                                letterSpacing: '0.22em', textTransform: 'uppercase', color: cs.tagColor,
                            }}>{cs.tag}</span>
                        </div>

                        {/* Case title */}
                        <h3 style={{
                            fontFamily: 'var(--font-display)', fontWeight: 700,
                            fontSize: 'clamp(1.7rem,2.4vw,2.3rem)',
                            letterSpacing: '-0.045em', lineHeight: 1.12,
                            color: '#111111', margin: '0 0 20px',
                        }}>{cs.title}</h3>

                        {/* Body */}
                        <p style={{
                            fontFamily: 'var(--font-body)', fontSize: 'clamp(0.88rem,1.1vw,1rem)',
                            color: '#666', lineHeight: 1.76, margin: '0 0 36px',
                            letterSpacing: '-0.01em', maxWidth: '440px',
                        }}>{cs.body}</p>

                        {/* Metrics */}
                        <div style={{
                            display: 'flex', gap: '0', alignItems: 'flex-start',
                            paddingTop: '24px', borderTop: '1px solid #e8e8e8', marginBottom: '40px',
                        }}>
                            {cs.metrics.map((m, mi) => (
                                <div key={mi} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    {mi > 0 && (
                                        <div style={{
                                            width: '1px', alignSelf: 'stretch', margin: '4px 24px 0',
                                            background: 'linear-gradient(to bottom, #e8e8e8, transparent)',
                                            minHeight: '40px',
                                        }} />
                                    )}
                                    <div>
                                        <div style={{
                                            fontFamily: 'var(--font-display)', fontWeight: 700,
                                            fontSize: 'clamp(1.7rem,2.5vw,2.2rem)',
                                            letterSpacing: '-0.04em', lineHeight: 1,
                                            color: cs.tagColor,
                                        }}>{m.value}</div>
                                        <div style={{
                                            fontFamily: 'var(--font-body)', fontSize: '0.62rem',
                                            fontWeight: 600, color: '#999', marginTop: '6px',
                                            letterSpacing: '0.08em', textTransform: 'uppercase',
                                        }}>{m.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Read more */}
                        <Link
                            href="/book-demo"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 600,
                                color: '#111111', textDecoration: 'none', letterSpacing: '-0.01em',
                                position: 'relative', marginBottom: '48px',
                            }}
                            onMouseEnter={e => {
                                const a = e.currentTarget as HTMLAnchorElement;
                                a.style.color = cs.tagColor;
                                (a.querySelector('.cs2-link-line') as HTMLElement | null)!.style.background = cs.tagColor;
                                gsap.to(a.querySelector('.cs2-link-arrow'), { x: 5, duration: 0.22, ease: 'power2.out' });
                            }}
                            onMouseLeave={e => {
                                const a = e.currentTarget as HTMLAnchorElement;
                                a.style.color = '#111111';
                                (a.querySelector('.cs2-link-line') as HTMLElement | null)!.style.background = '#111111';
                                gsap.to(a.querySelector('.cs2-link-arrow'), { x: 0, duration: 0.28, ease: 'power2.out' });
                            }}
                        >
                            <span style={{ transition: 'color 0.2s' }}>Read more</span>
                            <span className="cs2-link-arrow" style={{ display: 'inline-block', transition: 'color 0.2s' }}>→</span>
                            <span className="cs2-link-line" style={{
                                position: 'absolute', bottom: '-3px', left: 0, right: 0,
                                height: '1px', background: '#111111', transition: 'background 0.2s',
                            }} />
                        </Link>

                        {/* Navigation: arrows + dots */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <NavBtn dir="prev" onClick={goPrev} />
                            <NavBtn dir="next" onClick={goNext} />
                            <div style={{ display: 'flex', gap: '7px', marginLeft: '4px' }}>
                                {CASES.map((_, i) => (
                                    <div key={i} style={{
                                        height: '5px', borderRadius: '3px',
                                        background: i === activeIndex ? '#111111' : 'rgba(0,0,0,0.12)',
                                        width: i === activeIndex ? '22px' : '5px',
                                        transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), background 0.25s',
                                    }} />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── Right: CardSwap ── */}
                <div className="cs2-right-panel" style={{
                    position: 'relative', height: isMobile ? 'auto' : '620px',
                }}>
                    <CardSwap
                        ref={cardSwapRef}
                        width={isMobile ? 340 : 650}
                        height={isMobile ? 280 : 500}
                        cardDistance={isMobile ? 32 : 52}
                        verticalDistance={isMobile ? 36 : 58}
                        delay={5000}
                        pauseOnHover
                        onFrontChange={handleFrontChange}
                        skewAmount={4}
                        easing="elastic"
                    >
                        {CASES.map((c, i) => (
                            <Card key={i} style={{ background: c.cardGradient, overflow: 'hidden' }}>
                                {/* Background Video */}
                                {c.videoSrc && (
                                    <video
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            opacity: 0.65, // slightly dimmed to let text pop
                                            pointerEvents: 'none',
                                            mixBlendMode: 'screen', // optional: blends nicely with the gradient
                                            borderRadius: '20px',
                                        }}
                                    >
                                        <source src={c.videoSrc} type="video/mp4" />
                                    </video>
                                )}
                                
                                {/* Grid lines */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                                    backgroundSize: '38px 38px',
                                    pointerEvents: 'none',
                                }} />

                                {/* Diagonal light sweep */}
                                <div style={{
                                    position: 'absolute', top: 0, left: '-60%',
                                    width: '40%', height: '100%',
                                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)',
                                    pointerEvents: 'none',
                                }} />

                                {/* Watermark number */}
                                <div aria-hidden style={{
                                    position: 'absolute', bottom: '-0.1em', right: '-0.04em',
                                    fontFamily: 'var(--font-display)', fontWeight: 700,
                                    fontSize: '10rem', lineHeight: 1, letterSpacing: '-0.06em',
                                    color: 'rgba(255,255,255,0.05)', userSelect: 'none', pointerEvents: 'none',
                                }}>{c.id}</div>

                                {/* Category tag — top left */}
                                <div style={{
                                    position: 'absolute', top: '22px', left: '22px',
                                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '20px', padding: '5px 12px 5px 8px',
                                    backdropFilter: 'blur(8px)',
                                }}>
                                    <div style={{
                                        width: '5px', height: '5px', borderRadius: '50%',
                                        background: c.cardAccent, flexShrink: 0,
                                        boxShadow: `0 0 6px ${c.cardAccent}`,
                                    }} />
                                    <span style={{
                                        fontFamily: 'var(--font-body)', fontSize: '0.58rem',
                                        fontWeight: 700, letterSpacing: '0.16em',
                                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)',
                                    }}>{c.tag}</span>
                                </div>

                                {/* Sparkline — top right */}
                                <div style={{ position: 'absolute', top: '22px', right: '22px' }}>
                                    <Sparkline points={c.sparkPoints} color={c.cardAccent} />
                                </div>

                                {/* Metrics — bottom overlay */}
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    padding: '48px 24px 26px',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.76) 0%, transparent 100%)',
                                    display: 'flex', alignItems: 'flex-end', gap: '0',
                                }}>
                                    {c.metrics.map((m, mi) => (
                                        <div key={mi} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            {mi > 0 && (
                                                <div style={{
                                                    width: '1px', height: '44px', alignSelf: 'center',
                                                    background: 'rgba(255,255,255,0.14)', margin: '0 20px',
                                                }} />
                                            )}
                                            <div>
                                                <div style={{
                                                    fontFamily: 'var(--font-display)', fontWeight: 700,
                                                    fontSize: 'clamp(1.4rem,2vw,1.8rem)', lineHeight: 1,
                                                    letterSpacing: '-0.04em', color: c.cardAccent,
                                                }}>{m.value}</div>
                                                <div style={{
                                                    fontFamily: 'var(--font-body)', fontSize: '0.58rem',
                                                    fontWeight: 600, color: 'rgba(255,255,255,0.5)',
                                                    marginTop: '4px', letterSpacing: '0.1em',
                                                    textTransform: 'uppercase',
                                                }}>{m.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </CardSwap>
                </div>
            </div>

            {/* ── Responsive ── */}
            <style>{`
                @media (max-width: 900px) {
                    .cs2-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .cs2-right-panel {
                        height: 480px !important;
                    }
                }
                @media (max-width: 560px) {
                    .cs2-right-panel {
                        height: 380px !important;
                    }
                    .cs2-h2 span:first-child {
                        white-space: normal !important;
                    }
                }
            `}</style>
        </section>
    );
}
