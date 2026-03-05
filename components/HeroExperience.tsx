'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PropheusExperience } from '@/lib/PropheusExperience';
import WeatherWidget from '@/components/ui/WeatherWidget';
import SentimentPieChart from '@/components/ui/SentimentPieChart';
import ThoughtBubble from '@/components/ui/ThoughtBubble';
import TrafficFlowChart from '@/components/ui/TrafficFlowChart';
import FootfallCard from '@/components/ui/FootfallCard';
import PlacesCard from '@/components/ui/PlacesCard';
import CompetitorCard from '@/components/ui/CompetitorCard';
import PromoWatchCard from '@/components/ui/PromoWatchCard';
import RotatingText from '@/components/ui/RotatingText';
import StoreMapMarkers from '@/components/ui/StoreMapMarkers';
import DemographicsWidgetOverlay from '@/components/ui/DemographicsWidget';

const DRIVING_WORDS = ['INVENTORY', 'STAFFING', 'PROMOTION', 'ASSORTMENT'];

// Inlined here to avoid Next.js client-manifest cross-directory import issues
function DrivingDecisionsOverlay() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const show = () => setVisible(true);
        const hide = () => setVisible(false);
        window.addEventListener('propheus:state6', show);
        window.addEventListener('propheus:state6:exit', hide);
        return () => {
            window.removeEventListener('propheus:state6', show);
            window.removeEventListener('propheus:state6:exit', hide);
        };
    }, []);

    return (
        <div
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
                    flexWrap: 'nowrap',
                    gap: 'clamp(12px, 2vw, 28px)',
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 12px 40px rgba(0,0,0,0.65))',
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: 'clamp(2rem, 5.5vw, 5.5rem)',
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        color: '#ffffff',
                        userSelect: 'none',
                        textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.4)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Signal→
                </span>

                <div
                    className="driving-pill"
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: 'clamp(2rem, 5.5vw, 5.5rem)',
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

                <span
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: 'clamp(2rem, 5.5vw, 5.5rem)',
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        color: '#ffffff',
                        userSelect: 'none',
                        textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.4)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Decisions
                </span>
            </div>
        </div>
    );
}

export default function HeroExperience() {
    const heroRef = useRef<HTMLElement>(null);
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const ambientCanvasRef = useRef<HTMLCanvasElement>(null);
    const loadingBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const heroEl = heroRef.current;
        const canvas = mainCanvasRef.current;
        const ambientCanvas = ambientCanvasRef.current;
        const loadingBar = loadingBarRef.current;

        if (!heroEl || !canvas || !ambientCanvas) return;

        const experience = new PropheusExperience({
            heroEl,
            canvas,
            ambientCanvas,
            loadingBar,
        });

        return () => {
            experience.destroy();
        };
    }, []);

    return (
        <>
            {/* Loading progress bar */}
            <div id="loading-bar" ref={loadingBarRef} aria-hidden="true" />

            {/* Hero — 100vh cinematic scroll machine */}
            <section id="hero-experience" ref={heroRef}>
                <div className="hero-sticky">
                    {/* Background ambient canvas */}
                    <canvas id="ambient-canvas" ref={ambientCanvasRef} aria-hidden="true" />

                    {/* Foreground frame canvas */}
                    <canvas id="main-canvas" ref={mainCanvasRef} aria-hidden="true" />

                    {/* ============================
                        SEGMENT 0 — "Goodbye to Dashboards"
                        Frame 0 → 61 — cinematic intro text
                       ============================ */}
                    <div className="segment-layer" aria-hidden="true">
                        {/* ThoughtBubble owns enter animations; GSAP owns the
                            parent opacity: fade-in at segment0, fade-out at segment1,
                            and fade back in when scrolling back to frame 0. */}
                        <div className="seg0-text">
                            <ThoughtBubble />
                        </div>
                    </div>

                    {/* ============================
                        SEGMENT 1 — Physical World
                        Frame 61 → 90 — Headline + Topo + Weather
                       ============================ */}
                    <div className="segment-layer" aria-hidden="true">
                        {/* Store map markers — ambient city data layer.
                            Activated by propheus:state2 event; renders behind
                            the headline and signal pointer panels (z-index: 0). */}
                        <StoreMapMarkers />

                        <h1 className="seg1-headline">
                            <span className="seg1-line seg1-line-1">what if the Physical World</span>
                            <span className="seg1-line seg1-line-2">
                                was my <span className="seg1-hero-word">Playground?</span>
                            </span>
                        </h1>

                        {/* Places pointer — bottom-left anchored */}
                        <div className="signal-pointer signal-pointer--up sp-topo">
                            <div className="signal-dot sp-topo-dot" />
                            <div className="signal-line sp-topo-line" />
                            <div className="sp-topo-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-topo-content">
                                    <PlacesCard />
                                </div>
                            </div>
                        </div>

                        {/* Demographics — bottom-center, fade-up with state2 */}
                        <DemographicsWidgetOverlay />

                        {/* Weather pointer — top-right anchored */}
                        <div className="signal-pointer signal-pointer--down sp-weather">
                            <div className="signal-dot sp-weather-dot" />
                            <div className="signal-line sp-weather-line" />
                            <div className="sp-weather-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-weather-content">
                                    <WeatherWidget temperature={18} condition="clear" isDay={true} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================
                        SEGMENT 2 — Intelligence Layer
                        Frame 90 → 120 — Sentiment + Competitor + Promo Watch
                       ============================ */}
                    <div className="segment-layer" aria-hidden="true">
                        {/* Sentiment donut pointer */}
                        <div className="signal-pointer signal-pointer--down sp-sentiment">
                            <div className="signal-dot sp-sentiment-dot" />
                            <div className="signal-line sp-sentiment-line" />
                            <div className="sp-sentiment-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-sentiment-content">
                                    <SentimentPieChart />
                                </div>
                            </div>
                        </div>

                        {/* Competitor signal pointer */}
                        <div className="signal-pointer signal-pointer--down sp-competitor">
                            <div className="signal-dot sp-competitor-dot" />
                            <div className="signal-line sp-competitor-line" />
                            <div className="sp-competitor-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-competitor-content">
                                    <CompetitorCard />
                                </div>
                            </div>
                        </div>

                        {/* Promo Watch pointer — right-side */}
                        <div className="signal-pointer signal-pointer--down sp-promo">
                            <div className="signal-dot sp-promo-dot" />
                            <div className="signal-line sp-promo-line" />
                            <div className="sp-promo-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-promo-content">
                                    <PromoWatchCard />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================
                        SEGMENT 3 — Traffic & Footfall
                        Frame 120 → 146 — Traffic + Footfall
                       ============================ */}
                    <div className="segment-layer" aria-hidden="true">
                        <div className="signal-pointer signal-pointer--down sp-traffic">
                            <div className="signal-dot sp-traffic-dot" />
                            <div className="signal-line sp-traffic-line" />
                            <div className="sp-traffic-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-traffic-content">
                                    <TrafficFlowChart />
                                </div>
                            </div>
                        </div>

                        <div className="signal-pointer signal-pointer--down sp-footfall">
                            <div className="signal-dot sp-footfall-dot" />
                            <div className="signal-line sp-footfall-line" />
                            <div className="sp-footfall-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-footfall-content">
                                    <FootfallCard />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================
                        SEGMENT 4 — Digital Atlas Conclusion
                        Frame 146 → 176 — Driving Decisions overlay
                       ============================ */}
                    <div className="segment-layer" aria-hidden="true">
                        <DrivingDecisionsOverlay />
                    </div>
                </div>
            </section>
        </>
    );
}
