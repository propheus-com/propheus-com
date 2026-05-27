/**
 * Propheus — Standalone Umami analytics helper
 * Include AFTER the Umami script tag on any plain HTML page.
 *
 * Debug mode: set window.ANALYTICS_DEBUG = true before this script loads.
 *
 * Usage:
 *   analytics.track('event_name', { key: 'value' });
 */
(function () {
    'use strict';

    var DOWNLOAD_EXTS = ['pdf', 'zip', 'docx', 'xlsx', 'csv', 'pptx', 'doc', 'xls'];

    // ── Core helper ──────────────────────────────────────────────────────────
    window.analytics = {
        track: function (eventName, data) {
            data = data || {};
            if (window.ANALYTICS_DEBUG) {
                console.log('[Analytics]', eventName, data);
            }
            if (window.umami && typeof window.umami.track === 'function') {
                window.umami.track(eventName, data);
            }
        },
    };

    var a = window.analytics;

    // ── Page view ────────────────────────────────────────────────────────────
    function trackPageView() {
        a.track('page_viewed', {
            page_name: document.title,
            page_path: window.location.pathname,
            page_url: window.location.href,
        });
    }

    // ── Scroll depth ─────────────────────────────────────────────────────────
    function initScrollTracking() {
        var hits = {};
        var thresholds = [25, 50, 75, 100];
        window.addEventListener('scroll', function () {
            var scrolled = window.scrollY || document.documentElement.scrollTop;
            var docH = document.documentElement.scrollHeight - window.innerHeight;
            if (docH <= 0) return;
            var pct = Math.round((scrolled / docH) * 100);
            thresholds.forEach(function (t) {
                if (pct >= t && !hits[t]) {
                    hits[t] = true;
                    a.track('scroll_' + t, { page: window.location.pathname });
                }
            });
        }, { passive: true });
    }

    // ── Time on page ─────────────────────────────────────────────────────────
    function initTimeTracking() {
        [[30000, '30s'], [60000, '60s'], [120000, '120s']].forEach(function (pair) {
            setTimeout(function () {
                a.track('time_on_page_' + pair[1], { page: window.location.pathname });
            }, pair[0]);
        });
    }

    // ── Outbound links + file downloads ──────────────────────────────────────
    function initLinkTracking() {
        document.addEventListener('click', function (e) {
            var anchor = e.target && e.target.closest ? e.target.closest('a') : null;
            if (!anchor || !anchor.href) return;
            var href = anchor.href;
            var ext = href.split('?')[0].split('.').pop().toLowerCase();
            if (DOWNLOAD_EXTS.indexOf(ext) !== -1) {
                a.track('download_started', {
                    file_name: href.split('/').pop(),
                    file_type: ext,
                    page: window.location.pathname,
                });
                return;
            }
            try {
                var url = new URL(href);
                if (url.hostname !== window.location.hostname) {
                    a.track('outbound_link_clicked', {
                        destination: href,
                        source_page: window.location.pathname,
                    });
                }
            } catch (_) { /* invalid URL */ }
        });
    }

    // ── CTA tracking (data-cta, .btn, a.cta) ─────────────────────────────────
    function initCtaTracking() {
        document.addEventListener('click', function (e) {
            var el = e.target && e.target.closest ? e.target.closest('[data-cta], .btn, a.cta') : null;
            if (!el) return;
            if (el.tagName === 'BUTTON' && el.closest('form')) return;
            a.track('cta_clicked', {
                cta_text: (el.innerText || '').trim().slice(0, 100),
                cta_id: el.id || null,
                cta_href: el.href || null,
                page: window.location.pathname,
            });
        });
    }

    // ── Form tracking ─────────────────────────────────────────────────────────
    function initFormTracking() {
        document.addEventListener('focusin', function (e) {
            var input = e.target;
            if (!input || ['INPUT', 'TEXTAREA', 'SELECT'].indexOf(input.tagName) === -1) return;
            var form = input.closest ? input.closest('form') : null;
            if (!form || form._analyticsStarted) return;
            form._analyticsStarted = true;
            a.track('form_started', { form_id: form.id || 'unknown', page: window.location.pathname });
        });
        document.addEventListener('submit', function (e) {
            var form = e.target;
            if (!form) return;
            a.track('form_submitted', { form_id: form.id || 'unknown', page: window.location.pathname });
        });
    }

    // ── Section visibility ────────────────────────────────────────────────────
    function initSectionTracking() {
        if (!window.IntersectionObserver) return;
        var sections = [
            'digital-atlas', 'industry-section', 'cta-footer',
            'pricing', 'features', 'testimonials', 'contact',
        ];
        var tracked = {};
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    if (!tracked[id]) {
                        tracked[id] = true;
                        a.track('feature_viewed', {
                            section: id.replace(/-/g, '_'),
                            page: window.location.pathname,
                        });
                        obs.unobserve(entry.target);
                    }
                }
            });
        }, { threshold: 0.2 });
        sections.forEach(function (id) {
            var el = document.getElementById(id);
            if (el) obs.observe(el);
        });
    }

    // ── Video tracking ────────────────────────────────────────────────────────
    function initVideoTracking() {
        document.querySelectorAll('video').forEach(function (video) {
            var started = false;
            video.addEventListener('play', function () {
                if (!started) {
                    started = true;
                    a.track('video_started', { src: video.currentSrc || video.src, page: window.location.pathname });
                }
            });
            video.addEventListener('pause', function () {
                if (!video.ended) a.track('video_paused', { src: video.currentSrc || video.src, page: window.location.pathname });
            });
            video.addEventListener('ended', function () {
                a.track('video_completed', { src: video.currentSrc || video.src, page: window.location.pathname });
            });
        });
    }

    // ── JS error tracking ─────────────────────────────────────────────────────
    function initErrorTracking() {
        window.addEventListener('error', function (event) {
            a.track('js_error', {
                message: event.message,
                file: event.filename,
                line: event.lineno,
                page: window.location.pathname,
            });
        });
    }

    // ── Performance tracking ──────────────────────────────────────────────────
    function initPerformanceTracking() {
        function checkPerf() {
            if (typeof performance === 'undefined') return;
            var entries = performance.getEntriesByType('navigation');
            if (!entries || !entries[0]) return;
            var loadTime = Math.round(entries[0].loadEventEnd - entries[0].startTime);
            if (loadTime > 3000) {
                a.track('slow_page_load', { load_time_ms: loadTime, page: window.location.pathname });
            }
        }
        if (document.readyState === 'complete') checkPerf();
        else window.addEventListener('load', checkPerf, { once: true });

        if (typeof PerformanceObserver !== 'undefined') {
            try {
                var cls = 0;
                new PerformanceObserver(function (list) {
                    list.getEntries().forEach(function (entry) {
                        if (!entry.hadRecentInput) {
                            cls += entry.value || 0;
                            if (cls > 0.25) {
                                a.track('large_layout_shift', { cls: cls.toFixed(3), page: window.location.pathname });
                            }
                        }
                    });
                }).observe({ type: 'layout-shift', buffered: true });
            } catch (_) { /* not supported */ }
        }
    }

    // ── SPA navigation (History API) ──────────────────────────────────────────
    function initSpaTracking() {
        var lastPath = window.location.pathname;
        var origPush = history.pushState;
        var origReplace = history.replaceState;
        function onNav() {
            var next = window.location.pathname;
            if (next !== lastPath) {
                lastPath = next;
                trackPageView();
            }
        }
        history.pushState = function () { origPush.apply(this, arguments); onNav(); };
        history.replaceState = function () { origReplace.apply(this, arguments); onNav(); };
        window.addEventListener('popstate', onNav);
    }

    // ── Init ──────────────────────────────────────────────────────────────────
    function init() {
        trackPageView();
        initScrollTracking();
        initTimeTracking();
        initLinkTracking();
        initCtaTracking();
        initFormTracking();
        initSectionTracking();
        initVideoTracking();
        initErrorTracking();
        initPerformanceTracking();
        initSpaTracking();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
