'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';

type Direction = 'TOP' | 'LEFT' | 'BOTTOM' | 'RIGHT';

export function HoverBorderGradient({
    children,
    containerClassName,
    className,
    as: Tag = 'button',
    duration = 1,
    clockwise = true,
    ...props
}: React.PropsWithChildren<
    {
        as?: React.ElementType;
        containerClassName?: string;
        className?: string;
        duration?: number;
        clockwise?: boolean;
        href?: string;
        target?: string;
        rel?: string;
    } & React.HTMLAttributes<HTMLElement>
>) {
    const [hovered, setHovered] = useState(false);
    const [direction, setDirection] = useState<Direction>('TOP');

    const rotateDirection = (current: Direction): Direction => {
        const dirs: Direction[] = ['TOP', 'LEFT', 'BOTTOM', 'RIGHT'];
        const idx = dirs.indexOf(current);
        const next = clockwise
            ? (idx - 1 + dirs.length) % dirs.length
            : (idx + 1) % dirs.length;
        return dirs[next];
    };

    const movingMap: Record<Direction, string> = {
        TOP:    'radial-gradient(20.7% 50% at 50% 0%,   hsl(172, 70%, 55%) 0%, rgba(20,184,166,0) 100%)',
        LEFT:   'radial-gradient(16.6% 43.1% at 0% 50%, hsl(172, 70%, 55%) 0%, rgba(20,184,166,0) 100%)',
        BOTTOM: 'radial-gradient(20.7% 50% at 50% 100%, hsl(172, 70%, 55%) 0%, rgba(20,184,166,0) 100%)',
        RIGHT:  'radial-gradient(16.2% 41.2% at 100% 50%, hsl(172, 70%, 55%) 0%, rgba(20,184,166,0) 100%)',
    };

    const highlight =
        'radial-gradient(75% 181% at 50% 50%, #14b8a6 0%, rgba(20,184,166,0) 100%)';

    useEffect(() => {
        if (hovered) return;
        const interval = setInterval(() => {
            setDirection((prev) => rotateDirection(prev));
        }, duration * 1000);
        return () => clearInterval(interval);
    }, [hovered, duration, clockwise]);

    // Cast to a permissive component type so TS accepts event-handler props + children
    const AnyTag = Tag as React.FC<React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }>;

    return (
        <AnyTag
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                'relative flex rounded-full content-center bg-black/20 hover:bg-black/10 transition duration-500 items-center flex-col flex-nowrap h-min justify-center overflow-visible p-px w-fit',
                containerClassName
            )}
            {...(props as React.HTMLAttributes<HTMLElement>)}
        >
            <div
                className={cn(
                    'w-auto z-20 bg-black text-white px-6 py-3 rounded-[inherit]',
                    className
                )}
            >
                {children}
            </div>

            {/* Animated teal border glow */}
            <motion.div
                className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
                style={{ filter: 'blur(2px)', position: 'absolute', width: '100%', height: '100%' }}
                initial={{ background: movingMap[direction] }}
                animate={{
                    background: hovered
                        ? [movingMap[direction], highlight]
                        : movingMap[direction],
                }}
                transition={{ ease: 'linear', duration: duration ?? 1 }}
            />

            {/* Inner black fill — leaves only the border strip visible */}
            <div className="bg-black absolute z-[1] flex-none inset-[2px] rounded-[100px]" />
        </AnyTag>
    );
}
