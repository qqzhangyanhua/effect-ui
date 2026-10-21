"use client"

// Ported from SmoothUI (MIT) — https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/prism-sweep-transition/index.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { Mesh, Program, Renderer, Triangle } from "ogl"
import { type ReactNode, useEffect, useRef, useState } from "react"

export type PrismSweepDirection = "left" | "right" | "up" | "down";
export type PrismSweepTone = "prism" | "chroma" | "aperture" | "beam";

export interface PrismSweepTransitionProps {
  /** Content rendered underneath the sweep. */
  children: ReactNode;
  /** Optional wrapper className. */
  className?: string;
  /** Direction the prism field travels from. */
  direction?: PrismSweepDirection;
  /** Total sweep duration, in milliseconds. */
  duration?: number;
  /** Called after the sweep finishes. */
  onRest?: () => void;
  /** Optional tone preset for the shader palette and field behavior. */
  tone?: PrismSweepTone;
  /** Key that starts a new sweep when it changes. */
  transitionKey: string | number;
}

const DEFAULT_DURATION_MS = 1240;
const OUTRO_MS = 82;
const CONTENT_SWAP_RATIO = 0.52;
const MAX_DEVICE_PIXEL_RATIO = 2;
const MIN_PHASE_MS = 80;
const HIDDEN_OPACITY = 0;
const VISIBLE_OPACITY = 1;

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uClock;
uniform float uTravel;
uniform float uOpacity;
uniform float uAxis;
uniform float uForward;
uniform float uSpan;
uniform float uSoftness;
uniform float uBend;
uniform float uFacet;
uniform float uBloom;
uniform vec3 uInk;
uniform vec3 uPearl;
uniform vec3 uWarm;
uniform vec3 uCool;

float saturate(float value) {
  return clamp(value, 0.0, 1.0);
}

float triangleWave(float value) {
  return abs(fract(value) * 2.0 - 1.0);
}

float softRidge(float distance, float width) {
  return exp(-distance * distance / max(width, 0.0001));
}

void main() {
  vec2 uv = vUv;
  vec2 pixel = 1.0 / max(uResolution, vec2(1.0));

  float mainAxis = mix(uv.x, uv.y, uAxis);
  float crossAxis = mix(uv.y, uv.x, uAxis);
  mainAxis = mix(mainAxis, 1.0 - mainAxis, step(0.0, -uForward));

  float time = uClock * 0.42;
  float drift =
      sin(crossAxis * 7.0 + time * 1.8) * 0.024
    + sin(crossAxis * 17.0 - time * 1.1 + 1.6) * 0.010
    + sin((mainAxis + crossAxis) * 11.0 + time * 0.7) * 0.006;
  drift *= uBend;

  float travel = -0.34 + uTravel * 1.68;
  float d = mainAxis - travel - drift;
  float ad = abs(d);

  float field = 1.0 - smoothstep(uSpan, uSpan + uSoftness, ad);
  float inner = 1.0 - smoothstep(uSpan * 0.28, uSpan, ad);
  float frontRidge = softRidge(d - uSpan * 0.34, 0.0017 + pixel.x * 16.0);
  float backRidge = softRidge(d + uSpan * 0.54, 0.0035 + pixel.y * 14.0) * 0.55;

  float facetGrid = triangleWave(crossAxis * uFacet + mainAxis * 2.1 + time * 0.35);
  float facetCuts = smoothstep(0.18, 0.92, facetGrid);
  float diagonal = triangleWave((crossAxis - mainAxis * 0.36) * (uFacet * 0.44) - time * 0.2);
  float caustic = pow(1.0 - diagonal, 4.0) * 0.42 + pow(facetCuts, 2.2) * 0.22;

  float glass = saturate(field * (0.5 + inner * 0.42) + frontRidge * 0.52 + backRidge * 0.2);
  float gateIn = smoothstep(0.02, 0.14, uTravel);
  float gateOut = 1.0 - smoothstep(0.9, 1.0, uTravel);
  float envelope = gateIn * gateOut;

  vec3 base = mix(uCool, uWarm, saturate(crossAxis * 0.82 + drift * 4.5));
  vec3 prism = mix(base, uPearl, inner * 0.36 + frontRidge * 0.5);
  prism = mix(prism, uInk, smoothstep(0.55, 0.0, ad) * 0.1);
  prism += caustic * uBloom * mix(uWarm, uPearl, 0.38);
  prism += frontRidge * uBloom * mix(uWarm, uCool, 0.22) * 0.72;
  prism += backRidge * uBloom * uCool * 0.7;

  float vignette = smoothstep(0.0, 0.025, crossAxis) * smoothstep(1.0, 0.975, crossAxis);
  float alpha = saturate(glass * 0.64 + frontRidge * 0.24 + backRidge * 0.14);
  alpha *= uOpacity * envelope * vignette;

  gl_FragColor = vec4(prism * alpha, alpha);
}
`;

const TONE_CONFIGS = {
  aperture: {
    bend: 0.42,
    bloom: 0.86,
    cool: [0.92, 0.78, 0.66],
    facet: 9.5,
    ink: [0.24, 0.16, 0.12],
    pearl: [1, 0.96, 0.88],
    softness: 0.076,
    span: 0.17,
    warm: [1, 0.62, 0.38],
  },
  beam: {
    bend: 0.12,
    bloom: 1.08,
    cool: [0.86, 0.72, 0.5],
    facet: 18,
    ink: [0.2, 0.13, 0.07],
    pearl: [1, 0.9, 0.68],
    softness: 0.038,
    span: 0.092,
    warm: [1, 0.48, 0.18],
  },
  chroma: {
    bend: 0.9,
    bloom: 0.78,
    cool: [0.38, 0.86, 0.84],
    facet: 13.5,
    ink: [0.18, 0.16, 0.3],
    pearl: [0.96, 0.88, 1],
    softness: 0.082,
    span: 0.15,
    warm: [1, 0.34, 0.72],
  },
  prism: {
    bend: 0.76,
    bloom: 0.58,
    cool: [0.28, 0.78, 0.86],
    facet: 12,
    ink: [0.2, 0.16, 0.26],
    pearl: [0.94, 0.82, 0.9],
    softness: 0.07,
    span: 0.14,
    warm: [0.98, 0.28, 0.58],
  },
} as const satisfies Record<
  PrismSweepTone,
  {
    bend: number;
    bloom: number;
    cool: readonly [number, number, number];
    facet: number;
    ink: readonly [number, number, number];
    pearl: readonly [number, number, number];
    softness: number;
    span: number;
    warm: readonly [number, number, number];
  }
>;

interface SweepPlayback {
  cancel: () => void;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const directionToShader = (direction: PrismSweepDirection) => {
  switch (direction) {
    case "right":
      return { axis: 0, forward: -1 };
    case "up":
      return { axis: 1, forward: 1 };
    case "down":
      return { axis: 1, forward: -1 };
    default:
      return { axis: 0, forward: 1 };
  }
};

const easePrismTravel = (progress: number) => {
  const clamped = clamp01(progress);
  return 1 - (1 - clamped) ** 3.35;
};

const easeOpacityOut = (progress: number) => {
  const clamped = clamp01(progress);
  return clamped * clamped * (3 - 2 * clamped);
};

interface ShaderController {
  destroy: () => void;
  getTravel: () => number;
  setDirection: (direction: PrismSweepDirection) => void;
  setOpacity: (opacity: number) => void;
  setRunning: (running: boolean) => void;
  setTone: (tone: PrismSweepTone) => void;
  setTravel: (travel: number) => void;
}

const createShaderController = (
  canvas: HTMLCanvasElement,
  direction: PrismSweepDirection,
  tone: PrismSweepTone,
): ShaderController | null => {
  const support = document.createElement("canvas").getContext("webgl");
  if (!support) {
    return null;
  }

  const cssWidth = canvas.style.width;
  const cssHeight = canvas.style.height;
  const rect = canvas.getBoundingClientRect();
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      alpha: true,
      antialias: false,
      canvas,
      depth: false,
      dpr: Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO),
      height: Math.max(1, rect.height),
      powerPreference: "low-power",
      premultipliedAlpha: true,
      stencil: false,
      webgl: 1,
      width: Math.max(1, rect.width),
    });
  } catch {
    return null;
  }

  const gl = renderer.gl;
  if (!gl) {
    return null;
  }
  canvas.style.width = cssWidth || "100%";
  canvas.style.height = cssHeight || "100%";

  const uniforms = {
    uAxis: { value: 0 },
    uBend: { value: 0.76 },
    uBloom: { value: 0.58 },
    uClock: { value: 0 },
    uCool: { value: [0.28, 0.78, 0.86] },
    uFacet: { value: 12 },
    uForward: { value: 1 },
    uInk: { value: [0.2, 0.16, 0.26] },
    uOpacity: { value: 0 },
    uPearl: { value: [0.94, 0.82, 0.9] },
    uResolution: { value: [canvas.width, canvas.height] },
    uSoftness: { value: 0.07 },
    uSpan: { value: 0.14 },
    uTravel: { value: 0 },
    uWarm: { value: [0.98, 0.28, 0.58] },
  };
  const program = new Program(gl, {
    depthTest: false,
    depthWrite: false,
    fragment: FRAGMENT_SHADER,
    uniforms,
    vertex: VERTEX_SHADER,
  });
  program.setBlendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const mesh = new Mesh(gl, {
    frustumCulled: false,
    geometry: new Triangle(gl),
    program,
  });

  const state = {
    direction,
    opacity: HIDDEN_OPACITY,
    running: false,
    startedAt: performance.now(),
    tone,
    travel: 0,
  };
  let frame = 0;
  let destroyed = false;

  const restoreStyle = () => {
    canvas.style.width = cssWidth || "100%";
    canvas.style.height = cssHeight || "100%";
  };

  const draw = () => {
    const box = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1, box.width), Math.max(1, box.height));
    restoreStyle();
    const directionUniforms = directionToShader(state.direction);
    const toneConfig = TONE_CONFIGS[state.tone];
    uniforms.uResolution.value = [canvas.width, canvas.height];
    uniforms.uClock.value = (performance.now() - state.startedAt) / 1000;
    uniforms.uTravel.value = state.travel;
    uniforms.uOpacity.value = state.opacity;
    uniforms.uAxis.value = directionUniforms.axis;
    uniforms.uForward.value = directionUniforms.forward;
    uniforms.uSpan.value = toneConfig.span;
    uniforms.uSoftness.value = toneConfig.softness;
    uniforms.uBend.value = toneConfig.bend;
    uniforms.uFacet.value = toneConfig.facet;
    uniforms.uBloom.value = toneConfig.bloom;
    uniforms.uInk.value = [toneConfig.ink[0], toneConfig.ink[1], toneConfig.ink[2]];
    uniforms.uPearl.value = [toneConfig.pearl[0], toneConfig.pearl[1], toneConfig.pearl[2]];
    uniforms.uWarm.value = [toneConfig.warm[0], toneConfig.warm[1], toneConfig.warm[2]];
    uniforms.uCool.value = [toneConfig.cool[0], toneConfig.cool[1], toneConfig.cool[2]];
    renderer.render({ frustumCull: false, scene: mesh });
  };

  const tick = () => {
    if (destroyed || !state.running) {
      return;
    }
    draw();
    frame = requestAnimationFrame(tick);
  };

  draw();

  return {
    destroy: () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      program.remove();
    },
    getTravel: () => state.travel,
    setDirection: (nextDirection) => {
      state.direction = nextDirection;
    },
    setOpacity: (opacity) => {
      state.opacity = clamp01(opacity);
    },
    setRunning: (running) => {
      state.running = running;
      cancelAnimationFrame(frame);
      if (running && !destroyed) {
        frame = requestAnimationFrame(tick);
        return;
      }
      draw();
    },
    setTone: (nextTone) => {
      state.tone = nextTone;
    },
    setTravel: (travel) => {
      state.travel = clamp01(travel);
    },
  };
};


const playFrameSweep = (
  controller: ShaderController,
  {
    direction,
    duration,
    midpoint,
    onComplete,
    onMidpoint,
    outroMs,
  }: {
    direction: PrismSweepDirection;
    duration: number;
    midpoint: number;
    onComplete: () => void;
    onMidpoint: () => void;
    outroMs: number;
  }
): SweepPlayback => {
  let animationFrame = 0;
  let midpointReached = false;
  let cancelled = false;
  const startedAt = performance.now();
  const startTravel = controller.getTravel();
  const sweepMs = Math.max(MIN_PHASE_MS, duration * (1 - startTravel));

  controller.setDirection(direction);
  controller.setOpacity(VISIBLE_OPACITY);

  const finishSweep = () => {
    const outroStartedAt = performance.now();

    const fadeOut = () => {
      if (cancelled) {
        return;
      }

      const outroRaw = clamp01((performance.now() - outroStartedAt) / outroMs);
      controller.setOpacity(VISIBLE_OPACITY * (1 - easeOpacityOut(outroRaw)));

      if (outroRaw < 1) {
        animationFrame = requestAnimationFrame(fadeOut);
        return;
      }

      controller.setOpacity(HIDDEN_OPACITY);
      controller.setTravel(0);
      onComplete();
    };

    animationFrame = requestAnimationFrame(fadeOut);
  };

  const advance = () => {
    if (cancelled) {
      return;
    }

    const raw = clamp01((performance.now() - startedAt) / sweepMs);
    const nextTravel = startTravel + (1 - startTravel) * easePrismTravel(raw);
    controller.setTravel(nextTravel);

    if (!(midpointReached || nextTravel < midpoint)) {
      midpointReached = true;
      onMidpoint();
    }

    if (raw < 1) {
      animationFrame = requestAnimationFrame(advance);
      return;
    }

    if (!midpointReached) {
      onMidpoint();
    }
    controller.setTravel(1);
    finishSweep();
  };

  animationFrame = requestAnimationFrame(advance);

  return {
    cancel: () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
    },
  };
};

/**
 * PrismSweepTransition — a frame-level route/state transition with a custom
 * faceted caustic shader tuned for SmoothUI previews.
 */
export function PrismSweepTransition({
  children,
  className,
  direction = "left",
  duration = DEFAULT_DURATION_MS,
  onRest,
  tone = "prism",
  transitionKey,
}: PrismSweepTransitionProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);
  const motionOn = useAnimationActive(hostRef);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playbackRef = useRef<SweepPlayback | null>(null);
  const controllerRef = useRef<ShaderController | null>(null);
  const runRef = useRef(false);
  const [renderedChildren, setRenderedChildren] = useState(children);
  const [isSweeping, setIsSweeping] = useState(false);
  const previousKey = useRef(transitionKey);

  useEffect(() => {
    runRef.current = motionOn && !prefersReducedMotion;
    controllerRef.current?.setRunning(runRef.current);
  }, [motionOn, prefersReducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const controller = createShaderController(canvas, direction, tone);
    controllerRef.current = controller;
    controller?.setRunning(runRef.current);
    return () => {
      playbackRef.current?.cancel();
      controller?.destroy();
      controllerRef.current = null;
    };
  }, [direction, tone]);

  useEffect(() => {
    if (previousKey.current === transitionKey) {
      queueMicrotask(() => setRenderedChildren(children));
      return;
    }

    previousKey.current = transitionKey;
    playbackRef.current?.cancel();

    if (prefersReducedMotion) {
      queueMicrotask(() => {
        setRenderedChildren(children);
        setIsSweeping(false);
        onRest?.();
      });
      return;
    }

    const controller = controllerRef.current;
    if (!controller) {
      queueMicrotask(() => {
        setRenderedChildren(children);
        setIsSweeping(false);
        onRest?.();
      });
      return;
    }

    queueMicrotask(() => setIsSweeping(true));
    playbackRef.current = playFrameSweep(controller, {
      direction,
      duration: Math.max(MIN_PHASE_MS, duration),
      midpoint: CONTENT_SWAP_RATIO,
      onComplete: () => {
        setIsSweeping(false);
        playbackRef.current = null;
        onRest?.();
      },
      onMidpoint: () => setRenderedChildren(children),
      outroMs: OUTRO_MS,
    });

    return () => {
      playbackRef.current?.cancel();
    };
  }, [
    children,
    direction,
    duration,
    onRest,
    prefersReducedMotion,
    transitionKey,
  ]);

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-background text-foreground",
        className
      )}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="prism-sweep-transition"
      data-sweeping={isSweeping ? "true" : "false"}
      ref={hostRef}
    >
      <div className="relative z-0">{renderedChildren}</div>
      <canvas
        className={cn(
          "pointer-events-none absolute inset-0 z-10 h-full w-full transition-opacity duration-75",
          isSweeping && !prefersReducedMotion ? "opacity-100" : "opacity-0"
        )}
        ref={canvasRef}
      />
    </div>
  );
}

