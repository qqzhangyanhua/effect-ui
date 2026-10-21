// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { CanvasReveal } from "./canvas-reveal"
import { DatamoshTransition } from "./datamosh-transition"
import { PageTransition } from "./page-transition"
import { PixelTransition } from "./pixel-transition"
import { RevealSection } from "./reveal-section"
import { Terminal } from "./terminal"
import { EcommerceBlocks } from "../ui/ecommerce-blocks"
import { ViewTransitionGallery } from "../ui/view-transition-gallery"

const LINES = ["pnpm install"]

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

function markup(node: Element) {
  return node.outerHTML
    .replace(/ id="[^"]*"/g, "")
    .replace(/url\(#[^)]*\)/g, "url(#id)")
    .replace(/chart-_r_[^"\]]+/g, "chart-id")
}

beforeEach(() => {
  installMatchMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  vi.stubGlobal("ResizeObserver", SilentObserver)
  vi.stubGlobal("requestAnimationFrame", () => 1)
  vi.stubGlobal("cancelAnimationFrame", () => {})
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test("起始值与不传的标记相同", () => {
  const page = render(<PageTransition transitionKey="a">甲</PageTransition>)
  const pageSame = render(
    <PageTransition transitionKey="a" duration={350} intensity={1}>
      甲
    </PageTransition>,
  )
  expect(markup(pageSame.container)).toBe(markup(page.container))

  const reveal = render(<RevealSection>甲</RevealSection>)
  const revealSame = render(
    <RevealSection delay={0} speed={1} intensity={1}>
      甲
    </RevealSection>,
  )
  expect(markup(revealSame.container)).toBe(markup(reveal.container))

  const terminal = render(<Terminal lines={LINES} />)
  const terminalSame = render(<Terminal lines={LINES} interval={700} />)
  expect(markup(terminalSame.container)).toBe(markup(terminal.container))

  const canvas = render(<CanvasReveal>甲</CanvasReveal>)
  const canvasSame = render(
    <CanvasReveal gap={10} speed={1} size={2.2} intensity={1} color="#09090b">
      甲
    </CanvasReveal>,
  )
  expect(markup(canvasSame.container)).toBe(markup(canvas.container))

  const pixel = render(<PixelTransition from="/a.png" to="/b.png" />)
  const pixelSame = render(<PixelTransition from="/a.png" to="/b.png" count={48} duration={500} delay={28} />)
  expect(markup(pixelSame.container)).toBe(markup(pixel.container))
  expect(pixel.container.innerHTML).toContain("duration-500")
  expect(pixel.container.innerHTML).toContain("repeat(12, 1fr)")

  const gallery = render(<ViewTransitionGallery />)
  const gallerySame = render(<ViewTransitionGallery gap={12} size={112} />)
  expect(markup(gallerySame.container)).toBe(markup(gallery.container))
  expect(gallery.container.innerHTML).toContain("gap-3")
  expect(gallery.container.innerHTML).toContain("h-28")

  const shop = render(<EcommerceBlocks />)
  const shopSame = render(<EcommerceBlocks view="store" />)
  expect(markup(shopSame.container)).toBe(markup(shop.container))

  installMatchMedia(true)
  const datamosh = render(<DatamoshTransition />)
  const datamoshSame = render(<DatamoshTransition speed={1} intensity={1} />)
  expect(markup(datamoshSame.container)).toBe(markup(datamosh.container))
})

test("改值会改变能看见的标记", () => {
  const terminal = render(<Terminal lines={LINES} color="#112233" />)
  const prompt = terminal.container.querySelector("pre span")
  expect(prompt?.className ?? "").not.toContain("text-emerald-400")
  expect(prompt?.getAttribute("style") ?? "").toContain("rgb(17, 34, 51)")

  const pixel = render(<PixelTransition from="/a.png" to="/b.png" count={16} duration={800} delay={40} />)
  expect(pixel.container.innerHTML).toContain("repeat(4, 1fr)")
  expect(pixel.container.innerHTML).not.toContain("duration-500")
  expect(pixel.container.innerHTML).toContain("800ms")

  const gallery = render(<ViewTransitionGallery gap={20} size={80} />)
  expect(gallery.container.innerHTML).not.toContain("gap-3")
  expect(gallery.container.innerHTML).not.toContain("h-28")
  expect(gallery.container.innerHTML).toContain("80px")

  const shop = render(<EcommerceBlocks view="checkout" />)
  expect(shop.container.textContent).toContain("地址")
  expect(shop.container.textContent).not.toContain("Holo Tee")
})

test("减弱动效时渲染不抛错", () => {
  installMatchMedia(true)
  render(<PageTransition transitionKey="a">甲</PageTransition>)
  render(<RevealSection>甲</RevealSection>)
  render(<Terminal lines={LINES} />)
  render(
    <CanvasReveal gap={10} speed={1} size={2.2} intensity={1}>
      甲
    </CanvasReveal>,
  )
  render(<PixelTransition from="/a.png" to="/b.png" />)
  render(<ViewTransitionGallery />)
  render(<DatamoshTransition speed={1} intensity={1} />)
})
