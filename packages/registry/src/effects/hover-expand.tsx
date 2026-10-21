"use client"

// Ported from SmoothUI (MIT) — https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/hover-expand/index.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"


const HOVER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribeHover(onStoreChange: () => void) {
  const media = window.matchMedia(HOVER_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function hoverSnapshot() {
  return window.matchMedia(HOVER_QUERY).matches;
}

function useHoverCapable() {
  return useSyncExternalStore(subscribeHover, hoverSnapshot, () => false);
}

import { motion } from "motion/react";
import type { KeyboardEvent } from "react";
import { useRef, useState, useSyncExternalStore } from "react";

export type HoverExpandOrientation = "horizontal" | "vertical";

export interface HoverExpandItem {
  alt?: string;
  description?: string;
  id: string;
  image?: string;
  title: string;
}

export interface HoverExpandProps {
  activeIndex?: number;
  className?: string;
  collapsedFlex?: number;
  expandedFlex?: number;
  items: HoverExpandItem[];
  onActiveIndexChange?: (index: number) => void;
  orientation?: HoverExpandOrientation;
  showLabelsWhenCollapsed?: boolean;
}

const DEFAULT_EXPANDED_FLEX = 4;
const DEFAULT_COLLAPSED_FLEX = 1;
const LABEL_ROTATION = -90;

const HoverExpand = ({
  items,
  orientation = "horizontal",
  activeIndex: activeIndexProp,
  onActiveIndexChange,
  expandedFlex = DEFAULT_EXPANDED_FLEX,
  collapsedFlex = DEFAULT_COLLAPSED_FLEX,
  showLabelsWhenCollapsed = true,
  className,
}: HoverExpandProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const motionOn = useAnimationActive(hostRef);
  const shouldReduceMotion = prefersReducedMotion || !motionOn;
  const [internalActive, setInternalActive] = useState(0);
  const isControlled = activeIndexProp !== undefined;
  const activeIndex = isControlled ? activeIndexProp : internalActive;
  const isHoverDevice = useHoverCapable();
  const panelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isHorizontal = orientation === "horizontal";

  const setActive = (index: number) => {
    if (!isControlled) {
      setInternalActive(index);
    }
    onActiveIndexChange?.(index);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

    if (event.key === nextKey) {
      event.preventDefault();
      const next = Math.min(index + 1, items.length - 1);
      setActive(next);
      panelRefs.current[next]?.focus();
    } else if (event.key === prevKey) {
      event.preventDefault();
      const prev = Math.max(index - 1, 0);
      setActive(prev);
      panelRefs.current[prev]?.focus();
    }
  };

  return (
    <div
      aria-label="Expandable image panels"
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="hover-expand"
      ref={hostRef}
      className={cn(
        "flex w-full gap-2",
        isHorizontal ? "h-[360px] flex-row" : "h-[520px] flex-col",
        className
      )}
      role="group"
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        const shouldShowLabel = isActive || showLabelsWhenCollapsed;

        return (
          <motion.button
            animate={{ flexGrow: isActive ? expandedFlex : collapsedFlex }}
            aria-label={item.title}
            aria-pressed={isActive}
            className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border border-foreground/10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            initial={false}
            key={item.id}
            onClick={() => {
              if (!isHoverDevice) {
                setActive(index);
              }
            }}
            onFocus={() => setActive(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onMouseEnter={() => {
              if (isHoverDevice) {
                setActive(index);
              }
            }}
            ref={(el) => {
              panelRefs.current[index] = el;
            }}
            style={{ flexBasis: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { bounce: 0.1, duration: 0.25, type: "spring" }
            }
            type="button"
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt={item.alt ?? item.title}
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
                src={item.image}
              />
            ) : null}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
            />
            <motion.div
              animate={
                shouldReduceMotion
                  ? { opacity: shouldShowLabel ? 1 : 0 }
                  : {
                      opacity: shouldShowLabel ? 1 : 0,
                      rotate: isHorizontal && !isActive ? LABEL_ROTATION : 0,
                    }
              }
              className="absolute inset-0 flex items-end p-4"
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { bounce: 0.1, duration: 0.25, type: "spring" }
              }
            >
              <div
                className={cn(
                  isHorizontal && !isActive && "origin-left whitespace-nowrap"
                )}
              >
                <p className="font-semibold text-sm text-white">{item.title}</p>
                {isActive && item.description ? (
                  <p className="mt-1 text-white/80 text-xs">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
};

export { HoverExpand };
