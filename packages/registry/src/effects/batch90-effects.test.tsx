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
import {
  dyeWeight,
  fieldPattern,
  grayScottStep,
  patternRates,
  ReactionDiffusionField,
  seedChemicals,
  stepsForFrame,
} from "./reaction-diffusion-field"

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

test("Gray-Scott 按喂料和清除走一步，速度决定每帧步数", () => {
  expect(patternRates("spots")).toEqual({ feed: 0.035, kill: 0.065 })
  expect(patternRates("print")).toEqual({ feed: 0.037, kill: 0.06 })
  expect(patternRates("coral")).toEqual({ feed: 0.0545, kill: 0.062 })
  expect(fieldPattern(undefined)).toBe("spots")
  expect(fieldPattern("print")).toBe("print")
  expect(fieldPattern("coral")).toBe("coral")
  expect(fieldPattern("mask")).toBe("spots")
  expect(grayScottStep(0.5, 0.25, 0.125, -0.25, { feed: 0.03125, kill: 0.0625 }, 1, 1)).toEqual({
    u: 0.504375,
    v: 0.2378125,
  })
  expect(grayScottStep(0.5, 0.25, 0.125, -0.25, { feed: 0.03125, kill: 0.0625 }, 1, 0)).toEqual({
    u: 0.52,
    v: 0.23,
  })
  expect(grayScottStep(0.5, 0.25, 0.125, -0.25, { feed: 0.03125, kill: 0.0625 }, 0, 1)).toEqual({
    u: 0.5,
    v: 0.25,
  })
  expect(grayScottStep(0, 0, -8, 0, { feed: 0.03125, kill: 0.0625 }, 1, 0)).toEqual({ u: 0, v: 0 })
  expect(stepsForFrame(1, 0)).toBe(0)
  expect(stepsForFrame(1, 1 / 60)).toBe(4)
  expect(stepsForFrame(0.25, 1 / 60)).toBe(1)
  expect(stepsForFrame(2.5, 0.05)).toBe(16)
  expect(stepsForFrame(1, 0.001)).toBe(1)
  expect(dyeWeight(1, 1)).toBe(1)
  expect(dyeWeight(1, 0)).toBe(0.25)
  expect(dyeWeight(0.5, 0.5)).toBe(0.3125)
  expect(dyeWeight(0, 1)).toBe(0)
})

test("斑点、指纹和珊瑚只从内置图案取种", () => {
  expect(seedChemicals("spots", 0.375, 0.375)).toEqual({ u: 0.5, v: 1 })
  expect(seedChemicals("spots", 0.4375, 0.375)).toEqual({ u: 0.5, v: 1 })
  expect(seedChemicals("spots", 0, 0)).toEqual({ u: 1, v: 0 })
  expect(seedChemicals("print", 0.5, 0.375)).toEqual({ u: 0.5, v: 1 })
  expect(seedChemicals("print", 0.5, 0.3125)).toEqual({ u: 1, v: 0 })
  expect(seedChemicals("print", 0, 0)).toEqual({ u: 1, v: 0 })
  expect(seedChemicals("coral", 0.5, 0.5)).toEqual({ u: 0.5, v: 1 })
  expect(seedChemicals("coral", 0.25, 0.25)).toEqual({ u: 0.5, v: 1 })
  expect(seedChemicals("coral", 0, 0)).toEqual({ u: 1, v: 0 })
})

test("没有 WebGL 时反应扩散停在静帧", async () => {
  const view = render(<ReactionDiffusionField className="extra-field" pattern="coral" />)
  await waitFor(() => {
    expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  })
  const root = view.container.querySelector("[data-slot='reaction-diffusion-field']")
  expect(root).toHaveClass("extra-field")
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.getByText("Pattern at rest")).toBeInTheDocument()
})

test("减弱动效时反应扩散不挂 canvas", () => {
  installMedia({ reduced: true })
  const view = render(<ReactionDiffusionField />)
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  expect(view.getByText("Pattern at rest")).toBeInTheDocument()
})

test("reaction-diffusion-field 在 batch 90 的背景分类，默认预设不抄跟随主题的颜色", () => {
  const entry = getComponent("reaction-diffusion-field")
  expect(entry?.batch).toBe(90)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("backgrounds")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).length).toBeGreaterThanOrEqual(3)
  expect(auditExemptions.some((item) => item.name === "reaction-diffusion-field")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values.pattern).toBe("spots")
  expect(preset?.values.speed).toBe(1)
  expect(preset?.values.intensity).toBe(0.75)
  expect(preset?.values.colors).toBeUndefined()
  const pattern = entry?.props.find((prop) => prop.name === "pattern")
  expect(pattern?.control).toEqual({ kind: "select", value: "spots", options: ["spots", "print", "coral"] })
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control)) continue
    if (prop.control.kind === "colors" && prop.control.follow) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  expect(entry?.files?.map((file) => file.target)).toEqual([
    "components/ui/reaction-diffusion-field.tsx",
    "components/ui/gl/gl-loop.tsx",
    "components/ui/reaction-diffusion-shaders.ts",
  ])
  const source = fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "reaction-diffusion-field.tsx"),
    "utf8",
  )
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).toMatch(/original implementation/)
  expect(source).not.toMatch(/documentElement/)
  expect(source).not.toMatch(/\bpace\b/)
})
