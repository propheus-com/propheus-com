'use client';

import { useEffect, useRef } from 'react';
import { PropheusExperience } from '@/lib/PropheusExperience';
import ActivateAgent from '@/components/ActivateAgent';
import { CloudCluster } from '@/components/CloudCluster';
import WeatherWidget from '@/components/ui/WeatherWidget';
import UrbanizationWidget from '@/components/ui/Urbanization';
import { EventsCompetitorSentimentWidget, MobileMarketIntel } from '@/components/ui/MarketIntelligence';
import VegetationWidget from '@/components/ui/VegetationWidget';
import CensusWidget from '@/components/ui/CensusWidget';
import FootfallCard from '@/components/ui/FootfallCard';
import { ParkingAnalyticsCard } from '@/components/ui/Parking Analytisc';
import StoreMapMarkers from '@/components/ui/StoreMapMarkers';
import DemographicsWidgetOverlay from '@/components/ui/DemographicsWidget';
import LenisTextReveal from '@/components/ui/LenisTextReveal';
import useIsMobile from '@/hooks/useIsMobile';

export default function HeroExperience() {
    const heroRef = useRef<HTMLElement>(null);
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const ambientCanvasRef = useRef<HTMLCanvasElement>(null);
    const loadingBarRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

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

                    {/* Clouds layer — above canvas (z-1), below segment pointers (z-3) */}
                    <div className="hero-clouds-layer" aria-hidden="true">
                        <div className="hero-clouds" style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
                            <CloudCluster width={isMobile ? 350 : 700} height={isMobile ? 130 : 260} y="27%" speed={60} delay={-40} scale={isMobile ? 0.7 : 1.1} seed={14} shadowX={25} shadowY={35} zIndex={1} opacity={0.7} />
                            <CloudCluster width={isMobile ? 200 : 400} height={isMobile ? 125 : 250} y="50%" speed={50} delay={-4} scale={isMobile ? 0.8 : 1.3} seed={42} shadowX={20} shadowY={30} zIndex={1} opacity={0.6} />
                            <CloudCluster width={isMobile ? 450 : 900} height={isMobile ? 140 : 280} y="65%" speed={55} delay={-8} scale={isMobile ? 0.6 : 0.9} seed={88} shadowX={15} shadowY={20} zIndex={1} opacity={0.45} />
                        </div>
                    </div>

                    {/* ============================
                        STATE 0 — Headline + Navbar visible (instant)
                       ============================ */}
                    {/* ============================
                        STATE 1 — Physical World (hold frame 0)
                        Topo + Weather + StoreMapMarkers + Demographics come in
                       ============================ */}
                    <div className="segment-layer" aria-hidden="true">
                        <StoreMapMarkers isMobile={isMobile} />

                        <h1 className="seg1-headline">
                            <span className="seg1-line seg1-line-1">The Physical World</span>
                            <span className="seg1-line seg1-line-2">
                                is your <span className="seg1-hero-word">Playground</span>
                            </span>
                        </h1>

                        {/* Vegetation widget — signal-pointer--up so dot sits below, line draws up to the widget */}
                        <div className="signal-pointer signal-pointer--up sp-vegetation">
                            <div className="signal-dot sp-vegetation-dot" />
                            <div className="signal-line sp-vegetation-line" />
                            <div className="sp-vegetation-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-vegetation-content">
                                    <VegetationWidget />
                                </div>
                            </div>
                        </div>

                        {/* Census widget — bottom-right intelligence panel, self-managed visibility */}
                        <div className="census-widget-wrapper" style={{ position: 'absolute', bottom: '4%', right: '8%', zIndex: 3, pointerEvents: 'none' }}>
                            <CensusWidget />
                        </div>

                        {/* Demographics — bottom-center, fade-up with state2 */}
                        <DemographicsWidgetOverlay />

                        {/* Weather pointer — top-right anchored */}
                        <div className="signal-pointer signal-pointer--down sp-weather">
                            <div className="signal-dot sp-weather-dot" />
                            <div className="signal-line sp-weather-line" />
                            <div className="sp-weather-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-weather-content">
                                    <WeatherWidget temperature={18} condition="clear" isDay={true} isMobile={isMobile} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================
                        STATE 2 — Intelligence Layer
                        Urbanization (top-right, own arc) + Market Intelligence (left, horizontal pointer)
                       ============================ */}
                    <div className="segment-layer" aria-hidden="true">
                        {/* Urbanization widget — top-right, no signal pointer (own visual arc) */}
                        <div className="urb-widget-container" aria-hidden="true">
                            <UrbanizationWidget />
                        </div>

                        {/* Market Intelligence — card on left, dot to the right of the card */}
                        <div className="signal-pointer signal-pointer--left sp-marketintel">
                            <div className="signal-dot sp-marketintel-dot" />
                            <div className="signal-line sp-marketintel-line" />
                            <div className="sp-marketintel-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-marketintel-content">
                                    <EventsCompetitorSentimentWidget />
                                </div>
                            </div>
                        </div>

                        {/* Mobile-only compact market intel */}
                        {isMobile && (
                            <div style={{ position: 'absolute', top: '8%', left: '3%', zIndex: 3, pointerEvents: 'none' }}>
                                <MobileMarketIntel />
                            </div>
                        )}
                    </div>

                    {/* ============================
                        STATE 3 — Footfall + Parking Analytics
                        Frame 120 → 240 — signal pointers from bottom upward
                       ============================ */}
                    <div className="segment-layer" aria-hidden="true">
                        {/* Footfall — bottom-right, signal-pointer--up */}
                        <div className="signal-pointer signal-pointer--up sp-footfall">
                            <div className="signal-dot sp-footfall-dot" />
                            <div className="signal-line sp-footfall-line" />
                            <div className="sp-footfall-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-footfall-content">
                                    <FootfallCard isMobile={isMobile} />
                                </div>
                            </div>
                        </div>

                        {/* Parking Analytics — bottom-left, signal-pointer--up */}
                        <div className="signal-pointer signal-pointer--up sp-parking">
                            <div className="signal-dot sp-parking-dot" />
                            <div className="signal-line sp-parking-line" />
                            <div className="sp-parking-panel" style={{ background: 'none', border: 'none', padding: 0, backdropFilter: 'none', boxShadow: 'none' }}>
                                <div className="signal-content sp-parking-content">
                                    <ParkingAnalyticsCard isMobile={isMobile} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================
                        STATE 4 — Pure Canvas Sweep
                        Frame 240 → 360 — no UI components
                       ============================ */}
                    {/* ============================
                        STATE 5 — Lenis Scroll
                        Frame 360 → 480 — canvas shrinks to 1:1 card,
                        hero-to-page transition with content reveal
                       ============================ */}

                    {/* Lenis transition layer — behind canvas (z-2), above ambient (z-0) */}
                    <div className="lenis-transition-layer">
                        <div className="lenis-bg" />
                        <div className="lenis-content">
                            {/* Far-left column (outer — moves faster) */}
                            <div className="parallax-col parallax-col-outer parallax-col-fl">
                                <img className="parallax-img" src="/assets/examples/Store%20.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(95px, 9vw, 145px)', aspectRatio: '5/6' }} />
                                <img className="parallax-img" src="/assets/examples/telecom%20tower%20.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(95px, 9vw, 145px)', aspectRatio: '4/5' }} />
                                <img className="parallax-img" src="/assets/examples/satellite%20imagery%20.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(95px, 9vw, 145px)', aspectRatio: '1/1' }} />
                                <img className="parallax-img" src="/assets/examples/property.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(95px, 9vw, 145px)', aspectRatio: '3/4' }} />
                                <img className="parallax-img" src="/assets/examples/mines%20.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(95px, 9vw, 145px)', aspectRatio: '5/7' }} />
                            </div>
                            {/* Inner-left column (inner — moves slower) */}
                            <div className="parallax-col parallax-col-inner parallax-col-il">
                                <img className="parallax-img" src="/assets/examples/streets.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(130px, 12vw, 195px)', aspectRatio: '4/3' }} />
                                <img className="parallax-img" src="/assets/examples/village.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(130px, 12vw, 195px)', aspectRatio: '3/4' }} />
                                <img className="parallax-img" src="/assets/examples/aerial%20view%20.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(130px, 12vw, 195px)', aspectRatio: '5/4' }} />
                                <img className="parallax-img" src="/assets/examples/forest%20.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(130px, 12vw, 195px)', aspectRatio: '3/4' }} />
                                <img className="parallax-img" src="/assets/examples/Road%20crossing.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(130px, 12vw, 195px)', aspectRatio: '1/1' }} />
                            </div>
                            {/* Inner-right column (inner — moves slower) */}
                            <div className="parallax-col parallax-col-inner parallax-col-ir">
                                <img className="parallax-img" src="/assets/examples/Properties.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(130px, 12vw, 195px)', aspectRatio: '3/4' }} />
                                <img className="parallax-img" src="/assets/examples/aerial%20imagery.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(130px, 12vw, 195px)', aspectRatio: '4/3' }} />
                                <img className="parallax-img" src="/assets/examples/boardroom%20.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(130px, 12vw, 195px)', aspectRatio: '3/4' }} />
                                <img className="parallax-img" src="/assets/examples/Train%20.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(130px, 12vw, 195px)', aspectRatio: '5/4' }} />
                                <img className="parallax-img" src="/assets/examples/manufacturing.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(130px, 12vw, 195px)', aspectRatio: '4/5' }} />
                            </div>
                            {/* Far-right column (outer — moves faster) */}
                            <div className="parallax-col parallax-col-outer parallax-col-fr">
                                <img className="parallax-img" src="/assets/examples/transactions.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(95px, 9vw, 145px)', aspectRatio: '1/1' }} />
                                <img className="parallax-img" src="/assets/examples/nasa-_SFJhRPzJHs-unsplash.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(95px, 9vw, 145px)', aspectRatio: '5/6' }} />
                                <img className="parallax-img" src="/assets/examples/Delivery%20.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(95px, 9vw, 145px)', aspectRatio: '4/5' }} />
                                <img className="parallax-img" src="/assets/examples/road%20.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(95px, 9vw, 145px)', aspectRatio: '3/4' }} />
                                <img className="parallax-img" src="/assets/examples/warehouse%20.webp" alt="" loading="eager" decoding="async" style={{ width: 'clamp(95px, 9vw, 145px)', aspectRatio: '5/7' }} />
                            </div>
                            {/* Centre text block — word-level reveal driven by lenis progress */}
                            <div className="lenis-text-block">
                                <LenisTextReveal
                                    heading="Physical AI"
                                    body="AI Agents for every industry obsessed with ACTING in the real world. Powered by real-world intelligence that gives you the most comprehensive knowledge representation of every place on earth, curated to your unique context. 
"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ActivateAgent — bottom-center hero controller */}
                <ActivateAgent isMobile={isMobile} />
            </section>
        </>
    );
}
