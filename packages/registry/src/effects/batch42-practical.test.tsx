// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { BottomNavigation } from "./bottom-navigation"
import { CategorySearchInput } from "./category-search-input"

import { FlyAroundButton } from "./fly-around-button"
import { FocusLineInput } from "./focus-line-input"
import { MeetingControlBar } from "./meeting-control-bar"
import { PendulumSocialCard } from "./pendulum-social-card"
import { PrinterIconButton } from "./printer-icon-button"
import { TiltSweepButton } from "./tilt-sweep-button"
import { TransactionCard } from "./transaction-card"
import { UnoCard } from "./uno-card"
import { WordWheelCard } from "./word-wheel-card"

let reduceMotion = false

afterEach(() => {
  cleanup()
  reduceMotion = false
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

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
}))

const pixel = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3C/svg%3E"

test("减弱动效时牌面、打印机和圆盘保持可读", () => {
  reduceMotion = true
  const { container } = render(
    <div>
      <UnoCard colors={["#FF2400", "#1F51FF", "#FFEA00", "#50C878"]} size={120}>
        UNO
      </UnoCard>
      <PrinterIconButton color="#00104b" label="打印" />
      <WordWheelCard title="欢迎" wordsA={["更省事", "更便宜"]} wordsB={["秘密", "更贵"]} />
      <TiltSweepButton from="#99fff8" to="hsla(13, 63%, 73%, 1)">
        点我
      </TiltSweepButton>
      <FocusLineInput lineColor="#6c63ff" placeholder="输入文字" />
    </div>,
  )
  expect(container.querySelector("[data-slot=uno-card]")).toHaveAttribute("data-reduced", "true")
  expect(container.querySelector("[data-slot=uno-card]")).toHaveAttribute("data-motion", "off")
  expect(screen.getByRole("button", { name: "打印" })).toHaveAttribute("data-motion", "off")
  expect(screen.getByText("更省事")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "点我" }).style.transform).toContain("rotateX(15deg)")
  expect(container.querySelector("[data-part=line]")).toBeInTheDocument()
})

test("交易卡、摆锤和飞出按钮可以点击", () => {
  const onClick = vi.fn()
  render(
    <div>
      <TransactionCard amount="¥128" label="新的交易" onClick={onClick} />
      <PendulumSocialCard
        heading="我们也在社交网络"
        image={{ src: pixel, alt: "头像" }}
        links={[{ label: "照片", href: "#photo" }]}
      />
      <FlyAroundButton icon={<span>寄</span>} onClick={onClick}>
        发送消息
      </FlyAroundButton>
    </div>,
  )
  fireEvent.click(screen.getByRole("button", { name: /新的交易/ }))
  fireEvent.click(screen.getByRole("button", { name: "发送消息" }))
  expect(onClick).toHaveBeenCalledTimes(2)
  expect(screen.getByRole("img", { name: "头像" })).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "照片" })).toHaveAttribute("href", "#photo")
})

test("底部导航标出当前项并留出安全区", () => {
  const { container } = render(
    <BottomNavigation
      items={[
        { label: "首页", href: "#home", current: true },
        { label: "钱包", href: "#wallet" },
      ]}
      variant="bordered"
    />,
  )
  expect(screen.getByRole("link", { name: "首页" })).toHaveAttribute("aria-current", "page")
  expect(container.querySelector("[data-slot=bottom-navigation] style")?.textContent ?? "").toContain("safe-area-inset-bottom")
})

test("会议控制条切换按下状态并结束", () => {
  const onToggle = vi.fn()
  const onEnd = vi.fn()
  render(
    <MeetingControlBar
      controls={{ mic: false, cam: false, feedback: false, settings: false }}
      end="结束"
      onEnd={onEnd}
      onToggle={onToggle}
      time="12:43"
    />,
  )
  const mic = screen.getByRole("button", { name: "麦克风" })
  expect(mic).toHaveAttribute("aria-pressed", "false")
  fireEvent.click(mic)
  expect(onToggle).toHaveBeenCalledWith("mic", true)
  fireEvent.click(screen.getByRole("button", { name: "结束" }))
  expect(onEnd).toHaveBeenCalledOnce()
  expect(screen.getByText("12:43")).toBeInTheDocument()
})

test("搜索框 Esc 清空", () => {
  const onValueChange = vi.fn()
  const onSearch = vi.fn()
  render(
    <div>
      <CategorySearchInput
        categories={[{ value: "all", label: "全部分类" }]}
        onSearch={onSearch}
        onValueChange={onValueChange}
        value={{ category: "all", query: "帽子" }}
      />
    </div>,
  )
  fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" })
  expect(onValueChange).toHaveBeenCalledWith({ category: "all", query: "" })
  fireEvent.submit(screen.getByRole("search"))
  expect(onSearch).toHaveBeenCalledWith({ category: "all", query: "帽子" })
})
