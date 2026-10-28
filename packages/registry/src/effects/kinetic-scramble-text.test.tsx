// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { KineticScrambleText } from "./kinetic-scramble-text"

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
    for (const callback of batch) callback(performance.now())
  }
}

function installMedia(options: { reduced?: boolean; coarse?: boolean } = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches:
      (options.reduced === true && query.includes("prefers-reduced-motion")) ||
      (options.coarse === true && query.includes("pointer: coarse")),
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
  const entry = getComponent("kinetic-scramble-text")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function glyphs(root: ParentNode) {
  return [...root.querySelectorAll("[data-glyph]")].map((node) => node.textContent ?? "").join("")
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

test("乱码落定控件起始值等于默认，读屏拿到终稿", async () => {
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("charset")).toBe("mixed")
  const view = render(<KineticScrambleText />)
  const root = view.getByRole("button", { name: "落定这句文案" })
  expect(root).toHaveAttribute("data-ritual", "kinetic-scramble")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-charset", "mixed")
  expect(root).toHaveAttribute("aria-label", "落定这句文案")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(glyphs(root)).toBe("落定这句文案")
  expect(root.querySelectorAll("[data-glyph]").length).toBeLessThan(20)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("点按后先乱码，再落定到终稿，并且可以再来一次", async () => {
  const onSettle = vi.fn()
  const view = render(<KineticScrambleText onSettle={onSettle} />)
  const root = view.getByRole("button", { name: "落定这句文案" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(root)
  expect(root).toHaveAttribute("data-state", "scrambling")
  expect(glyphs(root)).not.toBe("落定这句文案")
  expect(root).toHaveAttribute("aria-label", "落定这句文案")
  act(() => drain(2))
  expect(root).toHaveAttribute("data-state", "scrambling")
  expect(glyphs(root)).not.toBe("落定这句文案")
  act(() => drain(40))
  expect(root).toHaveAttribute("data-state", "settled")
  expect(glyphs(root)).toBe("落定这句文案")
  expect(onSettle).toHaveBeenCalledTimes(1)
  act(() => drain(8))
  expect(onSettle).toHaveBeenCalledTimes(1)
  fireEvent.click(root)
  expect(root).toHaveAttribute("data-state", "scrambling")
  act(() => drain(40))
  expect(glyphs(root)).toBe("落定这句文案")
  expect(onSettle).toHaveBeenCalledTimes(2)
})

test("聚焦会触发，粗指针的悬停不会", async () => {
  const view = render(<KineticScrambleText text="甲乙丙" />)
  const root = view.getByRole("button", { name: "甲乙丙" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.focus(root)
  expect(root).toHaveAttribute("data-state", "scrambling")
  view.unmount()

  installMedia({ coarse: true })
  const coarse = render(<KineticScrambleText />)
  const button = coarse.getByRole("button", { name: "落定这句文案" })
  await waitFor(() => expect(button).toHaveAttribute("data-live", "on"))
  expect(button).toHaveAttribute("data-pointer", "coarse")
  fireEvent.pointerEnter(button, { pointerType: "touch" })
  expect(button).toHaveAttribute("data-state", "idle")
  expect(glyphs(button)).toBe("落定这句文案")
  fireEvent.click(button)
  expect(button).toHaveAttribute("data-state", "scrambling")
})

test("减弱动效直接显示终稿，没有乱码", () => {
  installMedia({ reduced: true })
  const onSettle = vi.fn()
  const view = render(<KineticScrambleText onSettle={onSettle} />)
  const root = view.getByRole("button", { name: "落定这句文案" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(glyphs(root)).toBe("落定这句文案")
  expect(view.getByText("已显示终稿")).toBeInTheDocument()
  fireEvent.click(root)
  fireEvent.focus(root)
  act(() => drain(20))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(glyphs(root)).toBe("落定这句文案")
  expect(onSettle).not.toHaveBeenCalled()
})

test("离开视口后不再乱码", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const onSettle = vi.fn()
  const view = render(<KineticScrambleText onSettle={onSettle} />)
  const root = view.getByRole("button", { name: "落定这句文案" })
  expect(root).toHaveAttribute("data-live", "off")
  fireEvent.click(root)
  fireEvent.focus(root)
  act(() => drain(20))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(glyphs(root)).toBe("落定这句文案")
  expect(onSettle).not.toHaveBeenCalled()
  expect(queued.size).toBe(0)
})
