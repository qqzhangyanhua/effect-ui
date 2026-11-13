// @vitest-environment jsdom

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import {
  clampGlassIntensity,
  clampGlassSize,
  clampGlassSpeed,
  glassBackdrop,
  glassBend,
  glassDrift,
  glassRadiusUv,
  glassShift,
  GlassRefractHero,
} from "./glass-refract-hero"
import {
  clampVoiceSpeed,
  clampVoiceVolume,
  voiceOrbAmplitude,
  voiceOrbState,
  VoiceOrb,
} from "./voice-orb"

function installMedia(options: { reduced?: boolean } = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: options.reduced === true && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
    onchange: null,
  }))
}

function follows(earlier: Element, later: Element) {
  return (earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
}

function idleContext(): WebGLRenderingContext {
  const gl = {
    createShader() {
      return {}
    },
    drawArrays() {},
    getExtension() {
      return null
    },
    createBuffer() {
      return {}
    },
    bindBuffer() {},
    bufferData() {},
    deleteBuffer() {},
    ARRAY_BUFFER: 34962,
    STATIC_DRAW: 35044,
  }
  return gl as unknown as WebGLRenderingContext
}

beforeEach(() => {
  installMedia()
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => null)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test("玻璃体的半径、漂移、弯折和色散是固定字面量", () => {
  expect(clampGlassSpeed(1)).toBe(1)
  expect(clampGlassSpeed(0)).toBe(0.25)
  expect(clampGlassSpeed(4)).toBe(2.5)
  expect(clampGlassSpeed(Number.NaN)).toBe(1)
  expect(clampGlassIntensity(0.45)).toBe(0.45)
  expect(clampGlassIntensity(-0.2)).toBe(0)
  expect(clampGlassIntensity(1.4)).toBe(1)
  expect(clampGlassIntensity(Number.NaN)).toBe(0.45)
  expect(clampGlassSize(180)).toBe(180)
  expect(clampGlassSize(8)).toBe(72)
  expect(clampGlassSize(900)).toBe(320)
  expect(clampGlassSize(Number.NaN)).toBe(180)
  expect(glassRadiusUv(180, 360, 180)).toEqual({ x: 0.25, y: 0.5 })
  expect(glassRadiusUv(8, 200, 100)).toEqual({ x: 0.18, y: 0.36 })
  expect(glassRadiusUv(900, 100, 50)).toEqual({ x: 1.6, y: 3.2 })
  expect(glassDrift(0, 1)).toEqual({ x: 0, y: 0.05 })
  expect(glassDrift(0, 9)).toEqual({ x: 0, y: 0.05 })
  expect(glassDrift(Math.PI / 2, 1).x).toBeCloseTo(0.08, 12)
  expect(glassDrift(Math.PI / 2, 1).y).toBeCloseTo(0, 10)
  expect(glassDrift(Math.PI / 2, 2).x).toBeCloseTo(0, 10)
  expect(glassDrift(Math.PI / 2, 2).y).toBeCloseTo(-0.05, 10)
  expect(glassBend(0)).toBe(0)
  expect(glassBend(0.5)).toBe(0.0625)
  expect(glassBend(1)).toBe(0.125)
  expect(glassBend(2)).toBe(0.125)
  expect(glassShift(0)).toBe(0)
  expect(glassShift(0.5)).toBe(0.015625)
  expect(glassShift(1)).toBe(0.03125)
  expect(glassBackdrop(undefined, false)).toBe("procedural")
  expect(glassBackdrop("  ", false)).toBe("procedural")
  expect(glassBackdrop("/pane.png", false)).toBe("image")
  expect(glassBackdrop("/pane.png", true)).toBe("procedural")
})

test("没有 WebGL 时停在静帧，后景保持程序化", async () => {
  const view = render(<GlassRefractHero className="extra-glass" size={96} />)
  await waitFor(() => {
    expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  })
  const root = view.container.querySelector("[data-slot='glass-refract-hero']")
  expect(root).toHaveClass("extra-glass")
  expect(root).toHaveAttribute("data-backdrop", "procedural")
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.container.querySelector("[data-glass='body']")).toHaveStyle({ width: "96px", height: "96px" })
})

test("减弱动效不挂 canvas", () => {
  installMedia({ reduced: true })
  const view = render(<GlassRefractHero />)
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  expect(view.container.querySelector("[data-glass='body']")).toHaveStyle({ width: "180px", height: "180px" })
})

test("内容排在画布之后", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => idleContext())
  vi.stubGlobal("requestAnimationFrame", () => 1)
  vi.stubGlobal("cancelAnimationFrame", () => {})
  const view = render(
    <GlassRefractHero>
      <span>North aisle</span>
    </GlassRefractHero>,
  )
  const canvas = view.container.querySelector("canvas")
  const copy = view.getByText("North aisle")
  expect(canvas).not.toBeNull()
  expect(view.container.querySelector("[data-fallback='still']")).toBeNull()
  if (!canvas) return
  expect(follows(canvas, copy)).toBe(true)
})

test("坏掉的图片地址不抛，仍然用程序化后景", async () => {
  class BrokenImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_value: string) {
      this.onerror?.()
    }
  }
  vi.stubGlobal("Image", BrokenImage)
  const view = render(<GlassRefractHero src="/missing.png" />)
  await waitFor(() => {
    expect(view.container.querySelector("[data-slot='glass-refract-hero']")).toHaveAttribute("data-backdrop", "procedural")
  })
  expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
})

test("glass-refract-hero 在 batch 92，页面分类，默认预设等于起始值", () => {
  const entry = getComponent("glass-refract-hero")
  expect(entry?.batch).toBe(92)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("page")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).map((prop) => prop.name)).toEqual(["speed", "intensity", "size"])
  expect(entry?.props.find((prop) => prop.name === "src")?.control).toBeUndefined()
  expect(auditExemptions.some((item) => item.name === "glass-refract-hero")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values.speed).toBe(1)
  expect(preset?.values.intensity).toBe(0.45)
  expect(preset?.values.size).toBe(180)
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control) || prop.control.value === undefined) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  expect(entry?.files?.map((file) => file.target)).toEqual([
    "components/ui/glass-refract-hero.tsx",
    "components/ui/gl/gl-loop.tsx",
  ])
  const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "glass-refract-hero.tsx"), "utf8")
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).toMatch(/mountGlLoop/)
  expect(source).toMatch(/original implementation/)
  expect(source).not.toMatch(/documentElement/)
  expect(source).not.toMatch(/\bpace\b/)
})

test("语音球的四个状态都吃进音量，播报更明显", () => {
  expect(voiceOrbState("idle")).toBe("idle")
  expect(voiceOrbState("listen")).toBe("listen")
  expect(voiceOrbState("think")).toBe("think")
  expect(voiceOrbState("speak")).toBe("speak")
  expect(voiceOrbState("nope")).toBe("idle")
  expect(voiceOrbState(undefined)).toBe("idle")
  expect(clampVoiceSpeed(1)).toBe(1)
  expect(clampVoiceSpeed(0)).toBe(0.25)
  expect(clampVoiceSpeed(4)).toBe(2.5)
  expect(clampVoiceSpeed(Number.NaN)).toBe(1)
  expect(clampVoiceVolume(0)).toBe(0)
  expect(clampVoiceVolume(1)).toBe(1)
  expect(clampVoiceVolume(2)).toBe(1)
  expect(clampVoiceVolume(-0.2)).toBe(0)
  expect(clampVoiceVolume(Number.NaN)).toBe(0)
  expect(voiceOrbAmplitude("idle", 0)).toBe(0.75)
  expect(voiceOrbAmplitude("idle", 0.5)).toBe(0.875)
  expect(voiceOrbAmplitude("idle", 1)).toBe(1)
  expect(voiceOrbAmplitude("listen", 0)).toBe(0.75)
  expect(voiceOrbAmplitude("listen", 1)).toBe(1)
  expect(voiceOrbAmplitude("think", 0)).toBe(0.75)
  expect(voiceOrbAmplitude("think", 1)).toBe(1)
  expect(voiceOrbAmplitude("speak", 0)).toBe(0.75)
  expect(voiceOrbAmplitude("speak", 0.5)).toBe(1)
  expect(voiceOrbAmplitude("speak", 1)).toBe(1.25)
  expect(voiceOrbAmplitude("speak", 1)).toBeGreaterThan(voiceOrbAmplitude("idle", 1))
  expect(voiceOrbAmplitude("speak", Number.NaN)).toBe(0.75)
  expect(voiceOrbAmplitude("speak", 2)).toBe(1.25)
  expect(voiceOrbAmplitude("speak", -1)).toBe(0.75)
})

test("voice-orb 切换状态，四个状态都按音量改幅度", () => {
  const view = render(<VoiceOrb volume={1} />)
  const root = () => view.container.querySelector("[data-slot='voice-orb']")
  expect(view.getByText("Idle")).toBeInTheDocument()
  expect(root()).toHaveAttribute("data-state", "idle")
  expect(root()).toHaveAttribute("data-amplitude", "1")
  expect(root()).toHaveAttribute("data-motion", "run")
  expect(view.container.querySelector("svg")).toHaveAttribute("data-animated", "on")

  view.rerender(<VoiceOrb state="idle" volume={0} />)
  expect(root()).toHaveAttribute("data-amplitude", "0.75")

  view.rerender(<VoiceOrb state="listen" volume={0} />)
  expect(view.getByText("Listening")).toBeInTheDocument()
  expect(root()).toHaveAttribute("data-state", "listen")
  expect(root()).toHaveAttribute("data-amplitude", "0.75")

  view.rerender(<VoiceOrb state="listen" volume={1} />)
  expect(root()).toHaveAttribute("data-amplitude", "1")

  view.rerender(<VoiceOrb state="think" volume={1} />)
  expect(view.getByText("Thinking")).toBeInTheDocument()
  expect(root()).toHaveAttribute("data-state", "think")
  expect(root()).toHaveAttribute("data-amplitude", "1")

  view.rerender(<VoiceOrb state="speak" volume={0} />)
  expect(view.getByText("Speaking")).toBeInTheDocument()
  expect(root()).toHaveAttribute("data-state", "speak")
  expect(root()).toHaveAttribute("data-amplitude", "0.75")

  view.rerender(<VoiceOrb state="speak" volume={1} className="extra-orb" />)
  expect(root()).toHaveAttribute("data-amplitude", "1.25")
  expect(root()).toHaveClass("extra-orb")
})

test("voice-orb 减弱动效时停在静帧", () => {
  installMedia({ reduced: true })
  const view = render(<VoiceOrb state="speak" volume={1} />)
  const root = view.container.querySelector("[data-slot='voice-orb']")
  expect(root).toHaveAttribute("data-motion", "still")
  expect(root).toHaveAttribute("data-state", "speak")
  expect(root).toHaveAttribute("data-amplitude", "1.25")
  expect(view.container.querySelector("svg")).toHaveAttribute("data-animated", "off")
  expect(view.getByText("Speaking")).toBeInTheDocument()
})

test("voice-orb 在 batch 92，微交互，默认预设等于起始值", () => {
  const entry = getComponent("voice-orb")
  expect(entry?.batch).toBe(92)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("micro")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).map((prop) => prop.name)).toEqual(["speed", "volume", "state"])
  expect(entry?.props.some((prop) => prop.name === "intensity")).toBe(false)
  expect(entry?.props.find((prop) => prop.name === "volume")?.control).toMatchObject({
    kind: "range",
    value: 0.5,
    min: 0,
    max: 1,
  })
  expect(entry?.props.find((prop) => prop.name === "state")?.control).toMatchObject({
    kind: "select",
    value: "idle",
    options: ["idle", "listen", "think", "speak"],
  })
  expect(auditExemptions.some((item) => item.name === "voice-orb")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values.speed).toBe(1)
  expect(preset?.values.volume).toBe(0.5)
  expect(preset?.values.state).toBe("idle")
  expect(preset?.values.intensity).toBeUndefined()
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control) || prop.control.value === undefined) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  const demoFile = fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "../examples/effect-demos-94.tsx"),
    "utf8",
  )
  const voiceDemo = demoFile.slice(demoFile.indexOf("function VoiceOrbDemo"))
  expect(voiceDemo).toContain("volume = 0.5")
  expect(voiceDemo).toContain("volume={volume}")
  expect(voiceDemo).not.toContain("intensity")
  expect(entry?.files?.some((file) => file.file.includes("gl-loop")) ?? false).toBe(false)
  const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "voice-orb.tsx"), "utf8")
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).toMatch(/original implementation/)
  expect(source).not.toMatch(/gl-loop/)
  expect(source).not.toMatch(/from ["']ogl["']/)
  expect(source).not.toMatch(/from ["']three["']/)
  expect(source).not.toMatch(/documentElement/)
  expect(source).not.toMatch(/\bpace\b/)
})
