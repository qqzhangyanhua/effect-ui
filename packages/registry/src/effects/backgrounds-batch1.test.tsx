// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

vi.mock("@paper-design/shaders-react", () => ({
  MeshGradient: ({ speed }: { speed?: number }) => <div data-shader="mesh" data-speed={speed ?? "preset"} />,
  GrainGradient: () => null,
  Dithering: () => null,
  Metaballs: () => null,
  Warp: () => null,
}))

import { AnimatedGrid } from "./animated-grid"
import { AuroraBackground } from "./aurora-background"
import { BackgroundPaths } from "./background-paths"
import { DotPattern } from "./dot-pattern"
import { FlickeringGrid } from "./flickering-grid"
import { GridPattern } from "./grid-pattern"
import { LightBeams } from "./light-beams"
import { Meteors } from "./meteors"
import { NoiseGradient } from "./noise-gradient"
import { Particles } from "./particles"
import { RetroGrid } from "./retro-grid"
import { Ripples } from "./ripples"
import { ShaderBackground } from "./shader-backgrounds"
import { Starfield } from "./starfield"
import { WaveBackground } from "./wave-background"

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
})

function slot(name: string) {
  const node = document.querySelector(`[data-slot='${name}']`)
  if (!node) throw new Error(`找不到 ${name}`)
  return node
}

function classes(node: Element | null | undefined) {
  return node?.getAttribute("class") ?? ""
}

test("粒子画布按数量挂上，不传颜色时用 currentColor", () => {
  render(<Particles quantity={12} />)
  expect(slot("particles").tagName).toBe("CANVAS")
})

test("网格图案用传入的单元格尺寸", () => {
  render(<GridPattern width={24} height={18} />)
  const pattern = slot("grid-pattern").querySelector("pattern")
  expect(pattern).toHaveAttribute("width", "24")
  expect(pattern).toHaveAttribute("height", "18")
})

test("网格图案没有动画，减弱动效也不申请动画帧", () => {
  reduceMotion = true
  render(<GridPattern />)
  expect(slot("grid-pattern").className).not.toContain("animate-")
  expect(frames).toEqual([])
})

test("点阵用传入的半径", () => {
  render(<DotPattern cr={3} />)
  expect(slot("dot-pattern").querySelector("circle")).toHaveAttribute("r", "3")
})

test("点阵跟随前景色，减弱动效时保持静止", () => {
  reduceMotion = true
  render(<DotPattern />)
  expect(classes(slot("dot-pattern"))).toContain("fill-foreground/18")
  expect(frames).toEqual([])
})

test("流星数量跟 number，不传颜色时用前景色", () => {
  render(<Meteors number={5} />)
  const stars = slot("meteors").querySelectorAll(":scope > span")
  expect(stars).toHaveLength(5)
  expect(stars[0]?.className).toContain("bg-foreground")
})

test("流星在减弱动效时关掉动画", () => {
  reduceMotion = true
  render(<Meteors number={2} />)
  const star = slot("meteors").querySelector(":scope > span")
  expect(star?.className).toContain("motion-reduce:animate-none")
})

test("极光不传颜色时用主题色，并保留模糊半径", () => {
  render(<AuroraBackground />)
  const wash = slot("aurora-background").querySelector("[aria-hidden]")
  const style = wash?.getAttribute("style") ?? ""
  expect(style).toContain("var(--primary)")
  expect(style).toContain("blur(64px)")
})

test("极光在减弱动效时停住流动", () => {
  reduceMotion = true
  render(<AuroraBackground speed={2} />)
  const wash = slot("aurora-background").querySelector("[aria-hidden]")
  expect(classes(wash)).toContain("motion-reduce:animate-none")
})

test("涟漪圈数跟 rings，不传颜色时用前景描边", () => {
  render(<Ripples rings={3} />)
  const rings = slot("ripples").querySelectorAll(":scope > span")
  expect(rings).toHaveLength(3)
  expect(rings[0]?.className).toContain("border-foreground/20")
})

test("涟漪在减弱动效时不再脉冲", () => {
  reduceMotion = true
  render(<Ripples rings={2} />)
  expect(slot("ripples").querySelector("span")?.className).toContain("motion-reduce:animate-none")
})

test("光束条数跟 beams，不传颜色时走 primary", () => {
  render(<LightBeams beams={4} />)
  const beams = slot("light-beams").querySelectorAll(":scope > span")
  expect(beams).toHaveLength(4)
  expect(beams[0]?.className).toContain("via-primary/50")
})

test("光束在减弱动效时不再升起", () => {
  reduceMotion = true
  render(<LightBeams beams={2} />)
  expect(slot("light-beams").querySelector("span")?.className).toContain("motion-reduce:animate-none")
})

test("噪点渐变不传颜色时用主题渐变类", () => {
  render(<NoiseGradient />)
  const wash = slot("noise-gradient").querySelector("div")
  expect(wash?.className).toContain("from-violet-600")
})

test("噪点渐变没有循环动画，减弱动效时也不申请动画帧", () => {
  reduceMotion = true
  render(<NoiseGradient />)
  expect(slot("noise-gradient").className).not.toContain("animate-")
  expect(frames).toEqual([])
})

test("动态网格单元格跟 cell，不传颜色时用前景描边", () => {
  render(<AnimatedGrid cell={20} />)
  const pattern = slot("animated-grid").querySelector("pattern")
  expect(pattern).toHaveAttribute("width", "20")
  expect(classes(slot("animated-grid"))).toContain("stroke-foreground/15")
})

test("动态网格在减弱动效时停住漂移", () => {
  reduceMotion = true
  render(<AnimatedGrid />)
  expect(classes(slot("animated-grid").querySelector("rect"))).toContain("motion-reduce:animate-none")
})

test("复古网格不传颜色时用 primary 网格", () => {
  render(<RetroGrid />)
  const plane = slot("retro-grid").querySelector(".h-\\[200\\%\\]")
  expect(plane?.className).toContain("var(--primary)")
})

test("复古网格在减弱动效时停住漂移", () => {
  reduceMotion = true
  render(<RetroGrid />)
  const plane = slot("retro-grid").querySelector(".h-\\[200\\%\\]")
  expect(plane?.className).toContain("motion-reduce:animate-none")
})

test("波浪不传颜色时用 primary，尺寸默认 7rem", () => {
  render(<WaveBackground />)
  const wave = slot("wave-background").querySelector("svg")
  expect(classes(wave)).toContain("text-primary/25")
  expect(classes(wave)).toContain("h-28")
})

test("波浪在减弱动效时停住位移", () => {
  reduceMotion = true
  render(<WaveBackground />)
  expect(classes(slot("wave-background").querySelector("path"))).toContain("motion-reduce:animate-none")
})

test("路径条数跟 count，不传颜色时描边用 currentColor", () => {
  const { container } = render(<BackgroundPaths count={4} />)
  const paths = container.querySelectorAll("path")
  expect(paths).toHaveLength(4)
  expect(paths[0]).toHaveAttribute("stroke", "currentColor")
})

test("路径在减弱动效时停住描边动画", () => {
  reduceMotion = true
  const { container } = render(<BackgroundPaths count={2} />)
  expect(classes(container.querySelector("path"))).toContain("motion-reduce:animate-none")
})

test("着色器背景不传颜色时铺默认网格渐变，速度留给预设", () => {
  const { container } = render(<ShaderBackground />)
  const style = container.firstElementChild?.getAttribute("style") ?? ""
  expect(style).toContain("rgb(30, 27, 75)")
  expect(container.querySelector("[data-shader='mesh']")).toHaveAttribute("data-speed", "preset")
})

test("着色器背景在减弱动效时把速度停成 0", () => {
  reduceMotion = true
  const { container } = render(<ShaderBackground speed={3} />)
  expect(container.querySelector("[data-shader='mesh']")).toHaveAttribute("data-speed", "0")
})

function installCanvasStage() {
  class FakeResizeObserver implements ResizeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {}
    observe(target: Element) {
      this.callback(
        [
          {
            target,
            contentRect: {
              width: 240,
              height: 120,
              x: 0,
              y: 0,
              top: 0,
              left: 0,
              bottom: 120,
              right: 240,
              toJSON() {
                return {}
              },
            },
          } as ResizeObserverEntry,
        ],
        this,
      )
    }
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", FakeResizeObserver)
  const context = {
    fillStyle: "",
    globalAlpha: 1,
    clearRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    fillRect() {},
    setTransform() {},
  }
  HTMLCanvasElement.prototype.getContext = (() => context) as typeof HTMLCanvasElement.prototype.getContext
}

test("粒子在视口内会申请动画帧", () => {
  installCanvasStage()
  render(<Particles quantity={4} />)
  expect(frames.length).toBeGreaterThan(0)
})

test("粒子在减弱动效时只画一帧，不再循环", () => {
  reduceMotion = true
  installCanvasStage()
  render(<Particles quantity={4} />)
  expect(frames).toEqual([])
  expect(slot("particles")).toBeInTheDocument()
})

test("星空在视口内会申请动画帧，不传颜色时仍渲染画布", () => {
  installCanvasStage()
  render(<Starfield />)
  expect(slot("starfield").tagName).toBe("CANVAS")
  expect(frames.length).toBeGreaterThan(0)
})

test("星空在减弱动效时不再循环", () => {
  reduceMotion = true
  installCanvasStage()
  render(<Starfield />)
  expect(frames).toEqual([])
})

test("闪烁网格在视口内会申请动画帧", () => {
  installCanvasStage()
  render(<FlickeringGrid />)
  expect(slot("flickering-grid").tagName).toBe("CANVAS")
  expect(frames.length).toBeGreaterThan(0)
})

test("闪烁网格在减弱动效时只画静帧", () => {
  reduceMotion = true
  installCanvasStage()
  render(<FlickeringGrid />)
  expect(frames).toEqual([])
})
