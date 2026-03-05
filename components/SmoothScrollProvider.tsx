'use client';

import { useEffect, type ReactNode } from 'react';
import { initSmoothScroll, destroySmoothScroll } from '@/lib/SmoothScroll';

export default function SmoothScrollProvider({
    children,
}: {
    children: ReactNode;
}) {
    useEffect(() => {
        initSmoothScroll();
        return () => {
            destroySmoothScroll();
        };
    }, []);

    return <>{children}</>;
}
