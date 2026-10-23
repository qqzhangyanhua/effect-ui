// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react")
  const progress = actual.motionValue(0)
  return {
    ...actual,
    useScroll: () => ({
      scrollX: progress,
      scrollY: progress,
      scrollXProgress: progress,
      scrollYProgress: progress,
    }),
  }
})

import { ArcadePixel } from "./arcade-pixel"
import { ComicText } from "./comic-text"
import { CradleText } from "./cradle-text"
import { DepthParallaxWords } from "./depth-parallax-words"
import { DiaTextReveal } from "./dia-text-reveal"
import { HyperspaceText } from "./hyperspace-text"
import { LineShadowText } from "./line-shadow-text"
import { MediaBetweenText } from "./media-between-text"
import { PerspectiveText3D } from "./perspective-text-3d"
import { PluckedText } from "./plucked-text"
import { RansomNote } from "./ransom-note"
import { SwooshText } from "./swoosh-text"
import { TextExplode } from "./text-explode"
import { TextShimmerWave } from "./text-shimmer-wave"
import { VideoText } from "./video-text"

let reduceMotion = false

const videoSrc = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
const poster = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
const swatch = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"

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
  HTMLMediaElement.prototype.play = () => Promise.resolve()
  HTMLMediaElement.prototype.pause = () => {}
  vi.stubGlobal("matchMedia", media)
  vi.stubGlobal("requestAnimationFrame", () => 1)
  vi.stubGlobal("cancelAnimationFrame", () => {})
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

test("超空间文字显示第一句，点下一段换句", () => {
  const view = render(<HyperspaceText />)
  expect(screen.getByText("把句子拆成光")).toBeInTheDocument()
  expect(view.container.querySelector("canvas")).not.toBeNull()
  fireEvent.click(screen.getByRole("button", { name: "下一段" }))
  expect(screen.getByText("再把它拼回来")).toBeInTheDocument()
})

test("超空间文字在减弱动效下直接显示句子", () => {
  reduceMotion = true
  const view = render(<HyperspaceText />)
  expect(screen.getAllByText("把句子拆成光").length).toBeGreaterThan(0)
  expect(view.container.querySelector("canvas")).toBeNull()
})

test("斜向揭示显示全文", () => {
  const view = render(<DiaTextReveal text="斜向扫过这段文字" />)
  expect(slot(view.container, "dia-text-reveal").textContent).toContain("斜向扫过这段文字")
})

test("斜向揭示在减弱动效下仍显示全文", () => {
  reduceMotion = true
  const view = render(<DiaTextReveal text="斜向扫过这段文字" />)
  expect(slot(view.container, "dia-text-reveal").textContent).toContain("斜向扫过这段文字")
})

test("视频文字播放遮罩视频", () => {
  const view = render(
    <VideoText fontSize={18} fontWeight={700} poster={poster} src={videoSrc}>
      北窗
    </VideoText>,
  )
  expect(slot(view.container, "video-text").querySelector("video")).toHaveAttribute("src", videoSrc)
})

test("视频文字在减弱动效下改显示封面", () => {
  reduceMotion = true
  const view = render(
    <VideoText fontSize={18} fontWeight={700} poster={poster} src={videoSrc}>
      北窗
    </VideoText>,
  )
  expect(slot(view.container, "video-text").querySelector("video")).toBeNull()
  expect(slot(view.container, "video-text").querySelector("img")).toHaveAttribute("src", poster)
})

test("斜纹阴影显示正文", () => {
  const view = render(<LineShadowText>斜纹阴影</LineShadowText>)
  expect(screen.getByText("斜纹阴影")).toBeInTheDocument()
  expect(slot(view.container, "line-shadow-text")).toHaveAttribute("data-reduced", "false")
})

test("斜纹阴影在减弱动效下仍显示正文", () => {
  reduceMotion = true
  const view = render(<LineShadowText>斜纹阴影</LineShadowText>)
  expect(screen.getByText("斜纹阴影")).toBeInTheDocument()
  expect(slot(view.container, "line-shadow-text")).toHaveAttribute("data-reduced", "true")
})

test("漫画字显示正文", () => {
  const view = render(<ComicText>北窗</ComicText>)
  expect(screen.getAllByText("北窗").length).toBeGreaterThan(0)
  expect(slot(view.container, "comic-text")).toHaveAttribute("data-reduced", "false")
})

test("漫画字在减弱动效下仍显示正文", () => {
  reduceMotion = true
  const view = render(<ComicText>北窗</ComicText>)
  expect(screen.getAllByText("北窗").length).toBeGreaterThan(0)
  expect(slot(view.container, "comic-text")).toHaveAttribute("data-reduced", "true")
})

test("波动闪光显示文字", () => {
  const view = render(
    <TextShimmerWave duration={1.4} yDistance={-6}>
      波动闪光
    </TextShimmerWave>,
  )
  expect(slot(view.container, "text-shimmer-wave").textContent).toContain("波动闪光")
  expect(slot(view.container, "text-shimmer-wave")).toHaveAttribute("data-reduced", "false")
})

test("波动闪光在减弱动效下仍显示文字", () => {
  reduceMotion = true
  const view = render(
    <TextShimmerWave duration={1.4} yDistance={-6}>
      波动闪光
    </TextShimmerWave>,
  )
  expect(slot(view.container, "text-shimmer-wave").textContent).toContain("波动闪光")
  expect(slot(view.container, "text-shimmer-wave")).toHaveAttribute("data-reduced", "true")
})

test("炸开文字暴露整句名称", () => {
  const view = render(<TextExplode>收到一条消息</TextExplode>)
  expect(slot(view.container, "text-explode")).toHaveAttribute("aria-label", "收到一条消息")
  expect(slot(view.container, "text-explode")).not.toHaveAttribute("data-reduced")
})

test("炸开文字在减弱动效下仍暴露整句名称", () => {
  reduceMotion = true
  const view = render(<TextExplode>收到一条消息</TextExplode>)
  expect(slot(view.container, "text-explode")).toHaveAttribute("aria-label", "收到一条消息")
  expect(slot(view.container, "text-explode")).toHaveAttribute("data-reduced", "true")
})

test("摇篮文字显示横杆上的字", () => {
  const view = render(<CradleText bounce={0.97} intro text="摇篮" />)
  expect(screen.getByText("摇篮")).toBeInTheDocument()
  expect(slot(view.container, "cradle-text")).toHaveAttribute("data-reduced", "false")
})

test("摇篮文字在减弱动效下仍显示字", () => {
  reduceMotion = true
  const view = render(<CradleText bounce={0.97} intro text="摇篮" />)
  expect(screen.getByText("摇篮")).toBeInTheDocument()
  expect(slot(view.container, "cradle-text")).toHaveAttribute("data-reduced", "true")
})

test("拨弦文字显示弦上的字", () => {
  const view = render(<PluckedText strum tension={1} text="拨弦" />)
  expect(screen.getByText("拨弦")).toBeInTheDocument()
  expect(slot(view.container, "plucked-text")).toHaveAttribute("data-reduced", "false")
})

test("拨弦文字在减弱动效下仍显示字", () => {
  reduceMotion = true
  const view = render(<PluckedText strum tension={1} text="拨弦" />)
  expect(screen.getByText("拨弦")).toBeInTheDocument()
  expect(slot(view.container, "plucked-text")).toHaveAttribute("data-reduced", "true")
})

test("挤出文字显示文案", () => {
  const view = render(<SwooshText as="div" depth={12} text="挤出" />)
  expect(screen.getByText("挤出")).toBeInTheDocument()
  expect(slot(view.container, "swoosh-text")).toHaveAttribute("data-reduced", "false")
})

test("挤出文字在减弱动效下仍显示文案", () => {
  reduceMotion = true
  const view = render(<SwooshText as="div" depth={12} text="挤出" />)
  expect(screen.getByText("挤出")).toBeInTheDocument()
  expect(slot(view.container, "swoosh-text")).toHaveAttribute("data-reduced", "true")
})

test("拼贴文字读出整句", () => {
  const view = render(<RansomNote animate="assemble" intensity={0.6} text="北窗夜航" />)
  expect(screen.getByText("北窗夜航")).toBeInTheDocument()
  expect(slot(view.container, "ransom-note")).toHaveAttribute("data-reduced", "false")
})

test("拼贴文字在减弱动效下仍读出整句", () => {
  reduceMotion = true
  const view = render(<RansomNote animate="assemble" intensity={0.6} text="北窗夜航" />)
  expect(screen.getByText("北窗夜航")).toBeInTheDocument()
  expect(slot(view.container, "ransom-note")).toHaveAttribute("data-reduced", "true")
})

test("点阵文字读出文案", () => {
  const view = render(<ArcadePixel animate="type" crt glow pixelSize={8} scanlines speed={1} text="NORTH" />)
  expect(screen.getByText("NORTH")).toBeInTheDocument()
  expect(slot(view.container, "arcade-pixel")).toHaveAttribute("data-reduced", "false")
})

test("点阵文字在减弱动效下仍读出文案", () => {
  reduceMotion = true
  const view = render(<ArcadePixel animate="type" crt glow pixelSize={8} scanlines speed={1} text="NORTH" />)
  expect(screen.getByText("NORTH")).toBeInTheDocument()
  expect(slot(view.container, "arcade-pixel")).toHaveAttribute("data-reduced", "true")
})

test("透视文字显示文案", () => {
  const view = render(<PerspectiveText3D depth={48} driver="pointer" text="北窗夜航" />)
  expect(screen.getAllByText("北窗夜航").length).toBeGreaterThan(0)
  expect(slot(view.container, "perspective-text-3d")).toHaveAttribute("data-reduced", "false")
})

test("透视文字在减弱动效下改成普通段落", () => {
  reduceMotion = true
  const view = render(<PerspectiveText3D depth={48} driver="pointer" text="北窗夜航" />)
  expect(screen.getByText("北窗夜航")).toBeInTheDocument()
  expect(slot(view.container, "perspective-text-3d").tagName).toBe("P")
  expect(slot(view.container, "perspective-text-3d")).toHaveAttribute("data-reduced", "true")
})

test("景深词组显示句子", () => {
  const view = render(
    <DepthParallaxWords delay={0} stagger={80} triggerOnView={false}>
      雾散以后还能看见港口
    </DepthParallaxWords>,
  )
  expect(slot(view.container, "depth-parallax-words")).toHaveAttribute("aria-label", "雾散以后还能看见港口")
  expect(slot(view.container, "depth-parallax-words")).toHaveAttribute("data-reduced", "false")
})

test("景深词组在减弱动效下仍显示句子", () => {
  reduceMotion = true
  const view = render(
    <DepthParallaxWords delay={0} stagger={80} triggerOnView={false}>
      雾散以后还能看见港口
    </DepthParallaxWords>,
  )
  expect(slot(view.container, "depth-parallax-words")).toHaveAttribute("aria-label", "雾散以后还能看见港口")
  expect(slot(view.container, "depth-parallax-words")).toHaveAttribute("data-reduced", "true")
})

test("夹在文字中间的图片显示两侧文字", () => {
  const view = render(
    <MediaBetweenText alt="靛蓝色块" firstText="北" mediaType="image" mediaUrl={swatch} secondText="窗" />,
  )
  expect(screen.getByText("北")).toBeInTheDocument()
  expect(screen.getByText("窗")).toBeInTheDocument()
  expect(screen.getByRole("img", { name: "靛蓝色块" })).toBeInTheDocument()
  expect(slot(view.container, "media-between-text")).toHaveAttribute("data-reduced", "false")
})

test("夹在文字中间的图片在减弱动效下仍显示两侧文字", () => {
  reduceMotion = true
  const view = render(
    <MediaBetweenText alt="靛蓝色块" firstText="北" mediaType="image" mediaUrl={swatch} secondText="窗" />,
  )
  expect(screen.getByText("北")).toBeInTheDocument()
  expect(screen.getByText("窗")).toBeInTheDocument()
  expect(slot(view.container, "media-between-text")).toHaveAttribute("data-reduced", "true")
})
