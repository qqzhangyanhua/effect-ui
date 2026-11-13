// @vitest-environment jsdom

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import { decayInk, FluidInkCursor, injectPointer } from "./fluid-ink-cursor"
import { cappedDpr, shouldDrawFrame } from "./gl/gl-loop"
import { advanceRipple, rippleDrop, rippleSubsteps, RippleRefractSurface } from "./ripple-refract-surface"

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

beforeEach(() => {
  installMedia()
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => null)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test("像素比封顶 1.5，离屏或页面隐藏时不画", () => {
  expect(cappedDpr(2)).toBe(1.5)
  expect(cappedDpr(1.25)).toBe(1.25)
  expect(cappedDpr(1)).toBe(1)
  expect(cappedDpr(0)).toBe(1)
  expect(shouldDrawFrame(true, true)).toBe(true)
  expect(shouldDrawFrame(false, true)).toBe(false)
  expect(shouldDrawFrame(true, false)).toBe(false)
  expect(shouldDrawFrame(false, false)).toBe(false)
})

test("墨量随时间消退，指针位移注入速度", () => {
  expect(decayInk(1, 1, 0)).toBe(1)
  expect(decayInk(1, 1, 1)).toBe(0.25)
  expect(decayInk(0.5, 2, 1)).toBe(0.1)
  expect(decayInk(0.0005, 1, 1)).toBe(0)
  expect(decayInk(0, 1, 1)).toBe(0)
  expect(injectPointer(0, null, { x: 0.25, y: 0.5 }, 1, 1)).toEqual({
    x: 0.25,
    y: 0.5,
    vx: 0,
    vy: 0,
    amount: 0.25,
  })
  expect(injectPointer(0.25, { x: 0, y: 0 }, { x: 0.5, y: 0 }, 1, 1)).toEqual({
    x: 0.5,
    y: 0,
    vx: 0.5,
    vy: 0,
    amount: 0.75,
  })
  expect(injectPointer(0.5, { x: 0, y: 0 }, { x: 1, y: 0 }, 2, 1)).toEqual({
    x: 1,
    y: 0,
    vx: 2,
    vy: 0,
    amount: 1,
  })
  expect(injectPointer(0.5, { x: 0, y: 0 }, { x: 0.5, y: 0 }, 1, 0)).toEqual({
    x: 0.5,
    y: 0,
    vx: 0,
    vy: 0,
    amount: 0.5,
  })
})

test("没有 WebGL 时停在静帧，不盖住视口，也不藏起系统光标", async () => {
  const view = render(<FluidInkCursor className="extra-ink" />)
  await waitFor(() => {
    expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  })
  const root = view.container.querySelector("[data-slot='fluid-ink-cursor']")
  expect(root).toHaveClass("extra-ink")
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.container.querySelector(".fixed")).toBeNull()
  expect(view.container.querySelector("[class*='cursor-none']")).toBeNull()
  expect(view.getByText("Ink at rest")).toBeInTheDocument()
})

test("减弱动效不挂 canvas", () => {
  installMedia({ reduced: true })
  const view = render(<FluidInkCursor />)
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  expect(view.getByText("Ink at rest")).toBeInTheDocument()
})

test("fluid-ink-cursor 在 batch 90，光标分类，默认预设不抄跟随主题的颜色", () => {
  const entry = getComponent("fluid-ink-cursor")
  expect(entry?.batch).toBe(90)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("cursor")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).length).toBeGreaterThanOrEqual(3)
  expect(auditExemptions.some((item) => item.name === "fluid-ink-cursor")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values.speed).toBe(1)
  expect(preset?.values.intensity).toBe(0.55)
  expect(preset?.values.colors).toBeUndefined()
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control)) continue
    if (prop.control.kind === "colors" && prop.control.follow) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  expect(entry?.files?.map((file) => file.target)).toEqual([
    "components/ui/fluid-ink-cursor.tsx",
    "components/ui/gl/gl-loop.tsx",
    "components/ui/fluid-ink-shaders.ts",
  ])
  const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "fluid-ink-cursor.tsx"), "utf8")
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).toMatch(/original implementation/)
  expect(source).not.toMatch(/documentElement/)
  expect(source).not.toMatch(/\bpace\b/)
})

test("波纹按邻域推进，点击比移动落得更重", () => {
  expect(advanceRipple(1, 0, 0, 0, 0, 1)).toBe(0.46875)
  expect(advanceRipple(0, 0, 0, 0, 1, 1)).toBe(-0.9375)
  expect(advanceRipple(1, 1, 1, 1, 0, 1)).toBe(1.875)
  expect(advanceRipple(0, 0, 0, 0, 0, 1)).toBe(0)
  expect(advanceRipple(0, 0, 0, 0, 0.00005, 1)).toBe(0)
  expect(advanceRipple(1, 0, 0, 0, 0, 0.25)).toBe(0.4921875)
  expect(advanceRipple(1, 0, 0, 0, 0, 2.5)).toBe(0.421875)
  expect(advanceRipple(2, 2, 2, 2, -2, 1)).toBe(2)
  expect(advanceRipple(0, 0, 0, 0, 0, Number.NaN)).toBe(0)
  expect(rippleDrop(1, "click")).toBe(0.5)
  expect(rippleDrop(1, "move")).toBe(0.25)
  expect(rippleDrop(0.5, "click")).toBe(0.25)
  expect(rippleDrop(0, "move")).toBe(0)
  expect(rippleDrop(2, "click")).toBe(0.5)
  expect(rippleDrop(Number.NaN, "move")).toBe(0)
  expect(rippleSubsteps(1)).toBe(1)
  expect(rippleSubsteps(0.25)).toBe(1)
  expect(rippleSubsteps(1.6)).toBe(2)
  expect(rippleSubsteps(2.5)).toBe(3)
  expect(rippleSubsteps(Number.NaN)).toBe(1)
})

test("没有 WebGL 时停在静帧，子节点仍在", async () => {
  const view = render(
    <RippleRefractSurface className="extra-ripple">
      <span>North basin</span>
    </RippleRefractSurface>,
  )
  await waitFor(() => {
    expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  })
  const root = view.container.querySelector("[data-slot='ripple-refract-surface']")
  expect(root).toHaveClass("extra-ripple")
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.getByText("North basin")).toBeInTheDocument()
})

test("减弱动效不挂 canvas，子节点仍在", () => {
  installMedia({ reduced: true })
  const view = render(
    <RippleRefractSurface>
      <span>North basin</span>
    </RippleRefractSurface>,
  )
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  expect(view.getByText("North basin")).toBeInTheDocument()
})

test("坏图片不抛，静帧和子节点都还在", async () => {
  class BrokenImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_value: string) {
      this.onerror?.()
    }
  }
  vi.stubGlobal("Image", BrokenImage)
  const view = render(
    <RippleRefractSurface src="missing-basin.png">
      <button type="button">North basin</button>
    </RippleRefractSurface>,
  )
  await waitFor(() => {
    expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  })
  expect(view.getByRole("button", { name: "North basin" })).toBeInTheDocument()
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.container.querySelector("img")).toBeNull()
})

test("ripple-refract-surface 在 batch 90，背景分类，默认预设不抄颜色", () => {
  const entry = getComponent("ripple-refract-surface")
  expect(entry?.batch).toBe(90)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("backgrounds")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).map((prop) => prop.name)).toEqual(["speed", "intensity", "color"])
  expect(entry?.props.find((prop) => prop.name === "color")?.control).toEqual({ kind: "color" })
  const src = entry?.props.find((prop) => prop.name === "src")
  expect(src).toBeDefined()
  expect(src?.control).toBeUndefined()
  expect(entry?.props.some((prop) => prop.name === "interactive")).toBe(false)
  expect(auditExemptions.some((item) => item.name === "ripple-refract-surface")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values).toEqual({ speed: 1, intensity: 0.5 })
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control)) continue
    if (prop.control.kind === "colors" && prop.control.follow) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  expect(entry?.files?.map((file) => file.target)).toEqual([
    "components/ui/ripple-refract-surface.tsx",
    "components/ui/gl/gl-loop.tsx",
  ])
  const source = fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "ripple-refract-surface.tsx"),
    "utf8",
  )
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).toMatch(/original implementation/)
  expect(source).toMatch(/mountGlLoop/)
  expect(source).not.toMatch(/documentElement/)
  expect(source).not.toMatch(/\bpace\b/)
})
