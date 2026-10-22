// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"
import { Bell, Settings } from "lucide-react"
import { useState } from "react"

import { IconMoves } from "./icon-moves"
import { ListCut } from "./list-cut"
import { LoadCut } from "./load-cut"
import { StateCut } from "./state-cut"
import { WavePhysicsLoader } from "./wave-physics-loader"
import { useWebHaptics } from "../hooks/use-web-haptics"

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
  Reflect.deleteProperty(navigator, "vibrate")
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

test("list cut shows an added row", async () => {
  function Harness() {
    const [items, setItems] = useState(["清晨"])
    return (
      <div>
        <button type="button" onClick={() => setItems((current) => [...current, "午后"])}>
          加入
        </button>
        <ListCut>
          {items.map((item) => (
            <ListCut.Item key={item} id={item}>
              {item}
            </ListCut.Item>
          ))}
        </ListCut>
      </div>
    )
  }
  render(<Harness />)
  expect(document.querySelector("[data-slot=list-cut]")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "加入" }))
  expect(screen.getByText("午后")).toBeInTheDocument()
})

test("load cut reveals content after the hold", async () => {
  const { rerender } = render(
    <LoadCut loading hold={0} minShow={0} skeleton={<span>骨架</span>}>
      正文
    </LoadCut>,
  )
  await waitFor(() => {
    const root = document.querySelector("[data-slot=load-cut]")
    expect(root?.querySelector("[aria-hidden]")).toBeNull()
    expect(root?.textContent).toContain("骨架")
  })
  rerender(
    <LoadCut loading={false} hold={0} minShow={0} skeleton={<span>骨架</span>}>
      正文
    </LoadCut>,
  )
  await waitFor(() => {
    expect(document.querySelector("[data-slot=load-cut]")?.textContent).toContain("正文")
  })
  expect(document.querySelector("[data-slot=load-cut]")).toHaveAttribute("data-motion", "off")
})

test("state cut swaps the visible state", () => {
  const { rerender } = render(<StateCut state="empty">空着</StateCut>)
  expect(screen.getByText("空着")).toBeInTheDocument()
  rerender(<StateCut state="done">完成</StateCut>)
  expect(screen.getByText("完成")).toBeInTheDocument()
  expect(document.querySelector("[data-slot=state-cut]")).toHaveAttribute("data-motion", "off")
})

function HapticsProbe() {
  const { trigger } = useWebHaptics()
  return (
    <button type="button" onClick={() => { document.body.dataset.haptic = String(trigger("success")) }}>
      轻触
    </button>
  )
}

test("web haptics returns false when vibrate is missing", async () => {
  render(<HapticsProbe />)
  await user.click(screen.getByRole("button", { name: "轻触" }))
  expect(document.body.dataset.haptic).toBe("false")
})

test("web haptics returns the vibrate result when it exists", async () => {
  const vibrate = vi.fn(() => true)
  Object.defineProperty(navigator, "vibrate", { configurable: true, value: vibrate })
  render(<HapticsProbe />)
  await user.click(screen.getByRole("button", { name: "轻触" }))
  expect(vibrate).toHaveBeenCalledWith([15, 60, 15])
  expect(document.body.dataset.haptic).toBe("true")
})
