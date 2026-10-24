// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { CursorFollow } from "./cursor-follow"
import { CursorTrail } from "./cursor-trail"
import { GlareHover } from "./glare-hover"
import { GlowHover } from "./glow-hover"
import { GravityImageTrail } from "./gravity-image-trail"
import { ImageTrail } from "./image-trail"
import { LensZoom } from "./lens-zoom"
import { Magnetic } from "./magnetic"

import { PolylineRibbonCursor } from "./polyline-ribbon-cursor"
import { ShaderGridWide } from "./shader-grid-wide"

import { SplashCursor } from "./splash-cursor"
import { SpotlightCard } from "./spotlight-card"

import { TargetCursor } from "./target-cursor"
import { Tilt } from "./tilt"

import { WobbleLineCursor } from "./wobble-line-cursor"

function installMatchMedia(reduce = false, coarse = false) {
  window.matchMedia = (query: string) =>
    ({
      matches:
        (reduce && query.includes("prefers-reduced-motion")) || (coarse && query.includes("pointer: coarse")),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList
}

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

beforeEach(() => {
  installMatchMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  vi.stubGlobal("ResizeObserver", SilentObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("聚光卡片不传时保持 70% 衰减，并给触屏和减弱动效留静态光斑", () => {
  const { container } = render(<SpotlightCard>光</SpotlightCard>)
  expect(container.innerHTML).toContain("transparent 70%")
  expect(container.innerHTML).toContain("duration-300")
  expect(container.innerHTML).toContain("pointer-coarse:opacity-100")
  expect(container.innerHTML).toContain("motion-reduce:opacity-100")
})

test("聚光强度和速度会改变衰减与过渡", () => {
  const { container } = render(<SpotlightCard intensity={0.5} speed={2}>光</SpotlightCard>)
  expect(container.innerHTML).toContain("transparent 35%")
  expect(container.innerHTML).toContain("150ms")
  expect(container.innerHTML).not.toContain("duration-300")
})

test("传 1 的聚光强度与不传相同", () => {
  const { container } = render(<SpotlightCard intensity={1} speed={1}>光</SpotlightCard>)
  expect(container.innerHTML).toContain("transparent 70%")
  expect(container.innerHTML).toContain("duration-300")
})

test("磁性、倾斜和跟随在不传与传起始值时都能渲染", () => {
  const magnetic = render(<Magnetic>吸</Magnetic>)
  expect(magnetic.container.querySelector("[data-slot='magnetic']")).toBeTruthy()
  magnetic.unmount()
  const scaled = render(<Magnetic scale={1.5}>吸</Magnetic>)
  expect(scaled.container.querySelector("[data-slot='magnetic']")).toBeTruthy()
  scaled.unmount()
  const tilt = render(<Tilt>斜</Tilt>)
  expect(tilt.container.querySelector("[data-slot='tilt']")).toBeTruthy()
  tilt.unmount()
  render(<CursorFollow>跟</CursorFollow>)
  expect(document.querySelector("[aria-hidden]")).toBeTruthy()
})

test("减弱动效时跟随光标不渲染光点", () => {
  installMatchMedia(true)
  render(<CursorFollow>跟</CursorFollow>)
  expect(document.querySelector("[aria-hidden]")).toBeNull()
})

test("跟随光标不传时用 35% 主题色，传入颜色仍保持这个透明度", () => {
  const plain = render(<CursorFollow>跟</CursorFollow>)
  const dot = plain.container.querySelector("[aria-hidden]")
  expect(dot).toHaveClass("bg-primary/35")
  plain.unmount()

  const tinted = render(<CursorFollow color="#112233">跟</CursorFollow>)
  const next = tinted.container.querySelector("[aria-hidden]")
  expect(next).toHaveStyle({ backgroundColor: "rgb(17, 34, 51)", opacity: "0.35" })
  expect(next).not.toHaveClass("bg-primary/35")
  tinted.unmount()

  installMatchMedia(false, true)
  const coarse = render(<CursorFollow>跟</CursorFollow>)
  fireEvent.mouseMove(coarse.container.firstElementChild as HTMLElement, { clientX: 80, clientY: 40 })
  expect(coarse.container.querySelector("[aria-hidden]")).toBeTruthy()
})

test("磁性和倾斜只在缩放偏离 1 时写入", () => {
  const styleOf = (view: { container: HTMLElement }, slot: string) =>
    view.container.querySelector(`[data-slot='${slot}']`)?.getAttribute("style") ?? ""

  const omit = render(<Magnetic>吸</Magnetic>)
  expect(styleOf(omit, "magnetic")).not.toContain("scale(")
  omit.unmount()
  const same = render(<Magnetic scale={1}>吸</Magnetic>)
  expect(styleOf(same, "magnetic")).not.toContain("scale(")
  same.unmount()
  const grown = render(<Magnetic scale={1.5}>吸</Magnetic>)
  expect(styleOf(grown, "magnetic")).toContain("scale(1.5)")
  grown.unmount()

  const tilt = render(<Tilt scale={1.5}>斜</Tilt>)
  expect(styleOf(tilt, "tilt")).toContain("scale(1.5)")
  tilt.unmount()
  const flat = render(<Tilt scale={1}>斜</Tilt>)
  expect(styleOf(flat, "tilt")).not.toContain("scale(")
})

test("外发光不传时保留原来的阴影类，并给触屏常亮阴影", () => {
  const { container } = render(<GlowHover>光</GlowHover>)
  expect(container.innerHTML).toContain("duration-300")
  expect(container.innerHTML).toContain("hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--glow)_40%,transparent),0_12px_40px_-16px_var(--glow)]")
  expect(container.innerHTML).toContain("pointer-coarse:shadow-")
})

test("外发光尺寸会写成阴影变量", () => {
  const { container } = render(<GlowHover size={80}>光</GlowHover>)
  expect(container.innerHTML).toContain("80px")
  expect(container.innerHTML).not.toContain("duration-300")
})

test("拖尾在粗指针和减弱动效下停在画面外", () => {
  const view = render(<CursorTrail>尾</CursorTrail>)
  fireEvent.mouseMove(view.container.firstElementChild as HTMLElement, { clientX: 120, clientY: 40 })
  expect(view.container.querySelector("span")).toHaveStyle({ left: "120px" })
  view.unmount()

  installMatchMedia(false, true)
  const coarse = render(<CursorTrail>尾</CursorTrail>)
  fireEvent.mouseMove(coarse.container.firstElementChild as HTMLElement, { clientX: 120, clientY: 40 })
  expect(coarse.container.querySelector("span")).toHaveStyle({ left: "-20px" })
  coarse.unmount()

  installMatchMedia(true)
  const reduced = render(<CursorTrail>尾</CursorTrail>)
  fireEvent.mouseMove(reduced.container.firstElementChild as HTMLElement, { clientX: 120, clientY: 40 })
  expect(reduced.container.querySelector("span")).toHaveStyle({ left: "-20px" })
})

test("拖尾尺寸 10 沿用类名，其它尺寸写内联宽高", () => {
  const same = render(<CursorTrail size={10}>尾</CursorTrail>)
  expect(same.container.querySelector("span")).toHaveClass("size-2.5")
  same.unmount()
  const next = render(<CursorTrail size={20} intensity={0.5} color="#112233">尾</CursorTrail>)
  const dot = next.container.querySelector("span")
  expect(dot).toHaveStyle({ width: "20px", height: "20px", backgroundColor: "#112233" })
  expect(dot).not.toHaveClass("size-2.5")
})

test("图片残影的尺寸、透明度和张数会生效，减弱动效不生成", () => {
  const images = ["data:image/gif;base64,R0lGODlhAQABAAAAACw="]
  const view = render(<ImageTrail images={images} size={80} intensity={0.5} gap={0} count={2} />)
  const host = view.container.firstElementChild as HTMLElement
  for (const x of [10, 40, 70, 100]) fireEvent.pointerMove(host, { clientX: x, clientY: 20 })
  const imagesOut = view.container.querySelectorAll("img")
  expect(imagesOut).toHaveLength(3)
  expect(imagesOut[0]).toHaveStyle({ width: "80px", opacity: "0.5" })
  expect(imagesOut[0]).not.toHaveClass("size-16", "opacity-80")
  view.unmount()

  installMatchMedia(true)
  const reduced = render(<ImageTrail images={images} />)
  fireEvent.pointerMove(reduced.container.firstElementChild as HTMLElement, { clientX: 30, clientY: 20 })
  expect(reduced.container.querySelector("img")).toBeNull()
})

test("图片残影不传时用 16 和 80% 透明度，触屏不生成", () => {
  const images = ["data:image/gif;base64,R0lGODlhAQABAAAAACw="]
  const view = render(<ImageTrail images={images} />)
  fireEvent.pointerMove(view.container.firstElementChild as HTMLElement, { clientX: 80, clientY: 30 })
  const image = view.container.querySelector("img")
  expect(image).toHaveClass("size-16", "opacity-80")
  view.unmount()

  installMatchMedia(false, true)
  const coarse = render(<ImageTrail images={images} />)
  fireEvent.pointerMove(coarse.container.firstElementChild as HTMLElement, { clientX: 80, clientY: 30 })
  expect(coarse.container.querySelector("img")).toBeNull()
})

test("高光扫过不传时保留白光带，减弱动效时不渲染光带", () => {
  const { container } = render(<GlareHover />)
  expect(container.innerHTML).toContain("via-white/75")
  expect(container.innerHTML).toContain("duration-700")
  expect(container.innerHTML).toContain("pointer-coarse:opacity-100")
  cleanup()
  installMatchMedia(true)
  const reduced = render(<GlareHover />)
  expect(reduced.container.querySelector("[aria-hidden]")).toBeNull()
})

test("高光宽度倍率会写成百分比", () => {
  const { container } = render(<GlareHover scale={2} />)
  expect(container.querySelector("[aria-hidden]")).toHaveStyle({ width: "100%" })
})

test("传入白色与不传一样保留高光类名", () => {
  const { container } = render(<GlareHover color="#ffffff" intensity={1} />)
  expect(container.innerHTML).toContain("via-white/75")
})

test("放大镜描边默认是白，传入颜色后改描边", () => {
  const view = render(<LensZoom />)
  const frame = view.container.querySelector("[data-slot='lens-zoom']") as HTMLElement
  fireEvent.pointerMove(frame, { clientX: 20, clientY: 20 })
  expect(view.container.innerHTML).toContain("border-white")
  view.unmount()
  const colored = render(<LensZoom color="#112233" />)
  fireEvent.pointerMove(colored.container.querySelector("[data-slot='lens-zoom']") as HTMLElement, { clientX: 20, clientY: 20 })
  expect(colored.container.innerHTML).toContain("border-color: rgb(17, 34, 51)")
})

test("传入白色与不传一样保留镜片白边", () => {
  const view = render(<LensZoom color="#ffffff" />)
  fireEvent.pointerMove(view.container.querySelector("[data-slot='lens-zoom']") as HTMLElement, { clientX: 20, clientY: 20 })
  const lens = view.container.querySelector(".rounded-full")
  expect(lens).toHaveClass("border-white")
  expect(lens).not.toHaveAttribute("style", expect.stringContaining("border-color"))
})

test("减弱动效时放大镜不出现", () => {
  installMatchMedia(true)
  const view = render(<LensZoom />)
  fireEvent.pointerMove(view.container.querySelector("[data-slot='lens-zoom']") as HTMLElement, { clientX: 20, clientY: 20 })
  expect(view.container.innerHTML).not.toContain("rounded-full")
})

test("琴弦默认 5 根，颜色和根数会生效，粗指针不拨动", () => {
  const view = render(<WobbleLineCursor />)
  expect(screen.getByLabelText("可以被拨动的弦").querySelectorAll("path")).toHaveLength(5)
  fireEvent.pointerMove(view.container.firstElementChild as HTMLElement, { clientX: 10, clientY: 10 })
  view.unmount()

  installMatchMedia(false, true)
  const coarse = render(<WobbleLineCursor lines={3} color="#112233" />)
  const before = coarse.container.querySelector("path")?.getAttribute("d")
  fireEvent.pointerMove(coarse.container.firstElementChild as HTMLElement, { clientX: 10, clientY: 10 })
  const paths = screen.getByLabelText("可以被拨动的弦").querySelectorAll("path")
  expect(paths).toHaveLength(3)
  expect(paths[0]).toHaveAttribute("stroke", "#112233")
  expect(paths[0]?.getAttribute("d")).toBe(before)
  coarse.unmount()

  installMatchMedia(true)
  const reduced = render(<WobbleLineCursor />)
  const straight = reduced.container.querySelector("path")?.getAttribute("d")
  fireEvent.pointerMove(reduced.container.firstElementChild as HTMLElement, { clientX: 80, clientY: 40 })
  expect(reduced.container.querySelector("path")?.getAttribute("d")).toBe(straight)
})

test("目标括号默认 28，强度会缩短角标", () => {
  const same = render(<TargetCursor />)
  expect(same.container.querySelector("[data-slot='target-cursor']")).toBeTruthy()
  expect(same.container.innerHTML).toContain("size-3")
  same.unmount()
  const next = render(<TargetCursor intensity={0.5} size={40} />)
  expect(next.container.querySelector("span")).toHaveStyle({ width: "6px" })
  expect(next.container.innerHTML).not.toContain("size-3")
})

test("画布光标在不传和传入新 prop 时都能挂上标记", () => {
  const gravity = render(<GravityImageTrail />)
  expect(screen.getByLabelText(/沿指针落下的图片/)).toBeTruthy()
  gravity.unmount()
  render(<GravityImageTrail size={40} gap={10} intensity={0.5} speed={1.5} />)
  expect(screen.getByLabelText(/沿指针落下的图片/)).toBeTruthy()
  cleanup()

  for (const node of [
    <SplashCursor key="splash" />,
    <SplashCursor key="splash-set" intensity={0.4} speed={1.2} />,
    <PolylineRibbonCursor key="ribbon" />,
    <PolylineRibbonCursor key="ribbon-set" intensity={0.5} speed={1.2} />,
    <ShaderGridWide key="grid" />,
    <ShaderGridWide key="grid-set" count={8} intensity={0.5} speed={1.5} scale={1.2} />,
  ]) {
    const view = render(node)
    expect(view.container.firstElementChild).toBeTruthy()
    view.unmount()
  }
})

test("减弱动效时喷溅光标停在静态渐变", () => {
  installMatchMedia(true)
  const { container } = render(<SplashCursor />)
  expect(container.innerHTML).toContain("radial-gradient")
  expect(container.querySelector("canvas")).toBeNull()
})
