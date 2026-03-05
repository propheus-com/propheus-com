'use client';

import React from 'react';

interface RightSideDetailPanelProps {
    /** Extra CSS class */
    className?: string;
    children: React.ReactNode;
}

/**
 * RightSideDetailPanel — Slides in from the right edge
 *
 * Structure:
 *   .detail-panel          (positioned right-side container)
 *     .detail-panel__inner (white inner content)
 *       {children}
 *
 * Animation: translateX(100%) → translateX(0) via GSAP slideLeft
 */
export default function RightSideDetailPanel({ className = '', children }: RightSideDetailPanelProps) {
    return (
        <div className={`detail-panel ${className}`}>
            <div className="detail-panel__inner">
                {children}
            </div>
        </div>
    );
}
