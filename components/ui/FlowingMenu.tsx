'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';

/* ─── Types ─────────────────────────────────────────────────── */
export interface FlowingMenuItemDef {
    text: string;
    image: string;
    onClick?: () => void;
}

interface FlowingMenuProps {
    items: FlowingMenuItemDef[];
    speed?: number;
    textColor?: string;
    bgColor?: string;
    marqueeBgColor?: string;
    marqueeTextColor?: string;
    borderColor?: string;
    activeIndex?: number;
}

interface MenuItemProps extends FlowingMenuItemDef {
    speed: number;
    textColor: string;
    marqueeBgColor: string;
    marqueeTextColor: string;
    borderColor: string;
    isActive: boolean;
}

/* ─── Helpers ───────────────────────────────────────────────── */
function distMetric(x: number, y: number, x2: number, y2: number) {
    return (x - x2) ** 2 + (y - y2) ** 2;
}
function findClosestEdge(mouseX: number, mouseY: number, w: number, h: number): 'top' | 'bottom' {
    return distMetric(mouseX, mouseY, w / 2, 0) < distMetric(mouseX, mouseY, w / 2, h)
        ? 'top'
        : 'bottom';
}

/* ─── MenuItem ──────────────────────────────────────────────── */
function MenuItem({
    text,
    image,
    onClick,
    speed,
    textColor,
    marqueeBgColor,
    marqueeTextColor,
    borderColor,
    isActive,
}: MenuItemProps) {
    const itemRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const marqueeInnerRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<gsap.core.Tween | null>(null);
    const [repetitions, setRepetitions] = useState(6);
    const ease = { duration: 0.6, ease: 'expo' } as const;

    /* Calculate how many copies fill the viewport */
    useEffect(() => {
        const calc = () => {
            const part = marqueeInnerRef.current?.querySelector<HTMLElement>('.fm-part');
            if (!part) return;
            const needed = Math.ceil(window.innerWidth / part.offsetWidth) + 2;
            setRepetitions(Math.max(6, needed));
        };
        calc();
        window.addEventListener('resize', calc);
        return () => window.removeEventListener('resize', calc);
    }, [text, image]);

    /* Set up the marquee GSAP loop */
    useEffect(() => {
        const setup = () => {
            const inner = marqueeInnerRef.current;
            if (!inner) return;
            const part = inner.querySelector<HTMLElement>('.fm-part');
            if (!part || part.offsetWidth === 0) return;
            animRef.current?.kill();
            animRef.current = gsap.to(inner, {
                x: -part.offsetWidth,
                duration: speed,
                ease: 'none',
                repeat: -1,
            });
        };
        const t = setTimeout(setup, 60);
        return () => {
            clearTimeout(t);
            animRef.current?.kill();
        };
    }, [text, image, repetitions, speed]);

    const handleMouseEnter = useCallback((ev: React.MouseEvent) => {
        const item = itemRef.current;
        const marq = marqueeRef.current;
        const inner = marqueeInnerRef.current;
        if (!item || !marq || !inner) return;
        const r = item.getBoundingClientRect();
        const edge = findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);
        gsap.timeline({ defaults: ease })
            .set(marq, { y: edge === 'top' ? '-101%' : '101%' }, 0)
            .set(inner, { y: edge === 'top' ? '101%' : '-101%' }, 0)
            .to([marq, inner], { y: '0%' }, 0);
    }, [ease]);

    const handleMouseLeave = useCallback((ev: React.MouseEvent) => {
        const item = itemRef.current;
        const marq = marqueeRef.current;
        const inner = marqueeInnerRef.current;
        if (!item || !marq || !inner) return;
        const r = item.getBoundingClientRect();
        const edge = findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);
        gsap.timeline({ defaults: ease })
            .to(marq, { y: edge === 'top' ? '-101%' : '101%' }, 0)
            .to(inner, { y: edge === 'top' ? '101%' : '-101%' }, 0);
    }, [ease]);

    return (
        <div
            ref={itemRef}
            className="fm__item"
            style={{
                borderColor,
                background: isActive ? `${marqueeBgColor}0d` : 'transparent',
            }}
        >
            <button
                className="fm__item-link"
                onClick={onClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ color: isActive ? marqueeBgColor : textColor }}
                aria-pressed={isActive}
            >
                <span
                    className="fm__item-active-bar"
                    style={{
                        background: marqueeBgColor,
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'scaleY(1)' : 'scaleY(0)',
                    }}
                />
                {text}
                {isActive && (
                    <span className="fm__active-dot" style={{ background: marqueeBgColor }} />
                )}
            </button>

            {/* Hover marquee overlay */}
            <div ref={marqueeRef} className="fm__marquee" style={{ background: marqueeBgColor }}>
                <div className="fm__marquee-wrap">
                    <div ref={marqueeInnerRef} className="fm__marquee-inner" aria-hidden="true">
                        {Array.from({ length: repetitions }).map((_, idx) => (
                            <div key={idx} className="fm-part" style={{ color: marqueeTextColor }}>
                                <span>{text}</span>
                                <div
                                    className="fm__img"
                                    style={{ backgroundImage: `url(${image})` }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── FlowingMenu ───────────────────────────────────────────── */
export default function FlowingMenu({
    items = [],
    speed = 14,
    textColor = '#0a0a0a',
    bgColor = '#ffffff',
    marqueeBgColor = '#0a0a0a',
    marqueeTextColor = '#ffffff',
    borderColor = 'rgba(0,0,0,0.1)',
    activeIndex,
}: FlowingMenuProps) {
    return (
        <>
            <style>{`
                .fm-wrap {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                .fm-nav {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }
                .fm__item {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    text-align: center;
                    border-top: 1px solid;
                    transition: background 0.4s ease;
                }
                .fm__item:first-child {
                    border-top: none;
                }
                .fm__item-link {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    width: 100%;
                    position: relative;
                    cursor: pointer;
                    text-transform: uppercase;
                    text-decoration: none;
                    white-space: nowrap;
                    font-weight: 700;
                    font-size: clamp(1.8rem, 4.5vh, 3.6rem);
                    letter-spacing: -0.03em;
                    font-family: var(--font-heading, 'Playfair Display', serif);
                    background: none;
                    border: none;
                    padding: 0 clamp(24px, 4vw, 64px);
                    transition: color 0.3s ease;
                    gap: 18px;
                }
                .fm__item-active-bar {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    border-radius: 0 2px 2px 0;
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    transform-origin: left;
                }
                .fm__active-dot {
                    display: inline-block;
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    animation: fm-blink 1.4s step-end infinite;
                }
                @keyframes fm-blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
                .fm__marquee {
                    position: absolute;
                    top: 0;
                    left: 0;
                    overflow: hidden;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    transform: translate3d(0, 101%, 0);
                    will-change: transform;
                }
                .fm__marquee-wrap {
                    height: 100%;
                    width: 100%;
                    overflow: hidden;
                }
                .fm__marquee-inner {
                    display: flex;
                    align-items: center;
                    position: relative;
                    height: 100%;
                    width: fit-content;
                    will-change: transform;
                }
                .fm-part {
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                    font-weight: 400;
                    font-size: clamp(1.8rem, 4.5vh, 3.6rem);
                    letter-spacing: -0.03em;
                    font-family: var(--font-heading, 'Playfair Display', serif);
                }
                .fm-part span {
                    white-space: nowrap;
                    text-transform: uppercase;
                    line-height: 1;
                    padding: 0 1.2vw;
                }
                .fm__img {
                    width: 220px;
                    height: 8vh;
                    margin: 0 2.5vw;
                    border-radius: 60px;
                    background-size: cover;
                    background-position: 50% 50%;
                    flex-shrink: 0;
                }
            `}</style>

            <div className="fm-wrap" style={{ background: bgColor }}>
                <nav className="fm-nav" aria-label="Industry navigation">
                    {items.map((item, idx) => (
                        <MenuItem
                            key={idx}
                            {...item}
                            speed={speed}
                            textColor={textColor}
                            marqueeBgColor={marqueeBgColor}
                            marqueeTextColor={marqueeTextColor}
                            borderColor={borderColor}
                            isActive={activeIndex === idx}
                        />
                    ))}
                </nav>
            </div>
        </>
    );
}
