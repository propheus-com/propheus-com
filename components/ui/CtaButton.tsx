'use client';

import { useRef, useEffect, useState } from 'react';

type Props = {
    href: string;
    children: React.ReactNode;
};

/**
 * Premium CTA button with proximity-based border glow.
 * – Default: glass bg, faint white border.
 * – Proximity (<160px): teal border radiates from the nearest edge.
 * – Hover: teal fill, black text, 2px lift.
 */
export default function CtaButton({ href, children }: Props) {
    const anchorRef = useRef<HTMLAnchorElement>(null);
    const glowRef = useRef<HTMLSpanElement>(null);
    const [hovered, setHovered] = useState(false);
    const [proximity, setProximity] = useState(0); // 0 → 1

    useEffect(() => {
        const RANGE = 160; // px distance at which glow begins

        const onMove = (e: PointerEvent) => {
            const el = anchorRef.current;
            const gl = glowRef.current;
            if (!el || !gl) return;

            const r = el.getBoundingClientRect();

            // Nearest point on button rect from cursor
            const nx = Math.max(r.left, Math.min(e.clientX, r.right));
            const ny = Math.max(r.top, Math.min(e.clientY, r.bottom));
            const dist = Math.hypot(e.clientX - nx, e.clientY - ny);

            const p = Math.max(0, 1 - dist / RANGE);
            setProximity(p);

            // Feed cursor position into CSS vars for the radial gradient
            gl.style.setProperty('--gx', `${e.clientX - r.left}px`);
            gl.style.setProperty('--gy', `${e.clientY - r.top}px`);
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, []);

    return (
        <a
            ref={anchorRef}
            href={href}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.9em 2.6em',
                borderRadius: '100px',
                background: hovered
                    ? '#00C389'
                    : 'rgba(255,255,255,0.04)',
                color: hovered ? '#000000' : 'rgba(255,255,255,0.88)',
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '0.015em',
                textDecoration: 'none',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1.5px solid ${
                    hovered
                        ? 'transparent'
                        : `rgba(255,255,255,${Math.max(0.1, proximity * 0.15)})`
                }`,
                transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: [
                    'background 0.3s ease',
                    'color 0.28s ease',
                    'border-color 0.2s ease',
                    'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
                ].join(', '),
                outline: 'none',
            }}
        >
            {/* Proximity glow ring — sits on the border, fades on hover */}
            <span
                ref={glowRef}
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: -1.5,
                    borderRadius: 'inherit',
                    // Radial glow emanates from cursor position toward button center
                    background: `radial-gradient(
                        circle 90px at var(--gx, 50%) var(--gy, 50%),
                        rgba(0,195,137,${(proximity * 0.75).toFixed(3)}),
                        transparent 70%
                    )`,
                    // Mask to only show along the border strip (not fill)
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'destination-out',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    padding: '1.5px',
                    opacity: hovered ? 0 : 1,
                    transition: 'opacity 0.25s ease',
                    pointerEvents: 'none',
                }}
            />
            {children}
        </a>
    );
}
