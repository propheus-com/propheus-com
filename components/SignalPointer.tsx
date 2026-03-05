'use client';

import React from 'react';

interface SignalPointerProps {
    /** CSS class for the outer wrapper — used for positioning */
    className?: string;
    /** Direction the connector line extends: 'up' | 'down' | 'left' | 'right' */
    direction?: 'up' | 'down' | 'left' | 'right';
    /** Connector line length in px (default 48) */
    lineLength?: number;
    children: React.ReactNode;
}

/**
 * SignalPointer — Cinematic anchored overlay
 *
 * Structure:
 *   .signal-pointer          (positioned wrapper)
 *     .signal-dot            (green pulse dot)
 *     .signal-line           (animated connector)
 *     .signal-panel-wrapper  (panel container)
 *       {children}           (GlassPanel or content)
 *
 * Animation sequence (GSAP-driven from registerHeroElements):
 *   1. Dot fades in + pulse
 *   2. Line draws outward (scaleX/scaleY)
 *   3. Panel fades in + slight scale
 */
export default function SignalPointer({
    className = '',
    direction = 'down',
    lineLength = 48,
    children,
}: SignalPointerProps) {
    const isVertical = direction === 'up' || direction === 'down';

    const lineStyle: React.CSSProperties = isVertical
        ? { width: 1, height: lineLength }
        : { height: 1, width: lineLength };

    return (
        <div className={`signal-pointer signal-pointer--${direction} ${className}`}>
            <div className="signal-dot" />
            <div className="signal-line" style={lineStyle} />
            <div className="signal-panel-wrapper">
                {children}
            </div>
        </div>
    );
}
