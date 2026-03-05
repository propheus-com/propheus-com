import gsap from 'gsap';
import { getLenisInstance } from './SmoothScroll';
import { HeroAnimationController, StateAnimations, AnimationConfig } from './HeroAnimationController';

/* ============================================
   PropheusExperience — Cinematic State Machine
   ============================================
   4-state scroll-direction controller.
   Modular animation system via HeroAnimationController.
   Accumulated scroll delta with threshold.

   States:
     0 — Frame 0, headline visible, navbar visible, signal panels hidden
     1 — Frame 0, headline fades out, glass signal panels stagger in
         with connector lines + glow nodes, navbar visible
     2 — Panels/connectors collapse, navbar fades, canvas plays 0→61
     3 — Frames 61→122, all UI hidden, final hero

   Scroll Lock:
     - States 0–2: ALL scroll completely blocked.
     - State 3 complete: scroll unlocked.
     - Scroll back to top: re-locked at state 3.
   ============================================ */

export interface PropheusExperienceOptions {
    heroEl: HTMLElement;
    canvas: HTMLCanvasElement;
    ambientCanvas: HTMLCanvasElement;
    loadingBar: HTMLElement | null;
    frameCount?: number;
    framePathTemplate?: string;
    frameExtension?: string;
    framePadding?: number;
    frameStartIndex?: number;
}

export class PropheusExperience {
    private frameCount: number;
    private heroEl: HTMLElement;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private ambientCanvas: HTMLCanvasElement;
    private ambientCtx: CanvasRenderingContext2D;
    private loadingBar: HTMLElement | null;
    private framePathTemplate: string;
    private frameExtension: string;
    private framePadding: number;
    private frameStartIndex: number;

    private images: HTMLImageElement[] = [];
    private imagesLoaded = false;
    private resizeTimer: ReturnType<typeof setTimeout> | null = null;
    private displayWidth = 0;
    private displayHeight = 0;

    // ========================================
    // FRAME CONTROLLER
    // ========================================
    private targetFrame = 0;
    private currentFrame = 0;
    private lastRenderedFrame = -1;
    private frameProxy = { value: 0 };

    // ========================================
    // STATE MACHINE
    // ========================================
    private heroState = 0;
    private isAnimating = false;
    private isHeroLocked = true;
    private activeTimeline: gsap.core.Timeline | null = null;

    // ========================================
    // SCROLL SENSITIVITY — accumulated delta
    // ========================================
    private accumulatedDelta = 0;
    private readonly SCROLL_THRESHOLD = 50; // ~3x more sensitive

    // ========================================
    // ANIMATION CONTROLLER
    // ========================================
    private animController: HeroAnimationController;

    // Event handlers
    private tickerCallback: (() => void) | null = null;
    private _boundResize: () => void;

    // Scroll lock handlers
    private _onWheel = (e: WheelEvent): void => {
        if (!this.isHeroLocked) return;

        e.preventDefault();
        e.stopPropagation();

        if (this.isAnimating) return;

        // Accumulate scroll delta
        this.accumulatedDelta += e.deltaY;

        if (this.accumulatedDelta >= this.SCROLL_THRESHOLD) {
            this.accumulatedDelta = 0;
            this.advanceState();
        } else if (this.accumulatedDelta <= -this.SCROLL_THRESHOLD) {
            this.accumulatedDelta = 0;
            this.reverseState();
        }
    };

    private _touchStartY = 0;

    private _onTouchStart = (e: TouchEvent): void => {
        if (!this.isHeroLocked) return;
        this._touchStartY = e.touches[0].clientY;
    };

    private _onTouchMove = (e: TouchEvent): void => {
        if (!this.isHeroLocked) return;
        e.preventDefault();
        e.stopPropagation();

        if (this.isAnimating) return;

        const touchY = e.touches[0].clientY;
        const delta = this._touchStartY - touchY;

        if (Math.abs(delta) < 30) return;
        this._touchStartY = touchY;

        if (delta > 0) {
            this.advanceState();
        } else {
            this.reverseState();
        }
    };

    private _onKeyDown = (e: KeyboardEvent): void => {
        if (!this.isHeroLocked) return;

        const scrollKeys = ['ArrowDown', 'ArrowUp', 'Space', 'PageDown', 'PageUp', 'Home', 'End'];
        if (scrollKeys.includes(e.key)) {
            e.preventDefault();
            if (this.isAnimating) return;

            if (e.key === 'ArrowDown' || e.key === 'Space' || e.key === 'PageDown') {
                this.advanceState();
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                this.reverseState();
            }
        }
    };

    private _onScrollPin = (): void => {
        if (this.isHeroLocked && window.scrollY !== 0) {
            window.scrollTo(0, 0);
        }
    };

    private _onScrollBack = (): void => {
        if (this.isHeroLocked) return;
        if (window.scrollY <= 0) {
            this.heroState = 6;
            this.engageLock();
            window.dispatchEvent(new CustomEvent('propheus:state6'));
            console.log('[State Machine] Re-locked at state 6');
        }
    };

    constructor(opts: PropheusExperienceOptions) {
        this.frameCount = opts.frameCount ?? 177;
        this.heroEl = opts.heroEl;
        this.canvas = opts.canvas;
        this.ctx = this.canvas.getContext('2d')!;
        this.ambientCanvas = opts.ambientCanvas;
        this.ambientCtx = this.ambientCanvas.getContext('2d')!;
        this.loadingBar = opts.loadingBar;
        this.framePathTemplate = opts.framePathTemplate ?? '/assets/frames/batch1_';
        this.frameExtension = opts.frameExtension ?? '.webp';
        this.framePadding = opts.framePadding ?? 5;
        this.frameStartIndex = opts.frameStartIndex ?? 0;

        this._boundResize = this.handleResize.bind(this);
        this.animController = new HeroAnimationController();

        this.init();
    }

    /* ========================================
       INIT
       ======================================== */
    private init(): void {
        this.setCanvasSize();
        window.addEventListener('resize', this._boundResize);

        // Pin scroll and lock
        window.scrollTo(0, 0);
        this.engageLock();

        // Register hero elements with animation controller
        this.registerHeroElements();

        // Snap all elements to their initial state (seg0 visible, everything else hidden)
        this.animController.applyInstant('state0');

        this.loadImages().then(() => {
            this.startTicker();
            this.render(0);
            this.lastRenderedFrame = 0;
        });
    }

    /* ========================================
       REGISTER HERO ELEMENTS + ASSIGN ANIMATIONS
       5-segment layout: seg0-text, seg1-headline,
       signal-pointers (sp-*), seg4-text/strip/powered.
       ======================================== */
    private registerHeroElements(): void {

        /* Helper: batch-register dot/line/panel/content quartet */
        const registerPointer = (
            prefix: string,
            showState: number,
            hideState: number,
            prevState: number,
            baseDelay = 0,
        ) => {
            const parts = ['dot', 'line', 'panel', 'content'] as const;
            const configs: Record<string, { type: string; show: AnimationConfig[]; hide: AnimationConfig[] }> = {
                dot: {
                    type: 'dot',
                    show: [
                        // Pulse comes first — big expand then settle
                        { type: 'fadeIn', opacity: 1, duration: 0.45, delay: baseDelay, easing: 'power3.out' },
                        { type: 'glowPulse', scale: 1.4, duration: 0.5, delay: baseDelay, easing: 'power3.out' },
                        { type: 'scaleUp', scale: 1, duration: 0.55, delay: baseDelay + 0.1, easing: 'elastic.out(1,0.5)' },
                    ],
                    hide: [
                        { type: 'fadeOut', opacity: 0, duration: 0.55, easing: 'power3.out' },
                        { type: 'scaleDown', scale: 0.8, duration: 0.55, easing: 'power3.out' },
                    ],
                },
                line: {
                    type: 'line',
                    // Line draws after the big pulse settles
                    show: [{ type: 'scaleYDraw', duration: 0.85, delay: baseDelay + 0.52, easing: 'power3.out' }],
                    hide: [{ type: 'scaleYCollapse', duration: 0.55, easing: 'power3.out' }],
                },
                panel: {
                    type: 'panel',
                    // Panel appears from the pulse direction after line is done
                    show: [
                        { type: 'fadeIn', opacity: 1, duration: 0.9, delay: baseDelay + 1.0, easing: 'power3.out' },
                        { type: 'slideDown', distance: 0, duration: 0.9, delay: baseDelay + 1.0, easing: 'power3.out' },
                        { type: 'scaleUp', scale: 1, duration: 0.9, delay: baseDelay + 1.0, easing: 'power3.out' },
                    ],
                    hide: [
                        { type: 'fadeOut', opacity: 0, duration: 0.55, easing: 'power3.out' },
                        { type: 'slideDown', distance: 10, duration: 0.55, easing: 'power3.out' },
                        { type: 'scaleDown', scale: 0.97, duration: 0.55, easing: 'power3.out' },
                    ],
                },
                content: {
                    type: 'content',
                    show: [
                        { type: 'fadeIn', opacity: 1, duration: 0.75, delay: baseDelay + 1.25, easing: 'power3.out' },
                        { type: 'slideDown', distance: 0, duration: 0.75, delay: baseDelay + 1.25, easing: 'power3.out' },
                    ],
                    hide: [
                        { type: 'fadeOut', opacity: 0, duration: 0.55, easing: 'power3.out' },
                        { type: 'slideDown', distance: 12, duration: 0.55, easing: 'power3.out' },
                    ],
                },
            };

            for (const part of parts) {
                const el = this.heroEl.querySelector(`.${prefix}-${part}`) as HTMLElement;
                if (!el) continue;
                const id = `${prefix}-${part}`;
                const c = configs[part];
                this.animController.registerElement(id, el);
                const anims: StateAnimations = {};
                // All states before showState → hidden
                for (let s = 0; s <= prevState; s++) anims[`state${s}`] = c.hide;
                // showState → shown
                anims[`state${showState}`] = c.show;
                // hideState+ → hidden
                for (let s = hideState; s <= 6; s++) anims[`state${s}`] = c.hide;
                this.animController.assignAnimations(id, anims);
            }
        };

        // ===== SEGMENT 0 — "Goodbye to Dashboards" =====
        // State 0: canvas only, no UI
        // State 1: ThoughtBubble fades in
        // State 2+: ThoughtBubble fades out
        const seg0Text = this.heroEl.querySelector('.seg0-text') as HTMLElement;
        if (seg0Text) {
            this.animController.registerElement('seg0-text', seg0Text);
            this.animController.assignAnimations('seg0-text', {
                state0: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state1: [
                    { type: 'fadeIn', opacity: 1, duration: 0.9, easing: 'power3.out' },
                    { type: 'slideDown', distance: 0, duration: 0.9, easing: 'power3.out' },
                ],
                state2: [
                    { type: 'fadeOut', opacity: 0, duration: 0.5, easing: 'power2.in' },
                    { type: 'slideUp', distance: 30, duration: 0.5, easing: 'power2.in' },
                ],
                state3: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state4: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state5: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state6: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
            });
        }

        // ===== SEGMENT 1 (previously seg1) — Headline + Topo + Weather =====
        const seg1Headline = this.heroEl.querySelector('.seg1-headline') as HTMLElement;
        if (seg1Headline) {
            this.animController.registerElement('seg1-headline', seg1Headline);
            this.animController.assignAnimations('seg1-headline', {
                state0: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state1: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state2: [
                    { type: 'fadeIn', opacity: 1, duration: 0.9, delay: 1.0, easing: 'power3.out' },
                    { type: 'slideDown', distance: 0, duration: 0.9, delay: 1.0, easing: 'power3.out' },
                ],
                state3: [
                    { type: 'fadeOut', opacity: 0, duration: 0.4, easing: 'power2.in' },
                    { type: 'slideUp', distance: 20, duration: 0.4, easing: 'power2.in' },
                ],
                state4: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state5: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state6: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
            });
        }
        registerPointer('sp-topo', 2, 3, 1, 1.3);
        registerPointer('sp-weather', 2, 3, 1, 2.6);

        // ===== SEGMENT 2 — Sentiment + Competitor + PromoWatch =====
        registerPointer('sp-sentiment', 3, 4, 2, 0.8);
        registerPointer('sp-competitor', 3, 4, 2, 2.0);
        registerPointer('sp-promo', 3, 4, 2, 3.2);

        // ===== SEGMENT 3 — Traffic + Footfall =====
        registerPointer('sp-traffic', 4, 5, 3, 0.8);
        registerPointer('sp-footfall', 4, 5, 3, 2.0);

        // ===== SEGMENT 4 — Conclusion =====
        const seg4Text = this.heroEl.querySelector('.seg4-text') as HTMLElement;
        if (seg4Text) {
            this.animController.registerElement('seg4-text', seg4Text);
            this.animController.assignAnimations('seg4-text', {
                state0: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state1: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state2: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state3: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state4: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state5: [
                    { type: 'fadeIn', opacity: 1, duration: 0.8, easing: 'power3.out' },
                    { type: 'slideDown', distance: 0, duration: 0.8, easing: 'power3.out' },
                ],
                state6: [{ type: 'fadeOut', opacity: 0, duration: 0.5 }],
            });
        }

        const seg4Strip = this.heroEl.querySelector('.seg4-strip') as HTMLElement;
        if (seg4Strip) {
            this.animController.registerElement('seg4-strip', seg4Strip);
            this.animController.assignAnimations('seg4-strip', {
                state0: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state1: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state2: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state3: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state4: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state5: [
                    { type: 'fadeIn', opacity: 1, duration: 0.6, delay: 0.3, easing: 'power2.out' },
                    { type: 'slideDown', distance: 0, duration: 0.6, delay: 0.3, easing: 'power2.out' },
                ],
                state6: [{ type: 'fadeOut', opacity: 0, duration: 0.5 }],
            });
        }

        const seg4Powered = this.heroEl.querySelector('.seg4-powered') as HTMLElement;
        if (seg4Powered) {
            this.animController.registerElement('seg4-powered', seg4Powered);
            this.animController.assignAnimations('seg4-powered', {
                state0: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state1: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state2: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state3: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state4: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state5: [
                    { type: 'fadeIn', opacity: 1, duration: 0.5, delay: 0.6, easing: 'power2.out' },
                ],
                state6: [{ type: 'fadeOut', opacity: 0, duration: 0.5 }],
            });
        }

        // ===== NAVBAR =====
        const navbar = document.querySelector('.site-navbar') as HTMLElement;
        if (navbar) {
            this.animController.registerElement('navbar', navbar);
            this.animController.assignAnimations('navbar', {
                state0: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state1: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state2: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state3: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state4: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state5: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
                state6: [{ type: 'fadeOut', opacity: 0, duration: 0.3 }],
            });
        }
    }

    /* ========================================
       SCROLL LOCK — triple-layer
       ======================================== */
    private engageLock(): void {
        this.isHeroLocked = true;
        this.accumulatedDelta = 0;

        window.scrollTo(0, 0);

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.touchAction = 'none';
        document.body.style.touchAction = 'none';

        window.addEventListener('scroll', this._onScrollPin, { passive: false });

        this.stopLenis();

        window.addEventListener('wheel', this._onWheel, { passive: false });
        window.addEventListener('touchstart', this._onTouchStart, { passive: true });
        window.addEventListener('touchmove', this._onTouchMove, { passive: false });
        window.addEventListener('keydown', this._onKeyDown);

        window.removeEventListener('scroll', this._onScrollBack);
    }

    private disengageLock(): void {
        this.isHeroLocked = false;
        this.accumulatedDelta = 0;

        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.documentElement.style.touchAction = '';
        document.body.style.touchAction = '';

        window.removeEventListener('scroll', this._onScrollPin);

        const lenis = getLenisInstance();
        if (lenis) lenis.start();

        window.removeEventListener('wheel', this._onWheel);
        window.removeEventListener('touchstart', this._onTouchStart);
        window.removeEventListener('touchmove', this._onTouchMove);
        window.removeEventListener('keydown', this._onKeyDown);

        window.addEventListener('scroll', this._onScrollBack, { passive: true });

        console.log('[Lock] Disengaged — native scroll enabled');
    }

    private stopLenis(): void {
        const lenis = getLenisInstance();
        if (lenis) {
            lenis.stop();
        } else {
            setTimeout(() => {
                const l = getLenisInstance();
                if (l) l.stop();
            }, 100);
        }
    }

    /* ========================================
       STATE ADVANCE / REVERSE
       ======================================== */
    private advanceState(): void {
        const from = this.heroState;
        const to = from + 1;

        // At state 6, the next scroll forward disengages the lock instead of advancing
        if (from === 6) {
            this.disengageLock();
            return;
        }

        if (to > 6) return;

        this.isAnimating = true;
        console.log(`[State] ${from} → ${to}`);
        this.runTransition(from, to);
    }

    private reverseState(): void {
        const from = this.heroState;
        const to = from - 1;

        if (to < 0) return;

        // Notify overlay to hide when leaving state 6
        if (from === 6) {
            window.dispatchEvent(new CustomEvent('propheus:state6:exit'));
        }

        this.isAnimating = true;
        console.log(`[State] ${from} → ${to}`);
        this.runTransition(from, to);
    }

    /* ========================================
       STATE TRANSITIONS — 5 segments
       Frames: 0→61→90→120→146→176
       Each transition: UI anim + canvas frame sweep
       ======================================== */
    private runTransition(from: number, to: number): void {
        if (this.activeTimeline) {
            this.activeTimeline.kill();
            this.activeTimeline = null;
        }

        // Dispatch state-specific UI events so self-managing React components
        // can react without being registered in the GSAP animation controller.
        if (to === 2) window.dispatchEvent(new CustomEvent('propheus:state2'));
        if (from === 2 && to !== 2) window.dispatchEvent(new CustomEvent('propheus:state2:exit'));

        const tl = gsap.timeline({
            onComplete: () => {
                this.heroState = to;
                this.isAnimating = false;
                this.accumulatedDelta = 0;
                console.log(`[State] Arrived at ${to}`);
                // State 6 is the final frame — dispatch event but keep lock
                // User must scroll once more to proceed past hero
                if (to === 6) {
                    window.dispatchEvent(new CustomEvent('propheus:state6'));
                }
            },
        });
        this.activeTimeline = tl;

        // Frame ranges per segment (state0=0, state1=0, state2=61, state3=90, state4=120, state5=146, state6=176)
        const frames = [0, 0, 61, 90, 120, 146, 176];
        const startFrame = frames[from];
        const endFrame = frames[to];
        const direction = to > from ? 1 : -1;
        const frameDuration = Math.abs(endFrame - startFrame) * 0.018; // ~18ms/frame

        const segmentKey = `state${to}`;

        // Collect all registered IDs that should show/hide at each state
        const allIds = this.animController.getAllRegisteredIds();
        const stateKey = `state${to}`;

        // --- Build UI animations for destination state ---
        allIds.forEach((id) => {
            const elTl = this.animController.buildElementTimeline(id, stateKey);
            if (elTl) tl.add(elTl, 0);
        });

        // --- Canvas frame animation ---
        const uiLeadTime = direction > 0 ? 0.3 : 0; // small delay after UI starts when advancing
        this.frameProxy.value = startFrame;
        tl.to(this.frameProxy, {
            value: endFrame,
            duration: Math.max(frameDuration, 0.8),
            ease: 'power2.inOut',
            onUpdate: () => { this.targetFrame = this.frameProxy.value; },
        }, uiLeadTime);
    }

    /* ========================================
       TICKER — single lerp loop
       ======================================== */
    private startTicker(): void {
        this.tickerCallback = () => {
            this.currentFrame += (this.targetFrame - this.currentFrame) * 0.1;

            const frameIndex = Math.min(
                this.frameCount - 1,
                Math.max(0, Math.floor(this.currentFrame))
            );

            if (frameIndex !== this.lastRenderedFrame) {
                this.render(frameIndex);
                this.lastRenderedFrame = frameIndex;
            }
        };
        gsap.ticker.add(this.tickerCallback);
    }

    /* ========================================
       CANVAS SIZING (DPI-aware)
       ======================================== */
    private setCanvasSize(): void {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.ambientCanvas.width = w * dpr;
        this.ambientCanvas.height = h * dpr;
        this.ambientCanvas.style.width = '110%';
        this.ambientCanvas.style.height = '110%';
        this.ambientCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.displayWidth = w;
        this.displayHeight = h;
    }

    /* ========================================
       IMAGE PATH
       ======================================== */
    private getImagePath(index: number): string {
        const padded = String(index + this.frameStartIndex).padStart(this.framePadding, '0');
        return `${this.framePathTemplate}${padded}${this.frameExtension}`;
    }

    /* ========================================
       IMAGE PRELOADER
       ======================================== */
    private loadImages(): Promise<void> {
        return new Promise((resolve) => {
            let loaded = 0;
            let hasError = false;

            for (let i = 0; i < this.frameCount; i++) {
                const img = new Image();
                img.src = this.getImagePath(i);

                img.onload = () => {
                    loaded++;
                    this.updateLoadingBar(loaded / this.frameCount);
                    if (loaded === this.frameCount) {
                        this.imagesLoaded = true;
                        this.hideLoadingBar();
                        resolve();
                    }
                };

                img.onerror = () => {
                    if (!hasError) {
                        hasError = true;
                        console.info('[Propheus] Frames not found — using placeholders.');
                    }
                    loaded++;
                    this.updateLoadingBar(loaded / this.frameCount);
                    if (loaded === this.frameCount) {
                        this.imagesLoaded = false;
                        this.hideLoadingBar();
                        resolve();
                    }
                };

                this.images[i] = img;
            }
        });
    }

    /* ========================================
       LOADING BAR
       ======================================== */
    private updateLoadingBar(progress: number): void {
        if (this.loadingBar) {
            this.loadingBar.style.width = (progress * 100) + '%';
        }
    }

    private hideLoadingBar(): void {
        if (this.loadingBar) {
            this.loadingBar.classList.add('hidden');
            setTimeout(() => {
                if (this.loadingBar) this.loadingBar.style.display = 'none';
            }, 500);
        }
    }

    /* ========================================
       RENDER
       ======================================== */
    private render(frameIndex: number): void {
        const w = this.displayWidth;
        const h = this.displayHeight;

        this.ctx.clearRect(0, 0, w, h);
        this.ambientCtx.clearRect(0, 0, w, h);

        const img = this.images[frameIndex];

        if (this.imagesLoaded && img && img.naturalWidth) {
            this.drawCover(this.ctx, img, w, h);
            this.drawCover(this.ambientCtx, img, w, h);
        } else {
            this.renderPlaceholder(frameIndex, w, h);
        }
    }

    /* ========================================
       DRAW HELPERS
       ======================================== */
    private drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cw: number, ch: number): void {
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    /* ========================================
       PLACEHOLDER
       ======================================== */
    private renderPlaceholder(frameIndex: number, w: number, h: number): void {
        const hue = (frameIndex / this.frameCount) * 180 + 160;
        const lightness = 6 + (frameIndex / this.frameCount) * 4;

        this.ctx.fillStyle = `hsl(${hue}, 40%, ${lightness}%)`;
        this.ctx.fillRect(0, 0, w, h);

        const rw = w * 0.5;
        const rh = h * 0.5;
        this.ctx.strokeStyle = `hsla(${hue}, 60%, 30%, 0.4)`;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect((w - rw) / 2, (h - rh) / 2, rw, rh);

        this.ctx.fillStyle = 'rgba(230, 241, 241, 0.15)';
        this.ctx.font = '13px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `FRAME ${String(frameIndex + 1).padStart(4, '0')} / ${this.frameCount}`,
            w / 2, h / 2
        );

        this.ambientCtx.fillStyle = `hsl(${hue}, 40%, ${lightness}%)`;
        this.ambientCtx.fillRect(0, 0, w, h);
    }

    /* ========================================
       RESIZE (debounced)
       ======================================== */
    private handleResize(): void {
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.setCanvasSize();
            this.lastRenderedFrame = -1;
        }, 150);
    }

    /* ========================================
       CLEANUP
       ======================================== */
    destroy(): void {
        window.removeEventListener('resize', this._boundResize);
        window.removeEventListener('wheel', this._onWheel);
        window.removeEventListener('touchstart', this._onTouchStart);
        window.removeEventListener('touchmove', this._onTouchMove);
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('scroll', this._onScrollBack);
        window.removeEventListener('scroll', this._onScrollPin);
        if (this.resizeTimer) clearTimeout(this.resizeTimer);

        if (this.tickerCallback) {
            gsap.ticker.remove(this.tickerCallback);
            this.tickerCallback = null;
        }

        if (this.activeTimeline) this.activeTimeline.kill();
        this.animController.destroy();

        document.documentElement.style.overflow = '';
        document.documentElement.style.touchAction = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        const lenis = getLenisInstance();
        if (lenis) lenis.start();

        this.images.length = 0;
    }
}
