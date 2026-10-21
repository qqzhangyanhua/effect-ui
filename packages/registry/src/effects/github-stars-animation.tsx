"use client"

// Ported from SmoothUI (MIT) — https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/github-stars-animation/index.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { Star } from "lucide-react";
import { motion, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

const TRANSITION_DURATION = 0.3;
const EASE_OUT_CUBIC = [0.215, 0.61, 0.355, 1] as const;
const COUNTDOWN_DURATION = 2000;
const AVATAR_COUNT = 5;
const STAGGER_DELAY = 0.05;

export interface Stargazer {
  avatar_url: string;
  html_url: string;
  login: string;
}

export interface GitHubStarsAnimationProps {
  apiEndpoint?: string;
  avatarClassName?: string;
  className?: string;
  countClassName?: string;
  maxAvatars?: number;
  owner?: string;
  repo?: string;
  showAvatars?: boolean;
  starCount?: number;
  stargazers?: Stargazer[];
}

export function GitHubStarsAnimation({
  owner = "educlopez",
  repo = "smoothui",
  stargazers: providedStargazers,
  starCount: providedStarCount,
  apiEndpoint,
  className = "",
  avatarClassName = "",
  countClassName = "",
  showAvatars = true,
  maxAvatars = AVATAR_COUNT,
}: GitHubStarsAnimationProps) {
  const [stargazers, setStargazers] = useState<Stargazer[]>(
    providedStargazers || []
  );
  const [starCount, setStarCount] = useState(providedStarCount || 0);
  const [displayCount, setDisplayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(Boolean(apiEndpoint) && providedStarCount === undefined);
  const [error, setError] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const motionOn = useAnimationActive(hostRef);
  const shouldReduceMotion = prefersReducedMotion || !motionOn;

  const countSpring = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });

  // Fetch only when the caller passes apiEndpoint. Provided counts never hit the network.
  useEffect(() => {
    if (providedStargazers && providedStarCount !== undefined) {
      queueMicrotask(() => {
        setStargazers(providedStargazers);
        setStarCount(providedStarCount);
        setIsLoading(false);
      });
      return;
    }
    if (!apiEndpoint) {
      queueMicrotask(() => setIsLoading(false));
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(false);
        const response = await fetch(`${apiEndpoint}?owner=${owner}&repo=${repo}`);
        if (!response.ok) {
          throw new Error("stars request failed");
        }
        const data = await response.json();
        if (cancelled) {
          return;
        }
        if (Array.isArray(data.stargazers)) {
          setStargazers(data.stargazers.slice(0, maxAvatars));
        }
        if (typeof data.stars === "number") {
          setStarCount(data.stars);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [owner, repo, apiEndpoint, maxAvatars, providedStargazers, providedStarCount]);

  // Animate countdown
  useEffect(() => {
    if (starCount === 0 || shouldReduceMotion) {
      if (shouldReduceMotion) {
        queueMicrotask(() => {
          setDisplayCount(starCount);
          countSpring.set(starCount);
        });
      }
      return;
    }

    const startTime = Date.now();
    const startValue = 0;
    const endValue = starCount;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / COUNTDOWN_DURATION, 1);

      // Ease-out function
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.floor(startValue + (endValue - startValue) * eased);

      setDisplayCount(current);
      countSpring.set(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayCount(endValue);
        countSpring.set(endValue);
      }
    };

    animate();
  }, [starCount, countSpring, shouldReduceMotion]);

  if (isLoading) {
    return (
      <div
        className={cn("flex items-center gap-3 text-foreground/60", className)}
        data-reduced={prefersReducedMotion ? "true" : "false"}
        data-slot="github-stars-animation"
        ref={hostRef}
      >
        <div className="h-10 w-10 animate-pulse rounded-full bg-foreground/20" />
        <div className="h-6 w-20 animate-pulse rounded bg-foreground/20" />
      </div>
    );
  }

  if (error && starCount === 0) {
    return null;
  }

  const visibleAvatars = stargazers.slice(0, maxAvatars);

  return (
    <div className={cn("flex items-center gap-3", className)} data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="github-stars-animation" ref={hostRef}>
      {/* Avatars */}
      {showAvatars && visibleAvatars.length > 0 && (
        <div className="relative flex items-center">
          {visibleAvatars.map((stargazer, index) => (
            <motion.a
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 1,
                      scale: 1,
                      x: 0,
                    }
              }
              aria-label={`${stargazer.login}'s GitHub profile`}
              className={cn(
                "relative z-10 h-10 w-10 overflow-hidden rounded-full border-2 border-background bg-background transition-transform hover:z-20 hover:scale-110",
                avatarClassName
              )}
              href={stargazer.html_url}
              initial={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : {
                      opacity: 0,
                      scale: 0.8,
                      x: -20,
                    }
              }
              key={stargazer.login}
              rel="noopener noreferrer"
              style={{
                marginLeft: index > 0 ? "-8px" : "0",
              }}
              target="_blank"
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      delay: index * STAGGER_DELAY,
                      duration: TRANSITION_DURATION,
                      ease: EASE_OUT_CUBIC,
                    }
              }
              whileHover={shouldReduceMotion ? {} : { scale: 1.1, zIndex: 20 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
                alt={`${stargazer.login}'s avatar`}
                className="h-full w-full object-cover"
                draggable={false}
                src={stargazer.avatar_url}
              />
            </motion.a>
          ))}
        </div>
      )}

      {/* Star count */}
      <motion.div
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        className={cn("flex items-center gap-1.5 font-medium", countClassName)}
        initial={
          shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: TRANSITION_DURATION,
                ease: EASE_OUT_CUBIC,
              }
        }
      >
        <Star className="h-4 w-4 fill-current" />
        <motion.span
          animate={shouldReduceMotion ? { scale: 1 } : { scale: [1, 1.1, 1] }}
          className="tabular-nums"
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 0.3,
                  ease: EASE_OUT_CUBIC,
                }
          }
        >
          {displayCount.toLocaleString()}
        </motion.span>
        <span className="text-foreground/70 text-sm">
          {displayCount === 1 ? "star" : "stars"}
        </span>
      </motion.div>
    </div>
  );
}
