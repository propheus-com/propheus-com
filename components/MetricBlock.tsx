'use client';

import { useEffect, useRef, useState } from 'react';

interface MetricBlockProps {
    value: string;
    label: string;
    delay?: number;
}

export default function MetricBlock({ value, label, delay = 0 }: MetricBlockProps) {
    const [isVisible, setIsVisible] = useState(false);
    const blockRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = blockRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isVisible) {
                        setTimeout(() => setIsVisible(true), delay);
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [delay, isVisible]);

    return (
        <div ref={blockRef} className={`metric-block ${isVisible ? 'visible' : ''}`}>
            <div className="metric-value">{value}</div>
            <div className="metric-label">{label}</div>
        </div>
    );
}
