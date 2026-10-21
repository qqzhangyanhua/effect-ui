"use client"

// Ported from SmoothUI (MIT) — https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/magnetic-field/index.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useAnimationActive } from "@/hooks/use-animation-active"

import { cn } from "@/lib/utils"
import {
  type MotionValue,
  motion,
  motionValue,
} from "motion/react";
import type { ReactElement, ReactNode } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

export type MagneticFieldMode = "attract" | "repel" | "orbit";

export type MagneticFieldItem = {
  element: ReactElement;
  id: string;
};

export type MagneticFieldProps = {
  children?: ReactNode;
  className?: string;
  damping?: number;
  items?: MagneticFieldItem[];
  mode?: MagneticFieldMode;
  paused?: boolean;
  radius?: number;
  rotate?: boolean;
  stiffness?: number;
  strength?: number;
};

type ParticipantState = {
  centerX: number;
  centerY: number;
  rotate: MotionValue<number>;
  vr: number;
  vx: number;
  vy: number;
  x: MotionValue<number>;
  y: MotionValue<number>;
};

const DEFAULT_RADIUS = 160;
const DEFAULT_STRENGTH = 0.35;
const DEFAULT_STIFFNESS = 180;
const DEFAULT_DAMPING = 18;
const MAX_ROTATE_DEG = 18;
const FALLOFF_POWER = 2;
const MAX_DELTA_SECONDS = 0.05;
const ORBIT_RADIAL_FACTOR = 0.2;
const ORBIT_TANGENTIAL_FACTOR = 0.4;
const MAGNETIC_SELECTOR = "[data-magnetic]";
const POINTER_QUERY = "(hover: hover) and (pointer: fine)";

function subscribePointer(onChange: () => void) {
  const media = window.matchMedia(POINTER_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function pointerNow() {
  return window.matchMedia(POINTER_QUERY).matches;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const computeFalloff = (distance: number, radius: number) => {
  if (distance >= radius) {
    return 0;
  }
  return (1 - distance / radius) ** FALLOFF_POWER;
};

const computeOffset = (
  dx: number,
  dy: number,
  distance: number,
  falloff: number,
  strength: number,
  mode: MagneticFieldMode
): { x: number; y: number } => {
  if (distance === 0) {
    return { x: 0, y: 0 };
  }
  const directional = mode === "repel" ? -Math.abs(strength) : strength;
  if (mode === "orbit") {
    const tangentX = -dy / distance;
    const tangentY = dx / distance;
    const pull = directional * falloff * distance * ORBIT_TANGENTIAL_FACTOR;
    return {
      x: dx * directional * falloff * ORBIT_RADIAL_FACTOR + tangentX * pull,
      y: dy * directional * falloff * ORBIT_RADIAL_FACTOR + tangentY * pull,
    };
  }
  return { x: dx * directional * falloff, y: dy * directional * falloff };
};

const createParticipant = (): ParticipantState => ({
  centerX: 0,
  centerY: 0,
  rotate: motionValue(0),
  vr: 0,
  vx: 0,
  vy: 0,
  x: motionValue(0),
  y: motionValue(0),
});

const resetParticipant = (state: ParticipantState) => {
  state.x.set(0);
  state.y.set(0);
  state.rotate.set(0);
  state.vx = 0;
  state.vy = 0;
  state.vr = 0;
};

const MagneticField = ({
  children,
  className,
  damping = DEFAULT_DAMPING,
  items,
  mode = "attract",
  paused = false,
  radius = DEFAULT_RADIUS,
  rotate = false,
  stiffness = DEFAULT_STIFFNESS,
  strength = DEFAULT_STRENGTH,
}: MagneticFieldProps) => {
  const shouldReduceMotion = usePrefersReducedMotion();
  const isPointerCapable = useSyncExternalStore(subscribePointer, pointerNow, () => false);
  const containerRef = useRef<HTMLDivElement>(null);
  const motionOn = useAnimationActive(containerRef);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const participantsRef = useRef<Map<string, ParticipantState>>(new Map());
  const nodeMapRef = useRef<Map<string, HTMLElement>>(new Map());
  const elementsRef = useRef<Map<HTMLElement, ParticipantState>>(new Map());
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const isEffectDisabled = paused || shouldReduceMotion || !isPointerCapable || !motionOn;
  const itemKey = items?.map((item) => item.id).join("\0") ?? "";
  const [roster, setRoster] = useState<{ key: string; map: Map<string, ParticipantState> }>({
    key: "",
    map: new Map(),
  });
  let participants = roster.map;
  if (items && roster.key !== itemKey) {
    const map = new Map<string, ParticipantState>();
    for (const item of items) {
      map.set(item.id, roster.map.get(item.id) ?? createParticipant());
    }
    participants = map;
    setRoster({ key: itemKey, map });
  } else if (!items && roster.key !== "") {
    participants = new Map();
    setRoster({ key: "", map: participants });
  }

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  // Measure rest positions for `items` participants once per layout change.
  useEffect(() => {
    if (!items) {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      for (const [id, node] of nodeMapRef.current) {
        const state = participantsRef.current.get(id);
        if (!state) {
          continue;
        }
        const rect = node.getBoundingClientRect();
        state.centerX = rect.left + rect.width / 2 - containerRect.left;
        state.centerY = rect.top + rect.height / 2 - containerRect.top;
      }
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    for (const node of nodeMapRef.current.values()) {
      resizeObserver.observe(node);
    }
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [items]);

  // Discover and measure `data-magnetic` descendants of `children`.
  useEffect(() => {
    if (items) {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const syncElements = () => {
      const found = Array.from(
        container.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR)
      );
      const map = elementsRef.current;
      for (const el of Array.from(map.keys())) {
        if (!found.includes(el)) {
          el.style.transform = "";
          el.style.willChange = "";
          map.delete(el);
        }
      }
      const containerRect = container.getBoundingClientRect();
      for (const el of found) {
        if (!map.has(el)) {
          el.style.willChange = "transform";
          map.set(el, createParticipant());
        }
        const state = map.get(el);
        if (!state) {
          continue;
        }
        const rect = el.getBoundingClientRect();
        state.centerX = rect.left + rect.width / 2 - containerRect.left;
        state.centerY = rect.top + rect.height / 2 - containerRect.top;
      }
    };

    syncElements();
    const mutationObserver = new MutationObserver(syncElements);
    mutationObserver.observe(container, { childList: true, subtree: true });
    const resizeObserver = new ResizeObserver(syncElements);
    resizeObserver.observe(container);
    window.addEventListener("resize", syncElements);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncElements);
      // The map is filled while the effect is alive; snapshot it when cleaning up.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const tracked = [...elementsRef.current.keys()];
      for (const el of tracked) {
        el.style.transform = "";
        el.style.willChange = "";
      }
    };
  }, [items]);

  // Track the pointer position relative to the container with one listener.
  useEffect(() => {
    if (isEffectDisabled) {
      pointerRef.current = null;
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };
    const handlePointerLeave = () => {
      pointerRef.current = null;
    };

    container.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    container.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [isEffectDisabled]);

  // Single rAF loop driving a manual spring integrator per participant.
  useEffect(() => {
    if (isEffectDisabled) {
      for (const state of participantsRef.current.values()) {
        resetParticipant(state);
      }
      const tracked = [...elementsRef.current];
      for (const [el, state] of tracked) {
        resetParticipant(state);
        el.style.transform = "translate3d(0px, 0px, 0) rotate(0deg)";
      }
      return;
    }

    const applyPhysics = (state: ParticipantState, dt: number) => {
      const pointer = pointerRef.current;
      let targetX = 0;
      let targetY = 0;
      let targetRotate = 0;

      if (pointer) {
        const dx = pointer.x - state.centerX;
        const dy = pointer.y - state.centerY;
        const distance = Math.hypot(dx, dy);
        const falloff = computeFalloff(distance, radius);
        if (falloff > 0) {
          const offset = computeOffset(
            dx,
            dy,
            distance,
            falloff,
            strength,
            mode
          );
          targetX = offset.x;
          targetY = offset.y;
          if (rotate) {
            targetRotate = clamp(
              ((Math.atan2(dy, dx) * 180) / Math.PI) * falloff,
              -MAX_ROTATE_DEG,
              MAX_ROTATE_DEG
            );
          }
        }
      }

      const currentX = state.x.get();
      const currentY = state.y.get();
      const currentRotate = state.rotate.get();

      state.vx += ((targetX - currentX) * stiffness - state.vx * damping) * dt;
      state.vy += ((targetY - currentY) * stiffness - state.vy * damping) * dt;
      state.vr +=
        ((targetRotate - currentRotate) * stiffness - state.vr * damping) * dt;

      state.x.set(currentX + state.vx * dt);
      state.y.set(currentY + state.vy * dt);
      state.rotate.set(currentRotate + state.vr * dt);
    };

    const step = (time: number) => {
      const last = lastFrameRef.current ?? time;
      const dt = clamp((time - last) / 1000, 0, MAX_DELTA_SECONDS);
      lastFrameRef.current = time;

      for (const state of participantsRef.current.values()) {
        applyPhysics(state, dt);
      }
      for (const [el, state] of elementsRef.current) {
        applyPhysics(state, dt);
        const x = state.x.get();
        const y = state.y.get();
        const r = state.rotate.get();
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r}deg)`;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lastFrameRef.current = null;
    };
  }, [damping, isEffectDisabled, mode, radius, rotate, stiffness, strength]);

  const content = items
    ? items.map((item) => {
        const state = participants.get(item.id);
        if (!state) {
          return null;
        }
        return (
          <motion.div
            className="inline-block will-change-transform"
            key={item.id}
            ref={(node: HTMLDivElement | null) => {
              if (node) {
                nodeMapRef.current.set(item.id, node);
              } else {
                nodeMapRef.current.delete(item.id);
              }
            }}
            style={{ rotate: state.rotate, x: state.x, y: state.y }}
          >
            {item.element}
          </motion.div>
        );
      })
    : children;

  return (
    <div className={cn("relative", className)} data-reduced={shouldReduceMotion ? "true" : "false"} data-slot="magnetic-field" ref={containerRef}>
      {content}
    </div>
  );
};

export { MagneticField }
