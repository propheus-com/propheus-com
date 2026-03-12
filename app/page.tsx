import Navbar from '@/components/Navbar';
import HeroExperience from '@/components/HeroExperience';
import CaseStudySection from '@/components/sections/CaseStudySection';
import DigitalAtlasSection from '@/components/sections/DigitalAtlasSection';
import IndustrySection from '@/components/sections/IndustrySection';
import Image from 'next/image';
import PagePreloader from '@/components/PagePreloader';
import NewsletterForm from '@/components/ui/NewsletterForm';
import LightPillar from '@/components/ui/LightPillar';
import FloatingLines from '@/components/ui/FloatingLines';
import PageCurtain from '@/components/PageCurtain';


export default function Home() {
    return (
        <>
            <PagePreloader />
            <PageCurtain />
            <Navbar />
            <HeroExperience />

            {/* Section 1 — Digital Atlas (right after canvas shrink) */}
            <div id="digital-atlas" style={{ paddingTop: 'clamp(80px, 12vw, 160px)' }}>
                <DigitalAtlasSection />
            </div>

            {/* Section 2 — Industry capabilities */}
            <div id="industry-section">
                <IndustrySection />
            </div>

            {/* Section 3 — Case Studies */}
            <CaseStudySection />

            {/* CTA Footer */}
            <footer
                id="cta-footer"
                style={{
                    background: '#070d0b',
                    position: 'relative',
                    overflow: 'hidden',
                    borderTop: '1px solid rgba(41,255,201,0.08)',
                }}
            >
                {/* FloatingLines background — occupies absolute layer behind content */}
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

                {/* Subtle dark grid overlay */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                        backgroundSize: '72px 72px',
                        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%, black 20%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%, black 20%, transparent 100%)',
                    }}
                />

                {/* ── Hero headline block ── */}
                <div style={{
                    position: 'relative', zIndex: 2,
                    maxWidth: '1200px', margin: '0 auto',
                    padding: 'clamp(72px, 10vw, 112px) clamp(24px, 6vw, 80px) clamp(56px, 7vw, 80px)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                }}>
                    {/* Eyebrow */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '10px',
                        fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 700,
                        letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1cd2b3',
                        marginBottom: '32px',
                    }}>
                        <span style={{ width: '20px', height: '1.5px', background: '#1cd2b3', display: 'inline-block' }} />
                        PROPHEUS
                        <span style={{ width: '20px', height: '1.5px', background: '#1cd2b3', display: 'inline-block' }} />
                    </div>

                    {/* Main headline */}
                    <h2 style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 'clamp(3rem, 7vw, 6.5rem)',
                        letterSpacing: '-0.05em',
                        lineHeight: 0.95,
                        color: '#ffffff',
                        margin: '0 0 28px',
                    }}>
                        The <span className="footer-word">Signal</span>
                    </h2>

                    {/* Sub-copy */}
                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                        color: 'rgba(255,255,255,0.5)',
                        maxWidth: '560px',
                        margin: '0 auto 0',
                        lineHeight: 1.65,
                        letterSpacing: '-0.01em',
                    }}>
                        Physical AI that reads 140+ real-world signals in under a second —
                        purpose-built for industries where timing is everything.
                    </p>
                </div>

                {/* ── Two-column CTA block ── */}
                <div className="footer-cta-grid" style={{
                    position: 'relative', zIndex: 2,
                    maxWidth: '1200px', margin: '0 auto',
                    padding: '0 clamp(24px, 6vw, 80px) clamp(72px, 10vw, 112px)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'clamp(48px, 7vw, 100px)',
                    alignItems: 'start',
                    pointerEvents: 'none',
                }}>
                    {/* Left — newsletter pitch */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
                            letterSpacing: '-0.04em',
                            lineHeight: 1.15,
                            color: '#ffffff',
                            margin: '0 0 16px',
                        }}>
                            Be first to know.
                        </h3>
                        <p style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'clamp(0.88rem, 1.1vw, 0.98rem)',
                            color: 'rgba(255,255,255,0.5)',
                            lineHeight: 1.7,
                            margin: '0 0 32px',
                            maxWidth: '380px',
                        }}>
                            Get exclusive insights on physical AI, real-world signal intelligence,
                            and early access to new capabilities as we build the future of
                            location-aware decision making.
                        </p>
                        {/* Trust badges */}
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            {['No spam', 'Cancel anytime', 'Early access'].map(b => (
                                <span key={b} style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                                    fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.01em',
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <circle cx="6" cy="6" r="5.5" stroke="#29ffc9" strokeWidth="1" />
                                        <path d="M3.5 6l1.8 1.8L8.5 4.5" stroke="#29ffc9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {b}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right — form + demo CTA */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', pointerEvents: 'auto' }}>
                        {/* HubSpot newsletter form (firstname, lastname, email) */}
                        <NewsletterForm dark />

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        </div>

                        {/* View Demo */}
                        <a
                            href="https://retail-agent.alchemy-propheus.ai/explorer/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                background: 'linear-gradient(135deg, rgba(41,255,201,0.12) 0%, rgba(13,148,136,0.18) 100%)',
                                border: '1px solid rgba(41,255,201,0.2)',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                fontFamily: 'var(--font-body)',
                                boxShadow: '0 4px 24px rgba(41,255,201,0.08)',
                                transition: 'box-shadow 0.25s, border-color 0.25s, transform 0.2s',
                            }}
                            className="footer-demo-link"
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#29ffc9', opacity: 0.85 }}>Live product</span>
                                <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>View Live Demo →</span>
                            </div>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: 'rgba(41,255,201,0.1)',
                                border: '1px solid rgba(41,255,201,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
                                </svg>
                            </div>
                        </a>

                        {/* Request Your Report */}
                        <a
                            href="/book-demo?tab=report"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                fontFamily: 'var(--font-body)',
                                transition: 'box-shadow 0.25s, border-color 0.25s, transform 0.2s',
                            }}
                            className="footer-report-link"
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', opacity: 0.85 }}>Intelligence brief</span>
                                <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Request Your Report →</span>
                            </div>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                                </svg>
                            </div>
                        </a>
                    </div>
                </div>

                {/* ── Footer bar ── */}
                <div style={{
                    position: 'relative', zIndex: 2,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    padding: 'clamp(20px, 3vw, 28px) clamp(24px, 6vw, 80px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                }}>
                    <Image
                        src="/logo.avif"
                        alt="Propheus"
                        width={72}
                        height={24}
                        style={{ objectFit: 'contain', objectPosition: 'left', opacity: 0.4, filter: 'brightness(0) invert(1)' }}
                    />
                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.72rem',
                        color: 'rgba(255,255,255,0.25)',
                        letterSpacing: '0.04em',
                        margin: 0,
                    }}>
                        &copy; 2026 Propheus &mdash; Signal Intelligence Platform
                    </p>
                </div>

                {/* Footer hover & autofill overrides */}
                <style>{`
                    .footer-demo-link:hover {
                        border-color: rgba(41,255,201,0.5) !important;
                        box-shadow: 0 4px 32px rgba(41,255,201,0.22), 0 0 0 1px rgba(41,255,201,0.15) !important;
                    }
                    .footer-report-link:hover {
                        border-color: rgba(255,255,255,0.3) !important;
                        box-shadow: 0 4px 24px rgba(0,0,0,0.3) !important;
                    }
                    #cta-footer input:-webkit-autofill,
                    #cta-footer input:-webkit-autofill:hover,
                    #cta-footer input:-webkit-autofill:focus {
                        -webkit-box-shadow: 0 0 0 50px #0a1210 inset !important;
                        -webkit-text-fill-color: #fff !important;
                        caret-color: #fff !important;
                        border-color: rgba(255,255,255,0.15) !important;
                        transition: background-color 5000s ease-in-out 0s;
                    }
                `}</style>
            </footer>
        </>
    );
}
