'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { analytics } from '@/lib/analytics';

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

/* ── Client-provided HubSpot form (first name + company email) ── */
const HS_REGION = 'na2';
const HS_PORTAL_ID = '242333258';
const HS_FORM_ID = '99a3ca15-8fac-40aa-8065-63c7f093451c';

/* ── Whitepaper PDF (lives in /public/assets/references) ── */
const WHITEPAPER_URL = '/assets/references/Telecom White Paper June 2026 (1).pdf';
const WHITEPAPER_FILENAME = 'Propheus-Telecom-Whitepaper-June-2026.pdf';

const SECTIONS = [
    'Two Problems Telecom is Struggling to Solve — where to open next and who to win',
    'AI Agents can Now Plug into the Physical World',
    'The Telecom Landscape in APAC',
    'How Telecom Operators can Plug into the Physical World & Take High-Impact Decisions',
];

export default function WhitepaperPage() {
    const downloadedRef = useRef(false);

    /* Trigger the PDF download once the form is successfully submitted */
    const triggerDownload = () => {
        if (downloadedRef.current) return;
        downloadedRef.current = true;
        const a = document.createElement('a');
        a.href = encodeURI(WHITEPAPER_URL);
        a.download = WHITEPAPER_FILENAME;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        analytics.track('whitepaper_downloaded', {
            whitepaper: 'telecom_june_2026',
            page: window.location.pathname,
        });
    };

    /* Mark navbar-dependent state + listen for HubSpot form lifecycle messages */
    useEffect(() => {
        document.body.classList.add('lenis-revealed');

        const onHsMessage = (event: MessageEvent) => {
            if (!event.data || event.data.type !== 'hsFormCallback') return;
            const { eventName, id } = event.data as { eventName: string; id?: string };
            if (id && id !== HS_FORM_ID) return;

            if (eventName === 'onFormReady') {
                // Relabel the form's submit button to "Download Now"
                const submit = document.querySelector<HTMLInputElement>(
                    '#wp-hs-form-target input[type="submit"]'
                );
                if (submit) submit.value = 'Download Now';
            } else if (eventName === 'onFormSubmit') {
                analytics.track('form_submitted', {
                    form_id: 'hubspot_whitepaper_telecom',
                    page: window.location.pathname,
                });
            } else if (eventName === 'onFormSubmitted') {
                analytics.track('form_submission_success', {
                    form_id: 'hubspot_whitepaper_telecom',
                    page: window.location.pathname,
                });
                triggerDownload();
            }
        };

        window.addEventListener('message', onHsMessage);
        return () => window.removeEventListener('message', onHsMessage);
    }, []);

    /* Load the HubSpot embed script and render the form */
    useEffect(() => {
        const renderForm = () => {
            const targetDiv = document.getElementById('wp-hs-form-target');
            if (targetDiv) targetDiv.innerHTML = '';
            window.hbspt?.forms.create({
                region: HS_REGION,
                portalId: HS_PORTAL_ID,
                formId: HS_FORM_ID,
                target: '#wp-hs-form-target',
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
        } else if (window.hbspt) {
            renderForm();
        } else {
            existingScript.addEventListener('load', renderForm);
        }
    }, []);

    return (
        <>
            <Navbar />

            {/* Subtle grid — consistent with rest of site */}
            <div aria-hidden="true" className="wp-grid-bg" />

            <main className="wp-main">
                {/* ── LEFT PANEL — COPY ── */}
                <div className="wp-copy-panel">
                    {/* Ambient teal glow accents */}
                    <div aria-hidden="true" className="wp-glow wp-glow-a" />
                    <div aria-hidden="true" className="wp-glow wp-glow-b" />

                    <div className="wp-copy-inner">
                        <div className="wp-eyebrow wp-anim" style={{ animationDelay: '0.05s' }}>
                            <span className="wp-eyebrow-line" />
                            Whitepaper
                        </div>

                        <div className="wp-chips wp-anim" style={{ animationDelay: '0.1s' }}>
                            <span className="wp-chip">APAC Telecom</span>
                            <span className="wp-chip">Physical AI</span>
                            <span className="wp-chip">June 2026</span>
                        </div>

                        <h1 className="wp-headline wp-anim" style={{ animationDelay: '0.16s' }}>
                            A Paradigm Shift in<br />
                            <em className="wp-headline-em">Telecom Economics</em>
                        </h1>

                        <p className="wp-sub wp-anim" style={{ animationDelay: '0.22s' }}>
                            Telecom operators in APAC are rapidly adopting AI &mdash; but are missing
                            out on two areas that secure long-term returns: where to build the next
                            infrastructure, and who to target and win.
                        </p>

                        <div className="wp-toc-label wp-anim" style={{ animationDelay: '0.28s' }}>
                            In this whitepaper, we outline
                        </div>
                        <ol className="wp-toc">
                            {SECTIONS.map((s, i) => (
                                <li
                                    key={i}
                                    className="wp-toc-item wp-anim"
                                    style={{ animationDelay: `${0.32 + i * 0.06}s` }}
                                >
                                    <span className="wp-toc-n">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="wp-toc-text">{s}</span>
                                </li>
                            ))}
                        </ol>

                        <div className="wp-quote wp-anim" style={{ animationDelay: '0.6s' }}>
                            <div className="wp-quote-bar" />
                            <div>
                                <p className="wp-quote-text">
                                    &ldquo;Plug into the physical world. Take high-impact decisions.&rdquo;
                                </p>
                                <span className="wp-quote-src">The Propheus Signal</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL — FORM ── */}
                <div className="wp-form-panel">
                    <div className="wp-form-outer wp-anim" style={{ animationDelay: '0.2s' }}>
                        {/* Whitepaper cover preview — actual first page of the PDF */}
                        <div className="wp-cover-row">
                            <Image
                                src="/assets/references/telecom-whitepaper-cover.png"
                                alt="A Paradigm Shift in Telecom Economics — whitepaper cover"
                                width={132}
                                height={187}
                                className="wp-cover-img"
                                priority
                            />
                            <div className="wp-cover-meta">
                                <span className="wp-cover-meta-kicker">Free report</span>
                                <span className="wp-cover-meta-title">Telecom Economics</span>
                                <span className="wp-cover-meta-detail">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                    PDF &middot; APAC &middot; 2025&ndash;26
                                </span>
                            </div>
                        </div>

                        <div className="wp-form-inner">
                            <div className="wp-form-header">
                                <h2 className="wp-form-title">Download the whitepaper</h2>
                                <p className="wp-form-sub">
                                    Enter your details and the PDF will download instantly.
                                </p>
                            </div>

                            <div id="wp-hs-form-target" className="wp-hs-form" />

                            <div className="wp-trust-row">
                                {['Instant download', 'No spam', 'Private & secure'].map(t => (
                                    <span key={t} className="wp-trust-item">
                                        <svg className="wp-trust-icon" viewBox="0 0 12 12" fill="none" aria-hidden="true">
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

            <footer className="wp-footer">
                <Link href="/industries" className="wp-footer-back">← Industries</Link>
                <Image
                    src="/logo.avif"
                    alt="Propheus"
                    width={64}
                    height={20}
                    style={{ objectFit: 'contain', opacity: 0.32 }}
                />
                <Link href="/" className="wp-footer-back">← Home</Link>
            </footer>

            <style>{`
/* ═══════════════════════════════════════════
   WHITEPAPER PAGE — scoped styles  prefix: wp-
═══════════════════════════════════════════ */

.wp-grid-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image:
        linear-gradient(rgba(0,0,0,0.018) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.018) 1px, transparent 1px);
    background-size: 72px 72px;
}

.wp-main {
    position: relative;
    z-index: 1;
    min-height: 100svh;
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
}

/* Entrance animation */
@keyframes wp-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
}
.wp-anim {
    opacity: 0;
    animation: wp-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@media (prefers-reduced-motion: reduce) {
    .wp-anim { animation: none; opacity: 1; }
}

/* ── Left copy panel ── */
.wp-copy-panel {
    background:
        radial-gradient(120% 90% at 0% 0%, #0c1a18 0%, transparent 55%),
        radial-gradient(120% 90% at 100% 100%, #0a1614 0%, transparent 55%),
        #080d0c;
    display: flex;
    align-items: center;
    padding: 120px clamp(40px, 6vw, 96px) 80px;
    position: sticky;
    top: 0;
    min-height: 100svh;
    overflow: hidden;
}
/* Fine vertical signal lines in the dark panel */
.wp-copy-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
    background-size: 88px 100%;
    -webkit-mask-image: radial-gradient(ellipse 90% 70% at 30% 20%, black 10%, transparent 80%);
    mask-image: radial-gradient(ellipse 90% 70% at 30% 20%, black 10%, transparent 80%);
    pointer-events: none;
}
.wp-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
    z-index: 0;
}
.wp-glow-a {
    width: 420px; height: 420px;
    top: -120px; left: -140px;
    background: radial-gradient(circle, rgba(0,138,137,0.28), transparent 70%);
}
.wp-glow-b {
    width: 360px; height: 360px;
    bottom: -120px; right: -100px;
    background: radial-gradient(circle, rgba(41,255,201,0.14), transparent 70%);
}
.wp-copy-inner {
    position: relative;
    z-index: 1;
    max-width: 480px;
    width: 100%;
}

.wp-eyebrow {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #29ffc9;
    margin-bottom: 22px;
}
.wp-eyebrow-line {
    display: inline-block;
    width: 24px;
    height: 1.5px;
    background: linear-gradient(90deg, #29ffc9, rgba(41,255,201,0.1));
    flex-shrink: 0;
}

/* Metadata chips */
.wp-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 26px;
}
.wp-chip {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: rgba(255,255,255,0.72);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 100px;
    padding: 5px 12px;
}

.wp-headline {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-weight: 600;
    font-style: normal;
    font-size: clamp(2.3rem, 3.8vw, 3.8rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: #ffffff;
    margin: 0 0 24px;
}
.wp-headline-em {
    font-style: italic;
    background: linear-gradient(120deg, #ffffff 10%, #29ffc9 120%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #29ffc9;
}

.wp-sub {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 15px;
    line-height: 1.78;
    color: rgba(255,255,255,0.5);
    margin: 0 0 44px;
    max-width: 460px;
}

/* Table of contents */
.wp-toc-label {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 6px;
}
.wp-toc {
    list-style: none;
    padding: 0;
    margin: 0 0 44px;
    border-top: 1px solid rgba(255,255,255,0.08);
}
.wp-toc-item {
    display: flex;
    gap: 18px;
    align-items: flex-start;
    padding: 16px 14px 16px 4px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    position: relative;
    transition: background 0.25s, padding-left 0.25s;
}
.wp-toc-item::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    width: 2px; height: 0;
    background: #29ffc9;
    transform: translateY(-50%);
    transition: height 0.25s;
}
.wp-toc-item:hover {
    background: rgba(255,255,255,0.025);
    padding-left: 14px;
}
.wp-toc-item:hover::before { height: 60%; }
.wp-toc-item:hover .wp-toc-text { color: #ffffff; }
.wp-toc-n {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #29ffc9;
    padding-top: 3px;
    flex-shrink: 0;
    opacity: 0.85;
}
.wp-toc-text {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 13.5px;
    font-weight: 500;
    line-height: 1.55;
    color: rgba(255,255,255,0.8);
    letter-spacing: -0.01em;
    transition: color 0.25s;
}

/* Quote */
.wp-quote {
    display: flex;
    gap: 16px;
    padding-top: 8px;
}
.wp-quote-bar {
    width: 2px;
    min-height: 40px;
    background: linear-gradient(#29ffc9, rgba(41,255,201,0.1));
}
.wp-quote-text {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 13px;
    font-style: italic;
    color: rgba(255,255,255,0.45);
    line-height: 1.65;
    margin: 0 0 6px;
}
.wp-quote-src {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.2);
}

/* ── Right form panel ── */
.wp-form-panel {
    background: #f4f5f3;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 120px clamp(28px, 5vw, 72px) 80px;
    min-height: 100svh;
}
.wp-form-outer {
    width: 100%;
    max-width: 470px;
}

/* Whitepaper cover preview */
.wp-cover-row {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 18px;
    padding-left: 4px;
}
.wp-cover-img {
    flex-shrink: 0;
    width: 132px;
    height: auto;
    border-radius: 8px;
    border: 1px solid rgba(0,0,0,0.08);
    box-shadow: 0 14px 32px rgba(7,13,12,0.22), 0 3px 8px rgba(7,13,12,0.14);
    transform: rotate(-4deg);
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s;
}
.wp-cover-img:hover {
    transform: rotate(-1deg) translateY(-3px);
    box-shadow: 0 20px 44px rgba(7,13,12,0.28), 0 4px 10px rgba(7,13,12,0.16);
}
.wp-cover-meta {
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.wp-cover-meta-kicker {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #008a89;
}
.wp-cover-meta-title {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #111111;
    line-height: 1.1;
}
.wp-cover-meta-detail {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 11px;
    font-weight: 500;
    color: #999999;
    margin-top: 2px;
}

.wp-form-inner {
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 20px;
    padding: 40px clamp(28px, 4vw, 44px) 36px;
    box-shadow:
        0 1px 2px rgba(0,0,0,0.04),
        0 4px 16px rgba(0,0,0,0.05),
        0 28px 64px rgba(0,0,0,0.07);
}
.wp-form-header {
    margin-bottom: 30px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
}
.wp-form-title {
    font-family: var(--font-heading, 'Playfair Display', serif);
    font-weight: 600;
    font-size: clamp(1.55rem, 2.1vw, 2.1rem);
    letter-spacing: -0.02em;
    color: #111111;
    margin: 0 0 8px;
    line-height: 1.15;
}
.wp-form-sub {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 13px;
    color: #aaaaaa;
    line-height: 1.5;
    margin: 0;
    letter-spacing: -0.01em;
}

/* HubSpot form overrides */
.wp-hs-form .hs-form-field {
    margin-bottom: 18px !important;
}
.wp-hs-form label {
    font-family: var(--font-body, 'Inter', sans-serif) !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    color: #666666 !important;
    display: block !important;
    margin-bottom: 7px !important;
}
.wp-hs-form input[type="text"],
.wp-hs-form input[type="email"],
.wp-hs-form input[type="tel"] {
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
.wp-hs-form input[type="text"]:focus,
.wp-hs-form input[type="email"]:focus,
.wp-hs-form input[type="tel"]:focus {
    border-color: #008a89 !important;
    background: #ffffff !important;
    box-shadow: 0 0 0 3.5px rgba(0,138,137,0.1) !important;
}
.wp-hs-form .hs-fieldtype-booleancheckbox label,
.wp-hs-form .hs-fieldtype-checkbox label,
.wp-hs-form .hs-fieldtype-radio label {
    font-size: 12px !important;
    font-weight: 400 !important;
    letter-spacing: 0 !important;
    text-transform: none !important;
    color: #666666 !important;
}
.wp-hs-form input[type="submit"] {
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
.wp-hs-form input[type="submit"]:hover {
    background: #008a89 !important;
}
.wp-hs-form input[type="submit"]:active {
    transform: scale(0.985) !important;
}
.wp-hs-form .hs-error-msgs {
    list-style: none !important;
    padding: 0 !important;
    margin: 5px 0 0 !important;
}
.wp-hs-form .hs-error-msgs li label {
    font-size: 10px !important;
    color: #dc2626 !important;
    font-weight: 500 !important;
    letter-spacing: 0.02em !important;
    text-transform: none !important;
}
.wp-hs-form .submitted-message {
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

/* Trust row */
.wp-trust-row {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(0,0,0,0.05);
}
.wp-trust-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 10.5px;
    font-weight: 500;
    color: #bbbbbb;
    letter-spacing: 0.01em;
}
.wp-trust-icon {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
}

/* ── Footer ── */
.wp-footer {
    position: relative;
    z-index: 1;
    background: #111111;
    padding: 20px clamp(24px, 5vw, 56px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255,255,255,0.06);
}
.wp-footer-back {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.26);
    text-decoration: none;
    transition: color 0.2s;
}
.wp-footer-back:hover { color: rgba(255,255,255,0.62); }

/* ── Responsive ── */
@media (max-width: 860px) {
    .wp-main { grid-template-columns: 1fr; }
    .wp-copy-panel {
        position: static;
        min-height: auto;
        padding: 96px clamp(24px, 5vw, 48px) 52px;
    }
    .wp-form-panel {
        min-height: auto;
        padding: 40px clamp(24px, 5vw, 48px) 56px;
    }
    .wp-glow-a { width: 280px; height: 280px; }
    .wp-glow-b { display: none; }
    .wp-footer { flex-direction: column; gap: 12px; text-align: center; }
    .wp-trust-row { gap: 12px; }
}
@media (max-width: 420px) {
    .wp-cover-row { gap: 16px; }
    .wp-cover-img { width: 108px; }
    .wp-cover-meta-title { font-size: 16px; }
}
            `}</style>
        </>
    );
}
