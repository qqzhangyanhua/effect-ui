"use client"

// Ported from SmoothUI (MIT) — https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/depth-parallax-words/index.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

import { motion, useInView } from "motion/react";
import { useRef } from "react";

/**
 * DepthParallaxWords — per-word depth motion with scale, vertical drift and blur for layered readability.
 * From the animate-text catalog (`depth-parallax-words`).
 */
export interface DepthParallaxWordsProps {
  children: string;
  className?: string;
  /** Delay before the animation starts, in milliseconds. */
  delay?: number;
  /** Per-word stagger, in milliseconds. */
  stagger?: number;
  /** Animate only once the text scrolls into view. */
  triggerOnView?: boolean;
}

const DURATION_S = 0.7;
const MS = 1000;
const EASE = [0.22, 1, 0.36, 1] as const;

export function DepthParallaxWords({
  children,
  className = "",
  delay = 0,
  stagger = 70,
  triggerOnView = false,
}: DepthParallaxWordsProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const prefersReducedMotion = usePrefersReducedMotion();
  const motionOn = useAnimationActive(ref);
  const play = (!triggerOnView || inView) && motionOn && !prefersReducedMotion;
  const words = children.split(" ");

  return (
    <span aria-label={children} className={className} data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="depth-parallax-words" ref={ref}>
      {words.map((word, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: words have no stable id
        <span key={index}>
          <motion.span
            animate={
              play
                ? { filter: "blur(0px)", opacity: 1, scale: 1, y: 0 }
                : undefined
            }
            aria-hidden="true"
            initial={
              prefersReducedMotion
                ? { opacity: 1 }
                : { filter: "blur(3px)", opacity: 0, scale: 0.92, y: 18 }
            }
            style={{ display: "inline-block", whiteSpace: "pre" }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    delay: delay / MS + (index * stagger) / MS,
                    duration: DURATION_S,
                    ease: EASE,
                  }
            }
          >
            {word}
          </motion.span>
          {index < words.length - 1 && (
            <span
              aria-hidden="true"
              style={{ display: "inline-block", whiteSpace: "pre" }}
            >
              {" "}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
