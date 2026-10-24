// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { HeroVideoDialog } from "./hero-video-dialog"
import { InfiniteCanvasGallery } from "./infinite-canvas-gallery"
import { LoomThreadsMarquee } from "./loom-threads-marquee"
import { OrbitingItems3D } from "./orbiting-items-3d"

import { PixelImage } from "./pixel-image"

import { ShapeHero } from "./shape-hero"
import { SortableList } from "./sortable-list"





const flower = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
const pixel =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#111"/></svg>')

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
  Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } })
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

test("轨道条目显示默认标签", () => {
  render(<OrbitingItems3D />)
  expect(screen.getByText("UI")).toBeInTheDocument()
})

test("轨道条目在减弱动效下仍显示标签", () => {
  reduceMotion = true
  render(<OrbitingItems3D />)
  expect(screen.getByText("UI")).toBeInTheDocument()
})

test("无限画布显示第一块", () => {
  render(<InfiniteCanvasGallery />)
  expect(screen.getAllByText("01").length).toBeGreaterThan(0)
})

test("无限画布在减弱动效下仍显示第一块", () => {
  reduceMotion = true
  render(<InfiniteCanvasGallery />)
  expect(screen.getAllByText("01").length).toBeGreaterThan(0)
})
test("可排序列表显示第一项", () => {
  render(<SortableList />)
  expect(screen.getByText("起草说明")).toBeInTheDocument()
})

test("可排序列表在减弱动效下仍显示第一项", () => {
  reduceMotion = true
  render(<SortableList />)
  expect(screen.getByText("起草说明")).toBeInTheDocument()
})
test("织机按钮可以拆成丝线", () => {
  render(<LoomThreadsMarquee />)
  fireEvent.click(screen.getByRole("button", { name: "拆成丝线" }))
  expect(screen.getByRole("button", { name: "织回画面" })).toHaveAttribute("aria-pressed", "true")
})

test("织机在减弱动效下不挂画布", () => {
  reduceMotion = true
  const view = render(<LoomThreadsMarquee />)
  fireEvent.click(screen.getByRole("button", { name: "拆成丝线" }))
  expect(screen.getByRole("button", { name: "织回画面" })).toBeInTheDocument()
  expect(view.container.querySelector("canvas")).toBeNull()
})
test("封面视频可以打开播放器", async () => {
  const view = render(<HeroVideoDialog thumbnailAlt="花" thumbnailSrc={pixel} videoSrc={flower} />)
  expect(screen.getByRole("img", { name: "花" })).toBeInTheDocument()
  expect(slot(view.container, "hero-video-dialog")).not.toHaveAttribute("data-reduced")
  fireEvent.click(screen.getByRole("button", { name: "播放视频" }))
  expect(await screen.findByTitle("视频播放器")).toBeInTheDocument()
})

test("封面视频在减弱动效下仍能打开", async () => {
  reduceMotion = true
  const view = render(<HeroVideoDialog thumbnailAlt="花" thumbnailSrc={pixel} videoSrc={flower} />)
  expect(slot(view.container, "hero-video-dialog")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "播放视频" }))
  expect(await screen.findByTitle("视频播放器")).toBeInTheDocument()
})

test("像素图按网格切块", () => {
  const view = render(<PixelImage cols={6} duration={0.8} rows={4} src={pixel} />)
  expect(view.container.querySelectorAll("img")).toHaveLength(24)
  expect(slot(view.container, "pixel-image")).toHaveAttribute("data-reduced", "false")
})

test("像素图在减弱动效下直接显示整张", () => {
  reduceMotion = true
  const view = render(<PixelImage cols={6} duration={0.8} rows={4} src={pixel} />)
  expect(view.container.querySelectorAll("img")).toHaveLength(1)
  expect(slot(view.container, "pixel-image")).toHaveAttribute("data-reduced", "true")
})

test("形状标题显示传入的标题", () => {
  const view = render(<ShapeHero description="抓住形状，扔出去。" title="有一点重力" />)
  expect(screen.getByRole("heading", { name: "有一点重力" })).toBeInTheDocument()
  expect(slot(view.container, "shape-hero")).toHaveAttribute("data-reduced", "false")
})

test("形状标题在减弱动效下仍显示标题", () => {
  reduceMotion = true
  const view = render(<ShapeHero description="抓住形状，扔出去。" title="有一点重力" />)
  expect(screen.getByRole("heading", { name: "有一点重力" })).toBeInTheDocument()
  expect(slot(view.container, "shape-hero")).toHaveAttribute("data-reduced", "true")
})
