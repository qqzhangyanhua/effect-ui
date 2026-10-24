// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { HoverExpand } from "./hover-expand"
import { HoverGallery } from "./hover-gallery"




import { LightBoard } from "./lightboard"

import { ProgressiveCarousel } from "./progressive-carousel"
import { Reel, ReelPlayButton } from "./reel"




const pixel =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#312e81"/></svg>')

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

const bars = [
  { alt: "靛蓝", id: "indigo", image: pixel, title: "靛蓝" },
  { alt: "琥珀", id: "amber", image: pixel, title: "琥珀" },
]

test("悬停展开显示标题", () => {
  const view = render(<HoverExpand collapsedFlex={1} expandedFlex={4} items={bars} orientation="horizontal" showLabelsWhenCollapsed />)
  expect(screen.getByText("靛蓝")).toBeInTheDocument()
  expect(slot(view.container, "hover-expand")).toHaveAttribute("data-reduced", "false")
})

test("悬停展开在减弱动效下仍显示标题", () => {
  reduceMotion = true
  const view = render(<HoverExpand collapsedFlex={1} expandedFlex={4} items={bars} orientation="horizontal" showLabelsWhenCollapsed />)
  expect(screen.getByText("靛蓝")).toBeInTheDocument()
  expect(slot(view.container, "hover-expand")).toHaveAttribute("data-reduced", "true")
})
const reels = [
  { id: "night", type: "image" as const, src: pixel, duration: 4, title: "夜航", alt: "夜航" },
  { id: "light", type: "image" as const, src: pixel, duration: 4, title: "灯塔", alt: "灯塔" },
]

test("短片自动播放时可以暂停", () => {
  const view = render(
    <Reel autoPlay data={reels} defaultIndex={0} defaultMuted>
      <ReelPlayButton />
    </Reel>,
  )
  fireEvent.click(screen.getByRole("button", { name: "暂停" }))
  expect(screen.getByRole("button", { name: "播放" })).toBeInTheDocument()
  expect(slot(view.container, "reel")).toHaveAttribute("data-reduced", "false")
})

test("短片在减弱动效下仍能切换播放", () => {
  reduceMotion = true
  const view = render(
    <Reel autoPlay data={reels} defaultIndex={0} defaultMuted>
      <ReelPlayButton />
    </Reel>,
  )
  fireEvent.click(screen.getByRole("button", { name: "暂停" }))
  expect(screen.getByRole("button", { name: "播放" })).toBeInTheDocument()
  expect(slot(view.container, "reel")).toHaveAttribute("data-reduced", "true")
})
const slides = [{ value: "bridge", title: "桥", description: "夜里的桥只剩下灯。", imageUrl: pixel, imageAlt: "桥" }]

test("进度轮播显示初始幻灯片", () => {
  const view = render(<ProgressiveCarousel defaultActive="bridge" duration={4000} fastDuration={400} slides={slides} />)
  expect(screen.getByText("桥")).toBeInTheDocument()
  expect(slot(view.container, "progressive-carousel")).toHaveAttribute("data-reduced", "false")
})

test("进度轮播在减弱动效下仍显示初始幻灯片", () => {
  reduceMotion = true
  const view = render(<ProgressiveCarousel defaultActive="bridge" duration={4000} fastDuration={400} slides={slides} />)
  expect(screen.getByText("桥")).toBeInTheDocument()
  expect(slot(view.container, "progressive-carousel")).toHaveAttribute("data-reduced", "true")
})
test("悬停画廊显示替代文字", () => {
  const view = render(<HoverGallery alt="画幅" images={[{ alt: "画幅", src: pixel }]} progress />)
  expect(screen.getByRole("img", { name: "画幅" })).toBeInTheDocument()
  expect(slot(view.container, "hover-gallery")).toHaveAttribute("data-reduced", "false")
})

test("悬停画廊在减弱动效下仍显示图片", () => {
  reduceMotion = true
  const view = render(<HoverGallery alt="画幅" images={[{ alt: "画幅", src: pixel }]} progress />)
  expect(screen.getByRole("img", { name: "画幅" })).toBeInTheDocument()
  expect(slot(view.container, "hover-gallery")).toHaveAttribute("data-reduced", "true")
})
test("灯板用文字作为画布名称", () => {
  const view = render(<LightBoard disableDrawing={false} lightSize={8} rows={7} text="HELLO" />)
  expect(view.container.querySelector("canvas")).toHaveAttribute("aria-label", "HELLO")
  expect(slot(view.container, "lightboard")).toHaveAttribute("data-reduced", "false")
})

test("灯板在减弱动效下仍保留画布名称", () => {
  reduceMotion = true
  const view = render(<LightBoard disableDrawing={false} lightSize={8} rows={7} text="HELLO" />)
  expect(view.container.querySelector("canvas")).toHaveAttribute("aria-label", "HELLO")
  expect(slot(view.container, "lightboard")).toHaveAttribute("data-reduced", "true")
})
