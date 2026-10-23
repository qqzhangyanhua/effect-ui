// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { AccountAccessCard } from "./account-access-card"
import { AIChatCard } from "./ai-chat-card"
import { CardSwipeDeck } from "./card-swipe-deck"
import { CSSBox } from "./css-box"
import { CurrencyTransfer } from "./currency-transfer"
import { GitHubProfileCard } from "./github-profile-card"
import { GridTiltCard } from "./grid-tilt-card"
import { HoverSpringFeatures } from "./hover-spring-features"
import { InteractiveImageSelector } from "./interactive-image-selector"
import { LayeredGlassCard } from "./layered-glass-card"
import { LoginCard } from "./login-card"
import { NeonHoldCard } from "./neon-hold-card"
import { SwitchboardCard } from "./switchboard-card"
import { TimeMachineStack } from "./time-machine-stack"
import { TransferFundsCard } from "./transfer-funds-card"

const dot = "data:image/gif;base64,R0lGODlhAQABAAAAACw="

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
        this.callback(
          [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        )
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

const stack = [
  { id: "dawn", content: <div>黎明</div> },
  { id: "noon", content: <div>正午</div> },
]

test("跨境汇款可以复制参考号", async () => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: () => Promise.resolve() },
  })
  const { container } = render(<CurrencyTransfer locale="zh-CN" />)
  expect(slot(container, "currency-transfer")).toHaveAttribute("data-reduced", "false")
  fireEvent.click(screen.getByRole("button", { name: "Copy reference TXN-DAB3UL494" }))
  expect(await screen.findByRole("button", { name: "Reference copied" })).toBeInTheDocument()
})

test("跨境汇款在减弱动效时仍能复制参考号", async () => {
  reduceMotion = true
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: () => Promise.resolve() },
  })
  const { container } = render(<CurrencyTransfer locale="zh-CN" />)
  expect(slot(container, "currency-transfer")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "Copy reference TXN-DAB3UL494" }))
  expect(await screen.findByRole("button", { name: "Reference copied" })).toBeInTheDocument()
})

test("交换台整张卡片可以点击", () => {
  const onButtonClick = vi.fn()
  const { container } = render(
    <SwitchboardCard onButtonClick={onButtonClick} randomLights subtitle="机房指示灯会自己换班。" title="交换台" />,
  )
  expect(slot(container, "switchboard-card")).toHaveAttribute("data-reduced", "false")
  fireEvent.click(screen.getByRole("button", { name: "交换台" }))
  expect(onButtonClick).toHaveBeenCalledOnce()
})

test("交换台在减弱动效时仍能点击", () => {
  reduceMotion = true
  const onButtonClick = vi.fn()
  const { container } = render(
    <SwitchboardCard onButtonClick={onButtonClick} subtitle="机房指示灯会自己换班。" title="交换台" />,
  )
  expect(slot(container, "switchboard-card")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "交换台" }))
  expect(onButtonClick).toHaveBeenCalledOnce()
})

test("时光机按向下键翻到下一张", () => {
  const { container } = render(<TimeMachineStack items={stack} />)
  expect(slot(container, "time-machine-stack")).toHaveAttribute("data-reduced", "false")
  fireEvent.keyDown(screen.getByRole("listbox"), { key: "ArrowDown" })
  expect(screen.getByRole("option", { name: "正午" })).toHaveAttribute("aria-selected", "true")
})

test("时光机在减弱动效时仍能翻页", () => {
  reduceMotion = true
  const { container } = render(<TimeMachineStack items={stack} />)
  expect(slot(container, "time-machine-stack")).toHaveAttribute("data-reduced", "true")
  fireEvent.keyDown(screen.getByRole("listbox"), { key: "ArrowDown" })
  expect(screen.getByRole("option", { name: "正午" })).toHaveAttribute("aria-selected", "true")
})

test("图片选择可以点中一张", () => {
  const { container } = render(<InteractiveImageSelector images={[{ id: 1, src: dot }]} selectable />)
  expect(slot(container, "interactive-image-selector")).toHaveAttribute("data-reduced", "false")
  fireEvent.click(screen.getByAltText("Gallery item 1"))
  expect(screen.getByText("1 selected")).toBeInTheDocument()
})

test("图片选择在减弱动效时仍能点中", () => {
  reduceMotion = true
  const { container } = render(<InteractiveImageSelector images={[{ id: 1, src: dot }]} selectable />)
  expect(slot(container, "interactive-image-selector")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByAltText("Gallery item 1"))
  expect(screen.getByText("1 selected")).toBeInTheDocument()
})

test("滑动卡组显示剩余张数", () => {
  const { container } = render(<CardSwipeDeck items={[{ id: "a", content: <div>甲</div> }]} />)
  expect(slot(container, "card-swipe-deck")).toHaveAttribute("data-reduced", "false")
  expect(screen.getByText("甲")).toBeInTheDocument()
  expect(screen.getByText("1 card remaining")).toBeInTheDocument()
})

test("滑动卡组在减弱动效时仍显示剩余张数", () => {
  reduceMotion = true
  const { container } = render(<CardSwipeDeck items={[{ id: "a", content: <div>甲</div> }]} />)
  expect(slot(container, "card-swipe-deck")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("甲")).toBeInTheDocument()
})

test("六面盒子显示正面", () => {
  const { container } = render(<CSSBox depth={72} faces={{ front: <div>前</div> }} height={120} width={120} />)
  expect(slot(container, "css-box")).toHaveAttribute("data-reduced", "false")
  expect(screen.getByText("前")).toBeInTheDocument()
})

test("六面盒子在减弱动效时仍显示正面", () => {
  reduceMotion = true
  const { container } = render(<CSSBox depth={72} faces={{ front: <div>前</div> }} height={120} width={120} />)
  expect(slot(container, "css-box")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("前")).toBeInTheDocument()
})

test("弹簧功能卡显示标题", () => {
  const { container } = render(
    <HoverSpringFeatures items={[{ id: "night", title: "夜航", description: "沿航线慢慢亮起来。" }]} />,
  )
  expect(slot(container, "hover-spring-features")).toHaveAttribute("data-reduced", "false")
  expect(screen.getByText("夜航")).toBeInTheDocument()
})

test("弹簧功能卡在减弱动效时仍显示标题", () => {
  reduceMotion = true
  const { container } = render(
    <HoverSpringFeatures items={[{ id: "night", title: "夜航", description: "沿航线慢慢亮起来。" }]} />,
  )
  expect(slot(container, "hover-spring-features")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("夜航")).toBeInTheDocument()
})

test("倾斜卡片显示提示", () => {
  const { container } = render(<GridTiltCard />)
  expect(slot(container, "grid-tilt-card")).toHaveAttribute("data-reduced", "false")
  expect(screen.getByText("悬停看看")).toBeInTheDocument()
})

test("倾斜卡片在减弱动效时直接显示标题", () => {
  reduceMotion = true
  const { container } = render(<GridTiltCard />)
  expect(slot(container, "grid-tilt-card")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("纯 CSS 倾斜")).toBeInTheDocument()
})

test("分层玻璃可以点操作", () => {
  const onAction = vi.fn()
  const { container } = render(<LayeredGlassCard actionLabel="看细节" onAction={onAction} title="分层玻璃" />)
  expect(slot(container, "layered-glass-card")).toHaveAttribute("data-reduced", "false")
  fireEvent.click(screen.getByRole("button", { name: "看细节" }))
  expect(onAction).toHaveBeenCalledOnce()
})

test("分层玻璃在减弱动效时仍能点操作", () => {
  reduceMotion = true
  const onAction = vi.fn()
  const { container } = render(<LayeredGlassCard actionLabel="看细节" onAction={onAction} />)
  expect(slot(container, "layered-glass-card")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "看细节" }))
  expect(onAction).toHaveBeenCalledOnce()
})

test("账号卡可以提交", () => {
  const onSubmit = vi.fn()
  const { container } = render(<AccountAccessCard onSubmit={onSubmit} />)
  expect(slot(container, "account-access-card")).toHaveAttribute("data-reduced", "false")
  fireEvent.click(screen.getByRole("button", { name: "更新安全设置" }))
  expect(onSubmit).toHaveBeenCalledOnce()
})

test("账号卡在减弱动效时仍能提交", () => {
  reduceMotion = true
  const onSubmit = vi.fn()
  const { container } = render(<AccountAccessCard onSubmit={onSubmit} />)
  expect(slot(container, "account-access-card")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "更新安全设置" }))
  expect(onSubmit).toHaveBeenCalledOnce()
})

test("对话卡可以重置", () => {
  const onReset = vi.fn()
  const { container } = render(<AIChatCard greeting="你好" onReset={onReset} />)
  expect(slot(container, "ai-chat-card")).toHaveAttribute("data-reduced", "false")
  expect(screen.getByText("你好")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "重置对话" }))
  expect(onReset).toHaveBeenCalledOnce()
})

test("对话卡在减弱动效时仍能重置", () => {
  reduceMotion = true
  const onReset = vi.fn()
  const { container } = render(<AIChatCard greeting="你好" onReset={onReset} />)
  expect(slot(container, "ai-chat-card")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "重置对话" }))
  expect(onReset).toHaveBeenCalledOnce()
})

test("登录卡可以提交", () => {
  const onSubmit = vi.fn()
  const { container } = render(<LoginCard onSubmit={onSubmit} />)
  expect(slot(container, "login-card")).toHaveAttribute("data-reduced", "false")
  const submit = screen.getAllByRole("button", { name: "继续" }).at(0)
  if (!submit) throw new Error("缺少继续按钮")
  fireEvent.click(submit)
  expect(onSubmit).toHaveBeenCalledOnce()
})

test("登录卡在减弱动效时仍能提交", () => {
  reduceMotion = true
  const onSubmit = vi.fn()
  const { container } = render(<LoginCard onSubmit={onSubmit} />)
  expect(slot(container, "login-card")).toHaveAttribute("data-reduced", "true")
  const submit = screen.getAllByRole("button", { name: "继续" }).at(0)
  if (!submit) throw new Error("缺少继续按钮")
  fireEvent.click(submit)
  expect(onSubmit).toHaveBeenCalledOnce()
})

test("转账卡可以确认", () => {
  const onConfirm = vi.fn()
  const { container } = render(<TransferFundsCard amount="1,200.00" onConfirm={onConfirm} />)
  expect(slot(container, "transfer-funds-card")).toHaveAttribute("data-reduced", "false")
  expect(screen.getByText("1,200.00")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "确认转账" }))
  expect(onConfirm).toHaveBeenCalledOnce()
})

test("转账卡在减弱动效时仍能确认", () => {
  reduceMotion = true
  const onConfirm = vi.fn()
  const { container } = render(<TransferFundsCard amount="1,200.00" onConfirm={onConfirm} />)
  expect(slot(container, "transfer-funds-card")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "确认转账" }))
  expect(onConfirm).toHaveBeenCalledOnce()
})

test("资料卡展示传入的用户，空用户名时不能搜索", () => {
  const { container } = render(<GitHubProfileCard user={{ login: "octocat", name: "示例用户" }} />)
  expect(slot(container, "github-profile-card")).toHaveAttribute("data-reduced", "false")
  expect(screen.getByText("示例用户")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "搜索资料" })).toBeDisabled()
})

test("资料卡在减弱动效时仍展示用户", () => {
  reduceMotion = true
  const { container } = render(<GitHubProfileCard user={{ login: "octocat", name: "示例用户" }} />)
  expect(slot(container, "github-profile-card")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("示例用户")).toBeInTheDocument()
})

test("霓虹卡片在视口内开着动效", () => {
  const { container } = render(<NeonHoldCard>按住</NeonHoldCard>)
  expect(screen.getByText("按住")).toBeInTheDocument()
  expect(slot(container, "neon-hold-card")).toHaveAttribute("data-motion", "on")
})

test("霓虹卡片在减弱动效时关掉动效", () => {
  reduceMotion = true
  const { container } = render(<NeonHoldCard>按住</NeonHoldCard>)
  const card = slot(container, "neon-hold-card")
  expect(card).toHaveAttribute("data-reduced", "true")
  expect(card).toHaveAttribute("data-motion", "off")
})
