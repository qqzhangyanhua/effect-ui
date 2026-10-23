// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { AvatarPicker } from "./avatar-picker"
import { ClipTrimmer } from "./clip-trimmer"
import { CountBadge } from "./count-badge"
import { DurationPicker } from "./duration-picker"
import { ExposureSlider } from "./exposure-slider"
import { LiquidSlider } from "./liquid-slider"
import { MorphIcon } from "./morph-icon"
import { MusicToggle } from "./music-toggle"
import { PinnedList } from "./pinned-list"
import { PixelBrushCanvas } from "./pixel-brush-canvas"
import { Scrubber } from "./scrubber"
import { SocialSelector } from "./social-selector"
import { TimezonePlanner } from "./timezone-planner"
import { UnlockFaceId } from "./unlock-face-id"
import { VectorEditorToolbar } from "./vector-editor-toolbar"

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
  HTMLElement.prototype.scrollTo = () => {}
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
  const node = container.querySelector(`[data-slot=${name}]`)
  expect(node).toBeTruthy()
  return node as HTMLElement
}

function Mark() {
  return <svg />
}

const film = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"

const pins = [
  { id: "north", title: "北窗" },
  { id: "night", title: "夜航" },
]

const tools = [
  { icon: Mark, id: "select", label: "选择", shortcut: "v" },
  { icon: Mark, id: "pen", label: "钢笔", shortcut: "p" },
]

test("水位滑块用方向键增加读数", () => {
  render(<LiquidSlider label="今日饮水" />)
  const water = screen.getByRole("slider", { name: "今日饮水" })
  expect(water).toHaveAttribute("aria-valuenow", "1250")
  fireEvent.keyDown(water, { key: "ArrowUp" })
  expect(water).toHaveAttribute("aria-valuenow", "1300")
})

test("水位滑块在减弱动效时仍能改读数", () => {
  reduceMotion = true
  const view = render(<LiquidSlider label="今日饮水" />)
  expect(slot(view.container, "liquid-slider")).toHaveAttribute("data-reduced", "true")
  const water = screen.getByRole("slider", { name: "今日饮水" })
  fireEvent.keyDown(water, { key: "ArrowUp" })
  expect(water).toHaveAttribute("aria-valuenow", "1300")
})

test("头像选择能改显示名", () => {
  render(<AvatarPicker submitLabel="继续" title="选择头像" />)
  fireEvent.change(screen.getByDisplayValue("Robin Vale"), { target: { value: "北窗" } })
  expect(screen.getByDisplayValue("北窗")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "继续" })).toBeEnabled()
})

test("头像选择在减弱动效时仍能改显示名", () => {
  reduceMotion = true
  const view = render(<AvatarPicker submitLabel="继续" title="选择头像" />)
  expect(slot(view.container, "avatar-picker")).toHaveAttribute("data-reduced", "true")
  fireEvent.change(screen.getByDisplayValue("Robin Vale"), { target: { value: "北窗" } })
  expect(screen.getByDisplayValue("北窗")).toBeInTheDocument()
})

test("时区表盘用方向键推后会议时间", () => {
  render(<TimezonePlanner />)
  const meeting = screen.getByRole("slider", { name: "Meeting time" })
  expect(meeting).toHaveAttribute("aria-valuenow", "960")
  fireEvent.keyDown(meeting, { key: "ArrowRight" })
  expect(Number(meeting.getAttribute("aria-valuenow"))).toBeGreaterThan(960)
})

test("时区表盘在减弱动效时仍能推后会议时间", () => {
  reduceMotion = true
  const view = render(<TimezonePlanner />)
  expect(slot(view.container, "timezone-planner")).toHaveAttribute("data-reduced", "true")
  const meeting = screen.getByRole("slider", { name: "Meeting time" })
  fireEvent.keyDown(meeting, { key: "ArrowRight" })
  expect(Number(meeting.getAttribute("aria-valuenow"))).toBeGreaterThan(960)
})

test("剪辑条能开始播放", () => {
  render(<ClipTrimmer alt="山谷" src={film} />)
  fireEvent.click(screen.getByRole("button", { name: "Play" }))
  expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument()
})

test("剪辑条在减弱动效时仍能开始播放", () => {
  reduceMotion = true
  const view = render(<ClipTrimmer alt="山谷" src={film} />)
  expect(slot(view.container, "clip-trimmer")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "Play" }))
  expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument()
})

test("像素画布能切到橡皮", () => {
  render(<PixelBrushCanvas height={4} showTools width={4} />)
  fireEvent.click(screen.getByRole("button", { name: /Eraser/ }))
  expect(screen.getByRole("button", { name: /Eraser/ })).toHaveAttribute("aria-pressed", "true")
})

test("像素画布在减弱动效时仍能切到橡皮", () => {
  reduceMotion = true
  const view = render(<PixelBrushCanvas height={4} showTools width={4} />)
  expect(slot(view.container, "pixel-brush-canvas")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: /Eraser/ }))
  expect(screen.getByRole("button", { name: /Eraser/ })).toHaveAttribute("aria-pressed", "true")
})

test("时长选择用方向键增加分钟", () => {
  render(<DurationPicker defaultValue={60} />)
  const minutes = screen.getByRole("spinbutton", { name: "minute" })
  fireEvent.keyDown(minutes, { key: "ArrowUp" })
  expect(minutes).toHaveAttribute("aria-valuenow", "2")
})

test("时长选择在减弱动效时仍能增加分钟", () => {
  reduceMotion = true
  const view = render(<DurationPicker defaultValue={60} />)
  expect(slot(view.container, "duration-picker")).toHaveAttribute("data-reduced", "true")
  const minutes = screen.getByRole("spinbutton", { name: "minute" })
  fireEvent.keyDown(minutes, { key: "ArrowUp" })
  expect(minutes).toHaveAttribute("aria-valuenow", "2")
})

test("曝光条默认画出指示环，关掉后不再画", () => {
  const shown = render(<ExposureSlider defaultValue={2} />)
  expect(shown.container.querySelector("svg")).toBeTruthy()
  shown.unmount()
  const hidden = render(<ExposureSlider defaultValue={2} showIndicator={false} />)
  expect(hidden.container.querySelector("svg")).toBeNull()
})

test("曝光条在减弱动效时仍画出指示环", () => {
  reduceMotion = true
  const view = render(<ExposureSlider defaultValue={2} />)
  expect(slot(view.container, "exposure-slider")).toHaveAttribute("data-reduced", "true")
  expect(view.container.querySelector("svg")).toBeTruthy()
})

test("擦洗条用方向键增加读数", () => {
  render(<Scrubber defaultValue={1.5} label="光圈" max={8} min={1} step={0.1} ticks={8} />)
  const aperture = screen.getByRole("slider", { name: "光圈" })
  expect(aperture).toHaveAttribute("aria-valuenow", "1.5")
  fireEvent.keyDown(aperture, { key: "ArrowUp" })
  expect(aperture).toHaveAttribute("aria-valuenow", "1.6")
})

test("擦洗条在减弱动效时仍能增加读数", () => {
  reduceMotion = true
  const view = render(<Scrubber defaultValue={1.5} label="光圈" max={8} min={1} step={0.1} ticks={8} />)
  expect(slot(view.container, "scrubber")).toHaveAttribute("data-reduced", "true")
  const aperture = screen.getByRole("slider", { name: "光圈" })
  fireEvent.keyDown(aperture, { key: "ArrowUp" })
  expect(aperture).toHaveAttribute("aria-valuenow", "1.6")
})

test("置顶列表能钉住一条", () => {
  render(<PinnedList items={pins} />)
  fireEvent.click(screen.getByRole("button", { name: "Pin 北窗" }))
  expect(screen.getByRole("button", { name: "Unpin 北窗" })).toHaveAttribute("aria-pressed", "true")
})

test("置顶列表在减弱动效时仍能钉住一条", () => {
  reduceMotion = true
  const view = render(<PinnedList items={pins} />)
  expect(slot(view.container, "pinned-list")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "Pin 北窗" }))
  expect(screen.getByRole("button", { name: "Unpin 北窗" })).toHaveAttribute("aria-pressed", "true")
})

test("矢量工具条用快捷键切换工具", () => {
  render(<VectorEditorToolbar tools={tools} />)
  expect(screen.getByRole("button", { name: /选择/ })).toHaveAttribute("aria-pressed", "true")
  fireEvent.keyDown(document, { key: "p" })
  expect(screen.getByRole("button", { name: /钢笔/ })).toHaveAttribute("aria-pressed", "true")
})

test("矢量工具条在减弱动效时仍能切换工具", () => {
  reduceMotion = true
  const view = render(<VectorEditorToolbar tools={tools} />)
  expect(slot(view.container, "vector-editor-toolbar")).toHaveAttribute("data-reduced", "true")
  fireEvent.keyDown(document, { key: "p" })
  expect(screen.getByRole("button", { name: /钢笔/ })).toHaveAttribute("aria-pressed", "true")
})

test("面容解锁点击后进入扫描", () => {
  render(<UnlockFaceId scanDuration={50} />)
  fireEvent.click(screen.getByRole("button", { name: "Scan to unlock" }))
  expect(screen.getByRole("status")).toHaveTextContent("Scanning face…")
})

test("面容解锁在减弱动效时仍能进入扫描", () => {
  reduceMotion = true
  const view = render(<UnlockFaceId scanDuration={50} />)
  expect(slot(view.container, "unlock-face-id")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "Scan to unlock" }))
  expect(screen.getByRole("status")).toHaveTextContent("Scanning face…")
})

test("音乐开关能开始播放", () => {
  render(<MusicToggle artist="北窗" title="夜航" />)
  fireEvent.click(screen.getByRole("button", { name: /Play 夜航/ }))
  expect(screen.getByRole("button", { name: /Pause 夜航/ })).toHaveAttribute("aria-pressed", "true")
})

test("音乐开关在减弱动效时仍能开始播放", () => {
  reduceMotion = true
  const view = render(<MusicToggle artist="北窗" title="夜航" />)
  expect(slot(view.container, "music-toggle")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: /Play 夜航/ }))
  expect(screen.getByRole("button", { name: /Pause 夜航/ })).toHaveAttribute("aria-pressed", "true")
})

test("变形图标有名字时是图片，没有名字时隐藏", () => {
  const named = render(<MorphIcon label="菜单" variant="menu" />)
  expect(screen.getByRole("img", { name: "菜单" })).toBeInTheDocument()
  named.unmount()
  const hidden = render(<MorphIcon variant="menu" />)
  expect(hidden.container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  expect(hidden.container.querySelector("[role=img]")).toBeNull()
})

test("变形图标在减弱动效时仍读出名字", () => {
  reduceMotion = true
  const view = render(<MorphIcon label="菜单" variant="menu" />)
  expect(slot(view.container, "morph-icon")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("img", { name: "菜单" })).toBeInTheDocument()
})

test("数字徽章超过上限时显示 99+ 并脉冲", async () => {
  render(<CountBadge count={128} ping variant="count" />)
  expect(await screen.findByText("99+")).toBeInTheDocument()
  expect(document.querySelector(".animate-ping")).toBeTruthy()
})

test("数字徽章在减弱动效时显示 99+ 且不再脉冲", async () => {
  reduceMotion = true
  const view = render(<CountBadge count={128} ping variant="count" />)
  expect(slot(view.container, "count-badge")).toHaveAttribute("data-reduced", "true")
  expect(await screen.findByText("99+")).toBeInTheDocument()
  expect(document.querySelector(".animate-ping")).toBeNull()
})

test("社交选择能切到 Bluesky", () => {
  render(<SocialSelector handle="northwindow" />)
  fireEvent.click(screen.getByRole("button", { name: "Select Bluesky platform" }))
  expect(screen.getByText("bsky.app")).toBeInTheDocument()
})

test("社交选择在减弱动效时仍能切到 Bluesky", () => {
  reduceMotion = true
  const view = render(<SocialSelector handle="northwindow" />)
  expect(slot(view.container, "social-selector")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "Select Bluesky platform" }))
  expect(screen.getByText("bsky.app")).toBeInTheDocument()
})
