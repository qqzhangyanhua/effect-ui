// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { MosaicTileFlip } from "./mosaic-tile-flip"

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback([{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

class SilentObserver {
  observe() {}
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

function drain(max: number) {
  for (let i = 0; i < max; i += 1) {
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

function start(prop: string) {
  const entry = getComponent("mosaic-tile-flip")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='mosaic-tile-flip']")
  if (!(node instanceof HTMLElement)) throw new Error("missing mosaic")
  return node
}

function revealedOf(root: HTMLElement) {
  return root.querySelector("[data-revealed]")?.getAttribute("data-revealed")
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

test("马赛克控件起始值等于默认，格子是规则网格", async () => {
  expect(getComponent("mosaic-tile-flip")?.batch).toBe(70)
  expect(getComponent("mosaic-tile-flip")?.effectCategory).toBe("cards")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("cols")).toBe(3)
  expect(start("gap")).toBe(8)
  const view = render(<MosaicTileFlip />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "mosaic-flip")
  expect(root).toHaveAttribute("data-grid", "regular")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-cols", "3")
  expect(root).toHaveAttribute("data-rows", "3")
  expect(root).toHaveAttribute("data-gap", "8")
  expect(root).toHaveAttribute("data-stagger", "140")
  expect(root).toHaveAttribute("data-state", "entering")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.querySelector("img")).toBeNull()
  const tiles = view.getAllByRole("button", { name: /格子/ })
  expect(tiles).toHaveLength(9)
  expect(tiles[0]).toHaveAttribute("data-delay", "0")
  expect(tiles[8]).toHaveAttribute("data-delay", "560")
  expect(tiles[0]).toHaveTextContent("A")
  expect(getComponent("bento-asymmetric-grid")?.name).toBe("bento-asymmetric-grid")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("对角线 stagger 入场，Replay 会重来", async () => {
  const view = render(<MosaicTileFlip />)
  const root = rootOf(view.container)
  const tiles = view.getAllByRole("button", { name: /格子/ })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-state", "entering")
  expect(revealedOf(root)).toBe("0")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(2))
  expect(revealedOf(root)).toBe("1")
  expect(tiles[0]).toHaveAttribute("data-open", "true")
  expect(tiles[8]).toHaveAttribute("data-open", "false")
  act(() => drain(20))
  expect(root).toHaveAttribute("data-state", "settled")
  expect(revealedOf(root)).toBe("9")
  fireEvent.click(view.getByRole("button", { name: "Replay" }))
  expect(root).toHaveAttribute("data-state", "entering")
  expect(revealedOf(root)).toBe("0")
  expect(tiles[0]).toHaveAttribute("data-flipped", "false")
  view.rerender(<MosaicTileFlip pace={2} />)
  expect(root).toHaveAttribute("data-stagger", "70")
})

test("点按和 Enter 能翻开一格", async () => {
  const onFlip = vi.fn()
  const view = render(<MosaicTileFlip onFlip={onFlip} />)
  const root = rootOf(view.container)
  const tiles = view.getAllByRole("button", { name: /格子/ })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  act(() => drain(24))
  expect(root).toHaveAttribute("data-state", "settled")
  fireEvent.click(tiles[1]!)
  expect(tiles[1]).toHaveAttribute("data-flipped", "true")
  expect(root).toHaveAttribute("data-state", "flip")
  expect(onFlip).toHaveBeenCalledWith(1)
  fireEvent.keyDown(tiles[1]!, { key: "Enter" })
  expect(tiles[1]).toHaveAttribute("data-flipped", "false")
})

test("两列仍是正方形规则网格", () => {
  const view = render(<MosaicTileFlip cols={2} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-cols", "2")
  expect(root).toHaveAttribute("data-rows", "2")
  expect(view.getAllByRole("button", { name: /格子/ })).toHaveLength(4)
})

test("减弱动效瞬时显示全部格子", () => {
  installMedia({ reduced: true })
  const view = render(<MosaicTileFlip />)
  const root = rootOf(view.container)
  const tiles = view.getAllByRole("button", { name: /格子/ })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-state", "settled")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(revealedOf(root)).toBe("9")
  expect(tiles.every((tile) => tile.getAttribute("data-open") === "true")).toBe(true)
  expect(queued.size).toBe(0)
  fireEvent.click(tiles[0]!)
  expect(tiles[0]).toHaveAttribute("data-flipped", "true")
  expect(root).toHaveAttribute("data-state", "settled")
  act(() => drain(8))
  expect(queued.size).toBe(0)
})

test("离开视口后没有入场帧", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<MosaicTileFlip />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-state", "entering")
  expect(revealedOf(root)).toBe("0")
  expect(queued.size).toBe(0)
})
