// @vitest-environment jsdom

import { useState } from "react"
import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { DetailsList } from "./details-list"
import { FeaturedGallery } from "./featured-gallery"
import { HoverExpand } from "./hover-expand"
import { HoverGallery } from "./hover-gallery"
import { HoverImageReveal } from "./hover-image-reveal"
import { ImageFade } from "./image-fade"
import { ImageTabs } from "./image-tabs"
import { InlineTestimonials } from "./inline-testimonials"
import { LightBoard } from "./lightboard"
import { PortfolioFilterGrid } from "./portfolio-filter-grid"
import { ProgressiveCarousel } from "./progressive-carousel"
import { Reel, ReelPlayButton } from "./reel"
import { ReviewsCarousel } from "./reviews-carousel"
import { SecurityCheckpoint } from "./security-checkpoint"
import { Stories, StoriesContent, Story, StoryAuthor, StoryAuthorImage, StoryAuthorName, StoryImage, StoryOverlay, StoryTitle } from "./stories"

const pixel =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#312e81"/></svg>')

let reduceMotion = false

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
  vi.useRealTimers()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot="${name}"]`)
  expect(node).not.toBeNull()
  return node as HTMLElement
}

const bars = [
  { alt: "靛蓝", id: "indigo", image: pixel, title: "靛蓝" },
  { alt: "琥珀", id: "amber", image: pixel, title: "琥珀" },
]

test("悬停展开显示标题", () => {
  const view = render(<HoverExpand collapsedFlex={1} expandedFlex={4} items={bars} orientation="horizontal" showLabelsWhenCollapsed />)
  expect(screen.getByText("靛蓝")).toBeInTheDocument()
  expect(slot(view.container, "hover-expand")).toHaveAttribute("data-reduced", "false")
})

test("悬停展开在减弱动效下仍显示标题", () => {
  reduceMotion = true
  const view = render(<HoverExpand collapsedFlex={1} expandedFlex={4} items={bars} orientation="horizontal" showLabelsWhenCollapsed />)
  expect(screen.getByText("靛蓝")).toBeInTheDocument()
  expect(slot(view.container, "hover-expand")).toHaveAttribute("data-reduced", "true")
})

test("行内评价显示正文", () => {
  const view = render(
    <InlineTestimonials
      testimonials={[{ avatar: pixel, id: "lin", name: "林", quote: "夜航那一段把港口写清楚了。", rating: 5, role: "编辑" }]}
      text="这一段是 {{lin}} 留下的批注，读完还能看见灯。"
    />,
  )
  expect(screen.getByText(/留下的批注/)).toBeInTheDocument()
  expect(slot(view.container, "inline-testimonials")).toHaveAttribute("data-reduced", "false")
})

test("行内评价在减弱动效下仍显示正文", () => {
  reduceMotion = true
  const view = render(
    <InlineTestimonials
      testimonials={[{ avatar: pixel, id: "lin", name: "林", quote: "夜航那一段把港口写清楚了。", rating: 5, role: "编辑" }]}
      text="这一段是 {{lin}} 留下的批注，读完还能看见灯。"
    />,
  )
  expect(screen.getByText(/留下的批注/)).toBeInTheDocument()
  expect(slot(view.container, "inline-testimonials")).toHaveAttribute("data-reduced", "true")
})

const reviews = [
  { author: "林", body: "港口的灯还在。", id: "a", title: "夜航" },
  { author: "周", body: "雾散得很干净。", id: "b", title: "清晨" },
]

test("评价轮播显示第一张", () => {
  const view = render(<ReviewsCarousel autoPlay={false} autoPlayInterval={5000} reviews={reviews} showIndicators />)
  expect(screen.getByText("夜航")).toBeInTheDocument()
  expect(slot(view.container, "reviews-carousel")).toHaveAttribute("data-reduced", "false")
})

test("评价轮播在减弱动效下仍显示第一张", () => {
  reduceMotion = true
  const view = render(<ReviewsCarousel autoPlay={false} autoPlayInterval={5000} reviews={reviews} showIndicators />)
  expect(screen.getByText("夜航")).toBeInTheDocument()
  expect(slot(view.container, "reviews-carousel")).toHaveAttribute("data-reduced", "true")
})

function renderStory() {
  return render(
    <Stories>
      <StoriesContent>
        <Story>
          <StoryImage alt="夜航" src={pixel} />
          <StoryOverlay />
          <StoryTitle>夜航</StoryTitle>
          <StoryAuthor>
            <StoryAuthorImage fallback="北" name="北窗" />
            <StoryAuthorName>北窗</StoryAuthorName>
          </StoryAuthor>
        </Story>
      </StoriesContent>
    </Stories>,
  )
}

test("故事条显示标题", () => {
  const view = renderStory()
  expect(screen.getByText("夜航")).toBeInTheDocument()
  expect(slot(view.container, "story")).toHaveAttribute("data-reduced", "false")
})

test("故事条在减弱动效下仍显示标题", () => {
  reduceMotion = true
  const view = renderStory()
  expect(screen.getByText("夜航")).toBeInTheDocument()
  expect(slot(view.container, "story")).toHaveAttribute("data-reduced", "true")
})

const reels = [
  { id: "night", type: "image" as const, src: pixel, duration: 4, title: "夜航", alt: "夜航" },
  { id: "light", type: "image" as const, src: pixel, duration: 4, title: "灯塔", alt: "灯塔" },
]

test("短片自动播放时可以暂停", () => {
  const view = render(
    <Reel autoPlay data={reels} defaultIndex={0} defaultMuted>
      <ReelPlayButton />
    </Reel>,
  )
  fireEvent.click(screen.getByRole("button", { name: "暂停" }))
  expect(screen.getByRole("button", { name: "播放" })).toBeInTheDocument()
  expect(slot(view.container, "reel")).toHaveAttribute("data-reduced", "false")
})

test("短片在减弱动效下仍能切换播放", () => {
  reduceMotion = true
  const view = render(
    <Reel autoPlay data={reels} defaultIndex={0} defaultMuted>
      <ReelPlayButton />
    </Reel>,
  )
  fireEvent.click(screen.getByRole("button", { name: "暂停" }))
  expect(screen.getByRole("button", { name: "播放" })).toBeInTheDocument()
  expect(slot(view.container, "reel")).toHaveAttribute("data-reduced", "true")
})

test("渐隐图片使用替代文字", () => {
  const view = render(<ImageFade alt="渐隐的风景" direction="up" fadeSize={20} src={pixel} />)
  expect(screen.getByRole("img", { name: "渐隐的风景" })).toBeInTheDocument()
  expect(slot(view.container, "image-fade")).toHaveAttribute("data-reduced", "false")
})

test("渐隐图片在减弱动效下仍显示", () => {
  reduceMotion = true
  const view = render(<ImageFade alt="渐隐的风景" direction="up" fadeSize={20} src={pixel} />)
  expect(screen.getByRole("img", { name: "渐隐的风景" })).toBeInTheDocument()
  expect(slot(view.container, "image-fade")).toHaveAttribute("data-reduced", "true")
})

const tabs = [
  { id: "north", title: "北岸", description: "灯塔在雾里只剩一圈光。", imageUrl: pixel, imageAlt: "北岸" },
  { id: "tide", title: "潮汐", description: "退潮后石头还是湿的。", imageUrl: pixel, imageAlt: "潮汐" },
]

function TabsHarness() {
  const [value, setValue] = useState("north")
  return <ImageTabs onValueChange={setValue} tabs={tabs} value={value} />
}

test("图文标签可以切换", () => {
  const view = render(<TabsHarness />)
  fireEvent.click(screen.getByRole("tab", { name: /潮汐/ }))
  expect(screen.getByRole("tab", { name: /潮汐/ })).toHaveAttribute("aria-selected", "true")
  expect(slot(view.container, "image-tabs")).toHaveAttribute("data-reduced", "false")
})

test("图文标签在减弱动效下仍能切换", () => {
  reduceMotion = true
  const view = render(<TabsHarness />)
  fireEvent.click(screen.getByRole("tab", { name: /潮汐/ }))
  expect(screen.getByRole("tab", { name: /潮汐/ })).toHaveAttribute("aria-selected", "true")
  expect(slot(view.container, "image-tabs")).toHaveAttribute("data-reduced", "true")
})

const slides = [{ value: "bridge", title: "桥", description: "夜里的桥只剩下灯。", imageUrl: pixel, imageAlt: "桥" }]

test("进度轮播显示初始幻灯片", () => {
  const view = render(<ProgressiveCarousel defaultActive="bridge" duration={4000} fastDuration={400} slides={slides} />)
  expect(screen.getByText("桥")).toBeInTheDocument()
  expect(slot(view.container, "progressive-carousel")).toHaveAttribute("data-reduced", "false")
})

test("进度轮播在减弱动效下仍显示初始幻灯片", () => {
  reduceMotion = true
  const view = render(<ProgressiveCarousel defaultActive="bridge" duration={4000} fastDuration={400} slides={slides} />)
  expect(screen.getByText("桥")).toBeInTheDocument()
  expect(slot(view.container, "progressive-carousel")).toHaveAttribute("data-reduced", "true")
})

test("悬停揭示显示标签", () => {
  const view = render(<HoverImageReveal items={[{ alt: "从容", img: pixel, label: "保持从容" }]} />)
  expect(screen.getByText("保持从容")).toBeInTheDocument()
  expect(slot(view.container, "hover-image-reveal")).toHaveAttribute("data-reduced", "false")
})

test("悬停揭示在减弱动效下仍显示标签", () => {
  reduceMotion = true
  const view = render(<HoverImageReveal items={[{ alt: "从容", img: pixel, label: "保持从容" }]} />)
  expect(screen.getByText("保持从容")).toBeInTheDocument()
  expect(slot(view.container, "hover-image-reveal")).toHaveAttribute("data-reduced", "true")
})

test("详情列表显示术语", () => {
  const view = render(<DetailsList items={[{ term: "称呼", detail: "先生" }]} />)
  expect(screen.getByText("称呼")).toBeInTheDocument()
  expect(slot(view.container, "details-list")).toHaveAttribute("data-reduced", "false")
})

test("详情列表在减弱动效下仍显示术语", () => {
  reduceMotion = true
  const view = render(<DetailsList items={[{ term: "称呼", detail: "先生" }]} />)
  expect(screen.getByText("称呼")).toBeInTheDocument()
  expect(slot(view.container, "details-list")).toHaveAttribute("data-reduced", "true")
})

const pieces = [
  { id: "kit", category: "motion", eyebrow: "界面套件", title: "一组界面收藏", imageUrl: pixel, imageAlt: "套件" },
  { id: "wire", category: "web", eyebrow: "线框", title: "一份免费的页面骨架", imageUrl: pixel, imageAlt: "骨架" },
]
const categories = [
  { id: "motion", label: "动画" },
  { id: "web", label: "网页" },
]

test("作品筛选切到网页", () => {
  const view = render(<PortfolioFilterGrid categories={categories} items={pieces} />)
  fireEvent.click(screen.getByRole("button", { name: "网页" }))
  expect(screen.getByRole("button", { name: "网页" })).toHaveAttribute("aria-pressed", "true")
  expect(screen.getByText("一份免费的页面骨架")).toBeInTheDocument()
  expect(slot(view.container, "portfolio-filter-grid")).toHaveAttribute("data-reduced", "false")
})

test("作品筛选在减弱动效下仍能切换", () => {
  reduceMotion = true
  const view = render(<PortfolioFilterGrid categories={categories} items={pieces} />)
  fireEvent.click(screen.getByRole("button", { name: "网页" }))
  expect(screen.getByRole("button", { name: "网页" })).toHaveAttribute("aria-pressed", "true")
  expect(slot(view.container, "portfolio-filter-grid")).toHaveAttribute("data-reduced", "true")
})

test("悬停画廊显示替代文字", () => {
  const view = render(<HoverGallery alt="画幅" images={[{ alt: "画幅", src: pixel }]} progress />)
  expect(screen.getByRole("img", { name: "画幅" })).toBeInTheDocument()
  expect(slot(view.container, "hover-gallery")).toHaveAttribute("data-reduced", "false")
})

test("悬停画廊在减弱动效下仍显示图片", () => {
  reduceMotion = true
  const view = render(<HoverGallery alt="画幅" images={[{ alt: "画幅", src: pixel }]} progress />)
  expect(screen.getByRole("img", { name: "画幅" })).toBeInTheDocument()
  expect(slot(view.container, "hover-gallery")).toHaveAttribute("data-reduced", "true")
})

test("精选画廊按标签过滤", () => {
  const view = render(
    <FeaturedGallery
      images={[
        { alt: "绿色球鞋", src: pixel, tags: ["鞋"] },
        { alt: "棕色手袋", src: pixel, tags: ["包"] },
      ]}
      tags={["鞋", "包"]}
    />,
  )
  fireEvent.click(screen.getByRole("button", { name: "鞋" }))
  expect(screen.getByRole("img", { name: "绿色球鞋" })).toBeInTheDocument()
  expect(screen.queryByRole("img", { name: "棕色手袋" })).not.toBeInTheDocument()
  expect(slot(view.container, "featured-gallery")).toHaveAttribute("data-reduced", "false")
})

test("精选画廊在减弱动效下仍能过滤", () => {
  reduceMotion = true
  const view = render(
    <FeaturedGallery
      images={[
        { alt: "绿色球鞋", src: pixel, tags: ["鞋"] },
        { alt: "棕色手袋", src: pixel, tags: ["包"] },
      ]}
      tags={["鞋", "包"]}
    />,
  )
  fireEvent.click(screen.getByRole("button", { name: "鞋" }))
  expect(screen.getByRole("button", { name: "鞋" })).toHaveAttribute("aria-pressed", "true")
  expect(slot(view.container, "featured-gallery")).toHaveAttribute("data-reduced", "true")
})

test("灯板用文字作为画布名称", () => {
  const view = render(<LightBoard disableDrawing={false} lightSize={8} rows={7} text="HELLO" />)
  expect(view.container.querySelector("canvas")).toHaveAttribute("aria-label", "HELLO")
  expect(slot(view.container, "lightboard")).toHaveAttribute("data-reduced", "false")
})

test("灯板在减弱动效下仍保留画布名称", () => {
  reduceMotion = true
  const view = render(<LightBoard disableDrawing={false} lightSize={8} rows={7} text="HELLO" />)
  expect(view.container.querySelector("canvas")).toHaveAttribute("aria-label", "HELLO")
  expect(slot(view.container, "lightboard")).toHaveAttribute("data-reduced", "true")
})

test("检查点显示标题和正文", () => {
  const view = render(<SecurityCheckpoint message="为了让浏览更顺畅，我们正在确认这个浏览器。" subtitle="安全核对" title="检查点" />)
  expect(screen.getByText("检查点")).toBeInTheDocument()
  expect(screen.getByText("安全核对")).toBeInTheDocument()
  expect(screen.getByText("为了让浏览更顺畅，我们正在确认这个浏览器。")).toBeInTheDocument()
  expect(slot(view.container, "security-checkpoint")).toHaveAttribute("data-reduced", "false")
})

test("检查点在减弱动效下仍显示标题", () => {
  reduceMotion = true
  const view = render(<SecurityCheckpoint message="为了让浏览更顺畅，我们正在确认这个浏览器。" subtitle="安全核对" title="检查点" />)
  expect(screen.getByText("检查点")).toBeInTheDocument()
  expect(slot(view.container, "security-checkpoint")).toHaveAttribute("data-reduced", "true")
})
