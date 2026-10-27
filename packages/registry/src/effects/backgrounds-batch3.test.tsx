// @vitest-environment jsdom

import type { ReactElement } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

vi.mock("ogl", () => ({
  Renderer: class {
    gl = null
  },
}))

import { DataTunnel } from "./data-tunnel"
import { GalaxySpiral } from "./galaxy-spiral"
import { Singularity } from "./singularity"

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


function slotAfter(name: string, node: ReactElement) {
  render(node)
  return slot(name)
}
