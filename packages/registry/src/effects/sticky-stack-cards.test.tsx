// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { StickyGridScroll } from "./sticky-grid-scroll"
import { StickyStackCards } from "./sticky-stack-cards"

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
  const entry = getComponent("sticky-stack-cards")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("叠卡控件起始值等于默认", () => {
  expect(start("pace")).toBe(1)
  expect(start("tilt")).toBe(6)
  expect(start("depth")).toBe(0.16)
  const view = render(<StickyStackCards />)
  const root = view.container.querySelector("[data-slot='sticky-stack-cards']")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-tilt", "6")
  expect(root).toHaveAttribute("data-depth", "0.16")
  expect(root).toHaveAttribute("data-step", "280")
  expect(root).toHaveAttribute("data-count", "4")
  expect(root).toHaveAttribute("data-layout", "pin-stack")
})

test("滚动进度让前一张缩小旋转，方向键步进到下一张", async () => {
  const view = render(<StickyStackCards />)
  const root = view.container.querySelector("[data-slot='sticky-stack-cards']") as HTMLDivElement
  await waitFor(() => expect(root).toHaveAttribute("data-listening", "on"))
  expect(root).toHaveAttribute("data-state", "idle")
  root.scrollTop = 140
  fireEvent.scroll(root)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "pinning"))
  const first = root.querySelector("[data-card='0']") as HTMLElement
  expect(first).toHaveAttribute("data-pin", "sticky")
  expect(first).toHaveAttribute("data-settled", "0.500")
  expect(first.style.position).toBe("sticky")
  expect(first.style.transform).toContain("scale(0.920)")
  expect(first.style.transform).toContain("rotate(-3.00deg)")
  fireEvent.keyDown(root, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root.querySelector("[data-card='0']")).toHaveAttribute("data-settled", "1.000")
  fireEvent.keyDown(root, { key: "PageUp" })
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-state", "idle")
})

test("pace 缩短每张卡片需要的滚动距离", async () => {
  const view = render(<StickyStackCards pace={2} tilt={0} depth={0} />)
  const root = view.container.querySelector("[data-slot='sticky-stack-cards']") as HTMLDivElement
  await waitFor(() => expect(root).toHaveAttribute("data-listening", "on"))
  expect(root).toHaveAttribute("data-step", "140")
  root.scrollTop = 70
  fireEvent.scroll(root)
  await waitFor(() => expect(root.querySelector("[data-card='0']")).toHaveAttribute("data-settled", "0.500"))
  const first = root.querySelector("[data-card='0']") as HTMLElement
  expect(first.style.transform).toContain("scale(1.000)")
  expect(first.style.transform).toContain("rotate(0.00deg)")
})

test("减弱动效是静止竖列，不再钉住", () => {
  installMedia({ reduced: true })
  const view = render(<StickyStackCards />)
  const root = view.container.querySelector("[data-slot='sticky-stack-cards']") as HTMLDivElement
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-layout", "column")
  expect(root).toHaveAttribute("data-listening", "off")
  expect(view.getByText("打开")).toBeInTheDocument()
  expect(view.getByText("下一张")).toBeInTheDocument()
  const first = root.querySelector("[data-card='0']") as HTMLElement
  expect(first).toHaveAttribute("data-pin", "static")
  expect(first.style.position).toBe("static")
  expect(first.style.transform).toBe("none")
  root.scrollTop = 200
  fireEvent.scroll(root)
  expect(root).toHaveAttribute("data-state", "idle")
  expect(first.style.transform).toBe("none")
})

test("离开视口后不再跟着滚动更新", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<StickyStackCards />)
  const root = view.container.querySelector("[data-slot='sticky-stack-cards']") as HTMLDivElement
  expect(root).toHaveAttribute("data-listening", "off")
  root.scrollTop = 200
  fireEvent.scroll(root)
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(root).toHaveAttribute("data-state", "idle")
})

test("叠卡钉住沉降，不是网格错位放大", () => {
  const stack = render(<StickyStackCards />)
  const stackRoot = stack.container.querySelector("[data-slot='sticky-stack-cards']")
  expect(stackRoot).toHaveAttribute("data-layout", "pin-stack")
  expect(stackRoot?.getAttribute("aria-label")).not.toMatch(/网格/)
  expect(stack.container.querySelector(".grid")).toBeNull()
  expect(stack.container.querySelector("[data-slot='sticky-grid-scroll']")).toBeNull()
  stack.unmount()
  const grid = render(<StickyGridScroll />)
  expect(grid.container.querySelector("[data-slot='sticky-grid-scroll']")).toBeInTheDocument()
  expect(grid.container.querySelector(".grid")).toBeInTheDocument()
  expect(grid.container.querySelector("[data-slot='sticky-stack-cards']")).toBeNull()
})
