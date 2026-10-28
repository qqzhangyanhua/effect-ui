// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { RulerTickScrub } from "./ruler-tick-scrub"

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

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
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
  const entry = getComponent("ruler-tick-scrub")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='ruler-tick-scrub']")
  if (!(node instanceof HTMLElement)) throw new Error("missing ruler")
  return node
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("刻度尺控件起始值等于默认，主次刻度都在", async () => {
  expect(getComponent("ruler-tick-scrub")?.batch).toBe(68)
  expect(getComponent("ruler-tick-scrub")?.effectCategory).toBe("showcase")
  expect(start("gap")).toBe(14)
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("majorEvery")).toBe(4)
  const view = render(<RulerTickScrub />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "里程碑刻度" })
  expect(root).toHaveAttribute("data-ritual", "ruler-tick")
  expect(root).toHaveAttribute("data-gap", "14")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.65")
  expect(root).toHaveAttribute("data-major", "4")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-title", "草图")
  expect(root).toHaveAttribute("data-state", "rest")
  expect(slider).toHaveAttribute("aria-valuenow", "0")
  expect(slider).toHaveAttribute("aria-valuetext", "03 / 14 草图")
  expect(root.querySelectorAll("[data-tick='major']").length).toBe(5)
  expect(root.querySelectorAll("[data-tick='minor']").length).toBeGreaterThan(0)
  expect(root.querySelector("[data-scan]")).toBeNull()
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByRole("status")).toHaveTextContent("03 / 14 草图")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("拖动吸附到下一里程碑，方向键和按钮也能换", () => {
  const onIndexChange = vi.fn()
  const view = render(<RulerTickScrub onIndexChange={onIndexChange} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "里程碑刻度" })
  const gap = Number(root.getAttribute("data-gap"))
  const major = Number(root.getAttribute("data-major"))
  fireEvent.pointerDown(slider, { clientX: 180, pointerId: 1 })
  fireEvent.pointerMove(slider, { clientX: 180 - gap * major, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "scrubbing")
  fireEvent.pointerUp(slider, { pointerId: 1 })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-title", "样机")
  expect(root).toHaveAttribute("data-state", "snapped")
  expect(slider).toHaveAttribute("aria-valuenow", "1")
  expect(view.getByRole("status")).toHaveTextContent("样机")
  expect(onIndexChange).toHaveBeenCalledWith(1)

  fireEvent.pointerDown(slider, { clientX: 180, pointerId: 2 })
  fireEvent.pointerMove(slider, { clientX: 178, pointerId: 2 })
  fireEvent.pointerUp(slider, { pointerId: 2 })
  expect(root).toHaveAttribute("data-index", "1")

  fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "2")
  expect(root).toHaveAttribute("data-title", "对齐")
  fireEvent.keyDown(slider, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-index", "1")
  fireEvent.click(view.getByRole("button", { name: "上一里程碑" }))
  expect(root).toHaveAttribute("data-index", "0")
  fireEvent.click(view.getByRole("button", { name: "下一里程碑" }))
  expect(root).toHaveAttribute("data-title", "样机")
})

test("减弱动效忽略拖动，按钮仍然能切里程碑", () => {
  installMedia({ reduced: true })
  const view = render(<RulerTickScrub />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "里程碑刻度" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "off")
  expect(root.className).toContain("motion-reduce:transition-none")
  fireEvent.pointerDown(slider, { clientX: 180, pointerId: 1 })
  fireEvent.pointerMove(slider, { clientX: 20, pointerId: 1 })
  fireEvent.pointerUp(slider, { pointerId: 1 })
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-state", "rest")
  fireEvent.click(view.getByRole("button", { name: "下一里程碑" }))
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-title", "样机")
  expect(root).toHaveAttribute("data-state", "snapped")
  fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "2")
})

test("离开视口后仍然可以用按钮换里程碑", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<RulerTickScrub />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-live", "off")
  fireEvent.click(view.getByRole("button", { name: "下一里程碑" }))
  expect(root).toHaveAttribute("data-index", "1")
})
