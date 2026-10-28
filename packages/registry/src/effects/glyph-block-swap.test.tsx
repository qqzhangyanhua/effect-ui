// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { GLYPH_TITLE, GlyphBlockSwap, glyphActiveAt, glyphFocusStep, glyphMode, glyphStatic } from "./glyph-block-swap"

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

function start(prop: string) {
  const found = getComponent("glyph-block-swap")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='glyph-block-swap']")
  if (!(node instanceof HTMLElement)) throw new Error("missing glyphs")
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

test("字形默认会循环，控件起始值等于默认", async () => {
  expect(getComponent("glyph-block-swap")?.batch).toBe(79)
  expect(getComponent("glyph-block-swap")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("eyes")).toBe(true)
  expect(start("cycle")).toBe(true)
  expect(glyphMode(0)).toBe("letters")
  expect(glyphMode(2)).toBe("mixed")
  expect(glyphMode(5)).toBe("blocks")
  expect(glyphActiveAt(1)).toEqual([0])
  expect(glyphStatic()).toEqual([0, 7, 14])
  expect(glyphFocusStep(GLYPH_TITLE, 4, 1)).toBe(6)
  const view = render(<GlyphBlockSwap />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "glyph-swap")
  expect(root).toHaveAttribute("data-title", "Build calm tools")
  expect(root).toHaveAttribute("data-mode", "letters")
  expect(root).toHaveAttribute("data-focus", "0")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.queryByText(/fauna|robot/i)).toBeNull()
  await waitFor(() => {
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
})

test("循环互换离开视口后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<GlyphBlockSwap />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
  act(() => drain(12))
  expect(Number(root.getAttribute("data-cursor"))).toBeGreaterThan(0)
  expect(Number(root.getAttribute("data-glyphs"))).toBeGreaterThan(0)
  expect(root.getAttribute("data-mode")).not.toBe("letters")
  const cursor = root.getAttribute("data-cursor")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  act(() => drain(6))
  expect(root.getAttribute("data-cursor")).toBe(cursor)
})

test("方向键移动焦点，Enter 和点击把字母换成色块", () => {
  const onValueChange = vi.fn()
  const view = render(<GlyphBlockSwap cycle={false} onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-mode", "letters")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-glyphs", "1")
  expect(root).toHaveAttribute("data-mode", "mixed")
  expect(root.querySelector("[data-glyph='0']")).toHaveAttribute("data-form", "block")
  expect(root.querySelector("[data-part='eye']")).toBeInTheDocument()
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-focus", "1")
  fireEvent.click(view.getByRole("button", { name: "u" }))
  expect(root).toHaveAttribute("data-glyphs", "2")
  expect(onValueChange).toHaveBeenCalledWith({ mode: "mixed", focus: 1 })
  fireEvent.pointerEnter(view.getByRole("button", { name: "m" }))
  expect(view.getByRole("button", { name: "m" })).toHaveAttribute("data-form", "block")
  fireEvent.pointerLeave(view.getByRole("button", { name: "m" }))
  expect(view.getByRole("button", { name: "m" })).toHaveAttribute("data-form", "letter")
})

test("关掉眼点后色块不带眼睛", () => {
  const view = render(<GlyphBlockSwap cycle={false} eyes={false} />)
  const root = rootOf(view.container)
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-eyes", "off")
  expect(root.querySelector("[data-part='block']")).toBeInTheDocument()
  expect(root.querySelector("[data-part='eye']")).toBeNull()
})

test("减弱动效停在混合静帧，循环不再推进", () => {
  installMedia({ reduced: true })
  const view = render(<GlyphBlockSwap />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-mode", "mixed")
  expect(root).toHaveAttribute("data-glyphs", "3")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-cursor", "0")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-focus", "1")
  expect(root).toHaveAttribute("data-glyphs", "3")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-glyphs", "3")
  expect(queued.size).toBe(0)
})
