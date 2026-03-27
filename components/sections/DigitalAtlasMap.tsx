'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import useIsMobile from '@/hooks/useIsMobile';

/**
 * Digital Atlas — Interactive location intelligence map.
 * Click any marker to reveal its market composition:
 * transit access, competition, complementary anchors, demand density.
 */

// --- DATA ---
const locationsData = [
    {
        id: 'sbux-hudson',
        name: 'Starbucks Reserve',
        lat: 40.7538, lng: -74.0016,
        type: 'Cafe', brand: 'Starbucks', density: 'Hyperdense',
        stats: [
            { label: 'Transit', pct: 18, color: '#3b82f6', info: 'Transit nodes funneling customers.' },
            { label: 'Competitor', pct: 42, color: '#f43f5e', info: 'Same-category rivals nearby.' },
            { label: 'Complementary', pct: 30, color: '#10b981', info: 'Footfall-driving destination anchors.' },
            { label: 'Demand', pct: 10, color: '#f59e0b', info: 'Organic demand concentration.' },
        ],
        pulse: { buzz: 99, synergy: 88, tension: 96 },
        anchorsTotal: 12,
        categories: {
            transit: { label: 'Transit', items: [{ name: '7-Train Hub', dist: 0.01 }, { name: 'Hudson Exit', dist: 0.015 }] },
            competitor: { label: 'Competitor', items: [{ name: 'Gregorys', dist: 0.012 }, { name: 'Blue Bottle', dist: 0.009 }] },
            complementary: { label: 'Complementary', items: [{ name: 'Equinox', dist: 0.018 }, { name: 'Whole Foods', dist: 0.011 }] },
            demand: { label: 'Demand', items: [{ name: 'The Edge', dist: 0.014 }, { name: 'Vessel', dist: 0.008 }] },
        },
    },
    {
        id: 'sephora-hudson',
        name: 'Sephora',
        lat: 40.7530, lng: -74.0015,
        type: 'Beauty', brand: 'Sephora', density: 'Dense',
        stats: [
            { label: 'Transit', pct: 20, color: '#3b82f6', info: 'Subway & ferry links nearby.' },
            { label: 'Competitor', pct: 10, color: '#f43f5e', info: 'Same-category rivals nearby.' },
            { label: 'Complementary', pct: 50, color: '#10b981', info: 'Footfall-driving destination anchors.' },
            { label: 'Demand', pct: 20, color: '#f59e0b', info: 'Destination shoppers, mall-driven.' },
        ],
        pulse: { buzz: 88, synergy: 92, tension: 35 },
        anchorsTotal: 10,
        categories: {
            transit: { label: 'Transit', items: [{ name: 'Mall Subway', dist: 0.005 }, { name: 'Ferry Link', dist: 0.01 }] },
            competitor: { label: 'Competitor', items: [{ name: 'MAC Store', dist: 0.008 }, { name: 'Ulta Beauty', dist: 0.015 }] },
            complementary: { label: 'Complementary', items: [{ name: 'Lululemon', dist: 0.012 }, { name: 'Aritzia', dist: 0.01 }] },
            demand: { label: 'Demand', items: [{ name: 'The Shed', dist: 0.009 }] },
        },
    },
    {
        id: 'nike-nyc',
        name: 'Nike NYC',
        lat: 40.7535, lng: -74.0025,
        type: 'Retail', brand: 'Nike', density: 'Hyperdense',
        stats: [
            { label: 'Transit', pct: 35, color: '#3b82f6', info: 'Arterial transit routes nearby.' },
            { label: 'Competitor', pct: 25, color: '#f43f5e', info: 'Same-category rivals nearby.' },
            { label: 'Complementary', pct: 20, color: '#10b981', info: 'Footfall-driving destination anchors.' },
            { label: 'Demand', pct: 20, color: '#f59e0b', info: 'Flagship drop demand volume.' },
        ],
        pulse: { buzz: 98, synergy: 82, tension: 91 },
        anchorsTotal: 14,
        categories: {
            competitor: { label: 'Competitor', items: [{ name: 'Adidas', dist: 0.012 }, { name: 'H&M', dist: 0.009 }] },
            demand: { label: 'Demand', items: [{ name: 'Back Bay', dist: 0.011 }, { name: 'High Line', dist: 0.018 }] },
        },
    },
    {
        id: 'apple-yards',
        name: 'Apple Store',
        lat: 40.7545, lng: -74.0012,
        type: 'Tech', brand: 'Apple', density: 'Hyperdense',
        stats: [
            { label: 'Transit', pct: 15, color: '#3b82f6', info: 'Metro access for tech commuters.' },
            { label: 'Competitor', pct: 5, color: '#f43f5e', info: 'Same-category rivals nearby.' },
            { label: 'Complementary', pct: 60, color: '#10b981', info: 'Footfall-driving destination anchors.' },
            { label: 'Demand', pct: 20, color: '#f59e0b', info: 'Product demand & service volume.' },
        ],
        pulse: { buzz: 94, synergy: 96, tension: 28 },
        anchorsTotal: 16,
        categories: {
            transit: { label: 'Transit', items: [{ name: 'NY Waterway', dist: 0.01 }, { name: 'Helipad 1', dist: 0.02 }] },
            competitor: { label: 'Competitor', items: [{ name: 'Best Buy', dist: 0.015 }, { name: 'Samsung Hub', dist: 0.01 }] },
            complementary: { label: 'Complementary', items: [{ name: 'Disney HQ', dist: 0.018 }, { name: 'Wells Fargo', dist: 0.011 }] },
            demand: { label: 'Demand', items: [{ name: 'Vessel North', dist: 0.014 }] },
        },
    },
];

type LocationData = typeof locationsData[0];

// --- SUB-COMPONENTS ---

const AnimatedCounter = ({ value }: { value: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const controls = animate(0, value, {
            duration: 2,
            ease: [0.16, 1, 0.3, 1],
            onUpdate(v: number) {
                if (nodeRef.current) nodeRef.current.textContent = String(Math.round(v));
            },
        });
        return () => controls.stop();
    }, [value]);
    return <span ref={nodeRef} />;
};

const TelemetryBar = ({
    label, value, color, info, delay = 0,
}: {
    label: string; value: number; color: string; info: string; delay?: number;
}) => (
    <div className="flex flex-col gap-1.5 w-full">
        <div className="flex justify-between items-center">
            <span className="text-white/60 font-bold text-[9px] uppercase tracking-[0.18em]">{label}</span>
            <span className="text-white font-black text-[13px] tracking-tight tabular-nums">{value}%</span>
        </div>
        <div className="h-[3px] w-full bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
                style={{ backgroundColor: color }}
                className="h-full rounded-full"
            />
        </div>
        <span className="text-white/55 text-[12px] leading-tight">{info}</span>
    </div>
);

const GlassPanelInner = ({ children: panelChildren, isMobile = false }: { children: React.ReactNode; isMobile?: boolean }) => {
        const panelRef = useRef<HTMLDivElement>(null);
        useEffect(() => {
            const syncPointer = (e: PointerEvent) => {
                if (panelRef.current) {
                    const rect = panelRef.current.getBoundingClientRect();
                    panelRef.current.style.setProperty('--x', (e.clientX - rect.left).toFixed(2));
                    panelRef.current.style.setProperty('--y', (e.clientY - rect.top).toFixed(2));
                }
            };
            window.addEventListener('pointermove', syncPointer);
            return () => window.removeEventListener('pointermove', syncPointer);
        }, []);

        return (
            <motion.div
                ref={panelRef}
                initial={isMobile ? { y: 40, opacity: 0 } : { x: '110%', opacity: 0 }}
                animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 24, delay: 0.4 }}
                style={{
                    backgroundImage: `radial-gradient(450px 450px at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), rgba(45, 212, 191, 0.08), transparent)`,
                    backgroundColor: 'rgba(0, 0, 0, 0.98)',
                    border: '2px solid rgba(255, 255, 255, 0.12)',
                }}
                className="atlas-glass-panel absolute top-6 right-6 bottom-6 w-[420px] z-[2000] rounded-[44px] backdrop-blur-md shadow-[0_50px_120px_-30px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
            >
                <div className="relative z-10 flex flex-col h-full no-scrollbar overflow-y-auto">{panelChildren}</div>
        </motion.div>
    );
};

// --- MAIN COMPONENT ---

export default function DigitalAtlas() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const lRef = useRef<any>(null);
    const layersRef = useRef<{ overview: any; spider: any }>({ overview: null, spider: null });
    const [activeStore, setActiveStore] = useState<LocationData | null>(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const initMap = async () => {
            const L: any = await new Promise((resolve) => {
                if ((window as any).L) return resolve((window as any).L);
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => resolve((window as any).L);
                document.head.appendChild(script);
            });

            if (!mapInstance.current && mapContainerRef.current) {
                const corner1 = L.latLng(40.7505, -74.0052);
                const corner2 = L.latLng(40.7565, -73.9972);
                const bounds = L.latLngBounds(corner1, corner2);

                const map = L.map(mapContainerRef.current, {
                    zoomControl: false,
                    scrollWheelZoom: false,
                    touchZoom: false,
                    doubleClickZoom: false,
                    keyboard: false,
                    dragging: true,
                    // Lock zoom so scroll wheel passes through to Lenis/page
                    minZoom: 18.2,
                    maxZoom: 18.2,
                    maxBounds: bounds,
                    maxBoundsViscosity: 1.0,
                }).setView([40.7535, -74.0012], 18.2);

                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);
                layersRef.current.overview = L.layerGroup().addTo(map);
                layersRef.current.spider = L.layerGroup();
                mapInstance.current = map;
                lRef.current = L;
                renderMarkers(L, map);

                // Click on empty map area → reset to idle state
                map.on('click', () => {
                    resetView();
                });
            }
        };
        initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createDivIcon = (L: any, color: string, isCenter = false, delay = 0, isOverview = false) => L.divIcon({
        className: 'custom-icon',
        html: `<div class="marker-wrapper ${isCenter ? 'is-center' : isOverview ? 'is-overview' : 'is-satellite'}"
                     style="--color: ${color}; --delay: ${delay}ms; --size: ${isCenter ? '52px' : '40px'}">
                 <div class="marker-ring"></div>
                 ${isOverview ? '<div class="marker-pulse-ring"></div>' : ''}
                 <div class="marker-core"></div>
               </div>`,
        iconSize: [52, 52],
        iconAnchor: [26, 26],
    });

    const renderMarkers = (L: any, map: any) => {
        layersRef.current.overview.clearLayers();
        locationsData.forEach(store => {
            const marker = L.marker([store.lat, store.lng], {
                icon: createDivIcon(L, '#008a89', false, 0, true),
                zIndexOffset: 500, // overview markers always above satellite labels
            }).addTo(layersRef.current.overview);
            marker.bindTooltip(`<span class="map-tooltip-pro">${store.name}</span>`, {
                permanent: true, direction: 'top', offset: [0, -38], className: 'tooltip-shell tooltip-shell--overview',
            });
            // Stop click propagating to map (which would trigger resetView)
            marker.on('click', (ev: any) => {
                L.DomEvent.stopPropagation(ev);
                triggerSpiderView(store, L, map);
            });
            // Magnetic hover — scale the inner wrapper only, never touch the outer
            // element's transform (Leaflet uses it for positioning).
            marker.on('mouseover', (ev: any) => {
                const el = ev.target.getElement();
                const inner = el?.querySelector('.marker-wrapper') as HTMLElement | null;
                if (inner) inner.style.transform = 'scale(1.18)';
            });
            marker.on('mouseout', (ev: any) => {
                const el = ev.target.getElement();
                const inner = el?.querySelector('.marker-wrapper') as HTMLElement | null;
                if (inner) inner.style.transform = 'scale(1)';
            });
        });
    };

    const triggerSpiderView = (store: LocationData, L: any, map: any) => {
        setActiveStore(store);
        layersRef.current.spider.clearLayers();
        // Dim overview markers but keep them visible — add a CSS class rather than removing
        const overviewEl = layersRef.current.overview._container || layersRef.current.overview.getContainer?.();
        if (overviewEl) {
            overviewEl.style.opacity = '0.35';
            overviewEl.style.transition = 'opacity 0.4s ease';
            overviewEl.style.pointerEvents = 'none';
        }
        if (!map.hasLayer(layersRef.current.spider)) {
            layersRef.current.spider.addTo(map);
        }

        map.panTo([store.lat, store.lng + 0.0006], { animate: true, duration: 1.2 });
        // Center marker — stop propagation so clicking it doesn't reset
        const centerM = L.marker([store.lat, store.lng], { icon: createDivIcon(L, '#fff', true), zIndexOffset: 1000 }).addTo(layersRef.current.spider);
        centerM.on('click', (ev: any) => L.DomEvent.stopPropagation(ev));

        let globalIndex = 0;
        Object.keys(store.categories).forEach((catKey) => {
            const cat = (store.categories as any)[catKey];
            const color = locationsData[0].stats.find(s => s.label.toLowerCase() === catKey || s.label.toLowerCase() === 'demand')?.color || '#fff';

            cat.items.forEach((item: { name: string; dist: number }) => {
                globalIndex++;
                const nodeDelay = globalIndex * 100;
                const angle = Math.random() * Math.PI * 2;
                const radius = 0.0003 + (Math.random() * 0.0004);
                const latLng: [number, number] = [store.lat + radius * Math.sin(angle), store.lng + radius * Math.cos(angle) * 1.3];

                L.polyline([[store.lat, store.lng], latLng], {
                    color, weight: 2.2, opacity: 0.8,
                    dashArray: '8, 12',
                    className: `spider-line-instant-flow line-delay-${globalIndex}`,
                }).addTo(layersRef.current.spider);

                const satMarker = L.marker(latLng, {
                    icon: createDivIcon(L, color, false, nodeDelay + 100),
                    zIndexOffset: 0, // lower than overview markers (500)
                }).addTo(layersRef.current.spider);

                satMarker.bindTooltip(`<span class="sat-label-pro label-delay-${globalIndex}">${item.name}</span>`, {
                    permanent: true, direction: 'right', offset: [20, 0], className: 'sat-label-shell',
                });
                // Stop propagation so clicking satellite doesn't reset
                satMarker.on('click', (ev: any) => L.DomEvent.stopPropagation(ev));
            });
        });
    };

    const resetView = () => {
        setActiveStore(null);
        if (mapInstance.current) {
            layersRef.current.spider.removeFrom(mapInstance.current);
            // Restore overview markers to full visibility
            const overviewEl = layersRef.current.overview._container || layersRef.current.overview.getContainer?.();
            if (overviewEl) {
                overviewEl.style.opacity = '1';
                overviewEl.style.pointerEvents = 'auto';
            }
            mapInstance.current.panTo([40.7535, -74.0012], { animate: true, duration: 1.2 });
        }
    };

    return (
        <div className={`relative w-full bg-[#010101] ${isMobile ? 'flex flex-col rounded-[24px]' : 'aspect-video rounded-[44px]'} overflow-hidden border border-white/10 atlas-typography shadow-[0_60px_140px_-40px_rgba(0,0,0,1)]`}>
            {/* eslint-disable-next-line @next/next/no-css-tags */}
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

            <style>{`
                .leaflet-container { background: #010101 !important; cursor: crosshair; }
                .leaflet-control-attribution { display: none; }

                /* Overview markers (Starbucks, Sephora, etc.) — always highest z */
                .tooltip-shell--overview { z-index: 900 !important; }

                .marker-wrapper { position: relative; width: var(--size); height: var(--size); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); will-change: transform; }

                .marker-core { width: 14px; height: 14px; background: var(--color); border-radius: 50%; z-index: 2; box-shadow: 0 0 20px var(--color); border: 2.5px solid rgba(255,255,255,0.6); }
                .marker-ring { position: absolute; inset: 0; border: 2px solid var(--color); border-radius: 50%; opacity: 0.45; transform: scale(0.7); will-change: transform, opacity; }

                /* Overview-specific: persistent double-ring radial pulse — slower, more elegant */
                .is-overview .marker-core { width: 16px; height: 16px; box-shadow: 0 0 28px var(--color), 0 0 8px var(--color); }
                .is-overview .marker-ring { animation: map-pulse 4.5s infinite cubic-bezier(0.15, 0, 0, 1); opacity: 0.6; }
                .is-overview .marker-pulse-ring {
                    position: absolute;
                    inset: -6px;
                    border: 1.5px solid var(--color);
                    border-radius: 50%;
                    opacity: 0;
                    animation: map-pulse 4.5s 2.25s infinite cubic-bezier(0.15, 0, 0, 1);
                }

                .is-satellite { opacity: 0; transform: scale(0); animation: bloom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: var(--delay); }
                @keyframes bloom { to { opacity: 1; transform: scale(1); } }

                /* Center marker: bloom in prominently on click, then pulse slowly */
                .is-center { animation: center-bloom 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes center-bloom { 0% { transform: scale(0.2); opacity: 0; } 60% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
                .is-center .marker-core { width: 30px; height: 30px; background: #fff; box-shadow: 0 0 60px #008a89, 0 0 20px rgba(0,138,137,0.5); border: none; }
                .is-center .marker-ring { border-color: #008a89; border-width: 2px; opacity: 1; animation: map-pulse 3.5s infinite cubic-bezier(0.15, 0, 0, 1); }
                @keyframes map-pulse { 0% { transform: scale(0.1); opacity: 1; } 100% { transform: scale(4.5); opacity: 0; } }

                .spider-line-instant-flow {
                    opacity: 0;
                    stroke-dasharray: 8, 12;
                    animation: fade-line 0.5s ease-out forwards, crawl-forever 40s linear infinite;
                }
                @keyframes fade-line { to { opacity: 0.8; } }
                @keyframes crawl-forever { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1000; } }

                ${Array.from({ length: 20 }).map((_, i) => `
                    .line-delay-${i} { animation-delay: ${i * 80}ms; }
                    .label-delay-${i} { animation: slide-in-glass 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; animation-delay: ${i * 80 + 300}ms; opacity: 0; }
                `).join('\n')}

                @keyframes slide-in-glass {
                    from { opacity: 0; transform: translateX(-12px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .tooltip-shell, .sat-label-shell { background: transparent !important; border: none !important; box-shadow: none !important; }

                .map-tooltip-pro {
                    background: rgba(6,6,6,0.92);
                    backdrop-filter: blur(24px) saturate(160%);
                    -webkit-backdrop-filter: blur(24px) saturate(160%);
                    color: rgba(255,255,255,0.92);
                    padding: 9px 20px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.14);
                    font-weight: 700;
                    font-size: 13px;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    box-shadow: 0 8px 28px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06);
                    pointer-events: none;
                }

                .sat-label-pro {
                    background: rgba(6,6,6,0.88);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    color: rgba(255,255,255,0.85);
                    padding: 6px 14px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.1);
                    font-weight: 600;
                    font-size: 12px;
                    letter-spacing: 0.01em;
                    white-space: nowrap;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.8);
                }

                .no-scrollbar::-webkit-scrollbar { display: none; }
                .atlas-typography { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }

                /* Idle panel shimmer border */
                .atlas-idle-panel {
                    position: relative;
                }
                .atlas-idle-panel::before {
                    content: '';
                    position: absolute;
                    inset: -1px;
                    border-radius: 36px;
                    padding: 2px;
                    background: linear-gradient(135deg, transparent 20%, rgba(0,138,137,0.3) 40%, rgba(0,138,137,0.6) 50%, rgba(0,138,137,0.3) 60%, transparent 80%);
                    background-size: 200% 200%;
                    animation: atlas-shimmer 3s ease-in-out infinite;
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                    z-index: 100;
                }
                @keyframes atlas-shimmer {
                    0%   { background-position: 200% 200%; }
                    50%  { background-position: 0% 0%; }
                    100% { background-position: 200% 200%; }
                }
            `}</style>

            {/* Map surface */}
            <div ref={mapContainerRef} className={`${isMobile ? 'relative w-full h-[280px]' : 'absolute inset-0'} z-0 grayscale-[0.65] brightness-[0.7]`} />

            {/* Details panel — always visible */}
            <GlassPanelInner isMobile={isMobile}>
                {!activeStore ? (
                    <div className="flex flex-col items-center justify-center h-full gap-6 px-10 text-center select-none atlas-idle-panel">
                        {/* Animated tapping hand + map pin */}
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                            className="relative"
                        >
                            <svg width="56" height="76" viewBox="0 0 56 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Shadow ellipse under pin */}
                                <ellipse cx="28" cy="68" rx="10" ry="4"
                                    fill="rgba(0,138,137,0.12)"
                                />
                                {/* Ripple rings from shadow */}
                                <motion.ellipse
                                    cx="28" cy="68" rx="10" ry="4"
                                    stroke="rgba(0,138,137,0.35)" strokeWidth="1"
                                    animate={{ rx: [10, 22], ry: [4, 9], opacity: [0.55, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut', delay: 0.4 }}
                                />
                                <motion.ellipse
                                    cx="28" cy="68" rx="6" ry="2.5"
                                    stroke="rgba(0,138,137,0.5)" strokeWidth="1"
                                    animate={{ rx: [6, 16], ry: [2.5, 6.5], opacity: [0.65, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
                                />
                                {/* Pin body — teardrop */}
                                <path
                                    d="M28 4C18.6 4 11 11.6 11 21c0 13.5 17 43 17 43s17-29.5 17-43C45 11.6 37.4 4 28 4z"
                                    fill="rgba(0,138,137,0.10)"
                                    stroke="rgba(0,138,137,0.55)"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                                {/* Inner glow ring */}
                                <circle cx="28" cy="21" r="9"
                                    fill="rgba(0,138,137,0.15)"
                                    stroke="rgba(0,138,137,0.4)"
                                    strokeWidth="1"
                                />
                                {/* Center dot */}
                                <circle cx="28" cy="21" r="4.5"
                                    fill="rgba(0,138,137,0.9)"
                                />
                            </svg>
                            {/* Tapping hand icon */}
                            <motion.svg
                                width="24" height="24" viewBox="0 0 24 24" fill="none"
                                className="absolute -bottom-1 -right-2"
                                animate={{ y: [0, 4, 0], scale: [1, 0.92, 1] }}
                                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut', delay: 0.6 }}
                            >
                                <path d="M8 13V4.5a1.5 1.5 0 0 1 3 0V12" stroke="rgba(0,138,137,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11 11.5V10a1.5 1.5 0 0 1 3 0v1.5" stroke="rgba(0,138,137,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14 12V10.5a1.5 1.5 0 0 1 3 0V12" stroke="rgba(0,138,137,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M17 12V11.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6H12a6 6 0 0 1-5.21-3l-1.3-2.24A1.5 1.5 0 0 1 7 14.5" stroke="rgba(0,138,137,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </motion.svg>
                        </motion.div>
                        <p className="text-white/70 text-[14px] leading-relaxed font-semibold tracking-tight max-w-[220px]">
                            Tap any location to reveal its market intelligence
                        </p>
                    </div>
                ) : (
                <div className="p-7 flex-1 flex flex-col min-h-0">
                    <div className="flex flex-col gap-1.5 mb-6">
                        <h2 className="text-white font-black text-[30px] tracking-tight leading-none">{activeStore.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-widest leading-none" style={{ background: 'rgba(0,138,137,0.1)', border: '1px solid rgba(0,138,137,0.3)', color: '#008a89' }}>{activeStore.type}</span>
                            <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/40 font-bold text-[10px] uppercase tracking-widest leading-none">{activeStore.density}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mb-5">
                        <h3 className="text-white/50 font-bold text-[11px] uppercase tracking-[0.35em]">Market Composition</h3>
                        <div className="space-y-4">
                            {activeStore.stats.map((stat, i) => (
                                <TelemetryBar key={i} label={stat.label} value={stat.pct} color={stat.color} info={stat.info} delay={0.15 + i * 0.08} />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-5 border-t border-white/5">
                        <h3 className="text-white/50 font-bold text-[11px] uppercase tracking-[0.35em]">Intelligence Metrics</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.entries(activeStore.pulse).map(([key, val], i) => (
                                <div key={key} className="flex flex-col items-center gap-2.5 group">
                                    <div className="relative w-[80px] h-[80px] flex items-center justify-center">
                                        <svg className="absolute w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.04)" strokeWidth="10" fill="none" />
                                            <motion.circle
                                                cx="50" cy="50" r="44"
                                                stroke={key === 'buzz' ? '#f43f5e' : key === 'synergy' ? '#10b981' : '#f59e0b'}
                                                strokeWidth="10" fill="none"
                                                strokeDasharray={276}
                                                initial={{ strokeDashoffset: 276 }}
                                                animate={{ strokeDashoffset: 276 - (val / 100) * 276 }}
                                                transition={{ duration: 2, delay: 0.6 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="flex items-center justify-center w-full h-full z-10 group-hover:scale-110 transition-transform duration-500">
                                            <span className="text-white font-black text-[24px] tracking-tighter leading-none">
                                                <AnimatedCounter value={val} />
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.25em]">{key}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* AI Assessment */}
                    {(() => {
                        const avg = (activeStore.pulse.buzz + activeStore.pulse.synergy + (100 - activeStore.pulse.tension)) / 3;
                        const verdict = avg >= 78
                            ? { label: 'PRIME ZONE', copy: 'Exceptional synergy density. Recommend premium positioning.' }
                            : avg >= 60
                            ? { label: 'HIGH POTENTIAL', copy: 'Strong fundamentals with measurable growth runway.' }
                            : { label: 'MONITOR', copy: 'Competitive tension warrants a strategic review.' };
                        return (
                            <div className="mt-auto pt-5 border-t border-white/[0.06]">
                                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 block mb-4">AI Assessment</span>
                                <p className="font-black text-[20px] leading-none tracking-tight mb-2" style={{ color: '#008a89' }}>{verdict.label}</p>
                                <p className="text-white/35 text-[12px] leading-relaxed">{verdict.copy}</p>
                            </div>
                        );
                    })()}
                    <div className="h-2 shrink-0" />
                </div>
                )}
            </GlassPanelInner>

            {/* Guidance capsule */}
            <AnimatePresence>
                {!activeStore && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                        className="absolute bottom-8 left-0 right-0 z-[1000] flex justify-center items-center pointer-events-none"
                    >
                        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_48px_rgba(0,0,0,0.8)]">
                            <div className="relative flex items-center justify-center w-2.5 h-2.5">
                                <motion.div
                                    animate={{ scale: [1, 2.4, 1], opacity: [0.7, 0, 0.7] }}
                                    transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                                    className="absolute inset-0 rounded-full"
                                    style={{ background: '#008a89' }}
                                />
                                <div className="w-2 h-2 rounded-full z-10" style={{ background: '#008a89', boxShadow: '0 0 8px rgba(0,138,137,0.6)' }} />
                            </div>
                            <span className={`text-white/70 ${isMobile ? 'text-[11px]' : 'text-[13px]'} font-semibold tracking-wide`}>{isMobile ? 'Tap' : 'Click'} a location to reveal its market intelligence</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
