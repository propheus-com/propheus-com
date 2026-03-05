'use client';

/**
 * TopoCard — Topographical elevation panel
 * ActivityChartCard style: large bold number, sub-row detail.
 */

import { motion } from 'framer-motion';
import { Mountain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TopoCard() {
    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle>Topography</CardTitle>
                    <Mountain className="h-3.5 w-3.5 text-white/25" />
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <motion.div
                    className="flex flex-col gap-3"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Hero number */}
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[2.8rem] font-bold tracking-[-0.04em] text-white leading-none">
                            42<span className="text-2xl font-normal text-white/50 ml-1">m</span>
                        </p>
                        <span className="text-[0.55rem] tracking-[0.16em] uppercase text-white/30 font-body">
                            Elevation ASL
                        </span>
                    </div>

                    {/* Slope row */}
                    <div className="flex items-center gap-2 pt-2.5 border-t border-white/[0.07]">
                        <span className="text-[0.6rem] text-white/35 flex-1 font-body">Slope gradient</span>
                        <span className="text-[0.65rem] font-semibold text-[#00C389] font-body">+2.1 %</span>
                    </div>

                    {/* Second row */}
                    <div className="flex items-center gap-2 -mt-2">
                        <span className="text-[0.6rem] text-white/35 flex-1 font-body">Terrain type</span>
                        <span className="text-[0.65rem] font-semibold text-white/65 font-body">Coastal plain</span>
                    </div>
                </motion.div>
            </CardContent>
        </Card>
    );
}
