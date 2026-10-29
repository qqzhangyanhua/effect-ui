// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { ChapterDashSeek, chapterFromPointer, chapterIndexAt, chapterStart } from "./chapter-dash-seek"

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
  const found = getComponent("chapter-dash-seek")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='chapter-dash-seek']")
  if (!(node instanceof HTMLElement)) throw new Error("missing chapter")
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

test("章节轨默认停在第一章，控件起始值等于默认", () => {
  expect(getComponent("chapter-dash-seek")?.batch).toBe(80)
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("dashed")).toBe(true)
  expect(start("labels")).toBe(true)
  expect(chapterIndexAt(0)).toBe(0)
  expect(chapterIndexAt(chapterStart(1))).toBe(1)
  expect(chapterIndexAt(0.5)).toBe(1)
  expect(chapterFromPointer(160, { left: 0, width: 0 })).toBe(0.5)
  const view = render(<ChapterDashSeek />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "chapter-dash")
  expect(root).toHaveAttribute("data-t", "0.000")
  expect(root).toHaveAttribute("data-chapter", "0")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-dashed", "on")
  expect(root).toHaveAttribute("data-labels", "on")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByText("Chapter 1")).toBeInTheDocument()
  expect(view.queryByText(/podcast|spotify|cover/i)).toBeNull()
  expect(root.querySelectorAll("[data-ink='dash']").length).toBeGreaterThan(0)
  expect(queued.size).toBe(0)
})

test("点段跳到章首，拖动连续寻址", () => {
  const onValueChange = vi.fn()
  const view = render(<ChapterDashSeek onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Chapter 3" }))
  expect(root).toHaveAttribute("data-chapter", "2")
  expect(root).toHaveAttribute("data-t", chapterStart(2).toFixed(3))
  expect(onValueChange).toHaveBeenLastCalledWith({ t: chapterStart(2), chapterIndex: 2 })
  const lane = root.querySelector("[data-lane]")
  if (!(lane instanceof HTMLElement)) throw new Error("missing lane")
  fireEvent.pointerDown(lane, { clientX: 160, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-phase", "seeking")
  expect(root).toHaveAttribute("data-t", "0.500")
  expect(root).toHaveAttribute("data-chapter", "1")
  const far = chapterFromPointer(300, { left: 0, width: 0 })
  fireEvent.pointerMove(lane, { clientX: 300, pointerId: 1 })
  expect(root).toHaveAttribute("data-t", far.toFixed(3))
  expect(root).toHaveAttribute("data-chapter", String(chapterIndexAt(far)))
  fireEvent.pointerUp(lane, { clientX: 300, pointerId: 1 })
  expect(root).toHaveAttribute("data-phase", "idle")
})

test("方向键细步进，方括号跳章，空格播放", async () => {
  const view = render(<ChapterDashSeek />)
  const root = rootOf(view.container)
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-t", "0.020")
  expect(root).toHaveAttribute("data-chapter", "0")
  fireEvent.keyDown(root, { key: "]" })
  expect(root).toHaveAttribute("data-chapter", "1")
  expect(root).toHaveAttribute("data-t", chapterStart(1).toFixed(3))
  fireEvent.keyDown(root, { key: "[" })
  expect(root).toHaveAttribute("data-chapter", "0")
  expect(root).toHaveAttribute("data-t", chapterStart(0).toFixed(3))
  fireEvent.keyDown(root, { key: "End" })
  expect(root).toHaveAttribute("data-t", "1.000")
  expect(root).toHaveAttribute("data-chapter", "3")
  fireEvent.keyDown(root, { key: "Home" })
  expect(root).toHaveAttribute("data-chapter", "0")
  fireEvent.keyDown(root, { key: " " })
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
})

test("播放跨过章节，离开视口后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<ChapterDashSeek />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Play" }))
  await waitFor(() => {
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  act(() => drain(6))
  expect(Number(root.getAttribute("data-chapter"))).toBeGreaterThan(0)
  expect(Number(root.getAttribute("data-t"))).toBeGreaterThan(0.17)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-t")
  act(() => drain(3))
  expect(root.getAttribute("data-t")).toBe(stopped)
})

test("实心段不画虚线，关闭标题后不显示章名", () => {
  const view = render(<ChapterDashSeek dashed={false} labels={false} intensity={1} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-dashed", "off")
  expect(root).toHaveAttribute("data-labels", "off")
  expect(root).toHaveAttribute("data-dash", "4")
  expect(root.querySelector("[data-title]")).toBeNull()
  expect(root.querySelector("[data-ink='dash']")).toBeNull()
  expect(root.querySelectorAll("[data-ink='solid']")).toHaveLength(4)
})

test("减弱动效瞬时跳章，播放不排队", () => {
  installMedia({ reduced: true })
  const view = render(<ChapterDashSeek />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Chapter 2" }))
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-chapter", "1")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.click(view.getByRole("button", { name: "Play" }))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
})
