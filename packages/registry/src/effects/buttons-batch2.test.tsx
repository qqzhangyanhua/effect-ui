// @vitest-environment jsdom

import { useState } from "react"
import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { CircularTextButton } from "./circular-text-button"
import { DownloadSizeButton } from "./download-size-button"
import { EcoModeButton } from "./eco-mode-button"
import { FlowerBurstButton } from "./flower-burst-button"
import { GlitchSliceButton } from "./glitch-slice-button"
import { HeartbeatButton } from "./heartbeat-button"
import { HeartLikeButton } from "./heart-like-button"
import { LiquidGradientButton } from "./liquid-gradient-button"
import { NeubrutalismButton } from "./neubrutalism-button"
import { RetroPressButton } from "./retro-press-button"
import { RotatingCompleteButton } from "./rotating-complete-button"
import { SendArrowButton } from "./send-arrow-button"
import { StitchesButton } from "./stitches-button"
import { ThreeDButton } from "./3d-button"
import { TrashDeleteButton } from "./trash-delete-button"

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
  vi.useRealTimers()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot="${name}"]`)
  expect(node).not.toBeNull()
  return node as HTMLElement
}

test("节能按钮点击后打开", () => {
  const view = render(<EcoModeButton />)
  fireEvent.click(screen.getByRole("button", { name: "节能关" }))
  expect(screen.getByRole("button", { name: "节能开" })).toHaveAttribute("data-active", "true")
  expect(slot(view.container, "eco-mode-button")).toHaveAttribute("data-reduced", "false")
})

test("节能按钮在减弱动效下仍能打开", () => {
  reduceMotion = true
  const view = render(<EcoModeButton />)
  fireEvent.click(screen.getByRole("button", { name: "节能关" }))
  expect(screen.getByRole("button", { name: "节能开" })).toBeInTheDocument()
  expect(slot(view.container, "eco-mode-button")).toHaveAttribute("data-reduced", "true")
})

test("完成按钮先进入处理中", () => {
  vi.useFakeTimers()
  const view = render(<RotatingCompleteButton />)
  fireEvent.click(screen.getByRole("button", { name: "标为完成" }))
  expect(screen.getByRole("button", { name: "处理中" })).toHaveAttribute("data-phase", "loading")
  act(() => {
    vi.advanceTimersByTime(700)
  })
  expect(screen.getByRole("button", { name: /完成/ })).toHaveAttribute("data-phase", "done")
  expect(slot(view.container, "rotating-complete-button")).toHaveAttribute("data-reduced", "false")
})

test("完成按钮在减弱动效下直接完成", () => {
  reduceMotion = true
  const view = render(<RotatingCompleteButton />)
  fireEvent.click(screen.getByRole("button", { name: "标为完成" }))
  expect(screen.getByRole("button", { name: /完成/ })).toHaveAttribute("data-phase", "done")
  expect(slot(view.container, "rotating-complete-button")).toHaveAttribute("data-reduced", "true")
})

test("缝线按钮可以点击", () => {
  const onClick = vi.fn()
  const view = render(<StitchesButton onClick={onClick}>缝线</StitchesButton>)
  fireEvent.click(screen.getByRole("button", { name: "缝线" }))
  expect(onClick).toHaveBeenCalledOnce()
  expect(slot(view.container, "stitches-button")).toHaveAttribute("data-reduced", "false")
})

test("缝线按钮在减弱动效下仍可点击", () => {
  reduceMotion = true
  const onClick = vi.fn()
  const view = render(<StitchesButton onClick={onClick}>缝线</StitchesButton>)
  fireEvent.click(screen.getByRole("button", { name: "缝线" }))
  expect(onClick).toHaveBeenCalledOnce()
  expect(slot(view.container, "stitches-button")).toHaveAttribute("data-reduced", "true")
})

test("心跳按钮写出文字", () => {
  const view = render(<HeartbeatButton>心跳</HeartbeatButton>)
  expect(screen.getByRole("button", { name: "心跳" })).toBeInTheDocument()
  expect(slot(view.container, "heartbeat-button")).toHaveAttribute("data-reduced", "false")
})

test("心跳按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  const view = render(<HeartbeatButton>心跳</HeartbeatButton>)
  expect(screen.getByRole("button", { name: "心跳" })).toBeInTheDocument()
  expect(slot(view.container, "heartbeat-button")).toHaveAttribute("data-reduced", "true")
})

test("粗野按钮写出文字", () => {
  const view = render(<NeubrutalismButton>粗野</NeubrutalismButton>)
  expect(screen.getByRole("button", { name: "粗野" })).toBeInTheDocument()
  expect(slot(view.container, "neubrutalism-button")).toHaveAttribute("data-reduced", "false")
})

test("粗野按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  const view = render(<NeubrutalismButton>粗野</NeubrutalismButton>)
  expect(screen.getByRole("button", { name: "粗野" })).toBeInTheDocument()
  expect(slot(view.container, "neubrutalism-button")).toHaveAttribute("data-reduced", "true")
})

test("立体按钮写出文字", () => {
  const view = render(<ThreeDButton>立体</ThreeDButton>)
  expect(screen.getByRole("button", { name: "立体" })).toBeInTheDocument()
  expect(slot(view.container, "3d-button")).toHaveAttribute("data-reduced", "false")
})

test("立体按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  const view = render(<ThreeDButton>立体</ThreeDButton>)
  expect(screen.getByRole("button", { name: "立体" })).toBeInTheDocument()
  expect(slot(view.container, "3d-button")).toHaveAttribute("data-reduced", "true")
})

function LikeHarness() {
  const [liked, setLiked] = useState(false)
  return <HeartLikeButton count={liked ? 13 : 12} liked={liked} onLikedChange={setLiked} />
}

test("喜欢按钮点一下变成已喜欢", () => {
  const view = render(<LikeHarness />)
  fireEvent.click(screen.getByRole("button", { name: /喜欢/ }))
  expect(screen.getByRole("button", { name: /13/ })).toHaveAttribute("aria-pressed", "true")
  expect(slot(view.container, "heart-like-button")).toHaveAttribute("data-reduced", "false")
})

test("喜欢按钮在减弱动效下仍能点亮", () => {
  reduceMotion = true
  const view = render(<LikeHarness />)
  fireEvent.click(screen.getByRole("button", { name: /喜欢/ }))
  expect(screen.getByRole("button", { name: /13/ })).toHaveAttribute("aria-pressed", "true")
  expect(slot(view.container, "heart-like-button")).toHaveAttribute("data-reduced", "true")
})

test("下载按钮链到日志", () => {
  const view = render(<DownloadSizeButton href="#deck-log" label="甲板日志" size={20} />)
  expect(screen.getByRole("link", { name: /甲板日志/ })).toHaveAttribute("href", "#deck-log")
  expect(slot(view.container, "download-size-button")).toHaveAttribute("data-reduced", "false")
})

test("下载按钮在减弱动效下仍是链接", () => {
  reduceMotion = true
  const view = render(<DownloadSizeButton href="#deck-log" label="甲板日志" />)
  expect(screen.getByRole("link", { name: /甲板日志/ })).toBeInTheDocument()
  expect(slot(view.container, "download-size-button")).toHaveAttribute("data-reduced", "true")
})

test("复古按钮写出文字", () => {
  const view = render(<RetroPressButton color="#f6781e" shadowColor="#2f2e41">按下</RetroPressButton>)
  expect(screen.getByRole("button", { name: "按下" })).toBeInTheDocument()
  expect(slot(view.container, "retro-press-button")).toHaveAttribute("data-reduced", "false")
})

test("复古按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  const view = render(<RetroPressButton>按下</RetroPressButton>)
  expect(screen.getByRole("button", { name: "按下" })).toBeInTheDocument()
  expect(slot(view.container, "retro-press-button")).toHaveAttribute("data-reduced", "true")
})

test("液态按钮链到仓库", () => {
  const view = render(<LiquidGradientButton href="https://github.com/ui-layouts/uilayouts">Github</LiquidGradientButton>)
  expect(screen.getByRole("link", { name: "Github" })).toHaveAttribute("href", "https://github.com/ui-layouts/uilayouts")
  expect(slot(view.container, "liquid-gradient-button")).toHaveAttribute("data-reduced", "false")
})

test("液态按钮在减弱动效下仍是链接", () => {
  reduceMotion = true
  const view = render(<LiquidGradientButton href="https://github.com/ui-layouts/uilayouts">Github</LiquidGradientButton>)
  expect(screen.getByRole("link", { name: "Github" })).toBeInTheDocument()
  expect(slot(view.container, "liquid-gradient-button")).toHaveAttribute("data-reduced", "true")
})

test("切片按钮写出文字", () => {
  const view = render(<GlitchSliceButton label="悬停看看">悬停看看</GlitchSliceButton>)
  expect(screen.getByRole("button", { name: "悬停看看" })).toBeInTheDocument()
  expect(slot(view.container, "glitch-slice-button")).toHaveAttribute("data-reduced", "false")
})

test("切片按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  const view = render(<GlitchSliceButton label="悬停看看">悬停看看</GlitchSliceButton>)
  expect(screen.getByRole("button", { name: "悬停看看" })).toBeInTheDocument()
  expect(slot(view.container, "glitch-slice-button")).toHaveAttribute("data-reduced", "true")
})

test("发送按钮写出文字", () => {
  const view = render(<SendArrowButton>发送</SendArrowButton>)
  expect(screen.getByRole("button", { name: "发送" })).toBeInTheDocument()
  expect(slot(view.container, "send-arrow-button")).toHaveAttribute("data-reduced", "false")
})

test("发送按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  const view = render(<SendArrowButton>发送</SendArrowButton>)
  expect(screen.getByRole("button", { name: "发送" })).toBeInTheDocument()
  expect(slot(view.container, "send-arrow-button")).toHaveAttribute("data-reduced", "true")
})

test("删除按钮用提示当名称", () => {
  const view = render(<TrashDeleteButton tooltip="删除" />)
  expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument()
  expect(slot(view.container, "trash-delete-button")).toHaveAttribute("data-reduced", "false")
})

test("删除按钮在减弱动效下仍保留名称", () => {
  reduceMotion = true
  const view = render(<TrashDeleteButton tooltip="删除" />)
  expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument()
  expect(slot(view.container, "trash-delete-button")).toHaveAttribute("data-reduced", "true")
})

test("环绕文字链到锚点", () => {
  const view = render(<CircularTextButton color="#7808d0" href="#circle" text="AWESOME CSS BUTTON" />)
  expect(screen.getByRole("link", { name: /AWESOME/ })).toHaveAttribute("href", "#circle")
  expect(slot(view.container, "circular-text-button")).toHaveAttribute("data-reduced", "false")
})

test("环绕文字在减弱动效下仍是链接", () => {
  reduceMotion = true
  const view = render(<CircularTextButton href="#circle" text="AWESOME CSS BUTTON" />)
  expect(screen.getByRole("link", { name: /AWESOME/ })).toBeInTheDocument()
  expect(slot(view.container, "circular-text-button")).toHaveAttribute("data-reduced", "true")
})

test("花瓣按钮写出文字", () => {
  const view = render(<FlowerBurstButton label="Flowers " />)
  expect(screen.getByRole("button", { name: /Flowers/ })).toBeInTheDocument()
  expect(slot(view.container, "flower-burst-button")).toHaveAttribute("data-reduced", "false")
})

test("花瓣按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  const view = render(<FlowerBurstButton label="Flowers " />)
  expect(screen.getByRole("button", { name: /Flowers/ })).toBeInTheDocument()
  expect(slot(view.container, "flower-burst-button")).toHaveAttribute("data-reduced", "true")
})
