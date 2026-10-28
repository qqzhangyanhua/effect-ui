// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { StrengthSegmentFill } from "./strength-segment-fill"

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
  const entry = getComponent("strength-segment-fill")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='strength-segment-fill']")
  if (!(node instanceof HTMLElement)) throw new Error("missing strength")
  return node
}

function metOf(root: HTMLElement, rule: string) {
  return root.querySelector(`[data-rule='${rule}']`)?.getAttribute("data-met")
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

test("强度分段控件起始值等于默认", async () => {
  expect(getComponent("strength-segment-fill")?.batch).toBe(71)
  expect(getComponent("strength-segment-fill")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("segments")).toBe(4)
  expect(start("rules")).toBe(4)
  const view = render(<StrengthSegmentFill />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "segment-strength")
  expect(root).toHaveAttribute("data-score", "0")
  expect(root).toHaveAttribute("data-filled", "0")
  expect(root).toHaveAttribute("data-tone", "none")
  expect(root).toHaveAttribute("data-rules", "4")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByRole("textbox", { name: "Passphrase" })).toHaveAttribute("type", "text")
  expect(root.querySelectorAll("[data-rule]")).toHaveLength(4)
  expect(root.textContent).not.toContain("密码")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("预设和打字改变分数与清单", async () => {
  const onScoreChange = vi.fn()
  const view = render(<StrengthSegmentFill onScoreChange={onScoreChange} />)
  const root = rootOf(view.container)
  const field = view.getByRole("textbox", { name: "Passphrase" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Weak" }))
  expect(root).toHaveAttribute("data-score", "1")
  expect(root).toHaveAttribute("data-filled", "1")
  expect(root).toHaveAttribute("data-tone", "weak")
  expect(metOf(root, "length")).toBe("yes")
  expect(metOf(root, "case")).toBe("no")
  expect(root).toHaveAttribute("data-state", "updating")
  act(() => drain(2))
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.click(view.getByRole("button", { name: "Medium" }))
  expect(root).toHaveAttribute("data-score", "3")
  expect(root).toHaveAttribute("data-filled", "3")
  expect(root).toHaveAttribute("data-tone", "mid")
  expect(metOf(root, "symbol")).toBe("no")
  fireEvent.click(view.getByRole("button", { name: "Strong" }))
  expect(root).toHaveAttribute("data-score", "4")
  expect(root).toHaveAttribute("data-filled", "4")
  expect(root).toHaveAttribute("data-tone", "strong")
  expect(metOf(root, "length")).toBe("yes")
  expect(metOf(root, "case")).toBe("yes")
  expect(metOf(root, "digit")).toBe("yes")
  expect(metOf(root, "symbol")).toBe("yes")
  expect(root.querySelector("[data-icon='check']")).toHaveTextContent("✓")
  expect(onScoreChange).toHaveBeenCalledWith(4)
  fireEvent.change(field, { target: { value: "a" } })
  expect(root).toHaveAttribute("data-score", "0")
  fireEvent.change(field, { target: { value: "zzzzzzzz" } })
  expect(root).toHaveAttribute("data-score", "1")
  expect(root).toHaveAttribute("data-tone", "weak")
})

test("分段数和规则数会裁切反馈", () => {
  const view = render(<StrengthSegmentFill segments={3} />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Strong" }))
  expect(root).toHaveAttribute("data-segments", "3")
  expect(root).toHaveAttribute("data-filled", "3")
  expect(root).toHaveAttribute("data-tone", "strong")
  cleanup()
  const fewer = render(<StrengthSegmentFill rules={2} />)
  const next = rootOf(fewer.container)
  expect(next.querySelectorAll("[data-rule]")).toHaveLength(2)
  fireEvent.click(fewer.getByRole("button", { name: "Medium" }))
  expect(next).toHaveAttribute("data-score", "2")
  expect(next).toHaveAttribute("data-tone", "strong")
})

test("减弱动效瞬时填段", () => {
  installMedia({ reduced: true })
  const view = render(<StrengthSegmentFill />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-morph", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.click(view.getByRole("button", { name: "Strong" }))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-score", "4")
  expect(queued.size).toBe(0)
})
