// @vitest-environment jsdom

import type { ReactElement } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

vi.mock("ogl", () => ({
  Renderer: class {
    gl = null
  },
}))

import { ClothWindBanner } from "./cloth-wind-banner"
import { DataTunnel } from "./data-tunnel"
import { DrapeBackground } from "./drape-background"
import { Floating3DParticles } from "./floating-3d-particles"
import { GalaxySpiral } from "./galaxy-spiral"
import { HoverBlocksGrid } from "./hover-blocks-grid"
import { MergingBubbles } from "./merging-bubbles"
import { RainPuddle } from "./rain-puddle"
import { Singularity } from "./singularity"
import { SvgBands } from "./svg-bands"
import { TopoBackground } from "./topo-background"
import { WarpBackground } from "./warp-background"
import { WavefieldNeon } from "./wavefield-neon"

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
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
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

test("螺旋星系用旋臂滑块调节数量", () => {
  render(<GalaxySpiral />)
  expect(screen.getByRole("slider", { name: "旋臂" })).toHaveValue("3")
  expect(screen.getByRole("img", { name: "螺旋星系。拖动可倾斜，内圈转得更快。" })).toBeInTheDocument()
})

test("螺旋星系在减弱动效时改用静帧，不挂画布", () => {
  reduceMotion = true
  render(<GalaxySpiral />)
  const root = slot("galaxy-spiral")
  expect(root.querySelector("canvas")).toBeNull()
  expect(root.innerHTML).toContain("radial-gradient")
  expect(frames).toEqual([])
})

test("布旗用滑块切换风力", () => {
  render(<ClothWindBanner />)
  expect(screen.getByText("和风")).toBeInTheDocument()
  fireEvent.change(screen.getByRole("slider"), { target: { value: "0.9" } })
  expect(screen.getByText("劲风")).toBeInTheDocument()
})

test("布旗在减弱动效时改用条纹静帧", () => {
  reduceMotion = true
  const root = slotAfter("cloth-wind-banner", <ClothWindBanner />)
  expect(root.querySelector("canvas")).toBeNull()
  expect(root.innerHTML).toContain("repeating-linear-gradient")
  expect(frames).toEqual([])
})

test("数据隧道说明滚动会加速", () => {
  render(<DataTunnel />)
  expect(screen.getByRole("img", { name: "数据隧道" })).toBeInTheDocument()
  expect(screen.getByText(/滚动或按住加速/)).toBeInTheDocument()
})

test("数据隧道在减弱动效时改用静帧环", () => {
  reduceMotion = true
  const root = slotAfter("data-tunnel", <DataTunnel />)
  expect(root.querySelector("canvas")).toBeNull()
  expect(root.innerHTML).toContain("repeating-radial-gradient")
  expect(frames).toEqual([])
})

test("霓虹波场允许动效时挂上画布", () => {
  render(<WavefieldNeon />)
  expect(screen.getByLabelText("霓虹波场，指针处会荡开涟漪")).toBeInTheDocument()
})

test("霓虹波场在减弱动效时改成静帧标签", () => {
  reduceMotion = true
  render(<WavefieldNeon />)
  expect(screen.getByLabelText("霓虹波场静帧")).toBeInTheDocument()
  expect(frames).toEqual([])
})

test("黑洞允许动效时挂上可跟随指针的画布", () => {
  render(<Singularity />)
  expect(screen.getByLabelText("黑洞，移动指针可以轻轻挪动它")).toBeInTheDocument()
})

test("黑洞在减弱动效时改成静帧标签", () => {
  reduceMotion = true
  render(<Singularity />)
  expect(screen.getByLabelText("黑洞静帧")).toBeInTheDocument()
})

test("雨后水面允许动效时挂上可点击的画布", () => {
  render(<RainPuddle />)
  expect(screen.getByLabelText("雨滴在水面荡开涟漪，点击制造大涟漪")).toBeInTheDocument()
})

test("雨后水面在减弱动效时改成静帧标签", () => {
  reduceMotion = true
  render(<RainPuddle />)
  expect(screen.getByLabelText("雨后水面静帧")).toBeInTheDocument()
})

test("扭曲网格按每边光束数铺光带", () => {
  render(<WarpBackground beamsPerSide={2} />)
  expect(slot("warp-background").querySelectorAll(".top-0")).toHaveLength(8)
})

test("扭曲网格在减弱动效时不再放光带", () => {
  reduceMotion = true
  render(<WarpBackground beamsPerSide={2} />)
  expect(slot("warp-background").querySelectorAll(".top-0")).toHaveLength(0)
})

function installParticleStage() {
  const context = {
    fillStyle: "",
    globalAlpha: 1,
    clearRect() {},
    beginPath() {},
    arc() {},
    fill() {},
    setTransform() {},
  }
  HTMLCanvasElement.prototype.getContext = (() => context) as typeof HTMLCanvasElement.prototype.getContext
  vi.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 200,
    height: 120,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: 120,
    right: 200,
    toJSON() {
      return {}
    },
  })
}

test("立体粒子在视口内会继续申请动画帧", () => {
  installParticleStage()
  render(<Floating3DParticles quantity={6} />)
  expect(slot("floating-3d-particles").tagName).toBe("CANVAS")
  expect(frames.length).toBeGreaterThan(0)
  const queued = frames.length
  frames[0]?.(0)
  expect(frames.length).toBeGreaterThan(queued)
})

test("立体粒子在减弱动效时画完一帧就停", () => {
  reduceMotion = true
  installParticleStage()
  render(<Floating3DParticles quantity={6} />)
  const queued = frames.length
  expect(queued).toBeGreaterThan(0)
  frames[0]?.(0)
  expect(frames.length).toBe(queued)
})

test("融合气泡数量跟 count", () => {
  render(<MergingBubbles count={4} />)
  expect(slot("merging-bubbles").querySelectorAll("[data-bubble]")).toHaveLength(4)
})

test("融合气泡在减弱动效时标记静止", () => {
  reduceMotion = true
  render(<MergingBubbles count={4} />)
  expect(slot("merging-bubbles")).toHaveAttribute("data-reduced", "true")
  expect(frames).toEqual([])
})

test("色带画出三条路径", () => {
  render(<SvgBands />)
  const paths = slot("svg-bands").querySelectorAll("path")
  expect(paths).toHaveLength(3)
  expect(paths[0]?.getAttribute("class") ?? "").toContain("svg-bands-")
})

test("色带在减弱动效时去掉流动类", () => {
  reduceMotion = true
  render(<SvgBands />)
  const path = slot("svg-bands").querySelector("path")
  expect(slot("svg-bands")).toHaveAttribute("data-reduced", "true")
  expect(path?.getAttribute("class")).toBeNull()
})

test("帷幕默认放上标题", () => {
  render(<DrapeBackground />)
  expect(screen.getByRole("heading", { name: "Behind the curtain" })).toBeInTheDocument()
})

test("帷幕在减弱动效时标成静止", () => {
  reduceMotion = true
  render(<DrapeBackground />)
  expect(slot("drape-background")).toHaveAttribute("data-reduced", "true")
})

test("等高线默认放上立足点文案", () => {
  render(<TopoBackground />)
  expect(screen.getByText("Find your footing")).toBeInTheDocument()
})

test("等高线在减弱动效时标成静止", () => {
  reduceMotion = true
  render(<TopoBackground />)
  expect(slot("topo-background")).toHaveAttribute("data-reduced", "true")
})

test("悬停格子铺满网格", () => {
  render(<HoverBlocksGrid />)
  expect(slot("hover-blocks-grid").querySelectorAll(".border").length).toBeGreaterThan(0)
})

test("悬停格子在减弱动效时关掉颜色过渡", () => {
  reduceMotion = true
  render(<HoverBlocksGrid />)
  const cell = slot("hover-blocks-grid").querySelector(".border")
  expect(slot("hover-blocks-grid")).toHaveAttribute("data-reduced", "true")
  expect(cell?.className).toContain("transition-none")
})

function slotAfter(name: string, node: ReactElement) {
  render(node)
  return slot(name)
}
