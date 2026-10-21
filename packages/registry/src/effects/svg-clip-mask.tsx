"use client"

// Ported from SmoothUI (MIT) — https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/svg-clip-mask/index.tsx

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

import {
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import {
  type ReactNode,
  type RefObject,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/** Motion scroll offset tuple, typed from `useScroll` itself. */
export type ScrollOffset = NonNullable<
  Parameters<typeof useScroll>[0]
>["offset"];

const EASE_MOVE = [0.645, 0.045, 0.355, 1] as const;
const TRANSITION_DURATION = 0.3;
const DEFAULT_MORPH_DURATION = 4;
// The mask has to finish opening while the frame is still in view; the full
// enter-to-exit range parks the fully-revealed state off-screen.
const DEFAULT_SCROLL_OFFSET: ScrollOffset = ["start 0.9", "end 0.6"];

const PRESET_PATHS = {
  arch: "M0,1 L0,0.4 C0,0.18 0.18,0 0.5,0 C0.82,0 1,0.18 1,0.4 L1,1 Z",
  blob: "M0.5,0.02 C0.75,0.02 0.98,0.25 0.98,0.5 C0.98,0.75 0.75,0.98 0.5,0.98 C0.25,0.98 0.02,0.75 0.02,0.5 C0.02,0.25 0.25,0.02 0.5,0.02 Z",
  diamond: "M0.5,0 L1,0.5 L0.5,1 L0,0.5 Z",
  wave: "M0,0.3 C0.25,0.05 0.75,0.55 1,0.3 L1,1 L0,1 Z",
} as const;

export type SvgClipMaskShape = "blob" | "arch" | "diamond" | "wave" | "custom";
export type SvgClipMaskAnimate = "none" | "morph" | "scroll" | "hover";

export interface SvgClipMaskProps {
  /**
   * "morph" cycles through morphPaths forever, "scroll" steps through them as
   * the container scrolls, "hover" swaps to morphPaths[0] on hover.
   */
  animate?: SvgClipMaskAnimate;
  children: ReactNode;
  className?: string;
  /** Ref to a scrollable ancestor that drives "scroll" mode instead of the window. */
  container?: RefObject<HTMLElement | null>;
  /** Seconds for one full "morph" loop. */
  duration?: number;
  /**
   * Paths to cycle between for "morph"/"scroll"/"hover". They must all share
   * the same command structure (same sequence of M/L/C/Z and point counts) —
   * browsers interpolate matching parameters positionally, so mismatched
   * structures snap instead of morphing smoothly.
   */
  morphPaths?: string[];
  /** Custom path data, in objectBoundingBox (0..1) coordinates. Required when shape is "custom". */
  path?: string;
  shape?: SvgClipMaskShape;
}

export function SvgClipMask({
  children,
  shape = "blob",
  path,
  animate = "none",
  morphPaths,
  duration = DEFAULT_MORPH_DURATION,
  container,
  className,
}: SvgClipMaskProps) {
  const clipId = useId();
  const prefersReducedMotion = usePrefersReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const motionOn = useAnimationActive(hostRef);
  const shouldReduceMotion = prefersReducedMotion || !motionOn;
  const isHoverCapable = useHoverCapable();
  const [isHovered, setIsHovered] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);

  const basePath =
    shape === "custom" ? (path ?? PRESET_PATHS.blob) : PRESET_PATHS[shape];
  const paths = morphPaths && morphPaths.length > 1 ? morphPaths : [basePath];

  const { scrollYProgress } = useScroll({
    container,
    offset: DEFAULT_SCROLL_OFFSET,
    target: hostRef,
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (shouldReduceMotion || animate !== "scroll" || paths.length < 2) {
      return;
    }
    const index = Math.min(paths.length - 1, Math.floor(value * paths.length));
    setScrollIndex(index);
  });

  const isMorphing =
    animate === "morph" && !shouldReduceMotion && paths.length > 1;

  const activeD = (() => {
    if (shouldReduceMotion || animate === "none" || isMorphing) {
      return paths[0];
    }
    if (animate === "scroll") {
      return paths[scrollIndex] ?? paths[0];
    }
    if (animate === "hover") {
      return isHoverCapable && isHovered ? (paths[1] ?? paths[0]) : paths[0];
    }
    return paths[0];
  })();

  return (
    <div
      className={cn("relative", className)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      ref={hostRef} data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="svg-clip-mask"
    >
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <defs>
          <clipPath clipPathUnits="objectBoundingBox" id={clipId}>
            <motion.path
              animate={isMorphing ? { d: paths } : { d: activeD }}
              initial={false}
              transition={
                isMorphing
                  ? {
                      duration,
                      ease: EASE_MOVE,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                    }
                  : { duration: TRANSITION_DURATION, ease: EASE_MOVE }
              }
            />
          </clipPath>
        </defs>
      </svg>
      <div
        className="h-full w-full"
        style={{
          clipPath: `url(#${clipId})`,
          WebkitClipPath: `url(#${clipId})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
