'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/analytics';

const DOWNLOAD_EXTS = new Set(['pdf', 'zip', 'docx', 'xlsx', 'csv', 'pptx', 'doc', 'xls']);

const TRACKED_SECTIONS: Record<string, string> = {
    'digital-atlas': 'digital_atlas',
    'industry-section': 'industry',
    'cta-footer': 'newsletter_cta',
    'pricing': 'pricing',
    'features': 'features',
    'testimonials': 'testimonials',
    'contact': 'contact',
};

export default function AnalyticsProvider() {
    const pathname = usePathname();

    // ── Global one-time setup ────────────────────────────────────────────────
    useEffect(() => {
        // JS error tracking
        const onError = (event: ErrorEvent) => {
            analytics.track('js_error', {
                message: event.message,
                file: event.filename,
                line: event.lineno,
                page: window.location.pathname,
            });
        };
        window.addEventListener('error', onError);

        // Performance: slow page load + CLS
        const trackPerf = () => {
            const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
            if (!entries[0]) return;
            const loadTime = Math.round(entries[0].loadEventEnd - entries[0].startTime);
            if (loadTime > 3000) {
                analytics.track('slow_page_load', { load_time_ms: loadTime, page: window.location.pathname });
            }
        };
        if (document.readyState === 'complete') trackPerf();
        else window.addEventListener('load', trackPerf, { once: true });

        let clsObs: PerformanceObserver | null = null;
        try {
            let clsValue = 0;
            clsObs = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const e = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
                    if (!e.hadRecentInput) {
                        clsValue += e.value ?? 0;
                        if (clsValue > 0.25) {
                            analytics.track('large_layout_shift', {
                                cls: clsValue.toFixed(3),
                                page: window.location.pathname,
                            });
                        }
                    }
                }
            });
            clsObs.observe({ type: 'layout-shift', buffered: true });
        } catch { /* PerformanceObserver not supported */ }

        // Outbound link + file download tracking
        const onDocClick = (e: MouseEvent) => {
            const anchor = (e.target as Element).closest('a') as HTMLAnchorElement | null;
            if (!anchor?.href) return;

            const ext = anchor.href.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
            if (DOWNLOAD_EXTS.has(ext)) {
                analytics.track('download_started', {
                    file_name: anchor.href.split('/').pop() ?? anchor.href,
                    file_type: ext,
                    page: window.location.pathname,
                });
                return;
            }

            try {
                const url = new URL(anchor.href);
                if (url.hostname !== window.location.hostname) {
                    analytics.track('outbound_link_clicked', {
                        destination: anchor.href,
                        source_page: window.location.pathname,
                    });
                }
            } catch { /* invalid URL */ }
        };
        document.addEventListener('click', onDocClick);

        return () => {
            window.removeEventListener('error', onError);
            document.removeEventListener('click', onDocClick);
            clsObs?.disconnect();
        };
    }, []);

    // ── Per-page setup: resets on every navigation ───────────────────────────
    useEffect(() => {
        analytics.track('page_viewed', {
            page_name: document.title,
            page_path: pathname,
            page_url: window.location.href,
        });

        // Scroll depth
        const scrollHits = new Set<number>();
        const onScroll = () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            const pct = Math.round((window.scrollY / docHeight) * 100);
            for (const t of [25, 50, 75, 100]) {
                if (pct >= t && !scrollHits.has(t)) {
                    scrollHits.add(t);
                    analytics.track(`scroll_${t}`, { page: pathname });
                }
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        // Time on page
        const timers = [
            setTimeout(() => analytics.track('time_on_page_30s', { page: pathname }), 30_000),
            setTimeout(() => analytics.track('time_on_page_60s', { page: pathname }), 60_000),
            setTimeout(() => analytics.track('time_on_page_120s', { page: pathname }), 120_000),
        ];

        // Section visibility
        const trackedSections = new Set<string>();
        const sectionObs = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const id = (entry.target as HTMLElement).id;
                    if (!trackedSections.has(id)) {
                        trackedSections.add(id);
                        analytics.track('feature_viewed', {
                            section: TRACKED_SECTIONS[id] ?? id.replace(/-/g, '_'),
                            page: pathname,
                        });
                        sectionObs.unobserve(entry.target);
                    }
                }
            }
        }, { threshold: 0.2 });

        for (const id of Object.keys(TRACKED_SECTIONS)) {
            const el = document.getElementById(id);
            if (el) sectionObs.observe(el);
        }

        // Video tracking
        const cleanupVideos: Array<() => void> = [];
        document.querySelectorAll<HTMLVideoElement>('video').forEach((video) => {
            let started = false;
            const onPlay = () => {
                if (!started) {
                    started = true;
                    analytics.track('video_started', { src: video.currentSrc || video.src, page: pathname });
                }
            };
            const onPause = () => {
                if (!video.ended) analytics.track('video_paused', { src: video.currentSrc || video.src, page: pathname });
            };
            const onEnded = () => analytics.track('video_completed', { src: video.currentSrc || video.src, page: pathname });
            video.addEventListener('play', onPlay);
            video.addEventListener('pause', onPause);
            video.addEventListener('ended', onEnded);
            cleanupVideos.push(() => {
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
                video.removeEventListener('ended', onEnded);
            });
        });

        return () => {
            window.removeEventListener('scroll', onScroll);
            timers.forEach(clearTimeout);
            sectionObs.disconnect();
            cleanupVideos.forEach((fn) => fn());
        };
    }, [pathname]);

    return null;
}
