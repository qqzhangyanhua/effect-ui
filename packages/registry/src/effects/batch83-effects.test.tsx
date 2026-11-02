// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import { coastKeep, InertiaNotchCoast, nearestNotch, notchAt, notchCountOf, notchLabel } from "./inertia-notch-coast"
import { latchHeld, latchOvershoot, LatchThumbSpring } from "./latch-thumb-spring"
import { catchRadius, insidePocket, MagnetPocketCatch, POCKET, previewPoint, TOKEN_HOME } from "./magnet-pocket-catch"
import { PressSquashTile, settleAt, squashScale } from "./press-squash-tile"
import { shardCountOf, ShardVeilClear, veilAlpha } from "./shard-veil-clear"
import { tetherFromPointer, tetherStep, tetherTravel, TetherYankReturn } from "./tether-yank-return"

const SLUGS = [
  "press-squash-tile",
  "tether-yank-return",
  "magnet-pocket-catch",
  "shard-veil-clear",
  "inertia-notch-coast",
  "latch-thumb-spring",
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

test("六个 slug 都是 batch 83，控件起始值等于默认，且不在豁免名单", () => {
  for (const name of SLUGS) {
    const entry = getComponent(name)
    expect(entry?.batch).toBe(83)
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
  expect(start("press-squash-tile", "intensity")).toBe(0.4)
  expect(start("press-squash-tile", "shadow")).toBe(true)
  expect(start("press-squash-tile", "axis")).toBe("y")
  expect(start("tether-yank-return", "stiffness")).toBe(1)
  expect(start("tether-yank-return", "showRope")).toBe(true)
  expect(start("magnet-pocket-catch", "radius")).toBe(1)
  expect(start("magnet-pocket-catch", "snapPreview")).toBe(true)
  expect(start("shard-veil-clear", "shardCount")).toBe(8)
  expect(start("shard-veil-clear", "veilOpacity")).toBe(0.86)
  expect(start("inertia-notch-coast", "notches")).toBe(5)
  expect(start("inertia-notch-coast", "showTicks")).toBe(true)
  expect(start("latch-thumb-spring", "intensity")).toBe(0.28)
  expect(start("latch-thumb-spring", "trackFill")).toBe(true)
  expect(start("latch-thumb-spring", "labels")).toBe(true)
})

test("瓦片按下后回弹到静置，文案保持可读", () => {
  expect(squashScale(0.4, "y").y).toBeLessThan(1)
  expect(squashScale(0.4, "y").x).toBe(1)
  expect(squashScale(1, "uniform").x).toBe(squashScale(1, "uniform").y)
  const peak = settleAt(7, 10, 1, 0, -0.2)
  expect(peak).toBeLessThan(0)
  expect(settleAt(10, 10, 1, 0, -0.2)).toBe(0)
  const onValueChange = vi.fn()
  const view = render(<PressSquashTile onValueChange={onValueChange} className="extra-tile" />)
  const root = rootOf(view.container, "press-squash-tile")
  expect(root).toHaveAttribute("data-ritual", "press-squash")
  expect(root).toHaveAttribute("data-pose", "rest")
  expect(root).toHaveAttribute("data-axis", "y")
  expect(root).toHaveAttribute("data-shadow", "on")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("extra-tile")
  expect(root.className).toContain("motion-reduce:transition-none")
  const tile = view.getByRole("button", { name: "Field note" })
  expect(tile.className).toContain("focus-visible:ring-2")
  expect(view.getByText("A short record from the morning pass.")).toBeInTheDocument()
  fireEvent.keyDown(tile, { key: "Enter" })
  expect(root).toHaveAttribute("data-pose", "pressed")
  act(() => drain(30))
  expect(root).toHaveAttribute("data-pose", "rest")
  expect(root).toHaveAttribute("data-amount", "0.000")
  expect(queued.size).toBe(0)
  expect(view.getByText("Neutral copy stays readable while the tile settles.")).toBeInTheDocument()
  fireEvent.pointerDown(view.getByRole("button", { name: "Shelf card" }), { button: 0, pointerId: 3 })
  expect(root).toHaveAttribute("data-tile", "shelf")
  expect(root).toHaveAttribute("data-pose", "pressed")
  fireEvent.pointerUp(view.getByRole("button", { name: "Shelf card" }), { button: 0, pointerId: 3 })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-pose", "rest")
  expect(root.innerHTML).not.toMatch(/animate-bounce|neon|jelly/)
  expect(view.queryByText(/insight timer|snapchat|tide/i)).toBeNull()
  expect(onValueChange).toHaveBeenCalled()
})

test("瓦片离开视口后停在静置，减弱动效没有回弹帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<PressSquashTile />)
  const root = rootOf(view.container, "press-squash-tile")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(view.getByRole("button", { name: "Field note" }), { key: " " })
  act(() => drain(2))
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-pose", "rest")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  act(() => drain(4))
  expect(root).toHaveAttribute("data-amount", "0.000")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<PressSquashTile axis="uniform" shadow={false} />)
  const quiet = rootOf(still.container, "press-squash-tile")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-ease", "0")
  expect(quiet).toHaveAttribute("data-axis", "uniform")
  expect(quiet).toHaveAttribute("data-shadow", "off")
  fireEvent.keyDown(still.getByRole("button", { name: "Field note" }), { key: "Enter" })
  expect(quiet).toHaveAttribute("data-pose", "rest")
  expect(queued.size).toBe(0)
})

test("牵绳拖离后回到锚点，说明不被牵绳盖住", () => {
  expect(tetherTravel(0.55)).toBeGreaterThan(0.2)
  expect(tetherFromPointer(0.18, 0.55)).toBe(0)
  expect(tetherStep(0.1, 0.08, 0.55)).toBeCloseTo(0.18)
  const onValueChange = vi.fn()
  const view = render(<TetherYankReturn onValueChange={onValueChange} className="extra-tether" />)
  const root = rootOf(view.container, "tether-yank-return")
  expect(root).toHaveAttribute("data-ritual", "tether-yank")
  expect(root).toHaveAttribute("data-pull", "0.000")
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(root).toHaveAttribute("data-rope", "on")
  expect(root.className).toContain("extra-tether")
  const handle = view.getByRole("slider", { name: "Tether handle" })
  expect(handle.className).toContain("focus-visible:ring-2")
  const caption = view.getByText(/springs back to the anchor/)
  expect(handle.querySelector("svg")?.contains(caption)).toBe(false)
  fireEvent.keyDown(handle, { key: "ArrowRight" })
  expect(Number(root.getAttribute("data-pull"))).toBeGreaterThan(0)
  fireEvent.keyDown(handle, { key: "Home" })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-pull", "0.000")
  expect(root).toHaveAttribute("data-phase", "rest")
  fireEvent.keyDown(handle, { key: "Enter" })
  expect(Number(root.getAttribute("data-pull"))).toBeGreaterThan(0.2)
  act(() => drain(30))
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(root).toHaveAttribute("data-pull", "0.000")
  fireEvent.pointerDown(handle, { clientX: 260, button: 0, pointerId: 4 })
  fireEvent.pointerUp(handle, { clientX: 260, button: 0, pointerId: 4 })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-pull", "0.000")
  expect(root.innerHTML).not.toMatch(/animate-bounce|neon/)
  expect(view.queryByText(/wise|discord|best buy/i)).toBeNull()
  expect(onValueChange).toHaveBeenCalled()
})

test("牵绳可以藏起，减弱动效与离屏都直接回锚", async () => {
  const hidden = render(<TetherYankReturn showRope={false} />)
  const bare = rootOf(hidden.container, "tether-yank-return")
  expect(bare).toHaveAttribute("data-rope", "off")
  expect(bare.querySelector("svg")).toBeNull()
  cleanup()

  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<TetherYankReturn />)
  const root = rootOf(view.container, "tether-yank-return")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const handle = view.getByRole("slider", { name: "Tether handle" })
  fireEvent.keyDown(handle, { key: "Enter" })
  act(() => drain(2))
  expect(root).toHaveAttribute("data-phase", "return")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(root).toHaveAttribute("data-pull", "0.000")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<TetherYankReturn />)
  const quiet = rootOf(still.container, "tether-yank-return")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-ease", "0")
  fireEvent.keyDown(still.getByRole("slider", { name: "Tether handle" }), { key: "Enter" })
  expect(quiet).toHaveAttribute("data-pull", "0.000")
  expect(queued.size).toBe(0)
})

test("筹码进入半径后入袋，标签留在画布外", () => {
  expect(catchRadius(1)).toBeCloseTo(0.18)
  expect(insidePocket(TOKEN_HOME, 1)).toBe(false)
  expect(insidePocket(POCKET, 1)).toBe(true)
  expect(previewPoint(TOKEN_HOME, 0.55, true).x).toBeGreaterThan(TOKEN_HOME.x)
  const onValueChange = vi.fn()
  const view = render(<MagnetPocketCatch onValueChange={onValueChange} className="extra-pocket" />)
  const root = rootOf(view.container, "magnet-pocket-catch")
  expect(root).toHaveAttribute("data-ritual", "magnet-pocket")
  expect(root).toHaveAttribute("data-docked", "off")
  expect(root).toHaveAttribute("data-phase", "free")
  expect(root.className).toContain("extra-pocket")
  const stage = view.getByRole("group", { name: "Pocket token" })
  expect(stage.className).toContain("focus-visible:ring-2")
  const label = view.getByText("袋外")
  expect(stage.contains(label)).toBe(false)
  for (let step = 0; step < 8; step += 1) fireEvent.keyDown(stage, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-phase", "preview")
  fireEvent.keyDown(stage, { key: "Escape" })
  expect(root).toHaveAttribute("data-phase", "free")
  expect(root).toHaveAttribute("data-docked", "off")
  fireEvent.keyDown(stage, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-phase", "preview")
  fireEvent.keyDown(stage, { key: "Enter" })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-docked", "on")
  expect(root).toHaveAttribute("data-phase", "docked")
  expect(view.getByText("袋内")).toBeInTheDocument()
  expect(stage.contains(view.getByText("袋内"))).toBe(false)
  fireEvent.keyDown(stage, { key: "Enter" })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-docked", "off")
  fireEvent.pointerDown(stage, { clientX: 70, clientY: 88, button: 0, pointerId: 5 })
  fireEvent.pointerMove(stage, { clientX: 230, clientY: 88, button: 0, pointerId: 5 })
  fireEvent.pointerUp(stage, { clientX: 230, clientY: 88, button: 0, pointerId: 5 })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-docked", "on")
  expect(root.innerHTML).not.toMatch(/animate-bounce|neon/)
  expect(view.queryByText(/airtable|gumloop|maze/i)).toBeNull()
  expect(onValueChange).toHaveBeenCalled()
})

test("口袋减弱动效瞬时入袋，离屏停在终态", async () => {
  const quietPreview = render(<MagnetPocketCatch snapPreview={false} radius={1.4} />)
  expect(rootOf(quietPreview.container, "magnet-pocket-catch")).toHaveAttribute("data-preview", "off")
  cleanup()

  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<MagnetPocketCatch />)
  const root = rootOf(view.container, "magnet-pocket-catch")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const stage = view.getByRole("group", { name: "Pocket token" })
  for (let step = 0; step < 8; step += 1) fireEvent.keyDown(stage, { key: "ArrowRight" })
  fireEvent.keyDown(stage, { key: "Enter" })
  act(() => drain(2))
  expect(root).toHaveAttribute("data-phase", "catch")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-docked", "on")
  expect(root).toHaveAttribute("data-phase", "docked")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<MagnetPocketCatch />)
  const quiet = rootOf(still.container, "magnet-pocket-catch")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-ease", "0")
  const quietStage = still.getByRole("group", { name: "Pocket token" })
  for (let step = 0; step < 8; step += 1) fireEvent.keyDown(quietStage, { key: "ArrowRight" })
  fireEvent.keyDown(quietStage, { key: "Enter" })
  expect(quiet).toHaveAttribute("data-docked", "on")
  expect(queued.size).toBe(0)
})

test("遮罩碎开后正文全可读，碎片不留在终态", () => {
  expect(shardCountOf(2)).toBe(4)
  expect(shardCountOf(20)).toBe(12)
  expect(veilAlpha(2)).toBe(1)
  const onValueChange = vi.fn()
  const view = render(<ShardVeilClear onValueChange={onValueChange} className="extra-shard" />)
  const root = rootOf(view.container, "shard-veil-clear")
  expect(root).toHaveAttribute("data-ritual", "shard-veil")
  expect(root).toHaveAttribute("data-phase", "veiled")
  expect(root).toHaveAttribute("data-count", "8")
  expect(root.className).toContain("extra-shard")
  const copy = view.getByText(/stays readable/)
  expect(copy.className).toContain("text-foreground")
  expect(root.querySelector("[data-veil]")).toBeTruthy()
  expect(root.querySelector("[data-veil]")?.contains(copy)).toBe(false)
  const card = view.getByRole("button", { name: "Clear cover" })
  expect(card.className).toContain("focus-visible:ring-2")
  fireEvent.keyDown(card, { key: "Enter" })
  expect(root).toHaveAttribute("data-phase", "shattering")
  expect(root.querySelectorAll("[data-shard]").length).toBeGreaterThan(0)
  expect(root.querySelectorAll("[data-shard]").length).toBeLessThanOrEqual(12)
  expect(root.querySelector("[data-shard]")?.getAttribute("aria-hidden")).toBe("true")
  expect(root.querySelector("[data-shard]")?.contains(copy)).toBe(false)
  act(() => drain(30))
  expect(root).toHaveAttribute("data-phase", "clear")
  expect(root.querySelector("[data-veil]")).toBeNull()
  expect(root.querySelector("[data-shard]")).toBeNull()
  expect(view.getByText(/stays readable/)).toBeInTheDocument()
  fireEvent.keyDown(card, { key: "r" })
  expect(root).toHaveAttribute("data-phase", "veiled")
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-phase", "veiled")
  fireEvent.keyDown(card, { key: " " })
  act(() => drain(30))
  fireEvent.keyDown(card, { key: "Escape" })
  expect(root).toHaveAttribute("data-phase", "veiled")
  expect(root.innerHTML).not.toMatch(/animate-bounce|neon|firework/)
  expect(view.queryByText(/descript|godaddy|codecademy/i)).toBeNull()
  expect(onValueChange).toHaveBeenCalled()
})

test("碎裂数量可调，减弱动效与离屏直接揭开", async () => {
  const fewer = render(<ShardVeilClear shardCount={4} veilOpacity={1} />)
  const thin = rootOf(fewer.container, "shard-veil-clear")
  expect(thin).toHaveAttribute("data-count", "4")
  expect(thin).toHaveAttribute("data-veil", "1.00")
  cleanup()

  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<ShardVeilClear />)
  const root = rootOf(view.container, "shard-veil-clear")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(view.getByRole("button", { name: "Clear cover" }), { key: "Enter" })
  act(() => drain(2))
  expect(root).toHaveAttribute("data-phase", "shattering")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-phase", "clear")
  expect(root.querySelector("[data-veil]")).toBeNull()
  expect(root.querySelector("[data-shard]")).toBeNull()
  expect(queued.size).toBe(0)
  expect(view.getByText(/stays readable/)).toBeInTheDocument()

  cleanup()
  installMedia({ reduced: true })
  const still = render(<ShardVeilClear />)
  const quiet = rootOf(still.container, "shard-veil-clear")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-ease", "0")
  fireEvent.keyDown(still.getByRole("button", { name: "Clear cover" }), { key: "Enter" })
  expect(quiet).toHaveAttribute("data-phase", "clear")
  expect(quiet.querySelector("[data-shard]")).toBeNull()
  expect(queued.size).toBe(0)
})

test("凹口轨键盘贴合，读数不被轨道挡住", () => {
  expect(notchCountOf(9)).toBe(7)
  expect(notchCountOf(1)).toBe(3)
  expect(nearestNotch(0.62, 5)).toBe(2)
  expect(notchAt(4, 5)).toBe(1)
  expect(notchLabel(1, 5)).toBe("Soft")
  expect(coastKeep(1)).toBeLessThan(1)
  const onValueChange = vi.fn()
  const view = render(<InertiaNotchCoast onValueChange={onValueChange} className="extra-notch" />)
  const root = rootOf(view.container, "inertia-notch-coast")
  expect(root).toHaveAttribute("data-ritual", "inertia-notch")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-label", "Low")
  expect(root).toHaveAttribute("data-notches", "5")
  expect(root).toHaveAttribute("data-ticks", "on")
  expect(root.className).toContain("extra-notch")
  const rail = view.getByRole("slider", { name: "Notch rail" })
  expect(rail.className).toContain("focus-visible:ring-2")
  const readout = view.getByText("Low")
  expect(rail.contains(readout)).toBe(false)
  fireEvent.keyDown(rail, { key: "ArrowRight" })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-label", "Soft")
  expect(root).toHaveAttribute("data-pos", "0.250")
  expect(root).toHaveAttribute("data-phase", "rest")
  fireEvent.keyDown(rail, { key: "End" })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-index", "4")
  expect(root).toHaveAttribute("data-label", "High")
  fireEvent.keyDown(rail, { key: "Home" })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-index", "0")
  fireEvent.pointerDown(rail, { clientX: 200, button: 0, pointerId: 8 })
  fireEvent.pointerMove(rail, { clientX: 240, button: 0, pointerId: 8 })
  fireEvent.pointerUp(rail, { clientX: 240, button: 0, pointerId: 8 })
  act(() => drain(40))
  expect(root).toHaveAttribute("data-phase", "rest")
  const index = Number(root.getAttribute("data-index"))
  expect(root.getAttribute("data-pos")).toBe(notchAt(index, 5).toFixed(3))
  expect(root.innerHTML).not.toMatch(/animate-bounce|neon/)
  expect(view.queryByText(/replika|sonos|cleo/i)).toBeNull()
  expect(onValueChange).toHaveBeenCalled()
})

test("凹口数量和刻度可调，减弱动效与离屏直接落槽", async () => {
  const short = render(<InertiaNotchCoast notches={3} showTicks={false} />)
  const brief = rootOf(short.container, "inertia-notch-coast")
  expect(brief).toHaveAttribute("data-notches", "3")
  expect(brief).toHaveAttribute("data-ticks", "off")
  expect(brief.querySelector("[data-tick]")).toBeNull()
  cleanup()

  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<InertiaNotchCoast />)
  const root = rootOf(view.container, "inertia-notch-coast")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(view.getByRole("slider", { name: "Notch rail" }), { key: "ArrowRight" })
  act(() => drain(2))
  expect(root).toHaveAttribute("data-phase", "coast")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-pos", "0.250")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<InertiaNotchCoast />)
  const quiet = rootOf(still.container, "inertia-notch-coast")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-ease", "0")
  fireEvent.keyDown(still.getByRole("slider", { name: "Notch rail" }), { key: "End" })
  expect(quiet).toHaveAttribute("data-index", "4")
  expect(quiet).toHaveAttribute("data-phase", "rest")
  expect(queued.size).toBe(0)
})

test("闩拇指切换后贴合，说明留在轨道外", () => {
  expect(latchHeld(0.49)).toBe(false)
  expect(latchHeld(0.5)).toBe(true)
  expect(latchOvershoot(0.28)).toBeLessThan(0.04)
  const onValueChange = vi.fn()
  const view = render(<LatchThumbSpring onValueChange={onValueChange} className="extra-latch" />)
  const root = rootOf(view.container, "latch-thumb-spring")
  expect(root).toHaveAttribute("data-ritual", "latch-thumb")
  expect(root).toHaveAttribute("data-on", "off")
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(root).toHaveAttribute("data-fill", "on")
  expect(root).toHaveAttribute("data-labels", "on")
  expect(root.className).toContain("extra-latch")
  const latch = view.getByRole("switch", { name: "Latch" })
  expect(latch.className).toContain("focus-visible:ring-2")
  expect(latch).toHaveAttribute("aria-checked", "false")
  const caption = view.getByText("关闭")
  expect(latch.contains(caption)).toBe(false)
  fireEvent.keyDown(latch, { key: " " })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-on", "on")
  expect(root).toHaveAttribute("data-pos", "1.000")
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(latch).toHaveAttribute("aria-checked", "true")
  expect(view.getByText("启用")).toBeInTheDocument()
  fireEvent.keyDown(latch, { key: "ArrowLeft" })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-on", "off")
  fireEvent.pointerDown(latch, { clientX: 20, button: 0, pointerId: 9 })
  fireEvent.pointerMove(latch, { clientX: 200, button: 0, pointerId: 9 })
  fireEvent.pointerUp(latch, { clientX: 200, button: 0, pointerId: 9 })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-on", "on")
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(root.innerHTML).not.toMatch(/animate-bounce|neon/)
  expect(view.queryByText(/pinterest|airtasker|moonlitt/i)).toBeNull()
  expect(onValueChange).toHaveBeenCalled()
})

test("闩位可隐藏标签，减弱动效与离屏直接落到目标", async () => {
  const plain = render(<LatchThumbSpring labels={false} trackFill={false} />)
  const bare = rootOf(plain.container, "latch-thumb-spring")
  expect(bare).toHaveAttribute("data-labels", "off")
  expect(bare).toHaveAttribute("data-fill", "off")
  expect(plain.queryByText("关闭")).toBeNull()
  cleanup()

  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<LatchThumbSpring />)
  const root = rootOf(view.container, "latch-thumb-spring")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(view.getByRole("switch", { name: "Latch" }), { key: "Enter" })
  act(() => drain(2))
  expect(root).toHaveAttribute("data-phase", "spring")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-on", "on")
  expect(root).toHaveAttribute("data-pos", "1.000")
  expect(root).toHaveAttribute("data-phase", "rest")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<LatchThumbSpring />)
  const quiet = rootOf(still.container, "latch-thumb-spring")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-ease", "0")
  fireEvent.keyDown(still.getByRole("switch", { name: "Latch" }), { key: "Enter" })
  expect(quiet).toHaveAttribute("data-on", "on")
  expect(quiet).toHaveAttribute("data-phase", "rest")
  expect(queued.size).toBe(0)
})
