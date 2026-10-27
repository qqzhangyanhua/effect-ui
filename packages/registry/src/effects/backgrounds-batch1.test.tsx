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

import { AuroraBackground } from "./aurora-background"
import { NoiseGradient } from "./noise-gradient"
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


