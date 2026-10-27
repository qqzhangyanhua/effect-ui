// @vitest-environment jsdom

import type { ReactElement } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

vi.mock("@paper-design/shaders-react", () => ({
  LiquidMetal: ({ speed }: { speed?: number }) => <div data-shader="liquid" data-speed={speed ?? "preset"} />,
  FlutedGlass: () => null,
  GodRays: () => null,
  PulsingBorder: () => null,
  SmokeRing: () => null,
  Swirl: () => null,
  Voronoi: () => null,
  Water: () => null,
}))

vi.mock("ogl", () => ({
  Renderer: class {
    gl = null
  },
}))

import { BeamsCollision } from "./beams-collision"
import { DitherGradient } from "./dither-gradient"
import { Hyperspeed } from "./hyperspeed"
import { Iridescence } from "./iridescence"
import { LetterGlitchWall } from "./letter-glitch-wall"
import { LightRays } from "./light-rays"
import { Lightning } from "./lightning"
import { SeaWavesBackground } from "./sea-waves-background"
import { Silk } from "./silk"
import { VortexBackground } from "./vortex-background"

let reduceMotion = false
const frames: FrameRequestCallback[] = []
const originalGetContext = HTMLCanvasElement.prototype.getContext

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
  frames.length = 0
  vi.stubGlobal("matchMedia", media)
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback)
    return frames.length
  })
  vi.stubGlobal("cancelAnimationFrame", () => {})
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private readonly callback: IntersectionObserverCallback) {}
      observe(target: Element) {
        this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" })
})

afterEach(() => {
  cleanup()
  HTMLCanvasElement.prototype.getContext = originalGetContext
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function slot(name: string) {
  const node = document.querySelector(`[data-slot='${name}']`)
  if (!node) throw new Error(`找不到 ${name}`)
  return node
}


test("故障字墙按行列铺字符", () => {
  const { container } = render(<LetterGlitchWall rows={2} cols={4} color="#f8fafc" />)
  const cells = container.querySelectorAll("span")
  expect(cells).toHaveLength(8)
  expect(cells[0]).toHaveStyle({ color: "#f8fafc" })
})

test("故障字墙在减弱动效时不再改字", () => {
  reduceMotion = true
  const intervals = vi.spyOn(window, "setInterval")
  render(<LetterGlitchWall rows={2} cols={4} />)
  expect(intervals).not.toHaveBeenCalled()
})

test("闪电在没有 WebGL 时铺出静帧光带", () => {
  const { container } = render(<Lightning />)
  expect(container.querySelector("div")?.className).toContain("min-h-52")
})

test("闪电在减弱动效时用静帧光带，不挂画布", () => {
  reduceMotion = true
  const { container } = render(<Lightning />)
  expect(container.querySelector("canvas")).toBeNull()
  expect(container.innerHTML).toContain("linear-gradient")
})

test("虹彩在没有 WebGL 时仍占住一块背景", () => {
  const { container } = render(<Iridescence />)
  expect(container.firstElementChild?.className).toContain("min-h-52")
})

test("虹彩在减弱动效时用锥形渐变，不挂画布", () => {
  reduceMotion = true
  const { container } = render(<Iridescence />)
  expect(container.querySelector("canvas")).toBeNull()
  expect(container.innerHTML).toContain("conic-gradient")
})

test("丝绸在没有 WebGL 时仍占住一块背景", () => {
  const { container } = render(<Silk />)
  expect(container.firstElementChild?.className).toContain("min-h-52")
})

test("丝绸在减弱动效时用静帧渐变，不挂画布", () => {
  reduceMotion = true
  const { container } = render(<Silk />)
  expect(container.querySelector("canvas")).toBeNull()
  expect(container.innerHTML).toContain("linear-gradient")
})

test("抖动渐变在没有 WebGL 时显示静帧", () => {
  const { container } = render(<DitherGradient />)
  expect(container.firstElementChild?.getAttribute("style") ?? "").toContain("rgb(46, 16, 101)")
})

test("抖动渐变在减弱动效时停在静帧，不再申请动画帧", () => {
  reduceMotion = true
  render(<DitherGradient />)
  expect(frames).toEqual([])
})

test("体积光默认跟随指针", () => {
  render(<LightRays />)
  expect(screen.getByText("体积光锥 · 跟随指针")).toBeInTheDocument()
})

test("体积光在减弱动效时改用静帧光锥", () => {
  reduceMotion = true
  const { container } = render(<LightRays followMouse={false} />)
  expect(screen.getByText("体积光锥 · 自行摆动")).toBeInTheDocument()
  expect(container.querySelector("canvas")).toBeNull()
  expect(container.innerHTML).toContain("conic-gradient")
  expect(frames).toEqual([])
})

test("超速公路显示当前倍率", () => {
  render(<Hyperspeed />)
  expect(screen.getByText("按住加速 ·")).toBeInTheDocument()
  expect(screen.getByText("1.0")).toBeInTheDocument()
})

test("超速公路在减弱动效时停住光带", () => {
  reduceMotion = true
  const { container } = render(<Hyperspeed />)
  const streaks = container.querySelectorAll(".origin-bottom")
  expect(streaks).toHaveLength(16)
  expect(streaks[0]?.getAttribute("style") ?? "").not.toContain("hyper-streak")
  expect(frames).toEqual([])
})


test("旋涡在视口内挂上画布", () => {
  render(<VortexBackground count={12} />)
  expect(slot("vortex-background").querySelector("canvas")).toBeInTheDocument()
})

test("旋涡在减弱动效时改用静止回退，不再旋转", () => {
  reduceMotion = true
  const root = slotAfter(<VortexBackground />)
  expect(root.querySelector("canvas")).toBeNull()
  const wash = root.querySelector(".absolute.inset-0.opacity-80")
  expect(wash).toBeTruthy()
  expect(wash?.getAttribute("class") ?? "").not.toContain("animate-")
})

function slotAfter(node: ReactElement) {
  render(node)
  return slot("vortex-background")
}

test("光束条数跟 count", () => {
  render(<BeamsCollision count={4} />)
  expect(slot("beams-collision").querySelectorAll(".effect-ui-beam")).toHaveLength(4)
})

test("光束在减弱动效时停在各自高度，不再下落", () => {
  reduceMotion = true
  render(<BeamsCollision count={3} />)
  const beam = slot("beams-collision").querySelector(".effect-ui-beam")
  expect(beam).toHaveStyle({ top: "18%" })
  expect(beam?.getAttribute("style") ?? "").not.toContain("effect-ui-beam-fall")
})

test("海浪用滑块切换海况", () => {
  render(<SeaWavesBackground />)
  expect(screen.getByText("平静")).toBeInTheDocument()
  fireEvent.change(screen.getByRole("slider"), { target: { value: "0.9" } })
  expect(screen.getByText("风暴")).toBeInTheDocument()
})

test("海浪在减弱动效时改用静帧海面", () => {
  reduceMotion = true
  const { container } = render(<SeaWavesBackground />)
  expect(container.querySelector("canvas")).toBeNull()
  expect(container.innerHTML).toContain("rgb(219, 234, 254)")
  expect(frames).toEqual([])
})
