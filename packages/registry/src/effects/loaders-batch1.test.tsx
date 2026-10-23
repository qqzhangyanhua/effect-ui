// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { AITextLoading } from "./ai-text-loading"
import { AiLoader } from "./ai-loader"
import { BookPageLoader } from "./book-page-loader"
import { ConstellationLoader } from "./constellation-loader"
import { EyeBlinkLoader } from "./eye-blink-loader"
import { GlowCornerLoader } from "./glow-corner-loader"
import { GridLoader } from "./grid-loader"
import { MapPinLoader } from "./map-pin-loader"
import { MorphingShapesLoader } from "./morphing-shapes-loader"
import { NeonGlowLoader } from "./neon-glow-loader"
import { ParticleSwarmLoader } from "./particle-swarm-loader"
import { RippleWaveLoader } from "./ripple-wave-loader"
import { SpinningCubeLoader } from "./spinning-cube-loader"
import { TiledSwirlLoader } from "./tiled-swirl-loader"
import { WhirlpoolLoader } from "./whirlpool-loader"

let reduceMotion = false

const shapeColors = ["#fb3a5d", "#6366f1", "#22c55e", "#f59e0b"]
const neonColors = ["#fb3a5d", "#00ffff", "#ffff00"]
const cornerColors = ["#9e88f6", "#61b7fd", "#5ff9af", "#f3ab59"]

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

test("方块旋涡读出加载名称", () => {
  render(<TiledSwirlLoader color="#38bdf8" size={168} speed={1} />)
  expect(screen.getByRole("img", { name: "方块旋涡加载" })).toBeInTheDocument()
})

test("方块旋涡在减弱动效下改成静态圆环", () => {
  reduceMotion = true
  render(<TiledSwirlLoader color="#38bdf8" size={168} speed={1} />)
  expect(screen.getByRole("img", { name: "加载中" })).toBeInTheDocument()
})

test("轮换短句显示第一句", () => {
  const view = render(<AITextLoading showElapsed texts={["思考中", "整理中", "快好了"]} />)
  expect(slot(view.container, "ai-text-loading").textContent).toContain("思考中")
  expect(slot(view.container, "ai-text-loading")).toHaveAttribute("data-reduced", "false")
})

test("轮换短句在减弱动效下仍显示第一句", () => {
  reduceMotion = true
  const view = render(<AITextLoading showElapsed texts={["思考中", "整理中", "快好了"]} />)
  expect(slot(view.container, "ai-text-loading").textContent).toContain("思考中")
  expect(slot(view.container, "ai-text-loading")).toHaveAttribute("data-reduced", "true")
})

test("点阵加载标出状态", () => {
  const view = render(<GridLoader color="blue" mode="pulse" pattern="heartbeat" rounded size="lg" speed="normal" />)
  expect(slot(view.container, "grid-loader")).toHaveAttribute("aria-label", "Loading")
  expect(slot(view.container, "grid-loader")).toHaveAttribute("data-reduced", "false")
})

test("点阵加载在减弱动效下仍标出状态", () => {
  reduceMotion = true
  const view = render(<GridLoader color="blue" mode="pulse" pattern="heartbeat" rounded size="lg" speed="normal" />)
  expect(slot(view.container, "grid-loader")).toHaveAttribute("aria-label", "Loading")
  expect(slot(view.container, "grid-loader")).toHaveAttribute("data-reduced", "true")
})

test("星座加载挂上星图", () => {
  const view = render(<ConstellationLoader color="#c7d2fe" count={16} size={7} />)
  expect(slot(view.container, "constellation-loader")).toHaveAttribute("data-reduced", "false")
})

test("星座加载在减弱动效下仍挂上星图", () => {
  reduceMotion = true
  const view = render(<ConstellationLoader color="#c7d2fe" count={16} size={7} />)
  expect(slot(view.container, "constellation-loader")).toHaveAttribute("data-reduced", "true")
})

test("粒子群挂上粒子层", () => {
  const view = render(<ParticleSwarmLoader color="#818cf8" count={36} size={2.4} />)
  expect(slot(view.container, "particle-swarm-loader")).toHaveAttribute("data-reduced", "false")
})

test("粒子群在减弱动效下仍挂上粒子层", () => {
  reduceMotion = true
  const view = render(<ParticleSwarmLoader color="#818cf8" count={36} size={2.4} />)
  expect(slot(view.container, "particle-swarm-loader")).toHaveAttribute("data-reduced", "true")
})

test("旋转方块挂上方块", () => {
  const view = render(<SpinningCubeLoader color="#6366f1" duration={2.4} size={72} />)
  expect(slot(view.container, "spinning-cube-loader")).toHaveAttribute("data-reduced", "false")
})

test("旋转方块在减弱动效下仍挂上方块", () => {
  reduceMotion = true
  const view = render(<SpinningCubeLoader color="#6366f1" duration={2.4} size={72} />)
  expect(slot(view.container, "spinning-cube-loader")).toHaveAttribute("data-reduced", "true")
})

test("漩涡挂上螺旋", () => {
  const view = render(<WhirlpoolLoader color="#a5b4fc" duration={16} rotations={5} segments={42} />)
  expect(slot(view.container, "whirlpool-loader")).toHaveAttribute("data-reduced", "false")
})

test("漩涡在减弱动效下仍挂上螺旋", () => {
  reduceMotion = true
  const view = render(<WhirlpoolLoader color="#a5b4fc" duration={16} rotations={5} segments={42} />)
  expect(slot(view.container, "whirlpool-loader")).toHaveAttribute("data-reduced", "true")
})

test("变形色块放出四块", () => {
  const view = render(<MorphingShapesLoader colors={shapeColors} count={4} size={28} />)
  expect(slot(view.container, "morphing-shapes-loader").childElementCount).toBe(4)
  expect(slot(view.container, "morphing-shapes-loader")).toHaveAttribute("data-reduced", "false")
})

test("变形色块在减弱动效下仍放出四块", () => {
  reduceMotion = true
  const view = render(<MorphingShapesLoader colors={shapeColors} count={4} size={28} />)
  expect(slot(view.container, "morphing-shapes-loader").childElementCount).toBe(4)
  expect(slot(view.container, "morphing-shapes-loader")).toHaveAttribute("data-reduced", "true")
})

test("霓虹点放出三点", () => {
  const view = render(<NeonGlowLoader colors={neonColors} duration={1} size={18} />)
  expect(slot(view.container, "neon-glow-loader").childElementCount).toBe(3)
  expect(slot(view.container, "neon-glow-loader")).toHaveAttribute("data-reduced", "false")
})

test("霓虹点在减弱动效下仍放出三点", () => {
  reduceMotion = true
  const view = render(<NeonGlowLoader colors={neonColors} duration={1} size={18} />)
  expect(slot(view.container, "neon-glow-loader").childElementCount).toBe(3)
  expect(slot(view.container, "neon-glow-loader")).toHaveAttribute("data-reduced", "true")
})

test("波纹竖条放出七条", () => {
  const view = render(<RippleWaveLoader color="#ef4444" count={7} duration={1} />)
  expect(slot(view.container, "ripple-wave-loader").childElementCount).toBe(7)
  expect(slot(view.container, "ripple-wave-loader")).toHaveAttribute("data-reduced", "false")
})

test("波纹竖条在减弱动效下仍放出七条", () => {
  reduceMotion = true
  const view = render(<RippleWaveLoader color="#ef4444" count={7} duration={1} />)
  expect(slot(view.container, "ripple-wave-loader").childElementCount).toBe(7)
  expect(slot(view.container, "ripple-wave-loader")).toHaveAttribute("data-reduced", "true")
})

test("眨眼加载标出状态", () => {
  render(<EyeBlinkLoader />)
  expect(screen.getByRole("status", { name: "加载中" })).toHaveAttribute("data-reduced", "false")
})

test("眨眼加载在减弱动效下仍标出状态", () => {
  reduceMotion = true
  render(<EyeBlinkLoader />)
  expect(screen.getByRole("status", { name: "加载中" })).toHaveAttribute("data-reduced", "true")
})

test("思考加载用文字作为状态名", () => {
  render(<AiLoader size="md" text="思考中" variant="circular" />)
  expect(screen.getByRole("status", { name: "思考中" })).toHaveAttribute("data-variant", "circular")
})

test("思考加载在减弱动效下仍用文字作为状态名", () => {
  reduceMotion = true
  render(<AiLoader size="md" text="思考中" variant="circular" />)
  expect(screen.getByRole("status", { name: "思考中" })).toHaveAttribute("data-reduced", "true")
})

test("翻书加载标出状态", () => {
  render(<BookPageLoader coverColor="#506c86" pageColor="#f1775b" />)
  expect(screen.getByRole("status", { name: "加载中" })).toHaveAttribute("data-slot", "book-page-loader")
})

test("翻书加载在减弱动效下仍标出状态", () => {
  reduceMotion = true
  render(<BookPageLoader coverColor="#506c86" pageColor="#f1775b" />)
  expect(screen.getByRole("status", { name: "加载中" })).toHaveAttribute("data-reduced", "true")
})

test("地图钉标出状态", () => {
  render(<MapPinLoader color="#ffffff" />)
  expect(screen.getByRole("status", { name: "加载中" })).toHaveAttribute("data-slot", "map-pin-loader")
})

test("地图钉在减弱动效下仍标出状态", () => {
  reduceMotion = true
  render(<MapPinLoader color="#ffffff" />)
  expect(screen.getByRole("status", { name: "加载中" })).toHaveAttribute("data-reduced", "true")
})

test("四角光块标出状态", () => {
  render(<GlowCornerLoader colors={cornerColors} />)
  expect(screen.getByRole("status", { name: "加载中" })).toHaveAttribute("data-slot", "glow-corner-loader")
})

test("四角光块在减弱动效下仍标出状态", () => {
  reduceMotion = true
  render(<GlowCornerLoader colors={cornerColors} />)
  expect(screen.getByRole("status", { name: "加载中" })).toHaveAttribute("data-reduced", "true")
})
