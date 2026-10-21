"use client"

// Ported from SmoothUI (MIT) — https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/orb/index.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { Geometry, Mesh, Program, Renderer } from "ogl"
import { useEffect, useRef, useState } from "react"

/**
 * A configurable WebGL2 orb: a lit sphere with colour marbling inside it.
 *
 * Two ideas carry the whole thing.
 *
 * The loop is seamless by construction, not by crossfade. Every point walks a
 * circle in a flow field whose angle advances by exactly one turn per loop, so
 * the displacement returns to where it started. Neighbouring points begin at
 * different angles, and that is what reads as swirling — offset the whole
 * domain by one shared vector instead and you get a pulse.
 *
 * Colour is mixed in OkLab. The midpoint between two stops stays clean instead
 * of going muddy through sRGB, each picked colour reproduces exactly at its own
 * stop, and the hue ripple is a real rotation in the a/b plane.
 *
 * Everything else is lighting on a sphere impostor: the normal is derived per
 * pixel from the distance to the centre, which is what lets a rim, a highlight
 * and a shaded side exist at all. A radial gradient has no surface, and that is
 * the entire difference between this and a coloured circle.
 *
 * Contains two public-domain pieces of prior art, marked at their definitions:
 * the MurmurHash3 finalizer (Austin Appleby) and the OkLab transform matrices
 * (Björn Ottosson).
 */

export interface OrbProps {
  /**
   * Rim dispersion. Splits the palette lookup per channel toward the edge, the
   * way a lens fringes.
   */
  aberration?: number;
  /** Which colour dominates. `0.5` is even; below favours the first stop. */
  balance?: number;
  /** Interior cell size. Small is busy, large is one slow swell. */
  blobScale?: number;
  /** Hue ripple through the palette. */
  chroma?: number;
  className?: string;
  /** Two to four stops. Two read as a material, four as iridescent. */
  colors?: string[];
  /** Lightness contrast around the midpoint. */
  contrast?: number;
  /** Seconds for one full, seamless loop. */
  duration?: number;
  /** How far the flow field carries the field over a loop. */
  flow?: number;
  /** A halo cast outside the silhouette. `0` is none. */
  glow?: number;
  /** Film grain. Also hides the banding large soft gradients show. */
  grain?: number;
  /** Internal scatter, offset away from the highlight. Fake subsurface. */
  inner?: number;
  /** Fresnel-driven hue rotation — thin-film sheen. */
  iridescence?: number;
  /** Light direction, x. */
  lightX?: number;
  /** Light direction, y. */
  lightY?: number;
  /** Freeze on the current frame. */
  paused?: boolean;
  /** Bends the noise lookup by the surface normal. */
  refraction?: number;
  /** Fresnel edge brightness. This is what reads as glass. */
  rim?: number;
  /** Blends the palette toward plain diffuse shading. */
  shading?: number;
  /** Rotates the palette. */
  shift?: number;
  /** Rendered size. Numbers are pixels. */
  size?: number | string;
  /** Edge feather. `0` still resolves to about 1.5 device pixels. */
  softness?: number;
  /** Specular highlight strength. */
  specular?: number;
  /** Strength of the second, nested warp — marbling rather than blobs. */
  turbulence?: number;
  /** Silhouette deformation, so the orb is a drop rather than a ball. */
  wobble?: number;
}

/** The editor's own defaults, which are a good orb rather than a neutral one. */
const DEFAULTS = {
  aberration: 0.8,
  balance: 0.5,
  blobScale: 3,
  chroma: 1,
  colors: ["#f25aed", "#ffffff"],
  contrast: 1,
  duration: 7,
  flow: 0.6,
  glow: 0,
  grain: 0.6,
  inner: 0.38,
  iridescence: 0,
  lightX: -0.6,
  lightY: -1,
  refraction: 0.25,
  rim: 1.3,
  shading: 0.05,
  shift: 0.23,
  softness: 0.005,
  specular: 0.2,
  turbulence: 0.4,
  wobble: 0,
} as const;

const MAX_STOPS = 4;
const MAX_DPR = 2;
const RGB_MAX = 255;
const SRGB_KNEE = 0.040_45;
const TAU = Math.PI * 2;
/** Ambient motion gains nothing from 120 Hz. */
const FRAME_CAP_MS = 1000 / 60;
const LIGHT_Z = 0.65;
const BALANCE_BASE = 5;

/* The covering triangle is built from gl_VertexID, so there is no vertex
   buffer and no attribute state to manage. */
const VERTEX = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp int;   // the hash needs full 32-bit ints

uniform vec2  uRes;
uniform float uPhase;
uniform vec3  uLab[4];
uniform float uCount;
uniform float uScaleN;
uniform float uFlow;
uniform float uTurb;
uniform float uShift;
uniform float uBalance;
uniform float uChroma;
uniform float uContrast;
uniform float uRim;
uniform float uSpec;
uniform float uInner;
uniform float uShading;
uniform float uRefract;
uniform float uIrid;
uniform float uAberr;
uniform float uGrain;
uniform float uSoft;
uniform float uWobble;
uniform float uGlow;
uniform vec3  uLight;

out vec4 fragColor;

const float TAU = 6.28318530718;
const float RAD = 0.86;         // sphere radius in uv units; the rest is glow room
const float RMAX = 1.0 / RAD;   // radius reached at the nearest canvas edge

/* MurmurHash3 finalizer, Austin Appleby, public domain. Exact at any lattice
   coordinate, so unlike a fract(sin(...)) hash it never bands as the input
   grows — which matters for the grain, whose input runs into the thousands. */
uint hashU(uint x) {
  x ^= x >> 16; x *= 0x85EBCA6Bu;
  x ^= x >> 13; x *= 0xC2B2AE35u;
  x ^= x >> 16;
  return x;
}
uint hashU2(uvec2 p) { return hashU(p.x * 0x9E3779B9u ^ hashU(p.y)); }
uint hashU3(uvec3 p) { return hashU(p.x * 0x9E3779B9u ^ hashU(p.y) ^ hashU(p.z) * 0x27D4EB2Fu); }
float rand2(ivec2 p) { return float(hashU2(uvec2(p + 4096)) >> 8) / 16777216.0; }
float rand3(ivec3 p) { return float(hashU3(uvec3(p + 4096)) >> 8) / 16777216.0; }

float vnoise(vec2 p) {
  ivec2 i = ivec2(floor(p));
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(rand2(i),               rand2(i + ivec2(1, 0)), u.x),
             mix(rand2(i + ivec2(0, 1)), rand2(i + ivec2(1, 1)), u.x), u.y);
}

float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int k = 0; k < 3; k++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return s / 0.875;
}

/* Each point walks its own circle, completing exactly one turn per loop. */
vec2 flowField(vec2 p) {
  float ang = TAU * vnoise(p + 11.3) + uPhase;
  float mag = 0.35 + 0.65 * vnoise(p + 27.9);
  return vec2(cos(ang), sin(ang)) * mag;
}

/* Fresnel-driven hue rotation in the a/b plane — thin-film sheen. */
vec3 iridesce(vec3 lab, float f) {
  float a = uIrid * f * -2.2;
  float c = cos(a), s = sin(a);
  return vec3(lab.x, c * lab.y - s * lab.z, s * lab.y + c * lab.z);
}

vec3 labRamp(float x) {
  float xx = clamp(x, 0.0, 1.0) * (uCount - 1.0);
  vec3 c = mix(uLab[0], uLab[1], clamp(xx, 0.0, 1.0));
  c = mix(c, uLab[2], clamp(xx - 1.0, 0.0, 1.0));
  c = mix(c, uLab[3], clamp(xx - 2.0, 0.0, 1.0));
  return c;
}

vec3 paletteLab(float t) {
  float x = pow(clamp(0.5 + 0.5 * cos(TAU * t), 0.0, 1.0), uBalance);
  vec3 lab = labRamp(x);
  float ang = TAU * (t * 2.0 + 0.123);
  lab.yz += 0.17 * uChroma * length(lab.yz) * vec2(sin(ang), cos(ang * 1.37 + 1.1));
  /* Cap to roughly the sRGB chroma ceiling. Scaling a/b keeps the hue angle;
     overshooting and clamping RGB later posterises into flat patches. */
  float ch = length(lab.yz);
  if (ch > 0.33) { lab.yz *= 0.33 / ch; }
  lab.x = clamp(0.5 + (lab.x - 0.5) * uContrast, 0.0, 1.0);
  return lab;
}

/* OkLab transform, Björn Ottosson, public domain. */
vec3 oklabToLinear(vec3 c) {
  float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  vec3 lms = vec3(l_ * l_ * l_, m_ * m_ * m_, s_ * s_ * s_);
  return mat3( 4.0767416621, -1.2684380046, -0.0041960863,
              -3.3077115913,  2.6097574011, -0.7034186147,
               0.2309699292, -0.3413193965,  1.7076147010) * lms;
}

vec3 linearToSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  vec3 lo = c * 12.92;
  vec3 hi = 1.055 * pow(max(c, 1e-5), vec3(1.0 / 2.4)) - 0.055;
  return mix(lo, hi, step(0.0031308, c));
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / min(uRes.x, uRes.y);
  uv /= RAD;

  /* Silhouette wobble. Integer harmonics of the angle keep it continuous all
     the way round; integer multiples of the phase keep it periodic in time.
     Faded in with radius so the rim deforms like a drop while the core stays
     put — which also keeps it away from atan()'s singularity at the centre. */
  if (uWobble > 0.0) {
    float r0 = length(uv);
    float th = atan(uv.y, uv.x + 1e-6);
    float wob = 0.60 * sin(3.0 * th + uPhase)
              + 0.40 * sin(5.0 * th - 2.0 * uPhase)
              + 0.25 * sin(7.0 * th + 3.0 * uPhase);
    uv *= 1.0 - uWobble * 0.055 * wob * smoothstep(0.0, 0.5, r0);
  }

  float r = length(uv);
  vec2 pd = uv / max(r, 1.0);
  float z = sqrt(max(1.0 - dot(pd, pd), 0.0));
  vec3 n = vec3(pd, z);

  /* Domain warping. The base fBm is static; all the motion comes from warping
     its input through the looping flow field, and nesting a second warp is
     what turns smooth blobs into marbled, ink-in-water flow. */
  vec2 p0 = (pd - n.xy * uRefract) * uScaleN;
  vec2 p1 = p0 + uFlow * flowField(p0);
  vec2 p2 = p1 + uTurb * flowField(p1 * 1.7 + 5.2);
  float t = mix(0.5, fbm(p2 + 3.7), 1.35) + uShift;

  float fres3 = pow(1.0 - n.z, 3.0);
  vec3 lab = iridesce(paletteLab(t), fres3);

  vec3 base;
  if (uAberr > 0.001) {
    // Dispersion: the palette lookup shifts per channel, strongest at the rim.
    float d = uAberr * 0.05 * r * r;
    base = vec3(oklabToLinear(iridesce(paletteLab(t - d), fres3)).r,
                oklabToLinear(lab).g,
                oklabToLinear(iridesce(paletteLab(t + d), fres3)).b);
  } else {
    base = oklabToLinear(lab);
  }
  base = max(base, 0.0);

  // Lighting is added in linear light, which is where it belongs.
  vec3 L = normalize(uLight);
  vec3 col = mix(base, vec3(clamp(dot(n, L), 0.0, 1.0)), uShading);

  // Internal scatter offset away from the highlight: a translucent body rather
  // than a lit opaque ball.
  vec2 op = pd + L.xy * 0.45;
  col += uInner * exp(-dot(op, op) * 2.2) * base;

  vec3 half_ = normalize(L + vec3(0.0, 0.0, 1.0));
  col += pow(1.0 - n.z, 8.0) * uRim
       + pow(max(dot(n, half_), 0.0), 24.3) * uSpec;

  vec3 lit = linearToSrgb(col);
  vec3 flat_ = linearToSrgb(base);

  // Never thinner than ~1.5 device px, so the rim stays smooth when the
  // character is rendered small.
  float w = max(uSoft, 1.5 * fwidth(r));
  float body = 1.0 - smoothstep(1.0 - w, 1.0, r);

  /* The halo has to reach exactly zero before the canvas boundary. Left alone
     it is still ~1.5/255 at the edge and gets cut off square, which shows the
     canvas box as a faint rectangle around the orb. */
  float glowF = uGlow * exp(-max(r - 1.0, 0.0) * 20.0);
  glowF *= 1.0 - smoothstep(0.45, 1.0, (r - 1.0) / (RMAX - 1.0));
  float alpha = clamp(body + glowF * (1.0 - body), 0.0, 1.0);

  vec3 outCol = mix(flat_, lit, body);

  // Grain plus an always-on deband dither, stepped to 24 frames per loop so it
  // animates without breaking the seam.
  int frame = int(uPhase / TAU * 24.0);
  outCol += (rand3(ivec3(ivec2(gl_FragCoord.xy), frame)) - 0.5)
          * (uGrain * 0.1 + 1.0 / 255.0);

  outCol = clamp(outCol, 0.0, 1.0);
  fragColor = vec4(outCol * alpha, alpha);   // premultiplied
}`;

/**
 * Any CSS colour to OkLab, in two steps because neither alone is enough.
 *
 * `getComputedStyle` resolves `var()` and named colours, but Chrome hands back
 * `oklch(0.72 0.21 322)` verbatim rather than converting it — read that as three
 * sRGB channels and a magenta comes out blue. A 1x1 2D canvas rasterises
 * whatever syntax survives into actual pixels, which is the only step that
 * cannot lie about the result.
 */
const cssToOklab = (input: string): [number, number, number] => {
  const probe = document.createElement("span");
  probe.style.color = input;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();

  const surface = document.createElement("canvas");
  surface.width = 1;
  surface.height = 1;
  const ctx = surface.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return [1, 0, 0];
  }
  ctx.fillStyle = resolved;
  ctx.fillRect(0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;
  const r8 = pixel[0] ?? 0;
  const g8 = pixel[1] ?? 0;
  const b8 = pixel[2] ?? 0;

  // biome-ignore-start lint/style/useNumericSeparators: published colour-space constants, kept digit-for-digit against the reference
  const linear = [r8, g8, b8].map((channel) => {
    const u = channel / RGB_MAX;
    return u <= SRGB_KNEE ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4;
  });
  const r = linear[0] ?? 0;
  const g = linear[1] ?? 0;
  const b = linear[2] ?? 0;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
  // biome-ignore-end lint/style/useNumericSeparators: published colour-space constants
};

interface OrbUniform {
  value: number | number[];
}

interface OrbUniforms {
  uAberr: OrbUniform;
  uBalance: OrbUniform;
  uChroma: OrbUniform;
  uContrast: OrbUniform;
  uCount: OrbUniform;
  uFlow: OrbUniform;
  uGlow: OrbUniform;
  uGrain: OrbUniform;
  uInner: OrbUniform;
  uIrid: OrbUniform;
  uLab: OrbUniform;
  uLight: OrbUniform;
  uPhase: OrbUniform;
  uRefract: OrbUniform;
  uRes: OrbUniform;
  uRim: OrbUniform;
  uScaleN: OrbUniform;
  uShading: OrbUniform;
  uShift: OrbUniform;
  uSoft: OrbUniform;
  uSpec: OrbUniform;
  uTurb: OrbUniform;
  uWobble: OrbUniform;
}

interface OrbController {
  destroy: () => void;
  freeze: () => void;
  setRunning: (running: boolean) => void;
  sync: () => void;
}

const createOrb = (
  canvas: HTMLCanvasElement,
  configRef: { current: Partial<OrbProps> },
): OrbController | null => {
  const support = document.createElement("canvas").getContext("webgl2");
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
      dpr: Math.min(window.devicePixelRatio || 1, MAX_DPR),
      height: Math.max(1, rect.height),
      powerPreference: "low-power",
      premultipliedAlpha: true,
      stencil: false,
      webgl: 2,
      width: Math.max(1, rect.width),
    });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  if (!gl || !renderer.isWebgl2) {
    return null;
  }
  canvas.style.width = cssWidth || "100%";
  canvas.style.height = cssHeight || "100%";

  const lab = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0];
  const uniforms: OrbUniforms = {
    uAberr: { value: DEFAULTS.aberration },
    uBalance: { value: 1 },
    uChroma: { value: DEFAULTS.chroma },
    uContrast: { value: DEFAULTS.contrast },
    uCount: { value: 2 },
    uFlow: { value: DEFAULTS.flow },
    uGlow: { value: DEFAULTS.glow },
    uGrain: { value: DEFAULTS.grain },
    uInner: { value: DEFAULTS.inner },
    uIrid: { value: DEFAULTS.iridescence },
    uLab: { value: lab },
    uLight: { value: [DEFAULTS.lightX, DEFAULTS.lightY, LIGHT_Z] },
    uPhase: { value: 0 },
    uRefract: { value: DEFAULTS.refraction },
    uRes: { value: [canvas.width, canvas.height] },
    uRim: { value: DEFAULTS.rim },
    uScaleN: { value: 1 },
    uShading: { value: DEFAULTS.shading },
    uShift: { value: DEFAULTS.shift },
    uSoft: { value: DEFAULTS.softness },
    uSpec: { value: DEFAULTS.specular },
    uTurb: { value: DEFAULTS.turbulence },
    uWobble: { value: DEFAULTS.wobble },
  };
  const program = new Program(gl, {
    depthTest: false,
    depthWrite: false,
    fragment: FRAGMENT,
    uniforms,
    vertex: VERTEX,
  });
  const geometry = new Geometry(gl, {
    position: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1]) },
  });
  const mesh = new Mesh(gl, { frustumCulled: false, geometry, program });

  const pushConfig = () => {
    const current = configRef.current;
    const stops = (current.colors ?? DEFAULTS.colors).slice(0, MAX_STOPS);
    const last = stops[stops.length - 1] ?? DEFAULTS.colors[1] ?? "#ffffff";
    for (let i = 0; i < MAX_STOPS; i += 1) {
      const [x, y, z] = cssToOklab(stops[i] ?? last);
      lab[i * 3] = x;
      lab[i * 3 + 1] = y;
      lab[i * 3 + 2] = z;
    }
    uniforms.uCount.value = Math.max(2, Math.min(stops.length, MAX_STOPS));
    uniforms.uScaleN.value = 1.45 / Math.max(current.blobScale ?? DEFAULTS.blobScale, 0.05);
    uniforms.uFlow.value = current.flow ?? DEFAULTS.flow;
    uniforms.uTurb.value = current.turbulence ?? DEFAULTS.turbulence;
    uniforms.uShift.value = current.shift ?? DEFAULTS.shift;
    uniforms.uBalance.value = BALANCE_BASE ** ((0.5 - (current.balance ?? DEFAULTS.balance)) * 2);
    uniforms.uChroma.value = current.chroma ?? DEFAULTS.chroma;
    uniforms.uContrast.value = current.contrast ?? DEFAULTS.contrast;
    uniforms.uRim.value = current.rim ?? DEFAULTS.rim;
    uniforms.uSpec.value = current.specular ?? DEFAULTS.specular;
    uniforms.uInner.value = current.inner ?? DEFAULTS.inner;
    uniforms.uShading.value = current.shading ?? DEFAULTS.shading;
    uniforms.uRefract.value = current.refraction ?? DEFAULTS.refraction;
    uniforms.uIrid.value = current.iridescence ?? DEFAULTS.iridescence;
    uniforms.uAberr.value = current.aberration ?? DEFAULTS.aberration;
    uniforms.uGrain.value = current.grain ?? DEFAULTS.grain;
    uniforms.uSoft.value = current.softness ?? DEFAULTS.softness;
    uniforms.uWobble.value = current.wobble ?? DEFAULTS.wobble;
    uniforms.uGlow.value = current.glow ?? DEFAULTS.glow;
    uniforms.uLight.value = [current.lightX ?? DEFAULTS.lightX, current.lightY ?? DEFAULTS.lightY, LIGHT_Z];
  };

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1, box.width), Math.max(1, box.height));
    canvas.style.width = cssWidth || "100%";
    canvas.style.height = cssHeight || "100%";
    uniforms.uRes.value = [canvas.width, canvas.height];
  };

  const draw = () => {
    renderer.render({ frustumCull: false, scene: mesh });
  };

  let phase = 0;
  let pending = 0;
  let last = 0;
  let raf = 0;
  let running = false;
  let destroyed = false;
  let wantsRun = false;

  const tick = (now: number) => {
    if (destroyed || !running) {
      return;
    }
    raf = requestAnimationFrame(tick);
    const dt = last ? Math.min(now - last, 100) : FRAME_CAP_MS;
    last = now;
    pending += dt;
    if (pending < FRAME_CAP_MS - dt * 0.5) {
      return;
    }
    phase = (phase + pending / 1000 / (configRef.current.duration ?? DEFAULTS.duration)) % 1;
    pending = 0;
    uniforms.uPhase.value = phase * TAU;
    draw();
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const start = () => {
    if (running || destroyed || !wantsRun || configRef.current.paused) {
      return;
    }
    running = true;
    last = 0;
    pending = 0;
    raf = requestAnimationFrame(tick);
  };

  pushConfig();
  resize();
  uniforms.uPhase.value = 0;
  draw();

  const observer = new ResizeObserver(() => {
    resize();
    if (!running) {
      draw();
    }
  });
  observer.observe(canvas);

  return {
    destroy: () => {
      destroyed = true;
      stop();
      observer.disconnect();
      program.remove();
    },
    freeze: () => {
      wantsRun = false;
      stop();
      phase = 0;
      uniforms.uPhase.value = 0;
      draw();
    },
    setRunning: (next) => {
      wantsRun = next;
      if (!next || configRef.current.paused) {
        stop();
        uniforms.uPhase.value = phase * TAU;
        draw();
        return;
      }
      start();
    },
    sync: () => {
      pushConfig();
      if (configRef.current.paused) {
        stop();
      } else if (wantsRun) {
        start();
      }
      if (!running) {
        draw();
      }
    },
  };
};

export function Orb({ className, size = 240, paused = false, ...rest }: OrbProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const motionOn = useAnimationActive(hostRef);
  const [supported, setSupported] = useState(true);
  const controllerRef = useRef<OrbController | null>(null);
  const runRef = useRef(false);
  const config = useRef({ ...DEFAULTS, ...rest, paused });

  useEffect(() => {
    runRef.current = motionOn && !prefersReducedMotion && !paused;
    const controller = controllerRef.current;
    if (!controller) {
      return;
    }
    if (prefersReducedMotion) {
      controller.freeze();
      return;
    }
    controller.setRunning(runRef.current);
  }, [motionOn, paused, prefersReducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const controller = createOrb(canvas, config as { current: Partial<OrbProps> });
    if (!controller) {
      queueMicrotask(() => setSupported(false));
      return;
    }
    controllerRef.current = controller;
    queueMicrotask(() => setSupported(true));
    if (prefersReducedMotion) {
      controller.freeze();
    } else {
      controller.setRunning(runRef.current);
    }
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
    // The GL program is created once. Prop changes go through config.current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    config.current = { ...DEFAULTS, ...rest, paused };
    controllerRef.current?.sync();
  });

  const dimension = typeof size === "number" ? `${size}px` : size;
  const stops = (rest.colors ?? DEFAULTS.colors).slice(0, MAX_STOPS);

  return (
    <div
      className={cn("block", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="orb"
      ref={hostRef}
      style={{ height: dimension, width: dimension }}
    >
      {supported ? (
        <canvas aria-hidden="true" className="block h-full w-full" ref={canvasRef} tabIndex={-1} />
      ) : (
        <div
          aria-hidden="true"
          className="block h-full w-full rounded-full"
          style={{
            backgroundImage: `radial-gradient(circle at 32% 28%, ${stops.join(", ")})`,
          }}
        />
      )}
    </div>
  );
}
