// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"
import { Bell, Settings } from "lucide-react"

import { IconMoves } from "./icon-moves"
import { WavePhysicsLoader } from "./wave-physics-loader"

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 800 })
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 480 })
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 168 })
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 64 })
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", { configurable: true, get: () => 0 })
  Object.defineProperty(HTMLElement.prototype, "offsetTop", { configurable: true, get: () => 0 })
})

afterEach(() => {
  cleanup()
})

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

function reducedMatchMedia(query: string) {
  return {
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
    onchange: null,
  }
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal("matchMedia", reducedMatchMedia)

const user = userEvent.setup({ pointerEventsCheck: 0 })

test("icon moves stay still and accept a press", async () => {
  render(
    <IconMoves>
      <button type="button">
        <Settings />
        设置
      </button>
      <button type="button">
        <Bell />
        提醒
      </button>
    </IconMoves>,
  )
  expect(document.querySelector("[data-slot=icon-moves]")).toHaveAttribute("data-motion", "off")
  await user.click(screen.getByRole("button", { name: "设置" }))
  expect(screen.getByRole("button", { name: "提醒" })).toBeInTheDocument()
})

test("wave physics loader rests under reduced motion", () => {
  render(<WavePhysicsLoader />)
  const root = document.querySelector("[data-slot=wave-physics-loader]")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("aria-label", "Loading")
})

