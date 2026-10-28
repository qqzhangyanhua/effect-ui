// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { PinClusterBurst, burstPins } from "./pin-cluster-burst"

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
  for (let i = 0; i < frames; i += 1) {
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
  const entry = getComponent("pin-cluster-burst")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='pin-cluster-burst']")
  if (!(node instanceof HTMLElement)) throw new Error("missing clusters")
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

test("簇针控件起始值等于默认，收合时没有子针", async () => {
  expect(getComponent("pin-cluster-burst")?.batch).toBe(78)
  expect(getComponent("pin-cluster-burst")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("drift")).toBe(true)
  expect(start("labels")).toBe(true)
  const view = render(<PinClusterBurst />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "pin-burst")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-cluster", "")
  expect(root).toHaveAttribute("data-pins", "0")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-hex]")).toBeNull()
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  expect(view.getAllByRole("button")).toHaveLength(3)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("点簇扇出七枚子针，再点、空白和 Escape 收合", () => {
  const onValueChange = vi.fn()
  const view = render(<PinClusterBurst onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const cluster = view.getByRole("button", { name: "Cluster A, 7" })
  fireEvent.click(cluster)
  expect(root).toHaveAttribute("data-state", "bursting")
  expect(root).toHaveAttribute("data-cluster", "a")
  expect(root).toHaveAttribute("data-pins", "7")
  expect(root.querySelectorAll("[data-pin]")).toHaveLength(7)
  expect(root.querySelector("[data-pin='A1']")).toHaveAttribute("data-x", String(burstPins("a", 0.7)[0]?.x))
  expect(view.getByText("A1")).toBeInTheDocument()
  expect(onValueChange).toHaveBeenCalledWith({ clusterId: "a", expanded: true })
  act(() => drain(1))
  expect(root).toHaveAttribute("data-state", "expanded")
  fireEvent.click(cluster)
  expect(root).toHaveAttribute("data-state", "collapsing")
  act(() => drain(1))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-pins", "0")
  fireEvent.keyDown(view.getByRole("button", { name: "Cluster B, 4" }), { key: "Enter" })
  expect(root).toHaveAttribute("data-cluster", "b")
  expect(root).toHaveAttribute("data-pins", "4")
  fireEvent.keyDown(root, { key: "Escape" })
  expect(root).toHaveAttribute("data-state", "collapsing")
  const map = root.querySelector("[data-part='map']")
  if (!(map instanceof HTMLElement)) throw new Error("missing map")
  act(() => drain(1))
  fireEvent.click(cluster)
  act(() => drain(1))
  fireEvent.click(map)
  expect(root).toHaveAttribute("data-state", "collapsing")
  expect(onValueChange).toHaveBeenLastCalledWith({ clusterId: null, expanded: false })
})

test("关闭标签后子针仍在，只是不显示短名", () => {
  const view = render(<PinClusterBurst labels={false} drift={false} />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Cluster A, 7" }))
  expect(root).toHaveAttribute("data-labels", "off")
  expect(root).toHaveAttribute("data-pins", "7")
  expect(view.queryByText("A1")).toBeNull()
})

test("子针微漂在视口内排队，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<PinClusterBurst />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Cluster A, 7" }))
  act(() => drain(1))
  await waitFor(() => {
    expect(root).toHaveAttribute("data-state", "expanded")
    expect(root).toHaveAttribute("data-drifting", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  act(() => drain(2))
  const clock = root.getAttribute("data-clock")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-drifting", "off")
  expect(queued.size).toBe(0)
  act(() => drain(3))
  expect(root.getAttribute("data-clock")).toBe(clock)
})

test("减弱动效瞬时展开和收合，没有微漂帧", () => {
  installMedia({ reduced: true })
  const view = render(<PinClusterBurst />)
  const root = rootOf(view.container)
  const cluster = view.getByRole("button", { name: "Cluster C, 5" })
  fireEvent.click(cluster)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-state", "expanded")
  expect(root).toHaveAttribute("data-pins", "5")
  expect(root).toHaveAttribute("data-drifting", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(queued.size).toBe(0)
  fireEvent.click(cluster)
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-pins", "0")
  expect(queued.size).toBe(0)
})
