// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import { BrimFlickInk, inkBox } from "./brim-flick-ink"
import { EchoFocusTwin, twinAlpha } from "./echo-focus-twin"
import { approach, NestSoftHalo } from "./nest-soft-halo"
import { ageCrumbs, crumbCap, NibCrumbFade, placeCrumb, type Crumb } from "./nib-crumb-fade"
import { beaconAlpha, beaconRadius, PressSnapBeacon } from "./press-snap-beacon"
import { lingerFrames, ScrubGhostWhisk, whiskLength } from "./scrub-ghost-whisk"

const SLUGS = [
  "nib-crumb-fade",
  "press-snap-beacon",
  "nest-soft-halo",
  "echo-focus-twin",
  "scrub-ghost-whisk",
  "brim-flick-ink",
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

function rootOf(container: HTMLElement, slot: string) {
  const node = container.querySelector(`[data-slot='${slot}']`)
  if (!(node instanceof HTMLElement)) throw new Error(`missing ${slot}`)
  return node
}

function expectHandsOff(container: HTMLElement) {
  expect(container.querySelector("[class*='cursor-none']")).toBeNull()
  expect(container.querySelector("[style*='cursor: none']")).toBeNull()
}

function railBox(node: HTMLElement) {
  node.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 200,
      bottom: 48,
      width: 200,
      height: 48,
      toJSON() {
        return {}
      },
    }) as DOMRect
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

test("六个 slug 都是 batch 86，控件起始值等于默认，且不在豁免名单", () => {
  for (const name of SLUGS) {
    const entry = getComponent(name)
    expect(entry?.batch).toBe(86)
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
})

test("墨渍残屑很短，按钮仍可点，Enter 清空，减弱动效和离屏都停", async () => {
  let crumbs: readonly Crumb[] = []
  for (let index = 0; index < 8; index += 1) {
    crumbs = placeCrumb(crumbs, { x: index * 80, y: 4 }, 5, index + 1)
  }
  expect(crumbs).toHaveLength(crumbCap(5))
  expect(placeCrumb(crumbs, { x: crumbs[4]?.x ?? 0, y: 4 }, 5, 9)).toBe(crumbs)
  expect(ageCrumbs([{ id: 1, x: 0, y: 0, age: 0.95 }], 0.09)).toHaveLength(0)

  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const onValueChange = vi.fn()
  const view = render(<NibCrumbFade onValueChange={onValueChange} className="extra-nib" />)
  const root = rootOf(view.container, "nib-crumb-fade")
  const canvas = view.getByRole("region", { name: "Ink canvas" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "nib-crumb")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root).toHaveAttribute("data-style", "dot")
  expect(root).toHaveAttribute("data-enabled", "on")
  expect(root.className).toContain("extra-nib")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(canvas.className).toContain("focus-visible:ring-2")
  expect(view.getByRole("button", { name: "Mark note" }).className).toContain("focus-visible:ring-2")
  expectHandsOff(view.container)
  const layer = view.container.querySelector("[data-crumb-layer]")
  expect(layer).toHaveClass("pointer-events-none")

  fireEvent.pointerMove(canvas, { clientX: 10, clientY: 12 })
  fireEvent.pointerMove(canvas, { clientX: 20, clientY: 12 })
  expect(root).toHaveAttribute("data-crumbs", "1")
  fireEvent.pointerMove(canvas, { clientX: 90, clientY: 12 })
  expect(root).toHaveAttribute("data-crumbs", "2")
  fireEvent.click(view.getByRole("button", { name: "Mark note" }))
  fireEvent.click(view.getByRole("button", { name: "Save note" }))
  expect(root).toHaveAttribute("data-marks", "1")
  expect(root).toHaveAttribute("data-saves", "1")
  canvas.focus()
  fireEvent.keyDown(canvas, { key: "Enter" })
  expect(root).toHaveAttribute("data-crumbs", "0")
  expect(root).toHaveAttribute("data-clears", "1")
  expect(view.container.textContent).not.toMatch(/evernote|chatgpt|mixpanel/i)

  fireEvent.pointerMove(canvas, { clientX: 12, clientY: 30 })
  expect(root).toHaveAttribute("data-crumbs", "1")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-crumbs", "0")
  expect(queued.size).toBe(0)
  expect(onValueChange).toHaveBeenCalled()

  cleanup()
  installMedia({ reduced: true })
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const still = render(<NibCrumbFade />)
  const quiet = rootOf(still.container, "nib-crumb-fade")
  expect(quiet).toHaveAttribute("data-motion", "off")
  fireEvent.pointerMove(still.getByRole("region", { name: "Ink canvas" }), { clientX: 40, clientY: 40 })
  expect(quiet).toHaveAttribute("data-crumbs", "0")
  expect(queued.size).toBe(0)
  fireEvent.click(still.getByRole("button", { name: "Toggle crumbs" }))
  expect(quiet).toHaveAttribute("data-enabled", "off")
})

test("按压只放一次信标，键盘同样触发，减动效和离屏都卸掉", async () => {
  expect(beaconRadius(0.32, 0)).toBeLessThan(48)
  expect(beaconAlpha(0.9, 0.32)).toBeLessThan(beaconAlpha(0, 0.32))
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<PressSnapBeacon className="extra-beacon" />)
  const root = rootOf(view.container, "press-snap-beacon")
  const alpha = view.getByRole("button", { name: "Alpha" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "press-snap")
  expect(root).toHaveAttribute("data-beacon", "off")
  expect(root).toHaveAttribute("data-rings", "1")
  expect(root.className).toContain("extra-beacon")
  expect(alpha.className).toContain("focus-visible:ring-2")
  expectHandsOff(view.container)

  fireEvent.pointerDown(alpha, { button: 0, clientX: 30, clientY: 24 })
  expect(root).toHaveAttribute("data-picked", "alpha")
  expect(root).toHaveAttribute("data-beacon", "on")
  expect(view.container.querySelector("[data-beacon-layer]")).toHaveClass("pointer-events-none")
  expect(view.container.querySelectorAll("[data-beacon-ring]")).toHaveLength(1)
  act(() => drain(1))
  expect(Number(root.getAttribute("data-progress"))).toBeGreaterThan(0)
  expect(Number(root.getAttribute("data-progress"))).toBeLessThan(1)
  act(() => drain(12))
  expect(root).toHaveAttribute("data-beacon", "off")
  expect(queued.size).toBe(0)
  fireEvent.pointerDown(view.getByRole("button", { name: "Beta" }), { button: 0, clientX: 80, clientY: 24 })
  expect(root).toHaveAttribute("data-picked", "beta")
  expect(root).toHaveAttribute("data-beacon", "on")

  cleanup()
  installFrames()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const keys = render(<PressSnapBeacon count={2} style="pip" />)
  const keyed = rootOf(keys.container, "press-snap-beacon")
  const gamma = keys.getByRole("button", { name: "Gamma" })
  gamma.focus()
  fireEvent.keyDown(gamma, { key: "Enter" })
  expect(keyed).toHaveAttribute("data-picked", "gamma")
  expect(keyed).toHaveAttribute("data-style", "pip")
  expect(keyed).toHaveAttribute("data-rings", "2")
  expect(keys.container.querySelectorAll("[data-beacon-ring]")).toHaveLength(2)
  fireEvent.keyDown(keys.getByRole("button", { name: "Delta" }), { key: " " })
  expect(keyed).toHaveAttribute("data-picked", "delta")
  expect(keys.container.textContent).not.toMatch(/revolut|buffer|amplitude/i)

  cleanup()
  installFrames()
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const moving = render(<PressSnapBeacon />)
  const live = rootOf(moving.container, "press-snap-beacon")
  await waitFor(() => expect(live).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(moving.getByRole("button", { name: "Alpha" }), { button: 0, clientX: 12, clientY: 12 })
  expect(live).toHaveAttribute("data-beacon", "on")
  act(() => emitView(false))
  expect(live).toHaveAttribute("data-beacon", "off")
  expect(live).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  installFrames()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const still = render(<PressSnapBeacon />)
  const quiet = rootOf(still.container, "press-snap-beacon")
  expect(quiet).toHaveAttribute("data-motion", "off")
  fireEvent.pointerDown(still.getByRole("button", { name: "Alpha" }), { button: 0, clientX: 16, clientY: 16 })
  expect(quiet).toHaveAttribute("data-picked", "alpha")
  expect(quiet).toHaveAttribute("data-beacon", "off")
  expect(still.container.querySelector("[data-beacon-ring]")).toBeNull()
  expect(queued.size).toBe(0)
})

test("光晕只贴控件，不跟裸指针，减动效瞬时贴上", async () => {
  expect(approach(0, 72, 0.24)).toBeGreaterThan(0)
  expect(approach(0, 72, 0.24)).toBeLessThan(72)
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<NestSoftHalo className="extra-nest" />)
  const root = rootOf(view.container, "nest-soft-halo")
  const digest = view.getByRole("button", { name: /Daily digest/ })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "nest-halo")
  expect(root).toHaveAttribute("data-nest", "none")
  expect(root).toHaveAttribute("data-trigger", "both")
  expect(root).toHaveAttribute("data-fit", "pad")
  expect(root.className).toContain("extra-nest")
  expect(digest.className).toContain("focus-visible:ring-2")
  expectHandsOff(view.container)
  fireEvent.pointerMove(root, { clientX: 400, clientY: 12 })
  expect(root).toHaveAttribute("data-nest", "none")

  fireEvent.pointerEnter(digest)
  expect(root).toHaveAttribute("data-nest", "digest")
  expect(root).toHaveAttribute("data-moving", "on")
  expect(root).toHaveAttribute("data-eased", "glide")
  expect(view.container.querySelector("[data-halo]")).toHaveClass("pointer-events-none")
  act(() => drain(1))
  expect(Number(root.getAttribute("data-x"))).toBeGreaterThan(0)
  expect(Number(root.getAttribute("data-x"))).toBeLessThan(72)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-x", "72")
  expect(root).toHaveAttribute("data-moving", "off")
  expect(root).toHaveAttribute("data-eased", "cut")
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  fireEvent.click(digest)
  expect(root).toHaveAttribute("data-picks", "1")
  expect(view.container.textContent).not.toMatch(/canny|headspace|obsidian/i)

  cleanup()
  installFrames()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const focusOnly = render(<NestSoftHalo trigger="focus" fit="tight" />)
  const focused = rootOf(focusOnly.container, "nest-soft-halo")
  const quietHours = focusOnly.getByRole("button", { name: /Quiet hours/ })
  fireEvent.pointerEnter(quietHours)
  expect(focused).toHaveAttribute("data-nest", "none")
  expect(focused).toHaveAttribute("data-pad", "2")
  act(() => {
    quietHours.focus()
  })
  expect(focused).toHaveAttribute("data-nest", "quiet")

  cleanup()
  const hoverOnly = render(<NestSoftHalo trigger="hover" />)
  const hovered = rootOf(hoverOnly.container, "nest-soft-halo")
  const pins = hoverOnly.getByRole("button", { name: /Pinned notes/ })
  act(() => {
    pins.focus()
  })
  expect(hovered).toHaveAttribute("data-nest", "none")
  fireEvent.pointerEnter(pins)
  expect(hovered).toHaveAttribute("data-nest", "pins")

  cleanup()
  installMedia({ reduced: true })
  installFrames()
  const still = render(<NestSoftHalo />)
  const calm = rootOf(still.container, "nest-soft-halo")
  expect(calm).toHaveAttribute("data-motion", "off")
  fireEvent.pointerEnter(still.getByRole("button", { name: /Daily digest/ }))
  expect(calm).toHaveAttribute("data-nest", "digest")
  expect(calm).toHaveAttribute("data-eased", "cut")
  expect(calm).toHaveAttribute("data-moving", "off")
  expect(calm).toHaveAttribute("data-x", "72")
  expect(queued.size).toBe(0)
})

test("孪生描边只跟键盘焦点，不抢焦点环，减动效没有脉冲", async () => {
  expect(twinAlpha(0.24, true)).toBeLessThan(twinAlpha(0.24, false))
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<EchoFocusTwin className="extra-echo" />)
  const root = rootOf(view.container, "echo-focus-twin")
  const first = view.getByRole("button", { name: /First card/ })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "echo-focus")
  expect(root).toHaveAttribute("data-twin", "off")
  expect(root).toHaveAttribute("data-keyboard", "on")
  expect(root).toHaveAttribute("data-style", "corners")
  expect(root.className).toContain("extra-echo")
  expect(first.className).toContain("focus-visible:ring-2")
  expectHandsOff(view.container)
  fireEvent.pointerEnter(first)
  expect(root).toHaveAttribute("data-twin", "off")

  fireEvent.keyDown(first, { key: "Tab" })
  act(() => {
    first.focus()
  })
  expect(root).toHaveAttribute("data-twin", "on")
  expect(root).toHaveAttribute("data-target", "first")
  expect(root).toHaveAttribute("data-phase", "0.000")
  const layer = view.container.querySelector("[data-twin-layer]")
  expect(layer).toHaveClass("pointer-events-none")
  expect(layer).not.toHaveAttribute("tabindex")
  expect(view.container.querySelectorAll("[data-twin-corner]")).toHaveLength(4)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-phase", "1.000")
  expect(root).toHaveAttribute("data-twin", "on")
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)

  cleanup()
  installFrames()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const pointer = render(<EchoFocusTwin />)
  const pointed = rootOf(pointer.container, "echo-focus-twin")
  const card = pointer.getByRole("button", { name: /First card/ })
  fireEvent.keyDown(card, { key: "Tab" })
  act(() => {
    card.focus()
  })
  expect(pointed).toHaveAttribute("data-twin", "on")
  const other = pointer.getByRole("button", { name: /Third card/ })
  fireEvent.pointerDown(other)
  act(() => {
    other.focus()
  })
  expect(pointed).toHaveAttribute("data-twin", "off")
  fireEvent.click(card)
  expect(pointed).toHaveAttribute("data-chosen", "first")
  expect(pointer.container.textContent).not.toMatch(/figma|canva|uxcel/i)

  cleanup()
  const soft = render(<EchoFocusTwin keyboardOnly={false} style="ring" />)
  const gentle = rootOf(soft.container, "echo-focus-twin")
  fireEvent.pointerEnter(soft.getByRole("button", { name: /Second card/ }))
  expect(gentle).toHaveAttribute("data-twin", "soft")
  expect(gentle).toHaveAttribute("data-style", "ring")
  expect(gentle).toHaveAttribute("data-keyboard", "off")
  expect(soft.container.querySelector("[data-twin-corner]")).toBeNull()
  expect(soft.container.querySelector("[data-twin-layer]")).toHaveClass("pointer-events-none")

  cleanup()
  installMedia({ reduced: true })
  installFrames()
  const still = render(<EchoFocusTwin />)
  const quiet = rootOf(still.container, "echo-focus-twin")
  const calm = still.getByRole("button", { name: /First card/ })
  fireEvent.keyDown(calm, { key: "Tab" })
  act(() => {
    calm.focus()
  })
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-twin", "on")
  expect(quiet).toHaveAttribute("data-phase", "1.000")
  expect(queued.size).toBe(0)
})

test("拖拇指才留短幽灵，抬起卸掉，Probe 仍可点", async () => {
  expect(whiskLength(0.3)).toBeLessThan(0.2)
  expect(whiskLength(1)).toBeLessThan(0.2)
  expect(lingerFrames(0, 1)).toBe(0)
  expect(lingerFrames(160, 1)).toBeGreaterThan(0)
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<ScrubGhostWhisk className="extra-scrub" />)
  const root = rootOf(view.container, "scrub-ghost-whisk")
  const slider = view.getByRole("slider", { name: "Timeline" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  railBox(slider)
  expect(root).toHaveAttribute("data-ritual", "scrub-ghost")
  expect(root).toHaveAttribute("data-value", "0.420")
  expect(root).toHaveAttribute("data-ghost", "off")
  expect(root).toHaveAttribute("data-style", "line")
  expect(root.className).toContain("extra-scrub")
  expect(slider.className).toContain("focus-visible:ring-2")
  expectHandsOff(view.container)

  fireEvent.pointerDown(slider, { button: 0, clientX: 40, pointerId: 1 })
  expect(root).toHaveAttribute("data-dragging", "on")
  expect(root).toHaveAttribute("data-ghost", "on")
  expect(root).toHaveAttribute("data-value", "0.200")
  fireEvent.pointerMove(slider, { clientX: 120, pointerId: 1 })
  expect(root).toHaveAttribute("data-value", "0.600")
  const ghost = view.container.querySelector("[data-ghost-layer]")
  expect(ghost).toHaveClass("pointer-events-none")
  const span = Number(ghost?.getAttribute("data-to")) - Number(ghost?.getAttribute("data-from"))
  expect(span).toBeGreaterThan(0)
  expect(span).toBeLessThan(0.2)
  fireEvent.pointerUp(slider, { pointerId: 1 })
  expect(root).toHaveAttribute("data-dragging", "off")
  expect(root).toHaveAttribute("data-ghost", "off")
  fireEvent.click(view.getByRole("button", { name: "Probe" }))
  expect(root).toHaveAttribute("data-probes", "1")

  slider.focus()
  fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-value", "0.650")
  expect(root).toHaveAttribute("data-ghost", "on")
  act(() => drain(4))
  expect(root).toHaveAttribute("data-ghost", "off")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(slider, { key: "End" })
  expect(root).toHaveAttribute("data-value", "1.000")
  fireEvent.keyDown(slider, { key: "Home" })
  expect(root).toHaveAttribute("data-value", "0.000")
  expect(view.container.textContent).not.toMatch(/paramount|disney|loom/i)

  act(() => emitView(false))
  fireEvent.pointerDown(slider, { button: 0, clientX: 100, pointerId: 2 })
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-ghost", "off")
  expect(root).toHaveAttribute("data-dragging", "off")

  cleanup()
  installFrames()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const held = render(<ScrubGhostWhisk linger={160} style="pip" />)
  const heldRoot = rootOf(held.container, "scrub-ghost-whisk")
  const heldSlider = held.getByRole("slider", { name: "Timeline" })
  railBox(heldSlider)
  fireEvent.pointerDown(heldSlider, { button: 0, clientX: 80, pointerId: 1 })
  fireEvent.pointerUp(heldSlider, { pointerId: 1 })
  expect(heldRoot).toHaveAttribute("data-ghost", "on")
  expect(heldRoot).toHaveAttribute("data-style", "pip")
  expect(held.container.querySelector("[data-ghost-layer]")).toHaveClass("pointer-events-none")
  fireEvent.click(held.getByRole("button", { name: "Probe" }))
  expect(heldRoot).toHaveAttribute("data-probes", "1")
  expect(heldRoot).toHaveAttribute("data-ghost", "on")
  act(() => drain(8))
  expect(heldRoot).toHaveAttribute("data-ghost", "off")

  cleanup()
  installMedia({ reduced: true })
  installFrames()
  const still = render(<ScrubGhostWhisk />)
  const quiet = rootOf(still.container, "scrub-ghost-whisk")
  const calm = still.getByRole("slider", { name: "Timeline" })
  railBox(calm)
  expect(quiet).toHaveAttribute("data-motion", "off")
  fireEvent.pointerDown(calm, { button: 0, clientX: 100, pointerId: 1 })
  fireEvent.pointerUp(calm, { pointerId: 1 })
  expect(quiet).toHaveAttribute("data-value", "0.500")
  expect(quiet).toHaveAttribute("data-ghost", "off")
  fireEvent.keyDown(calm, { key: "ArrowRight" })
  expect(quiet).toHaveAttribute("data-value", "0.550")
  expect(quiet).toHaveAttribute("data-ghost", "off")
  expect(queued.size).toBe(0)
})

test("檐口墨闪很短且不挡点击，减动效只留静帧", async () => {
  const top = inkBox("top", 0.2, 0.16)
  const loop = inkBox("perimeter", 0.4, 0.16)
  expect(top.w).toBeLessThan(40)
  expect(loop.w === 18 || loop.h === 18).toBe(true)
  expect(loop.w).toBeLessThan(40)
  expect(loop.h).toBeLessThan(40)

  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<BrimFlickInk className="extra-brim" />)
  const root = rootOf(view.container, "brim-flick-ink")
  const notes = view.container.querySelector("[data-card-shell='notes']")
  if (!(notes instanceof HTMLElement)) throw new Error("missing notes")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "brim-flick")
  expect(root).toHaveAttribute("data-flick", "off")
  expect(root).toHaveAttribute("data-edge", "top")
  expect(root).toHaveAttribute("data-once", "on")
  expect(root.className).toContain("extra-brim")
  expect(view.getByRole("button", { name: "Open note" }).className).toContain("focus-visible:ring-2")
  expect(view.getByRole("button", { name: "Continue" }).className).toContain("focus-visible:ring-2")
  expectHandsOff(view.container)

  fireEvent.pointerEnter(notes, { clientX: 4, clientY: 4 })
  expect(root).toHaveAttribute("data-flick", "play")
  expect(root).toHaveAttribute("data-card", "notes")
  expect(view.container.querySelector("[data-ink]")).toHaveClass("pointer-events-none")
  fireEvent.click(view.getByRole("button", { name: "Open note" }))
  expect(root).toHaveAttribute("data-opens", "1")
  expect(root).toHaveAttribute("data-flick", "play")
  act(() => drain(16))
  expect(root).toHaveAttribute("data-flick", "off")
  expect(queued.size).toBe(0)
  fireEvent.pointerEnter(notes, { clientX: 8, clientY: 8 })
  expect(root).toHaveAttribute("data-flick", "off")
  fireEvent.pointerMove(notes, { clientX: 120, clientY: 8 })
  expect(root).toHaveAttribute("data-flick", "off")
  fireEvent.pointerLeave(notes)
  fireEvent.pointerEnter(notes, { clientX: 6, clientY: 6 })
  expect(root).toHaveAttribute("data-flick", "play")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-flick", "off")
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  expect(view.container.textContent).not.toMatch(/magicpath|synthesia|mural/i)

  cleanup()
  installFrames()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const again = render(<BrimFlickInk oncePerEnter={false} edge="start" />)
  const loose = rootOf(again.container, "brim-flick-ink")
  const draft = again.container.querySelector("[data-card-shell='draft']")
  if (!(draft instanceof HTMLElement)) throw new Error("missing draft")
  expect(loose).toHaveAttribute("data-edge", "start")
  expect(loose).toHaveAttribute("data-once", "off")
  fireEvent.pointerEnter(draft, { clientX: 0, clientY: 0 })
  expect(loose).toHaveAttribute("data-flick", "play")
  act(() => drain(16))
  expect(loose).toHaveAttribute("data-flick", "off")
  fireEvent.pointerMove(draft, { clientX: 90, clientY: 4 })
  expect(loose).toHaveAttribute("data-flick", "play")
  fireEvent.click(again.getByRole("button", { name: "Edit draft" }))
  expect(loose).toHaveAttribute("data-edits", "1")
  fireEvent.click(again.getByRole("button", { name: "Continue" }))
  expect(loose).toHaveAttribute("data-continues", "1")

  const open = again.getByRole("button", { name: "Open note" })
  act(() => {
    open.focus()
  })
  expect(loose).toHaveAttribute("data-still", "notes")
  expect(again.container.querySelector("[data-still-edge]")).toHaveClass("pointer-events-none")

  cleanup()
  installMedia({ reduced: true })
  installFrames()
  const still = render(<BrimFlickInk />)
  const quiet = rootOf(still.container, "brim-flick-ink")
  const card = still.container.querySelector("[data-card-shell='notes']")
  if (!(card instanceof HTMLElement)) throw new Error("missing notes")
  expect(quiet).toHaveAttribute("data-motion", "off")
  fireEvent.pointerEnter(card, { clientX: 2, clientY: 2 })
  expect(quiet).toHaveAttribute("data-flick", "off")
  expect(quiet).toHaveAttribute("data-cut", "notes")
  expect(still.container.querySelector("[data-still-edge]")).toHaveClass("pointer-events-none")
  expect(queued.size).toBe(0)
  fireEvent.pointerLeave(card)
  expect(quiet).toHaveAttribute("data-cut", "none")
  fireEvent.click(still.getByRole("button", { name: "Continue" }))
  expect(quiet).toHaveAttribute("data-continues", "1")
})
