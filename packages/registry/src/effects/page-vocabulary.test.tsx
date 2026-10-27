// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { PixelTransition } from "./pixel-transition"
import { ViewTransitionGallery } from "../ui/view-transition-gallery"


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
})

test("改值会改变能看见的标记", () => {
        
  const pixel = render(<PixelTransition from="/a.png" to="/b.png" count={16} duration={800} delay={40} />)
  expect(pixel.container.innerHTML).toContain("repeat(4, 1fr)")
  expect(pixel.container.innerHTML).not.toContain("duration-500")
  expect(pixel.container.innerHTML).toContain("800ms")

  const gallery = render(<ViewTransitionGallery gap={20} size={80} />)
  expect(gallery.container.innerHTML).not.toContain("gap-3")
  expect(gallery.container.innerHTML).not.toContain("h-28")
  expect(gallery.container.innerHTML).toContain("80px")
})

test("减弱动效时渲染不抛错", () => {
  installMatchMedia(true)
    render(<PixelTransition from="/a.png" to="/b.png" />)
  render(<ViewTransitionGallery />)
})
