// @vitest-environment jsdom

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"

import {
  curtainBow,
  curtainDuration,
  curtainEdge,
  curtainIntensity,
  curtainPath,
  CurtainRouteTransition,
} from "./curtain-route-transition"
import {
  revealButtonSize,
  revealCenter,
  revealDuration,
  revealFill,
  revealRadius,
  revealStart,
  surfaceTokens,
  ThemeRevealToggle,
} from "./theme-reveal-toggle"

function installMedia(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
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

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='theme-reveal-toggle']")
  if (!(node instanceof HTMLElement)) throw new Error("missing theme-reveal-toggle")
  return node
}

const queued = new Map<number, FrameRequestCallback>()
let nextFrame = 1

function installFrames() {
  queued.clear()
  nextFrame = 1
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = nextFrame
    nextFrame += 1
    queued.set(id, callback)
    return id
  })
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    queued.delete(id)
  })
}

function drain(frames: number) {
  for (let index = 0; index < frames; index += 1) {
    const batch = [...queued.values()]
    queued.clear()
    if (batch.length === 0) return
    for (const callback of batch) callback(0)
  }
}

function curtainRoot(container: HTMLElement) {
  const node = container.querySelector("[data-slot='curtain-route-transition']")
  if (!(node instanceof HTMLElement)) throw new Error("missing curtain-route-transition")
  return node
}

function setStart(value: unknown) {
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    writable: true,
    value,
  })
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(document, "startViewTransition")
})

test("圆形揭示在接口可用且未减弱动效时交给 startViewTransition，否则立刻切换 dark", () => {
  expect(revealCenter({ left: 10, top: 20 }, { left: 30, top: 50, width: 40, height: 20 })).toEqual({ x: 40, y: 40 })
  expect(revealRadius(200, 100, 40, 40)).toBe(171)
  expect(revealStart(44)).toBe(22)
  expect(revealDuration(640)).toBe(640)
  expect(revealDuration(10)).toBe(240)
  expect(revealDuration(9000)).toBe(1400)
  expect(revealButtonSize(44)).toBe(44)
  expect(revealButtonSize(1)).toBe(28)
  expect(revealButtonSize(400)).toBe(72)
  expect(revealFill(undefined)).toBe("var(--primary)")
  expect(revealFill("  #336699 ")).toBe("#336699")
  expect(surfaceTokens(false)["--background"]).toBe("oklch(0.985 0.01 95)")
  expect(surfaceTokens(true)["--background"]).toBe("oklch(0.17 0.03 280)")
  expect(surfaceTokens(false)["--foreground"]).toBe("oklch(0.2 0.03 280)")
  expect(surfaceTokens(true)["--foreground"]).toBe("oklch(0.97 0.01 95)")

  installMedia(false)
  setStart(undefined)
  const hostClass = document.documentElement.className
  const hostStyle = document.documentElement.getAttribute("style")
  const immediate = render(<ThemeRevealToggle className="extra-surface" />)
  const immediateRoot = rootOf(immediate.container)
  expect(immediateRoot).toHaveClass("extra-surface")
  expect(immediateRoot).not.toHaveClass("dark")
  expect(immediateRoot.style.viewTransitionName).toBe("theme-reveal")
  expect(immediateRoot.style.viewTransitionName).not.toBe("root")
  expect(immediateRoot.style.getPropertyValue("--background").trim()).toBe("oklch(0.985 0.01 95)")
  fireEvent.click(immediate.getByRole("button", { name: "Switch to dark theme" }))
  expect(immediateRoot).toHaveClass("dark")
  expect(immediateRoot.style.getPropertyValue("--background").trim()).toBe("oklch(0.17 0.03 280)")
  expect(immediateRoot.style.getPropertyValue("--foreground").trim()).toBe("oklch(0.97 0.01 95)")
  expect(document.documentElement.className).toBe(hostClass)
  expect(document.documentElement.getAttribute("style")).toBe(hostStyle)
  immediate.unmount()

  installMedia(false)
  let update: (() => void) | undefined
  const start = vi.fn((callback?: () => void) => {
    update = callback
    return {
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition() {},
    }
  })
  setStart(start)
  const revealed = render(<ThemeRevealToggle />)
  const revealedRoot = rootOf(revealed.container)
  fireEvent.click(revealed.getByRole("button", { name: "Switch to dark theme" }))
  expect(start).toHaveBeenCalledTimes(1)
  expect(revealedRoot).not.toHaveClass("dark")
  act(() => {
    update?.()
  })
  expect(revealedRoot).toHaveClass("dark")
  expect(document.documentElement.className).toBe(hostClass)
  revealed.unmount()

  installMedia(true)
  const blocked = vi.fn()
  setStart(blocked)
  const reduced = render(<ThemeRevealToggle />)
  const reducedRoot = rootOf(reduced.container)
  fireEvent.click(reduced.getByRole("button", { name: "Switch to dark theme" }))
  expect(blocked).not.toHaveBeenCalled()
  expect(reducedRoot).toHaveClass("dark")
  reduced.unmount()

  installMedia(false)
  setStart(() => {
    throw new Error("view transition failed")
  })
  const failed = render(<ThemeRevealToggle />)
  const failedRoot = rootOf(failed.container)
  fireEvent.click(failed.getByRole("button", { name: "Switch to dark theme" }))
  expect(failedRoot).toHaveClass("dark")
  expect(document.documentElement.className).toBe(hostClass)
})

test("theme-reveal-toggle 登记在页面批次 93，默认预设等于起始值", () => {
  const entry = getComponent("theme-reveal-toggle")
  expect(entry?.batch).toBe(93)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("page")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).map((prop) => prop.name)).toEqual(["duration", "size", "color"])
  expect(auditExemptions.some((item) => item.name === "theme-reveal-toggle")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values.duration).toBe(640)
  expect(preset?.values.size).toBe(44)
  expect(preset?.values.color).toBeUndefined()
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control) || prop.control.value === undefined) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "theme-reveal-toggle.tsx"), "utf8")
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).toMatch(/theme-reveal/)
  expect(source).not.toMatch(/documentElement/)
  expect(source).not.toMatch(/viewTransitionName:\s*["']root["']/)
  expect(source).not.toMatch(/\bpace\b/)
})

test("曲线幕布播完露出另一块内容，减弱动效则瞬时切换", () => {
  expect(curtainDuration(800)).toBe(800)
  expect(curtainDuration(1)).toBe(320)
  expect(curtainDuration(9000)).toBe(1600)
  expect(curtainIntensity(0.4)).toBe(0.4)
  expect(curtainIntensity(2)).toBe(1)
  expect(curtainBow(0)).toBe(0)
  expect(curtainBow(1)).toBe(36)
  expect(curtainEdge(0, "left")).toBe(100)
  expect(curtainEdge(1, "left")).toBe(0)
  expect(curtainEdge(0.5, "right")).toBe(50)
  expect(curtainPath(0, 0, "left")).toBe("M 0 0 H 100 Q 100 50 100 100 H 0 Z")
  expect(curtainPath(0, 0.4, "left")).toBe("M 0 0 H 100 Q 114 50 100 100 H 0 Z")
  expect(curtainPath(0, 1, "left")).toBe("M 0 0 H 100 Q 136 50 100 100 H 0 Z")

  installMedia(false)
  installFrames()
  const onPass = vi.fn()
  const view = render(<CurtainRouteTransition onPass={onPass} className="extra-curtain" />)
  const root = curtainRoot(view.container)
  expect(root).toHaveClass("extra-curtain")
  expect(root).toHaveAttribute("data-side", "north")
  expect(root).toHaveAttribute("data-direction", "left")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(view.getByRole("heading", { name: "North hall" })).toBeInTheDocument()
  expect(view.queryByRole("heading", { name: "South hall" })).not.toBeInTheDocument()
  expect(view.container.querySelector("[data-curtain]")).toBeNull()

  fireEvent.click(view.getByRole("button", { name: "Open south hall" }))
  expect(root).toHaveAttribute("data-playing", "on")
  expect(root).toHaveAttribute("data-side", "north")
  expect(view.getByRole("heading", { name: "North hall" })).toBeInTheDocument()
  expect(view.queryByRole("heading", { name: "South hall" })).not.toBeInTheDocument()
  const curtain = view.container.querySelector("[data-curtain]")
  expect(curtain?.tagName.toLowerCase()).toBe("svg")
  expect(curtain?.querySelector("path")?.getAttribute("d")).toBe("M 0 0 H 100 Q 114 50 100 100 H 0 Z")

  act(() => drain(60))
  expect(root).toHaveAttribute("data-side", "south")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(view.getByRole("heading", { name: "South hall" })).toBeInTheDocument()
  expect(view.queryByRole("heading", { name: "North hall" })).not.toBeInTheDocument()
  expect(view.getByRole("button", { name: "Open north hall" })).toBeInTheDocument()
  expect(view.container.querySelector("[data-curtain]")).toBeNull()
  expect(onPass).toHaveBeenCalledWith({ side: "south" })
  view.unmount()

  installMedia(false)
  installFrames()
  const keys = render(<CurtainRouteTransition direction="down" />)
  const stage = keys.getByRole("region", { name: "Curtain route" })
  expect(curtainRoot(keys.container)).toHaveAttribute("data-direction", "down")
  fireEvent.keyDown(stage, { key: "ArrowDown" })
  act(() => drain(60))
  expect(keys.getByRole("heading", { name: "South hall" })).toBeInTheDocument()
  expect(keys.queryByRole("heading", { name: "North hall" })).not.toBeInTheDocument()
  keys.unmount()

  installMedia(true)
  installFrames()
  const reduced = render(<CurtainRouteTransition />)
  fireEvent.click(reduced.getByRole("button", { name: "Open south hall" }))
  expect(curtainRoot(reduced.container)).toHaveAttribute("data-side", "south")
  expect(curtainRoot(reduced.container)).toHaveAttribute("data-playing", "off")
  expect(reduced.getByRole("heading", { name: "South hall" })).toBeInTheDocument()
  expect(reduced.queryByRole("heading", { name: "North hall" })).not.toBeInTheDocument()
  expect(reduced.container.querySelector("[data-curtain]")).toBeNull()
  expect(queued.size).toBe(0)
})

test("curtain-route-transition 登记在页面批次 93，默认预设等于起始值", () => {
  const entry = getComponent("curtain-route-transition")
  expect(entry?.batch).toBe(93)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("page")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).map((prop) => prop.name)).toEqual([
    "duration",
    "intensity",
    "direction",
  ])
  expect(auditExemptions.some((item) => item.name === "curtain-route-transition")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values.duration).toBe(800)
  expect(preset?.values.intensity).toBe(0.4)
  expect(preset?.values.direction).toBe("left")
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control) || prop.control.value === undefined) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  const source = fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "curtain-route-transition.tsx"),
    "utf8",
  )
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).not.toMatch(/\bpace\b/)
  expect(source).not.toMatch(/from ["']react-router/)
  expect(source).not.toMatch(/from ["']next\/navigation/)
})
