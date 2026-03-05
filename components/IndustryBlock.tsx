'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface IndustryBlockProps {
    title: string;
    children: ReactNode;
    delay?: number;
}

export default function IndustryBlock({ title, children, delay = 0 }: IndustryBlockProps) {
    const blockRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = blockRef.current;
        if (!el) return;

        const ctx = gsap.context(() => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                opacity: 0,
                y: 30,
                duration: 0.7,
                ease: 'power2.out',
                delay: delay / 1000,
            });
        }, el);

        return () => ctx.revert();
    }, [delay]);

    return (
        <div ref={blockRef} className="industry-block">
            <h3 className="industry-block-title">{title}</h3>
            <div className="industry-block-underline" />
            <div className="industry-block-content">{children}</div>
        </div>
    );
}
