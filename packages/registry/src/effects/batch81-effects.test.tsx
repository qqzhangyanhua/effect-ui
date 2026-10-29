// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import { BeforeAfterWipe } from "./before-after-wipe"
import { funnelDropPercent, funnelWidth, FunnelDropStage } from "./funnel-drop-stage"
import { LayerPeelSheet } from "./layer-peel-sheet"
import { linkedNodes, neighborLinkIds, NodeLinkPulse } from "./node-link-pulse"
import { blendFeather, PaneBlendCompare } from "./pane-blend-compare"
import { nudgeAt, RailPinAnnotate, snapAt } from "./rail-pin-annotate"
import { legalStatusTargets, neighborStatus, StatusRailHop } from "./status-rail-hop"

const SLUGS = [
  "rail-pin-annotate",
  "pane-blend-compare",
  "layer-peel-sheet",
  "funnel-drop-stage",
  "status-rail-hop",
  "node-link-pulse",
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

test("六个 slug 都是 batch 81，控件起始值等于默认，且不在豁免名单", () => {
  for (const name of SLUGS) {
    const entry = getComponent(name)
    expect(entry?.batch).toBe(81)
    expect(entry?.props.filter((prop) => prop.control).length).toBeGreaterThanOrEqual(3)
    expect(auditExemptions.some((item) => item.name === name)).toBe(false)
  }
  expect(start("rail-pin-annotate", "pace")).toBe(1)
  expect(start("rail-pin-annotate", "intensity")).toBe(0.7)
  expect(start("rail-pin-annotate", "snap")).toBe(false)
  expect(start("rail-pin-annotate", "oneOpen")).toBe(true)
  expect(start("pane-blend-compare", "pace")).toBe(1)
  expect(start("pane-blend-compare", "intensity")).toBe(0.7)
  expect(start("pane-blend-compare", "showLabels")).toBe(true)
  expect(start("layer-peel-sheet", "threshold")).toBe(0.45)
  expect(start("funnel-drop-stage", "showDrop")).toBe(true)
  expect(start("status-rail-hop", "enforceEdges")).toBe(true)
  expect(start("node-link-pulse", "pulse")).toBe(true)
})

test("轨钉可拖可展开，方向键与方括号能改位置", async () => {
  expect(snapAt(0.3125, false)).toBe(0.31)
  expect(snapAt(0.3125, true)).toBe(0.3)
  expect(nudgeAt(0.48, 1, false)).toBe(0.5)
  expect(nudgeAt(0.48, 1, true)).toBe(0.6)
  const onValueChange = vi.fn()
  const view = render(<RailPinAnnotate onValueChange={onValueChange} className="extra-rail" />)
  const root = rootOf(view.container, "rail-pin-annotate")
  expect(root).toHaveAttribute("data-ritual", "rail-pin")
  expect(root).toHaveAttribute("data-ats", "0.16,0.48,0.78")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("extra-rail")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root).not.toHaveAttribute("tabindex")
  expect(view.getByRole("button", { name: "Milestone A" }).className).toContain("focus-visible:ring-2")
  expect(view.getByText("Milestones")).toBeInTheDocument()
  expect(view.queryByText(/paired|wysa|linkedin|obsidian/i)).toBeNull()
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(root).toHaveAttribute("data-playing", "off")
  })
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "Milestone A" }))
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
  expect(root).toHaveAttribute("data-active", "0")
  expect(root).toHaveAttribute("data-open-count", "1")
  expect(view.getByText("A mark on the early stretch.")).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Milestone B" }))
  expect(root).toHaveAttribute("data-open-count", "1")
  expect(view.queryByText("A mark on the early stretch.")).toBeNull()
  expect(view.getByText("A mark near the middle.")).toBeInTheDocument()
  fireEvent.keyDown(root, { key: "ArrowRight" })
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-active", "2")
  expect(view.getByText("A mark toward the end.")).toBeInTheDocument()
  fireEvent.keyDown(root, { key: "]" })
  expect(root).toHaveAttribute("data-ats", "0.16,0.48,0.80")
  fireEvent.keyDown(root, { key: "[" })
  expect(root).toHaveAttribute("data-ats", "0.16,0.48,0.78")
  const pin = view.getByRole("button", { name: "Milestone A" })
  fireEvent.pointerDown(pin, { clientX: 40, button: 0, pointerId: 4 })
  fireEvent.pointerMove(pin, { clientX: 100, pointerId: 4 })
  fireEvent.pointerUp(pin, { clientX: 100, pointerId: 4 })
  expect(root).toHaveAttribute("data-ats", "0.31,0.48,0.78")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(onValueChange).toHaveBeenCalled()
})

test("吸附刻度，且可以同时展开两个标注", () => {
  const view = render(<RailPinAnnotate snap oneOpen={false} />)
  const root = rootOf(view.container, "rail-pin-annotate")
  expect(root).toHaveAttribute("data-snap", "on")
  expect(root).toHaveAttribute("data-one", "off")
  fireEvent.keyDown(root, { key: "]" })
  expect(root.getAttribute("data-ats")?.startsWith("0.30")).toBe(true)
  fireEvent.click(view.getByRole("button", { name: "Milestone A" }))
  fireEvent.click(view.getByRole("button", { name: "Milestone C" }))
  expect(root).toHaveAttribute("data-open-count", "2")
  expect(root.querySelector("[data-callout='a']")).toBeInTheDocument()
  expect(root.querySelector("[data-callout='c']")).toBeInTheDocument()
})

test("钉呼吸离开视口后停止，减弱动效不再排队", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<RailPinAnnotate />)
  const root = rootOf(view.container, "rail-pin-annotate")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-playing", "off")
  fireEvent.click(view.getByRole("button", { name: "Milestone A" }))
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
  const before = Number(root.getAttribute("data-breath"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-breath"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const frozen = root.getAttribute("data-breath")
  act(() => drain(3))
  expect(root.getAttribute("data-breath")).toBe(frozen)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<RailPinAnnotate />)
  const quiet = rootOf(still.container, "rail-pin-annotate")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-ease", "0")
  fireEvent.keyDown(quiet, { key: "Enter" })
  expect(quiet).toHaveAttribute("data-open-count", "1")
  expect(quiet).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
})

test("软混合滑杆改比例，和硬 wipe 可以区分", () => {
  expect(blendFeather(0)).toBe(0.06)
  expect(blendFeather(1)).toBe(0.56)
  const onValueChange = vi.fn()
  const view = render(<PaneBlendCompare onValueChange={onValueChange} />)
  const root = rootOf(view.container, "pane-blend-compare")
  const wipe = render(<BeforeAfterWipe />)
  const wipeRoot = rootOf(wipe.container, "before-after-wipe")
  expect(root).toHaveAttribute("data-ritual", "pane-blend")
  expect(root).toHaveAttribute("data-blend", "soft")
  expect(wipeRoot).toHaveAttribute("data-ritual", "before-after")
  expect(wipeRoot.getAttribute("data-clip")).toContain("inset")
  const pane = root.querySelector("[data-pane='b']")
  expect(pane).toHaveAttribute("data-mask", expect.stringContaining("linear-gradient"))
  expect(pane?.getAttribute("style") ?? "").not.toContain("clip-path")
  expect(root).toHaveAttribute("data-t", "0.50")
  expect(root).toHaveAttribute("data-labels", "on")
  expect(view.getByText("A")).toBeInTheDocument()
  expect(view.getByText("Layout A")).toBeInTheDocument()
  expect(view.getByText("Layout B")).toBeInTheDocument()
  const stage = root.querySelector("[data-stage]")
  if (!(stage instanceof HTMLElement)) throw new Error("missing stage")
  fireEvent.pointerDown(stage, { clientX: 256, button: 0, pointerId: 3 })
  expect(root).toHaveAttribute("data-t", "0.80")
  expect(root).toHaveAttribute("data-phase", "dragging")
  fireEvent.pointerUp(stage, { pointerId: 3 })
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(onValueChange).toHaveBeenLastCalledWith({ t: 0.8 })
  fireEvent.keyDown(root, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-t", "0.75")
  fireEvent.keyDown(root, { key: "Home" })
  expect(root).toHaveAttribute("data-t", "0.00")
  fireEvent.keyDown(root, { key: "End" })
  expect(root).toHaveAttribute("data-t", "1.00")
  fireEvent.pointerDown(view.getByRole("button", { name: "Compare" }), { button: 0, pointerId: 8 })
  expect(root).toHaveAttribute("data-compare", "on")
  expect(root).toHaveAttribute("data-shown", "0.00")
  fireEvent.pointerUp(view.getByRole("button", { name: "Compare" }), { pointerId: 8 })
  expect(root).toHaveAttribute("data-compare", "off")
  expect(root).toHaveAttribute("data-shown", "1.00")
  expect(root).not.toHaveAttribute("tabindex")
  const blend = root.querySelector("[data-handle]")
  expect(blend).toHaveAttribute("tabindex", "0")
  expect(blend?.className).toContain("focus-visible:ring-ring")
  expect(view.queryByText(/photoroom|azar/i)).toBeNull()
})

test("隐藏标签，减弱动效瞬时切混合比", () => {
  installMedia({ reduced: true })
  const view = render(<PaneBlendCompare showLabels={false} />)
  const root = rootOf(view.container, "pane-blend-compare")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-labels", "off")
  expect(root.querySelector("[data-label='a']")).toBeNull()
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-t", "0.55")
  expect(root).toHaveAttribute("data-shown", "0.55")
  const handle = root.querySelector("[data-handle]")
  expect(handle).toHaveAttribute("style", expect.stringContaining("transition: none"))
})

test("页角超过阈值翻页，未过阈值回落，键盘可调 peel", async () => {
  const low = render(<LayerPeelSheet threshold={0.8} />)
  const lowRoot = rootOf(low.container, "layer-peel-sheet")
  const handle = low.getByRole("slider", { name: "Peel corner" })
  fireEvent.pointerDown(handle, { clientX: 200, clientY: 200, button: 0, pointerId: 5 })
  fireEvent.pointerMove(handle, { clientX: 110, clientY: 110, pointerId: 5 })
  expect(Number(lowRoot.getAttribute("data-peel"))).toBeGreaterThan(0.6)
  expect(low.getByText("Summary of the second sheet.")).toBeInTheDocument()
  fireEvent.pointerUp(handle, { clientX: 110, clientY: 110, pointerId: 5 })
  await waitFor(() => expect(lowRoot).toHaveAttribute("data-playing", "on"))
  act(() => drain(3))
  expect(lowRoot).toHaveAttribute("data-page", "0")
  expect(lowRoot).toHaveAttribute("data-phase", "settling")

  cleanup()
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
  const high = render(<LayerPeelSheet threshold={0.3} />)
  const highRoot = rootOf(high.container, "layer-peel-sheet")
  const corner = high.getByRole("slider", { name: "Peel corner" })
  fireEvent.pointerDown(corner, { clientX: 200, clientY: 200, button: 0, pointerId: 6 })
  fireEvent.pointerMove(corner, { clientX: 110, clientY: 110, pointerId: 6 })
  fireEvent.pointerUp(corner, { clientX: 110, clientY: 110, pointerId: 6 })
  expect(highRoot).toHaveAttribute("data-phase", "turning")
  await waitFor(() => expect(highRoot).toHaveAttribute("data-playing", "on"))
  act(() => drain(20))
  expect(highRoot).toHaveAttribute("data-page", "1")
  expect(highRoot).toHaveAttribute("data-peel", "0.00")
  expect(highRoot).toHaveAttribute("data-phase", "idle")
  expect(high.getByText("The next sheet stays flat until the corner clears.")).toBeInTheDocument()

  cleanup()
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
  const keys = render(<LayerPeelSheet />)
  const keyRoot = rootOf(keys.container, "layer-peel-sheet")
  fireEvent.keyDown(keyRoot, { key: "ArrowRight" })
  expect(keyRoot).toHaveAttribute("data-peel", "0.10")
  expect(keyRoot).toHaveAttribute("data-phase", "idle")
  expect(keyRoot).not.toHaveAttribute("tabindex")
  expect(keys.getByRole("slider", { name: "Peel corner" }).className).toContain("focus-visible:ring-2")
  const curl = keyRoot.querySelector("svg[data-curl]")
  expect(curl?.querySelector("[data-flap]")).toBeInTheDocument()
  expect(curl?.querySelector("[data-crease]")).toBeInTheDocument()
  expect(curl?.querySelector("[data-shade]")).toBeInTheDocument()
  expect(curl?.querySelector("[data-edge]")).toBeInTheDocument()
  expect(keyRoot.querySelector("div[data-curl]")).toBeNull()
  fireEvent.keyDown(keyRoot, { key: "ArrowLeft" })
  expect(keyRoot).toHaveAttribute("data-peel", "0.00")
  expect(keyRoot.querySelector("[data-curl]")).toBeNull()
  expect(keys.queryByText(/wysa|locket/i)).toBeNull()
  expect(keyRoot.className).toContain("motion-reduce:transition-none")
})

test("翻页过渡离开视口后停止，减弱动效瞬时切页", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<LayerPeelSheet threshold={0.3} />)
  const root = rootOf(view.container, "layer-peel-sheet")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const handle = view.getByRole("slider", { name: "Peel corner" })
  fireEvent.pointerDown(handle, { clientX: 180, clientY: 180, button: 0, pointerId: 7 })
  fireEvent.pointerMove(handle, { clientX: 90, clientY: 90, pointerId: 7 })
  fireEvent.pointerUp(handle, { clientX: 90, clientY: 90, pointerId: 7 })
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
  const before = Number(root.getAttribute("data-peel"))
  act(() => drain(2))
  expect(Number(root.getAttribute("data-peel"))).toBeGreaterThan(before)
  expect(root).toHaveAttribute("data-page", "0")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const frozen = root.getAttribute("data-peel")
  act(() => drain(4))
  expect(root.getAttribute("data-peel")).toBe(frozen)
  expect(root).toHaveAttribute("data-page", "0")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<LayerPeelSheet threshold={0.3} />)
  const quiet = rootOf(still.container, "layer-peel-sheet")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-ease", "0")
  const corner = still.getByRole("slider", { name: "Peel corner" })
  fireEvent.pointerDown(corner, { clientX: 180, clientY: 180, button: 0, pointerId: 9 })
  fireEvent.pointerMove(corner, { clientX: 90, clientY: 90, pointerId: 9 })
  fireEvent.pointerUp(corner, { clientX: 90, clientY: 90, pointerId: 9 })
  expect(quiet).toHaveAttribute("data-page", "1")
  expect(quiet).toHaveAttribute("data-peel", "0.00")
  expect(quiet).toHaveAttribute("data-phase", "idle")
  expect(quiet).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(quiet, { key: "Enter" })
  expect(quiet).toHaveAttribute("data-page", "2")
  fireEvent.keyDown(quiet, { key: "Enter" })
  expect(still.getByText("Last sheet")).toBeInTheDocument()
  expect(quiet).toHaveAttribute("data-page", "2")
})

test("漏斗点选高亮掉量，方向键切级，Enter 锁定", () => {
  expect(funnelDropPercent(1)).toBe(33)
  expect(funnelDropPercent(2)).toBe(60)
  expect(funnelDropPercent(3)).toBe(65)
  expect(funnelWidth(120, 1280, 0)).toBe(0.92)
  expect(funnelWidth(120, 1280, 1)).toBeLessThan(0.6)
  const onValueChange = vi.fn()
  const view = render(<FunnelDropStage onValueChange={onValueChange} />)
  const root = rootOf(view.container, "funnel-drop-stage")
  expect(root).toHaveAttribute("data-ritual", "funnel-drop")
  expect(root).toHaveAttribute("data-active", "0")
  expect(view.getByText("First stage")).toBeInTheDocument()
  expect(view.getByText("1280")).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Viewed" }))
  expect(root).toHaveAttribute("data-active", "1")
  expect(root).toHaveAttribute("data-locked", "1")
  expect(root).toHaveAttribute("data-drop-value", "33")
  expect(view.getByText("33% drop")).toBeInTheDocument()
  expect(root.querySelector("[data-bridge='1']")).toHaveAttribute("data-emphasis", "on")
  expect(onValueChange).toHaveBeenLastCalledWith({ activeIndex: 1 })
  fireEvent.keyDown(root, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-active", "2")
  expect(view.getByText("60% drop")).toBeInTheDocument()
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-locked", "2")
  const steep = Number(view.getByRole("button", { name: "Buy" }).getAttribute("data-width"))
  cleanup()
  const flat = render(<FunnelDropStage intensity={0} showDrop={false} />)
  const flatRoot = rootOf(flat.container, "funnel-drop-stage")
  expect(flatRoot).toHaveAttribute("data-drop", "off")
  expect(flat.queryByText(/% drop/)).toBeNull()
  expect(flat.getByText("Counts only")).toBeInTheDocument()
  expect(Number(flat.getByRole("button", { name: "Buy" }).getAttribute("data-width"))).toBeGreaterThan(steep)
  expect(flat.queryByText(/squarespace|monarch/i)).toBeNull()
  expect(flatRoot.className).toContain("bg-card")
  expect(flatRoot).not.toHaveAttribute("tabindex")
  expect(flat.getByRole("button", { name: "Buy" }).className).toContain("focus-visible:ring-2")
})

test("漏斗减弱动效瞬时切高亮", () => {
  installMedia({ reduced: true })
  const view = render(<FunnelDropStage />)
  const root = rootOf(view.container, "funnel-drop-stage")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-active", "1")
  expect(view.getByText("33% drop")).toBeInTheDocument()
  const stage = view.getByRole("button", { name: "Viewed" })
  expect(stage).toHaveAttribute("style", expect.stringContaining("transition: none"))
})

test("状态轨只跳合法边，非法轻拒，方向键后 Enter 确认", async () => {
  expect(legalStatusTargets("saved", true)).toEqual(["progress"])
  expect(neighborStatus("saved", "saved", 1, true)).toBe("progress")
  expect(legalStatusTargets("saved", false)).toContain("archived")
  const onValueChange = vi.fn()
  const view = render(<StatusRailHop onValueChange={onValueChange} />)
  const root = rootOf(view.container, "status-rail-hop")
  expect(root).toHaveAttribute("data-ritual", "status-hop")
  expect(root).not.toHaveAttribute("tabindex")
  expect(view.getByRole("button", { name: "Saved" }).className).toContain("focus-visible:ring-2")
  expect(root).toHaveAttribute("data-active", "saved")
  expect(root).toHaveAttribute("data-edges", "on")
  expect(view.getByText("Now: Saved")).toBeInTheDocument()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Archived" }))
  expect(root).toHaveAttribute("data-active", "saved")
  expect(root).toHaveAttribute("data-reject", "on")
  expect(view.getByText("Kept on Saved")).toBeInTheDocument()
  expect(onValueChange).not.toHaveBeenCalled()
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-focus", "progress")
  expect(root).toHaveAttribute("data-active", "saved")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-phase", "hopping")
  expect(root).toHaveAttribute("data-from", "saved")
  expect(root).toHaveAttribute("data-to", "progress")
  expect(root).toHaveAttribute("data-playing", "on")
  const before = Number(root.getAttribute("data-hop"))
  act(() => drain(2))
  expect(Number(root.getAttribute("data-hop"))).toBeGreaterThan(before)
  expect(Number(root.getAttribute("data-lift"))).toBeGreaterThan(0)
  expect(root).toHaveAttribute("data-active", "saved")
  act(() => drain(20))
  expect(root).toHaveAttribute("data-active", "progress")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(onValueChange).toHaveBeenLastCalledWith({ active: "progress" })
  expect(view.getByText("Now: In progress")).toBeInTheDocument()
  expect(view.queryByText(/linkedin|monday|airtasker/i)).toBeNull()
  expect(root.className).toContain("motion-reduce:transition-none")
})

test("关闭合法边后可以跳到归档，跳跃离开视口后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<StatusRailHop enforceEdges={false} />)
  const root = rootOf(view.container, "status-rail-hop")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-edges", "off")
  fireEvent.click(view.getByRole("button", { name: "Archived" }))
  expect(root).toHaveAttribute("data-phase", "hopping")
  expect(root).toHaveAttribute("data-to", "archived")
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
  act(() => drain(2))
  const frozenHop = root.getAttribute("data-hop")
  expect(Number(frozenHop)).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  act(() => drain(3))
  expect(root.getAttribute("data-hop")).toBe(frozenHop)
  expect(root).toHaveAttribute("data-active", "saved")
})

test("状态轨减弱动效瞬时切态，没有跳弧", () => {
  installMedia({ reduced: true })
  const onValueChange = vi.fn()
  const view = render(<StatusRailHop onValueChange={onValueChange} />)
  const root = rootOf(view.container, "status-rail-hop")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-arc", "0")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-active", "progress")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-lift", "0.00")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  expect(onValueChange).toHaveBeenLastCalledWith({ active: "progress" })
  fireEvent.click(view.getByRole("button", { name: "Archived" }))
  expect(root).toHaveAttribute("data-reject", "on")
  expect(root).toHaveAttribute("data-active", "progress")
})

test("点选节点后邻边脉冲，方向键切换，Enter 锁定", async () => {
  expect(neighborLinkIds("note-a")).toEqual(["a-tag1", "a-tag2"])
  expect(linkedNodes("note-a").map((node) => node.label)).toEqual(["Tag 1", "Tag 2"])
  const onValueChange = vi.fn()
  const view = render(<NodeLinkPulse onValueChange={onValueChange} />)
  const root = rootOf(view.container, "node-link-pulse")
  expect(root).toHaveAttribute("data-ritual", "node-pulse")
  expect(root).toHaveAttribute("data-active", "none")
  expect(view.getByText("Select a note")).toBeInTheDocument()
  expect(root.className).toContain("bg-card")
  expect(root).not.toHaveAttribute("tabindex")
  expect(view.getByRole("button", { name: "Note A" }).className).toContain("focus-visible:ring-2")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "Note A" }))
  expect(root).toHaveAttribute("data-active", "note-a")
  expect(root).toHaveAttribute("data-locked", "on")
  expect(root).toHaveAttribute("data-hot", "2")
  expect(root.querySelector("[data-link='a-tag1']")).toHaveAttribute("data-hot", "on")
  expect(root.querySelector("[data-link='a-tag2']")).toHaveAttribute("data-hot", "on")
  expect(root.querySelector("[data-link='b-c']")).toHaveAttribute("data-hot", "off")
  expect(root.querySelector("[data-linked='tag-1']")).toBeInTheDocument()
  expect(root.querySelector("[data-linked='tag-2']")).toBeInTheDocument()
  expect(onValueChange).toHaveBeenLastCalledWith({ activeId: "note-a" })
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
  const before = Number(root.getAttribute("data-pulse"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-pulse"))).toBeGreaterThan(before)
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-active", "note-b")
  expect(root).toHaveAttribute("data-locked", "off")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-locked", "on")
  expect(root.querySelector("[data-link='b-c']")).toHaveAttribute("data-hot", "on")
  expect(view.queryByText(/obsidian|freeform/i)).toBeNull()
})

test("关系图脉冲离开视口后停止，关闭脉冲或减弱动效只留静态高亮", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<NodeLinkPulse />)
  const root = rootOf(view.container, "node-link-pulse")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Tag 1" }))
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
  act(() => drain(3))
  const frozen = root.getAttribute("data-pulse")
  expect(Number(frozen)).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  act(() => drain(3))
  expect(root.getAttribute("data-pulse")).toBe(frozen)
  expect(root.querySelector("[data-link='a-tag1']")).toHaveAttribute("data-hot", "on")

  cleanup()
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
  const still = render(<NodeLinkPulse pulse={false} />)
  const quiet = rootOf(still.container, "node-link-pulse")
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  fireEvent.click(still.getByRole("button", { name: "Note A" }))
  expect(quiet).toHaveAttribute("data-playing", "off")
  expect(quiet).toHaveAttribute("data-hot", "2")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  const reduced = render(<NodeLinkPulse />)
  const calm = rootOf(reduced.container, "node-link-pulse")
  expect(calm).toHaveAttribute("data-motion", "off")
  expect(calm).toHaveAttribute("data-ease", "0")
  fireEvent.click(reduced.getByRole("button", { name: "Note C" }))
  expect(calm).toHaveAttribute("data-active", "note-c")
  expect(calm).toHaveAttribute("data-playing", "off")
  expect(calm.querySelector("[data-link='c-tag1']")).toHaveAttribute("data-hot", "on")
  expect(calm.querySelector("[data-link='b-c']")).toHaveAttribute("data-hot", "on")
  expect(queued.size).toBe(0)
})
