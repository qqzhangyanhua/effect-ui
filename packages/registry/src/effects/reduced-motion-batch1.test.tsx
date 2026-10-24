// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { Announcement } from "./announcement"
import { BlurFade } from "./blur-fade"
import { FadeIn } from "./fade-in"
import { HeroVideoDialog } from "./hero-video-dialog"
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from "./image-comparison"
import { NeonButton } from "./neon-button"
import { PixelTransition } from "./pixel-transition"
import { ProgressiveBlur } from "./progressive-blur"
import { ScrollProgress } from "./scroll-progress"
import { SlideIn } from "./slide-in"

let reduceMotion = false

afterEach(() => {
  cleanup()
  reduceMotion = false
})

vi.stubGlobal("matchMedia", (query: string) => ({
  matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
}))

test("减弱动效时淡入、滑入和模糊直接落在终点", () => {
  reduceMotion = true
  const fade = render(<FadeIn>淡入</FadeIn>)
  const slide = render(<SlideIn>滑入</SlideIn>)
  const blur = render(<BlurFade>模糊</BlurFade>)
  expect(fade.container.querySelector("[data-slot='fade-in']")).toHaveAttribute("data-reduced", "true")
  expect(slide.container.querySelector("[data-slot='slide-in']")).toHaveAttribute("data-reduced", "true")
  expect(blur.container.querySelector("[data-slot='blur-fade']")).toHaveAttribute("data-reduced", "true")
  expect(fade.container.querySelector("[data-slot='fade-in']")?.getAttribute("style") ?? "").not.toContain("16px")
  expect(slide.container.querySelector("[data-slot='slide-in']")?.getAttribute("style") ?? "").not.toContain("36px")
  expect(blur.container.querySelector("[data-slot='blur-fade']")?.getAttribute("style") ?? "").not.toContain("blur(8px)")
})

test("减弱动效时霓虹按钮和公告不再过渡", () => {
  reduceMotion = true
  render(<NeonButton>霓虹</NeonButton>)
  render(
    <Announcement>
      <span>新</span>
    </Announcement>,
  )
  expect(document.querySelector("[data-slot='neon-button']")).toHaveClass("motion-reduce:transition-none")
  expect(document.querySelector("[data-slot='announcement']")).toHaveClass("transition-none")
})

test("减弱动效时像素过渡立刻换位", () => {
  reduceMotion = true
  const pixel = render(<PixelTransition from="/a.png" to="/b.png" />)
  expect(pixel.container.querySelector("button")).toHaveAttribute("data-reduced", "true")
  const cell = pixel.container.querySelector(".bg-zinc-950")
  expect(cell).toHaveClass("transition-none")
  expect(cell?.getAttribute("style") ?? "").toContain("0ms")
})

test("减弱动效时图片对比直接跟手，滚动进度仍显示", () => {
  reduceMotion = true
  render(
    <ImageComparison>
      <ImageComparisonImage alt="前" position="left" src="/a.png" />
      <ImageComparisonImage alt="后" position="right" src="/b.png" />
      <ImageComparisonSlider />
    </ImageComparison>,
  )
  expect(document.querySelector("[data-reduced='true']")).toBeTruthy()
  render(<ScrollProgress />)
  const bar = document.querySelector("[data-reduced='true'].h-1")
  expect(bar).toBeTruthy()
  expect(bar).toHaveClass("h-1")
})

test("减弱动效时视频封面不再过渡，渐进模糊仍是静态层", () => {
  reduceMotion = true
  render(
    <HeroVideoDialog thumbnailSrc="/cover.png" videoSrc="https://example.com/video" />,
  )
  const root = document.querySelector("[data-slot='hero-video-dialog']")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root?.querySelector("img")).toHaveClass("transition-none")
  const blur = render(<ProgressiveBlur />)
  expect(blur.container.querySelectorAll("[style*='backdrop-filter']")).toHaveLength(8)
})
