'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

declare global {
    interface Window {
        hbspt?: {
            forms: {
                create: (config: {
                    region: string;
                    portalId: string;
                    formId: string;
                    target: string;
                }) => void;
            };
        };
    }
}

export default function BookDemoPage() {
    const [activeTab, setActiveTab] = useState<'demo' | 'report'>('demo');

    useEffect(() => {
        document.body.classList.add('lenis-revealed');
        const params = new URLSearchParams(window.location.search);
        if (params.get('tab') === 'report') {
            setActiveTab('report');
        }
    }, []);

    useEffect(() => {
        const renderForm = () => {
            const targetDiv = document.getElementById('hs-form-target');
            if (targetDiv) targetDiv.innerHTML = ''; // prevent duplicate forms on swap

            window.hbspt?.forms.create({
                region: 'na2',
                portalId: '242333258',
                formId: activeTab === 'demo' ? '4a9b1d84-e1fe-43fc-a57e-61f7c09fa64d' : 'a11257e4-2b46-4806-afb0-ba0de41b33a7',
                target: '#hs-form-target',
            });
        };

        const existingScript = document.getElementById('hs-embed-script');
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'hs-embed-script';
            script.src = '//js-na2.hsforms.net/forms/embed/v2.js';
            script.charset = 'utf-8';
            script.type = 'text/javascript';
            script.onload = renderForm;
            document.head.appendChild(script);
        } else {
            if (window.hbspt) {
                renderForm();
            } else {
                // If script exists but hbspt isn't ready yet (rare race condition)
                existingScript.addEventListener('load', renderForm);
            }
        }
    }, [activeTab]);

    return (
        <>
            <Navbar />

            {/* Subtle grid — consistent with rest of site */}
            <div aria-hidden="true" className="bd-grid-bg" />

            <main className="bd-main">
                {/* ── LEFT PANEL — COPY ── */}
                <div className="bd-copy-panel">
                    <div className="bd-copy-inner">
                        <div className="bd-eyebrow">
                            <span className="bd-eyebrow-line" />
                            Propheus Retail AI Agent
                        </div>

                        <h1 className="bd-headline">
                            See how it works<br />
                            <em className="bd-headline-em">for your stores.</em>
                        </h1>

                        <p className="bd-sub">
                            In 30 minutes, you&apos;ll see how Propheus curates 140+ real-world signals across your locations — weather, competitor promos, footfall, local events — and converts them into store-specific action plans. Every week. Automatically.
                        </p>

                        <div className="bd-steps">
                            {[
                                {
                                    n: '01',
                                    t: 'Live signal curation',
                                    d: 'See 140+ signals layered across your store locations in real time.',
                                },
                                {
                                    n: '02',
                                    t: 'Weekly action plans',
                                    d: 'Store-by-store recommendations delivered before the week begins.',
                                },
                                {
                                    n: '03',
                                    t: 'Compounding intelligence',
                                    d: 'Reinforcement learning that gets sharper with every decision cycle.',
                                },
                            ].map(({ n, t, d }) => (
                                <div key={n} className="bd-step">
                                    <span className="bd-step-n">{n}</span>
                                    <div className="bd-step-body">
                                        <span className="bd-step-title">{t}</span>
                                        <span className="bd-step-desc">{d}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bd-quote">
                            <div className="bd-quote-bar" />
                            <div>
                                <p className="bd-quote-text">
                                    &ldquo;Real-world decisions. Before the week happens.&rdquo;
                                </p>
                                <span className="bd-quote-src">The Propheus Signal</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL — FORM ── */}
                <div className="bd-form-panel">
                    <div className="bd-form-outer">
                        <div className="bd-form-inner">
                            <div className="bd-tabs">
                                <button
                                    className={`bd-tab ${activeTab === 'demo' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('demo')}
                                >
                                    Book Demo
                                </button>
                                <button
                                    className={`bd-tab ${activeTab === 'report' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('report')}
                                >
                                    Request Report
                                </button>
                            </div>

                            <div className="bd-form-header">
                                <h2 className="bd-form-title">
                                    {activeTab === 'demo' ? 'Book your demo' : 'Request your report'}
                                </h2>
                                <p className="bd-form-sub">We&apos;ll be in touch within one business day.</p>
                            </div>

                            <div id="hs-form-target" className="bd-hs-form" />

                            <div className="bd-switch-wrapper">
                                <span className="bd-switch-text">
                                    {activeTab === 'demo' ? 'Looking for insights?' : 'Want to see it in action?'}
                                </span>
                                <button
                                    onClick={() => setActiveTab(activeTab === 'demo' ? 'report' : 'demo')}
                                    className="bd-switch-link"
                                >
                                    {activeTab === 'demo' ? 'Request Report instead' : 'Book Demo instead'}
                                </button>
                            </div>

                            <div className="bd-trust-row">
                                {[
                                    'No commitment required',
                                    '30 minutes',
                                    'Private & secure',
                                ].map(t => (
                                    <span key={t} className="bd-trust-item">
                                        <svg className="bd-trust-icon" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                            <circle cx="6" cy="6" r="5.5" stroke="#008a89" strokeWidth="1" />
                                            <path d="M3.5 6l1.8 1.8L8.5 4.5" stroke="#008a89" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bd-footer">
                <Link href="/retail" className="bd-footer-back">← Retail Agent</Link>
                <Image
                    src="/logo.avif"
                    alt="Propheus"
                    width={64}
                    height={20}
                    style={{ objectFit: 'contain', opacity: 0.32 }}
                />
                <Link href="/" className="bd-footer-back">← Home</Link>
            </footer>

            <style>{`
/* ═══════════════════════════════════════════
   BOOK DEMO PAGE — scoped styles  prefix: bd-
═══════════════════════════════════════════ */

.bd-grid-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image:
        linear-gradient(rgba(0,0,0,0.018) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.018) 1px, transparent 1px);
    background-size: 72px 72px;
}

.bd-main {
    position: relative;
    z-index: 1;
    min-height: 100svh;
    display: grid;
    grid-template-columns: 1fr 1fr;
}

/* ── Left copy panel ── */
.bd-copy-panel {
    background: #111111;
    display: flex;
    align-items: center;
    padding: 120px clamp(40px, 6vw, 88px) 80px;
    position: sticky;
    top: 0;
    min-height: 100svh;
}
.bd-copy-inner {
    max-width: 420px;
    width: 100%;
}

.bd-eyebrow {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #008a89;
    margin-bottom: 28px;
}
.bd-eyebrow-line {
    display: inline-block;
    width: 20px;
    height: 1.5px;
    background: #008a89;
    flex-shrink: 0;
}

.bd-headline {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-weight: 600;
    font-style: normal;
    font-size: clamp(2.2rem, 3.6vw, 3.6rem);
    line-height: 1.12;
    letter-spacing: -0.02em;
    color: #ffffff;
    margin: 0 0 24px;
}
.bd-headline-em {
    font-style: italic;
    color: rgba(255,255,255,0.42);
}

.bd-sub {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 15px;
    line-height: 1.78;
    color: rgba(255,255,255,0.42);
    margin: 0 0 48px;
    max-width: 400px;
}

/* Steps */
.bd-steps {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 0 0 44px;
    border-top: 1px solid rgba(255,255,255,0.07);
}
.bd-step {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    padding: 18px 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.bd-step-n {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #008a89;
    padding-top: 3px;
}
.bd-step-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.bd-step-title {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.82);
    letter-spacing: -0.01em;
}
.bd-step-desc {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 12px;
    line-height: 1.65;
    color: rgba(255,255,255,0.28);
}

/* Quote */
.bd-quote {
    display: flex;
    gap: 16px;
    padding-top: 28px;
    border-top: 1px solid rgba(255,255,255,0.06);
}
.bd-quote-bar {
    width: 2px;
    min-height: 40px;
    background: #008a89;
}
.bd-quote-text {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 13px;
    font-style: italic;
    color: rgba(255,255,255,0.35);
    line-height: 1.65;
    margin: 0 0 6px;
}
.bd-quote-src {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.16);
}

/* ── Right form panel ── */
.bd-form-panel {
    background: #f5f5f3;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 120px clamp(28px, 5vw, 72px) 80px;
    min-height: 100svh;
}
.bd-form-outer {
    width: 100%;
    max-width: 460px;
}
.bd-form-inner {
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 20px;
    padding: 48px clamp(28px, 4vw, 48px) 40px;
    box-shadow:
        0 1px 2px rgba(0,0,0,0.04),
        0 4px 16px rgba(0,0,0,0.05),
        0 24px 64px rgba(0,0,0,0.06);
}
.bd-form-header {
    margin-bottom: 36px;
    padding-bottom: 28px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
}
.bd-form-title {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-weight: 600;
    font-size: clamp(1.55rem, 2.1vw, 2.1rem);
    letter-spacing: -0.02em;
    color: #111111;
    margin: 0 0 8px;
    line-height: 1.15;
}
.bd-form-sub {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 13px;
    color: #aaaaaa;
    line-height: 1.5;
    margin: 0;
    letter-spacing: -0.01em;
}

/* HubSpot form overrides */
.bd-hs-form .hs-form-field {
    margin-bottom: 18px !important;
}
.bd-hs-form label {
    font-family: var(--font-body, 'Inter', sans-serif) !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    color: #666666 !important;
    display: block !important;
    margin-bottom: 7px !important;
}
.bd-hs-form input[type="text"],
.bd-hs-form input[type="email"],
.bd-hs-form input[type="tel"] {
    width: 100% !important;
    height: 48px !important;
    padding: 0 16px !important;
    border: 1px solid #e5e5e5 !important;
    border-radius: 10px !important;
    background: #fafafa !important;
    font-family: var(--font-body, 'Inter', sans-serif) !important;
    font-size: 14px !important;
    color: #111111 !important;
    outline: none !important;
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s !important;
    box-sizing: border-box !important;
    -webkit-appearance: none !important;
}
.bd-hs-form input[type="text"]:focus,
.bd-hs-form input[type="email"]:focus,
.bd-hs-form input[type="tel"]:focus {
    border-color: #008a89 !important;
    background: #ffffff !important;
    box-shadow: 0 0 0 3.5px rgba(0,138,137,0.1) !important;
}
.bd-hs-form .hs-fieldtype-booleancheckbox label,
.bd-hs-form .hs-fieldtype-checkbox label,
.bd-hs-form .hs-fieldtype-radio label {
    font-size: 12px !important;
    font-weight: 400 !important;
    letter-spacing: 0 !important;
    text-transform: none !important;
    color: #666666 !important;
}
.bd-hs-form input[type="submit"] {
    display: block !important;
    width: 100% !important;
    background: #111111 !important;
    color: #ffffff !important;
    font-family: var(--font-body, 'Inter', sans-serif) !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    letter-spacing: 0.05em !important;
    padding: 15px 28px !important;
    border: none !important;
    border-radius: 10px !important;
    cursor: pointer !important;
    transition: background 0.22s, transform 0.15s !important;
    margin-top: 12px !important;
    -webkit-appearance: none !important;
}
.bd-hs-form input[type="submit"]:hover {
    background: #008a89 !important;
}
.bd-hs-form input[type="submit"]:active {
    transform: scale(0.985) !important;
}
.bd-hs-form .hs-error-msgs {
    list-style: none !important;
    padding: 0 !important;
    margin: 5px 0 0 !important;
}
.bd-hs-form .hs-error-msgs li label {
    font-size: 10px !important;
    color: #dc2626 !important;
    font-weight: 500 !important;
    letter-spacing: 0.02em !important;
    text-transform: none !important;
}
.bd-hs-form .submitted-message {
    font-family: var(--font-body, 'Inter', sans-serif) !important;
    font-size: 15px !important;
    color: #111111 !important;
    padding: 28px 24px !important;
    border: 1px solid #e5e5e5 !important;
    border-left: 3px solid #008a89 !important;
    border-radius: 12px !important;
    background: #f8fffe !important;
    line-height: 1.65 !important;
}

/* Tabs & Switch Links */
.bd-tabs {
    display: flex;
    gap: 8px;
    background: #f5f5f3;
    padding: 6px;
    border-radius: 12px;
    margin-bottom: 32px;
}
.bd-tab {
    flex: 1;
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 12.5px;
    font-weight: 600;
    color: #888888;
    background: transparent;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: -0.01em;
}
.bd-tab:hover {
    color: #111111;
}
.bd-tab.active {
    background: #ffffff;
    color: #111111;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.bd-switch-wrapper {
    margin-top: 18px;
    text-align: center;
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}
.bd-switch-text {
    color: #888888;
}
.bd-switch-link {
    background: none;
    border: none;
    color: #008a89;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
}
.bd-switch-link:hover {
    color: #006b6a;
    text-decoration: underline;
}

/* Trust row */
.bd-trust-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(0,0,0,0.05);
}
.bd-trust-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 10.5px;
    font-weight: 500;
    color: #bbbbbb;
    letter-spacing: 0.01em;
}
.bd-trust-icon {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
}

/* ── Footer ── */
.bd-footer {
    position: relative;
    z-index: 1;
    background: #111111;
    padding: 20px clamp(24px, 5vw, 56px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255,255,255,0.06);
}
.bd-footer-back {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.26);
    text-decoration: none;
    transition: color 0.2s;
}
.bd-footer-back:hover { color: rgba(255,255,255,0.62); }

/* ── Responsive ── */
@media (max-width: 860px) {
    .bd-main { grid-template-columns: 1fr; }
    .bd-copy-panel {
        position: static;
        min-height: auto;
        padding: 100px clamp(24px, 5vw, 48px) 32px;
    }
    .bd-form-panel {
        order: -1;
        min-height: auto;
        padding: 100px clamp(24px, 5vw, 48px) 40px;
    }
    .bd-sub,
    .bd-steps,
    .bd-quote { display: none; }
    .bd-headline { margin-bottom: 0; }
    .bd-footer { flex-direction: column; gap: 12px; text-align: center; }
    .bd-trust-row { gap: 12px; }
}
            `}</style>
        </>
    );
}
