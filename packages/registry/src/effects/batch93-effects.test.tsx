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
  menuDuration,
  menuIntensity,
  menuPanelSize,
  MorphMegaMenu,
  panelAnchor,
  panelFrame,
} from "./morph-mega-menu"
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

const menuFrames = new Map<number, FrameRequestCallback>()
let menuFrameId = 0

function installMenuFrames() {
  menuFrames.clear()
  menuFrameId = 0
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    menuFrameId += 1
    menuFrames.set(menuFrameId, callback)
    return menuFrameId
  })
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    menuFrames.delete(id)
  })
}

function runMenuFrame(time: number) {
  const batch = [...menuFrames.values()]
  menuFrames.clear()
  for (const callback of batch) callback(time)
}

function installMenuRects() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const item = this.getAttribute("data-item")
    if (item === "product") return new DOMRect(16, 8, 72, 36)
    if (item === "docs") return new DOMRect(200, 8, 64, 36)
    if (item === "studio") return new DOMRect(360, 8, 72, 36)
    if (this.getAttribute("data-slot") === "morph-mega-menu") return new DOMRect(0, 0, 640, 320)
    return new DOMRect(0, 0, 0, 0)
  })
}

function menuRoot(container: HTMLElement) {
  const node = container.querySelector("[data-slot='morph-mega-menu']")
  if (!(node instanceof HTMLElement)) throw new Error("missing morph-mega-menu")
  return node
}

function menuPanel(container: HTMLElement) {
  const node = container.querySelector("[data-slot='morph-mega-panel']")
  if (!(node instanceof HTMLElement)) throw new Error("missing morph-mega-panel")
  return node
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
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

test("大型菜单点击展开，方向键把面板从旧位置移到新位置，Escape 和外部点击关闭", () => {
  expect(menuDuration(undefined)).toBe(400)
  expect(menuDuration(10)).toBe(160)
  expect(menuDuration(9000)).toBe(800)
  expect(menuIntensity(undefined)).toBe(0.55)
  expect(menuIntensity(-1)).toBe(0)
  expect(menuIntensity(2)).toBe(1)
  expect(menuPanelSize(undefined)).toBe(280)
  expect(menuPanelSize(1)).toBe(160)
  expect(menuPanelSize(900)).toBe(440)
  expect(panelAnchor(16, 280, 640)).toBe(16)
  expect(panelAnchor(200, 280, 640)).toBe(200)
  expect(panelAnchor(500, 280, 640)).toBe(360)
  expect(panelFrame({ x: 16, width: 280 }, { x: 200, width: 280 }, 0, 1)).toEqual({ x: 16, width: 280 })
  expect(panelFrame({ x: 16, width: 280 }, { x: 200, width: 280 }, 1, 1)).toEqual({ x: 200, width: 280 })
  expect(panelFrame({ x: 0, width: 280 }, { x: 120, width: 280 }, 0.5, 0)).toEqual({ x: 60, width: 280 })
  expect(panelFrame({ x: 0, width: 280 }, { x: 120, width: 280 }, 0.5, 1)).toEqual({ x: 0, width: 400 })
  expect(panelFrame({ x: 16, width: 280 }, { x: 200, width: 280 }, 0.5, 1)).toEqual({ x: 16, width: 464 })

  installMedia(false)
  const clamped = render(<MorphMegaMenu className="extra-menu" duration={10} intensity={2} size={1} />)
  const clampedRoot = menuRoot(clamped.container)
  expect(clampedRoot).toHaveAttribute("data-duration", "160")
  expect(clampedRoot).toHaveAttribute("data-intensity", "1")
  expect(clampedRoot).toHaveAttribute("data-size", "160")
  expect(clampedRoot.className).toContain("extra-menu")
  clamped.unmount()

  installMenuFrames()
  installMenuRects()
  const view = render(<MorphMegaMenu intensity={1} />)
  const product = view.getByRole("button", { name: "Product" })
  const docs = view.getByRole("button", { name: "Docs" })
  fireEvent.pointerEnter(product)
  fireEvent.mouseEnter(product)
  expect(view.queryByRole("region")).not.toBeInTheDocument()

  fireEvent.click(product)
  const opened = menuPanel(view.container)
  expect(opened).toHaveAttribute("data-motion", "snap")
  expect(opened).toHaveAttribute("data-from", "product")
  expect(opened).toHaveAttribute("data-to", "product")
  expect(opened).toHaveAttribute("data-x", "16")
  expect(opened).toHaveTextContent("North aisle")
  expect(product).toHaveAttribute("aria-expanded", "true")
  expect(docs).toHaveAttribute("aria-expanded", "false")

  fireEvent.click(product)
  expect(view.queryByRole("region")).not.toBeInTheDocument()
  expect(product).toHaveAttribute("aria-expanded", "false")

  fireEvent.click(product)
  fireEvent.keyDown(product, { key: "ArrowRight" })
  const moving = menuPanel(view.container)
  expect(moving).toHaveAttribute("data-motion", "move")
  expect(moving).toHaveAttribute("data-from", "product")
  expect(moving).toHaveAttribute("data-to", "docs")
  expect(moving).toHaveAttribute("data-x", "200")
  expect(moving).toHaveTextContent("Field notes")
  expect(moving.style.left).toBe("16px")
  expect(docs).toHaveAttribute("aria-expanded", "true")
  expect(product).toHaveAttribute("aria-expanded", "false")
  expect(document.activeElement).toBe(docs)

  act(() => runMenuFrame(0))
  act(() => runMenuFrame(200))
  expect(moving.style.left).toBe("16px")
  expect(moving.style.width).toBe("464px")
  act(() => runMenuFrame(400))
  expect(moving.style.left).toBe("200px")
  expect(moving.style.width).toBe("280px")

  fireEvent.keyDown(docs, { key: "ArrowDown" })
  expect(menuPanel(view.container)).toHaveAttribute("data-to", "studio")
  expect(menuPanel(view.container)).toHaveAttribute("data-x", "360")
  expect(menuPanel(view.container)).toHaveTextContent("West room")
  fireEvent.keyDown(view.getByRole("button", { name: "Studio" }), { key: "ArrowUp" })
  expect(menuPanel(view.container)).toHaveAttribute("data-to", "docs")
  fireEvent.keyDown(docs, { key: "ArrowLeft" })
  expect(menuPanel(view.container)).toHaveAttribute("data-to", "product")
  expect(menuPanel(view.container)).toHaveTextContent("North aisle")

  fireEvent.keyDown(product, { key: "Escape" })
  expect(view.queryByRole("region")).not.toBeInTheDocument()
  expect(document.activeElement).toBe(product)

  fireEvent.click(product)
  const inside = menuPanel(view.container)
  fireEvent.pointerDown(inside)
  expect(view.queryByRole("region")).toBe(inside)

  const outside = document.createElement("button")
  outside.type = "button"
  document.body.appendChild(outside)
  fireEvent.pointerDown(outside)
  outside.remove()
  expect(view.queryByRole("region")).not.toBeInTheDocument()
})

test("减弱动效时大型菜单的面板瞬时切到新位置", () => {
  installMedia(true)
  installMenuFrames()
  installMenuRects()
  const view = render(<MorphMegaMenu />)
  fireEvent.click(view.getByRole("button", { name: "Product" }))
  fireEvent.keyDown(view.getByRole("button", { name: "Product" }), { key: "ArrowRight" })
  const panel = menuPanel(view.container)
  expect(panel).toHaveAttribute("data-motion", "snap")
  expect(panel).toHaveAttribute("data-to", "docs")
  expect(panel).toHaveAttribute("data-x", "200")
  expect(panel.style.left).toBe("200px")
  expect(panel.style.width).toBe("280px")
  expect(panel).toHaveTextContent("Field notes")
  expect(menuFrames.size).toBe(0)
})

test("morph-mega-menu 登记在导航批次 93，默认预设等于起始值", () => {
  const entry = getComponent("morph-mega-menu")
  expect(entry?.batch).toBe(93)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("navigation")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).map((prop) => prop.name)).toEqual(["duration", "intensity", "size"])
  expect(auditExemptions.some((item) => item.name === "morph-mega-menu")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values).toEqual({ duration: 400, intensity: 0.55, size: 280 })
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control) || prop.control.value === undefined) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "morph-mega-menu.tsx"), "utf8")
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).toMatch(/from "@\/hooks\/use-click-outside"/)
  expect(source).toMatch(/useClickOutside\(/)
  expect(source).not.toMatch(/@radix-ui/)
  expect(source).not.toMatch(/@base-ui/)
  expect(source).not.toMatch(/\bpace\b/)
  expect(source).not.toMatch(/onMouseEnter|onPointerEnter|onMouseOver/)
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
