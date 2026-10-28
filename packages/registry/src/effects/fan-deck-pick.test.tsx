// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { FanDeckPick } from "./fan-deck-pick"

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
  const entry = getComponent("fan-deck-pick")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='fan-deck-pick']")
  if (!(node instanceof HTMLElement)) throw new Error("missing fan")
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

test("扇形牌从中间焦点开始，控件起始值等于默认", async () => {
  expect(getComponent("fan-deck-pick")?.batch).toBe(75)
  expect(getComponent("fan-deck-pick")?.effectCategory).toBe("cards")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.6)
  expect(start("count")).toBe(10)
  expect(start("spread")).toBe(64)
  const view = render(<FanDeckPick />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "fan-pick")
  expect(root).toHaveAttribute("data-focus", "4")
  expect(root).toHaveAttribute("data-revealed", "none")
  expect(root).toHaveAttribute("data-state", "fanning")
  expect(root).toHaveAttribute("data-count", "10")
  expect(root).toHaveAttribute("data-spread", "64")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(view.getByRole("button", { name: "Card 5 of 10" })).toBeTruthy()
  expect(root.querySelector("[data-card='5']")).toHaveAttribute("data-angle", (64 / 9).toFixed(1))
  expect(root.querySelector("[data-card='4']")).toHaveAttribute("data-face", "back")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("方向键改焦点，Enter 翻面再收回", () => {
  const onReveal = vi.fn()
  const view = render(<FanDeckPick onReveal={onReveal} />)
  const root = rootOf(view.container)
  fireEvent.keyDown(view.getByRole("button", { name: "Card 5 of 10" }), { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-focus", "5")
  expect(root).toHaveAttribute("data-state", "focused")
  expect(view.getByRole("button", { name: "Card 6 of 10" })).toHaveAttribute("data-title", "Lantern")
  fireEvent.keyDown(view.getByRole("button", { name: "Card 6 of 10" }), { key: "Enter" })
  expect(root).toHaveAttribute("data-revealed", "5")
  expect(root).toHaveAttribute("data-state", "revealed")
  expect(view.getByRole("button", { name: "Card 6 of 10, revealed" })).toHaveAttribute("data-face", "front")
  expect(onReveal).toHaveBeenCalledWith(5)
  fireEvent.keyDown(view.getByRole("button", { name: "Card 6 of 10, revealed" }), { key: "Enter" })
  expect(root).toHaveAttribute("data-revealed", "none")
  expect(root).toHaveAttribute("data-state", "fanning")
  expect(onReveal).toHaveBeenCalledWith(null)
})

test("点选翻面，滑动只改焦点", () => {
  const view = render(<FanDeckPick count={8} spread={48} intensity={1} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-count", "8")
  expect(root).toHaveAttribute("data-focus", "3")
  expect(root).toHaveAttribute("data-spread", "48")
  expect(root).toHaveAttribute("data-lift", "44")
  expect(view.getByRole("button", { name: "Card 4 of 8" })).toBeTruthy()
  const fan = root.querySelector("[data-part='fan']")
  if (!(fan instanceof HTMLElement)) throw new Error("missing fan")
  fireEvent.pointerDown(fan, { clientX: 10, button: 0, pointerId: 1 })
  fireEvent.pointerMove(fan, { clientX: 82, pointerId: 1 })
  fireEvent.pointerUp(fan, { clientX: 82, pointerId: 1 })
  expect(root).toHaveAttribute("data-focus", "5")
  expect(root).toHaveAttribute("data-state", "focused")
  expect(root).toHaveAttribute("data-revealed", "none")
  fireEvent.click(view.getByRole("button", { name: "Card 1 of 8" }))
  expect(root).toHaveAttribute("data-revealed", "none")
  fireEvent.click(view.getByRole("button", { name: "Card 1 of 8" }))
  expect(root).toHaveAttribute("data-revealed", "0")
  expect(root).toHaveAttribute("data-state", "revealed")
  expect(view.getByRole("button", { name: "Card 1 of 8, revealed" })).toHaveAttribute("data-title", "North")
})

test("减弱动效瞬时切换正反面", () => {
  installMedia({ reduced: true })
  const view = render(<FanDeckPick />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.click(view.getByRole("button", { name: "Card 5 of 10" }))
  expect(root).toHaveAttribute("data-revealed", "4")
  expect(root).toHaveAttribute("data-state", "revealed")
  expect(view.getByRole("button", { name: "Card 5 of 10, revealed" })).toHaveAttribute("data-face", "front")
  expect(queued.size).toBe(0)
})
