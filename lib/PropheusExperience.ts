import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenisInstance } from "./SmoothScroll";
import {
  HeroAnimationController,
  StateAnimations,
  AnimationConfig,
  AnimationPreset,
} from "./HeroAnimationController";

/* ============================================
   PropheusExperience — Cinematic State Machine
   ============================================
   5-state controller.
   States 0–3: controlled by arrow keys and ActivateAgent component.
   State 4: Lenis-driven manual scroll (frames 240→240).

   States:
     0 — Frame 0, headline + navbar visible (instant), just Launch button
     1 — Frame 0 hold, topo/weather/StoreMapMarkers stagger in, headline + navbar stay
     2 — Frame 0→120, sentiment/competitor/promo in, navbar fades, prev exits
     3 — Frame 120→240, traffic/footfall in, prev exits, "Exit Agent" visible
     4 — Lenis scroll: frames 240→240, smooth hero exit at final frame

   Input:
     - States 0–3: Arrow keys (↑↓←→) and ActivateAgent component (Launch / ◀▶ / Exit).
     - Scroll wheel and trackpad are completely blocked during auto-scroll states.
     - State 4: Lenis scroll active over pinned hero (frames 240–240).
     - Past frame 240: natural page scroll (hero scrolls out of view).
     - Scroll back to top: re-enters Lenis mode, then auto-scroll in reverse.
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
  private pendingState = 0;
  private isAnimating = false;
  private isHeroLocked = true;
  private activeUITimeline: gsap.core.Timeline | null = null;
  private activeFrameTween: gsap.core.Tween | null = null;
  private uiDone = false;
  private frameDone = false;
  private isReverseTransition = false;
  private scrollWindowStart = 0;
  private lastWheelTime = 0;
  private transitionEndTime = 0;
  private readonly SCROLL_WINDOW_MS = 600;
  private readonly WHEEL_GAP_MS = 200;
  private readonly POST_TRANSITION_COOLDOWN_MS = 200;

  // ========================================
  // LENIS SCROLL MODE (state 4)
  // ========================================
  private isLenisScrollMode = false;
  private lenisExitDone = false; // true once past frame 240 (navbar shown)
  private lenisScrollStart = 0; // scrollY when Lenis mode started
  private readonly LENIS_FRAME_START = 240;
  private readonly LENIS_FRAME_END = 240;
  private readonly LENIS_SCROLL_DISTANCE = 700; // px of scroll for 120 frames (≈2x faster than 1400)
  private readonly LENIS_POST_BUFFER = 0; // no dead scroll — hero starts scrolling off immediately at 1:1

  // ========================================
  // SCROLL SENSITIVITY — accumulated delta
  // ========================================
  private accumulatedDelta = 0;
  private readonly SCROLL_THRESHOLD = 50; // ~3x more sensitive

  // ========================================
  // GLOBAL INPUT COOLDOWN — configurable delay (ms)
  // Applies to key presses, ActivateAgent advance/reverse.
  // Adjust this value for trial and error.
  // ========================================
  private readonly INPUT_COOLDOWN_MS = 600;
  private lastInputTime = 0;

  // ========================================
  // ANIMATION CONTROLLER
  // ========================================
  private animController: HeroAnimationController;

  // Cached DOM references for Lenis scroll (avoid querySelectorAll on every tick)
  private _lenisContentEl: HTMLElement | null = null;
  private _lenisTextBlock: HTMLElement | null = null;
  private _lenisOuterCols: HTMLElement[] = [];
  private _lenisInnerCols: HTMLElement[] = [];
  private _lenisDomCached = false;

  // Event handlers
  private tickerCallback: (() => void) | null = null;
  private _boundResize: () => void;
  private _launched = false;
  private _forceExited = false;

  // ========================================
  // INPUT HANDLERS
  // Wheel/trackpad scroll is NOT used for state transitions.
  // Only arrow keys and the ActivateAgent component drive states.
  // ========================================

  /* Block wheel/touch from moving the page while hero is locked */
  private _onWheelBlock = (e: WheelEvent): void => {
    if (this.isHeroLocked) {
      e.preventDefault();
    }
  };

  // Touch logic for state transitions
  private _touchStartY = 0;
  private readonly TOUCH_THRESHOLD = 40;

  private _onTouchStart = (e: TouchEvent): void => {
    if (!this.isHeroLocked) return;
    this._touchStartY = e.touches[0].clientY;
  };

  private _onTouchMove = (e: TouchEvent): void => {
    if (!this.isHeroLocked) return;
    // Keep preventing default so page doesn't bounce/scroll behind it
    e.preventDefault();
  };

  private _onTouchEnd = (e: TouchEvent): void => {
    // We no longer trigger state changes directly via touch.
    // The ActivateAgent component handles touch gestures and emits
    // 'propheus:advance' / 'propheus:reverse' to ensure UI text syncs properly.
  };

  /* Arrow keys: up/down advance/reverse state */
  private _onKeyDown = (e: KeyboardEvent): void => {
    if (!this.isHeroLocked) return;
    const now = Date.now();
    if (now - this.lastInputTime < this.INPUT_COOLDOWN_MS) return;

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      this.lastInputTime = now;
      if (this.isAnimating) this.skipToEnd();
      this.advanceState();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      this.lastInputTime = now;
      if (this.isAnimating) this.skipToEnd();
      this.reverseState();
    }
  };

  /* ActivateAgent component events */
  private _onAgentLaunch = (): void => {
    if (this.heroState !== 0 || this.isAnimating) return;
    this.advanceState(); // 0 → 1
  };

  private _onAgentAdvance = (): void => {
    if (!this.isHeroLocked) return;
    if (this.isAnimating) this.skipToEnd();
    this.advanceState();
  };

  private _onAgentReverse = (): void => {
    if (!this.isHeroLocked) return;
    if (this.isAnimating) this.skipToEnd();
    this.reverseState();
  };

  private _onAgentExit = (): void => {
    if (this.isAnimating) this.skipToEnd();

    // Hide state 3 components
    this.animController.applyQuick("state4", 0.5);

    // Enter Lenis scroll mode (hero becomes scrollable at frame 240)
    this.heroState = 4;
    this.enterLenisScrollMode();

    // After DOM settles, auto-scroll via Lenis to the end of the Lenis zone
    requestAnimationFrame(() => {
      const lenis = getLenisInstance();
      if (lenis) {
        lenis.scrollTo(this.LENIS_SCROLL_DISTANCE, {
          duration: 2.0,
          easing: (t: number) => 1 - Math.pow(1 - t, 3), // cubic ease-out
        });
      }
    });
  };

  private _onScrollPin = (): void => {
    if (this.isHeroLocked && window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
  };

  private _onForceExit = (): void => {
    // Kill any active animations
    if (this.activeUITimeline) {
      this.activeUITimeline.kill();
      this.activeUITimeline = null;
    }
    if (this.activeFrameTween) {
      this.activeFrameTween.kill();
      this.activeFrameTween = null;
    }
    this.animController.killAllTweens();

    // Exit lenis-scroll-mode if it was active
    if (this.isLenisScrollMode) {
      this.isLenisScrollMode = false;
      window.removeEventListener("scroll", this._onLenisScroll);
      window.removeEventListener("wheel", this._onLenisWheel);
    }

    // Unlock hero if locked — but remove scrollBack immediately after
    // to prevent re-entering Lenis mode when user scrolls to top.
    if (this.isHeroLocked) {
      this.disengageLock();
    }
    // Prevent _onScrollBack from re-entering Lenis after force-exit
    this._forceExited = true;
    window.removeEventListener("scroll", this._onScrollBack);

    // Render the final frame and apply final "shrunk card" visuals
    // so the hero looks correct when scrolling past it.
    this.targetFrame = this.LENIS_FRAME_END;
    this.currentFrame = this.LENIS_FRAME_END;
    if (this.imagesLoaded) {
      this.render(this.LENIS_FRAME_END);
      this.lastRenderedFrame = this.LENIS_FRAME_END;
    }

    // Cache lenis DOM refs if not yet cached (needed for updateLenisVisuals)
    if (!this._lenisDomCached) {
      this._lenisContentEl = this.heroEl.querySelector(
        ".lenis-content",
      ) as HTMLElement;
      this._lenisTextBlock = this.heroEl.querySelector(
        ".lenis-text-block",
      ) as HTMLElement;
      this._lenisOuterCols = Array.from(
        this.heroEl.querySelectorAll(".parallax-col-outer"),
      ) as HTMLElement[];
      this._lenisInnerCols = Array.from(
        this.heroEl.querySelectorAll(".parallax-col-inner"),
      ) as HTMLElement[];
      this._lenisDomCached = true;
    }
    this.updateLenisVisuals(1);
    this.lenisExitDone = true;

    // Match the visual state that the normal Lenis scroll-through produces:
    // ambient canvas hidden, lenis background visible behind the shrunk card
    this.ambientCanvas.style.opacity = "0";
    const bgEl = this.heroEl.querySelector(".lenis-bg") as HTMLElement;
    if (bgEl) bgEl.style.opacity = "1";

    // Hide all segment/overlay UI so only the shrunk canvas card remains
    this.animController.applyInstant("state0");
    // state0 still shows headline + clouds — force-hide every overlay layer
    this.heroEl
      .querySelectorAll<HTMLElement>(".segment-layer, .hero-clouds-layer")
      .forEach((el) => {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
      });

    // Set hero to its natural height — the canvas card is inside
    // the sticky wrapper which just sizes to 100vh.
    this.heroEl.style.height = "";
    const stickyEl = this.heroEl.querySelector(".hero-sticky") as HTMLElement;
    if (stickyEl) {
      stickyEl.style.position = "";
      stickyEl.style.top = "";
      stickyEl.style.background = "";
    }

    // Set body to revealed state so navbar/page behave normally
    document.body.classList.remove("lenis-scroll-mode");
    document.body.classList.add("lenis-revealed");

    this.heroState = 0;
    this.isAnimating = false;
    this.isHeroLocked = false;
    console.log("[Force Exit] Hero force-exited via curtain navigation");
  };

  private _onScrollBack = (): void => {
    if (this.isHeroLocked || this.isLenisScrollMode || this._forceExited)
      return;
    if (window.scrollY <= 0) {
      // Re-enter Lenis scroll mode at the end (frame 240)
      this.heroState = 4;
      this.enterLenisScrollMode();
      console.log("[State Machine] Re-entered Lenis scroll mode at state 4");
    }
  };

  constructor(opts: PropheusExperienceOptions) {
    this.frameCount = opts.frameCount ?? 241;
    this.heroEl = opts.heroEl;
    this.canvas = opts.canvas;
    this.ctx = this.canvas.getContext("2d")!;
    this.ambientCanvas = opts.ambientCanvas;
    this.ambientCtx = this.ambientCanvas.getContext("2d")!;
    this.loadingBar = opts.loadingBar;
    this.framePathTemplate = opts.framePathTemplate ?? "/assets/frames/frames_";
    this.frameExtension = opts.frameExtension ?? ".webp";
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
    // Clean stale body classes from a previous session (e.g. navigating back from another page)
    document.body.classList.remove("lenis-scroll-mode", "lenis-revealed");

    this.setCanvasSize();
    window.addEventListener("resize", this._boundResize);

    // Force-exit handler (invoked by PageCurtain during curtain navigation)
    window.addEventListener("propheus:force-exit", this._onForceExit);

    // Pin scroll and lock
    window.scrollTo(0, 0);
    this.engageLock();

    // Register hero elements with animation controller
    this.registerHeroElements();

    // Snap all elements to their initial state (seg0 visible, everything else hidden)
    this.animController.applyInstant("state0");

    this.loadImages().then(() => {
      this.startTicker();
      this.render(0);
      this.lastRenderedFrame = 0;

      // Defensive re-render: layout settling or browser compositing may clear
      // the canvas after the initial render. Force the ticker to repaint.
      requestAnimationFrame(() => {
        this.lastRenderedFrame = -1;
      });
    });
  }

  /* ========================================
       REGISTER HERO ELEMENTS + ASSIGN ANIMATIONS
       5-state layout:
       seg1-headline + navbar (states 0-1), signal-pointers (sp-*).
       State 3 is the last auto-scroll state. State 4 is Lenis.
       ======================================== */
  private registerHeroElements(): void {
    /* Helper: batch-register dot/line/panel/content quartet */
    const registerPointer = (
      prefix: string,
      showState: number,
      hideState: number,
      prevState: number,
      baseDelay = 0,
      lineDir: "vertical" | "horizontal" = "vertical",
    ) => {
      const parts = ["dot", "line", "panel", "content"] as const;

      // Determine slide direction based on pointer type
      // The 'hide' state defines where the component sleeps.
      // When 'show' triggers, it animates to distance: 0 (neutral).
      // Example: pointer--down (Weather) -> line goes DOWN -> component is BELOW -> to meet line, it must slide UP -> so its sleep state is shifted DOWN.
      const pointerEl = this.heroEl.querySelector(
        `.${prefix}`,
      ) as HTMLElement | null;
      let panelSlideHideType: AnimationPreset = "slideDown"; // default sleeps down
      let contentSlideHideType: AnimationPreset = "slideDown";

      if (pointerEl) {
        if (pointerEl.classList.contains("signal-pointer--up")) {
          // Line goes UP -> component is ABOVE -> slides DOWN to meet line -> sleep state is shifted UP
          panelSlideHideType = "slideUp";
          contentSlideHideType = "slideUp";
        } else if (pointerEl.classList.contains("signal-pointer--left")) {
          // Line goes LEFT -> component is LEFT -> slides RIGHT to meet line -> sleep state is shifted LEFT
          panelSlideHideType = "slideLeft";
          contentSlideHideType = "slideLeft";
        } else if (pointerEl.classList.contains("signal-pointer--right")) {
          // Line goes RIGHT -> component is RIGHT -> slides LEFT to meet line -> sleep state is shifted RIGHT
          panelSlideHideType = "slideRight";
          contentSlideHideType = "slideRight";
        } else {
          // Default / pointer--down -> component is BELOW -> slides UP to meet line -> sleep state is shifted DOWN
          panelSlideHideType = "slideDown";
          contentSlideHideType = "slideDown";
        }
      }

      // Line duration = 0.85s, starts at baseDelay + 0.52
      // Line begins at 0.52 and finishes at ~1.37. Start the panel at 0.9 (halfway through line drawing) to feel fluid.
      const panelDelay = baseDelay + 0.9;
      const contentDelay = baseDelay + 1.05;

      const configs: Record<
        string,
        { type: string; show: AnimationConfig[]; hide: AnimationConfig[] }
      > = {
        dot: {
          type: "dot",
          show: [
            {
              type: "fadeIn",
              opacity: 1,
              duration: 0.45,
              delay: baseDelay,
              easing: "power3.out",
            },
            {
              type: "glowPulse",
              scale: 1.4,
              duration: 0.5,
              delay: baseDelay,
              easing: "power3.out",
            },
            {
              type: "scaleUp",
              scale: 1,
              duration: 0.55,
              delay: baseDelay + 0.1,
              easing: "elastic.out(1,0.5)",
            },
          ],
          hide: [
            {
              type: "fadeOut",
              opacity: 0,
              duration: 0.55,
              easing: "power3.out",
            },
            {
              type: "scaleDown",
              scale: 0.8,
              duration: 0.55,
              easing: "power3.out",
            },
          ],
        },
        line: {
          type: "line",
          show: [
            {
              type: lineDir === "horizontal" ? "scaleXDraw" : "scaleYDraw",
              duration: 0.85,
              delay: baseDelay + 0.52,
              easing: "power3.out",
            },
          ],
          hide: [
            {
              type:
                lineDir === "horizontal" ? "scaleXCollapse" : "scaleYCollapse",
              duration: 0.55,
              easing: "power3.out",
            },
          ],
        },
        panel: {
          type: "panel",
          show: [
            {
              type: "fadeIn",
              opacity: 1,
              duration: 0.9,
              delay: panelDelay,
              easing: "power3.out",
            },
            {
              type: panelSlideHideType,
              distance: 0,
              duration: 0.9,
              delay: panelDelay,
              easing: "power3.out",
            },
            {
              type: "scaleUp",
              scale: 1,
              duration: 0.9,
              delay: panelDelay,
              easing: "power3.out",
            },
          ],
          hide: [
            {
              type: "fadeOut",
              opacity: 0,
              duration: 0.55,
              easing: "power3.out",
            },
            {
              type: panelSlideHideType,
              distance: 20,
              duration: 0.55,
              easing: "power3.out",
            },
            {
              type: "scaleDown",
              scale: 0.97,
              duration: 0.55,
              easing: "power3.out",
            },
          ],
        },
        content: {
          type: "content",
          show: [
            {
              type: "fadeIn",
              opacity: 1,
              duration: 0.75,
              delay: contentDelay,
              easing: "power3.out",
            },
            {
              type: contentSlideHideType,
              distance: 0,
              duration: 0.75,
              delay: contentDelay,
              easing: "power3.out",
            },
          ],
          hide: [
            {
              type: "fadeOut",
              opacity: 0,
              duration: 0.55,
              easing: "power3.out",
            },
            {
              type: contentSlideHideType,
              distance: 15,
              duration: 0.55,
              easing: "power3.out",
            },
          ],
        },
      };

      for (const part of parts) {
        const el = this.heroEl.querySelector(
          `.${prefix}-${part}`,
        ) as HTMLElement;
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
        for (let s = hideState; s <= 4; s++) anims[`state${s}`] = c.hide;
        this.animController.assignAnimations(id, anims);
      }
    };

    // ===== HEADLINE — "The world is your playground" =====
    // State 0: already visible (instant)
    // State 1: stays visible (components come in, canvas stays at 0)
    // State 2+: fades out
    const seg1Headline = this.heroEl.querySelector(
      ".seg1-headline",
    ) as HTMLElement;
    if (seg1Headline) {
      this.animController.registerElement("seg1-headline", seg1Headline);
      this.animController.assignAnimations("seg1-headline", {
        state0: [{ type: "fadeIn", opacity: 1, duration: 0 }],
        state1: [
          {
            type: "fadeIn",
            opacity: 1,
            duration: 0.8,
            delay: 1.0,
            easing: "power2.out",
          },
        ],
        state2: [
          { type: "fadeOut", opacity: 0, duration: 0.5, easing: "power2.in" },
          { type: "slideUp", distance: 20, duration: 0.5, easing: "power2.in" },
        ],
        state3: [{ type: "fadeOut", opacity: 0, duration: 0.3 }],
        state4: [{ type: "fadeOut", opacity: 0, duration: 0.3 }],
      });
    }

    // ===== STATE 1 — Physical World: Places + Weather =====
    // Signal pointers show at state 1, hide at state 2
    // baseDelay = seconds after state starts before dot/line/panel/content animate in.
    // dot at baseDelay, line at +0.52, panel at +1.0, content at +1.25.
    registerPointer("sp-topo", 1, 2, 0, 0); // was 1.3
    registerPointer("sp-weather", 1, 2, 0, 0); // was 2.6
    registerPointer("sp-vegetation", 1, 2, 0, 0); // was 2.6

    // ===== STATE 2 — Intelligence: Market Intelligence (left, horizontal pointer) + Urbanization (top-right, no pointer) =====
    registerPointer("sp-marketintel", 2, 3, 1, 0.3, "horizontal");

    // Urbanization widget — registered directly, no signal pointer structure
    const urbContainer = this.heroEl.querySelector(
      ".urb-widget-container",
    ) as HTMLElement;
    if (urbContainer) {
      this.animController.registerElement("urb-widget", urbContainer);
      this.animController.assignAnimations("urb-widget", {
        state0: [{ type: "fadeOut", opacity: 0, duration: 0 }],
        state1: [
          { type: "fadeOut", opacity: 0, duration: 0.3, easing: "power2.in" },
        ],
        state2: [
          {
            type: "fadeIn",
            opacity: 1,
            duration: 0.9,
            delay: 0.5,
            easing: "power2.out",
          },
        ],
        state3: [{ type: "fadeOut", opacity: 0, duration: 0.4 }],
        state4: [{ type: "fadeOut", opacity: 0, duration: 0.4 }],
      });
    }

    // ===== STATE 3 — Footfall + Parking Analytics (vertical, --up pointer) =====
    registerPointer("sp-footfall", 3, 4, 2, 0.3);
    registerPointer("sp-parking", 3, 4, 2, 0.3);

    // ===== CLOUDS — drift layer visible at states 0 & 1 =====
    const heroClouds = this.heroEl.querySelector(".hero-clouds") as HTMLElement;
    if (heroClouds) {
      this.animController.registerElement("hero-clouds", heroClouds);
      this.animController.assignAnimations("hero-clouds", {
        state0: [{ type: "fadeIn", opacity: 1, duration: 0 }],
        state1: [
          {
            type: "fadeIn",
            opacity: 1,
            duration: 0.8,
            delay: 1.0,
            easing: "power2.out",
          },
        ],
        state2: [
          { type: "fadeOut", opacity: 0, duration: 0.55, easing: "power3.out" },
        ],
        state3: [{ type: "fadeOut", opacity: 0, duration: 0.3 }],
        state4: [{ type: "fadeOut", opacity: 0, duration: 0.3 }],
      });
    }

    // ===== NAVBAR — no longer registered here =====
    // The Navbar component now self-manages visibility via IntersectionObserver
    // and the body.lenis-scroll-mode CSS rule hides it during state 4.
  }

  /* ========================================
       SCROLL LOCK — triple-layer
       ======================================== */
  private engageLock(): void {
    this.isHeroLocked = true;
    this.accumulatedDelta = 0;

    window.scrollTo(0, 0);

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    window.addEventListener("scroll", this._onScrollPin, { passive: false });

    this.stopLenis();

    // Block wheel/touch from scrolling the page (but don't use them for state transitions)
    window.addEventListener("wheel", this._onWheelBlock, { passive: false });
    window.addEventListener("touchstart", this._onTouchStart, {
      passive: false,
    });
    window.addEventListener("touchmove", this._onTouchMove, { passive: false });
    window.addEventListener("touchend", this._onTouchEnd, { passive: false });
    // Arrow keys still drive states
    window.addEventListener("keydown", this._onKeyDown);
    // ActivateAgent component events
    window.addEventListener("propheus:launch", this._onAgentLaunch);
    window.addEventListener("propheus:advance", this._onAgentAdvance);
    window.addEventListener("propheus:reverse", this._onAgentReverse);
    window.addEventListener("propheus:exit-agent", this._onAgentExit);

    window.removeEventListener("scroll", this._onScrollBack);
  }

  private disengageLock(): void {
    this.isHeroLocked = false;
    this.accumulatedDelta = 0;

    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");

    window.removeEventListener("scroll", this._onScrollPin, {
      passive: false,
    } as any);

    const lenis = getLenisInstance();
    if (lenis) lenis.start();

    window.removeEventListener("wheel", this._onWheelBlock, {
      passive: false,
    } as any);
    window.removeEventListener("touchstart", this._onTouchStart, {
      passive: false,
    } as any);
    window.removeEventListener("touchmove", this._onTouchMove, {
      passive: false,
    } as any);
    window.removeEventListener("touchend", this._onTouchEnd, {
      passive: false,
    } as any);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("propheus:launch", this._onAgentLaunch);
    window.removeEventListener("propheus:advance", this._onAgentAdvance);
    window.removeEventListener("propheus:reverse", this._onAgentReverse);
    window.removeEventListener("propheus:exit-agent", this._onAgentExit);

    window.addEventListener("scroll", this._onScrollBack, { passive: true });

    console.log("[Lock] Disengaged — native scroll enabled");
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
       SCROLL WINDOW — 2-tier interrupt system.
       1) Grace window (600ms): ignore all scrolls.
       2) Past window + gap detected (200ms pause in wheel events):
          intentional re-scroll → fade out components, skip to end.
       Continuous events (gap < 200ms) past the window are
       treated as trackpad/mouse momentum and ignored.
       Touch and keyboard pass gap=Infinity (always new intent).
       ======================================== */
  private handleScrollDuringAnimation(wheelGap = Infinity): void {
    this.accumulatedDelta = 0;
    const elapsed = Date.now() - this.scrollWindowStart;

    // Within grace window — completely ignore
    if (elapsed < this.SCROLL_WINDOW_MS) return;

    // Past grace window — require a gap to detect intentional re-scroll
    if (wheelGap < this.WHEEL_GAP_MS) return;

    // Never skip reverse transitions — trackpad scroll-up is choppy
    // and creates false gaps. Let the animation play out naturally.
    if (this.isReverseTransition) return;

    // Intentional new scroll — skip to end
    this.skipToEnd();
  }

  private skipToEnd(): void {
    // Kill & snap component animations to destination
    if (this.activeUITimeline) {
      this.activeUITimeline.kill();
      this.activeUITimeline = null;
    }
    this.animController.killAllTweens();
    this.animController.applyInstant(`state${this.pendingState}`);

    // Kill frame tween and snap canvas immediately
    if (this.activeFrameTween) {
      this.activeFrameTween.kill();
      this.activeFrameTween = null;
    }
    const frames = [0, 0, 120, 240, 240];
    this.targetFrame = frames[this.pendingState];
    this.currentFrame = frames[this.pendingState];

    // Finalize synchronously — heroState is now up to date
    this.finalizeTransition(this.pendingState);
    console.log(`[State] Skipped to state ${this.pendingState}`);
  }

  /* ========================================
       STATE ADVANCE / REVERSE
       ======================================== */
  private advanceState(): void {
    const from = this.heroState;
    const to = from + 1;

    // State 3 is the last auto-scroll state; ActivateAgent "Exit Agent" enters Lenis
    if (to > 3) {
      if (this.heroState === 3) {
        window.dispatchEvent(new CustomEvent("propheus:force-exit"));
        window.dispatchEvent(new CustomEvent("propheus:exit-agent"));
      }
      return;
    }

    this.isAnimating = true;
    console.log(`[State] ${from} → ${to}`);
    this.runTransition(from, to);
  }

  private reverseState(): void {
    const from = this.heroState;
    const to = from - 1;

    if (to < 0) return;

    this.isAnimating = true;
    console.log(`[State] ${from} → ${to}`);
    this.runTransition(from, to);
  }

  /* ========================================
       FINALIZE — called when a transition is fully done.
       Does NOT kill timelines — killing is only done
       by runTransition (new transition) or skipToEnd.
       ======================================== */
  private finalizeTransition(to: number): void {
    this.heroState = to;
    this.pendingState = to;
    this.isAnimating = false;
    this.accumulatedDelta = 0;
    this.activeUITimeline = null;
    this.activeFrameTween = null;
    this.uiDone = false;
    this.frameDone = false;
    this.isReverseTransition = false;
    this.scrollWindowStart = 0;
    this.transitionEndTime = Date.now();
    console.log(`[State] Arrived at ${to}`);

    // Notify ActivateAgent and any other listeners of the new state
    window.dispatchEvent(
      new CustomEvent("propheus:statechange", { detail: { state: to } }),
    );

    // State 3: do NOT auto-enter Lenis. Wait for ActivateAgent "Exit Agent" button.
  }

  /* ========================================
       STATE TRANSITIONS
       Frames: 0→0→120→240→240
       States 0–3: auto-scroll with GSAP.
       State 4: enters Lenis scroll mode.

       Component animations and canvas frame sweep are
       separated so scroll window can skip UI independently.
       ======================================== */
  private runTransition(from: number, to: number): void {
    // Kill any existing animations
    if (this.activeUITimeline) {
      this.activeUITimeline.kill();
      this.activeUITimeline = null;
    }
    if (this.activeFrameTween) {
      this.activeFrameTween.kill();
      this.activeFrameTween = null;
    }

    // Safety net: kill ALL orphaned GSAP tweens on registered elements.
    // Prevents stale delayed tweens from a previous transition from
    // re-showing components that belong to a different state.
    this.animController.killAllTweens();

    this.pendingState = to;
    this.uiDone = false;
    this.frameDone = false;
    this.isReverseTransition = to < from;
    this.scrollWindowStart = Date.now();

    // Dispatch state-specific UI events for self-managing React components.
    if (to === 1) window.dispatchEvent(new CustomEvent("propheus:state1"));
    if (from === 1 && to !== 1)
      window.dispatchEvent(new CustomEvent("propheus:state1:exit"));
    if (to === 2) window.dispatchEvent(new CustomEvent("propheus:state2"));
    if (from === 2 && to !== 2)
      window.dispatchEvent(new CustomEvent("propheus:state2:exit"));
    if (to === 3) window.dispatchEvent(new CustomEvent("propheus:state3"));
    if (from === 3 && to !== 3)
      window.dispatchEvent(new CustomEvent("propheus:state3:exit"));

    // --- UI animations (component fade/slide/scale) ---
    const uiTl = gsap.timeline();
    const allIds = this.animController.getAllRegisteredIds();
    const stateKey = `state${to}`;

    allIds.forEach((id) => {
      const elTl = this.animController.buildElementTimeline(id, stateKey);
      if (elTl) uiTl.add(elTl, 0);
    });

    this.activeUITimeline = uiTl;

    // --- Canvas frame animation ---
    // Frame ranges: state0=0, state1=0, state2=120, state3=240, state4=240
    const frames = [0, 0, 120, 240, 240];
    const startFrame = frames[from];
    const endFrame = frames[to];
    const direction = to > from ? 1 : -1;

    if (startFrame !== endFrame) {
      // Has canvas motion — finalize when BOTH UI and canvas complete.
      // UI has long-delayed animations (baseDelay up to 3.2s+) that
      // must finish. Canvas is typically ~2s. The last to complete
      // calls finalizeTransition.
      uiTl.eventCallback("onComplete", () => {
        this.uiDone = true;
        this.activeUITimeline = null;
        if (this.frameDone) this.finalizeTransition(to);
      });

      const frameDuration = Math.abs(endFrame - startFrame) * (1 / 60);
      const uiLeadTime = direction > 0 ? 0.3 : 0;
      this.frameProxy.value = startFrame;
      this.activeFrameTween = gsap.to(this.frameProxy, {
        value: endFrame,
        duration: Math.max(frameDuration, 0.8),
        delay: uiLeadTime,
        ease: "power2.inOut",
        onUpdate: () => {
          this.targetFrame = this.frameProxy.value;
        },
        onComplete: () => {
          this.frameDone = true;
          this.activeFrameTween = null;
          if (this.uiDone) this.finalizeTransition(to);
        },
      });
    } else {
      // No canvas motion — finalize when UI completes (or on snap)
      uiTl.eventCallback("onComplete", () => {
        this.finalizeTransition(to);
      });
    }
  }

  /* ========================================
       LENIS SCROLL MODE — State 5
       Frames 240→240 mapped to scroll position.
       Smooth exit: hero scrolls out naturally at frame 240.
       ======================================== */
  private _onLenisWheel = (e: WheelEvent): void => {
    if (!this.isLenisScrollMode || this.isAnimating) return;

    // At top of Lenis zone and scrolling up → exit to auto-scroll reverse
    if (window.scrollY > 5) {
      this.accumulatedDelta = 0;
      return;
    }

    if (e.deltaY < 0) {
      this.accumulatedDelta += e.deltaY;
      if (this.accumulatedDelta <= -this.SCROLL_THRESHOLD) {
        this.accumulatedDelta = 0;
        this.exitLenisScrollModeReverse();
      }
    } else {
      this.accumulatedDelta = 0;
    }
  };

  private _lenisTouchStartY = 0;
  
  private _onLenisTouchStart = (e: TouchEvent): void => {
    if (!this.isLenisScrollMode || this.isAnimating) return;
    this._lenisTouchStartY = e.touches[0].clientY;
  };

  private _onLenisTouchEnd = (e: TouchEvent): void => {
    if (!this.isLenisScrollMode || this.isAnimating) return;
    
    // Only intercept if we are at the very top of the page
    if (window.scrollY > 5) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - this._lenisTouchStartY; // positive means swiped down (intent to scroll up)

    if (deltaY > this.TOUCH_THRESHOLD) {
      this.exitLenisScrollModeReverse();
    }
  };

  private _onLenisScroll = (): void => {
    if (!this.isLenisScrollMode) return;

    const scrollY = window.scrollY;
    const rawProgress = Math.min(
      1,
      Math.max(
        0,
        (scrollY - this.lenisScrollStart) / this.LENIS_SCROLL_DISTANCE,
      ),
    );
    // Use rawProgress directly for frame mapping — linear relationship
    // between scroll position and canvas frame avoids perceived lag.
    const frame =
      this.LENIS_FRAME_START +
      rawProgress * (this.LENIS_FRAME_END - this.LENIS_FRAME_START);
    this.targetFrame = frame;

    // Drive the hero-to-page visual transition
    this.updateLenisVisuals(rawProgress);

    // Let ActivateAgent fade its "Agent Activated" message
    window.dispatchEvent(
      new CustomEvent("propheus:lenis-progress", {
        detail: { progress: rawProgress },
      }),
    );

    // Past the Lenis zone — switch body class so navbar CSS adapts (no opacity change here;
    // the navbar becomes visible naturally via Navbar.tsx isScrolled detection once the user
    // scrolls the hero out of view).
    if (rawProgress >= 1 && !this.lenisExitDone) {
      this.lenisExitDone = true;
      document.body.classList.remove("lenis-scroll-mode");
      document.body.classList.add("lenis-revealed");
      console.log("[Lenis] Past final frame — lenis-revealed active");
    }

    // Scrolled back into the Lenis zone
    if (rawProgress < 1 && this.lenisExitDone) {
      this.lenisExitDone = false;
      document.body.classList.add("lenis-scroll-mode");
      document.body.classList.remove("lenis-revealed");
    }

    // Scrolled back to top of Lenis zone — exit back to auto-scroll state 3
    if (scrollY <= 0 && this.lenisExitDone === false && rawProgress === 0) {
      this.exitLenisScrollModeReverse();
    }
  };

  private enterLenisScrollMode(): void {
    this.isLenisScrollMode = true;
    this.lenisExitDone = false;
    this.isHeroLocked = false;

    // Remove auto-scroll event listeners
    window.removeEventListener("wheel", this._onWheelBlock, {
      passive: false,
    } as any);
    window.removeEventListener("touchstart", this._onTouchStart, {
      passive: false,
    } as any);
    window.removeEventListener("touchmove", this._onTouchMove, {
      passive: false,
    } as any);
    window.removeEventListener("touchend", this._onTouchEnd, {
      passive: false,
    } as any);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("propheus:launch", this._onAgentLaunch);
    window.removeEventListener("propheus:advance", this._onAgentAdvance);
    window.removeEventListener("propheus:reverse", this._onAgentReverse);
    window.removeEventListener("propheus:exit-agent", this._onAgentExit);
    window.removeEventListener("scroll", this._onScrollPin, {
      passive: false,
    } as any);

    // Enable page scroll but pin the hero
    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");

    // Set the hero section height to create scroll room
    // Must suppress the hero-sticky white background BEFORE changing layout
    // to prevent the 1-frame white flash that occurs when the height change
    // exposes the white background before sticky positioning takes effect.
    const stickyEl = this.heroEl.querySelector(".hero-sticky") as HTMLElement;
    if (stickyEl) stickyEl.style.background = "transparent";

    // Prepare for height change — prevent browser reflow jank
    this.heroEl.style.willChange = "height";

    this.heroEl.style.height = `${this.displayHeight + this.LENIS_SCROLL_DISTANCE + this.LENIS_POST_BUFFER}px`;
    // Recompute all ScrollTrigger positions after the layout shift so
    // downstream pinned sections (WorkflowStoryWidget) don't overlap the hero.
    // Double-rAF ensures layout has fully settled before recalculation.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        // Remove will-change after layout settles to free GPU memory
        this.heroEl.style.willChange = "";
      });
    });
    // Make canvas + overlays sticky
    if (stickyEl) {
      stickyEl.style.position = "sticky";
      stickyEl.style.top = "0";
    }

    // Start Lenis
    const lenis = getLenisInstance();
    if (lenis) lenis.start();

    // Mark body so navbar + other elements can adapt to dark background
    document.body.classList.add("lenis-scroll-mode");
    document.body.classList.remove("lenis-revealed");

    // Pin at top so scroll starts from 0
    window.scrollTo(0, 0);
    this.lenisScrollStart = 0;

    // Immediately hide ambient canvas — prevents blurred gradient halo during canvas shrink
    this.ambientCanvas.style.opacity = "0";

    // Cache DOM references for Lenis visuals (avoids querySelectorAll every scroll tick)
    if (!this._lenisDomCached) {
      this._lenisContentEl = this.heroEl.querySelector(
        ".lenis-content",
      ) as HTMLElement;
      this._lenisTextBlock = this.heroEl.querySelector(
        ".lenis-text-block",
      ) as HTMLElement;
      this._lenisOuterCols = Array.from(
        this.heroEl.querySelectorAll(".parallax-col-outer"),
      ) as HTMLElement[];
      this._lenisInnerCols = Array.from(
        this.heroEl.querySelectorAll(".parallax-col-inner"),
      ) as HTMLElement[];
      this._lenisDomCached = true;
    }

    // Snap to frame 240
    this.targetFrame = this.LENIS_FRAME_START;
    this.currentFrame = this.LENIS_FRAME_START;

    // Reset visuals to fullscreen state
    this.updateLenisVisuals(0);

    window.addEventListener("scroll", this._onLenisScroll, { passive: true });
    window.addEventListener("wheel", this._onLenisWheel, { passive: false });
    window.addEventListener("touchstart", this._onLenisTouchStart, { passive: true });
    window.addEventListener("touchend", this._onLenisTouchEnd, { passive: true });
    window.removeEventListener("scroll", this._onScrollBack);

    console.log("[Lenis] Scroll mode entered — frames 240→240");
  }

  private exitLenisScrollModeReverse(): void {
    this.isLenisScrollMode = false;
    this.lenisExitDone = false;
    window.removeEventListener("scroll", this._onLenisScroll);
    window.removeEventListener("wheel", this._onLenisWheel);
    window.removeEventListener("touchstart", this._onLenisTouchStart);
    window.removeEventListener("touchend", this._onLenisTouchEnd);

    // Remove dark-mode class from body
    document.body.classList.remove("lenis-scroll-mode");
    document.body.classList.remove("lenis-revealed");

    // Reset shrink visuals back to fullscreen
    this.resetLenisVisuals();

    // Reset hero height
    this.heroEl.style.height = `${this.displayHeight}px`;
    // Recompute ScrollTrigger positions now that hero height is back to 100vh
    requestAnimationFrame(() => ScrollTrigger.refresh());
    const stickyEl = this.heroEl.querySelector(".hero-sticky") as HTMLElement;
    if (stickyEl) {
      stickyEl.style.position = "relative";
      stickyEl.style.top = "";
      stickyEl.style.background = ""; // restore white background
    }

    // Back to state 3 (frame 240) — ActivateAgent re-appears
    this.targetFrame = 240;
    this.currentFrame = 240;
    this.engageLock();

    // Show state 3 components and notify ActivateAgent
    this.animController.applyQuick("state3", 0.4);
    this.finalizeTransition(3);

    // Notify ActivateAgent to reappear at step 3
    window.dispatchEvent(new CustomEvent("propheus:agent-reenter"));

    console.log("[Lenis] Reverse exit — back to state 3 with ActivateAgent");
  }

  /* ========================================
       LENIS VISUALS — hero-to-page transition.
       Canvas crops via clip-path (no distortion).
       4-column parallax images reveal behind it.
       ======================================== */
  private updateLenisVisuals(progress: number): void {
    const vw = this.displayWidth;
    const vh = this.displayHeight;

    // --- Canvas crop: clip-path inset shrinks visible area ---
    // At progress 0: full screen. At progress 1: centred 1:1 card.
    const targetSize = Math.min(vw * 0.28, 450);
    const centerY = vh * 0.5; // 50% keeps card centred with room below for text

    const finalTop = centerY - targetSize / 2;
    const finalBottom = vh - (centerY + targetSize / 2);
    const finalLeft = (vw - targetSize) / 2;
    const finalRight = finalLeft;
    const radius = progress * 20;

    this.canvas.style.clipPath = `inset(${progress * finalTop}px ${progress * finalRight}px ${progress * finalBottom}px ${progress * finalLeft}px round ${radius}px)`;

    // --- Content fades in after 20% progress (uses cached ref) ---
    if (this._lenisContentEl) {
      const cp = Math.max(0, (progress - 0.2) / 0.6);
      this._lenisContentEl.style.opacity = String(Math.min(1, cp));
    }

    // --- 4-column parallax (uses cached refs — no DOM queries per tick) ---
    const outerY = `translateY(${-progress * 400}px) translateZ(0)`;
    const innerY = `translateY(${-progress * 220}px) translateZ(0)`;
    for (let i = 0; i < this._lenisOuterCols.length; i++) {
      this._lenisOuterCols[i].style.transform = outerY;
    }
    for (let i = 0; i < this._lenisInnerCols.length; i++) {
      this._lenisInnerCols[i].style.transform = innerY;
    }

    // --- Text block slides up; words handle their own opacity via LenisTextReveal ---
    if (this._lenisTextBlock) {
      if (progress >= 0.58) {
        const tp = Math.max(0, Math.min(1, (progress - 0.58) / 0.14));
        this._lenisTextBlock.style.opacity = "1";
        this._lenisTextBlock.style.transform = `translateX(-50%) translateY(${(1 - tp) * 34}px)`;
      } else {
        this._lenisTextBlock.style.opacity = "0";
        this._lenisTextBlock.style.transform = `translateX(-50%) translateY(34px)`;
      }
    }
  }

  private resetLenisVisuals(): void {
    this.canvas.style.clipPath = "";
    this.ambientCanvas.style.opacity = "";

    const bgEl = this.heroEl.querySelector(".lenis-bg") as HTMLElement;
    if (bgEl) bgEl.style.opacity = "0";

    if (this._lenisContentEl) this._lenisContentEl.style.opacity = "0";

    for (let i = 0; i < this._lenisOuterCols.length; i++) {
      this._lenisOuterCols[i].style.transform = "";
    }
    for (let i = 0; i < this._lenisInnerCols.length; i++) {
      this._lenisInnerCols[i].style.transform = "";
    }

    if (this._lenisTextBlock) {
      this._lenisTextBlock.style.opacity = "0";
      this._lenisTextBlock.style.transform = "translateX(-50%)";
    }
  }

  /* ========================================
       TICKER — single lerp loop
       ======================================== */
  private startTicker(): void {
    this.tickerCallback = () => {
      this.currentFrame += (this.targetFrame - this.currentFrame) * 0.15;

      const frameIndex = Math.min(
        this.frameCount - 1,
        Math.max(0, Math.floor(this.currentFrame)),
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
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.ambientCanvas.width = w * dpr;
    this.ambientCanvas.height = h * dpr;
    this.ambientCanvas.style.width = "110%";
    this.ambientCanvas.style.height = "110%";
    this.ambientCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.displayWidth = w;
    this.displayHeight = h;
  }

  /* ========================================
       IMAGE PATH
       ======================================== */
  private getImagePath(index: number): string {
    const padded = String(index + this.frameStartIndex).padStart(
      this.framePadding,
      "0",
    );
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
            console.info("[Propheus] Frames not found — using placeholders.");
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
      this.loadingBar.style.width = progress * 100 + "%";
    }
    // Notify PagePreloader with integer 0-100
    window.dispatchEvent(
      new CustomEvent("propheus:load-progress", {
        detail: { value: Math.round(progress * 100) },
      }),
    );
  }

  private hideLoadingBar(): void {
    if (this.loadingBar) {
      this.loadingBar.classList.add("hidden");
      setTimeout(() => {
        if (this.loadingBar) this.loadingBar.style.display = "none";
      }, 500);
    }
    window.dispatchEvent(new CustomEvent("propheus:load-complete"));
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
  private drawCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    cw: number,
    ch: number,
  ): void {
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

    this.ctx.fillStyle = "rgba(230, 241, 241, 0.15)";
    this.ctx.font = "13px Inter, sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `FRAME ${String(frameIndex + 1).padStart(4, "0")} / ${this.frameCount}`,
      w / 2,
      h / 2,
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
    window.removeEventListener("resize", this._boundResize);
    window.removeEventListener("propheus:force-exit", this._onForceExit);
    window.removeEventListener("wheel", this._onWheelBlock, {
      passive: false,
    } as any);
    window.removeEventListener("touchstart", this._onTouchStart, {
      passive: false,
    } as any);
    window.removeEventListener("touchmove", this._onTouchMove, {
      passive: false,
    } as any);
    window.removeEventListener("touchend", this._onTouchEnd, {
      passive: false,
    } as any);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("propheus:launch", this._onAgentLaunch);
    window.removeEventListener("propheus:advance", this._onAgentAdvance);
    window.removeEventListener("propheus:reverse", this._onAgentReverse);
    window.removeEventListener("propheus:exit-agent", this._onAgentExit);
    window.removeEventListener("scroll", this._onScrollBack);
    window.removeEventListener("scroll", this._onScrollPin, {
      passive: false,
    } as any);
    window.removeEventListener("scroll", this._onLenisScroll);
    window.removeEventListener("wheel", this._onLenisWheel);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);

    if (this.tickerCallback) {
      gsap.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }

    if (this.activeUITimeline) this.activeUITimeline.kill();
    if (this.activeFrameTween) this.activeFrameTween.kill();
    this.animController.destroy();
    this.resetLenisVisuals();

    // Reset hero section styles
    this.heroEl.style.height = "";
    const stickyEl = this.heroEl.querySelector(".hero-sticky") as HTMLElement;
    if (stickyEl) {
      stickyEl.style.position = "";
      stickyEl.style.top = "";
    }

    document.documentElement.style.removeProperty("overflow");
    document.body.style.removeProperty("overflow");
    document.body.classList.remove("lenis-scroll-mode", "lenis-revealed");
    const lenis = getLenisInstance();
    if (lenis) lenis.start();

    this.images.length = 0;
  }
}
