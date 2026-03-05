'use client';

import { useEffect, useRef } from 'react';

interface EditorialMetricProps {
    value: string;
    label: string;
    delay?: number;
}

export default function EditorialMetric({ value, label, delay = 0 }: EditorialMetricProps) {
    const metricRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = metricRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            el.classList.add('visible');
                        }, delay);
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, [delay]);

    return (
        <div ref={metricRef} className="editorial-metric">
            <div className="editorial-metric-value">{value}</div>
            <div className="editorial-metric-label">{label}</div>
            <div className="editorial-metric-divider" />
        </div>
    );
}
