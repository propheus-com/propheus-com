declare global {
    interface Window {
        umami?: {
            track: (eventName: string, data?: Record<string, unknown>) => void;
        };
        ANALYTICS_DEBUG?: boolean;
    }
}

export const analytics = {
    track(eventName: string, data: Record<string, unknown> = {}): void {
        if (typeof window === 'undefined') return;
        if (window.ANALYTICS_DEBUG) {
            // eslint-disable-next-line no-console
            console.log('[Analytics]', eventName, data);
        }
        if (window.umami?.track) {
            window.umami.track(eventName, data);
        }
    },
};
