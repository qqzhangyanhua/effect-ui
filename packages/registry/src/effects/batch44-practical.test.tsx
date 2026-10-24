// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { CaptionImageCard } from "./caption-image-card"
import { DottedGlowBackground } from "./dotted-glow-background"
import { MultiStepLoader } from "./multi-step-loader"
import { NeoStarShapes } from "./neo-star-shapes"
import { StatefulButton } from "./stateful-button"
import { StickyBanner } from "./sticky-banner"
import { TweetCard } from "./tweet-card"

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

const scene = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"

test("减弱动效时点阵和按钮保持可见", () => {
  reduceMotion = true
  const { container } = render(
    <div>
      <DottedGlowBackground />
      <StickyBanner>公告还在</StickyBanner>
      <StatefulButton successText="完成">保存</StatefulButton>
      <TweetCard content="正文" handle="linxia" name="林夏" verified />
      <NeoStarShapes color="#05e17a" shape={19} size={40} />
      <CaptionImageCard caption="说明" imageUrl={scene} />
    </div>,
  )
  expect(container.querySelector("[data-slot=dotted-glow-background]")).toHaveAttribute("data-reduced", "true")
  expect(container.querySelector("[data-slot=dotted-glow-background] canvas")).toBeInTheDocument()
  expect(container.querySelector("[data-slot=dotted-glow-background]")).toHaveAttribute("data-fallback", "dots")
  expect(container.querySelectorAll("[data-slot=neo-star-shapes]")).toHaveLength(1)
  expect(screen.getByRole("region", { name: "公告" })).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("button", { name: "保存" })).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("@linxia")).toBeInTheDocument()
  expect(screen.getByRole("img", { name: "已认证" })).toBeInTheDocument()
  expect(container.querySelector("[data-slot=neo-star-shapes][data-shape='19']")).toBeInTheDocument()
  expect(screen.getByRole("img", { name: "说明" })).toBeInTheDocument()
})

test("公告可以滑出，异步按钮会报成功或失败", async () => {
  const onDismiss = vi.fn()
  let settle: (value: unknown) => void = () => {}
  const pending = new Promise((resolve) => {
    settle = resolve
  })
  const { container } = render(
    <div>
      <StickyBanner onDismiss={onDismiss}>可以关掉</StickyBanner>
      <button type="button">后面的按钮</button>
      <StatefulButton errorText="失败" resetAfter={4000} successText="完成" onClick={() => pending}>
        保存
      </StatefulButton>
    </div>,
  )
  fireEvent.click(screen.getByRole("button", { name: "关闭公告" }))
  expect(container.querySelector("[data-slot=sticky-banner]")).toHaveAttribute("data-state", "leaving")
  const save = screen.getByRole("button", { name: "保存" })
  fireEvent.click(save)
  expect(save).toHaveAttribute("aria-busy", "true")
  expect(save).toHaveAttribute("data-state", "loading")
  settle(undefined)
  await waitFor(() => expect(save).toHaveAttribute("data-state", "success"))
  expect(screen.getByRole("status")).toHaveTextContent("完成")
})

test("分步加载会前进并朗读当前步骤", async () => {
  render(<MultiStepLoader duration={30} loading steps={[{ text: "第一步" }, { text: "第二步" }]} title="进度标题" />)
  expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite")
  expect(screen.getByText("进度标题")).toBeInTheDocument()
  await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("第 2 步，共 2 步：第二步"), { timeout: 1000 })
})
