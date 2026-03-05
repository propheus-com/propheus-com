'use client';

import { useEffect, useRef, useState } from 'react';
import Button from './Button';

export default function Navbar() {
    const navRef = useRef<HTMLElement>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        // Background transition after hero
        const handleScroll = () => {
            const heroHeight = document.getElementById('hero-experience')?.offsetHeight || 0;
            setIsScrolled(window.scrollY > heroHeight);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav ref={navRef} className={`site-navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-left">
                    <div className="navbar-links">
                        <a href="#products" className="navbar-link">
                            PRODUCTS <span className="dropdown-icon">▼</span>
                        </a>
                        <a href="#pricing" className="navbar-link">PRICING</a>
                        <a href="#blog" className="navbar-link">BLOG</a>
                    </div>
                </div>
                <div className="navbar-center" style={{ transform: 'translateX(-40%)' }}>
                    <a href="/" className="navbar-logo">
                        <img src="/logo.avif" alt="Propheus" />
                    </a>
                </div>
                <div className="navbar-right">
                    <Button variant="secondary" className="navbar-btn-secondary">
                        WATCH DEMO
                    </Button>
                    <Button variant="primary" className="navbar-btn-primary">
                        REQUEST ACCESS
                    </Button>
                </div>
            </div>
        </nav>
    );
}
