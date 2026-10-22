// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { AchievementToast } from "./achievement-toast"
import { Callout } from "./callout"
import { CssPatternBackground } from "./css-pattern-background"
import { DownloadSizeButton } from "./download-size-button"
import { ExpandingIconTabs } from "./expanding-icon-tabs"
import { EyeBlinkLoader } from "./eye-blink-loader"
import { HeartLikeButton } from "./heart-like-button"
import { HeartbeatButton } from "./heartbeat-button"
import { ImageFade } from "./image-fade"
import { ProgressCircle } from "./progress-circle"
import { SlideToggle } from "./slide-toggle"
import { ThreeDButton } from "./3d-button"

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

test("减弱动效时无限动画停住，图片去掉遮罩", () => {
  reduceMotion = true
  render(
    <div>
      <EyeBlinkLoader />
      <CssPatternBackground variant="stripes" />
      <HeartbeatButton />
      <ImageFade alt="甲板" fadeSize={20} src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" />
    </div>,
  )
  expect(screen.getByRole("status", { name: "加载中" })).toHaveAttribute("data-reduced", "true")
  expect(document.querySelector("[data-slot=css-pattern-background]")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("button", { name: "心跳" })).toHaveStyle({ animation: "none" })
  expect(screen.getByRole("img", { name: "甲板" }).style.maskImage).toBe("")
})

test("喜欢、开关、标签、下载和进度可以操作", () => {
  const onLikedChange = vi.fn()
  const onCheckedChange = vi.fn()
  const onValueChange = vi.fn()
  const onAction = vi.fn()
  render(
    <div>
      <HeartLikeButton count={3} onLikedChange={onLikedChange} />
      <SlideToggle offLabel="关" onCheckedChange={onCheckedChange} onLabel="开" />
      <ExpandingIconTabs
        onValueChange={onValueChange}
        tabs={[
          { value: "a", label: "总览", icon: <span>✧</span> },
          { value: "b", label: "关于", icon: <span>i</span> },
        ]}
      />
      <DownloadSizeButton href="#log" label="甲板日志" size={20} />
      <ProgressCircle value={64}>64</ProgressCircle>
      <Callout title="航线已核对" variant="success">
        北窗
      </Callout>
      <ThreeDButton>立体</ThreeDButton>
      <AchievementToast actionLabel="下一级" onAction={onAction} subtitle="等级 5" title="升级" />
    </div>,
  )
  fireEvent.click(screen.getByRole("button", { name: /喜欢/ }))
  expect(onLikedChange).toHaveBeenCalledWith(true)
  expect(screen.getByRole("button", { name: /喜欢/ })).toHaveAttribute("aria-pressed", "true")

  fireEvent.click(screen.getByRole("switch"))
  expect(onCheckedChange).toHaveBeenCalledWith(true)
  expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true")

  fireEvent.click(screen.getByRole("tab", { name: "关于" }))
  expect(onValueChange).toHaveBeenCalledWith("b")
  expect(screen.getByRole("tab", { name: "关于" })).toHaveAttribute("aria-selected", "true")

  expect(screen.getByRole("link", { name: /甲板日志/ })).toHaveAttribute("href", "#log")
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "64")
  expect(screen.getByRole("note")).toHaveTextContent("航线已核对")
  expect(screen.getByRole("button", { name: "立体" })).toHaveAttribute("data-slot", "3d-button")
  fireEvent.click(screen.getByRole("button", { name: "下一级" }))
  expect(onAction).toHaveBeenCalled()
})
