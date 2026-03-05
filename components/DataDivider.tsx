'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function DataDivider() {
    const dividerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = dividerRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                width: '100%',
                duration: 1.2,
                ease: 'power2.out',
            });
        }, el);

        return () => ctx.revert();
    }, []);

    return <div ref={dividerRef} className="data-divider" />;
}
