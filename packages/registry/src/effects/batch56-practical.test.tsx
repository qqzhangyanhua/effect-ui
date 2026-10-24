// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { ApiRequestInspector } from "./api-request-inspector"
import { CopperplateHatch } from "./copperplate-hatch"
import { CoreStrata } from "./core-strata"
import { EnvironmentSwitcher } from "./environment-switcher"
import { EventPropagationMatrix } from "./event-propagation-matrix"
import { FilmstripScrub } from "./filmstrip-scrub"
import { KineticEmphasis } from "./kinetic-emphasis"
import { LiquidFillHeadline } from "./liquid-fill-headline"
import { LiveLogStream } from "./live-log-stream"
import { QueuePulseLanes } from "./queue-pulse-lanes"
import { VelocitySkewFeed } from "./velocity-skew-feed"

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

test("队列车道、事件矩阵、铜版和岩芯在减弱动效下仍能读到结构", () => {
  const { unmount } = render(<QueuePulseLanes />)
  expect(screen.getAllByText(/webhooks/).length).toBeGreaterThan(0)
  unmount()

  render(<EventPropagationMatrix />)
  expect(screen.getByText("dead-letter")).toBeInTheDocument()
  cleanup()

  render(<CopperplateHatch>铜版</CopperplateHatch>)
  expect(screen.getByText("铜版")).toBeInTheDocument()
  cleanup()

  render(<CoreStrata>岩芯</CoreStrata>)
  expect(screen.getByText("岩芯")).toBeInTheDocument()
})

test("强调句和液面标题保留可读文字", () => {
  render(
    <KineticEmphasis>
      Motion <em>emphasis</em>
    </KineticEmphasis>,
  )
  expect(screen.getAllByText(/emphasis/).length).toBeGreaterThan(0)
  cleanup()
  render(<LiquidFillHeadline text="Pour" />)
  expect(screen.getAllByText("Pour").length).toBeGreaterThan(0)
})

test("速度剪切信息流可以滚动，胶片条可以用键盘换帧", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(
    <VelocitySkewFeed
      label="feed"
      items={[
        <span key="a">alpha</span>,
        <span key="b">beta</span>,
      ]}
    />,
  )
  expect(screen.getByRole("region", { name: "feed" })).toHaveTextContent("alpha")
  cleanup()

  render(
    <FilmstripScrub
      frames={[
        { id: "a", label: "dawn", node: <span>dawn</span> },
        { id: "b", label: "noon", node: <span>noon</span> },
      ]}
    />,
  )
  const slider = screen.getByRole("slider")
  slider.focus()
  await user.keyboard("{ArrowRight}")
  expect(slider).toHaveAttribute("aria-valuenow", "1")
})

test("日志可以按关键字过滤", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(
    <LiveLogStream
      entries={[
        { id: "1", level: "info", message: "compiled" },
        { id: "2", level: "error", message: "failed" },
      ]}
    />,
  )
  await user.type(screen.getByRole("searchbox", { name: "Filter logs" }), "fail")
  expect(screen.getByText("failed")).toBeInTheDocument()
  expect(screen.queryByText("compiled")).not.toBeInTheDocument()
})

test("环境切换在确认生产环境后更新", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(
    <EnvironmentSwitcher
      requireProductionConfirmation
      defaultValue="dev"
      environments={[
        { id: "dev", name: "Development", type: "development", status: "active" },
        { id: "prod", name: "Production", type: "production", status: "available" },
      ]}
    />,
  )
  await user.click(screen.getByRole("button", { name: /Development/ }))
  await user.click(screen.getByRole("button", { name: /Production/ }))
  await user.click(screen.getByRole("button", { name: "Confirm Production" }))
  expect(screen.getByRole("button", { name: /Production/ })).toBeInTheDocument()
})

test("请求检查可以查看交换", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(
    <ApiRequestInspector
      state="success"
      request={{ method: "GET", url: "https://api.example.test/orders", headers: { Authorization: "secret" } }}
      response={{ status: 200, body: { ok: true } }}
    />,
  )
  expect(screen.getByText("GET")).toBeInTheDocument()
  expect(screen.queryByText("secret")).not.toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "Response body" }))
  expect(screen.getByText(/ok/)).toBeInTheDocument()
})
