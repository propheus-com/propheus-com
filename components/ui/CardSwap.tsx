'use client';

import React, {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react';
import gsap from 'gsap';
import './CardSwap.css';

/* ─────────────────────────────────────────────────────────
   Card sub-component
───────────────────────────────────────────────────────── */
export const Card = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { customClass?: string }
>(({ customClass, className, ...rest }, ref) => (
    <div
        ref={ref}
        {...rest}
        className={['card', customClass, className].filter(Boolean).join(' ')}
    />
));
Card.displayName = 'Card';

/* ─────────────────────────────────────────────────────────
   Maths helpers
───────────────────────────────────────────────────────── */
const makeSlot = (i: number, distX: number, distY: number, total: number) => ({
    x: i * distX,
    y: -i * distY,
    z: -i * distX * 1.5,
    zIndex: total - i,
});

const placeNow = (
    el: HTMLElement,
    slot: ReturnType<typeof makeSlot>,
    skew: number,
) =>
    gsap.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true,
    });

/* ─────────────────────────────────────────────────────────
   Public types
───────────────────────────────────────────────────────── */
export interface CardSwapHandle {
    next: () => void;
    prev: () => void;
}

export interface CardSwapProps {
    width?: number;
    height?: number;
    cardDistance?: number;
    verticalDistance?: number;
    delay?: number;
    pauseOnHover?: boolean;
    onCardClick?: (index: number) => void;
    /** Fires immediately at the start of each swap with the incoming front card index. */
    onFrontChange?: (index: number) => void;
    skewAmount?: number;
    easing?: 'elastic' | 'smooth';
    children: React.ReactNode;
}

/* ─────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────── */
const CardSwap = forwardRef<CardSwapHandle, CardSwapProps>(function CardSwap(
    {
        width = 500,
        height = 400,
        cardDistance = 60,
        verticalDistance = 70,
        delay = 5000,
        pauseOnHover = false,
        onCardClick,
        onFrontChange,
        skewAmount = 6,
        easing = 'elastic',
        children,
    },
    ref,
) {
    const config = useMemo(
        () =>
            easing === 'elastic'
                ? {
                    ease: 'elastic.out(0.6,0.85)',
                    durDrop: 0.9,
                    durMove: 0.9,
                    durReturn: 0.9,
                    promoteOverlap: 0.6,
                    returnDelay: 0.08,
                }
                : {
                    ease: 'power1.inOut',
                    durDrop: 0.55,
                    durMove: 0.55,
                    durReturn: 0.55,
                    promoteOverlap: 0.45,
                    returnDelay: 0.16,
                },
        [easing],
    );

    const childArr = useMemo(() => Children.toArray(children), [children]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const refs = useMemo(() => childArr.map(() => React.createRef<HTMLDivElement>()), [childArr.length]);

    const orderRef     = useRef(Array.from({ length: childArr.length }, (_, i) => i));
    const tlRef        = useRef<gsap.core.Timeline | null>(null);
    const timerRef     = useRef<number | null>(null);
    const isAnimatingRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Stable refs so the imperative handle always calls the latest closures
    const nextRef = useRef<() => void>(() => {});
    const prevRef = useRef<() => void>(() => {});

    useImperativeHandle(ref, () => ({
        next: () => nextRef.current(),
        prev: () => prevRef.current(),
    }));

    useEffect(() => {
        const total = refs.length;

        refs.forEach((r, i) => {
            if (r.current) placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
        });

        const clearTimer = () => {
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
        const startTimer = () => {
            clearTimer();
            timerRef.current = window.setInterval(swapFwd, delay);
        };

        // Forward swap: front card drops to back, rest promote
        function swapFwd() {
            if (orderRef.current.length < 2) return;

            // If a swap is mid-flight (user spam-clicking),
            // fast‑forward it so orderRef is correct, then start a new one.
            if (isAnimatingRef.current && tlRef.current) {
                tlRef.current.progress(1);
            }

            clearTimer();

            const [front, ...rest] = orderRef.current;

            // Immediately tell parent who the new front will be
            onFrontChange?.(rest[0]);

            const elFront = refs[front].current;
            if (!elFront) { startTimer(); return; }

            isAnimatingRef.current = true;

            const tl = gsap.timeline({
                onComplete: () => {
                    isAnimatingRef.current = false;
                    startTimer();
                },
            });
            tlRef.current = tl;

            tl.to(elFront, { y: '+=600', duration: config.durDrop, ease: config.ease });

            tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
            rest.forEach((idx, i) => {
                const el = refs[idx].current;
                if (!el) return;
                const slot = makeSlot(i, cardDistance, verticalDistance, total);
                tl.set(el, { zIndex: slot.zIndex }, 'promote');
                tl.to(
                    el,
                    { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease },
                    `promote+=${i * 0.15}`,
                );
            });

            const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total);
            tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
            tl.call(() => { gsap.set(elFront, { zIndex: backSlot.zIndex }); }, undefined, 'return');
            tl.to(
                elFront,
                { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease },
                'return',
            );
            tl.call(() => { orderRef.current = [...rest, front]; });
        }

        // Backward swap: back card comes to front, rest shift back
        function swapBwd() {
            if (orderRef.current.length < 2) return;

            if (isAnimatingRef.current && tlRef.current) {
                tlRef.current.progress(1);
            }

            clearTimer();

            const ord = orderRef.current;
            const lastCard = ord[ord.length - 1];
            const newOrder = [lastCard, ...ord.slice(0, -1)];

            // Immediately tell parent
            onFrontChange?.(lastCard);

            isAnimatingRef.current = true;

            const tl = gsap.timeline({
                onComplete: () => {
                    isAnimatingRef.current = false;
                    startTimer();
                },
            });
            tlRef.current = tl;

            newOrder.forEach((cardIdx, slotIdx) => {
                const el = refs[cardIdx].current;
                if (!el) return;
                const slot = makeSlot(slotIdx, cardDistance, verticalDistance, total);
                tl.to(
                    el,
                    {
                        x: slot.x, y: slot.y, z: slot.z, zIndex: slot.zIndex,
                        duration: config.durReturn * 0.75,
                        ease: config.ease,
                    },
                    slotIdx * 0.04,
                );
            });
            tl.call(() => { orderRef.current = newOrder; });
        }

        nextRef.current = swapFwd;
        prevRef.current = swapBwd;

        startTimer();

        if (pauseOnHover && containerRef.current) {
            const el = containerRef.current;
            // On hover, just pause the autoplay timer – let any in-progress
            // animation finish so we never freeze mid-swap.
            const pause  = () => { clearTimer(); };
            const resume = () => { startTimer(); };
            el.addEventListener('mouseenter', pause);
            el.addEventListener('mouseleave', resume);
            return () => {
                el.removeEventListener('mouseenter', pause);
                el.removeEventListener('mouseleave', resume);
                clearTimer();
                tlRef.current?.kill();
            };
        }
        return () => { clearTimer(); tlRef.current?.kill(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]);

    const rendered = childArr.map((child, i) => {
        if (!isValidElement(child)) return child;
        const el = child as React.ReactElement<React.HTMLAttributes<HTMLDivElement> & { style?: React.CSSProperties }>;
        return cloneElement(el, {
            key: i,
            ref: refs[i],
            style: { width, height, ...(el.props.style ?? {}) },
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                el.props.onClick?.(e);
                onCardClick?.(i);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
    });

    return (
        <div ref={containerRef} className="card-swap-container" style={{ width, height }}>
            {rendered}
        </div>
    );
});

CardSwap.displayName = 'CardSwap';
export default CardSwap;
