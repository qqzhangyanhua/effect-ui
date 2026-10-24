// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { BookSpineShelf } from "./book-spine-shelf"
import { CookLoading } from "./cook-loading"
import { DispatchTruckButton } from "./dispatch-truck-button"
import { GooglyGazeButton } from "./googly-gaze-button"
import { SmartWidgetStack } from "./smart-widget-stack"
import { UsageQuotaMeter } from "./usage-quota-meter"
import { WaxSealButton } from "./wax-seal-button"
import { WeatherVaneToggle } from "./weather-vane-toggle"

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 800 })
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 600 })
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

class SizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: { x: 0, y: 0, width: 640, height: 480, top: 0, left: 0, bottom: 480, right: 640, toJSON() { return {} } },
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    )
  }

  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal("ResizeObserver", SizeObserver)
vi.stubGlobal("matchMedia", (query: string) => ({
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
}))

test("火漆在减弱动效下盖印后停在已封，货车成功后停在已出发", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(<WaxSealButton duration={0} />)
  await user.click(screen.getByRole("button", { name: "Seal & send" }))
  expect(await screen.findByRole("button", { name: "Sealed & sent" })).toBeInTheDocument()
  cleanup()

  render(<DispatchTruckButton duration={0} />)
  await user.click(screen.getByRole("button", { name: "Place order" }))
  expect(await screen.findByRole("button", { name: "On its way" }, { timeout: 2000 })).toBeInTheDocument()
})

test("货车下单失败时停在重试，不会自动回到空闲", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(<DispatchTruckButton onOrder={() => Promise.reject(new Error("no"))} />)
  await user.click(screen.getByRole("button", { name: "Place order" }))
  expect(await screen.findByRole("button", { name: "Try again" }, { timeout: 2000 })).toBeInTheDocument()
})

test("活动眼睛可以点击，风向标可以拨开", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  const onClick = vi.fn()
  render(<GooglyGazeButton onClick={onClick} />)
  await user.click(screen.getByRole("button", { name: "Get in touch" }))
  expect(onClick).toHaveBeenCalledOnce()
  cleanup()

  const onCheckedChange = vi.fn()
  render(<WeatherVaneToggle onCheckedChange={onCheckedChange} aria-label="风向" />)
  const vane = screen.getByRole("switch", { name: "风向" })
  expect(vane).toHaveAttribute("aria-checked", "false")
  expect(vane).toHaveTextContent("Still")
  await user.click(vane)
  expect(onCheckedChange).toHaveBeenCalledWith(true)
  expect(vane).toHaveTextContent("Breezy")
})

test("书架可以换书", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(<BookSpineShelf count={3} />)
  const quiet = screen.getByRole("radio", { name: /The Shape of Quiet/ })
  await user.click(quiet)
  expect(quiet).toHaveAttribute("aria-checked", "true")
  expect(await screen.findByRole("heading", { name: "The Shape of Quiet" })).toBeInTheDocument()
})

test("厨师加载显示进度，失败时可以重试", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(<CookLoading progress={42} label="Cooking things up…" />)
  expect(screen.getByRole("progressbar", { name: "Cooking things up…" })).toHaveAttribute("aria-valuenow", "42")
  expect(screen.queryByRole("button", { name: "Pause animation" })).not.toBeInTheDocument()
  cleanup()

  const retry = vi.fn()
  render(<CookLoading state="error" onRetry={retry} />)
  await user.click(screen.getByRole("button", { name: "Try again" }))
  expect(retry).toHaveBeenCalledOnce()
})

test("用量超额会警告", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  const upgrade = vi.fn()
  render(<UsageQuotaMeter onUpgrade={upgrade} />)
  expect(screen.getByRole("alert")).toHaveTextContent(/over the included limit/)
  await user.click(screen.getByRole("button", { name: /Upgrade/ }))
  expect(upgrade).toHaveBeenCalledOnce()
})

test("小组件叠可以切换", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(<SmartWidgetStack />)
  const stack = screen.getByRole("region", { name: "Widgets" })
  stack.focus()
  await user.keyboard("{ArrowDown}")
  await waitFor(() => expect(screen.getByText("Steps today")).toBeInTheDocument())
})
