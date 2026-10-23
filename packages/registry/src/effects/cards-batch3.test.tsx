// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { BlogCard } from "./blog-card"
import { BlurUnveilCard } from "./blur-unveil-card"
import { CaptionImageCard } from "./caption-image-card"
import { FoldedCard } from "./folded-card"
import { GlowWanderCard } from "./glow-wander-card"
import { PendulumSocialCard } from "./pendulum-social-card"
import { PropellerOrb } from "./propeller-orb"
import { ShiftCard } from "./shift-card"
import { StatTrendCards } from "./stat-trend-cards"
import { TransactionCard } from "./transaction-card"
import { TweetCard } from "./tweet-card"
import { UnoCard } from "./uno-card"
import { WordWheelCard } from "./word-wheel-card"

const dot = "data:image/gif;base64,R0lGODlhAQABAAAAACw="

const trends = [
  { label: "利润", value: "¥404.32", from: "上月", delta: "12%", direction: "up" as const },
  { label: "成本", value: "¥240.94", from: "上月", delta: "4%", direction: "down" as const },
]

let reduceMotion = false

function media(query: string) {
  return {
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }
}

beforeEach(() => {
  reduceMotion = false
  vi.stubGlobal("matchMedia", media)
  vi.stubGlobal(
    "IntersectionObserver",
    class {
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
    },
  )
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot="${name}"]`)
  expect(node).not.toBeNull()
  return node as HTMLElement
}

test("模糊揭幕写出数字和说明", () => {
  const view = render(<BlurUnveilCard blobColor="#fca5a5" caption="进行中的项目" value="34+" />)
  expect(screen.getByText("34+")).toBeInTheDocument()
  expect(screen.getByText("进行中的项目")).toBeInTheDocument()
  expect(slot(view.container, "blur-unveil-card")).toHaveAttribute("data-reduced", "false")
})

test("模糊揭幕在减弱动效下停掉过渡", () => {
  reduceMotion = true
  const view = render(<BlurUnveilCard caption="进行中的项目" value="34+" />)
  expect(slot(view.container, "blur-unveil-card")).toHaveAttribute("data-reduced", "true")
})

test("游走发光在视野内开启动效", () => {
  const view = render(<GlowWanderCard />)
  expect(slot(view.container, "glow-wander-card")).toHaveAttribute("data-motion", "on")
})

test("游走发光在减弱动效下关掉", () => {
  reduceMotion = true
  const view = render(<GlowWanderCard />)
  const card = slot(view.container, "glow-wander-card")
  expect(card).toHaveAttribute("data-motion", "off")
  expect(card).toHaveAttribute("data-reduced", "true")
})

test("博客卡标题链到文章", () => {
  const view = render(
    <BlogCard excerpt="把沙发挪到窗边之后，下午的光会先落到靠垫上。" href="#furniture" imageAlt="靠窗" imageUrl={dot} title="把家具摆得亮一点" />,
  )
  expect(screen.getByRole("link", { name: "把家具摆得亮一点" })).toHaveAttribute("href", "#furniture")
  expect(slot(view.container, "blog-card")).toHaveAttribute("data-reduced", "false")
})

test("博客卡在减弱动效下仍保留标题", () => {
  reduceMotion = true
  const view = render(<BlogCard href="#furniture" imageAlt="靠窗" imageUrl={dot} title="把家具摆得亮一点" />)
  expect(screen.getByRole("link", { name: "把家具摆得亮一点" })).toBeInTheDocument()
  expect(slot(view.container, "blog-card")).toHaveAttribute("data-reduced", "true")
})

test("趋势卡读出涨跌", () => {
  const view = render(<StatTrendCards items={trends} />)
  expect(screen.getByText(/上涨/)).toBeInTheDocument()
  expect(screen.getByText(/下跌/)).toBeInTheDocument()
  expect(slot(view.container, "stat-trend-cards")).toHaveAttribute("data-reduced", "false")
})

test("趋势卡在减弱动效下仍读出涨跌", () => {
  reduceMotion = true
  const view = render(<StatTrendCards items={trends} />)
  expect(screen.getByText(/上涨/)).toBeInTheDocument()
  expect(slot(view.container, "stat-trend-cards")).toHaveAttribute("data-reduced", "true")
})

test("螺旋桨在视野内转动", () => {
  const view = render(<PropellerOrb size={180} speed={1.5} />)
  expect(slot(view.container, "propeller-orb")).toHaveAttribute("data-motion", "on")
})

test("螺旋桨在减弱动效下停住", () => {
  reduceMotion = true
  const view = render(<PropellerOrb />)
  const orb = slot(view.container, "propeller-orb")
  expect(orb).toHaveAttribute("data-motion", "off")
  expect(orb).toHaveAttribute("data-reduced", "true")
})

test("UNO 牌面写出中央文字", () => {
  const view = render(<UnoCard>UNO</UnoCard>)
  expect(screen.getByText("UNO")).toBeInTheDocument()
  expect(slot(view.container, "uno-card")).toHaveAttribute("data-motion", "on")
})

test("UNO 在减弱动效下停住", () => {
  reduceMotion = true
  const view = render(<UnoCard>UNO</UnoCard>)
  const card = slot(view.container, "uno-card")
  expect(card).toHaveAttribute("data-motion", "off")
  expect(card).toHaveAttribute("data-reduced", "true")
})

test("交易卡点击后通知外部", () => {
  const onClick = vi.fn()
  const view = render(<TransactionCard amount="¥128" label="新的交易" onClick={onClick} />)
  fireEvent.click(screen.getByRole("button", { name: /新的交易/ }))
  expect(onClick).toHaveBeenCalledOnce()
  expect(slot(view.container, "transaction-card")).toHaveAttribute("data-reduced", "false")
})

test("交易卡在减弱动效下仍可点击", () => {
  reduceMotion = true
  const onClick = vi.fn()
  const view = render(<TransactionCard label="新的交易" onClick={onClick} />)
  fireEvent.click(screen.getByRole("button", { name: /新的交易/ }))
  expect(onClick).toHaveBeenCalledOnce()
  expect(slot(view.container, "transaction-card")).toHaveAttribute("data-reduced", "true")
})

test("社交卡链到照片", () => {
  const view = render(
    <PendulumSocialCard heading="我们也在社交网络" image={{ src: dot, alt: "头像" }} links={[{ label: "照片", href: "#photos" }]} />,
  )
  expect(screen.getByText("我们也在社交网络")).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "照片" })).toHaveAttribute("href", "#photos")
  expect(slot(view.container, "pendulum-social-card")).toHaveAttribute("data-reduced", "false")
})

test("社交卡在减弱动效下仍保留链接", () => {
  reduceMotion = true
  const view = render(
    <PendulumSocialCard heading="我们也在社交网络" image={{ src: dot, alt: "头像" }} links={[{ label: "照片", href: "#photos" }]} />,
  )
  expect(screen.getByRole("link", { name: "照片" })).toBeInTheDocument()
  expect(slot(view.container, "pendulum-social-card")).toHaveAttribute("data-reduced", "true")
})

test("词轮默认停在第一组词", () => {
  const view = render(<WordWheelCard title="欢迎" wordsA={["更省事", "更便宜"]} wordsB={["秘密", "更贵"]} />)
  expect(screen.getByText("欢迎")).toBeInTheDocument()
  expect(screen.getByText("更省事")).toBeInTheDocument()
  expect(slot(view.container, "word-wheel-card")).toHaveAttribute("data-motion", "on")
})

test("词轮在减弱动效下仍显示第一组词", () => {
  reduceMotion = true
  const view = render(<WordWheelCard title="欢迎" wordsA={["更省事"]} wordsB={["秘密"]} />)
  const card = slot(view.container, "word-wheel-card")
  expect(screen.getByText("更省事")).toBeInTheDocument()
  expect(card).toHaveAttribute("data-motion", "off")
  expect(card).toHaveAttribute("data-reduced", "true")
})

test("班次卡悬停后打开", () => {
  const view = render(<ShiftCard bottomContent="底部说明" middleContent="平时看这里" topAnimateContent="悬停后出现" topContent="班次卡片" />)
  const card = slot(view.container, "shift-card")
  expect(card).toHaveAttribute("data-state", "closed")
  fireEvent.mouseEnter(card)
  expect(card).toHaveAttribute("data-state", "open")
  expect(screen.getByText("底部说明")).toBeInTheDocument()
})

test("班次卡在减弱动效下直接展开底部", () => {
  reduceMotion = true
  const view = render(<ShiftCard bottomContent="底部说明" topContent="班次卡片" />)
  const card = slot(view.container, "shift-card")
  expect(card).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("底部说明")).toBeInTheDocument()
  expect(card.querySelector('[data-part="bottom"]')).not.toBeNull()
})

test("折页卡链到笔记", () => {
  const view = render(
    <FoldedCard badge="草稿" href="#folded" title="现场笔记">
      <span>正文</span>
    </FoldedCard>,
  )
  expect(screen.getByRole("link", { name: /现场笔记/ })).toHaveAttribute("href", "#folded")
  expect(screen.getByText("草稿")).toBeInTheDocument()
  expect(slot(view.container, "folded-card")).toHaveAttribute("data-reduced", "false")
})

test("折页卡在减弱动效下仍是链接", () => {
  reduceMotion = true
  const view = render(
    <FoldedCard href="#folded" title="现场笔记">
      <span>正文</span>
    </FoldedCard>,
  )
  expect(screen.getByRole("link", { name: /现场笔记/ })).toBeInTheDocument()
  expect(slot(view.container, "folded-card")).toHaveAttribute("data-reduced", "true")
})

test("推文卡标出已认证", () => {
  const view = render(<TweetCard content="一条动态" handle="linxia" name="林夏" time="2小时" verified />)
  expect(screen.getByText("林夏")).toBeInTheDocument()
  expect(screen.getByRole("img", { name: "已认证" })).toBeInTheDocument()
  expect(slot(view.container, "tweet-card")).toHaveAttribute("data-reduced", "false")
})

test("推文卡在减弱动效下仍显示认证", () => {
  reduceMotion = true
  const view = render(<TweetCard content="一条动态" handle="linxia" name="林夏" verified />)
  expect(screen.getByRole("img", { name: "已认证" })).toBeInTheDocument()
  expect(slot(view.container, "tweet-card")).toHaveAttribute("data-reduced", "true")
})

test("图注卡写出说明和替代文字", () => {
  const view = render(<CaptionImageCard alt="一块绿色底板和黑色圆点" caption="现场记下的颜色" imageUrl={dot} />)
  expect(screen.getByText("现场记下的颜色")).toBeInTheDocument()
  expect(screen.getByRole("img", { name: "一块绿色底板和黑色圆点" })).toBeInTheDocument()
  expect(slot(view.container, "caption-image-card")).toHaveAttribute("data-reduced", "false")
})

test("图注卡在减弱动效下仍保留说明", () => {
  reduceMotion = true
  const view = render(<CaptionImageCard caption="现场记下的颜色" imageUrl={dot} />)
  expect(screen.getByText("现场记下的颜色")).toBeInTheDocument()
  expect(slot(view.container, "caption-image-card")).toHaveAttribute("data-reduced", "true")
})
