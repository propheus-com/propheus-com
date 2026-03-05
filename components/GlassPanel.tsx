'use client';

import React from 'react';

interface GlassPanelProps {
    /** Extra CSS class for variant styling or positioning */
    className?: string;
    /** Panel label rendered above content */
    label?: string;
    children: React.ReactNode;
}

/**
 * GlassPanel — Cinematic glassmorphic overlay card
 *
 * Structure:
 *   .glass-panel              (outer frosted shell)
 *     .glass-panel__label     (optional teal label)
 *     .glass-panel__inner     (white inner layer for readability)
 *       {children}
 */
export default function GlassPanel({ className = '', label, children }: GlassPanelProps) {
    return (
        <div className={`glass-panel ${className}`}>
            {label && <span className="glass-panel__label">{label}</span>}
            <div className="glass-panel__inner">
                {children}
            </div>
        </div>
    );
}
