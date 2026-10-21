// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { ApertureReveal } from "./aperture-reveal"
import { BoidsEcosystem } from "./boids-ecosystem"
import { CopyButton } from "./copy-button"
import { DistortedGlass } from "./distorted-glass"
import { FeatureVoting } from "./feature-voting"
import { FibonacciLines } from "./fibonacci-lines"
import { FloatingPanel } from "./floating-panel"
import { FlowerMenu } from "./flower-menu"
import { PopoverForm } from "./popover-form"
import { ShootingStars } from "./shooting-stars"
import { SiblingFocusNav } from "./sibling-focus-nav"
import { SpeedDial } from "./speed-dial"
import { TextExplode } from "./text-explode"

let reduceMotion = false

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
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
vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 16))
vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id))

test("减弱动效时鸟群和流星停在画布上", () => {
  reduceMotion = true
  const boids = render(<BoidsEcosystem count={6} />)
  expect(boids.container.querySelector("[data-slot=boids-ecosystem]")).toHaveAttribute("data-reduced", "true")
  expect(boids.container.querySelector("canvas")).toBeTruthy()
  boids.unmount()
  const stars = render(<ShootingStars frequency={2} angle={18} color="#ffffff" />)
  expect(stars.container.querySelector("[data-slot=shooting-stars]")).toHaveAttribute("data-reduced", "true")
  expect(stars.container.querySelector("canvas")).toBeTruthy()
  cleanup()
  reduceMotion = false
})

test("减弱动效时斐波那契线同时出现", () => {
  reduceMotion = true
  const { container } = render(<FibonacciLines>框</FibonacciLines>)
  const lines = container.querySelectorAll("line")
  expect(lines.length).toBeGreaterThan(5)
  expect(lines[0]).toHaveAttribute("stroke-dashoffset", "0")
  expect(container.querySelector("[data-slot=fibonacci-lines]")).toHaveAttribute("data-reduced", "true")
  cleanup()
  reduceMotion = false
})

test("减弱动效时光圈释放裁切", () => {
  reduceMotion = true
  render(
    <ApertureReveal viewportHeight={240}>
      <ApertureReveal.Headline>
        <ApertureReveal.Lead>打开</ApertureReveal.Lead>
        <ApertureReveal.Opening />
        <ApertureReveal.Trail>光圈</ApertureReveal.Trail>
      </ApertureReveal.Headline>
    </ApertureReveal>,
  )
  expect(document.querySelector("[data-slot=aperture-reveal]")).toHaveAttribute("data-static", "")
  cleanup()
  reduceMotion = false
})

test("减弱动效时文字不炸开，导航只变暗", () => {
  reduceMotion = true
  const exploded = render(<TextExplode>收到</TextExplode>)
  expect(exploded.container.querySelector("[data-slot=text-explode]")).toHaveAttribute("data-reduced", "true")
  expect(exploded.container).toHaveTextContent("收到")
  exploded.unmount()
  const nav = render(
    <SiblingFocusNav
      items={[
        { href: "#a", label: "甲" },
        { href: "#b", label: "乙" },
      ]}
    />,
  )
  expect(nav.container.querySelector("[data-slot=sibling-focus-nav]")).toHaveAttribute("data-reduced", "true")
  cleanup()
  reduceMotion = false
})

test("玻璃滤镜标识不含冒号", () => {
  const { container } = render(<DistortedGlass />)
  const filter = container.querySelector("filter")
  expect(filter?.id ?? "").not.toMatch(/:/)
  expect(container.querySelector("[data-slot=distorted-glass]")).toBeTruthy()
  cleanup()
})

test("速度旋钮按 Esc 关闭", async () => {
  render(<SpeedDial actions={[{ label: "编辑" }, { label: "分享" }]} />)
  fireEvent.click(screen.getByRole("button", { name: "打开操作" }))
  expect(screen.getByRole("button", { name: "关闭操作" })).toHaveAttribute("aria-expanded", "true")
  expect(screen.getByText("编辑")).toBeInTheDocument()
  fireEvent.keyDown(document, { key: "Escape" })
  await waitFor(() => expect(screen.getByRole("button", { name: "打开操作" })).toHaveAttribute("aria-expanded", "false"))
  cleanup()
})

test("花朵菜单使用普通锚点", () => {
  const { container } = render(<FlowerMenu items={[{ href: "/north", label: "北窗" }]} count={3} />)
  const links = container.querySelectorAll("a")
  expect(links).toHaveLength(3)
  for (const link of links) expect(link).toHaveAttribute("href", "/north")
  cleanup()
})

test("复制成功与失败会切换状态", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } })
  const copied = render(<CopyButton value="effect-ui" />)
  fireEvent.click(screen.getByRole("button", { name: "复制" }))
  await waitFor(() => expect(copied.container.querySelector("[data-slot=copy-button]")).toHaveAttribute("data-state", "copied"))
  expect(writeText).toHaveBeenCalledWith("effect-ui")
  copied.unmount()

  writeText.mockRejectedValue(new Error("denied"))
  document.execCommand = () => false
  const failed = render(<CopyButton getValue={() => "secret"} />)
  fireEvent.click(screen.getByRole("button", { name: "复制" }))
  await waitFor(() => expect(failed.container.querySelector("[data-slot=copy-button]")).toHaveAttribute("data-state", "error"))
  cleanup()
})

test("投票后票数增加并按票数重排", () => {
  render(
    <FeatureVoting
      items={[
        { id: "a", title: "甲", description: "先", votes: 3 },
        { id: "b", title: "乙", description: "后", votes: 3 },
      ]}
    />,
  )
  expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("甲")
  fireEvent.click(screen.getByRole("button", { name: "为乙投票" }))
  expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("乙")
  expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("4")
  cleanup()
})

test("表单打开后聚焦输入框，面板点外面关闭", async () => {
  const form = render(<PopoverForm />)
  fireEvent.click(screen.getByRole("button", { name: "留言" }))
  await waitFor(() => expect(screen.getByPlaceholderText("写一句")).toHaveFocus())
  fireEvent.click(screen.getByRole("button", { name: "发送" }))
  expect(screen.getByText("已发送")).toBeInTheDocument()
  form.unmount()

  render(
    <FloatingPanel button="打开面板" title="笔记" footer={<button type="button">完成</button>}>
      正文
    </FloatingPanel>,
  )
  fireEvent.click(screen.getByRole("button", { name: "打开面板" }))
  expect(screen.getByRole("dialog", { name: "笔记" })).toBeInTheDocument()
  fireEvent.pointerDown(document.body)
  await waitFor(() => expect(screen.getByRole("button", { name: "打开面板" })).toHaveAttribute("aria-expanded", "false"))
  cleanup()
})
