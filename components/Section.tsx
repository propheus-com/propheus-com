'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SectionProps {
    id: string;
    title?: string;
    children: ReactNode;
    divider?: boolean;
    underline?: boolean;
    dark?: boolean;
    className?: string;
}

export default function Section({
    id,
    title,
    children,
    divider = false,
    underline = false,
    dark = false,
    className = '',
}: SectionProps) {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            // Section fade in
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
                opacity: 0,
                y: 40,
                duration: 0.8,
                ease: 'power2.out',
            });

            // Reveal elements — fade up
            const reveals = el.querySelectorAll('.reveal');
            reveals.forEach((reveal, index) => {
                gsap.to(reveal, {
                    scrollTrigger: {
                        trigger: reveal,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    delay: index * 0.1,
                });
            });

            // Data divider animation
            const dividerEl = el.querySelector('.data-divider');
            if (dividerEl) {
                gsap.to(dividerEl, {
                    scrollTrigger: {
                        trigger: dividerEl,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                    width: '100%',
                    duration: 1.2,
                    ease: 'power2.out',
                });
            }

            // Teal divider animation
            const tealDivider = el.querySelector('.teal-divider');
            if (tealDivider) {
                gsap.to(tealDivider, {
                    scrollTrigger: {
                        trigger: tealDivider,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                    width: '60%',
                    duration: 1,
                    ease: 'power2.out',
                });
            }

            // Teal underline animation
            const underlineEl = el.querySelector('.teal-underline');
            if (underlineEl) {
                gsap.to(underlineEl, {
                    scrollTrigger: {
                        trigger: underlineEl,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                    width: '80px',
                    duration: 0.8,
                    ease: 'power2.out',
                });
            }
        }, el);

        return () => {
            ctx.revert();
        };
    }, []);

    return (
        <section 
            id={id} 
            className={`content-section ${dark ? 'dark' : ''} ${className}`} 
            ref={sectionRef}
        >
            <div className="section-inner">
                {divider && <div className="teal-divider reveal" />}
                {title && <h2 className="reveal">{title}</h2>}
                {underline && <span className="teal-underline" />}
                {children}
            </div>
        </section>
    );
}
