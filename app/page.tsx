import Navbar from '@/components/Navbar';
import HeroExperience from '@/components/HeroExperience';
import RetailFlow from '@/components/sections/RetailFlow';
import Image from 'next/image';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

export default function Home() {
    return (
        <>
            <Navbar />
            <HeroExperience />

            {/* Section 1 — Retail Flow */}
            <RetailFlow />

            {/* CTA Footer */}
            <footer
                style={{
                    background: '#000000',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: 'clamp(100px, 13vw, 180px) clamp(20px, 6vw, 80px) clamp(60px, 7vw, 100px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                {/* grid */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
                        backgroundSize: '64px 64px',
                        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 30%, black 30%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 30%, black 30%, transparent 100%)',
                    }}
                />
                {/* teal glow orb */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
                        width: 'clamp(400px, 60vw, 900px)', height: 'clamp(300px, 45vw, 700px)',
                        background: 'radial-gradient(ellipse at 50% 50%, rgba(20,184,166,0.12) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }}
                />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
                    {/* Logo */}
                    <Image
                        src="/logo.avif"
                        alt="Propheus"
                        width={120}
                        height={40}
                        style={{ objectFit: 'contain', marginBottom: '48px', opacity: 0.9 }}
                        priority
                    />

                    {/* Headline */}
                    <h2
                        style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 800,
                            fontSize: 'clamp(2.8rem, 6.5vw, 6rem)',
                            letterSpacing: '-0.045em',
                            lineHeight: 1.0,
                            color: 'rgba(255,255,255,0.95)',
                            margin: 0,
                            maxWidth: '820px',
                        }}
                    >
                        Ready to see the
                        <br />
                        <span style={{ color: '#14b8a6' }}>future of retail?</span>
                    </h2>

                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                            color: 'rgba(255,255,255,0.28)',
                            marginTop: '20px',
                            marginBottom: '52px',
                            letterSpacing: '-0.01em',
                            lineHeight: 1.65,
                            maxWidth: '460px',
                        }}
                    >
                        Propheus gives your team the signal intelligence to act before the moment passes.
                    </p>

                    {/* CTA Button */}
                    <HoverBorderGradient
                        as="a"
                        href="https://retail-agent.alchemy-propheus.ai/explorer/"
                        target="_blank"
                        rel="noopener noreferrer"
                        containerClassName="rounded-full"
                        className="text-white flex items-center gap-3 text-[0.95rem] font-semibold tracking-wide px-7 py-3.5"
                        duration={1.4}
                    >
                        View Demo
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </HoverBorderGradient>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)', margin: '72px 0 32px' }} />

                    {/* Copyright */}
                    <p
                        style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.18)',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            margin: 0,
                        }}
                    >
                        &copy; 2026 Propheus &mdash; Signal Intelligence Platform
                    </p>
                </div>
            </footer>
        </>
    );
}
