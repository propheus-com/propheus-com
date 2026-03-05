import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

/* ============================================
   SmoothScroll — Lenis + GSAP Ticker Singleton
   ============================================
   Initialize once in the root layout.
   Single RAF loop — no double calls.
   ============================================ */

let instance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;

export function initSmoothScroll(): Lenis {
    if (instance) return instance;

    instance = new Lenis({
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
    });

    // Lenis scroll events feed ScrollTrigger
    instance.on('scroll', ScrollTrigger.update);

    // Single RAF loop: GSAP ticker drives Lenis
    tickerCallback = (time: number) => {
        instance?.raf(time * 1000); // GSAP time is seconds, Lenis expects ms
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return instance;
}

export function getLenisInstance(): Lenis | null {
    return instance;
}

export function destroySmoothScroll(): void {
    if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
        tickerCallback = null;
    }
    if (instance) {
        instance.destroy();
        instance = null;
    }
}
