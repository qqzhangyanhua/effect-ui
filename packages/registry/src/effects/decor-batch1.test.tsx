// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { useRef } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { Backlight } from "./backlight"
import { BorderTrail } from "./border-trail"
import { DragElements } from "./drag-elements"
import { ElasticLine } from "./elastic-line"
import { EmbossSurface } from "./emboss-surface"
import { FibonacciLines } from "./fibonacci-lines"
import { Float } from "./float"
import { GlowEffect } from "./glow-effect"
import { GooeySvgFilter } from "./gooey-svg-filter"
import { Orb } from "./orb"
import { PixelateSvgFilter } from "./pixelate-svg-filter"
import { Screensaver } from "./screensaver"
import { SplashMask } from "./splash-mask"
import { Squircle } from "./squircle"
import { SvgClipMask } from "./svg-clip-mask"

const orbColors = ["#7c3aed", "#fde68a"]
const morphPaths = [
  "M0.5,0.05 C0.8,0.05 0.95,0.28 0.95,0.5 C0.95,0.78 0.75,0.95 0.5,0.95 C0.22,0.95 0.05,0.72 0.05,0.5 C0.05,0.22 0.25,0.05 0.5,0.05 Z",
  "M0.5,0.02 C0.9,0.12 0.98,0.4 0.9,0.62 C0.8,0.9 0.55,0.98 0.32,0.88 C0.08,0.76 0.02,0.42 0.16,0.22 C0.28,0.04 0.32,-0.02 0.5,0.02 Z",
]

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

function ScreensaverHarness() {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div className="relative h-48 w-full" ref={containerRef}>
      <Screensaver containerRef={containerRef} speed={2} startAngle={35} startPosition={{ x: 8, y: 20 }}>
        <span>北窗</span>
      </Screensaver>
    </div>
  )
}

test("背光托住图片", () => {
  const view = render(
    <Backlight>
      <img alt="辉光示例" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" />
    </Backlight>,
  )
  expect(screen.getByRole("img", { name: "辉光示例" })).toBeInTheDocument()
  expect(slot(view.container, "backlight").querySelector("feGaussianBlur")).toHaveAttribute("stdDeviation", "18")
})

test("背光在减弱动效下仍托住图片", () => {
  reduceMotion = true
  render(
    <Backlight>
      <img alt="辉光示例" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" />
    </Backlight>,
  )
  expect(screen.getByRole("img", { name: "辉光示例" })).toBeInTheDocument()
})

test("巡游边框包住说明", () => {
  const view = render(
    <BorderTrail duration={4} radius={16} size={14}>
      圆点沿着圆角走
    </BorderTrail>,
  )
  const root = slot(view.container, "border-trail")
  expect(screen.getByText("圆点沿着圆角走")).toBeInTheDocument()
  expect(root.querySelector("[style*='offset-path']")).not.toBeNull()
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("巡游边框在减弱动效下改成静止描边", () => {
  reduceMotion = true
  const view = render(
    <BorderTrail duration={4} radius={16} size={14}>
      圆点沿着圆角走
    </BorderTrail>,
  )
  const root = slot(view.container, "border-trail")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root.querySelector("[style*='offset-path']")).toBeNull()
  expect(screen.getByText("圆点沿着圆角走")).toBeInTheDocument()
})

test("辉光铺在背后", () => {
  const view = render(<GlowEffect duration={5} mode="rotate" scale={1} />)
  const root = slot(view.container, "glow-effect")
  expect(root).toHaveAttribute("data-reduced", "false")
  expect(root.getAttribute("style") ?? "").toContain("blur(16px)")
})

test("辉光在减弱动效下停成静态缩放", () => {
  reduceMotion = true
  const view = render(<GlowEffect duration={5} mode="rotate" scale={1} />)
  const root = slot(view.container, "glow-effect")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root.getAttribute("style") ?? "").toContain("blur(16px)")
})

test("斐波那契线框画出线段", () => {
  const view = render(
    <FibonacciLines>
      <p>斐波那契线框</p>
    </FibonacciLines>,
  )
  const root = slot(view.container, "fibonacci-lines")
  expect(screen.getByText("斐波那契线框")).toBeInTheDocument()
  expect(root.querySelectorAll("line")).toHaveLength(11)
  expect(root).not.toHaveAttribute("data-reduced")
})

test("斐波那契线框在减弱动效下一次画完", () => {
  reduceMotion = true
  const view = render(
    <FibonacciLines>
      <p>斐波那契线框</p>
    </FibonacciLines>,
  )
  const root = slot(view.container, "fibonacci-lines")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root.querySelector("line")).toHaveAttribute("stroke-dashoffset", "0")
})

test("浮雕表面读出文字", () => {
  const view = render(
    <EmbossSurface depth={3} interactive lightAngle={135} variant="emboss">
      浮雕表面
    </EmbossSurface>,
  )
  expect(screen.getByText("浮雕表面")).toBeInTheDocument()
  expect(slot(view.container, "emboss-surface")).toHaveAttribute("data-reduced", "false")
})

test("浮雕表面在减弱动效下仍可读", () => {
  reduceMotion = true
  const view = render(
    <EmbossSurface depth={3} interactive lightAngle={135} variant="emboss">
      浮雕表面
    </EmbossSurface>,
  )
  const root = slot(view.container, "emboss-surface")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("浮雕表面")).toBeInTheDocument()
})

test("平滑圆角包住内容", () => {
  const view = render(
    <Squircle border radius={36} smoothing={0.8}>
      平滑圆角
    </Squircle>,
  )
  expect(screen.getByText("平滑圆角")).toBeInTheDocument()
  expect(slot(view.container, "squircle")).toHaveStyle({ borderRadius: "36px" })
})

test("平滑圆角在减弱动效下仍包住内容", () => {
  reduceMotion = true
  const view = render(
    <Squircle border radius={36} smoothing={0.8}>
      平滑圆角
    </Squircle>,
  )
  expect(slot(view.container, "squircle")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("平滑圆角")).toBeInTheDocument()
})

test("裁切遮罩挂上形状", () => {
  const view = render(
    <SvgClipMask animate="morph" duration={4} morphPaths={morphPaths} shape="blob">
      <div>色块</div>
    </SvgClipMask>,
  )
  const root = slot(view.container, "svg-clip-mask")
  expect(screen.getByText("色块")).toBeInTheDocument()
  expect(root.querySelector("clipPath")).not.toBeNull()
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("裁切遮罩在减弱动效下仍显示内容", () => {
  reduceMotion = true
  const view = render(
    <SvgClipMask animate="morph" duration={4} morphPaths={morphPaths} shape="blob">
      <div>色块</div>
    </SvgClipMask>,
  )
  expect(slot(view.container, "svg-clip-mask")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("色块")).toBeInTheDocument()
})

test("球体按预览边长占位", () => {
  const view = render(<Orb colors={orbColors} duration={7} size={220} />)
  const root = slot(view.container, "orb")
  expect(root).toHaveStyle({ width: "220px", height: "220px" })
  expect(root.querySelector("canvas, .rounded-full")).not.toBeNull()
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("球体在减弱动效下保持边长", () => {
  reduceMotion = true
  const view = render(<Orb colors={orbColors} duration={7} size={220} />)
  const root = slot(view.container, "orb")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).toHaveStyle({ width: "220px", height: "220px" })
})

test("水花遮罩裁住内容", () => {
  const view = render(
    <SplashMask>
      <div>水花</div>
    </SplashMask>,
  )
  const root = slot(view.container, "splash-mask")
  expect(screen.getByText("水花")).toBeInTheDocument()
  expect(root.querySelector("clipPath")).not.toBeNull()
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("水花遮罩在减弱动效下仍裁住内容", () => {
  reduceMotion = true
  const view = render(
    <SplashMask>
      <div>水花</div>
    </SplashMask>,
  )
  expect(slot(view.container, "splash-mask")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("水花")).toBeInTheDocument()
})

test("屏保读出漂浮文字", () => {
  render(<ScreensaverHarness />)
  expect(screen.getByText("北窗")).toBeInTheDocument()
  expect(document.querySelector("[data-slot=screensaver]")).toHaveAttribute("data-reduced", "false")
})

test("屏保在减弱动效下停在文字上", () => {
  reduceMotion = true
  render(<ScreensaverHarness />)
  expect(document.querySelector("[data-slot=screensaver]")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("北窗")).toBeInTheDocument()
})

test("弹性线用预览线宽", () => {
  const view = render(<ElasticLine grabThreshold={28} releaseThreshold={90} strokeWidth={2} />)
  const root = slot(view.container, "elastic-line")
  expect(root.querySelector("path")).toHaveAttribute("stroke-width", "2")
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("弹性线在减弱动效下直接画完", () => {
  reduceMotion = true
  const view = render(<ElasticLine grabThreshold={28} releaseThreshold={90} strokeWidth={2} />)
  const root = slot(view.container, "elastic-line")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root.querySelector("path")).toHaveAttribute("stroke-width", "2")
})

test("可拖元素摆出三块", () => {
  const view = render(
    <DragElements dragMomentum dragPropagation selectedOnTop>
      <span>夜航</span>
      <span>航线</span>
      <span>北窗</span>
    </DragElements>,
  )
  const root = slot(view.container, "drag-elements")
  expect(screen.getByText("夜航")).toBeInTheDocument()
  expect(screen.getByText("航线")).toBeInTheDocument()
  expect(screen.getByText("北窗")).toBeInTheDocument()
  expect(root).toHaveAttribute("data-momentum", "true")
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("可拖元素在减弱动效下关掉惯性", () => {
  reduceMotion = true
  const view = render(
    <DragElements dragMomentum dragPropagation selectedOnTop>
      <span>夜航</span>
      <span>航线</span>
      <span>北窗</span>
    </DragElements>,
  )
  const root = slot(view.container, "drag-elements")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).toHaveAttribute("data-momentum", "false")
})

test("像素滤镜按初始颗粒生成", () => {
  const view = render(<PixelateSvgFilter id="pixelate-demo" size={6} />)
  const root = slot(view.container, "pixelate-svg-filter")
  expect(root.querySelector("filter")).toHaveAttribute("id", "pixelate-demo")
  expect(root.querySelector("feComposite")).toHaveAttribute("width", "6")
})

test("像素滤镜在减弱动效下保持颗粒", () => {
  reduceMotion = true
  const view = render(<PixelateSvgFilter id="pixelate-demo" size={6} />)
  expect(slot(view.container, "pixelate-svg-filter").querySelector("feComposite")).toHaveAttribute("width", "6")
})

test("粘连滤镜使用预览强度", () => {
  const view = render(<GooeySvgFilter id="gooey-demo" strength={14} />)
  const root = slot(view.container, "gooey-svg-filter")
  expect(root.querySelector("filter")).toHaveAttribute("id", "gooey-demo")
  expect(root.querySelector("feGaussianBlur")).toHaveAttribute("stdDeviation", "14")
})

test("粘连滤镜在减弱动效下保持强度", () => {
  reduceMotion = true
  const view = render(<GooeySvgFilter id="gooey-demo" strength={14} />)
  expect(slot(view.container, "gooey-svg-filter").querySelector("feGaussianBlur")).toHaveAttribute("stdDeviation", "14")
})

test("漂浮读出卡片文字", () => {
  const view = render(
    <Float amplitude={[8, 18, 12]} rotationRange={[8, 10, 4]} speed={0.4} timeOffset={0}>
      漂浮
    </Float>,
  )
  expect(screen.getByText("漂浮")).toBeInTheDocument()
  expect(slot(view.container, "float")).toHaveAttribute("data-reduced", "false")
})

test("漂浮在减弱动效下停在原位", () => {
  reduceMotion = true
  const view = render(
    <Float amplitude={[8, 18, 12]} rotationRange={[8, 10, 4]} speed={0.4} timeOffset={0}>
      漂浮
    </Float>,
  )
  const root = slot(view.container, "float")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).toHaveAttribute("data-motion", "off")
})
