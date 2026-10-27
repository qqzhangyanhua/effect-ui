// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { ImageTubeScroll } from "./image-tube-scroll"
import { MacbookScroll } from "./macbook-scroll"
import { Parallax } from "./parallax"
import { Reveal } from "./reveal"
import { ScrollSvgGraph } from "./scroll-svg-graph"
import { ScrollTimelineReveal } from "./scroll-timeline-reveal"
import { SvgMaskScrollTransition } from "./svg-mask-scroll-transition"

function installMatchMedia(reduce = false) {
  window.matchMedia = (query: string) =>
    ({
      matches: reduce && query.includes("prefers-reduced-motion"),
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

function styleOf(node: Element | null) {
  return node?.getAttribute("style") ?? ""
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

test("Reveal 不传时淡入上移 16，强度 0.5 减半，传 1 与不传相同", () => {
  const omitted = render(<Reveal>淡入</Reveal>)
  const omittedStyle = styleOf(omitted.container.querySelector("[data-slot='reveal']"))
  omitted.unmount()

  const half = render(<Reveal intensity={0.5}>淡入</Reveal>)
  const halfStyle = styleOf(half.container.querySelector("[data-slot='reveal']"))
  half.unmount()

  const same = render(<Reveal speed={1} intensity={1}>淡入</Reveal>)
  const sameStyle = styleOf(same.container.querySelector("[data-slot='reveal']"))

  expect(omittedStyle).toContain("16px")
  expect(halfStyle).toContain("8px")
  expect(halfStyle).not.toContain("16px")
  expect(sameStyle).toBe(omittedStyle)
})

test("Reveal 减弱动效时停在可见状态", () => {
  installMatchMedia(true)
  const { container } = render(<Reveal>淡入</Reveal>)
  const style = styleOf(container.querySelector("[data-slot='reveal']"))
  expect(style).toContain("opacity: 1")
  expect(style).not.toContain("opacity: 0")
})


test("Parallax 减弱动效时不再套一层位移", () => {
  installMatchMedia(true)
  render(
    <Parallax>
      <p>视差</p>
    </Parallax>,
  )
  expect(screen.getByText("视差").parentElement).toHaveAttribute("data-slot", "parallax")
})


test("时间线回退在强度 0.5 时把位移减半", () => {
  const css = window.CSS
  window.CSS = { ...css, supports: () => false } as unknown as typeof CSS
  const plain = render(<ScrollTimelineReveal>内容</ScrollTimelineReveal>)
  expect(plain.container.innerHTML).toContain("translateY(2rem)")
  const style = styleOf(plain.container.querySelector("[style]"))
  expect(style).toContain("28px")
  plain.unmount()

  const half = render(<ScrollTimelineReveal intensity={0.5}>内容</ScrollTimelineReveal>)
  const html = half.container.innerHTML
  expect(html).toContain("translateY(1rem)")
  expect(html).toContain("translateY(1.25rem)")
  expect(html).toContain("translateY(-1.25rem)")
  expect(html).not.toContain("translateY(2rem)")
  expect(html).not.toContain("translateY(2.5rem)")
  expect(styleOf(half.container.querySelector("[style]"))).toContain("14px")
})

test("SVG 遮罩在不可滚动时按展开计算半径", () => {
  const open = render(<SvgMaskScrollTransition />)
  fireEvent.scroll(open.container.querySelector("[aria-label^='滚动切换场景']") as Element)
  expect(Number(open.container.querySelector("circle")?.getAttribute("r"))).toBeCloseTo(0.76)
  open.unmount()

  const half = render(<SvgMaskScrollTransition intensity={0.5} />)
  fireEvent.scroll(half.container.querySelector("[aria-label^='滚动切换场景']") as Element)
  expect(Number(half.container.querySelector("circle")?.getAttribute("r"))).toBeCloseTo(0.4)
})

test("笔记本减弱动效时盖子是打开的", () => {
  installMatchMedia(true)
  const { container } = render(<MacbookScroll />)
  expect(container.innerHTML).toContain("transform: none")
  expect(screen.getByText("滚动展开屏幕")).toBeTruthy()
})

test("折线不传或传起始色时保留原来的描边和面积", () => {
  const omitted = render(<ScrollSvgGraph />)
  expect(omitted.container.innerHTML).toContain("#c4b5fd")
  expect(omitted.container.innerHTML).toContain("#a78bfa")
  omitted.unmount()

  const same = render(<ScrollSvgGraph color="#c4b5fd" />)
  expect(same.container.innerHTML).toContain("#c4b5fd")
  expect(same.container.innerHTML).toContain("#a78bfa")
  same.unmount()

  const next = render(<ScrollSvgGraph color="#38bdf8" />)
  expect(next.container.innerHTML).toContain("#38bdf8")
  expect(next.container.innerHTML).not.toContain("#c4b5fd")
  expect(next.container.innerHTML).not.toContain("#a78bfa")
})

test("图片管道减弱动效时不挂 canvas", () => {
  installMatchMedia(true)
  const { container } = render(<ImageTubeScroll />)
  expect(container.querySelector("canvas")).toBeNull()
  expect(screen.getByText("晨窗")).toBeTruthy()
})
