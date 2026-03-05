import gsap from 'gsap';

/* ============================================
   HeroAnimationController
   ============================================
   Modular, declarative animation system for
   hero elements. Decoupled from frame engine.

   Usage:
     controller.registerElement('logo', el);
     controller.assignAnimations('logo', {
       idle: [],
       segment0: [{ type: 'fadeIn', duration: 0.8 }],
       segment1: [{ type: 'fadeOut' }, { type: 'scaleDown' }],
     });
     controller.transitionTo('segment0'); // plays registered animations
   ============================================ */

// ========================================
// TYPES
// ========================================

export type AnimationPreset =
    | 'fadeIn'
    | 'fadeOut'
    | 'moveForward'
    | 'moveBackward'
    | 'scaleUp'
    | 'scaleDown'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight'
    | 'lineDraw'
    | 'lineCollapse'
    | 'scaleYDraw'
    | 'scaleYCollapse'
    | 'glowPulse'
    | 'countUp';

export interface AnimationConfig {
    type: AnimationPreset;
    opacity?: number;
    depth?: number;
    scale?: number;
    distance?: number;
    duration?: number;
    easing?: string;
    /** Stagger delay between children (seconds). Requires targetChildren. */
    stagger?: number;
    /** When true, animates el.children instead of el itself. */
    targetChildren?: boolean;
    /** For lineDraw — end x1/y1/x2/y2 as percent strings (SVG line) */
    lineEndX?: string;
    lineEndY?: string;
    /** Delay before this animation starts (seconds) */
    delay?: number;
    /** Target numeric value for countUp preset */
    targetValue?: number;
}

export type StateAnimations = {
    [state: string]: AnimationConfig[];
};

interface RegisteredElement {
    el: HTMLElement;
    animations: StateAnimations;
}

// ========================================
// PRESET DEFAULTS
// ========================================

const PRESET_DEFAULTS: Record<AnimationPreset, gsap.TweenVars> = {
    fadeIn: { opacity: 1, duration: 0.8, ease: 'power2.out' },
    fadeOut: { opacity: 0, duration: 0.6, ease: 'power2.in' },
    moveForward: { z: 0, duration: 0.8, ease: 'power2.out' },
    moveBackward: { z: -120, duration: 0.8, ease: 'power2.out' },
    scaleUp: { scale: 1, duration: 0.8, ease: 'power2.out' },
    scaleDown: { scale: 0.9, duration: 0.8, ease: 'power2.out' },
    slideUp: { y: -40, duration: 0.6, ease: 'power2.out' },
    slideDown: { y: 40, duration: 0.6, ease: 'power2.out' },
    lineDraw: { opacity: 1, duration: 0.6, ease: 'power2.out' },
    lineCollapse: { opacity: 0, duration: 0.3, ease: 'power2.in' },
    scaleYDraw: { scaleY: 1, opacity: 1, duration: 0.5, ease: 'power2.out' },
    scaleYCollapse: { scaleY: 0, opacity: 0, duration: 0.3, ease: 'power2.in' },
    glowPulse: { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
    slideLeft: { x: -40, duration: 0.6, ease: 'power2.out' },
    slideRight: { x: 40, duration: 0.6, ease: 'power2.out' },
    countUp: { duration: 1.5, ease: 'power2.out' },
};

// ========================================
// CONTROLLER
// ========================================

export class HeroAnimationController {
    private elements = new Map<string, RegisteredElement>();
    private activeTimeline: gsap.core.Timeline | null = null;

    /** Register a DOM element under a unique ID */
    registerElement(id: string, el: HTMLElement): void {
        const existing = this.elements.get(id);
        this.elements.set(id, {
            el,
            animations: existing?.animations ?? {},
        });
    }

    /** Assign per-state animation configs for an element */
    assignAnimations(id: string, animations: StateAnimations): void {
        const entry = this.elements.get(id);
        if (entry) {
            entry.animations = animations;
        } else {
            console.warn(`[HeroAnimationController] Element "${id}" not registered.`);
        }
    }

    /** Play all registered animations for a segment key (e.g. 'idle', 'segment0') */
    transitionTo(segmentKey: string): gsap.core.Timeline {
        // Kill any active timeline
        if (this.activeTimeline) {
            this.activeTimeline.kill();
        }

        const tl = gsap.timeline();
        this.activeTimeline = tl;

        this.elements.forEach((entry, id) => {
            const configs = entry.animations[segmentKey];
            if (!configs || configs.length === 0) return;

            configs.forEach((config) => {
                const vars = this.buildTweenVars(config);
                const target = config.targetChildren
                    ? Array.from(entry.el.children) as HTMLElement[]
                    : entry.el;
                if (config.stagger !== undefined) vars.stagger = config.stagger;

                // countUp uses fromTo so it always replays from 0
                if (config.type === 'countUp') {
                    tl.fromTo(target, { textContent: 0 }, vars, 0);
                } else {
                    tl.to(target, vars, 0); // All at position 0 — simultaneous
                }
            });
        });

        return tl;
    }

    /** Build a timeline for a single registered element at a given segment */
    buildElementTimeline(id: string, segmentKey: string): gsap.core.Timeline {
        const tl = gsap.timeline();
        const entry = this.elements.get(id);
        if (!entry) return tl;

        const configs = entry.animations[segmentKey];
        if (!configs || configs.length === 0) return tl;

        configs.forEach((config) => {
            const vars = this.buildTweenVars(config);
            const target = config.targetChildren
                ? Array.from(entry.el.children) as HTMLElement[]
                : entry.el;
            if (config.stagger !== undefined) vars.stagger = config.stagger;

            if (config.type === 'countUp') {
                tl.fromTo(target, { textContent: 0 }, vars, 0);
            } else {
                tl.to(target, vars, 0);
            }
        });

        return tl;
    }

    /** Instantly snap all elements to their target state for a segment key.
     *  Uses gsap.set (duration 0) — no animation, deterministic. */
    applyInstant(segmentKey: string): void {
        this.elements.forEach((entry) => {
            const configs = entry.animations[segmentKey];
            if (!configs || configs.length === 0) return;

            configs.forEach((config) => {
                // Skip countUp — numeric text should not be set instantly
                if (config.type === 'countUp') return;

                const vars = this.buildTweenVars(config);
                const target = config.targetChildren
                    ? Array.from(entry.el.children) as HTMLElement[]
                    : entry.el;

                // Remove timing properties for instant set
                delete vars.duration;
                delete vars.ease;
                delete vars.delay;
                delete vars.stagger;

                gsap.set(target, vars);
            });
        });
    }

    /** Get all registered element IDs */
    getAllRegisteredIds(): string[] {
        return Array.from(this.elements.keys());
    }

    /** Get all registered element IDs matching a prefix */
    getIdsByPrefix(prefix: string): string[] {
        const ids: string[] = [];
        this.elements.forEach((_, id) => {
            if (id.startsWith(prefix)) ids.push(id);
        });
        return ids;
    }

    /** Build GSAP vars from preset + user overrides */
    private buildTweenVars(config: AnimationConfig): gsap.TweenVars {
        const defaults = { ...PRESET_DEFAULTS[config.type] };

        // Apply user overrides
        if (config.opacity !== undefined) defaults.opacity = config.opacity;
        if (config.depth !== undefined) defaults.z = config.type === 'moveForward' ? config.depth : -config.depth;
        if (config.scale !== undefined) defaults.scale = config.scale;
        if (config.distance !== undefined) {
            if (config.type === 'slideUp') defaults.y = -config.distance;
            else if (config.type === 'slideDown') defaults.y = config.distance;
            else if (config.type === 'slideLeft') defaults.x = -config.distance;
            else if (config.type === 'slideRight') defaults.x = config.distance;
        }
        if (config.duration !== undefined) defaults.duration = config.duration;
        if (config.easing !== undefined) defaults.ease = config.easing;

        // lineDraw: animate SVG line attributes
        if (config.type === 'lineDraw') {
            if (config.lineEndX !== undefined) defaults.attr = { ...((defaults.attr as object) || {}), x2: config.lineEndX };
            if (config.lineEndY !== undefined) defaults.attr = { ...((defaults.attr as object) || {}), y2: config.lineEndY };
        }
        if (config.type === 'lineCollapse') {
            // Collapse x2/y2 back to x1/y1 (handled by caller setting lineEndX/Y to anchor)
            if (config.lineEndX !== undefined) defaults.attr = { ...((defaults.attr as object) || {}), x2: config.lineEndX };
            if (config.lineEndY !== undefined) defaults.attr = { ...((defaults.attr as object) || {}), y2: config.lineEndY };
        }

        // glowPulse: animate scale via transform translate
        if (config.type === 'glowPulse' && config.scale !== undefined) {
            defaults.scale = config.scale;
        }

        // countUp: animate numeric text content
        if (config.type === 'countUp') {
            defaults.textContent = config.targetValue ?? 0;
            defaults.snap = { textContent: 1 };
        }

        // Per-element delay
        if (config.delay !== undefined) defaults.delay = config.delay;

        return defaults;
    }

    /** Kill active timeline */
    destroy(): void {
        if (this.activeTimeline) {
            this.activeTimeline.kill();
            this.activeTimeline = null;
        }
        this.elements.clear();
    }
}
