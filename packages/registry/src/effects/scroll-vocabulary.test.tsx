// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { BlurFade } from "./blur-fade"
import { FadeIn } from "./fade-in"
import { ImageTubeScroll } from "./image-tube-scroll"
import { MacbookScroll } from "./macbook-scroll"
import { Parallax } from "./parallax"
import { ProgressiveBlur } from "./progressive-blur"
import { Reveal } from "./reveal"
import { ScrollProgress } from "./scroll-progress"
import { ScrollSvgGraph } from "./scroll-svg-graph"
import { ScrollTimelineReveal } from "./scroll-timeline-reveal"
import { ScrollVelocity, ScrollVelocityRow } from "./scroll-velocity"
import { SlideIn } from "./slide-in"
import { StackingCardItem, StackingCards } from "./stacking-cards"
import { StaggerList } from "./stagger-list"
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

test("FadeIn 把强度传给淡入位移", () => {
  const { container } = render(<FadeIn intensity={0.5}>淡入</FadeIn>)
  expect(container.querySelector("[data-slot='fade-in']")).toBeTruthy()
  expect(styleOf(container.querySelector("[data-slot='fade-in']"))).toContain("8px")
})

test("SlideIn 从左侧时强度减半位移", () => {
  const { container } = render(<SlideIn from="left" intensity={0.5}>滑入</SlideIn>)
  expect(styleOf(container.querySelector("[data-slot='slide-in']"))).toContain("-18px")
})

test("BlurFade 强度减半初始模糊", () => {
  const { container } = render(<BlurFade intensity={0.5}>模糊</BlurFade>)
  expect(styleOf(container.querySelector("[data-slot='blur-fade']"))).toContain("blur(4px)")
})

test("StaggerList 默认间距沿用 gap-2，其他间距写到 style", () => {
  const kept = render(
    <StaggerList>
      <span>一项</span>
    </StaggerList>,
  )
  expect(kept.container.querySelector("[data-slot='stagger-list']")).toHaveClass("gap-2")
  expect(styleOf(kept.container.querySelector("[data-slot='stagger-list']"))).not.toContain("gap")
  kept.unmount()

  const spaced = render(
    <StaggerList gap={16}>
      <span>一项</span>
    </StaggerList>,
  )
  const node = spaced.container.querySelector("[data-slot='stagger-list']")
  expect(node).not.toHaveClass("gap-2")
  expect(styleOf(node)).toContain("16px")
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

test("ProgressiveBlur 默认 8 层，强度 0.5 把每层模糊减半", () => {
  const full = render(<ProgressiveBlur />)
  const fullLayers = full.container.querySelectorAll("[style*='backdrop-filter']")
  expect(fullLayers).toHaveLength(8)
  expect(styleOf(fullLayers[1] ?? null)).toContain("blur(0.25px)")
  full.unmount()

  const half = render(<ProgressiveBlur intensity={0.5} />)
  const halfLayers = half.container.querySelectorAll("[style*='backdrop-filter']")
  expect(styleOf(halfLayers[1] ?? null)).toContain("blur(0.125px)")
})

test("ScrollProgress 默认用 h-1，尺寸和强度会写进 style", () => {
  const plain = render(<ScrollProgress />)
  expect(plain.container.querySelector(".h-1")).toBeTruthy()
  expect(plain.container.innerHTML).toContain("from-violet-500")
  plain.unmount()

  const kept = render(<ScrollProgress color="#8b5cf6" />)
  expect(kept.container.innerHTML).toContain("from-violet-500")
  kept.unmount()

  const sized = render(<ScrollProgress size={8} intensity={0.5} color="#ff0000" />)
  const bar = sized.container.querySelector("div")
  expect(bar).not.toHaveClass("h-1")
  expect(bar).not.toHaveClass("from-violet-500")
  const style = styleOf(bar)
  expect(style).toContain("8px")
  expect(style).toContain("0.5")
  expect(style).toContain("rgb(255, 0, 0)")
})

test("ScrollVelocity 减弱动效时子节点只出现一次", () => {
  installMatchMedia(true)
  render(
    <ScrollVelocity>
      <ScrollVelocityRow>
        <span>跑马灯</span>
      </ScrollVelocityRow>
    </ScrollVelocity>,
  )
  expect(screen.getAllByText("跑马灯")).toHaveLength(1)
})

test("叠放卡片减弱动效时不再粘住", () => {
  installMatchMedia(true)
  const { container } = render(
    <StackingCards totalCards={1}>
      <StackingCardItem index={0}>
        <p>设计</p>
      </StackingCardItem>
    </StackingCards>,
  )
  expect(screen.getByText("设计")).toBeTruthy()
  expect(container.innerHTML).not.toContain("sticky")
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
