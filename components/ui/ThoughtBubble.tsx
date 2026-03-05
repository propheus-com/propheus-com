'use client';

import { motion, type Variants } from 'framer-motion';

/**
 * ThoughtBubble — Glassmorphism overlay for Segment 0.
 *
 * Visibility (opacity) is owned by GSAP via the parent .seg0-text wrapper
 * in HeroExperience. This component has NO internal show/hide state: it
 * mounts visible and animates its children once. When the user scrolls
 * forward the parent fades to opacity 0; scrolling back reveals it again
 * fully-formed.
 */
export default function ThoughtBubble() {
    const sentence = 'what if i had a superpower?';
    const words = sentence.split(' ');

    // Outer bubble: spring pop on mount
    const bubbleVariants: Variants = {
        hidden: { scale: 0.85, opacity: 0, y: 30, filter: 'blur(15px)' },
        visible: {
            scale: 1,
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 18,
                delayChildren: 0.35,
                staggerChildren: 0.1,
            },
        },
    };

    // Word entrance: fade + blur + slide
    const wordVariants: Variants = {
        hidden: { opacity: 0, filter: 'blur(10px)', y: 8 },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            },
        },
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;900&display=swap');

                .tb-premium-font {
                    font-family: 'Inter', sans-serif;
                    letter-spacing: -0.02em;
                }

                .tb-superpower-text {
                    position: relative;
                    background: linear-gradient(
                        to right,
                        #0f172a 10%,
                        #0d9488 40%,
                        #2dd4bf 60%,
                        #0f172a 90%
                    );
                    background-size: 200% auto;
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: tb-shine 5s linear infinite;
                    font-weight: 900;
                    letter-spacing: -0.04em;
                    filter: drop-shadow(0 2px 4px rgba(13, 148, 136, 0.2));
                }

                @keyframes tb-shine {
                    to { background-position: 200% center; }
                }

                /* Organic cloud shape — ultra-premium white glass */
                .tb-bubble-organic {
                    background: rgba(255, 255, 255, 0.92);
                    backdrop-filter: blur(40px);
                    -webkit-backdrop-filter: blur(40px);
                    border: 1px solid rgba(255, 255, 255, 1);
                    border-radius: 40% 60% 30% 70% / 50% 40% 60% 50%;
                    box-shadow:
                        0 50px 100px -20px rgba(0, 0, 0, 0.6),
                        0 10px 20px -10px rgba(0, 0, 0, 0.3),
                        inset 0 -4px 12px rgba(0, 0, 0, 0.03),
                        inset 0 4px 12px rgba(255, 255, 255, 0.8);
                    animation: tb-breathe 8s ease-in-out infinite alternate;
                }

                @keyframes tb-breathe {
                    from { border-radius: 40% 60% 30% 70% / 50% 40% 60% 50%; }
                    to   { border-radius: 50% 50% 60% 40% / 40% 60% 50% 70%; }
                }

                .tb-trail-circle {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
                    border: 1px solid rgba(255, 255, 255, 1);
                }
            `}</style>

            {/* Flex column: bubble + thought trail */}
            <div className="relative flex flex-col items-center">

                {/* Main Organic Thought Bubble */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={bubbleVariants}
                    className="tb-bubble-organic px-16 py-20 flex items-center justify-center min-w-[320px] md:min-w-[520px] relative"
                >
                    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
                        {words.map((word, index) => {
                            const isSuperpower = word.toLowerCase().includes('superpower');
                            return (
                                <motion.span
                                    key={index}
                                    variants={wordVariants}
                                    className={`tb-premium-font text-4xl md:text-6xl ${
                                        isSuperpower
                                            ? 'tb-superpower-text py-2'
                                            : 'text-slate-900 font-medium'
                                    }`}
                                >
                                    {word}
                                </motion.span>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Thought trail — three descending bubbles */}
                <div className="relative w-full h-24 mt-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
                        className="tb-trail-circle absolute right-[48%] top-0 w-12 h-12 rounded-full"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="tb-trail-circle absolute right-[43%] top-12 w-8 h-8 rounded-full"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.4, type: 'spring' }}
                        className="tb-trail-circle absolute right-[41%] top-20 w-4 h-4 rounded-full"
                    />
                </div>
            </div>
        </>
    );
}
