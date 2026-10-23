// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { AnimatedSubscribeButton } from "./animated-subscribe-button"
import { AttractButton } from "./attract-button"
import { CopyButton } from "./copy-button"
import { GooeyButton } from "./gooey-button"
import { HoldButton } from "./hold-button"
import { HoverAttentionButton } from "./hover-attention-button"
import { InteractiveHoverButton } from "./interactive-hover-button"
import { LoadingButton } from "./loading-button"
import { NeonButton } from "./neon-button"
import { PullCord } from "./pull-cord"
import { PulseButton } from "./pulse-button"
import { ShimmerButton } from "./shimmer-button"
import { StarWarsButton } from "./star-wars-button"
import { TearButton } from "./tear-button"
import { UndoButton } from "./undo-button"

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
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
  Object.getPrototypeOf(path).getTotalLength = () => 120
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

test("扫光按钮写出文字", () => {
  render(<ShimmerButton>Shimmer</ShimmerButton>)
  expect(screen.getByRole("button", { name: "Shimmer" })).toBeInTheDocument()
})

test("扫光按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  render(<ShimmerButton>Shimmer</ShimmerButton>)
  expect(screen.getByRole("button", { name: "Shimmer" })).toBeInTheDocument()
})

test("脉冲按钮写出文字", () => {
  render(<PulseButton>脉冲</PulseButton>)
  expect(screen.getByRole("button", { name: "脉冲" })).toBeInTheDocument()
})

test("脉冲按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  render(<PulseButton>脉冲</PulseButton>)
  expect(screen.getByRole("button", { name: "脉冲" })).toBeInTheDocument()
})

test("霓虹按钮写出文字", () => {
  render(<NeonButton>Neon</NeonButton>)
  expect(screen.getByRole("button", { name: "Neon" })).toBeInTheDocument()
})

test("霓虹按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  render(<NeonButton>Neon</NeonButton>)
  expect(screen.getByRole("button", { name: "Neon" })).toBeInTheDocument()
})

test("悬停按钮写出文字", () => {
  render(<InteractiveHoverButton>继续阅读</InteractiveHoverButton>)
  expect(screen.getByRole("button", { name: "继续阅读" })).toBeInTheDocument()
})

test("悬停按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  render(<InteractiveHoverButton>继续阅读</InteractiveHoverButton>)
  expect(screen.getByRole("button", { name: "继续阅读" })).toBeInTheDocument()
})

test("液态按钮写出文字", () => {
  render(<GooeyButton>Gooey</GooeyButton>)
  expect(screen.getByRole("button", { name: "Gooey" })).toBeInTheDocument()
})

test("液态按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  render(<GooeyButton>Gooey</GooeyButton>)
  expect(screen.getByRole("button", { name: "Gooey" })).toBeInTheDocument()
})

function holdUntilConfirm(onConfirm: ReturnType<typeof vi.fn>) {
  let now = 0
  vi.spyOn(performance, "now").mockImplementation(() => now)
  vi.spyOn(window, "setInterval").mockImplementation((handler) => {
    now = 1000
    if (typeof handler === "function") handler()
    return 1
  })
  fireEvent.pointerDown(screen.getByRole("button", { name: "长按确认" }))
  expect(onConfirm).toHaveBeenCalledOnce()
}

test("长按走完后确认", () => {
  const onConfirm = vi.fn()
  render(<HoldButton duration={1000} onConfirm={onConfirm}>长按确认</HoldButton>)
  holdUntilConfirm(onConfirm)
})

test("长按在减弱动效下仍会确认", () => {
  reduceMotion = true
  const onConfirm = vi.fn()
  render(<HoldButton duration={1000} onConfirm={onConfirm}>长按确认</HoldButton>)
  holdUntilConfirm(onConfirm)
})

test("撕开按钮点击后分开", () => {
  const view = render(<TearButton>撕开</TearButton>)
  fireEvent.click(screen.getByRole("button", { name: /撕开/ }))
  expect(view.container.querySelector("[class*='tear-left']")).not.toBeNull()
})

test("撕开按钮在减弱动效下保持整块", () => {
  reduceMotion = true
  const view = render(<TearButton>撕开</TearButton>)
  fireEvent.click(screen.getByRole("button", { name: /撕开/ }))
  expect(view.container.querySelector("[class*='tear-left']")).toBeNull()
})

test("订阅按钮把下一次状态交出去", () => {
  const onChange = vi.fn()
  render(<AnimatedSubscribeButton onChange={onChange} subscribed={false} />)
  fireEvent.click(screen.getByRole("button", { name: "Subscribe" }))
  expect(onChange).toHaveBeenCalledWith(true)
})

test("订阅按钮在减弱动效下仍显示当前状态", () => {
  reduceMotion = true
  render(<AnimatedSubscribeButton onChange={() => undefined} subscribed />)
  expect(screen.getByRole("button", { name: "Subscribed ✓" })).toHaveAttribute("aria-pressed", "true")
})

test("复制按钮复制后改成已复制", async () => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.resolve() } })
  const view = render(<CopyButton value="effect-ui" />)
  fireEvent.click(screen.getByRole("button", { name: "复制" }))
  expect(await screen.findByRole("button", { name: "已复制" })).toBeInTheDocument()
  expect(slot(view.container, "copy-button")).not.toHaveAttribute("data-reduced", "true")
})

test("复制按钮在减弱动效下仍能复制", async () => {
  reduceMotion = true
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.resolve() } })
  const view = render(<CopyButton value="effect-ui" />)
  fireEvent.click(screen.getByRole("button", { name: "复制" }))
  expect(await screen.findByRole("button", { name: "已复制" })).toBeInTheDocument()
  expect(slot(view.container, "copy-button")).toHaveAttribute("data-reduced", "true")
})

test("拉绳开关可以关掉", () => {
  const view = render(<PullCord label="台灯" />)
  const toggle = screen.getByRole("switch", { name: "台灯" })
  expect(toggle).toHaveAttribute("aria-checked", "true")
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-checked", "false")
  expect(slot(view.container, "pull-cord")).toHaveAttribute("data-reduced", "false")
})

test("拉绳在减弱动效下仍能切换", () => {
  reduceMotion = true
  const view = render(<PullCord label="台灯" />)
  const toggle = screen.getByRole("switch", { name: "台灯" })
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-checked", "false")
  expect(slot(view.container, "pull-cord")).toHaveAttribute("data-reduced", "true")
})

test("撤销按钮点开倒计时", () => {
  const onAction = vi.fn()
  const view = render(<UndoButton label="Archive" onAction={onAction} />)
  const button = screen.getByRole("button", { name: "Archive" })
  vi.stubGlobal("requestAnimationFrame", () => 1)
  vi.stubGlobal("cancelAnimationFrame", () => undefined)
  fireEvent.click(button)
  expect(onAction).toHaveBeenCalledOnce()
  expect(button).toHaveAttribute("aria-label", "Archived. Undo, 5 seconds left")
  expect(slot(view.container, "undo-button")).toHaveAttribute("data-reduced", "false")
})

test("撤销按钮在减弱动效下仍点开倒计时", () => {
  reduceMotion = true
  const view = render(<UndoButton label="Archive" />)
  vi.stubGlobal("requestAnimationFrame", () => 1)
  vi.stubGlobal("cancelAnimationFrame", () => undefined)
  fireEvent.click(screen.getByRole("button", { name: "Archive" }))
  expect(screen.getByRole("button", { name: /Archived/ })).toBeInTheDocument()
  expect(slot(view.container, "undo-button")).toHaveAttribute("data-reduced", "true")
})

test("磁吸按钮写出文字", () => {
  const view = render(<AttractButton>靠近</AttractButton>)
  expect(screen.getByRole("button", { name: "靠近" })).toBeInTheDocument()
  expect(slot(view.container, "attract-button")).toHaveAttribute("data-reduced", "false")
})

test("磁吸按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  const view = render(<AttractButton>靠近</AttractButton>)
  expect(screen.getByRole("button", { name: "靠近" })).toBeInTheDocument()
  expect(slot(view.container, "attract-button")).toHaveAttribute("data-reduced", "true")
})

test("加载按钮在加载时禁用", () => {
  const view = render(<LoadingButton loading>保存记录</LoadingButton>)
  const button = screen.getByRole("button", { name: "保存记录" })
  expect(button).toBeDisabled()
  expect(button).toHaveAttribute("aria-busy", "true")
  expect(slot(view.container, "loading-button")).toHaveAttribute("data-reduced", "false")
})

test("加载按钮在减弱动效下不再旋转", () => {
  reduceMotion = true
  const view = render(<LoadingButton loading>保存记录</LoadingButton>)
  expect(screen.getByRole("button", { name: "保存记录" })).toBeDisabled()
  expect(view.container.querySelector(".animate-spin")).toBeNull()
  expect(slot(view.container, "loading-button")).toHaveAttribute("data-reduced", "true")
})

test("星战按钮写出文字", () => {
  const view = render(<StarWarsButton>跃迁</StarWarsButton>)
  expect(screen.getByRole("button", { name: "跃迁" })).toBeInTheDocument()
  expect(slot(view.container, "star-wars-button")).toHaveAttribute("data-reduced", "false")
})

test("星战按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  const view = render(<StarWarsButton>跃迁</StarWarsButton>)
  expect(screen.getByRole("button", { name: "跃迁" })).toBeInTheDocument()
  expect(slot(view.container, "star-wars-button")).toHaveAttribute("data-reduced", "true")
})

test("注意力按钮悬停后播放", () => {
  const view = render(<HoverAttentionButton>欢呼</HoverAttentionButton>)
  const button = screen.getByRole("button", { name: "欢呼" })
  fireEvent.mouseEnter(button)
  expect(button.style.animationName).toBe("effect-ui-hover-tada")
  expect(slot(view.container, "hover-attention-button")).toHaveAttribute("data-reduced", "false")
})

test("注意力按钮在减弱动效下不播放", () => {
  reduceMotion = true
  const view = render(<HoverAttentionButton>欢呼</HoverAttentionButton>)
  const button = screen.getByRole("button", { name: "欢呼" })
  fireEvent.mouseEnter(button)
  expect(button.style.animationName).toBe("none")
  expect(slot(view.container, "hover-attention-button")).toHaveAttribute("data-reduced", "true")
})
