'use client';

/**
 * WeatherPanel
 *
 * Animated weather icon layer extracted from the WeatherWidget pattern.
 * Renders inside .glass-panel__inner using the project's existing CSS class system.
 * Framer-motion drives the icon animations; no Tailwind required.
 */

import * as React from 'react';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeatherCondition =
    | 'clear'
    | 'clouds'
    | 'rain'
    | 'snow'
    | 'thunderstorm'
    | 'mist';

export interface WeatherPanelProps {
    /** Temperature value (number only) */
    temperature: number;
    /** Unit label shown below the temperature */
    unit?: string;
    /** Weather condition for the animated icon */
    condition?: WeatherCondition;
    /** Daytime = true → sun icon. Night = false → moon */
    isDay?: boolean;
    /** Left sub-label (e.g. "SW wind") */
    contextKey?: string;
    /** Right sub-value (e.g. "12 km/h") */
    contextVal?: string;
    /** Extra class forwarded to the inner wrapper */
    className?: string;
}

// ─── SVG icons (inline, no external import needed) ───────────────────────────

const SunIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2"  x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="4.22" y1="4.22"  x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
        <line x1="2"  y1="12" x2="5"  y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22" />
    </svg>
);

const MoonIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const CloudIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
);

const RainIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="16" y1="13" x2="16" y2="21" />
        <line x1="8"  y1="13" x2="8"  y2="21" />
        <line x1="12" y1="15" x2="12" y2="23" />
        <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
    </svg>
);

const SnowIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
        <line x1="8" y1="16" x2="8.01" y2="16" />
        <line x1="8" y1="20" x2="8.01" y2="20" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
        <line x1="12" y1="22" x2="12.01" y2="22" />
        <line x1="16" y1="16" x2="16.01" y2="16" />
        <line x1="16" y1="20" x2="16.01" y2="20" />
    </svg>
);

const StormIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
        <polyline points="13 11 9 17 15 17 11 23" />
    </svg>
);

const MistIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="3"  y1="8"  x2="21" y2="8" />
        <line x1="3"  y1="12" x2="21" y2="12" />
        <line x1="5"  y1="16" x2="19" y2="16" />
        <line x1="7"  y1="20" x2="17" y2="20" />
    </svg>
);

// ─── Animated icon components ─────────────────────────────────────────────────

const ClearIcon: React.FC<{ isDay: boolean }> = ({ isDay }) =>
    isDay ? (
        <motion.div
            className="wp-icon"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
            style={{ color: '#F59E0B' }}
        >
            <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [1, 0.82, 1] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            >
                <SunIcon size={28} />
            </motion.div>
        </motion.div>
    ) : (
        <motion.div
            className="wp-icon"
            animate={{ opacity: [1, 0.75, 1], scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ color: '#CBD5E1' }}
        >
            <MoonIcon size={26} />
        </motion.div>
    );

const CloudsIcon: React.FC = () => (
    <div className="wp-icon" style={{ position: 'relative', color: '#94A3B8' }}>
        <CloudIcon size={28} />
        <motion.div
            style={{ position: 'absolute', left: -7, top: 4, color: '#94A3B8', opacity: 0.6 }}
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
            <CloudIcon size={20} />
        </motion.div>
    </div>
);

const RainIconAnimated: React.FC = () => (
    <div className="wp-icon" style={{ position: 'relative', color: '#60A5FA' }}>
        <RainIcon size={28} />
        {[0, 1, 2].map((i) => (
            <motion.span
                key={i}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: `${22 + i * 22}%`,
                    width: 2,
                    height: 7,
                    background: '#60A5FA',
                    borderRadius: 2,
                    opacity: 0,
                    display: 'block',
                }}
                animate={{ opacity: [0, 1, 0], y: [0, 12] }}
                transition={{
                    repeat: Infinity,
                    duration: 1.4,
                    delay: i * 0.3,
                    ease: 'linear',
                }}
            />
        ))}
    </div>
);

const SnowIconAnimated: React.FC = () => (
    <div className="wp-icon" style={{ position: 'relative', color: '#93C5FD' }}>
        <SnowIcon size={28} />
        {[0, 1, 2].map((i) => (
            <motion.span
                key={i}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: `${22 + i * 22}%`,
                    width: 3,
                    height: 3,
                    background: '#93C5FD',
                    borderRadius: '50%',
                    opacity: 0,
                    display: 'block',
                }}
                animate={{
                    opacity: [0, 1, 0],
                    y: [0, 14],
                    x: [0, i % 2 === 0 ? 5 : -5, 0],
                }}
                transition={{
                    repeat: Infinity,
                    duration: 3,
                    delay: i * 0.25,
                    ease: 'easeInOut',
                }}
            />
        ))}
    </div>
);

const ThunderIconAnimated: React.FC = () => (
    <div className="wp-icon" style={{ position: 'relative', color: '#FBBF24' }}>
        <StormIcon size={28} />
        <motion.div
            style={{ position: 'absolute', inset: 0, color: '#FDE68A' }}
            animate={{ opacity: [0, 1, 0.5, 1, 0] }}
            transition={{
                repeat: Infinity,
                duration: 3,
                repeatDelay: 1.5,
                times: [0, 0.1, 0.2, 0.21, 0.35],
                ease: 'easeInOut',
            }}
        >
            <StormIcon size={28} />
        </motion.div>
    </div>
);

const MistIconAnimated: React.FC = () => (
    <div className="wp-icon" style={{ position: 'relative', color: '#94A3B8' }}>
        <MistIcon size={28} />
        <motion.div
            style={{ position: 'absolute', inset: 0, opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.6, 0.3], x: [-12, 12, -12] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        >
            <MistIcon size={28} />
        </motion.div>
    </div>
);

// ─── Icon dispatcher ──────────────────────────────────────────────────────────

function AnimatedIcon({ condition, isDay }: { condition: WeatherCondition; isDay: boolean }) {
    switch (condition) {
        case 'clear':       return <ClearIcon isDay={isDay} />;
        case 'clouds':      return <CloudsIcon />;
        case 'rain':        return <RainIconAnimated />;
        case 'snow':        return <SnowIconAnimated />;
        case 'thunderstorm':return <ThunderIconAnimated />;
        case 'mist':        return <MistIconAnimated />;
        default:            return <ClearIcon isDay={isDay} />;
    }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WeatherPanel({
    temperature,
    unit = 'Ambient temp',
    condition = 'clear',
    isDay = true,
    contextKey = 'SW wind',
    contextVal = '12 km/h',
    className = '',
}: WeatherPanelProps) {
    return (
        <div className={`glass-panel__inner signal-content sp-weather-content wp-root ${className}`}>
            {/* Animated icon row */}
            <div className="wp-icon-row">
                <AnimatedIcon condition={condition} isDay={isDay} />
            </div>

            {/* Temperature block */}
            <div className="sp-data-block">
                <span className="sp-data-val wp-temp">
                    {temperature}&thinsp;<sup className="wp-deg">°</sup>C
                </span>
                <span className="sp-data-unit">{unit}</span>
            </div>

            {/* Wind / context sub-row */}
            <div className="sp-data-sub">
                <span className="sp-sub-key">{contextKey}</span>
                <span className="sp-sub-val">{contextVal}</span>
            </div>
        </div>
    );
}
