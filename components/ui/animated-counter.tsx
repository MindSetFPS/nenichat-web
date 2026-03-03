"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface CounterProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
}

/**
 * Animated counter component for displaying numbers with a count-up effect.
 *
 * @param {CounterProps} props - The properties for the counter.
 * @returns {JSX.Element} The rendered counter component.
 */
export function AnimatedCounter({
    value,
    prefix = "",
    suffix = "",
    decimals = 0,
    className = "",
}: CounterProps) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        const duration = 1500; // 1.5 seconds
        const startTime = performance.now();

        const updateCounter = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            // Ease out expo function
            const easeOutExpo = (x: number): number => {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            };

            const currentCount = easeOutExpo(progress) * end;
            setDisplayValue(currentCount);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                setDisplayValue(end);
            }
        };

        requestAnimationFrame(updateCounter);
    }, [value]);

    return (
        <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={className}
        >
            {prefix}
            {displayValue.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}
            {suffix}
        </motion.span>
    );
}
