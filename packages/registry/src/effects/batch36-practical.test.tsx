// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { AccountAccessCard } from "./account-access-card"
import { AIChatCard } from "./ai-chat-card"
import { CheckCrossSwitch } from "./check-cross-switch"
import { ElementAlongPathItem, ElementAlongSvgPath } from "./element-along-svg-path"
import { GitHubProfileCard } from "./github-profile-card"
import { HttpStatusLookup } from "./http-status-lookup"
import { LetterSwapPingPong } from "./letter-swap-pingpong"
import { LoginCard } from "./login-card"
import { PlusShareBurst } from "./plus-share-burst"
import { RandomLetterSwap } from "./random-letter-swap"
import { StarRating } from "./star-rating"
import { TransferFundsCard } from "./transfer-funds-card"
import { UnderlineHoverLink } from "./underline-hover-link"

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
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
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

test("减弱动效时文字组件仍可读", () => {
  reduceMotion = true
  render(
    <div>
      <LetterSwapPingPong label="往返" />
      <RandomLetterSwap label="随机" />
      <UnderlineHoverLink direction="right" variant="in-out">
        下划线
      </UnderlineHoverLink>
      <ElementAlongSvgPath path="M0 0 H100" showPath>
        <ElementAlongPathItem>
          <span>沿路径</span>
        </ElementAlongPathItem>
      </ElementAlongSvgPath>
    </div>,
  )
  expect(screen.getByText("往返")).toBeInTheDocument()
  expect(screen.getByText("随机")).toBeInTheDocument()
  expect(screen.getByText("下划线").closest("[data-slot='underline-hover-link']")).toHaveAttribute("data-direction", "right")
  expect(screen.getByText("沿路径")).toBeInTheDocument()
})

test("开关、分享和星级可以操作", () => {
  const onSelect = vi.fn()
  render(
    <div>
      <CheckCrossSwitch />
      <PlusShareBurst items={[{ label: "相机", icon: <span>机</span>, onSelect }]} />
      <StarRating />
    </div>,
  )
  const toggle = screen.getByRole("switch", { name: "开关" })
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-checked", "true")
  fireEvent.click(screen.getByRole("button", { name: "分享" }))
  fireEvent.click(screen.getByRole("button", { name: "相机" }))
  expect(onSelect).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole("radio", { name: "4 星" }))
  expect(screen.getByRole("radio", { name: "4 星" })).toHaveAttribute("aria-checked", "true")
})

test("登录、转账和状态码使用传入的数据", () => {
  const onSubmit = vi.fn()
  const onConfirm = vi.fn()
  render(
    <div>
      <LoginCard
        fields={[{ name: "email", placeholder: "邮箱" }]}
        socialSlot={<button type="button">示例社交</button>}
        onSubmit={onSubmit}
      />
      <TransferFundsCard amount="12" fromAccount="甲" summary={[{ label: "手续费", value: "0" }]} toAccount="乙" onConfirm={onConfirm} />
      <HttpStatusLookup defaultQuery="404" />
    </div>,
  )
  fireEvent.change(screen.getByPlaceholderText("邮箱"), { target: { value: "a@b.c" } })
  fireEvent.click(screen.getByRole("button", { name: "继续" }))
  expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.c" })
  expect(screen.getByRole("button", { name: "示例社交" })).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "确认转账" }))
  expect(onConfirm).toHaveBeenCalledOnce()
  expect(screen.getByText("Not Found")).toBeInTheDocument()
  expect(screen.queryByText("OK")).not.toBeInTheDocument()
})

test("减弱动效时账号卡和对话卡直接显示第一组文案", () => {
  reduceMotion = true
  render(
    <div>
      <AccountAccessCard credentials={[{ email: "ada@example.com", passwordLength: 4 }]} />
      <AIChatCard greeting="你好" prompts={["第一句提示"]} />
    </div>,
  )
  expect(screen.getByText("ada@example.com")).toBeInTheDocument()
  expect(screen.getByText("••••")).toBeInTheDocument()
  expect(screen.getByText("第一句提示")).toBeInTheDocument()
})

test("资料卡默认不请求，提交或开启 fetch 后才请求", async () => {
  const fetchMock = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ login: "hub", name: "Hub", avatar_url: "", followers: 1, following: 2, public_repos: 3, html_url: "https://github.com/hub" }),
  }))
  const originalFetch = globalThis.fetch
  globalThis.fetch = fetchMock as typeof fetch
  const { unmount } = render(<GitHubProfileCard user={{ login: "octo", name: "章鱼" }} />)
  expect(screen.getByText("章鱼")).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
  unmount()

  render(<GitHubProfileCard />)
  fireEvent.change(screen.getByLabelText("GitHub 用户名"), { target: { value: "hub" } })
  fireEvent.click(screen.getByRole("button", { name: "搜索资料" }))
  expect(await screen.findByRole("heading", { name: "Hub" })).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledWith("https://api.github.com/users/hub")
  globalThis.fetch = originalFetch
})
