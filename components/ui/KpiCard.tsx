'use client';

/**
 * KpiCard — Spatial floating KPI metric card
 *
 * Dark glass, no fills, no ring borders. Floats with a subtle
 * translateY animation on mount. Used individually inside signal
 * pointer panels — NOT placed in a grid.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface KpiCardProps {
    label: string;
    value: string;
    unit?: string;
    delta?: string;
    deltaPositive?: boolean;
    className?: string;
    delay?: number;
}

export default function KpiCard({
    label,
    value,
    unit,
    delta,
    deltaPositive = true,
    className = '',
    delay = 0,
}: KpiCardProps) {
    return (
        <motion.div
            className={cn('flex flex-col gap-1', className)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Subtle inner gradient overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

            {/* Value */}
            <div className="flex flex-col gap-0">
                <span className="font-heading text-[1.55rem] font-light tracking-[-0.03em] text-white/90 leading-none">
                    {value}
                </span>
                {unit && (
                    <span className="text-[0.48rem] tracking-[0.14em] uppercase text-white/35 font-body mt-1">
                        {unit}
                    </span>
                )}
            </div>

            {/* Divider + delta */}
            {delta && (
                <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/[0.08]">
                    <span className="text-[0.58rem] text-white/32 flex-1 font-body">{label}</span>
                    <span className={cn(
                        'text-[0.62rem] font-semibold whitespace-nowrap font-body',
                        deltaPositive ? 'text-[#00C389]' : 'text-red-400'
                    )}>
                        {delta}
                    </span>
                </div>
            )}

            {!delta && (
                <div className="pt-1.5 border-t border-white/[0.08]">
                    <span className="text-[0.58rem] text-white/35 font-body">{label}</span>
                </div>
            )}
        </motion.div>
    );
}
