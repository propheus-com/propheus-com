'use client';

/**
 * IndustryVisual — a unique, abstract animated graphic per industry.
 * No metrics/numbers: purely qualitative motion that evokes each domain.
 * Inherits the active accent via the `--ip-accent` CSS variable set on the
 * parent panel, so colours stay on-brand per tab.
 */

const LABELS: Record<string, string> = {
    cpg: 'Distribution Network',
    travel: 'Live Demand Windows',
    o2o: 'Live Operational Zones',
    fintech: 'Transaction Flow',
    realestate: 'Location Scoring',
    telecom: 'Network Signal',
};

function CpgNetwork() {
    // central hub + satellites with pulsing nodes and animated dashed links
    const sats = [
        { x: 60, y: 58 }, { x: 220, y: 48 }, { x: 44, y: 196 },
        { x: 236, y: 210 }, { x: 150, y: 28 },
    ];
    return (
        <svg viewBox="0 0 280 250" className="iv-svg" aria-hidden="true">
            {sats.map((s, i) => (
                <line
                    key={`l${i}`} x1="140" y1="125" x2={s.x} y2={s.y}
                    className="iv-cpg-link" style={{ animationDelay: `${i * 0.25}s` }}
                />
            ))}
            {sats.map((s, i) => (
                <circle
                    key={`n${i}`} cx={s.x} cy={s.y} r="7"
                    className="iv-cpg-node" style={{ animationDelay: `${i * 0.3}s` }}
                />
            ))}
            <circle cx="140" cy="125" r="20" className="iv-cpg-hub-ring" />
            <circle cx="140" cy="125" r="10" className="iv-cpg-hub" />
        </svg>
    );
}

function TravelBars() {
    const bars = [0.45, 0.7, 0.95, 0.55, 0.85, 0.6, 0.75];
    return (
        <div className="iv-bars">
            {bars.map((h, i) => (
                <span key={i} className="iv-bar" style={{ ['--h' as string]: h, animationDelay: `${i * 0.12}s` }} />
            ))}
        </div>
    );
}

function O2OZones() {
    const zones = [
        { x: 30, y: 34 }, { x: 68, y: 60 }, { x: 22, y: 70 }, { x: 78, y: 28 }, { x: 50, y: 48 },
    ];
    return (
        <div className="iv-zones">
            {zones.map((z, i) => (
                <span key={i} className="iv-zone" style={{ left: `${z.x}%`, top: `${z.y}%`, animationDelay: `${i * 0.5}s` }}>
                    <span className="iv-zone-ring" style={{ animationDelay: `${i * 0.5}s` }} />
                    <span className="iv-zone-core" />
                </span>
            ))}
        </div>
    );
}

function FintechFlow() {
    return (
        <div className="iv-flow">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="iv-rail">
                    <span className="iv-packet" style={{ animationDelay: `${i * 0.45}s` }} />
                </div>
            ))}
        </div>
    );
}

function RealEstateScan() {
    const pins = Array.from({ length: 16 });
    return (
        <div className="iv-scan">
            <div className="iv-grid">
                {pins.map((_, i) => (
                    <span key={i} className="iv-pin" style={{ animationDelay: `${(i % 4) * 0.18 + Math.floor(i / 4) * 0.12}s` }} />
                ))}
            </div>
            <span className="iv-scanline" />
        </div>
    );
}

function TelecomSignal() {
    return (
        <div className="iv-signal">
            {[0, 1, 2, 3].map((i) => (
                <span key={i} className="iv-arc" style={{ animationDelay: `${i * 0.7}s` }} />
            ))}
            <span className="iv-tower" />
            <span className="iv-tower-base" />
        </div>
    );
}

function Stage({ id }: { id: string }) {
    switch (id) {
        case 'cpg': return <CpgNetwork />;
        case 'travel': return <TravelBars />;
        case 'o2o': return <O2OZones />;
        case 'fintech': return <FintechFlow />;
        case 'realestate': return <RealEstateScan />;
        case 'telecom': return <TelecomSignal />;
        default: return null;
    }
}

export default function IndustryVisual({ id }: { id: string }) {
    return (
        <div className="iv-card">
            <div className="iv-head">
                <span className="iv-dot" />
                <span className="iv-label">{LABELS[id] ?? 'Signal Field'}</span>
            </div>
            <div className="iv-stage">
                <Stage id={id} />
            </div>

            <style>{`
.iv-card {
    width: 100%;
    max-width: 420px;
    aspect-ratio: 4 / 4.4;
    background: #ffffff;
    border: 1px solid #ececec;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
}
.iv-head {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 16px 22px;
    border-bottom: 1px solid #f0f0f0;
    background: #fbfbfb;
}
.iv-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--ip-accent, #008a89);
    animation: iv-blink 1.6s step-end infinite;
}
@keyframes iv-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
.iv-label {
    font-family: var(--font-body);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #aaa;
}
.iv-stage {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 26px;
    background:
        radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--ip-accent, #008a89) 5%, transparent), transparent 60%);
}
.iv-svg { width: 100%; height: 100%; overflow: visible; }

/* CPG — distribution network */
.iv-cpg-link {
    stroke: var(--ip-accent, #008a89);
    stroke-width: 1;
    stroke-opacity: 0.4;
    stroke-dasharray: 4 5;
    animation: iv-dash 1.4s linear infinite;
}
@keyframes iv-dash { to { stroke-dashoffset: -18; } }
.iv-cpg-node {
    fill: var(--ip-accent, #008a89);
    transform-origin: center;
    transform-box: fill-box;
    animation: iv-node 2.6s ease-in-out infinite;
}
@keyframes iv-node { 0%,100%{opacity:0.5; transform:scale(1)} 50%{opacity:1; transform:scale(1.25)} }
.iv-cpg-hub-ring { fill: color-mix(in srgb, var(--ip-accent, #008a89) 12%, transparent); stroke: var(--ip-accent, #008a89); stroke-width: 1.5; }
.iv-cpg-hub { fill: var(--ip-accent, #008a89); }

/* Travel — demand windows */
.iv-bars { display: flex; align-items: flex-end; gap: 10px; height: 70%; width: 80%; }
.iv-bar {
    flex: 1;
    height: 100%;
    border-radius: 4px 4px 2px 2px;
    background: linear-gradient(to top, var(--ip-accent, #008a89), color-mix(in srgb, var(--ip-accent, #008a89) 35%, #fff));
    transform-origin: bottom;
    transform: scaleY(calc(var(--h) * 0.55));
    animation: iv-bar 2.4s ease-in-out infinite;
    opacity: 0.9;
}
@keyframes iv-bar {
    0%,100% { transform: scaleY(calc(var(--h) * 0.5)); }
    50%     { transform: scaleY(var(--h)); }
}

/* O2O — live zones */
.iv-zones { position: relative; width: 100%; height: 100%; }
.iv-zone { position: absolute; width: 0; height: 0; }
.iv-zone-core {
    position: absolute; left: -4px; top: -4px;
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--ip-accent, #008a89);
    box-shadow: 0 0 10px color-mix(in srgb, var(--ip-accent, #008a89) 60%, transparent);
}
.iv-zone-ring {
    position: absolute; left: -4px; top: -4px;
    width: 8px; height: 8px; border-radius: 50%;
    border: 1.5px solid var(--ip-accent, #008a89);
    animation: iv-ring 2.8s ease-out infinite;
}
@keyframes iv-ring {
    0%   { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(7); opacity: 0; }
}

/* FinTech — transaction flow */
.iv-flow { display: flex; flex-direction: column; gap: 22px; width: 86%; }
.iv-rail {
    position: relative;
    height: 2px;
    border-radius: 2px;
    background: #eee;
    overflow: hidden;
}
.iv-packet {
    position: absolute; top: 50%; left: 0;
    width: 38%; height: 3px; transform: translateY(-50%);
    border-radius: 3px;
    background: linear-gradient(90deg, transparent, var(--ip-accent, #008a89));
    animation: iv-flow 2.2s linear infinite;
}
@keyframes iv-flow { from { left: -40%; } to { left: 100%; } }

/* Real Estate — location scoring */
.iv-scan { position: relative; width: 80%; height: 80%; overflow: hidden; border-radius: 10px; }
.iv-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 0;
    width: 100%; height: 100%;
    place-items: center;
}
.iv-pin {
    width: 9px; height: 9px; border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    background: color-mix(in srgb, var(--ip-accent, #008a89) 30%, #dcdcdc);
    animation: iv-pin 3s ease-in-out infinite;
}
@keyframes iv-pin {
    0%,100% { background: color-mix(in srgb, var(--ip-accent, #008a89) 25%, #dcdcdc); }
    50%     { background: var(--ip-accent, #008a89); }
}
.iv-scanline {
    position: absolute; left: 0; right: 0; top: 0; height: 28%;
    background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--ip-accent, #008a89) 22%, transparent));
    border-bottom: 1.5px solid var(--ip-accent, #008a89);
    animation: iv-sweep 3s ease-in-out infinite;
}
@keyframes iv-sweep { 0%{ transform: translateY(-30%);} 50%{ transform: translateY(330%);} 100%{ transform: translateY(-30%);} }

/* Telecom — signal coverage */
.iv-signal { position: relative; width: 100%; height: 100%; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 18%; }
.iv-tower {
    width: 3px; height: 64px; border-radius: 2px;
    background: var(--ip-accent, #008a89);
    position: relative; z-index: 2;
}
.iv-tower-base {
    position: absolute; bottom: calc(18% - 6px); left: 50%; transform: translateX(-50%);
    width: 18px; height: 6px; border-radius: 2px;
    background: color-mix(in srgb, var(--ip-accent, #008a89) 45%, #ccc);
    z-index: 2;
}
.iv-arc {
    position: absolute; bottom: 18%; left: 50%;
    width: 40px; height: 40px;
    margin-left: -20px; margin-bottom: 50px;
    border: 2px solid var(--ip-accent, #008a89);
    border-radius: 50%;
    animation: iv-wave 2.8s ease-out infinite;
}
@keyframes iv-wave {
    0%   { transform: scale(0.2); opacity: 0.9; }
    100% { transform: scale(2.6); opacity: 0; }
}

@media (max-width: 860px) {
    .iv-card { max-width: none; aspect-ratio: 4 / 3.4; }
}
            `}</style>
        </div>
    );
}
