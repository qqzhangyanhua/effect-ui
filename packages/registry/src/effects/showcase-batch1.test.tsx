// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { DitherChart } from "./dither-chart"
import { DualWaveTextList } from "./dual-wave-text-list"
import { HeroVideoDialog } from "./hero-video-dialog"
import { InfiniteCanvasGallery } from "./infinite-canvas-gallery"
import { LoomThreadsMarquee } from "./loom-threads-marquee"
import { OrbitingItems3D } from "./orbiting-items-3d"
import { OrbitalImageWheel } from "./orbital-image-wheel"
import { PixelImage } from "./pixel-image"
import { SdfBlobTransition } from "./sdf-blob-transition"
import { ShapeHero } from "./shape-hero"
import { SortableList } from "./sortable-list"
import { SpendingRing } from "./spending-ring"
import { VideoAmbient } from "./video-ambient"
import { XrayFluidReveal } from "./xray-fluid-reveal"
import { HoverImageList } from "../ui/hover-image-list"

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

test("悬停图列显示第一行", () => {
  render(<HoverImageList />)
  expect(screen.getByText("北岸灯塔")).toBeInTheDocument()
})

test("悬停图列在减弱动效下仍显示第一行", () => {
  reduceMotion = true
  render(<HoverImageList />)
  expect(screen.getByText("北岸灯塔")).toBeInTheDocument()
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

test("双波列表可以选中一行", () => {
  render(<DualWaveTextList />)
  const orbit = screen.getAllByRole("button", { name: /轨道/ })[0]!
  fireEvent.click(orbit)
  expect(orbit).toHaveAttribute("aria-current", "true")
})

test("双波列表在减弱动效下仍能选中", () => {
  reduceMotion = true
  render(<DualWaveTextList />)
  const orbit = screen.getAllByRole("button", { name: /轨道/ })[0]!
  fireEvent.click(orbit)
  expect(orbit).toHaveAttribute("aria-current", "true")
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

test("透视揭示在普通动效下提示拖动", () => {
  render(<XrayFluidReveal />)
  expect(screen.getByText("按住并移动指针，轨迹会留下柔边的透视。")).toBeInTheDocument()
})

test("透视揭示在减弱动效下改成点击", () => {
  reduceMotion = true
  render(<XrayFluidReveal />)
  expect(screen.getByText("点击切换外表和内部。")).toBeInTheDocument()
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

test("支出环显示预览标题", () => {
  const view = render(<SpendingRing currency="CNY" title="十月支出" />)
  expect(screen.getByText("十月支出")).toBeInTheDocument()
  expect(slot(view.container, "spending-ring")).toHaveAttribute("data-reduced", "false")
})

test("支出环在减弱动效下仍显示标题", () => {
  reduceMotion = true
  const view = render(<SpendingRing currency="CNY" title="十月支出" />)
  expect(screen.getByText("十月支出")).toBeInTheDocument()
  expect(slot(view.container, "spending-ring")).toHaveAttribute("data-reduced", "true")
})

test("流体转场显示当前一幕", () => {
  const view = render(
    <SdfBlobTransition transitionKey={0} variant="circle">
      圆
    </SdfBlobTransition>,
  )
  expect(screen.getByText("圆")).toBeInTheDocument()
  expect(slot(view.container, "sdf-blob-transition")).toHaveAttribute("data-reduced", "false")
})

test("流体转场在减弱动效下仍显示当前一幕", () => {
  reduceMotion = true
  const view = render(
    <SdfBlobTransition transitionKey={0} variant="circle">
      圆
    </SdfBlobTransition>,
  )
  expect(screen.getByText("圆")).toBeInTheDocument()
  expect(slot(view.container, "sdf-blob-transition")).toHaveAttribute("data-reduced", "true")
})

test("环境光视频标记为不自动播放", () => {
  const view = render(<VideoAmbient alt="城市夜色" autoPlay={false} blur={34} controls poster={pixel} rounded={20} scale={1.3} src={pixel} />)
  expect(view.container.querySelector("video")).toHaveAttribute("poster", pixel)
  expect(slot(view.container, "video-ambient")).toHaveAttribute("data-reduced", "false")
})

test("环境光视频在减弱动效下仍保留封面", () => {
  reduceMotion = true
  const view = render(<VideoAmbient alt="城市夜色" autoPlay={false} blur={34} controls poster={pixel} rounded={20} scale={1.3} src={pixel} />)
  expect(view.container.querySelector("video")).toHaveAttribute("poster", pixel)
  expect(slot(view.container, "video-ambient")).toHaveAttribute("data-reduced", "true")
})

test("轨道轮播显示第一张图", () => {
  const view = render(
    <OrbitalImageWheel
      autoRotate
      items={[{ alt: "靛蓝", id: "a", image: pixel }]}
      radius={92}
      snap
    />,
  )
  expect(screen.getByRole("img", { name: "靛蓝" })).toBeInTheDocument()
  expect(slot(view.container, "orbital-image-wheel")).toHaveAttribute("data-reduced", "false")
})

test("轨道轮播在减弱动效下仍显示图片", () => {
  reduceMotion = true
  const view = render(
    <OrbitalImageWheel
      autoRotate
      items={[{ alt: "靛蓝", id: "a", image: pixel }]}
      radius={92}
      snap
    />,
  )
  expect(screen.getByRole("img", { name: "靛蓝" })).toBeInTheDocument()
  expect(slot(view.container, "orbital-image-wheel")).toHaveAttribute("data-reduced", "true")
})

test("抖动图显示说明", () => {
  const view = render(
    <DitherChart
      caption="夜间流量"
      data={[{ name: "夜航", points: [{ label: "一", value: 2 }] }]}
      pixelSize={3}
      variant="bar"
    />,
  )
  expect(screen.getByText("夜间流量")).toBeInTheDocument()
  expect(slot(view.container, "dither-chart")).toHaveAttribute("data-reduced", "false")
})

test("抖动图在减弱动效下仍显示说明", () => {
  reduceMotion = true
  const view = render(
    <DitherChart
      caption="夜间流量"
      data={[{ name: "夜航", points: [{ label: "一", value: 2 }] }]}
      pixelSize={3}
      variant="bar"
    />,
  )
  expect(screen.getByText("夜间流量")).toBeInTheDocument()
  expect(slot(view.container, "dither-chart")).toHaveAttribute("data-reduced", "true")
})
