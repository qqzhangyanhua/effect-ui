// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { SectionLogoCloud } from "./section-logo-cloud"
import { SectionAnimatedBento } from "./section-animated-bento"
import { HeroAnnotatedShowcase } from "./hero-annotated-showcase"
import { HeroWaveMaskGallery } from "./hero-wave-mask-gallery"
import { HeroInlineMascot } from "./hero-inline-mascot"
import { HeroOrbitNodes } from "./hero-orbit-nodes"
import { HeroSwirlAvatars } from "./hero-swirl-avatars"
import { FooterDotMatrixWordmark } from "./footer-dot-matrix-wordmark"
import { FooterSocialMarquee } from "./footer-social-marquee"
import { SectionStatsCornered } from "./section-stats-cornered"
import { SectionStatsBlob } from "./section-stats-blob"
import { SectionDottedFeatureTabs } from "./section-dotted-feature-tabs"
import { CtaRibbonSwoosh } from "./cta-ribbon-swoosh"
import { SectionTestimonialSplit } from "./section-testimonial-split"

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }))
  document.elementFromPoint = () => null
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => {}
  HTMLElement.prototype.releasePointerCapture = () => {}
  HTMLElement.prototype.scrollIntoView = () => {}
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("logo cloud shows a brand and a milestone", () => {
  render(<SectionLogoCloud />)
  expect(screen.getByRole("heading", { name: "被这些团队用在生产页" })).toBeInTheDocument()
  expect(screen.getAllByText("Northwind").length).toBeGreaterThan(0)
  expect(screen.getByRole("heading", { name: "开源 registry" })).toBeInTheDocument()
})


test("animated bento shows the install label", () => {
  render(<SectionAnimatedBento />)
  expect(screen.getByRole("heading", { name: "每个格子自己动" })).toBeInTheDocument()
  expect(screen.getByText("安装次数")).toBeInTheDocument()
  expect(screen.getByText("Launch")).toBeInTheDocument()
})

test("annotated showcase switches to the inbox", async () => {
  const user = userEvent.setup()
  render(<HeroAnnotatedShowcase />)
  expect(screen.getByRole("heading", { name: "把产品窗口摊开，再用手绘箭头标出来" })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "收件" }))
  expect(screen.getByText("北线更新")).toBeInTheDocument()
})

test("wave mask gallery shows the first tile", () => {
  render(<HeroWaveMaskGallery />)
  expect(screen.getByRole("heading", { name: "粗体标题压在波浪裁切的画面上" })).toBeInTheDocument()
  expect(screen.getByText("01")).toBeInTheDocument()
})

test("inline mascot sits between the words", () => {
  render(<HeroInlineMascot />)
  expect(screen.getByRole("heading")).toHaveTextContent("让标题")
  expect(screen.getByRole("heading")).toHaveTextContent("自己眨眼")
})

test("orbit nodes lists the first station", () => {
  render(<HeroOrbitNodes />)
  expect(screen.getByRole("heading", { name: "虚线椭圆轨道，每颗光球都连回中心" })).toBeInTheDocument()
  expect(screen.getByText("采集")).toBeInTheDocument()
})

test("swirl avatars shows a person", () => {
  render(<HeroSwirlAvatars />)
  expect(screen.getByRole("heading", { name: "漩涡底上漂着还在线的人" })).toBeInTheDocument()
  expect(screen.getByText("林夏")).toBeInTheDocument()
})

test("dot matrix wordmark names the word", () => {
  render(<FooterDotMatrixWordmark />)
  expect(screen.getByRole("img", { name: "FIELD" })).toBeInTheDocument()
  expect(screen.getByText("指针靠近时圆点散开，靠拢时又融成字。")).toBeInTheDocument()
})

test("social marquee records an email", async () => {
  const user = userEvent.setup()
  render(<FooterSocialMarquee />)
  expect(screen.getByText("FIELD")).toBeInTheDocument()
  await user.type(screen.getByRole("textbox", { name: "通讯邮件" }), "a@b.co")
  await user.click(screen.getByRole("button", { name: "订阅" }))
  expect(screen.getByRole("button", { name: "已记下" })).toBeInTheDocument()
})

test("cornered stats show the three labels", () => {
  render(<SectionStatsCornered />)
  expect(screen.getByText("SHIPPED")).toBeInTheDocument()
  expect(screen.getByText("UPTIME")).toBeInTheDocument()
  expect(screen.getByText("TEAMS")).toBeInTheDocument()
})

test("blob stats show the weekly number", () => {
  render(<SectionStatsBlob />)
  expect(screen.getByText("12k")).toBeInTheDocument()
  expect(screen.getByText("周活跃")).toBeInTheDocument()
})

test("dotted feature tabs switch to the list", async () => {
  const user = userEvent.setup()
  render(<SectionDottedFeatureTabs />)
  await user.click(screen.getByRole("button", { name: "列表" }))
  expect(screen.getByRole("heading", { name: "待处理的三条" })).toBeInTheDocument()
  expect(screen.getByText("对齐标题")).toBeInTheDocument()
})

test("ribbon swoosh shows the action title", () => {
  render(<CtaRibbonSwoosh />)
  expect(screen.getByRole("heading", { name: "一条色带扫进行动面板" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "继续" })).toBeInTheDocument()
})

test("testimonial split advances to the next quote", async () => {
  const user = userEvent.setup()
  render(<SectionTestimonialSplit />)
  expect(screen.getByText(/区块接上之后/)).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "下一条" }))
  expect(screen.getByText(/定价和页脚终于用同一套字号/)).toBeInTheDocument()
  expect(screen.getByText("周衡")).toBeInTheDocument()
})
