'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Retail Observability Agent — feature section.
 * Reused on the home page and the industries (retail) page.
 *
 * `accent` controls the brand highlight; the section is dark-themed to make
 * the product video pop and to blend with the surrounding dark sections.
 */
const STEPS = [
    { n: '01', t: 'Choose a store' },
    { n: '02', t: 'Choose a time period' },
    { n: '03', t: 'See the revenue uplift potential due to impact of events, competitor promos, and weather on the store operations.' },
];

export default function RetailAgentSection({
    id = 'retail-observability',
    ctaHref = '/book-demo',
    accent = '#29ffc9',
    ctaTextColor = '#070d0b',
}: {
    id?: string;
    ctaHref?: string;
    accent?: string;
    ctaTextColor?: string;
}) {
    return (
        <section id={id} className="ra-section" data-navbar-dark>
            <div className="ra-inner">
                {/* ── Left — copy ── */}
                <div className="ra-copy">
                    <div className="ra-eyebrow" style={{ color: accent }}>
                        <span className="ra-eyebrow-line" style={{ background: accent }} />
                        Retail Observability Platform
                    </div>

                    <h2 className="ra-heading">
                        Plug into the Physical World<br />
                        <em>Around Your Retail Store</em>
                    </h2>

                    <p className="ra-body">
                        Tracks millions of demand moments across weather, competitor promotions,
                        and events around your store to give you targeted staffing, assortment,
                        promotions, and inventory recommendations. You take action and gain revenue.
                    </p>

                    <div className="ra-steps">
                        {STEPS.map(({ n, t }) => (
                            <div key={n} className="ra-step">
                                <span className="ra-step-n" style={{ color: accent }}>{n}</span>
                                <span className="ra-step-t">{t}</span>
                            </div>
                        ))}
                    </div>

                    <Link href={ctaHref} className="ra-cta" style={{ background: accent, color: ctaTextColor }}>
                        Try Now for Free! <ArrowRight size={13} strokeWidth={2.5} />
                    </Link>
                </div>

                {/* ── Right — product video ── */}
                <div className="ra-media">
                    <div className="ra-video-frame">
                        <video
                            className="ra-video"
                            src="/retail-agent/demo.mp4"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                        />
                    </div>
                </div>
            </div>

            <style>{`
.ra-section {
    position: relative;
    background: #070d0b;
    padding: clamp(72px, 10vw, 130px) clamp(24px, 6vw, 80px);
    border-top: 1px solid rgba(41,255,201,0.08);
    overflow: hidden;
}
.ra-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1.05fr;
    gap: clamp(40px, 6vw, 80px);
    align-items: center;
}
.ra-copy { display: flex; flex-direction: column; }
.ra-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-body);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin-bottom: 26px;
}
.ra-eyebrow-line { width: 20px; height: 1.5px; display: inline-block; flex-shrink: 0; }
.ra-heading {
    font-family: var(--font-heading);
    font-weight: 600;
    font-size: clamp(2rem, 3.4vw, 3rem);
    line-height: 1.16;
    letter-spacing: -0.02em;
    color: #ffffff;
    margin: 0 0 22px;
}
.ra-heading em { font-style: italic; color: rgba(255,255,255,0.5); }
.ra-body {
    font-family: var(--font-body);
    font-size: clamp(0.95rem, 1.2vw, 1.05rem);
    line-height: 1.7;
    color: rgba(255,255,255,0.55);
    margin: 0 0 36px;
    max-width: 520px;
}
.ra-steps {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 0 0 38px;
    border-top: 1px solid rgba(255,255,255,0.08);
}
.ra-step {
    display: flex;
    gap: 18px;
    align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255,255,255,0.07);
}
.ra-step-n {
    font-family: var(--font-body);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    padding-top: 3px;
    flex-shrink: 0;
}
.ra-step-t {
    font-family: var(--font-body);
    font-size: 0.92rem;
    font-weight: 500;
    line-height: 1.55;
    color: rgba(255,255,255,0.82);
    letter-spacing: -0.01em;
}
.ra-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    align-self: flex-start;
    color: #070d0b;
    font-family: var(--font-body);
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 15px 30px;
    border-radius: 3px;
    text-decoration: none;
    transition: transform 0.18s ease, box-shadow 0.25s ease, filter 0.2s ease;
}
.ra-cta:hover {
    transform: translateY(-1px);
    filter: brightness(1.06);
    box-shadow: 0 8px 28px rgba(41,255,201,0.28);
}
.ra-media { position: relative; }
.ra-video-frame {
    position: relative;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.1);
    background: #0a1210;
    box-shadow: 0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(41,255,201,0.06);
}
.ra-video {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 10;
    object-fit: cover;
}
@media (max-width: 900px) {
    .ra-inner { grid-template-columns: 1fr; gap: 40px; }
    .ra-media { order: -1; }
}
            `}</style>
        </section>
    );
}
