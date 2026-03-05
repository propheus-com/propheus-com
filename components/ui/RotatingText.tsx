'use client';

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import {
    motion,
    AnimatePresence,
    type Transition,
    type VariantLabels,
    type Target,
    type TargetAndTransition,
} from 'framer-motion';

function cn(...classes: (string | undefined | null | boolean)[]): string {
    return classes.filter(Boolean).join(' ');
}

interface WordEntry {
    characters: string[];
    needsSpace: boolean;
}

export interface RotatingTextRef {
    next: () => void;
    previous: () => void;
    jumpTo: (index: number) => void;
    reset: () => void;
}

export interface RotatingTextProps
    extends Omit<
        React.ComponentPropsWithoutRef<typeof motion.span>,
        'children' | 'transition' | 'initial' | 'animate' | 'exit'
    > {
    texts: string[];
    transition?: Transition;
    initial?: boolean | Target | VariantLabels;
    animate?: boolean | VariantLabels | TargetAndTransition;
    exit?: Target | VariantLabels;
    animatePresenceMode?: 'sync' | 'wait';
    animatePresenceInitial?: boolean;
    rotationInterval?: number;
    staggerDuration?: number;
    staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
    loop?: boolean;
    auto?: boolean;
    splitBy?: string;
    onNext?: (index: number) => void;
    mainClassName?: string;
    splitLevelClassName?: string;
    elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>((props, ref) => {
    const {
        texts,
        transition = { type: 'spring', damping: 25, stiffness: 300 },
        initial = { y: '100%' },
        animate = { y: 0 },
        exit = { y: '-120%' },
        animatePresenceMode = 'wait',
        animatePresenceInitial = false,
        rotationInterval = 2000,
        staggerDuration = 0,
        staggerFrom = 'first',
        loop = true,
        auto = true,
        splitBy = 'characters',
        onNext,
        mainClassName,
        splitLevelClassName,
        elementLevelClassName,
        ...rest
    } = props;

    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

    const splitIntoCharacters = (text: string): string[] => {
        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
            return Array.from(segmenter.segment(text), (seg) => seg.segment);
        }
        return Array.from(text);
    };

    const elements = useMemo<WordEntry[]>(() => {
        const currentText = texts[currentTextIndex];
        if (splitBy === 'characters') {
            const words = currentText.split(' ');
            return words.map((word: string, i: number): WordEntry => ({
                characters: splitIntoCharacters(word),
                needsSpace: i !== words.length - 1,
            }));
        }
        if (splitBy === 'words') {
            return currentText.split(' ').map((word: string, i: number, arr: string[]): WordEntry => ({
                characters: [word],
                needsSpace: i !== arr.length - 1,
            }));
        }
        if (splitBy === 'lines') {
            return currentText.split('\n').map((line: string, i: number, arr: string[]): WordEntry => ({
                characters: [line],
                needsSpace: i !== arr.length - 1,
            }));
        }
        return currentText.split(splitBy).map((part: string, i: number, arr: string[]): WordEntry => ({
            characters: [part],
            needsSpace: i !== arr.length - 1,
        }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [texts, currentTextIndex, splitBy]);

    const getStaggerDelay = useCallback(
        (index: number, totalChars: number): number => {
            if (staggerFrom === 'first') return index * staggerDuration;
            if (staggerFrom === 'last') return (totalChars - 1 - index) * staggerDuration;
            if (staggerFrom === 'center') {
                const center = Math.floor(totalChars / 2);
                return Math.abs(center - index) * staggerDuration;
            }
            if (staggerFrom === 'random') {
                const randomIndex = Math.floor(Math.random() * totalChars);
                return Math.abs(randomIndex - index) * staggerDuration;
            }
            return Math.abs((staggerFrom as number) - index) * staggerDuration;
        },
        [staggerFrom, staggerDuration],
    );

    const handleIndexChange = useCallback(
        (newIndex: number) => {
            setCurrentTextIndex(newIndex);
            if (onNext) onNext(newIndex);
        },
        [onNext],
    );

    const next = useCallback(() => {
        const nextIndex =
            currentTextIndex === texts.length - 1
                ? loop ? 0 : currentTextIndex
                : currentTextIndex + 1;
        if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
        const prevIndex =
            currentTextIndex === 0
                ? loop ? texts.length - 1 : currentTextIndex
                : currentTextIndex - 1;
        if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
        (index: number) => {
            const validIndex = Math.max(0, Math.min(index, texts.length - 1));
            if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
        },
        [texts.length, currentTextIndex, handleIndexChange],
    );

    const reset = useCallback(() => {
        if (currentTextIndex !== 0) handleIndexChange(0);
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [
        next,
        previous,
        jumpTo,
        reset,
    ]);

    useEffect(() => {
        if (!auto) return;
        const id = setInterval(next, rotationInterval);
        return () => clearInterval(id);
    }, [next, rotationInterval, auto]);

    return (
        <motion.span
            className={cn('text-rotate', mainClassName)}
            {...rest}
            layout
            transition={transition}
        >
            <span className="text-rotate-sr-only">{texts[currentTextIndex]}</span>
            <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
                <motion.span
                    key={currentTextIndex}
                    className={cn(splitBy === 'lines' ? 'text-rotate-lines' : 'text-rotate')}
                    layout
                    aria-hidden="true"
                >
                    {elements.map((wordObj: WordEntry, wordIndex: number, array: WordEntry[]) => {
                        const previousCharsCount = array
                            .slice(0, wordIndex)
                            .reduce((sum: number, w: WordEntry) => sum + w.characters.length, 0);
                        const totalChars = array.reduce((sum: number, w: WordEntry) => sum + w.characters.length, 0);
                        return (
                            <span key={wordIndex} className={cn('text-rotate-word', splitLevelClassName)}>
                                {wordObj.characters.map((char: string, charIndex: number) => (
                                    <motion.span
                                        key={charIndex}
                                        initial={initial}
                                        animate={animate}
                                        exit={exit}
                                        transition={{
                                            ...transition,
                                            delay: getStaggerDelay(
                                                previousCharsCount + charIndex,
                                                totalChars,
                                            ),
                                        }}
                                        className={cn('text-rotate-element', elementLevelClassName)}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                                {wordObj.needsSpace && <span className="text-rotate-space"> </span>}
                            </span>
                        );
                    })}
                </motion.span>
            </AnimatePresence>
        </motion.span>
    );
});

RotatingText.displayName = 'RotatingText';
export default RotatingText;
