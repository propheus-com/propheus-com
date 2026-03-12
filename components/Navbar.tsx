'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

/* ═══════════════════════════════════════════════════════════════
   IDs of sections that have a dark background on the landing page.
   Dark mode triggers ONLY when the TOP EDGE of a dark section
   reaches the bottom of the navbar (72px from top).
═══════════════════════════════════════════════════════════════ */
const DARK_SECTION_IDS = ['digital-atlas', 'industry-section', 'cta-footer'];

export default function Navbar() {
    const navRef = useRef<HTMLElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const isLandingPage = pathname === '/';

    /* ── Hero state: navbar is transparent + visible during states 0-1 ── */
    const [heroPhase, setHeroPhase] = useState<'hero' | 'mid' | 'post'>(
        isLandingPage ? 'hero' : 'post'
    );
    /* ── Activated: visible with background once past CaseStudy ── */
    const [activated, setActivated] = useState(!isLandingPage);
    /* ── Hide on scroll-down, reveal on scroll-up ── */
    const [hidden, setHidden] = useState(false);
    /* ── Dark mode: true when a dark section is under the navbar ── */
    const [isDark, setIsDark] = useState(false);
    /* ── Mobile drawer state ── */
    const [drawerOpen, setDrawerOpen] = useState(false);

    const lastY = useRef(0);
    const darkCount = useRef(0);

    /* ─────────────────────────────────────────────────────────
       1. HERO STATE AWARENESS — listen for propheus state changes
       States 0-1: navbar visible but transparent (no background)
       States 2-3: navbar completely hidden (mid phase)
       After lenis-revealed: navbar enters normal activation mode
    ───────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!isLandingPage) {
            setHeroPhase('post');
            setActivated(true);
            return;
        }

        // Listen for hero state machine changes
        // States 0-1: navbar visible (transparent hero mode)
        // States 2-3: navbar completely hidden until case study section
        const onStateChange = (e: Event) => {
            const state = (e as CustomEvent).detail?.state;
            if (state === 0 || state === 1) {
                setHeroPhase('hero');
                setActivated(false);
            } else {
                // States 2, 3 — all hidden
                setHeroPhase('mid');
                setActivated(false);
            }
        };

        // When state ≥2 begins, hide immediately
        const onState1 = () => { setHeroPhase('hero'); setActivated(false); };
        const onState2 = () => { setHeroPhase('mid'); setActivated(false); };
        const onState3 = () => { setHeroPhase('mid'); setActivated(false); };

        window.addEventListener('propheus:statechange', onStateChange);
        window.addEventListener('propheus:state1', onState1);
        window.addEventListener('propheus:state2', onState2);
        window.addEventListener('propheus:state3', onState3);

        return () => {
            window.removeEventListener('propheus:statechange', onStateChange);
            window.removeEventListener('propheus:state1', onState1);
            window.removeEventListener('propheus:state2', onState2);
            window.removeEventListener('propheus:state3', onState3);
        };
    }, [isLandingPage]);

    /* ─────────────────────────────────────────────────────────
       2. ACTIVATION — watch the CaseStudy section (landing only)
       The navbar becomes visible with background ONLY after
       the CaseStudy section is in view.
    ───────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!isLandingPage) {
            setActivated(true);
            return;
        }

        const tryObserve = () => {
            const heroEl = document.getElementById('hero-experience');
            const caseSec = heroEl?.nextElementSibling as HTMLElement | null;
            if (!caseSec) {
                requestAnimationFrame(tryObserve);
                return;
            }

            const obs = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        // Only activate when lenis scroll mode is done (lenis-revealed is set)
                        if (document.body.classList.contains('lenis-revealed')) {
                            setHeroPhase('post');
                            setActivated(true);
                        }
                    } else {
                        // If we scroll back above case study, deactivate
                        if (!document.body.classList.contains('lenis-revealed')) {
                            setActivated(false);
                            if (window.scrollY < 100) {
                                setHeroPhase('hero');
                            }
                        }
                    }
                },
                { threshold: 0.05 }
            );
            obs.observe(caseSec);
            return obs;
        };

        const obs = tryObserve();
        return () => {
            if (obs && typeof (obs as IntersectionObserver).disconnect === 'function') {
                (obs as IntersectionObserver).disconnect();
            }
        };
    }, [isLandingPage]);

    /* ─────────────────────────────────────────────────────────
       3. LENIS-REVEALED LISTENER — final signal that hero is done
    ───────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!isLandingPage) return;

        const observer = new MutationObserver(() => {
            if (document.body.classList.contains('lenis-scroll-mode')) {
                // Canvas transition in progress — force hide
                setHeroPhase('mid');
                setActivated(false);
            } else if (document.body.classList.contains('lenis-revealed')) {
                // Hero done — transition to post. Check if case study is already visible.
                setHeroPhase('post');
                const heroEl = document.getElementById('hero-experience');
                const caseSec = heroEl?.nextElementSibling as HTMLElement | null;
                if (caseSec) {
                    const rect = caseSec.getBoundingClientRect();
                    const visible = rect.top < window.innerHeight && rect.bottom > 0;
                    if (visible) {
                        setActivated(true);
                    }
                }
            }
        });

        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, [isLandingPage]);

    /* ─────────────────────────────────────────────────────────
       4. DARK MODE — IntersectionObserver on dark sections
       Uses rootMargin to only trigger when the dark section's
       top edge reaches the navbar area (72px from viewport top).
    ───────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!isLandingPage) return;

        const observers: IntersectionObserver[] = [];
        darkCount.current = 0;

        const checkDark = () => setIsDark(darkCount.current > 0);

        // We only watch the FIRST dark section (#digital-atlas) for entering
        // dark mode. The other sections follow naturally since they're below.
        // rootMargin: top = -72px (navbar height), bottom = full viewport minus navbar
        // This means "intersecting" only when the element's top enters the navbar zone.
        DARK_SECTION_IDS.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        darkCount.current++;
                    } else {
                        darkCount.current = Math.max(0, darkCount.current - 1);
                    }
                    checkDark();
                },
                {
                    // Only trigger when element's top edge is within the navbar zone
                    // -72px top margin = don't count until element reaches below the navbar
                    // -calc ensures we only consider the top strip of viewport
                    threshold: 0,
                    rootMargin: '0px 0px -90% 0px',
                }
            );
            obs.observe(el);
            observers.push(obs);
        });

        return () => observers.forEach((o) => o.disconnect());
    }, [isLandingPage]);

    /* ─────────────────────────────────────────────────────────
       5. SCROLL-DIRECTION HIDE/SHOW
    ───────────────────────────────────────────────────────── */
    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            const delta = y - lastY.current;

            if (activated) {
                if (delta > 8) {
                    setHidden(true);
                } else if (delta < -4) {
                    setHidden(false);
                }
            }

            if (y < 10) {
                setHidden(false);
            }

            lastY.current = y;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activated]);

    /* ─────────────────────────────────────────────────────────
       6. NAVIGATION HANDLERS
    ───────────────────────────────────────────────────────── */
    const handleDigitalAtlas = useCallback(() => {
        if (isLandingPage) {
            // Use curtain transition to smoothly navigate to the section
            // This dispatches the propheus:curtain event that PageCurtain listens for
            window.dispatchEvent(
                new CustomEvent('propheus:curtain', {
                    detail: { sectionId: 'digital-atlas' },
                })
            );
        } else {
            // From other pages, navigate to landing page with hash
            router.push('/#digital-atlas');
        }
    }, [isLandingPage, router]);

    const handleRetail = useCallback(() => {
        if (pathname === '/industries') {
            // Already on industries page — trigger tab switch + scroll
            window.history.replaceState(null, '', '#retail');
            window.dispatchEvent(
                new CustomEvent('propheus:select-industry-tab', {
                    detail: { tabId: 'retail' },
                })
            );
        } else {
            router.push('/industries#retail');
        }
    }, [pathname, router]);

    /* ── Close drawer helper ── */
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    /* Lock body scroll when drawer is open */
    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    /* ─────────────────────────────────────────────────────────
       BUILD CLASS NAME
       
       heroPhase === 'hero':  visible, transparent bg (states 0-1)
       heroPhase === 'mid':   completely hidden (states 2-3, lenis)
       heroPhase === 'post':  normal activation mode  
    ───────────────────────────────────────────────────────── */
    const isHeroMode = heroPhase === 'hero' && isLandingPage;
    const isMidHero = heroPhase === 'mid' && isLandingPage;

    const navClass = [
        'site-navbar',
        // During hero states 0-1: visible with transparent bg
        isHeroMode ? 'nav-hero' : '',
        // After case study: visible with glass bg
        activated && !isMidHero ? 'nav-activated' : '',
        // Hidden during mid-hero phase (states 2-3 + lenis)
        isMidHero ? 'nav-force-hidden' : '',
        // hide on scroll down
        hidden ? 'nav-hidden' : '',
        // Dark mode
        isDark && !isHeroMode ? 'nav-dark' : '',
    ].filter(Boolean).join(' ');

    return (
        <>
            <nav ref={navRef} className={navClass}>
                <div className="navbar-container">
                    <div className="navbar-left">
                        <div className="navbar-links">
                            <button onClick={handleDigitalAtlas} className="navbar-link">
                                DIGITAL ATLAS
                            </button>
                            <Link href="/industries" className="navbar-link">
                                INDUSTRIES
                            </Link>
                            <button onClick={handleRetail} className="navbar-link">
                                RETAIL
                            </button>
                        </div>
                    </div>
                    <div className="navbar-center">
                        <Link href="/" className="navbar-logo">
                            <img src="/logo.avif" alt="Propheus" />
                        </Link>
                    </div>
                    <div className="navbar-right">
                        <Link
                            href="https://retail-agent.alchemy-propheus.ai/explorer/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="navbar-link"
                        >
                            WATCH DEMO
                        </Link>
                        <HoverBorderGradient
                            as="a"
                            href="/book-demo"
                            containerClassName="navbar-hbg-btn"
                            className="navbar-hbg-inner"
                            duration={1.5}
                        >
                            <span className="navbar-hbg-text">REQUEST ACCESS</span>
                        </HoverBorderGradient>
                    </div>
                    {/* Hamburger — visible only on mobile via CSS */}
                    <button
                        className={`navbar-hamburger${drawerOpen ? ' open' : ''}`}
                        onClick={() => setDrawerOpen((o) => !o)}
                        aria-label="Toggle menu"
                    >
                        <span className="navbar-hamburger-bar" />
                        <span className="navbar-hamburger-bar" />
                        <span className="navbar-hamburger-bar" />
                    </button>
                </div>
            </nav>

            {/* Mobile drawer overlay */}
            <div className={`navbar-drawer${drawerOpen ? ' open' : ''}`}>
                <button
                    className="navbar-drawer-link"
                    onClick={() => { closeDrawer(); handleDigitalAtlas(); }}
                >
                    Digital Atlas
                </button>
                <div className="navbar-drawer-divider" />
                <Link href="/industries" className="navbar-drawer-link" onClick={closeDrawer}>
                    Industries
                </Link>
                <div className="navbar-drawer-divider" />
                <button
                    className="navbar-drawer-link"
                    onClick={() => { closeDrawer(); handleRetail(); }}
                >
                    Retail
                </button>
                <div className="navbar-drawer-divider" />
                <Link
                    href="https://retail-agent.alchemy-propheus.ai/explorer/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="navbar-drawer-link"
                    onClick={closeDrawer}
                >
                    Watch Demo
                </Link>
                <Link href="/book-demo" className="navbar-drawer-cta" onClick={closeDrawer}>
                    REQUEST ACCESS
                </Link>
            </div>
        </>
    );
}
