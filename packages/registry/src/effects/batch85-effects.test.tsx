// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import {
  AisleCrossfadeRoute,
  aisleOpacity,
  aisleShift,
} from "./aisle-crossfade-route"
import { ApronSlideSheet, blurPx, scrimAlpha, slideDistance } from "./apron-slide-sheet"
import { HazeAmbientVeil, liftPx, veilAlpha } from "./haze-ambient-veil"
import { ScrimCleanDismiss, dismissScrim, exitScale } from "./scrim-clean-dismiss"
import { gleamAlpha, gleamPoint, SillGleamPass } from "./sill-gleam-pass"
import { ctaMix, entranceScale, WelcomeOfferStage } from "./welcome-offer-stage"

const SLUGS = [
  "aisle-crossfade-route",
  "apron-slide-sheet",
  "welcome-offer-stage",
  "haze-ambient-veil",
  "sill-gleam-pass",
  "scrim-clean-dismiss",
] as const

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

let emitView: (on: boolean) => void = () => {}

class ToggleObserver {
  constructor(callback: IntersectionObserverCallback) {
    emitView = (on: boolean) => {
      callback(
        [{ isIntersecting: on, intersectionRatio: on ? 1 : 0, target: document.documentElement } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      )
    }
  }

  observe() {
    emitView(true)
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
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

function start(name: string, prop: string) {
  const found = getComponent(name)?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(`${name}.${prop}`)
  return found.control.value
}

function rootOf(container: HTMLElement, slot: string) {
  const node = container.querySelector(`[data-slot='${slot}']`)
  if (!(node instanceof HTMLElement)) throw new Error(`missing ${slot}`)
  return node
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("六个 slug 都是 batch 85，控件起始值等于默认，且不在豁免名单", () => {
  for (const name of SLUGS) {
    const entry = getComponent(name)
    expect(entry?.batch).toBe(85)
    expect(entry?.layer).toBe("effect")
    expect(entry?.effectCategory).toBe("showcase")
    expect(entry?.source).toBe("original")
    expect(entry?.props.filter((prop) => prop.control).length).toBeGreaterThanOrEqual(3)
    expect(auditExemptions.some((item) => item.name === name)).toBe(false)
    const preset = entry?.presets?.find((item) => item.name === "default")
    expect(preset?.values.pace).toBe(1)
    for (const prop of entry?.props ?? []) {
      if (!prop.control || !("value" in prop.control)) continue
      expect(preset?.values[prop.name]).toBe(prop.control.value)
    }
  }
  expect(start("aisle-crossfade-route", "intensity")).toBe(0.28)
  expect(start("aisle-crossfade-route", "style")).toBe("crossfade")
  expect(start("aisle-crossfade-route", "direction")).toBe("horizontal")
  expect(start("apron-slide-sheet", "edge")).toBe("end")
  expect(start("apron-slide-sheet", "scrimBlur")).toBe(0)
  expect(start("welcome-offer-stage", "emphasis")).toBe(0.55)
  expect(start("welcome-offer-stage", "scrimOpacity")).toBe(0.28)
  expect(start("haze-ambient-veil", "tint")).toBe("muted")
  expect(start("haze-ambient-veil", "lift")).toBe(0.2)
  expect(start("sill-gleam-pass", "path")).toBe("edge")
  expect(start("sill-gleam-pass", "loop")).toBe(true)
  expect(start("scrim-clean-dismiss", "exitStyle")).toBe("fade")
  expect(start("scrim-clean-dismiss", "closeOnScrim")).toBe(true)
})

test("两条 aisle 短时交叉，完成后焦点在目标按钮，半程可以折返", () => {
  expect(aisleShift(0, 0.28, "crossfade", "b")).toBe(0)
  expect(Math.abs(aisleShift(0, 1, "soft-wipe", "b"))).toBeLessThanOrEqual(14)
  expect(aisleOpacity(1, "b", 0.28)).toBe(1)
  const onValueChange = vi.fn()
  const view = render(<AisleCrossfadeRoute onValueChange={onValueChange} className="extra-aisle" />)
  const root = rootOf(view.container, "aisle-crossfade-route")
  const stage = view.getByRole("region", { name: "Route aisle" })
  expect(root).toHaveAttribute("data-ritual", "aisle-crossfade")
  expect(root).toHaveAttribute("data-aisle", "a")
  expect(root).toHaveAttribute("data-blend", "0.000")
  expect(root).toHaveAttribute("data-style", "crossfade")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("extra-aisle")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(stage.className).toContain("focus-visible:ring-2")
  expect(view.getByRole("button", { name: "Open notes" })).toBeInTheDocument()
  const south = view.container.querySelector("[data-page='b']")
  expect(south?.parentElement).toHaveClass("pointer-events-none")
  expect(south).toHaveAttribute("data-shift", "0.0")

  fireEvent.keyDown(stage, { key: "]" })
  expect(root).toHaveAttribute("data-aisle", "b")
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => drain(4))
  expect(Number(root.getAttribute("data-blend"))).toBeGreaterThan(0)
  expect(Number(root.getAttribute("data-blend"))).toBeLessThan(1)
  fireEvent.keyDown(view.getByRole("button", { name: "Review notes" }), { key: "[" })
  act(() => drain(16))
  expect(root).toHaveAttribute("data-aisle", "a")
  expect(root).toHaveAttribute("data-blend", "0.000")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(view.getByRole("button", { name: "Open notes" })).toHaveFocus()
  expect(queued.size).toBe(0)

  fireEvent.keyDown(stage, { key: "ArrowRight" })
  act(() => drain(16))
  expect(root).toHaveAttribute("data-blend", "1.000")
  expect(view.getByRole("button", { name: "Review notes" })).toHaveFocus()
  expect(view.container.querySelector("[data-page='a']")?.parentElement).toHaveClass("pointer-events-none")
  stage.focus()
  fireEvent.keyDown(stage, { key: "Enter" })
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => drain(16))
  expect(root).toHaveAttribute("data-aisle", "b")
  expect(root).toHaveAttribute("data-settled", "yes")
  expect(view.container.textContent).not.toMatch(/canva|webflow|wix|figma/i)
  expect(onValueChange).toHaveBeenCalled()
})

test("aisle 离开视口落到目标页，减弱动效瞬时切换", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<AisleCrossfadeRoute style="soft-wipe" direction="vertical" intensity={1} />)
  const root = rootOf(view.container, "aisle-crossfade-route")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-direction", "vertical")
  fireEvent.keyDown(view.getByRole("region", { name: "Route aisle" }), { key: "]" })
  act(() => drain(2))
  expect(root).toHaveAttribute("data-playing", "on")
  const shift = Number(view.container.querySelector("[data-page='b']")?.getAttribute("data-shift"))
  expect(shift).toBeGreaterThan(0)
  expect(shift).toBeLessThanOrEqual(14)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-blend", "1.000")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const still = render(<AisleCrossfadeRoute />)
  const quiet = rootOf(still.container, "aisle-crossfade-route")
  expect(quiet).toHaveAttribute("data-motion", "off")
  fireEvent.keyDown(still.getByRole("region", { name: "Route aisle" }), { key: "]" })
  expect(quiet).toHaveAttribute("data-blend", "1.000")
  expect(quiet).toHaveAttribute("data-playing", "off")
  expect(still.getByRole("button", { name: "Review notes" })).toHaveFocus()
  expect(queued.size).toBe(0)
})

test("apron 滑入后焦点在关闭钮，关掉后遮罩卸除且背景可点", () => {
  expect(slideDistance(0.3)).toBeLessThan(28)
  expect(scrimAlpha(1, 0.3)).toBeLessThan(0.4)
  expect(blurPx(0, 1)).toBe(0)
  const view = render(<ApronSlideSheet className="extra-apron" />)
  const root = rootOf(view.container, "apron-slide-sheet")
  const ground = view.container.querySelector("[data-ground]")
  expect(root).toHaveAttribute("data-ritual", "apron-slide")
  expect(root).toHaveAttribute("data-open", "no")
  expect(root).toHaveAttribute("data-edge", "end")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("extra-apron")
  expect(view.container.querySelector("[data-scrim]")).toBeNull()
  expect(view.getByRole("button", { name: "Open apron" }).className).toContain("focus-visible:ring-2")

  fireEvent.click(view.getByRole("button", { name: "Open apron" }))
  const dialog = view.getByRole("dialog", { name: "Side notes" })
  expect(dialog).toHaveAttribute("aria-modal", "true")
  expect(ground).toHaveAttribute("inert")
  expect(view.getByRole("button", { name: "Close panel" })).toHaveFocus()
  expect(view.getByRole("button", { name: "Close panel" }).className).toContain("focus-visible:ring-2")
  fireEvent.click(view.getByRole("button", { name: "Page action" }))
  expect(root).toHaveAttribute("data-actions", "0")
  const close = view.getByRole("button", { name: "Close panel" })
  close.focus()
  fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true })
  expect(view.getByRole("button", { name: "Save note" })).toHaveFocus()
  fireEvent.change(view.getByPlaceholderText("Write a note"), { target: { value: "A note" } })
  fireEvent.click(view.getByRole("button", { name: "Save note" }))
  expect(root).toHaveAttribute("data-saved", "yes")
  act(() => drain(16))
  expect(root).toHaveAttribute("data-phase", "open")
  expect(root).toHaveAttribute("data-playing", "off")
  fireEvent.keyDown(dialog, { key: "Escape" })
  expect(root).toHaveAttribute("data-phase", "closing")
  act(() => drain(16))
  expect(view.queryByRole("dialog")).not.toBeInTheDocument()
  expect(view.container.querySelector("[data-scrim]")).toBeNull()
  expect(ground).not.toHaveAttribute("inert")
  expect(view.getByRole("button", { name: "Open apron" })).toHaveFocus()
  fireEvent.click(view.getByRole("button", { name: "Page action" }))
  expect(root).toHaveAttribute("data-actions", "1")
  expect(view.container.textContent).not.toMatch(/lululemon|sweatpals|etsy|uniswap|oura/i)
})

test("apron 离开视口停在稳态，减弱动效瞬时开合", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<ApronSlideSheet edge="bottom" scrimBlur={2} />)
  const root = rootOf(view.container, "apron-slide-sheet")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Open apron" }))
  act(() => drain(2))
  expect(root).toHaveAttribute("data-playing", "on")
  expect(root).toHaveAttribute("data-edge", "bottom")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-phase", "open")
  expect(root).toHaveAttribute("data-progress", "1.000")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(Number(root.getAttribute("data-blur"))).toBeGreaterThan(0)
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const still = render(<ApronSlideSheet />)
  const quiet = rootOf(still.container, "apron-slide-sheet")
  fireEvent.click(still.getByRole("button", { name: "Open apron" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-phase", "open")
  expect(queued.size).toBe(0)
  fireEvent.click(still.getByRole("button", { name: "Close panel" }))
  expect(still.queryByRole("dialog")).not.toBeInTheDocument()
  expect(still.container.querySelector("[data-scrim]")).toBeNull()
  expect(queued.size).toBe(0)
})

test("欢迎舞台打开时焦点在主按钮，关闭后没有残留遮罩", () => {
  expect(entranceScale(0, 0.32)).toBeGreaterThan(0.97)
  expect(ctaMix(0.55)).toBeGreaterThan(50)
  const view = render(<WelcomeOfferStage className="extra-offer" />)
  const root = rootOf(view.container, "welcome-offer-stage")
  expect(root).toHaveAttribute("data-open", "no")
  expect(root).toHaveAttribute("data-choice", "none")
  expect(root).toHaveAttribute("data-ritual", "welcome-offer")
  expect(root.className).toContain("extra-offer")
  expect(view.queryByRole("dialog")).not.toBeInTheDocument()

  fireEvent.click(view.getByRole("button", { name: "Open offer" }))
  const dialog = view.getByRole("dialog", { name: "A quieter plan" })
  const accept = view.getByRole("button", { name: "Accept offer" })
  const decline = view.getByRole("button", { name: "Not now" })
  const close = view.getByRole("button", { name: "Close offer" })
  expect(accept).toHaveFocus()
  expect(accept.className).toContain("focus-visible:ring-2")
  expect(view.container.querySelector("[data-ground]")).toHaveAttribute("inert")
  close.focus()
  fireEvent.keyDown(dialog, { key: "Tab" })
  expect(accept).toHaveFocus()
  fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true })
  expect(close).toHaveFocus()
  expect(decline).toBeInTheDocument()
  act(() => drain(16))
  expect(root).toHaveAttribute("data-phase", "open")
  expect(Number(root.getAttribute("data-scale"))).toBe(1)
  fireEvent.click(decline)
  act(() => drain(16))
  expect(root).toHaveAttribute("data-open", "no")
  expect(root).toHaveAttribute("data-choice", "decline")
  expect(view.queryByRole("dialog")).not.toBeInTheDocument()
  expect(view.container.querySelector("[data-scrim]")).toBeNull()
  expect(view.container.querySelector("[aria-modal]")).toBeNull()
  expect(view.container.querySelector("[data-ground]")).not.toHaveAttribute("inert")
  expect(view.getByRole("button", { name: "Open offer" })).toHaveFocus()
  fireEvent.click(view.getByRole("button", { name: "Read notes" }))
  expect(root).toHaveAttribute("data-reads", "1")
  expect(view.container.textContent).not.toMatch(/meetup|babbel|portrait|uxcel/i)
})

test("欢迎舞台减弱动效瞬时开关，Esc 记为关闭", () => {
  installMedia({ reduced: true })
  const view = render(<WelcomeOfferStage emphasis={0.9} />)
  const root = rootOf(view.container, "welcome-offer-stage")
  fireEvent.click(view.getByRole("button", { name: "Open offer" }))
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-phase", "open")
  expect(view.getByRole("button", { name: "Accept offer" })).toHaveFocus()
  expect(queued.size).toBe(0)
  fireEvent.keyDown(view.getByRole("dialog"), { key: "Escape" })
  expect(view.queryByRole("dialog")).not.toBeInTheDocument()
  expect(root).toHaveAttribute("data-choice", "dismiss")
  expect(root).toHaveAttribute("data-open", "no")
  expect(queued.size).toBe(0)
})

test("薄雾不接收指针，按钮可点，减弱动效没有帷幕", () => {
  expect(veilAlpha(0, 0.28)).toBeLessThan(0.45)
  expect(liftPx(0, 0.2)).toBeLessThan(3)
  expect(veilAlpha(1, 1)).toBe(0)
  const view = render(<HazeAmbientVeil className="extra-haze" />)
  const root = rootOf(view.container, "haze-ambient-veil")
  const veil = view.container.querySelector("[data-veil]")
  expect(root).toHaveAttribute("data-ritual", "haze-veil")
  expect(root).toHaveAttribute("data-tint", "muted")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("extra-haze")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(veil).toHaveClass("pointer-events-none")
  expect(veil).toHaveStyle({ pointerEvents: "none" })
  expect(veil).toHaveAttribute("aria-hidden", "true")
  expect(veil).not.toHaveAttribute("tabindex")
  expect(Number(veil?.getAttribute("data-alpha"))).toBeLessThan(0.45)
  expect(view.getByRole("button", { name: "Continue" }).className).toContain("focus-visible:ring-2")
  fireEvent.click(view.getByRole("button", { name: "Continue" }))
  expect(root).toHaveAttribute("data-acks", "1")
  act(() => drain(20))
  expect(root).toHaveAttribute("data-clear", "1.000")
  expect(view.container.querySelector("[data-veil]")).toBeNull()
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(view.getByRole("button", { name: "Continue" }), { key: "Enter" })
  expect(root).toHaveAttribute("data-clear", "0.000")
  expect(root).toHaveAttribute("data-playing", "on")
  expect(view.container.querySelector("[data-veil]")).toHaveStyle({ pointerEvents: "none" })
  act(() => drain(20))
  expect(root).toHaveAttribute("data-clear", "1.000")
  expect(view.container.textContent).not.toMatch(/mercury|squarespace|lindy|railway/i)
})

test("薄雾离开视口后保持全显，减弱动效不插值", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<HazeAmbientVeil tint="primary-soft" lift={0.45} />)
  const root = rootOf(view.container, "haze-ambient-veil")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-playing", "on")
  expect(root).toHaveAttribute("data-tint", "primary-soft")
  act(() => drain(2))
  expect(Number(root.getAttribute("data-clear"))).toBeGreaterThan(0)
  expect(Number(root.getAttribute("data-clear"))).toBeLessThan(1)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-clear", "1.000")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(view.container.querySelector("[data-veil]")).toBeNull()
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const still = render(<HazeAmbientVeil />)
  const quiet = rootOf(still.container, "haze-ambient-veil")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-clear", "1.000")
  expect(still.container.querySelector("[data-veil]")).toBeNull()
  fireEvent.keyDown(still.getByRole("button", { name: "Reset veil" }), { key: "Enter" })
  expect(quiet).toHaveAttribute("data-clear", "1.000")
  expect(still.container.querySelector("[data-veil]")).toBeNull()
  expect(queued.size).toBe(0)
})

test("窗台边光不接收指针和焦点，按钮始终可点", () => {
  expect(gleamAlpha(0.18)).toBeLessThan(0.25)
  expect(gleamPoint(0, "edge")).toEqual({ x: 0, y: 0 })
  expect(gleamPoint(0.5, "diagonal").x).toBeGreaterThan(40)
  const view = render(<SillGleamPass className="extra-gleam" />)
  const root = rootOf(view.container, "sill-gleam-pass")
  const gleam = view.container.querySelector("[data-gleam-layer]")
  expect(root).toHaveAttribute("data-ritual", "sill-gleam")
  expect(root).toHaveAttribute("data-gleam", "pass")
  expect(root).toHaveAttribute("data-path", "edge")
  expect(root).toHaveAttribute("data-loop", "on")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("extra-gleam")
  expect(gleam).toHaveClass("pointer-events-none")
  expect(gleam).toHaveStyle({ pointerEvents: "none" })
  expect(gleam).toHaveAttribute("aria-hidden", "true")
  expect(gleam).not.toHaveAttribute("tabindex")
  expect(gleam?.querySelector("button, a, input")).toBeNull()
  expect(view.getByRole("button", { name: "Open card" }).className).toContain("focus-visible:ring-2")
  fireEvent.click(gleam as Element)
  fireEvent.click(view.getByRole("button", { name: "Open card" }))
  expect(root).toHaveAttribute("data-opened", "1")
  act(() => drain(4))
  const phase = Number(root.getAttribute("data-phase"))
  expect(phase).toBeGreaterThan(0)
  fireEvent.click(view.getByRole("button", { name: "Pause gleam" }))
  expect(root).toHaveAttribute("data-gleam", "paused")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  act(() => drain(4))
  expect(root).toHaveAttribute("data-phase", phase.toFixed(3))
  fireEvent.click(view.getByRole("button", { name: "Play gleam" }))
  expect(root).toHaveAttribute("data-playing", "on")
  expect(view.container.textContent).not.toMatch(/intercom|homerun|heyclicky/i)
})

test("边光离开视口停止循环，减弱动效停在静帧，单次路径会停住", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<SillGleamPass />)
  const root = rootOf(view.container, "sill-gleam-pass")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => drain(3))
  const phase = root.getAttribute("data-phase")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-gleam", "held")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-phase", phase)
  expect(queued.size).toBe(0)
  act(() => emitView(true))
  expect(root).toHaveAttribute("data-playing", "on")
  expect(queued.size).toBeGreaterThan(0)

  cleanup()
  installFrames()
  const once = render(<SillGleamPass loop={false} path="diagonal" />)
  const single = rootOf(once.container, "sill-gleam-pass")
  expect(single).toHaveAttribute("data-path", "diagonal")
  act(() => drain(160))
  expect(single).toHaveAttribute("data-phase", "1.000")
  expect(single).toHaveAttribute("data-gleam", "rest")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  installFrames()
  const still = render(<SillGleamPass />)
  const quiet = rootOf(still.container, "sill-gleam-pass")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-gleam", "still")
  expect(quiet).toHaveAttribute("data-phase", "0.000")
  expect(quiet).toHaveAttribute("data-playing", "off")
  expect(still.container.querySelector("[data-gleam-layer]")).toHaveStyle({ pointerEvents: "none" })
  expect(queued.size).toBe(0)
})

test("关闭后 scrim、对话框和 inert 全部卸掉，背景探针可点", () => {
  expect(dismissScrim(1, 0.3)).toBeLessThan(0.4)
  expect(exitScale(1, "fade", 1)).toBe(1)
  expect(exitScale(0, "scale-out", 0.3)).toBeLessThan(1)
  const onValueChange = vi.fn()
  const view = render(<ScrimCleanDismiss onValueChange={onValueChange} className="extra-scrim" />)
  const root = rootOf(view.container, "scrim-clean-dismiss")
  const ground = view.container.querySelector("[data-ground]")
  expect(root).toHaveAttribute("data-ritual", "scrim-dismiss")
  expect(root).toHaveAttribute("data-open", "no")
  expect(root).toHaveAttribute("data-layers", "0")
  expect(root).toHaveAttribute("data-exit", "fade")
  expect(root.className).toContain("extra-scrim")
  expect(view.container.querySelector("[data-scrim]")).toBeNull()
  expect(view.getByRole("button", { name: "Open notice" }).className).toContain("focus-visible:ring-2")

  fireEvent.click(view.getByRole("button", { name: "Open notice" }))
  const dialog = view.getByRole("dialog", { name: "Clean notice" })
  expect(dialog).toHaveAttribute("aria-modal", "true")
  expect(ground).toHaveAttribute("inert")
  expect(view.getByRole("button", { name: "Done" })).toHaveFocus()
  expect(view.getByRole("button", { name: "Done" }).className).toContain("focus-visible:ring-2")
  fireEvent.click(view.getByRole("button", { name: "Probe background" }))
  expect(root).toHaveAttribute("data-probes", "0")
  const done = view.getByRole("button", { name: "Done" })
  const closeNotice = view.getByRole("button", { name: "Close notice" })
  closeNotice.focus()
  fireEvent.keyDown(dialog, { key: "Tab" })
  expect(done).toHaveFocus()
  fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true })
  expect(closeNotice).toHaveFocus()
  act(() => drain(16))
  expect(root).toHaveAttribute("data-phase", "open")
  expect(root).toHaveAttribute("data-scale", "1.000")
  fireEvent.click(view.container.querySelector("[data-scrim]") as Element)
  expect(root).toHaveAttribute("data-phase", "closing")
  act(() => drain(16))
  expect(view.queryByRole("dialog")).not.toBeInTheDocument()
  expect(view.container.querySelector("[data-scrim]")).toBeNull()
  expect(view.container.querySelector("[aria-modal]")).toBeNull()
  expect(root).toHaveAttribute("data-open", "no")
  expect(root).toHaveAttribute("data-layers", "0")
  expect(ground).not.toHaveAttribute("inert")
  expect(view.getByRole("button", { name: "Open notice" })).toHaveFocus()
  fireEvent.click(view.getByRole("button", { name: "Probe background" }))
  expect(root).toHaveAttribute("data-probes", "1")
  expect(queued.size).toBe(0)
  expect(onValueChange).toHaveBeenCalled()
  expect(view.container.textContent).not.toMatch(/customer\.io|babbel|uxcel|uniswap/i)
})

test("scrim 关闭可改成不响应遮罩，离开视口保持打开，减弱动效同步卸层", async () => {
  const held = render(<ScrimCleanDismiss closeOnScrim={false} exitStyle="scale-out" />)
  fireEvent.click(held.getByRole("button", { name: "Open notice" }))
  act(() => drain(16))
  const heldRoot = rootOf(held.container, "scrim-clean-dismiss")
  expect(heldRoot).toHaveAttribute("data-exit", "scale-out")
  fireEvent.click(held.container.querySelector("[data-scrim]") as Element)
  expect(heldRoot).toHaveAttribute("data-open", "yes")
  expect(held.getByRole("dialog")).toBeInTheDocument()
  fireEvent.keyDown(held.getByRole("dialog"), { key: "Escape" })
  act(() => drain(16))
  expect(held.queryByRole("dialog")).not.toBeInTheDocument()
  expect(Number(exitScale(0.2, "scale-out", 0.55))).toBeLessThan(1)

  cleanup()
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  installFrames()
  const view = render(<ScrimCleanDismiss />)
  const root = rootOf(view.container, "scrim-clean-dismiss")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Open notice" }))
  act(() => drain(2))
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-phase", "open")
  expect(root).toHaveAttribute("data-open", "yes")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(view.getByRole("dialog")).toBeInTheDocument()
  expect(queued.size).toBe(0)
  act(() => emitView(true))
  fireEvent.click(view.getByRole("button", { name: "Done" }))
  act(() => drain(16))
  expect(view.queryByRole("dialog")).not.toBeInTheDocument()

  cleanup()
  installMedia({ reduced: true })
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
  const still = render(<ScrimCleanDismiss />)
  const quiet = rootOf(still.container, "scrim-clean-dismiss")
  fireEvent.click(still.getByRole("button", { name: "Open notice" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-phase", "open")
  expect(queued.size).toBe(0)
  fireEvent.click(still.getByRole("button", { name: "Close notice" }))
  expect(still.queryByRole("dialog")).not.toBeInTheDocument()
  expect(quiet).toHaveAttribute("data-layers", "0")
  expect(still.container.querySelector("[data-ground]")).not.toHaveAttribute("inert")
  expect(queued.size).toBe(0)
})
