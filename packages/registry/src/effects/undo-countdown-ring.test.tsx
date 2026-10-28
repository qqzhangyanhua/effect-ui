// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { UndoCountdownRing } from "./undo-countdown-ring"

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
let clock = 1000

function installFrames() {
  queued.clear()
  nextFrame = 1
  clock = 1000
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

function drain(frames: number, step = 0) {
  for (let i = 0; i < frames; i += 1) {
    const batch = [...queued.values()]
    queued.clear()
    if (batch.length === 0) return
    clock += step
    for (const callback of batch) callback(clock)
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
  const entry = getComponent("undo-countdown-ring")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='undo-countdown-ring']")
  if (!(node instanceof HTMLElement)) throw new Error("missing undo")
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

test("撤销环控件起始值等于默认", async () => {
  expect(getComponent("undo-countdown-ring")?.batch).toBe(70)
  expect(getComponent("undo-countdown-ring")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(4)
  expect(start("intensity")).toBe(0.6)
  expect(start("autoCommit")).toBe(false)
  expect(start("label")).toBe("Commit")
  const view = render(<UndoCountdownRing />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "undo-ring")
  expect(root).toHaveAttribute("data-pace", "4")
  expect(root).toHaveAttribute("data-intensity", "0.6")
  expect(root).toHaveAttribute("data-seconds", "4")
  expect(root).toHaveAttribute("data-auto", "off")
  expect(root).toHaveAttribute("data-label", "Commit")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByRole("status")).toHaveTextContent("尚未提交")
  expect(view.queryByRole("button", { name: "Undo" })).toBeNull()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("倒计时减少，Undo 恢复空闲", async () => {
  const onCommit = vi.fn()
  const onUndo = vi.fn()
  const view = render(<UndoCountdownRing onCommit={onCommit} onUndo={onUndo} />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Commit" }))
  expect(root).toHaveAttribute("data-state", "counting")
  expect(root).toHaveAttribute("data-remaining", "4000")
  expect(root).toHaveAttribute("data-ring", "run")
  expect(view.getByRole("status")).toHaveTextContent("已提交，还可以撤销")
  expect(onCommit).toHaveBeenCalledTimes(1)
  expect(root.querySelector("[data-ring]")).not.toBeNull()
  act(() => {
    drain(1, 0)
    drain(4, 500)
  })
  expect(root).toHaveAttribute("data-remaining", "2000")
  expect(Number(root.getAttribute("data-offset"))).toBeGreaterThan(20)
  expect(view.getByText("2s")).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Undo" }))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-result", "undone")
  expect(view.getByRole("status")).toHaveTextContent("已撤销")
  expect(view.queryByRole("button", { name: "Undo" })).toBeNull()
  expect(onUndo).toHaveBeenCalledTimes(1)
  expect(view.getByRole("button", { name: "Commit" })).toBeEnabled()
})

test("倒计时归零后锁定，不能再撤", async () => {
  const onLock = vi.fn()
  const view = render(<UndoCountdownRing onLock={onLock} />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Commit" }))
  act(() => {
    drain(1, 0)
    drain(8, 500)
  })
  expect(root).toHaveAttribute("data-state", "locked")
  expect(root).toHaveAttribute("data-result", "locked")
  expect(root).toHaveAttribute("data-remaining", "0")
  expect(view.getByRole("status")).toHaveTextContent("已锁定")
  expect(view.queryByRole("button", { name: "Undo" })).toBeNull()
  expect(view.getByRole("button", { name: "Commit" })).toBeDisabled()
  expect(onLock).toHaveBeenCalledTimes(1)
  expect(queued.size).toBe(0)
})

test("离开视口时倒计时暂停，回来再继续", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<UndoCountdownRing />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Commit" }))
  act(() => {
    drain(1, 0)
    drain(2, 500)
  })
  expect(root).toHaveAttribute("data-remaining", "3000")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  act(() => drain(4, 500))
  expect(root).toHaveAttribute("data-remaining", "3000")
  act(() => emitView(true))
  expect(root).toHaveAttribute("data-live", "on")
  act(() => {
    drain(1, 0)
    drain(2, 500)
  })
  expect(root).toHaveAttribute("data-remaining", "2000")
})

test("减弱动效只显示静态秒数", () => {
  installMedia({ reduced: true })
  const view = render(<UndoCountdownRing />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root.className).toContain("motion-reduce:transition-none")
  fireEvent.click(view.getByRole("button", { name: "Commit" }))
  expect(root).toHaveAttribute("data-state", "counting")
  expect(root).toHaveAttribute("data-ring", "static")
  expect(root).toHaveAttribute("data-remaining", "4000")
  expect(root).toHaveAttribute("data-offset", "0.0")
  expect(view.getByText("4s")).toBeInTheDocument()
  expect(queued.size).toBe(0)
  act(() => drain(6, 500))
  expect(root).toHaveAttribute("data-remaining", "4000")
  fireEvent.click(view.getByRole("button", { name: "Undo" }))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(view.getByRole("status")).toHaveTextContent("已撤销")
})

test("autoCommit 会自动进入倒计时", async () => {
  const view = render(<UndoCountdownRing autoCommit />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "counting"))
  expect(view.getByRole("status")).toHaveTextContent("已提交，还可以撤销")
  expect(view.getByRole("button", { name: "Undo" })).toBeInTheDocument()
})
