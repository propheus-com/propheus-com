'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Antigravity from '@/components/ui/Antigravity';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    MapPin, Cloud, Users, Zap, TrendingUp,
    BarChart2, Calendar, ShoppingBag, ArrowRight, ChevronDown, ChevronUp,
} from 'lucide-react';
import WorkflowStoryWidget from '@/components/sections/WorkflowStoryWidget';
import RotatingText from '@/components/ui/RotatingText';
import FloatingLines from '@/components/ui/FloatingLines';

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------
   TABS (id lookup only)
--------------------------------------------------------------- */

const TABS = [
    { id: 'retail' },
    { id: 'cpg' },
    { id: 'o2o' },
    { id: 'travel' },
    { id: 'fintech' },
    { id: 'realestate' },
    { id: 'telecom' },
] as const;

const INDUSTRY_TABS = [
    { id: 'retail',      label: 'Retail' },
    { id: 'cpg',         label: 'CPG' },
    { id: 'o2o',         label: 'Online to Offline' },
    { id: 'travel',      label: 'Travel' },
    { id: 'fintech',     label: 'FinTech' },
    { id: 'realestate',  label: 'Real Estate' },
    { id: 'telecom',     label: 'Telecom' },
];

/* ---------------------------------------------------------------
   ANIMATED COUNTER
--------------------------------------------------------------- */

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                let s = 0;
                const step = 16;
                const inc = to / (1400 / step);
                const t = setInterval(() => {
                    s += inc;
                    if (s >= to) { setCount(to); clearInterval(t); }
                    else setCount(Math.round(s));
                }, step);
                obs.disconnect();
            }
        }, { threshold: 0.3 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [to]);

    return <span ref={ref}>{count}{suffix}</span>;
}

/* ---------------------------------------------------------------
   RETAIL DATA
--------------------------------------------------------------- */

const SIGNALS = [
    { label: 'Weather Forecast',    icon: Cloud,        color: '#0ea5e9' },
    { label: 'Foot Traffic',        icon: Users,        color: '#8b5cf6' },
    { label: 'Competitor Promos',   icon: TrendingUp,   color: '#f97316' },
    { label: 'Local Events',        icon: Calendar,     color: '#10b981' },
    { label: 'Demand Spikes',       icon: Zap,          color: '#f59e0b' },
    { label: 'Demographics',        icon: MapPin,       color: '#ef4444' },
    { label: 'Inventory Position',  icon: ShoppingBag,  color: '#6366f1' },
    { label: 'Seasonal Patterns',   icon: BarChart2,    color: '#008a89' },
];

const RETAIL_CAPS = [
    {
        num: '01',
        title: 'Signal Curation',
        body: "Propheus filters through thousands of raw data streams and surfaces only the signals that matter for each store's category, location, and competitive context every week.",
    },
    {
        num: '02',
        title: 'Signals → Actions',
        body: "The engine converts curated signals into clear, prioritized action plans not dashboards. Your managers receive decisions, before the week begins.",
    },
    {
        num: '03',
        title: 'Learning Engine',
        body: "Every action your store teams take and every outcome feeds back into the model. Recommendations become sharper, faster, and more locally attuned every single week.",
    },
];

const PLAN_ITEMS = [
    {
        tag: 'Weather',
        confidence: '94%',
        action: 'Expect 30% footfall uplift Thu\u2013Sat. Pre-position ambient scented candles to front endcap.',
    },
    {
        tag: 'Competitor',
        confidence: '89%',
        action: 'Boots running 25% off fragrance Mon\u2013Fri. Match on selective gift sets only no blanket discount.',
    },
    {
        tag: 'Event',
        confidence: '97%',
        action: 'London Marathon passes 1.2km from store Sunday. Stock recovery drinks and sports nutrition by 8am.',
    },
    {
        tag: 'Demand',
        confidence: '91%',
        action: 'Gift wrap demand up 3x replenish station by Thursday AM based on basket patterns.',
    },
];

/* --- Scroll reveal hook --- */
function useScrollReveal(panelKey: number | string) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const container = ref.current;
        if (!container) return;
        const ctx = gsap.context(() => {
            const els = container.querySelectorAll<HTMLElement>('.s-reveal');
            els.forEach((el) => {
                gsap.from(el, {
                    opacity: 0,
                    y: 64,
                    duration: 1.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        once: true,
                    },
                });
            });
        }, container);
        return () => ctx.revert();
    }, [panelKey]);
    return ref;
}

/* ---------------------------------------------------------------
   RETAIL PANEL � components
--------------------------------------------------------------- */

const DRIVING_WORDS = ['INVENTORY', 'STAFFING', 'PROMOTION', 'ASSORTMENT'];

function DrivingDecisionsBanner({ compact = false }: { compact?: boolean }) {
    const [visible, setVisible] = useState(compact);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (compact) return;
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
        }, { threshold: 0.05 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [compact]);

    if (compact) {
        return (
            <div className="rt-driving-inline">
                <span className="rt-di-word">Driving</span>
                <RotatingText
                    texts={DRIVING_WORDS}
                    splitBy="characters"
                    staggerFrom="last"
                    staggerDuration={0.022}
                    rotationInterval={2200}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-110%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 32, stiffness: 420 }}
                    animatePresenceMode="wait"
                    mainClassName="rt-di-pill"
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 'clamp(0.6rem, 0.9vw, 0.72rem)',
                        letterSpacing: '0.13em',
                        lineHeight: 1,
                        color: '#ffffff',
                        background: '#008a89',
                        padding: '5px 11px 6px',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        userSelect: 'none' as const,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        display: 'inline-flex',
                        justifyContent: 'center',
                        width: '9.5em',
                        flexShrink: 0,
                        textTransform: 'uppercase' as const,
                    }}
                    splitLevelClassName="overflow-hidden"
                />
                <span className="rt-di-word">Decisions</span>
            </div>
        );
    }

    return (
        <div ref={ref} className="rt-driving-banner">
            <div className="rt-driving-glow" aria-hidden="true" />
            <div
                className="rt-driving-content"
                style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(32px)',
                    transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
                    willChange: 'opacity, transform',
                }}
            >
                <span className="rt-driving-word">Driving</span>
                <RotatingText
                    texts={DRIVING_WORDS}
                    splitBy="characters"
                    staggerFrom="last"
                    staggerDuration={0.025}
                    rotationInterval={2200}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '-120%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    animatePresenceMode="wait"
                    mainClassName="rt-pill"
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: 'clamp(2rem, 5.5vw, 5.5rem)',
                        letterSpacing: '-0.04em',
                        lineHeight: 1,
                        color: '#ffffff',
                        padding: '0.04em 0.5em 0.1em',
                        borderRadius: '0.2em',
                        overflow: 'hidden',
                        userSelect: 'none' as const,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        display: 'inline-flex',
                        justifyContent: 'center',
                        minWidth: '8em',
                    }}
                    splitLevelClassName="overflow-hidden"
                />
                <span className="rt-driving-word">Decisions</span>
            </div>
        </div>
    );
}

function RetailPanel({ panelKey }: { panelKey: number }) {
    const panelRef = useScrollReveal(panelKey);
    return (
        <div className="tab-retail" ref={panelRef}>

            {/* -- 1. Intro split -- */}
            <div style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.55 }} aria-hidden="true">
                    <Antigravity
                        count={300}
                        magnetRadius={6}
                        ringRadius={7}
                        waveSpeed={0.4}
                        waveAmplitude={1}
                        particleSize={1.5}
                        lerpSpeed={0.05}
                        color="#008a89"
                        autoAnimate
                        particleVariance={1}
                        rotationSpeed={0}
                        depthFactor={1}
                        pulseSpeed={3}
                        particleShape="capsule"
                        fieldStrength={10}
                    />
                </div>
                <div className="rt-intro s-reveal" style={{ position: 'relative', zIndex: 1 }}>
                <div className="rt-intro-left">
                    <div className="rt-eyebrow">
                        <span className="rt-eyebrow-dot" />
                        Propheus Retail Agent
                    </div>
                    <h2 className="rt-heading">
                        Retail AI that <em>acts,</em>
                        <br />not reports.
                    </h2>
                    <p className="rt-body">
                        Propheus' Retail AI Agent curates and analyzes real-world signals that matter for your stores - local events, competitor promos, weather - and delivers recommended actions for the next 14 days. Not dashboards. Decisions.
                    </p>
                    <DrivingDecisionsBanner compact />
                    <div className="rt-intro-ctas">
                        <Link href="/book-demo" className="rt-hire-cta">
                            Hire the Agent <ArrowRight size={13} strokeWidth={2.5} />
                        </Link>
                        <Link href="/book-demo?tab=report" className="rt-report-cta">
                            Request Your Report <ArrowRight size={13} strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>

                <div className="rt-intro-right">
                    <div className="rt-signal-cloud">
                        {SIGNALS.map((sig, i) => {
                            const Icon = sig.icon;
                            return (
                                <div key={i} className="rt-sig-chip" style={{ animationDelay: `${i * 0.06}s` }}>
                                    <span className="rt-sig-dot" style={{ background: sig.color }} />
                                    <Icon size={11} style={{ color: sig.color }} />
                                    <span>{sig.label}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="rt-sig-count">
                        <span className="rt-sig-count-n">40<sup>+</sup></span>
                        <span className="rt-sig-count-label">real-world signals<br />curated per store, weekly</span>
                    </div>
                </div>
            </div>
            </div>

            {/* -- 2. How it works -- */}
            <div className="rt-how s-reveal">
                <div className="rt-how-inner">
                    <div className="rt-section-label">
                        <span className="rt-sl-line" />
                        How It Works
                    </div>
                    <h3 className="rt-how-h3">Hire Your Propheus <br />Retail AI Agent</h3>
                    <div className="rt-caps-grid">
                        {RETAIL_CAPS.map((cap, i) => (
                            <div key={i} className="rt-cap-card">
                                <div className="rt-cap-num">{cap.num}</div>
                                <h4 className="rt-cap-title">{cap.title}</h4>
                                <p className="rt-cap-body">{cap.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* -- 3b. Workflow widget (dark) -- */}
            <div className="rt-workflow-section s-reveal">
                <div className="rt-workflow-inner">
                    <div className="rt-section-label" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <span className="rt-sl-line" style={{ background: 'rgba(255,255,255,0.2)' }} />
                        Old Methods vs New Standards
                    </div>
                    <h3 className="rt-workflow-h3">
                        What slows every retailer down,<br />
                        and how Propheus eliminates it.
                    </h3>
                    <WorkflowStoryWidget dark />
                </div>
            </div>

            {/* -- 3c. Driving decisions � now inline in hero -- */}

            {/* -- 4. Weekly plan -- */}
            <div className="rt-plan s-reveal">
                <div className="rt-plan-inner">
                    <div className="rt-plan-left">
                        <div className="rt-section-label" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            <span className="rt-sl-line" style={{ background: 'rgba(255,255,255,0.22)' }} />
                            The Output
                        </div>
                        <h3 className="rt-plan-h3">
                            Your manager's plan.<br />Delivered.
                        </h3>
                        <p className="rt-plan-sub">
                            Every Sunday night, each store manager receives a precise action plan
                             not data, but decisions. Prioritized. Contextual. Ready to act on.
                        </p>
                        <div className="rt-plan-stores">
                            <div className="rt-plan-store-row">
                                <span className="rt-plan-store-dot" style={{ background: '#008a89' }} />
                                <span>Westfield Stratford</span>
                                <span className="rt-plan-store-count">4 actions</span>
                            </div>
                            <div className="rt-plan-store-row">
                                <span className="rt-plan-store-dot" style={{ background: '#818cf8' }} />
                                <span>Oxford Street</span>
                                <span className="rt-plan-store-count">3 actions</span>
                            </div>
                            <div className="rt-plan-store-row">
                                <span className="rt-plan-store-dot" style={{ background: '#f59e0b' }} />
                                <span>Canary Wharf</span>
                                <span className="rt-plan-store-count">5 actions</span>
                            </div>
                        </div>
                    </div>

                    <div className="rt-plan-right">
                        <div className="rt-plan-card">
                            <div className="rt-plan-card-head">
                                <span className="rt-plan-live-dot" />
                                <span className="rt-plan-store-name">Westfield Stratford · Week 12</span>
                                <span className="rt-plan-live-badge">Live</span>
                            </div>
                            <div className="rt-plan-items">
                                {PLAN_ITEMS.map((item, i) => (
                                    <div key={i} className="rt-plan-row">
                                        <div className="rt-plan-row-left">
                                            <span className="rt-plan-tag">{item.tag}</span>
                                            <span className="rt-plan-conf">{item.confidence}</span>
                                        </div>
                                        <p className="rt-plan-action">{item.action}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* -- 6. Quote -- */}
            <div className="rt-quote s-reveal">
                <div className="rt-quote-inner">
                    <div className="rt-quote-deco" aria-hidden="true">&ldquo;</div>
                    <blockquote className="rt-quote-text">
                        Your stores are alive with signals most teams never see. Foot traffic patterns,
                        live weather, what competitors are doing next door right now. Propheus reads
                        all of it and gives your managers something they can actually act on.
                    </blockquote>
                </div>
            </div>


        </div>
    );
}

/* ---------------------------------------------------------------
   OTHER INDUSTRY DATA
--------------------------------------------------------------- */

interface OtherIndustry {
    id: string;
    name: string;
    accent: string;
    tagline: string;
    headline: string;
    headlineAccent: string;
    description: string;
    capabilities: { title: string; body: string }[];
    stats: { n: number; suffix: string; desc: string }[];
    quote: string;
}

const OTHER_INDUSTRIES: OtherIndustry[] = [
    {
        id: 'cpg',
        name: 'CPG',
        accent: '#008a89',
        tagline: 'Propheus CPG Agent',
        headline: 'Map demand to the ground,',
        headlineAccent: 'not spreadsheets.',
        description: 'We layer demand signals, place dynamics, and real-time sentiment onto your distribution footprint so you see exactly where your product belongs.',
        capabilities: [
            { title: 'Market Potential',          body: 'Identify look-alike territories to your highest-performing areas using the Digital Atlas, so you can prioritize expansion and unlock new growth opportunities.' },
            { title: 'Retailer Selection',         body: 'Prioritize the right retail partners and doors using the Digital Atlas�to choose where to list first, sequence launches by market, and maximize velocity and ROI.' },
            { title: 'Demand Planning',            body: 'Forecast demand more accurately across retailers, channels, and regions by leveraging the Digital Atlas�to improve S&OP, reduce stockouts, and raise sell-through.' },
            { title: 'Product Recommendation',    body: 'Recommend the right SKUs, pack sizes, and flavors for each retailer, store, and channel by leveraging the Digital Atlas.' },
            { title: 'Promotion Recommendation',  body: 'Recommend the right offers, timing, mechanics, and channels for each retailer and store by leveraging the Digital Atlas.' },
        ],
        stats: [
            { n: 120, suffix: '+', desc: 'Place signals per distribution zone' },
            { n: 92,  suffix: '%', desc: 'Demand prediction accuracy' },
            { n: 5,   suffix: 'x', desc: 'Faster market gap identification' },
        ],
        quote: "Market size is a guess until you map it to the ground. We layer demand signals, place dynamics, and real-time sentiment onto your distribution footprint so you see exactly where your product belongs.",
    },
    {
        id: 'travel',
        name: 'Travel',
        accent: '#008a89',
        tagline: 'Propheus Travel Agent',
        headline: 'Revenue windows close in minutes,',
        headlineAccent: 'not hours.',
        description: 'We connect live venue data, crowd patterns, and local signals so your revenue teams always know which way the market is moving.',
        capabilities: [
            { title: 'Physical Observability',                body: 'View properties and nearby competitors on a live map. Drill into any location for a neighborhood vibe profile.' },
            { title: 'Personalized Discovery & Recommendations', body: 'Surface contextual signals like neighborhood vibe, proximity to experiences for richer, more relevant trip planning.' },
            { title: 'Dynamic Pricing & Bundling',            body: 'AI-driven trip planning: connecting accommodations with nearby experiences, mobility options, and time-aware pricing.' },
        ],
        stats: [
            { n: 200, suffix: '+', desc: 'Live signals per travel hub' },
            { n: 94,  suffix: '%', desc: 'Pricing window detection rate' },
            { n: 8,   suffix: 'x', desc: 'Faster revenue optimization' },
        ],
        quote: "The moment something sells out, pricing windows open and close in minutes. We connect live venue data, crowd patterns, and local signals so your revenue teams always know which way the market is moving.",
    },
    {
        id: 'o2o',
        name: 'O2O',
        accent: '#008a89',
        tagline: 'Propheus O2O Agent',
        headline: 'Every zone has a pulse,',
        headlineAccent: 'read it.',
        description: 'We surface the live signals behind each zone so you can tune pricing, staffing, and supply without waiting on the weekly report.',
        capabilities: [
            { title: 'Physical Observability', body: "View a brand's footprint: zones, restaurants, and stores layered with competitors on a live map." },
            { title: 'Demand Planning',        body: 'Turn real-world signals into actionable plans: staffing rosters by daypart, kitchen prep lists, inventory allocations.' },
            { title: 'Dynamic Pricing',        body: 'Recommend time-and location-aware prices/offers within brand guardrails to lift margin, conversion, and utilization.' },
            { title: 'Product Assortment',     body: 'Localize menus/SKUs and bundles per micro-market, setting core + local items, facings/portion sizes.' },
        ],
        stats: [
            { n: 60, suffix: '+', desc: 'Signals per operational zone' },
            { n: 89, suffix: '%', desc: 'Delivery window accuracy' },
            { n: 4,  suffix: 'x', desc: 'Faster operational response' },
        ],
        quote: "Every zone has its own pulse. Delivery pressure, demand spikes, competitive gaps. We surface the live signals behind each one so you can tune pricing, staffing, and supply without waiting on the weekly report.",
    },
    {
        id: 'fintech',
        name: 'FinTech',
        accent: '#008a89',
        tagline: 'Propheus FinTech Agent',
        headline: 'Real-world intelligence,',
        headlineAccent: 'inside every transaction.',
        description: 'Enrich financial data with live merchant intelligence, location context, and real-world signals to power smarter decisions at every touchpoint.',
        capabilities: [
            { title: 'Transaction Enrichment & Merchant Intelligence', body: 'Enrich transactions with real-time merchant data, improving customer statements and spending analytics.' },
            { title: 'Fraud Detection & Risk Management',             body: 'Proactively detect fraud by cross-referencing transactions with real-time merchant location and status.' },
            { title: 'Merchant Onboarding & Verification',            body: 'Automate merchant onboarding and verification, reducing manual efforts and ensuring compliance.' },
            { title: 'Personalization',                               body: 'Deliver hyper-targeted offers based on merchant categories and customer spending for increased engagement.' },
        ],
        stats: [
            { n: 95, suffix: '%', desc: 'Transaction enrichment accuracy' },
            { n: 80, suffix: '%', desc: 'Fraud detection uplift' },
            { n: 3,  suffix: 'x', desc: 'Faster merchant onboarding' },
        ],
        quote: "Real-world signals transform raw transactions into meaningful context � enabling smarter fraud detection, richer customer experiences, and faster merchant decisions.",
    },
    {
        id: 'realestate',
        name: 'Real Estate',
        accent: '#008a89',
        tagline: 'Propheus Real Estate Agent',
        headline: 'Location intelligence,',
        headlineAccent: 'beyond the postcode.',
        description: 'Score, value, and predict commercial property performance with real-world signals layered onto every site, market, and pipeline.',
        capabilities: [
            { title: 'Site Selection',      body: 'Score locations with footfall/dwell, demographics/income, anchors & transit, safety/noise, zoning, competitor/supply density, and pipeline.' },
            { title: 'Rent Prediction',     body: 'Project future market rents by combining historical rent, economic indicators, and local market conditions with real-world signals.' },
            { title: 'Property Valuation',  body: 'Estimate dynamic value of a commercial property based on indicators like current and future potential.' },
        ],
        stats: [
            { n: 150, suffix: '+', desc: 'Location signals per property scored' },
            { n: 92,  suffix: '%', desc: 'Rent prediction accuracy' },
            { n: 4,   suffix: 'x', desc: 'Faster site selection decisions' },
        ],
        quote: "A postcode tells you where a property is. Real-world signals tell you what it's worth, what it will be worth, and why.",
    },
    {
        id: 'telecom',
        name: 'Telecom',
        accent: '#008a89',
        tagline: 'Propheus Telecom Agent',
        headline: 'Signal intelligence,',
        headlineAccent: 'for the network era.',
        description: 'Layer real-world signals onto retail and network performance to explain behaviour, prioritize expansion, and orchestrate outbound campaigns at scale.',
        capabilities: [
            { title: 'Retail Insights',            body: 'Overlay real-world signals onto retail and network performance to explain why certain stores underperform or spike.' },
            { title: 'Retailer Selection',         body: 'Map current retail channel coverage against demand hotspots to identify opportunities for expansion with the Digital Atlas.' },
            { title: 'Campaign Orchestration',     body: 'Automatically orchestrate outbound campaigns (SMS, push, WhatsApp etc) based on real-world signals and customer context.' },
        ],
        stats: [
            { n: 3,  suffix: 'x', desc: 'Campaign response rate uplift' },
            { n: 88, suffix: '%', desc: 'Retailer expansion accuracy' },
            { n: 40, suffix: '+', desc: 'Real-world signals per zone' },
        ],
        quote: "The networks are everywhere, but signals tell you where the customers are � and what they need, before they ask.",
    },
];

/* ---------------------------------------------------------------
   OTHER INDUSTRY PANEL
--------------------------------------------------------------- */

function OtherPanel({ industry, panelKey }: { industry: OtherIndustry; panelKey: number }) {
    const { name, accent, tagline, headline, headlineAccent, description, capabilities, stats, quote } = industry;
    const panelRef = useScrollReveal(panelKey);
    return (
        <div className="tab-other" ref={panelRef}>

            <div className="ot-hero s-reveal" style={{ '--ot-accent': accent } as React.CSSProperties}>
                <div className="ot-hero-bar" style={{ background: accent }} />
                <div className="ot-hero-inner">
                    <div className="ot-eyebrow" style={{ color: accent }}>
                        <span className="ot-ey-line" style={{ background: accent }} />
                        {tagline}
                    </div>
                    <h2 className="ot-heading">
                        {headline}
                        <br />
                        <em style={{ color: accent }}>{headlineAccent}</em>
                    </h2>
                    <p className="ot-desc">{description}</p>
                    <Link
                        href="/book-demo"
                        className="ot-cta-link"
                        style={{ borderColor: `${accent}50`, color: accent }}
                    >
                        Request Early Access <ArrowRight size={13} />
                    </Link>
                </div>
                <div className="ot-status">
                    <span className="ot-status-dot" style={{ background: accent }} />
                    Agent in Development
                </div>
            </div>

            <div className="ot-caps s-reveal">
                <div className="ot-caps-inner">
                    <div className="ot-section-label" style={{ color: accent }}>
                        <span className="ot-sl-line" style={{ background: accent }} />
                        Capabilities
                    </div>
                    <h3 className="ot-caps-h3">What the {name} Agent<br />will do for your team.</h3>
                    <div className="ot-caps-grid">
                        {capabilities.map((cap, i) => (
                            <div key={i} className="ot-cap-card">
                                <div className="ot-cap-num" style={{ color: `${accent}22` }}>0{i + 1}</div>
                                <h4 className="ot-cap-title">{cap.title}</h4>
                                <p className="ot-cap-body">{cap.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="ot-stats s-reveal">
                {stats.map((s, i) => (
                    <div key={i} className="ot-stat">
                        <div className="ot-stat-n" style={{ color: accent }}>
                            <Counter to={s.n} suffix={s.suffix} />
                        </div>
                        <div className="ot-stat-d">{s.desc}</div>
                    </div>
                ))}
            </div>

            <div className="ot-quote s-reveal">
                <blockquote className="ot-quote-text">{quote}</blockquote>
            </div>


        </div>
    );
}

/* ---------------------------------------------------------------
   CPG PANEL � Distribution Intelligence
   Dark editorial hero + vertical numbered capabilities + teal stats
--------------------------------------------------------------- */
function CPGPanel({ panelKey }: { panelKey: number }) {
    const { tagline, headline, headlineAccent, description, capabilities, stats, quote } = OTHER_INDUSTRIES[0];
    const panelRef = useScrollReveal(panelKey);
    return (
        <div className="cpg-root" ref={panelRef}>
            {/* Hero: dark editorial with distribution network SVG */}
            <div className="cpg-hero s-reveal">
                <div className="cpg-hero-inner">
                    <div className="cpg-eyebrow">
                        <span className="cpg-ey-dot" />
                        {tagline}
                    </div>
                    <h2 className="cpg-heading">
                        {headline}<br />
                        <em>{headlineAccent}</em>
                    </h2>
                    <p className="cpg-desc">{description}</p>
                    <Link href="/book-demo" className="cpg-cta-pill">
                        Request Early Access <ArrowRight size={13} />
                    </Link>
                    <div className="cpg-status">
                        <span className="cpg-status-dot" />
                        Agent in Development
                    </div>
                </div>
                <div className="cpg-network" aria-hidden="true">
                    <svg viewBox="0 0 380 280" fill="none" className="cpg-net-svg">
                        <line x1="190" y1="140" x2="70" y2="70" stroke="#008a89" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="5 5" />
                        <line x1="190" y1="140" x2="310" y2="60" stroke="#008a89" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="5 5" />
                        <line x1="190" y1="140" x2="50" y2="210" stroke="#008a89" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="5 5" />
                        <line x1="190" y1="140" x2="330" y2="230" stroke="#008a89" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="5 5" />
                        <line x1="190" y1="140" x2="190" y2="28" stroke="#008a89" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="5 5" />
                        <line x1="70" y1="70" x2="50" y2="210" stroke="#008a89" strokeWidth="0.5" strokeOpacity="0.12" />
                        <line x1="310" y1="60" x2="330" y2="230" stroke="#008a89" strokeWidth="0.5" strokeOpacity="0.12" />
                        <circle cx="190" cy="140" r="22" fill="rgba(0,138,137,0.1)" stroke="#008a89" strokeWidth="1.5" />
                        <circle cx="190" cy="140" r="10" fill="#008a89" />
                        <circle cx="70" cy="70" r="9" fill="#008a89" fillOpacity="0.65" />
                        <circle cx="310" cy="60" r="7" fill="#008a89" fillOpacity="0.5" />
                        <circle cx="50" cy="210" r="8" fill="#008a89" fillOpacity="0.55" />
                        <circle cx="330" cy="230" r="6" fill="#008a89" fillOpacity="0.4" />
                        <circle cx="190" cy="28" r="10" fill="#008a89" fillOpacity="0.7" />
                        <text x="80" y="64" fontSize="9" fill="rgba(0,196,195,0.8)" fontFamily="var(--font-display)" letterSpacing="0.1em" style={{textTransform:'uppercase'}}>LONDON</text>
                        <text x="316" y="56" fontSize="9" fill="rgba(0,196,195,0.8)" fontFamily="var(--font-display)" letterSpacing="0.1em">MCR</text>
                        <text x="56" y="228" fontSize="9" fill="rgba(0,196,195,0.8)" fontFamily="var(--font-display)" letterSpacing="0.1em">BRISTOL</text>
                        <text x="334" y="246" fontSize="9" fill="rgba(0,196,195,0.8)" fontFamily="var(--font-display)" letterSpacing="0.1em">LEEDS</text>
                        <text x="166" y="20" fontSize="9" fill="rgba(0,196,195,0.8)" fontFamily="var(--font-display)" letterSpacing="0.1em">EDINBURGH</text>
                    </svg>
                    <div className="cpg-net-label">Distribution Network � 5 Zones</div>
                </div>
            </div>

            {/* Capabilities: vertical numbered list */}
            <div className="cpg-caps s-reveal">
                <div className="cpg-caps-inner">
                    <div className="cpg-section-label">
                        <span className="cpg-sl-line" />
                        Capabilities
                    </div>
                    <h3 className="cpg-caps-h3">What the CPG Agent<br />will do for your team.</h3>
                    <div className="cpg-caps-list">
                        {capabilities.map((cap, i) => (
                            <div key={i} className="cpg-cap-row">
                                <div className="cpg-cap-num">0{i + 1}</div>
                                <div className="cpg-cap-divider" />
                                <div className="cpg-cap-body-wrap">
                                    <h4 className="cpg-cap-title">{cap.title}</h4>
                                    <p className="cpg-cap-body">{cap.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="cpg-stats s-reveal">
                {stats.map((s, i) => (
                    <div key={i} className="cpg-stat">
                        <div className="cpg-stat-n"><Counter to={s.n} suffix={s.suffix} /></div>
                        <div className="cpg-stat-d">{s.desc}</div>
                    </div>
                ))}
            </div>

            {/* Quote */}
            <div className="cpg-quote s-reveal">
                <div className="cpg-quote-bar" />
                <blockquote className="cpg-quote-text">{quote}</blockquote>
            </div>

        </div>
    );
}

/* ---------------------------------------------------------------
   TRAVEL PANEL � Live Revenue Intelligence
   Live signal ticker + dark hero + horizontal timeline capabilities
--------------------------------------------------------------- */
const TRAVEL_SIGNALS = [
    { event: 'UEFA Champions League', loc: 'Wembley', impact: '+38% demand surge' },
    { event: 'Bank Holiday Weekend',  loc: 'Nationwide', impact: '+24% pricing window' },
    { event: 'Rugby Six Nations',     loc: 'Twickenham', impact: '+41% hospitality' },
    { event: 'London Marathon 2026',  loc: 'Central London', impact: '+29% zone surge' },
];

function TravelPanel({ panelKey }: { panelKey: number }) {
    const { tagline, headline, headlineAccent, description, capabilities, stats, quote } = OTHER_INDUSTRIES[1];
    const panelRef = useScrollReveal(panelKey);
    const [tickerIdx, setTickerIdx] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setTickerIdx(i => (i + 1) % TRAVEL_SIGNALS.length), 3400);
        return () => clearInterval(t);
    }, []);
    const sig = TRAVEL_SIGNALS[tickerIdx];

    return (
        <div className="tv-root" ref={panelRef}>
            {/* Live signal ticker */}
            <div className="tv-ticker">
                <span className="tv-ticker-live">LIVE</span>
                <span className="tv-ticker-sep" />
                <span className="tv-ticker-event" key={tickerIdx}>{sig.event}</span>
                <span className="tv-ticker-dot" />
                <span className="tv-ticker-loc">{sig.loc}</span>
                <span className="tv-ticker-dot" />
                <span className="tv-ticker-impact">{sig.impact}</span>
            </div>

            {/* Hero: very dark with pricing window bar chart */}
            <div className="tv-hero s-reveal">
                <div className="tv-hero-inner">
                    <div className="tv-eyebrow">
                        <span className="tv-ey-dot" />
                        {tagline}
                    </div>
                    <h2 className="tv-heading">
                        {headline}<br />
                        <em>{headlineAccent}</em>
                    </h2>
                    <p className="tv-desc">{description}</p>
                    <Link href="/book-demo" className="tv-cta-pill">
                        Request Early Access <ArrowRight size={13} />
                    </Link>
                    <div className="tv-status">
                        <span className="tv-status-dot" />
                        Agent in Development
                    </div>
                </div>
                <div className="tv-price-visual" aria-hidden="true">
                    <div className="tv-pw-header">
                        <span className="tv-pw-title">Revenue Windows � 7-Day View</span>
                        <span className="tv-pw-badge">Realtime</span>
                    </div>
                    <div className="tv-pw-bars">
                        {[62, 48, 85, 38, 91, 74, 55].map((h, i) => (
                            <div key={i} className="tv-pw-bar-wrap">
                                <div className="tv-pw-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                            </div>
                        ))}
                    </div>
                    <div className="tv-pw-days">
                        {['M','T','W','T','F','S','S'].map((d, i) => (
                            <span key={i}>{d}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Capabilities: horizontal timeline */}
            <div className="tv-caps s-reveal">
                <div className="tv-caps-inner">
                    <div className="tv-section-label">
                        <span className="tv-sl-line" />
                        Capabilities
                    </div>
                    <h3 className="tv-caps-h3">What the Travel Agent<br />will do for your team.</h3>
                    <div className="tv-caps-steps">
                        {capabilities.map((cap, i) => (
                            <div key={i} className="tv-step">
                                <div className="tv-step-num">{String(i + 1).padStart(2, '0')}</div>
                                <div className="tv-step-line" />
                                <h4 className="tv-step-title">{cap.title}</h4>
                                <p className="tv-step-body">{cap.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="tv-stats s-reveal">
                {stats.map((s, i) => (
                    <div key={i} className="tv-stat">
                        <div className="tv-stat-n"><Counter to={s.n} suffix={s.suffix} /></div>
                        <div className="tv-stat-d">{s.desc}</div>
                    </div>
                ))}
            </div>

            {/* Quote */}
            <div className="tv-quote s-reveal">
                <blockquote className="tv-quote-text">{quote}</blockquote>
            </div>

        </div>
    );
}

/* ---------------------------------------------------------------
   O2O PANEL � Zone Intelligence
   Split hero with pulse zones + icon capability cards + teal accents
--------------------------------------------------------------- */
const O2O_ZONES = [
    { x: 50, y: 38, intensity: 'peak',  label: 'Zone A' },
    { x: 76, y: 62, intensity: 'high',  label: 'Zone B' },
    { x: 24, y: 64, intensity: 'high',  label: 'Zone C' },
    { x: 62, y: 20, intensity: 'med',   label: 'Zone D' },
    { x: 34, y: 48, intensity: 'high',  label: 'Zone E' },
    { x: 82, y: 30, intensity: 'low',   label: 'Zone F' },
];

function O2OPanel({ panelKey }: { panelKey: number }) {
    const { tagline, headline, headlineAccent, description, capabilities, stats, quote } = OTHER_INDUSTRIES[2];
    const panelRef = useScrollReveal(panelKey);
    return (
        <div className="o2o-root" ref={panelRef}>
            {/* Hero: split with animated zone pulse visualization */}
            <div className="o2o-hero s-reveal">
                <div className="o2o-hero-left">
                    <div className="o2o-eyebrow">
                        <span className="o2o-ey-dot" />
                        {tagline}
                    </div>
                    <h2 className="o2o-heading">
                        {headline}<br />
                        <em>{headlineAccent}</em>
                    </h2>
                    <p className="o2o-desc">{description}</p>
                    <Link href="/book-demo" className="o2o-cta-pill">
                        Request Early Access <ArrowRight size={13} />
                    </Link>
                    <div className="o2o-status">
                        <span className="o2o-status-dot" />
                        Agent in Development
                    </div>
                </div>
                <div className="o2o-zone-canvas" aria-hidden="true">
                    <div className="o2o-zone-label-top">Zone Intelligence � Live Pulse</div>
                    {O2O_ZONES.map((zone, i) => (
                        <div
                            key={i}
                            className={`o2o-zone o2o-zone--${zone.intensity}`}
                            style={{ left: `${zone.x}%`, top: `${zone.y}%`, animationDelay: `${i * 0.6}s` }}
                        >
                            <div className="o2o-zone-ring" style={{ animationDelay: `${i * 0.6}s` }} />
                            <div className="o2o-zone-core" />
                            <span className="o2o-zone-lbl">{zone.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Capabilities: icon-badge cards */}
            <div className="o2o-caps s-reveal">
                <div className="o2o-caps-inner">
                    <div className="o2o-section-label">
                        <span className="o2o-sl-line" />
                        Capabilities
                    </div>
                    <h3 className="o2o-caps-h3">What the O2O Agent<br />will do for your team.</h3>
                    <div className="o2o-caps-grid">
                        {capabilities.map((cap, i) => (
                            <div key={i} className="o2o-cap-card">
                                <div className="o2o-cap-badge">0{i + 1}</div>
                                <h4 className="o2o-cap-title">{cap.title}</h4>
                                <p className="o2o-cap-body">{cap.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="o2o-stats s-reveal">
                {stats.map((s, i) => (
                    <div key={i} className="o2o-stat">
                        <div className="o2o-stat-n"><Counter to={s.n} suffix={s.suffix} /></div>
                        <div className="o2o-stat-d">{s.desc}</div>
                    </div>
                ))}
            </div>

            {/* Quote */}
            <div className="o2o-quote s-reveal">
                <blockquote className="o2o-quote-text">{quote}</blockquote>
            </div>

        </div>
    );
}

/* ---------------------------------------------------------------
   PAGE
--------------------------------------------------------------- */

export default function IndustriesPage() {
    const [activeTab, setActiveTab] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const heroHeadRef = useRef<HTMLHeadingElement>(null);
    const heroBadgeRef = useRef<HTMLDivElement>(null);
    const heroSubRef   = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        document.body.classList.add('lenis-revealed');
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const idx = TABS.findIndex(t => t.id === hash);
            if (idx !== -1) setActiveTab(idx);
        }

        // Listen for navbar-driven tab selection (e.g. clicking "RETAIL" in the navbar)
        const handleTabEvent = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.tabId) {
                const idx = TABS.findIndex(t => t.id === detail.tabId);
                if (idx !== -1) {
                    setActiveTab(idx);
                    window.history.replaceState(null, '', `#${detail.tabId}`);
                    setTimeout(() => {
                        const el = document.getElementById('ind2-panels');
                        if (el) {
                            const top = el.getBoundingClientRect().top + window.scrollY - 32;
                            window.scrollTo({ top, behavior: 'smooth' });
                        }
                    }, 100);
                }
            }
        };
        window.addEventListener('propheus:select-industry-tab', handleTabEvent);
        return () => window.removeEventListener('propheus:select-industry-tab', handleTabEvent);
    }, []);

    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > window.innerHeight * 0.6);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ delay: 0.25 });
            if (heroBadgeRef.current)
                tl.from(heroBadgeRef.current, { opacity: 0, y: 14, duration: 0.65, ease: 'power3.out' });
            if (heroHeadRef.current)
                tl.from(heroHeadRef.current.querySelectorAll('.hw'), {
                    opacity: 0, y: 38, stagger: 0.075, duration: 0.8, ease: 'power3.out',
                }, '-=0.2');
            if (heroSubRef.current)
                tl.from(heroSubRef.current, { opacity: 0, y: 16, duration: 0.65, ease: 'power3.out' }, '-=0.35');
        });
        return () => ctx.revert();
    }, []);

    const selectTab = useCallback((idx: number) => {
        setActiveTab(idx);
        window.history.replaceState(null, '', `#${TABS[idx].id}`);
        const el = document.getElementById('ind2-panels');
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY - 32;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }, []);

    const heroWords = 'Physical Intelligence, unified.'.split(' ');

    return (
        <>
            <Navbar />
            <main className="ind2-root">

                {/* HERO */}
                <section className="ind2-hero">
                    <div className="ind2-ag" aria-hidden="true">
                        <Antigravity
                            count={300}
                            magnetRadius={6}
                            ringRadius={7}
                            waveSpeed={0.4}
                            waveAmplitude={1}
                            particleSize={1.5}
                            lerpSpeed={0.05}
                            color="#008a89"
                            autoAnimate
                            particleVariance={1}
                            rotationSpeed={0}
                            depthFactor={1}
                            pulseSpeed={3}
                            particleShape="capsule"
                            fieldStrength={10}
                        />
                    </div>

                    <div className="ind2-hero-body">
                        <div className="ind2-hero-badge" ref={heroBadgeRef}>
                            Propheus Retail Agent
                        </div>

                        <h1 className="ind2-hero-h1" ref={heroHeadRef}>
                            {heroWords.map((w, i) => (
                                <span key={i} className="ind2-hw-wrap">
                                    <span className="hw">{w}</span>
                                </span>
                            ))}
                        </h1>

                        <p className="ind2-hero-sub" ref={heroSubRef}>
                            One platform. Four agents. Every industry context where physical signals
                            drive real decisions from store floors to travel hubs to distribution zones.
                        </p>

                        <button
                            className="ind2-choose-btn"
                            onClick={() => {
                                const el = document.getElementById('ind2-tabs');
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            aria-label="Choose an industry"
                        >
                            <span>Choose an industry</span>
                            <ChevronDown size={15} strokeWidth={2.5} />
                        </button>
                    </div>
                </section>

                {/* TAB BAR � industry selector */}
                <div className="ind2-tabs" id="ind2-tabs">
                    <div className="ind2-tab-inner">
                        {INDUSTRY_TABS.map((tab, idx) => (
                            <button
                                key={tab.id}
                                className={`ind2-tab-btn${activeTab === idx ? ' active' : ''}`}
                                onClick={() => selectTab(idx)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTENT PANELS */}
                <div className="ind2-panels" id="ind2-panels">
                    {activeTab === 0 && <RetailPanel panelKey={0} />}
                    {activeTab === 1 && <CPGPanel panelKey={1} />}
                    {activeTab === 2 && <O2OPanel panelKey={2} />}
                    {activeTab === 3 && <TravelPanel panelKey={3} />}
                    {activeTab === 4 && <OtherPanel industry={OTHER_INDUSTRIES[3]} panelKey={4} />}
                    {activeTab === 5 && <OtherPanel industry={OTHER_INDUSTRIES[4]} panelKey={5} />}
                    {activeTab === 6 && <OtherPanel industry={OTHER_INDUSTRIES[5]} panelKey={6} />}
                </div>

                {/* FOOTER */}
                <footer className="ind2-footer">
                    {/* FloatingLines — interactive, pointer events enabled so mouse moves animate lines */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                        <FloatingLines
                            enabledWaves={['middle']}
                            linesGradient={['#064e3b', '#008a89', '#0d9488', '#10b981', '#2dd4bf']}
                            lineCount={5}
                            lineDistance={22.5}
                            bendRadius={5}
                            bendStrength={-1}
                            interactive={true}
                            parallax={true}
                            mixBlendMode="screen"
                        />
                    </div>

                    {/* CTA block */}
                    <div className="ind2-footer-cta">
                        <p className="ind2-footer-eyebrow">
                            <span className="ind2-footer-dot" />
                            Propheus
                        </p>
                        <h2 className="ind2-footer-h2">Hire your<br /><span style={{ color: '#1cd2b3' }}>Retail AI Agent.</span></h2>
                        <p className="ind2-footer-tagline">The agent that reads your store’s world and tells your managers what to do about it.</p>
                        <div className="ind2-footer-cta-btns">
                            <Link href="/book-demo" className="ind2-footer-cta-primary">Hire the Agent →</Link>
                            <Link href="/book-demo?tab=report" className="ind2-footer-cta-secondary">Request Your Report →</Link>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="ind2-footer-bar">
                        <div className="ind2-footer-brand">
                            <svg width="7" height="7" viewBox="0 0 10 10" fill="currentColor">
                                <rect width="10" height="10" rx="1" />
                            </svg>
                            Propheus
                        </div>
                        <p className="ind2-footer-sub">Physical AI · One platform. Infinite context.</p>
                        <div className="ind2-footer-links">
                            <Link href="/" className="ind2-footer-home">← Home</Link>
                            <Link href="/book-demo?tab=report" className="ind2-footer-demo">Request Your Report →</Link>
                            <Link href="/book-demo" className="ind2-footer-demo">Book a Demo →</Link>
                        </div>
                    </div>
                </footer>

            </main>

            {/* SCROLL TO HERO � sticky bottom right */}
            {showScrollTop && (
                <button
                    className="ind2-scroll-top"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Back to top"
                >
                    <ChevronUp size={18} strokeWidth={2.5} />
                </button>
            )}

            <style>{`
/* --------------------------------------------------------------
   INDUSTRIES v2 � Tab-first, Apple-grade editorial
   Prefix: ind2- | rt- (retail) | ot- (other)
-------------------------------------------------------------- */

.ind2-root {
    background: #ffffff;
    color: #111111;
    font-family: var(--font-body, 'Inter', sans-serif);
    overflow-x: hidden;
}

/* HERO */
.ind2-hero {
    position: relative;
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 140px clamp(24px, 6vw, 80px) 72px;
    overflow: hidden;
    background: #ffffff;
}
.ind2-ag {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 1;
}
.ind2-hero-body {
    position: relative;
    z-index: 1;
    max-width: 720px;
}
.ind2-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 15px;
    background: #111;
    border-radius: 999px;
    font-family: var(--font-display, 'Syne', sans-serif);
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: #fff;
    margin-bottom: 30px;
}
.ind2-badge-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #008a89;
    animation: ind2-blink 1.4s step-end infinite;
}
@keyframes ind2-blink { 0%,100%{opacity:1} 50%{opacity:0.15} }

.ind2-hero-h1 {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-weight: 600;
    font-size: clamp(1.95rem, 3.2vw, 3rem);
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: #111;
    margin: 0 0 22px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: .08em .2em;
}
.ind2-hw-wrap { overflow: hidden; display: inline-block; }
.hw { display: inline-block; }
.ind2-hero-sub {
    font-size: clamp(13.5px, 1.15vw, 15.5px);
    line-height: 1.78;
    color: #888;
    max-width: 500px;
    margin: 0 auto 44px;
}
.ind2-scroll-cue {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-display);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .2em;
    text-transform: uppercase;
    color: rgba(0,0,0,.28);
    animation: ind2-float 2.2s ease-in-out infinite;
}
@keyframes ind2-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }

/* CHOOSE INDUSTRY BUTTON */
.ind2-choose-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    border-radius: 999px;
    border: 1.5px solid #008a89;
    background: #008a89;
    color: #fff;
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .22em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background .22s, border-color .22s, transform .18s, box-shadow .22s;
    box-shadow: 0 4px 20px rgba(0,138,137,0.25);
    animation: ind2-float 2.2s ease-in-out infinite;
}
.ind2-choose-btn:hover {
    background: #007070;
    border-color: #007070;
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 28px rgba(0,138,137,0.4);
    animation-play-state: paused;
}

/* SCROLL TO HERO BUTTON */
.ind2-scroll-top {
    position: fixed;
    bottom: 32px;
    right: 32px;
    z-index: 200;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #008a89;
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0,138,137,0.4), 0 2px 8px rgba(0,0,0,0.15);
    transition: background .22s, transform .18s, box-shadow .22s;
    animation: ind2-fade-in 0.35s ease both;
}
.ind2-scroll-top:hover {
    background: #007070;
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(0,138,137,0.5);
}
@keyframes ind2-fade-in { from { opacity: 0; transform: translateY(12px) scale(0.88); } to { opacity: 1; transform: translateY(0) scale(1); } }

/* TAB BAR */
.ind2-tabs {
    position: sticky;
    top: 60px;
    z-index: 80;
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,0,0,0.08);
}
.ind2-tab-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    padding: 0 clamp(24px,6vw,80px);
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.ind2-tab-inner::-webkit-scrollbar { display: none; }
.ind2-tab-btn {
    display: inline-flex;
    align-items: center;
    padding: 18px 22px;
    border: none;
    background: none;
    font-family: var(--font-display, 'Syne', sans-serif);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.32);
    cursor: pointer;
    position: relative;
    transition: color 0.22s;
    white-space: nowrap;
    flex-shrink: 0;
}
.ind2-tab-btn::after {
    content: '';
    position: absolute;
    bottom: 0; left: 16px; right: 16px;
    height: 2px;
    background: #008a89;
    transform: scaleX(0);
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
    border-radius: 2px 2px 0 0;
}
.ind2-tab-btn.active { color: #008a89; }
.ind2-tab-btn.active::after { transform: scaleX(1); }
.ind2-tab-btn:hover { color: rgba(0,0,0,0.65); }

/* PANELS */
.ind2-panels { overflow: hidden; min-height: 60vh; }

/* --------------------------------------------------------------
   RETAIL PANEL (rt-)
-------------------------------------------------------------- */

.rt-intro {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(48px, 6vw, 96px);
    align-items: center;
    padding: clamp(72px, 9vw, 128px) clamp(32px, 8vw, 116px);
    max-width: 1380px;
    margin: 0 auto;
}
.rt-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-display, 'Syne', sans-serif);
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: .24em;
    text-transform: uppercase;
    color: #008a89;
    margin-bottom: 18px;
}
.rt-eyebrow-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #008a89;
    animation: ind2-blink 1.4s step-end infinite;
}
.rt-heading {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-weight: 600;
    font-size: clamp(2.1rem, 3vw, 3.2rem);
    line-height: 1.18;
    letter-spacing: -0.022em;
    color: #111;
    margin: 0 0 18px;
}
.rt-heading em { font-style: italic; color: #008a89; }
.rt-body {
    font-size: clamp(14.5px, 1.15vw, 16.5px);
    line-height: 1.8;
    color: #666;
    max-width: 400px;
    margin-bottom: 34px;
}
.rt-hire-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #111;
    color: #fff;
    font-family: var(--font-display);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: .2em;
    text-transform: uppercase;
    padding: 13px 26px;
    border-radius: 3px;
    text-decoration: none;
    transition: background .22s, transform .18s;
}
.rt-hire-cta:hover { background: #008a89; transform: translateY(-1px); }

.rt-intro-ctas { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.rt-report-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: #008a89;
    border: 1.5px solid rgba(0,138,137,0.5);
    font-family: var(--font-display);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: .2em;
    text-transform: uppercase;
    padding: 13px 26px;
    border-radius: 3px;
    text-decoration: none;
    transition: background .22s, color .22s, transform .18s;
}
.rt-report-cta:hover { background: #008a89; color: #fff; transform: translateY(-1px); }

.rt-intro-right { display: flex; flex-direction: column; gap: 22px; }
.rt-signal-cloud { display: flex; flex-wrap: wrap; gap: 9px; }
.rt-sig-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 13px;
    background: #f5f5f7;
    border: 1px solid #e5e5e7;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    color: #333;
    animation: rt-chip-in 0.4s ease both;
}
@keyframes rt-chip-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
.rt-sig-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.rt-sig-count {
    display: flex;
    align-items: baseline;
    gap: 14px;
    padding: 18px 22px;
    background: #f5f5f7;
    border-radius: 10px;
    border: 1px solid #e5e5e7;
}
.rt-sig-count-n {
    font-family: var(--font-display, 'Syne', sans-serif);
    font-size: 2.6rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
    color: #008a89;
}
.rt-sig-count-n sup { font-size: 1.2rem; }
.rt-sig-count-label { font-size: 12.5px; color: #666; line-height: 1.5; }

/* How It Works */
.rt-how { background: #0a0a0a; }
.rt-how-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(64px, 8vw, 112px) clamp(32px, 8vw, 116px);
}
.rt-section-label {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-display, 'Syne', sans-serif);
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: .28em;
    text-transform: uppercase;
    color: #008a89;
    margin-bottom: 16px;
}
.rt-sl-line {
    display: inline-block;
    width: 18px;
    height: 1.5px;
    background: #008a89;
    flex-shrink: 0;
}
.rt-how-h3 {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-weight: 600;
    font-size: clamp(1.6rem, 2.2vw, 2.3rem);
    line-height: 1.3;
    letter-spacing: -0.018em;
    color: #ffffff;
    margin: 0 0 clamp(36px, 5vw, 60px);
}
.rt-caps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    overflow: hidden;
    background: transparent;
}
.rt-cap-card {
    padding: clamp(28px, 3.5vw, 46px);
    border-right: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
    position: relative;
    overflow: hidden;
    transition: background 0.22s;
}
.rt-cap-card:last-child { border-right: none; }
.rt-cap-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: #008a89;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
}
.rt-cap-card:hover::after { transform: scaleX(1); }
.rt-cap-card:hover { background: rgba(255,255,255,0.04); }
.rt-cap-num {
    font-family: var(--font-display, 'Syne', sans-serif);
    font-size: clamp(2.2rem, 3.5vw, 3rem);
    font-weight: 700;
    color: rgba(0,138,137,.18);
    line-height: 1;
    letter-spacing: -0.04em;
    margin-bottom: 14px;
}
.rt-cap-title { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.9); margin-bottom: 10px; letter-spacing: -0.01em; }
.rt-cap-body { font-size: 13.5px; color: rgba(255,255,255,0.45); line-height: 1.7; margin: 0; max-width: 320px; }

/* Workflow Widget Section */
.rt-workflow-section {
    background: #080808;
    border-top: 1px solid rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.05);
}
.rt-workflow-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(72px, 9vw, 120px) clamp(32px, 8vw, 116px);
}
.rt-workflow-h3 {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-weight: 600;
    font-size: clamp(1.55rem, 2.2vw, 2.3rem);
    line-height: 1.3;
    letter-spacing: -0.018em;
    color: #ffffff;
    margin: 0 0 clamp(44px, 6vw, 80px);
}

/* Driving Decisions Banner */
@keyframes rt-grad-shift {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}
.rt-pill {
    background: linear-gradient(90deg, #030303 0%, #008a89 38%, #00c4c3 55%, #008a89 72%, #030303 100%);
    background-size: 200% 100%;
    animation: rt-grad-shift 4s linear infinite;
    box-shadow: 0 0 32px rgba(0,138,137,0.22);
}
.rt-driving-inline {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin: 22px 0 24px;
}
.rt-di-word {
    font-family: var(--font-display, 'Syne', sans-serif);
    font-size: clamp(0.62rem, 0.95vw, 0.75rem);
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.45);
    user-select: none;
}
.rt-driving-banner {
    background: #050505;
    border-top: 1px solid rgba(255,255,255,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.04);
    padding: clamp(80px, 12vw, 150px) clamp(24px, 6vw, 80px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
}
.rt-driving-glow {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(ellipse 70% 55% at 50% 100%, rgba(0,138,137,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 50% 50%, rgba(0,196,195,0.04) 0%, transparent 55%);
    pointer-events: none;
}
.rt-driving-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: clamp(10px, 2vw, 24px);
    justify-content: center;
}
.rt-driving-word {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-weight: 700;
    font-size: clamp(2rem, 5.5vw, 5.5rem);
    letter-spacing: -0.04em;
    line-height: 1;
    color: #ffffff;
    user-select: none;
    text-shadow: 0 2px 40px rgba(0,0,0,0.6);
}

/* Weekly Plan */
.rt-plan { background: #0a0a0a; }
.rt-plan-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: clamp(64px, 8vw, 112px) clamp(32px, 8vw, 116px);
    display: grid;
    grid-template-columns: 1fr 1.15fr;
    gap: clamp(48px, 6vw, 96px);
    align-items: center;
}
.rt-plan-h3 {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-weight: 600;
    font-size: clamp(1.9rem, 2.6vw, 2.8rem);
    line-height: 1.2;
    letter-spacing: -0.022em;
    color: #fff;
    margin: 0 0 16px;
}
.rt-plan-sub { font-size: 14px; color: rgba(255,255,255,.42); line-height: 1.75; max-width: 340px; margin-bottom: 32px; }
.rt-plan-stores { display: flex; flex-direction: column; gap: 10px; }
.rt-plan-store-row { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: rgba(255,255,255,.55); }
.rt-plan-store-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.rt-plan-store-count { margin-left: auto; font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.25); }

.rt-plan-card { background: #161618; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; overflow: hidden; }
.rt-plan-card-head {
    display: flex; align-items: center; gap: 10px;
    padding: 15px 20px;
    background: rgba(255,255,255,.03);
    border-bottom: 1px solid rgba(255,255,255,.06);
}
.rt-plan-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #008a89; animation: ind2-blink 1.4s step-end infinite; flex-shrink: 0; }
.rt-plan-store-name { font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,.65); letter-spacing: .02em; flex: 1; }
.rt-plan-live-badge {
    font-family: var(--font-display);
    font-size: 8.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
    color: #008a89; padding: 3px 9px; background: rgba(0,138,137,.1);
    border: 1px solid rgba(0,138,137,.2); border-radius: 999px;
}
.rt-plan-items { padding: 4px 0; }
.rt-plan-row { display: flex; align-items: flex-start; gap: 12px; padding: 13px 20px; border-bottom: 1px solid rgba(255,255,255,.04); }
.rt-plan-row:last-child { border-bottom: none; }
.rt-plan-row-left { display: flex; flex-direction: column; align-items: center; gap: 5px; flex-shrink: 0; }
.rt-plan-tag {
    font-family: var(--font-display);
    font-size: 7.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
    color: rgba(255,255,255,.28); padding: 3px 7px;
    border: 1px solid rgba(255,255,255,.1); border-radius: 3px; min-width: 60px; text-align: center;
}
.rt-plan-conf { font-family: var(--font-display); font-size: 7.5px; font-weight: 700; letter-spacing: .08em; color: #008a89; }
.rt-plan-action { font-size: 12px; color: rgba(255,255,255,.62); line-height: 1.6; margin: 0; padding-top: 2px; }

/* Stats */
.rt-stats { display: flex; align-items: stretch; justify-content: center; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); background: #0d0d0d; }
.rt-stat { flex: 1; padding: clamp(36px, 5vw, 56px) clamp(20px, 3vw, 40px); text-align: center; }
.rt-stat-div { width: 1px; background: rgba(255,255,255,0.07); align-self: stretch; }
.rt-stat-n { font-family: var(--font-display, 'Syne', sans-serif); font-size: clamp(2.4rem, 3.5vw, 3.4rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1; margin-bottom: 10px; color: #008a89; }
.rt-stat-d { font-size: 12.5px; color: rgba(255,255,255,0.38); line-height: 1.55; max-width: 180px; margin: 0 auto; }

/* Quote */
.rt-quote { background: #080808; border-bottom: 1px solid rgba(255,255,255,0.06); }
.rt-quote-inner { max-width: 900px; margin: 0 auto; padding: clamp(52px, 7vw, 84px) clamp(32px, 8vw, 120px); position: relative; }
.rt-quote-deco {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-size: clamp(4rem, 8vw, 7rem); color: rgba(255,255,255,.04); line-height: 0.5;
    position: absolute; top: clamp(28px, 4vw, 50px); left: clamp(12px, 5vw, 80px);
    pointer-events: none; user-select: none;
}
.rt-quote-text {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-size: clamp(1.05rem, 1.65vw, 1.42rem); font-weight: 500; font-style: italic;
    line-height: 1.72; color: rgba(255,255,255,0.58); letter-spacing: -0.01em;
    padding-left: clamp(18px, 3vw, 44px); border-left: 2.5px solid rgba(0,138,137,.4); margin: 0;
}

/* CTA */
.rt-cta-block { position: relative; overflow: hidden; background: #0a0a0a; text-align: center; padding: clamp(72px, 10vw, 130px) clamp(24px, 6vw, 80px); }
.rt-cta-glow {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: clamp(400px, 60vw, 900px); height: clamp(200px, 35vw, 480px);
    background: radial-gradient(ellipse at 50% 0%, rgba(0,138,137,.13) 0%, transparent 68%);
    pointer-events: none;
}
.rt-cta-inner { position: relative; z-index: 1; max-width: 580px; margin: 0 auto; }
.rt-cta-h3 { font-family: var(--font-heading, 'Playfair Display', serif); font-weight: 600; font-size: clamp(1.9rem, 3.2vw, 3.1rem); line-height: 1.2; letter-spacing: -0.022em; color: #fff; margin: 0 0 18px; }
.rt-cta-sub { font-size: 14.5px; color: rgba(255,255,255,.38); max-width: 400px; margin: 0 auto 34px; line-height: 1.72; }
.rt-cta-btn {
    display: inline-block; background: #fff; color: #111;
    font-family: var(--font-display, 'Syne', sans-serif); font-size: 9.5px; font-weight: 700;
    letter-spacing: .2em; text-transform: uppercase; padding: 14px 34px; border-radius: 3px;
    text-decoration: none; transition: background .22s, color .22s, transform .18s, box-shadow .22s;
}
.rt-cta-btn:hover { background: #008a89; color: #fff; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,138,137,.35); }

/* --------------------------------------------------------------
   OTHER INDUSTRY PANEL (ot-)
-------------------------------------------------------------- */

.ot-hero { position: relative; background: #fafafa; border-bottom: 1px solid #e8e8e8; padding: clamp(72px, 9vw, 120px) clamp(32px, 8vw, 116px) clamp(56px, 7vw, 96px); overflow: hidden; }
.ot-hero-bar { position: absolute; top: 0; left: 0; right: 0; height: 2.5px; }
.ot-hero-inner { max-width: 680px; }
.ot-eyebrow { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-display, 'Syne', sans-serif); font-size: 8.5px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; margin-bottom: 18px; }
.ot-ey-line { display: inline-block; width: 18px; height: 1.5px; }
.ot-heading { font-family: var(--font-heading, 'Playfair Display', serif); font-weight: 600; font-size: clamp(2rem, 3vw, 3.1rem); line-height: 1.2; letter-spacing: -0.022em; color: #111; margin: 0 0 18px; }
.ot-heading em { font-style: italic; }
.ot-desc { font-size: clamp(14px, 1.15vw, 16px); line-height: 1.78; color: #666; max-width: 460px; margin-bottom: 30px; }
.ot-cta-link { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-display, 'Syne', sans-serif); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; padding: 11px 24px; border: 1.5px solid; border-radius: 3px; text-decoration: none; transition: opacity .2s; }
.ot-cta-link:hover { opacity: 0.7; }
.ot-status { display: inline-flex; align-items: center; gap: 8px; position: absolute; top: clamp(72px, 9vw, 120px); right: clamp(32px, 8vw, 116px); font-family: var(--font-display, 'Syne', sans-serif); font-size: 8.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: rgba(0,0,0,.3); }
.ot-status-dot { width: 6px; height: 6px; border-radius: 50%; animation: ind2-blink 2s step-end infinite; }

.ot-caps { background: #fff; border-bottom: 1px solid #e8e8e8; }
.ot-caps-inner { max-width: 1280px; margin: 0 auto; padding: clamp(64px, 8vw, 108px) clamp(32px, 8vw, 116px); }
.ot-section-label { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-display, 'Syne', sans-serif); font-size: 8.5px; font-weight: 700; letter-spacing: .28em; text-transform: uppercase; margin-bottom: 16px; }
.ot-sl-line { display: inline-block; width: 18px; height: 1.5px; }
.ot-caps-h3 { font-family: var(--font-heading, 'Playfair Display', serif); font-weight: 600; font-size: clamp(1.6rem, 2.2vw, 2.2rem); line-height: 1.3; letter-spacing: -0.018em; color: #111; margin: 0 0 clamp(36px, 5vw, 56px); }
.ot-caps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border: 1px solid #e8e8e8; border-radius: 8px; overflow: hidden; }
.ot-cap-card { padding: clamp(24px, 3.2vw, 44px); background: #fff; border-right: 1px solid #e8e8e8; }
.ot-cap-card:last-child { border-right: none; }
.ot-cap-num { font-family: var(--font-display, 'Syne', sans-serif); font-size: clamp(2rem, 3.2vw, 2.8rem); font-weight: 700; line-height: 1; letter-spacing: -0.04em; margin-bottom: 8px; }
.ot-cap-title { font-size: 14.5px; font-weight: 700; color: #111; margin-bottom: 10px; letter-spacing: -0.01em; }
.ot-cap-body { font-size: 13px; color: #666; line-height: 1.65; margin: 0; }

.ot-stats { display: flex; align-items: stretch; background: #f5f5f7; border-bottom: 1px solid #e8e8e8; }
.ot-stat { flex: 1; padding: clamp(32px, 4.5vw, 52px) clamp(16px, 2.5vw, 36px); text-align: center; border-right: 1px solid #e8e8e8; }
.ot-stat:last-child { border-right: none; }
.ot-stat-n { font-family: var(--font-display, 'Syne', sans-serif); font-size: clamp(2.1rem, 3vw, 2.9rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1; margin-bottom: 10px; }
.ot-stat-d { font-size: 12.5px; color: #999; line-height: 1.55; max-width: 180px; margin: 0 auto; }

.ot-quote { background: #fafafa; border-bottom: 1px solid #e8e8e8; padding: clamp(44px, 6vw, 68px) clamp(32px, 8vw, 116px); }
.ot-quote-text { font-family: var(--font-heading, 'Playfair Display', serif); font-size: clamp(1rem, 1.5vw, 1.3rem); font-weight: 500; font-style: italic; color: #555; line-height: 1.72; letter-spacing: -0.01em; max-width: 820px; margin: 0 auto; text-align: center; }

.ot-cta-block { background: #0a0a0a; padding: clamp(64px, 9vw, 110px) clamp(32px, 8vw, 116px); text-align: center; }
.ot-cta-h3 { font-family: var(--font-heading, 'Playfair Display', serif); font-weight: 600; font-size: clamp(1.8rem, 2.8vw, 2.8rem); line-height: 1.2; letter-spacing: -0.02em; color: #fff; margin: 0 0 32px; }
.ot-cta-btn { display: inline-block; color: #fff; font-family: var(--font-display, 'Syne', sans-serif); font-size: 9.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; padding: 13px 30px; border-radius: 3px; text-decoration: none; transition: opacity .22s, transform .18s; }
.ot-cta-btn:hover { opacity: 0.82; transform: translateY(-2px); }

/* FOOTER */
.ind2-footer {
    background: #070d0b;
    position: relative;
    overflow: hidden;
    border-top: 1px solid rgba(41,255,201,0.08);
    display: flex;
    flex-direction: column;
}
.ind2-footer-cta {
    position: relative;
    z-index: 1;
    max-width: 860px;
    margin: 0 auto;
    padding: clamp(72px, 10vw, 112px) clamp(24px, 6vw, 80px) clamp(56px, 8vw, 88px);
    text-align: center;
    pointer-events: none;
}
.ind2-footer-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-body);
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #1cd2b3;
    margin: 0 0 28px;
}
.ind2-footer-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #1cd2b3;
    box-shadow: 0 0 8px rgba(28,210,179,0.6);
}
.ind2-footer-h2 {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(2.4rem, 5.5vw, 4.8rem);
    letter-spacing: -0.045em;
    line-height: 1;
    color: #ffffff;
    margin: 0 0 20px;
}
.ind2-footer-tagline {
    font-family: var(--font-body);
    font-size: clamp(0.9rem, 1.3vw, 1.05rem);
    color: rgba(255,255,255,0.45);
    line-height: 1.65;
    margin: 0 auto 40px;
    max-width: 520px;
}
.ind2-footer-cta-btns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    flex-wrap: wrap;
    pointer-events: auto;
}
.ind2-footer-cta-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #008a89;
    color: #fff;
    font-family: var(--font-display);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 14px 30px;
    border-radius: 3px;
    text-decoration: none;
    transition: background 0.22s, transform 0.18s, box-shadow 0.22s;
}
.ind2-footer-cta-primary:hover { background: #00a8a7; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(0,138,137,0.4); }
.ind2-footer-cta-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.25);
    font-family: var(--font-display);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 14px 30px;
    border-radius: 3px;
    text-decoration: none;
    transition: border-color 0.22s, color 0.22s, transform 0.18s;
}
.ind2-footer-cta-secondary:hover { border-color: #1cd2b3; color: #1cd2b3; transform: translateY(-1px); }
.ind2-footer-bar {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding: 18px clamp(24px, 5vw, 56px);
    border-top: 1px solid rgba(255,255,255,.06);
}
.ind2-footer-brand { font-family: var(--font-display); font-size: 9.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.45); display: flex; align-items: center; gap: 8px; flex: 1; }
.ind2-footer-sub { font-size: 8.5px; color: rgba(255,255,255,.18); letter-spacing: .07em; flex: 2; text-align: center; margin: 0; }
.ind2-footer-links { display: flex; align-items: center; gap: 14px; flex: 1; justify-content: flex-end; }
.ind2-footer-home { font-size: 9.5px; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.3); text-decoration: none; transition: color .2s; }
.ind2-footer-home:hover { color: rgba(255,255,255,.7); }
.ind2-footer-demo { font-family: var(--font-display); font-size: 9.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #fff; text-decoration: none; padding: 9px 20px; border: 1px solid rgba(255,255,255,.2); border-radius: 3px; transition: border-color .22s, color .22s; }
.ind2-footer-demo:hover { border-color: #008a89; color: #008a89; }

/* RESPONSIVE */
@media (max-width: 960px) {
    .rt-intro { grid-template-columns: 1fr; gap: 44px; }
    .rt-caps-grid { grid-template-columns: 1fr; }
    .rt-cap-card { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .rt-cap-card:last-child { border-bottom: none; }
    .rt-stats { flex-direction: column; }
    .rt-stat-div { width: 100%; height: 1px; }
    .rt-plan-inner { grid-template-columns: 1fr; }
    .ot-caps-grid { grid-template-columns: 1fr; }
    .ot-cap-card { border-right: none; border-bottom: 1px solid #e8e8e8; }
    .ot-cap-card:last-child { border-bottom: none; }
    .ot-stats { flex-direction: column; }
    .ot-stat { border-right: none; border-bottom: 1px solid #e8e8e8; }
    .ot-stat:last-child { border-bottom: none; }
    .ot-status { position: static; margin-top: 24px; }
    .ind2-footer-bar { flex-direction: column; text-align: center; }
    .ind2-footer-links { justify-content: center; }
    /* CPG */
    .cpg-hero { grid-template-columns: 1fr; }
    .cpg-network { min-height: 220px; }
    .cpg-stats { flex-direction: column; }
    .cpg-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); }
    /* Travel */
    .tv-hero { grid-template-columns: 1fr; }
    .tv-caps-steps { grid-template-columns: 1fr; }
    .tv-step-line { display: none; }
    .tv-stats { flex-direction: column; }
    .tv-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); }
    /* O2O */
    .o2o-hero { grid-template-columns: 1fr; }
    .o2o-zone-canvas { min-height: 260px; }
    .o2o-caps-grid { grid-template-columns: 1fr; }
    .o2o-stats { flex-direction: column; }
    .o2o-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); }
}
@media (max-width: 600px) {
    .ind2-tab-inner { padding: 0 8px; overflow-x: auto; justify-content: flex-start; }
    .ind2-tab-btn { padding: 14px 16px; font-size: 11px; }
    .rt-signal-cloud { gap: 7px; }
    .rt-sig-chip { font-size: 10.5px; padding: 6px 11px; }
    .ind2-scroll-top { bottom: 20px; right: 20px; }
}

/* --------------------------------------------------------------
   CPG PANEL (cpg-)
   Dark hero editorial � Network SVG � Vertical caps list
-------------------------------------------------------------- */
.cpg-root { background: #fff; }
.cpg-hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 62vh;
    background: #070707;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}
.cpg-hero-inner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(72px,9vw,120px) clamp(32px,7vw,96px);
}
.cpg-eyebrow { display: inline-flex; align-items: center; gap: 9px; font-family: var(--font-display); font-size: 8.5px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; color: #008a89; margin-bottom: 20px; }
.cpg-ey-dot { width: 6px; height: 6px; border-radius: 50%; background: #008a89; animation: ind2-blink 1.4s step-end infinite; flex-shrink: 0; }
.cpg-heading { font-family: var(--font-heading,'Playfair Display',serif); font-weight: 600; font-size: clamp(2rem,3vw,3.1rem); line-height: 1.18; letter-spacing: -0.022em; color: #fff; margin: 0 0 18px; }
.cpg-heading em { font-style: italic; color: #008a89; }
.cpg-desc { font-size: clamp(14px,1.1vw,15.5px); line-height: 1.78; color: rgba(255,255,255,0.44); max-width: 400px; margin-bottom: 30px; }
.cpg-cta-pill { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-display); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; padding: 12px 24px; border: 1.5px solid rgba(0,138,137,.45); border-radius: 3px; color: #008a89; text-decoration: none; transition: background .22s, color .22s; }
.cpg-cta-pill:hover { background: #008a89; color: #fff; }
.cpg-status { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; font-family: var(--font-display); font-size: 8.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.25); }
.cpg-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #008a89; animation: ind2-blink 2s step-end infinite; }
.cpg-network {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(40px,6vw,80px) clamp(24px,4vw,56px);
    position: relative;
    border-left: 1px solid rgba(255,255,255,0.05);
}
.cpg-net-svg { width: 100%; max-width: 380px; height: auto; }
.cpg-net-label { font-family: var(--font-display); font-size: 8px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase; color: rgba(0,196,195,0.5); margin-top: 16px; }

.cpg-caps { background: #f8f8f8; border-bottom: 1px solid #eaeaea; }
.cpg-caps-inner { max-width: 860px; margin: 0 auto; padding: clamp(64px,8vw,108px) clamp(32px,8vw,116px); }
.cpg-section-label { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: 8.5px; font-weight: 700; letter-spacing: .28em; text-transform: uppercase; color: #008a89; margin-bottom: 16px; }
.cpg-sl-line { display: inline-block; width: 24px; height: 1.5px; background: #008a89; }
.cpg-caps-h3 { font-family: var(--font-heading,'Playfair Display',serif); font-weight: 600; font-size: clamp(1.6rem,2.2vw,2.3rem); line-height: 1.3; letter-spacing: -0.018em; color: #111; margin: 0 0 clamp(36px,5vw,56px); }
.cpg-caps-list { display: flex; flex-direction: column; gap: 0; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; background: #fff; }
.cpg-cap-row { display: grid; grid-template-columns: 64px 1.5px 1fr; gap: 28px; align-items: start; padding: clamp(22px,3vw,36px) clamp(20px,3vw,36px); border-bottom: 1px solid #f0f0f0; transition: background .18s; }
.cpg-cap-row:last-child { border-bottom: none; }
.cpg-cap-row:hover { background: #fafafa; }
.cpg-cap-num { font-family: var(--font-display); font-size: clamp(1.6rem,2.5vw,2.2rem); font-weight: 700; letter-spacing: -0.04em; color: rgba(0,138,137,0.18); line-height: 1.1; padding-top: 4px; }
.cpg-cap-divider { background: rgba(0,138,137,0.2); align-self: stretch; border-radius: 2px; }
.cpg-cap-title { font-size: 14.5px; font-weight: 700; color: #111; margin-bottom: 8px; letter-spacing: -0.01em; }
.cpg-cap-body { font-size: 13px; color: #666; line-height: 1.68; margin: 0; }

.cpg-stats { display: flex; background: #0a0a0a; border-bottom: 1px solid rgba(255,255,255,0.05); }
.cpg-stat { flex: 1; padding: clamp(36px,5vw,56px) clamp(20px,3vw,40px); text-align: center; border-right: 1px solid rgba(255,255,255,0.07); }
.cpg-stat:last-child { border-right: none; }
.cpg-stat-n { font-family: var(--font-display); font-size: clamp(2.2rem,3.2vw,3.2rem); font-weight: 700; letter-spacing: -0.03em; color: #008a89; line-height: 1; margin-bottom: 10px; }
.cpg-stat-d { font-size: 12.5px; color: rgba(255,255,255,0.35); line-height: 1.55; max-width: 180px; margin: 0 auto; }

.cpg-quote { background: #fff; border-bottom: 1px solid #eaeaea; padding: clamp(52px,7vw,84px) clamp(32px,8vw,116px); display: flex; gap: 32px; align-items: flex-start; max-width: 900px; margin: 0 auto; box-sizing: content-box; }
.cpg-quote-bar { width: 3px; min-height: 48px; background: #008a89; border-radius: 2px; flex-shrink: 0; margin-top: 4px; }
.cpg-quote-text { font-family: var(--font-heading,'Playfair Display',serif); font-size: clamp(1rem,1.55vw,1.38rem); font-weight: 500; font-style: italic; line-height: 1.72; color: #555; letter-spacing: -0.01em; margin: 0; }

.cpg-cta-block { background: #0a0a0a; text-align: center; padding: clamp(72px,10vw,130px) clamp(24px,6vw,80px); }
.cpg-cta-h3 { font-family: var(--font-heading,'Playfair Display',serif); font-weight: 600; font-size: clamp(1.9rem,3vw,3rem); line-height: 1.2; letter-spacing: -0.022em; color: #fff; margin: 0 0 32px; }
.cpg-cta-h3 span { color: #008a89; }
.cpg-cta-btn { display: inline-block; background: #008a89; color: #fff; font-family: var(--font-display); font-size: 9.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; padding: 14px 34px; border-radius: 3px; text-decoration: none; transition: background .22s, transform .18s; }
.cpg-cta-btn:hover { background: #007070; transform: translateY(-2px); }

/* --------------------------------------------------------------
   TRAVEL PANEL (tv-)
   Signal ticker � Dark gradient hero � Horizontal timeline caps
-------------------------------------------------------------- */
.tv-root { background: #fff; }

/* Live ticker bar */
.tv-ticker {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 11px clamp(24px,5vw,56px);
    background: #050505;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    overflow: hidden;
    white-space: nowrap;
}
.tv-ticker-live { font-family: var(--font-display); font-size: 7.5px; font-weight: 700; letter-spacing: .25em; text-transform: uppercase; color: #fff; background: #008a89; padding: 3px 8px; border-radius: 3px; flex-shrink: 0; }
.tv-ticker-sep { width: 1px; height: 14px; background: rgba(255,255,255,0.12); flex-shrink: 0; }
.tv-ticker-event { font-family: var(--font-display); font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.85); letter-spacing: .01em; animation: tv-fade-in .5s ease both; flex-shrink: 0; }
@keyframes tv-fade-in { from { opacity: 0; transform: translateY(4px);} to { opacity: 1; transform: none; } }
.tv-ticker-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.2); flex-shrink: 0; }
.tv-ticker-loc { font-size: 11px; color: rgba(255,255,255,0.38); flex-shrink: 0; }
.tv-ticker-impact { font-family: var(--font-display); font-size: 10.5px; font-weight: 700; color: #008a89; flex-shrink: 0; }

/* Hero */
.tv-hero {
    display: grid;
    grid-template-columns: 1fr 420px;
    min-height: 60vh;
    background: linear-gradient(135deg, #050505 0%, #0a0f0f 50%, #061414 100%);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    position: relative;
    overflow: hidden;
}
.tv-hero::before {
    content: '';
    position: absolute;
    top: -60%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(ellipse, rgba(0,138,137,0.08) 0%, transparent 65%);
    pointer-events: none;
}
.tv-hero-inner {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(72px,9vw,120px) clamp(32px,7vw,96px);
    position: relative;
    z-index: 1;
}
.tv-eyebrow { display: inline-flex; align-items: center; gap: 9px; font-family: var(--font-display); font-size: 8.5px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; color: #008a89; margin-bottom: 20px; }
.tv-ey-dot { width: 6px; height: 6px; border-radius: 50%; background: #008a89; animation: ind2-blink 1.4s step-end infinite; flex-shrink: 0; }
.tv-heading { font-family: var(--font-heading,'Playfair Display',serif); font-weight: 600; font-size: clamp(2rem,3vw,3.1rem); line-height: 1.18; letter-spacing: -0.022em; color: #fff; margin: 0 0 18px; }
.tv-heading em { font-style: italic; color: #008a89; }
.tv-desc { font-size: clamp(14px,1.1vw,15.5px); line-height: 1.78; color: rgba(255,255,255,0.42); max-width: 400px; margin-bottom: 30px; }
.tv-cta-pill { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-display); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; padding: 12px 24px; border: 1.5px solid rgba(0,138,137,.45); border-radius: 3px; color: #008a89; text-decoration: none; transition: background .22s, color .22s; }
.tv-cta-pill:hover { background: #008a89; color: #fff; }
.tv-status { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; font-family: var(--font-display); font-size: 8.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.22); }
.tv-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #008a89; animation: ind2-blink 2s step-end infinite; }

/* Pricing window visual */
.tv-price-visual {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(40px,5vw,72px) clamp(24px,4vw,48px) clamp(40px,5vw,72px) 0;
    position: relative;
    z-index: 1;
}
.tv-pw-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.tv-pw-title { font-family: var(--font-display); font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,0.28); }
.tv-pw-badge { font-family: var(--font-display); font-size: 7.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; background: rgba(0,138,137,0.15); border: 1px solid rgba(0,138,137,0.3); color: #008a89; padding: 3px 8px; border-radius: 3px; }
.tv-pw-bars { display: flex; align-items: flex-end; gap: 6px; height: 160px; margin-bottom: 10px; }
.tv-pw-bar-wrap { flex: 1; display: flex; align-items: flex-end; height: 100%; }
.tv-pw-bar {
    width: 100%;
    background: linear-gradient(to top, #008a89, rgba(0,196,195,0.6));
    border-radius: 3px 3px 0 0;
    animation: tv-bar-rise 1s cubic-bezier(0.16,1,0.3,1) both;
    transform-origin: bottom;
}
@keyframes tv-bar-rise { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
.tv-pw-days { display: flex; gap: 6px; }
.tv-pw-days span { flex: 1; text-align: center; font-family: var(--font-display); font-size: 8.5px; font-weight: 600; letter-spacing: .08em; color: rgba(255,255,255,0.22); text-transform: uppercase; }

/* Horizontal timeline capabilities */
.tv-caps { background: #fff; border-bottom: 1px solid #eaeaea; }
.tv-caps-inner { max-width: 1280px; margin: 0 auto; padding: clamp(64px,8vw,108px) clamp(32px,8vw,116px); }
.tv-section-label { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: 8.5px; font-weight: 700; letter-spacing: .28em; text-transform: uppercase; color: #008a89; margin-bottom: 16px; }
.tv-sl-line { display: inline-block; width: 24px; height: 1.5px; background: #008a89; }
.tv-caps-h3 { font-family: var(--font-heading,'Playfair Display',serif); font-weight: 600; font-size: clamp(1.6rem,2.2vw,2.3rem); line-height: 1.3; letter-spacing: -0.018em; color: #111; margin: 0 0 clamp(36px,5vw,56px); }
.tv-caps-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.tv-step {
    padding: clamp(28px,3.5vw,44px);
    border-top: 2px solid #eaeaea;
    position: relative;
    transition: border-color .22s;
}
.tv-step:hover { border-color: #008a89; }
.tv-step-num {
    font-family: var(--font-display);
    font-size: clamp(2rem,3vw,2.8rem);
    font-weight: 700;
    letter-spacing: -0.04em;
    color: rgba(0,138,137,0.15);
    line-height: 1;
    margin-bottom: 16px;
}
.tv-step-line { display: none; } /* reserved for animation future use */
.tv-step-title { font-size: 14.5px; font-weight: 700; color: #111; margin-bottom: 10px; letter-spacing: -0.01em; }
.tv-step-body { font-size: 13px; color: #666; line-height: 1.68; margin: 0; }

.tv-stats { display: flex; background: #0a0a0a; border-bottom: 1px solid rgba(255,255,255,0.05); }
.tv-stat { flex: 1; padding: clamp(36px,5vw,56px) clamp(20px,3vw,40px); text-align: center; border-right: 1px solid rgba(255,255,255,0.07); }
.tv-stat:last-child { border-right: none; }
.tv-stat-n { font-family: var(--font-display); font-size: clamp(2.2rem,3.2vw,3.2rem); font-weight: 700; letter-spacing: -0.03em; color: #008a89; line-height: 1; margin-bottom: 10px; }
.tv-stat-d { font-size: 12.5px; color: rgba(255,255,255,0.35); line-height: 1.55; max-width: 180px; margin: 0 auto; }

.tv-quote { background: #080808; border-bottom: 1px solid rgba(255,255,255,0.06); padding: clamp(52px,7vw,84px) clamp(32px,8vw,116px); text-align: center; }
.tv-quote-text { font-family: var(--font-heading,'Playfair Display',serif); font-size: clamp(1rem,1.55vw,1.38rem); font-weight: 500; font-style: italic; line-height: 1.72; color: rgba(255,255,255,0.45); letter-spacing: -0.01em; max-width: 820px; margin: 0 auto; }

.tv-cta-block { background: #050505; text-align: center; padding: clamp(72px,10vw,130px) clamp(24px,6vw,80px); }
.tv-cta-h3 { font-family: var(--font-heading,'Playfair Display',serif); font-weight: 600; font-size: clamp(1.9rem,3vw,3rem); line-height: 1.2; letter-spacing: -0.022em; color: #fff; margin: 0 0 32px; }
.tv-cta-h3 span { color: #008a89; }
.tv-cta-btn { display: inline-block; background: transparent; color: #008a89; border: 1.5px solid #008a89; font-family: var(--font-display); font-size: 9.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; padding: 14px 34px; border-radius: 3px; text-decoration: none; transition: background .22s, color .22s, transform .18s; }
.tv-cta-btn:hover { background: #008a89; color: #fff; transform: translateY(-2px); }

/* --------------------------------------------------------------
   O2O PANEL (o2o-)
   Split hero � Pulse zones � Icon-badge capability cards
-------------------------------------------------------------- */
.o2o-root { background: #fff; }

.o2o-hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 60vh;
    border-bottom: 1px solid #eaeaea;
}
.o2o-hero-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: clamp(72px,9vw,120px) clamp(32px,7vw,96px);
    background: #fff;
}
.o2o-eyebrow { display: inline-flex; align-items: center; gap: 9px; font-family: var(--font-display); font-size: 8.5px; font-weight: 700; letter-spacing: .24em; text-transform: uppercase; color: #008a89; margin-bottom: 20px; }
.o2o-ey-dot { width: 6px; height: 6px; border-radius: 50%; background: #008a89; animation: ind2-blink 1.4s step-end infinite; flex-shrink: 0; }
.o2o-heading { font-family: var(--font-heading,'Playfair Display',serif); font-weight: 600; font-size: clamp(2rem,3vw,3.1rem); line-height: 1.18; letter-spacing: -0.022em; color: #111; margin: 0 0 18px; }
.o2o-heading em { font-style: italic; color: #008a89; }
.o2o-desc { font-size: clamp(14px,1.1vw,15.5px); line-height: 1.78; color: #666; max-width: 400px; margin-bottom: 30px; }
.o2o-cta-pill { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-display); font-size: 9px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; padding: 12px 24px; border: 1.5px solid rgba(0,138,137,.45); border-radius: 3px; color: #008a89; text-decoration: none; transition: background .22s, color .22s; }
.o2o-cta-pill:hover { background: #008a89; color: #fff; }
.o2o-status { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; font-family: var(--font-display); font-size: 8.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: rgba(0,0,0,.3); }
.o2o-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #008a89; animation: ind2-blink 2s step-end infinite; }

/* Zone canvas */
.o2o-zone-canvas {
    background: #080808;
    position: relative;
    overflow: hidden;
    border-left: 1px solid #eaeaea;
}
.o2o-zone-label-top {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-display);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: rgba(0,196,195,0.4);
    white-space: nowrap;
    z-index: 2;
}
.o2o-zone {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}
.o2o-zone-ring {
    position: absolute;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(0,138,137,0.4);
    animation: o2o-pulse 3s ease-in-out infinite;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
}
@keyframes o2o-pulse {
    0%   { transform: translate(-50%,-50%) scale(0.9); opacity: 0.8; }
    50%  { transform: translate(-50%,-50%) scale(1.6); opacity: 0; }
    100% { transform: translate(-50%,-50%) scale(0.9); opacity: 0.8; }
}
.o2o-zone-core { width: 10px; height: 10px; border-radius: 50%; background: #008a89; box-shadow: 0 0 16px rgba(0,138,137,0.7); }
.o2o-zone--peak .o2o-zone-core { width: 14px; height: 14px; box-shadow: 0 0 24px rgba(0,138,137,0.9); background: #00c4c3; }
.o2o-zone--med .o2o-zone-core { opacity: 0.65; }
.o2o-zone--low .o2o-zone-core { opacity: 0.4; }
.o2o-zone-lbl { font-family: var(--font-display); font-size: 8.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: rgba(0,196,195,0.6); margin-top: 4px; }

/* Capabilities: icon-badge grid */
.o2o-caps { background: #fafafa; border-bottom: 1px solid #eaeaea; }
.o2o-caps-inner { max-width: 1100px; margin: 0 auto; padding: clamp(64px,8vw,108px) clamp(32px,8vw,116px); }
.o2o-section-label { display: inline-flex; align-items: center; gap: 10px; font-family: var(--font-display); font-size: 8.5px; font-weight: 700; letter-spacing: .28em; text-transform: uppercase; color: #008a89; margin-bottom: 16px; }
.o2o-sl-line { display: inline-block; width: 24px; height: 1.5px; background: #008a89; }
.o2o-caps-h3 { font-family: var(--font-heading,'Playfair Display',serif); font-weight: 600; font-size: clamp(1.6rem,2.2vw,2.3rem); line-height: 1.3; letter-spacing: -0.018em; color: #111; margin: 0 0 clamp(36px,5vw,56px); }
.o2o-caps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.o2o-cap-card {
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    padding: clamp(22px,2.8vw,38px);
    transition: border-color .22s, box-shadow .22s, transform .18s;
}
.o2o-cap-card:hover { border-color: rgba(0,138,137,0.4); box-shadow: 0 4px 18px rgba(0,138,137,0.1); transform: translateY(-2px); }
.o2o-cap-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(0,138,137,0.09);
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    color: #008a89;
    letter-spacing: .04em;
    margin-bottom: 16px;
}
.o2o-cap-title { font-size: 14.5px; font-weight: 700; color: #111; margin-bottom: 8px; letter-spacing: -0.01em; }
.o2o-cap-body { font-size: 13px; color: #666; line-height: 1.68; margin: 0; }

.o2o-stats { display: flex; background: #0a0a0a; border-bottom: 1px solid rgba(255,255,255,0.05); }
.o2o-stat { flex: 1; padding: clamp(36px,5vw,56px) clamp(20px,3vw,40px); text-align: center; border-right: 1px solid rgba(255,255,255,0.07); }
.o2o-stat:last-child { border-right: none; }
.o2o-stat-n { font-family: var(--font-display); font-size: clamp(2.2rem,3.2vw,3.2rem); font-weight: 700; letter-spacing: -0.03em; color: #008a89; line-height: 1; margin-bottom: 10px; }
.o2o-stat-d { font-size: 12.5px; color: rgba(255,255,255,0.35); line-height: 1.55; max-width: 180px; margin: 0 auto; }

.o2o-quote { background: #fff; border-bottom: 1px solid #eaeaea; padding: clamp(52px,7vw,84px) clamp(32px,8vw,116px); text-align: center; }
.o2o-quote-text { font-family: var(--font-heading,'Playfair Display',serif); font-size: clamp(1rem,1.55vw,1.38rem); font-weight: 500; font-style: italic; line-height: 1.72; color: #555; letter-spacing: -0.01em; max-width: 820px; margin: 0 auto; }

.o2o-cta-block { background: #0a0a0a; text-align: center; padding: clamp(72px,10vw,130px) clamp(24px,6vw,80px); }
.o2o-cta-h3 { font-family: var(--font-heading,'Playfair Display',serif); font-weight: 600; font-size: clamp(1.9rem,3vw,3rem); line-height: 1.2; letter-spacing: -0.022em; color: #fff; margin: 0 0 32px; }
.o2o-cta-h3 span { color: #008a89; }
.o2o-cta-btn { display: inline-block; background: #008a89; color: #fff; font-family: var(--font-display); font-size: 9.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; padding: 14px 34px; border-radius: 3px; text-decoration: none; transition: background .22s, opacity .18s, transform .18s; }
.o2o-cta-btn:hover { background: #007070; transform: translateY(-2px); }
`}</style>
        </>
    );
}
