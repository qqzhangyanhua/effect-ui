// @vitest-environment jsdom

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import { dockScale, dockShadow, DockSettlePop, stepOrder } from "./dock-settle-pop"
import { GripLiftRise, liftRise, liftScale, moveRow } from "./grip-lift-rise"
import { beamOpacity, LaneInsertBeam, moveCard } from "./lane-insert-beam"
import { rejectRim, rejectShift, RimRejectWobble } from "./rim-reject-wobble"
import { relocate, shimHeight, SlotGapShim } from "./slot-gap-shim"
import { awayShift, returnShift, SnapHomeCancel } from "./snap-home-cancel"

const SLUGS = [
  "grip-lift-rise",
  "slot-gap-shim",
  "lane-insert-beam",
  "rim-reject-wobble",
  "snap-home-cancel",
  "dock-settle-pop",
] as const

const brands = /hubspot|calendly|bonsai|zillow|disney|paypal|intercom|substack|clerk|claude|tidal|coinbase|vercel|melio|uvodo|etsy|upwork|\bmaze\b|google|gsap|tldraw|webgl/i

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
  expect(container.querySelector("canvas")).toBeNull()
  expect(container.querySelector(".fixed.inset-0")).toBeNull()
}

function expectDecorative(node: Element | null) {
  expect(node).not.toBeNull()
  expect(node).toHaveStyle({ pointerEvents: "none" })
  expect(node).not.toHaveAttribute("tabindex")
}

beforeEach(() => {
  installMedia()
  installFrames()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  vi.stubGlobal("AudioContext", class AudioContext {
    constructor() {
      throw new Error("no audio")
    }
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("六个拖放微反馈的目录、静帧数学和源码约束", () => {
  expect(moveRow([{ id: "a" }, { id: "b" }, { id: "c" }], "a", 1).map((row) => row.id)).toEqual(["b", "a", "c"])
  expect(liftScale(1, 1, "shadow", true)).toBe(1)
  expect(liftScale(1, 1, "scale", false)).toBeGreaterThan(1)
  expect(liftScale(1, 1, "scale", false)).toBeLessThan(1.08)
  expect(liftRise(1, 0.28, "shadow", true)).toBeGreaterThan(4)
  expect(liftRise(1, 1, "shadow", true)).toBeLessThanOrEqual(14)
  expect(relocate(["a", "b", "c", "d"], "b", 3)).toEqual(["a", "c", "b", "d"])
  expect(relocate(["a", "b", "c", "d"], "b", 0)).toEqual(["b", "a", "c", "d"])
  expect(shimHeight(1, 0.42, true)).toBeGreaterThan(16)
  expect(shimHeight(0, 0.42, false)).toBe(0)
  const moved = moveCard({ open: ["a", "b"], hold: ["c"] }, "a", "hold", 0)
  expect(moved.open).toEqual(["b"])
  expect(moved.hold).toEqual(["a", "c"])
  expect(beamOpacity(1, 0.4, true)).toBeGreaterThan(0.4)
  expect(rejectShift(0.5, 1, "soft", false)).toBeGreaterThan(0)
  expect(rejectShift(0.5, 1, "soft", false)).toBeLessThanOrEqual(3)
  expect(rejectShift(0.5, 1, "soft", true)).toBe(0)
  expect(rejectShift(0.5, 1, "rim", false)).toBe(0)
  expect(rejectShift(0.5, 1, "none", false)).toBe(0)
  expect(rejectRim(1, 0.22, "none", true)).toBe(0)
  expect(rejectRim(1, 0.22, "rim", true)).toBeGreaterThan(0)
  expect(returnShift(0, 0.36, "snap", false)).toBeGreaterThan(10)
  expect(returnShift(1, 0.36, "snap", false)).toBe(0)
  expect(returnShift(0, 0.36, "fade", false)).toBe(0)
  expect(returnShift(0, 0.36, "snap", true)).toBe(0)
  expect(awayShift(0.36)).toBeGreaterThan(16)
  expect(stepOrder(["a", "b", "c"], "a")).toEqual(["b", "a", "c"])
  expect(dockScale(0.5, 0.3, "pop", false)).toBeGreaterThan(1)
  expect(dockScale(0.5, 0.3, "pop", true)).toBe(1)
  expect(dockScale(0.5, 0.3, "shadow", false)).toBe(1)
  expect(dockShadow(0.5, 0.3, "shadow", false)).toBeGreaterThan(0)
  expect(dockShadow(0.5, 0.3, "shadow", true)).toBe(0)
  expect(dockShadow(0.5, 0.3, "pop", false)).toBe(0)

  const dir = path.dirname(fileURLToPath(import.meta.url))
  for (const name of SLUGS) {
    const entry = getComponent(name)
    expect(entry?.batch).toBe(89)
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
    const source = fs.readFileSync(path.join(dir, `${name}.tsx`), "utf8")
    expect(source).toMatch(/usePrefersReducedMotion/)
    expect(source).toMatch(/useAnimationActive/)
    expect(source).toMatch(/motion-reduce:/)
    expect(source).toMatch(/original implementation/)
    expect(source).toMatch(/mobbin\.com\/screens\//)
    expect(source).toMatch(/pointer-events-none/)
    expect(source).not.toMatch(/AudioContext|getUserMedia|@dnd-kit|react-beautiful-dnd|from ["']gsap|from ["']matter-js|tldraw|webgl/i)
  }
})

test("拖柄抬起可键盘重排，取消回到原顺序，空列表可切换", async () => {
  const view = render(<GripLiftRise className="extra-grip" />)
  const root = rootOf(view.container, "grip-lift-rise")
  const grip = view.getByRole("button", { name: "Grip Item A" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "grip-lift")
  expect(root).toHaveClass("extra-grip")
  expect(root).toHaveAttribute("data-order", "a,b,c,d")
  expect(grip.className).toContain("focus-visible:ring-2")
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  grip.focus()
  fireEvent.keyDown(grip, { key: " " })
  expect(root).toHaveAttribute("data-phase", "lifted")
  expect(root).toHaveAttribute("data-grab", "run")
  expectDecorative(root.querySelector("[data-lift-plate]"))
  fireEvent.keyDown(grip, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-order", "b,a,c,d")
  fireEvent.keyDown(grip, { key: "Escape" })
  expect(root).toHaveAttribute("data-order", "a,b,c,d")
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(root).toHaveAttribute("data-grab", "off")
  expect(grip).toHaveFocus()
  fireEvent.keyDown(grip, { key: " " })
  fireEvent.keyDown(grip, { key: "ArrowDown" })
  fireEvent.click(view.getByRole("button", { name: "Release" }))
  expect(root).toHaveAttribute("data-order", "b,a,c,d")
  expect(root).toHaveAttribute("data-phase", "placed")
  fireEvent.click(view.getByRole("button", { name: "Show empty" }))
  expect(root).toHaveAttribute("data-phase", "empty")
  expect(view.getByRole("status")).toHaveTextContent("Empty list")
  expect(view.getByText("No items")).toBeInTheDocument()
  expect(view.queryByRole("button", { name: "Grip Item A" })).toBeNull()
  fireEvent.click(view.getByRole("button", { name: "Restore items" }))
  expect(view.getByRole("button", { name: "Grip Item A" })).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-order", "a,b,c,d")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<GripLiftRise />)
  const quiet = rootOf(still.container, "grip-lift-rise")
  const quietGrip = still.getByRole("button", { name: "Grip Item A" })
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(quietGrip, { key: "Enter" })
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-grab", "still")
  expect(quiet.getAttribute("data-lift")).toBe(String(liftRise(1, 0.28, "shadow", true)))
})

test("行间占位缝可预览、落下和取消，幽灵不接收指针", async () => {
  const view = render(<SlotGapShim />)
  const root = rootOf(view.container, "slot-gap-shim")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "slot-shim")
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  fireEvent.click(view.getByRole("button", { name: "Simulate drag" }))
  expect(root).toHaveAttribute("data-phase", "dragging")
  expect(root).toHaveAttribute("data-order", "a,b,c,d")
  act(() => drain(40))
  expect(root).toHaveAttribute("data-shim", "still")
  expect(Number(root.getAttribute("data-gap"))).toBeGreaterThan(8)
  expectDecorative(root.querySelector("[data-shim]"))
  expectDecorative(root.querySelector("[data-ghost]"))
  fireEvent.click(view.getByRole("button", { name: "Cancel" }))
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(root).toHaveAttribute("data-order", "a,b,c,d")
  expect(root).toHaveAttribute("data-shim", "off")
  expect(view.getByRole("button", { name: "Item B" })).toHaveFocus()
  fireEvent.click(view.getByRole("button", { name: "Simulate drag" }))
  fireEvent.click(view.getByRole("button", { name: "Drop" }))
  expect(root).toHaveAttribute("data-order", "a,c,b,d")
  expect(root).toHaveAttribute("data-phase", "placed")
  fireEvent.click(view.getByRole("button", { name: "Show empty" }))
  expect(root).toHaveAttribute("data-phase", "empty")
  expect(view.getByText("No items")).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-order", "a,b,c,d")
  expect(root).toHaveAttribute("data-phase", "rest")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<SlotGapShim style="fill" ghost="off" />)
  const quiet = rootOf(still.container, "slot-gap-shim")
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  fireEvent.click(still.getByRole("button", { name: "Simulate drag" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-shim", "still")
  expect(quiet).toHaveAttribute("data-style", "fill")
  expect(quiet.querySelector("[data-ghost]")).toBeNull()
  expect(Number(quiet.getAttribute("data-gap"))).toBeGreaterThan(8)
})

test("插入 beam 可瞄准、落列和取消，空列也能亮起", async () => {
  const view = render(<LaneInsertBeam />)
  const root = rootOf(view.container, "lane-insert-beam")
  const card = view.getByRole("button", { name: "Item A" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "lane-beam")
  expect(root).toHaveAttribute("data-open", "a,b")
  expect(root).toHaveAttribute("data-hold", "c")
  expect(card.className).toContain("focus-visible:ring-2")
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  card.focus()
  fireEvent.keyDown(card, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-phase", "aiming")
  expect(root).toHaveAttribute("data-lane", "hold")
  expect(root).toHaveAttribute("data-open", "a,b")
  expect(view.getByRole("status")).toHaveTextContent("Insert here")
  expectDecorative(root.querySelector("[data-beam-layer]"))
  fireEvent.keyDown(card, { key: "Escape" })
  expect(root).toHaveAttribute("data-beam", "off")
  expect(root).toHaveAttribute("data-open", "a,b")
  expect(root).toHaveAttribute("data-hold", "c")
  expect(card).toHaveFocus()
  fireEvent.click(view.getByRole("button", { name: "Move to Hold" }))
  expect(root).toHaveAttribute("data-phase", "moved")
  expect(root).toHaveAttribute("data-beam", "off")
  expect(root).toHaveAttribute("data-open", "b")
  expect(root).toHaveAttribute("data-hold", "a,c")
  fireEvent.click(view.getByRole("button", { name: "Empty Hold" }))
  expect(root).toHaveAttribute("data-hold", "empty")
  expect(view.getByText("Empty lane")).toBeInTheDocument()
  fireEvent.keyDown(view.getByRole("button", { name: "Item B" }), { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-lane", "hold")
  expect(root.querySelector("[data-beam-layer]")).not.toBeNull()
  fireEvent.click(view.getByRole("button", { name: "Restore lanes" }))
  expect(root).toHaveAttribute("data-open", "a,b")
  expect(root).toHaveAttribute("data-hold", "c")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<LaneInsertBeam style="column" label="off" />)
  const quiet = rootOf(still.container, "lane-insert-beam")
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(still.getByRole("button", { name: "Item A" }), { key: "ArrowRight" })
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-beam", "still")
  expect(quiet).toHaveAttribute("data-style", "column")
  expect(still.getByRole("status")).toHaveTextContent("Aiming at hold")
  expect(still.queryByText("Insert here")).toBeNull()
})

test("无效区拒绝有文字和图标，soft 只位移一次，Esc 清除", async () => {
  const view = render(<RimRejectWobble />)
  const root = rootOf(view.container, "rim-reject-wobble")
  const attempt = view.getByRole("button", { name: "Attempt invalid move" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "rim-reject")
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(view.getByText("Locked")).toBeInTheDocument()
  expect(root.querySelector("[data-icon='block']")).not.toBeNull()
  expect(attempt.className).toContain("focus-visible:ring-2")
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  fireEvent.click(attempt)
  expect(root).toHaveAttribute("data-phase", "reject")
  expect(root).toHaveAttribute("data-reject", "run")
  expect(root).toHaveAttribute("data-shift", "0")
  expect(view.getByRole("status")).toHaveTextContent("Can't drop here")
  expectDecorative(root.querySelector("[data-rim-layer]"))
  fireEvent.keyDown(attempt, { key: "Escape" })
  expect(root).toHaveAttribute("data-reject", "off")
  expect(attempt).toHaveFocus()
  expect(view.getByRole("status")).toHaveTextContent("Resting")

  cleanup()
  const soft = render(<RimRejectWobble nudge="soft" intensity={1} />)
  const softRoot = rootOf(soft.container, "rim-reject-wobble")
  await waitFor(() => expect(softRoot).toHaveAttribute("data-live", "on"))
  fireEvent.click(soft.getByRole("button", { name: "Attempt invalid move" }))
  act(() => drain(1))
  const shift = Number(softRoot.getAttribute("data-shift"))
  expect(shift).toBeGreaterThan(0)
  expect(shift).toBeLessThanOrEqual(3)
  act(() => drain(40))
  expect(softRoot).toHaveAttribute("data-shift", "0")
  expect(softRoot).toHaveAttribute("data-reject", "still")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<RimRejectWobble nudge="soft" copy="off" />)
  const quiet = rootOf(still.container, "rim-reject-wobble")
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  fireEvent.click(still.getByRole("button", { name: "Attempt invalid move" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-reject", "still")
  expect(quiet).toHaveAttribute("data-shift", "0")
  expect(still.getByRole("status")).toHaveTextContent("Blocked")
  expect(still.queryByText("Can't drop here")).toBeNull()
  expect(quiet.querySelector("[data-icon='block']")).not.toBeNull()
})

test("Esc 与 Cancel 把拖动项带回原位，Drop 才改变顺序", async () => {
  const view = render(<SnapHomeCancel />)
  const root = rootOf(view.container, "snap-home-cancel")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "snap-home")
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  fireEvent.click(view.getByRole("button", { name: "Start drag" }))
  expect(root).toHaveAttribute("data-phase", "dragging")
  expect(root).toHaveAttribute("data-order", "a,b,c,d")
  expect(Number(root.getAttribute("data-shift"))).toBeGreaterThan(10)
  expectDecorative(root.querySelector("[data-ghost]"))
  expectDecorative(root.querySelector("[data-home-mark]"))
  fireEvent.keyDown(view.getByRole("button", { name: "Start drag" }), { key: "Escape" })
  act(() => drain(40))
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(root).toHaveAttribute("data-order", "a,b,c,d")
  expect(root).toHaveAttribute("data-flight", "off")
  expect(root.querySelector("[data-ghost]")).toBeNull()
  expect(view.getByRole("button", { name: "Item B" })).toHaveFocus()
  fireEvent.click(view.getByRole("button", { name: "Start drag" }))
  fireEvent.click(view.getByRole("button", { name: "Drop" }))
  expect(root).toHaveAttribute("data-order", "a,c,d,b")
  expect(root).toHaveAttribute("data-phase", "placed")
  expect(root.querySelector("[data-ghost]")).toBeNull()
  fireEvent.click(view.getByRole("button", { name: "Show empty" }))
  expect(root).toHaveAttribute("data-phase", "empty")
  expect(view.getByText("No items")).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-order", "a,b,c,d")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<SnapHomeCancel style="fade" origin="lift" />)
  const quiet = rootOf(still.container, "snap-home-cancel")
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  fireEvent.click(still.getByRole("button", { name: "Start drag" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-flight", "still")
  fireEvent.click(still.getByRole("button", { name: "Cancel" }))
  expect(quiet).toHaveAttribute("data-phase", "rest")
  expect(quiet).toHaveAttribute("data-order", "a,b,c,d")
  expect(quiet).toHaveAttribute("data-flight", "off")
  expect(quiet.querySelector("[data-ghost]")).toBeNull()
  expect(still.getByRole("button", { name: "Item B" })).toHaveFocus()
})

test("成功落位才 settle，取消预览不改顺序，焦点留在落位项", async () => {
  const view = render(<DockSettlePop />)
  const root = rootOf(view.container, "dock-settle-pop")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "dock-settle")
  expect(root).toHaveAttribute("data-order", "a,b,c")
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  fireEvent.click(view.getByRole("button", { name: "Preview" }))
  expect(root).toHaveAttribute("data-phase", "preview")
  expect(root).toHaveAttribute("data-settle", "off")
  expectDecorative(root.querySelector("[data-preview]"))
  fireEvent.click(view.getByRole("button", { name: "Cancel" }))
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(root).toHaveAttribute("data-order", "a,b,c")
  expect(root).toHaveAttribute("data-settle", "off")
  expect(view.getByRole("button", { name: "Item A" })).toHaveFocus()
  fireEvent.click(view.getByRole("button", { name: "Commit move" }))
  expect(root).toHaveAttribute("data-order", "b,a,c")
  expect(root).toHaveAttribute("data-phase", "docked")
  expect(root).toHaveAttribute("data-settle", "run")
  expect(view.getByRole("button", { name: "Item A" })).toHaveFocus()
  expect(view.getByRole("button", { name: "Item A" }).className).toContain("focus-visible:ring-2")
  expectDecorative(root.querySelector("[data-dock-plate]"))
  act(() => drain(40))
  expect(root).toHaveAttribute("data-settle", "still")
  expect(root).toHaveAttribute("data-scale", "1")
  expect(view.getByRole("status")).toHaveTextContent("Docked")
  fireEvent.click(view.getByRole("button", { name: "Show empty" }))
  expect(root).toHaveAttribute("data-phase", "empty")
  expect(view.getByText("No items")).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Commit move" }))
  expect(root).toHaveAttribute("data-phase", "empty")
  expect(root).toHaveAttribute("data-settle", "off")
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-order", "a,b,c")

  cleanup()
  installMedia({ reduced: true })
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const still = render(<DockSettlePop style="shadow" anchor="card" />)
  const quiet = rootOf(still.container, "dock-settle-pop")
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  fireEvent.click(still.getByRole("button", { name: "Commit move" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-settle", "still")
  expect(quiet).toHaveAttribute("data-scale", "1")
  expect(quiet).toHaveAttribute("data-anchor", "card")
  expect(quiet).toHaveAttribute("data-order", "b,a,c")
  emitView(false)
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "off"))
  expect(quiet).toHaveAttribute("data-order", "b,a,c")
  expect(quiet).toHaveAttribute("data-settle", "still")
})
