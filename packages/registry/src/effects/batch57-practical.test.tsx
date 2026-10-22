// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { AvailabilityBadge } from "./availability-badge"
import { BookSpineShelf } from "./book-spine-shelf"
import { CharmText } from "./charm-text"
import { CompassRail } from "./compass-rail"
import { CookLoading } from "./cook-loading"
import { DispatchTruckButton } from "./dispatch-truck-button"
import { GoalProgressCard } from "./goal-progress-card"
import { GooglyGazeButton } from "./googly-gaze-button"
import { InkBleedText } from "./ink-bleed-text"
import { InsetSettingsList } from "./inset-settings-list"
import { MiniDesktopOS } from "./mini-desktop-os"
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

const deskApps = [
  { id: "notes", title: "Notes", icon: <span>N</span>, content: <p>A note</p> },
  { id: "mail", title: "Mail", icon: <span>M</span>, content: <p>A letter</p> },
]

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

test("墨水和点亮词保留整句，书架可以换书", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(<InkBleedText />)
  expect(screen.getAllByText(/Good ideas/).length).toBeGreaterThan(0)
  expect(screen.getByRole("button", { name: "Replay ink" })).toBeInTheDocument()
  cleanup()

  render(<CharmText />)
  const glow = screen.getByRole("button", { name: /glow/ })
  await user.click(glow)
  expect(glow).toHaveAttribute("aria-pressed", "true")
  cleanup()

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

test("用量超额会警告，设置可以进入选项再返回", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  const upgrade = vi.fn()
  render(<UsageQuotaMeter onUpgrade={upgrade} />)
  expect(screen.getByRole("alert")).toHaveTextContent(/over the included limit/)
  await user.click(screen.getByRole("button", { name: /Upgrade/ }))
  expect(upgrade).toHaveBeenCalledOnce()
  cleanup()

  render(<InsetSettingsList />)
  await user.click(screen.getByRole("button", { name: /Appearance/ }))
  await user.click(screen.getByRole("radio", { name: "Dark" }))
  expect(screen.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true")
  await user.click(screen.getByRole("button", { name: "Settings" }))
  expect(screen.getByRole("switch", { name: "Wi-Fi sync" })).toBeInTheDocument()
})

test("罗盘、档期、卡片叠、目标和迷你桌面可以操作", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(
    <CompassRail
      items={[
        { id: "n", label: "North" },
        { id: "e", label: "East" },
      ]}
    />,
  )
  await user.click(screen.getByRole("button", { name: "East" }))
  expect(screen.getByRole("button", { name: "East" })).toHaveAttribute("aria-current", "page")
  cleanup()

  render(<AvailabilityBadge status="booked" />)
  expect(screen.getByText("Fully booked")).toBeInTheDocument()
  cleanup()

  render(<SmartWidgetStack />)
  const stack = screen.getByRole("region", { name: "Widgets" })
  stack.focus()
  await user.keyboard("{ArrowDown}")
  await waitFor(() => expect(screen.getByText("Steps today")).toBeInTheDocument())
  cleanup()

  const onChange = vi.fn()
  render(<GoalProgressCard saved={3900} goal={4000} step={250} onChange={onChange} />)
  await user.click(screen.getByRole("button", { name: "Add $250" }))
  expect(onChange).toHaveBeenCalledWith(4000)
  expect(screen.getByRole("button", { name: "Done" })).toBeDisabled()
  cleanup()

  render(<MiniDesktopOS apps={deskApps} defaultOpen={["notes"]} />)
  expect(await screen.findByRole("group", { name: "Notes window" })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "Close Notes" }))
  expect(screen.getByRole("status")).toHaveTextContent("Notes closed")
  await waitFor(() => expect(screen.queryByRole("group", { name: "Notes window" })).not.toBeInTheDocument())
  await user.click(screen.getByRole("button", { name: "Open Mail" }))
  expect(screen.getByRole("group", { name: "Mail window" })).toBeInTheDocument()
})
