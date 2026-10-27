// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"


import { AudioSpectrum } from "./audio-spectrum"
import { DomeGallery } from "./dome-gallery"

import { FireworksShow } from "./fireworks-show"
import { GlobeSphere } from "./globe-sphere"
import { InfiniteCanvasGallery } from "./infinite-canvas-gallery"

import { LiquidMorphSlideshow } from "./liquid-morph-slideshow"
import { LoomThreadsMarquee } from "./loom-threads-marquee"
import { ProximityScaleGrid } from "./proximity-scale-grid"
import { SortableList } from "./sortable-list"
import { ThumbnailFlowPath } from "./thumbnail-flow-path"


const FIREWORKS = ["#fde68a", "#fb7185", "#7dd3fc", "#c4b5fd", "#86efac"]

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
  return node.outerHTML.replace(/ id="[^"]*"/g, "").replace(/url\(#[^)]*\)/g, "url(#id)")
}


beforeEach(() => {
  installMatchMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  vi.stubGlobal("ResizeObserver", SilentObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test("起始值与不传的标记相同", () => {
      
      
  const globe = render(<GlobeSphere />)
  const globeSame = render(<GlobeSphere dots={48} duration={16000} size={192} />)
  expect(markup(globeSame.container)).toBe(markup(globe.container))

  const dome = render(<DomeGallery />)
  const domeSame = render(<DomeGallery count={20} speed={1} size={168} />)
  expect(markup(domeSame.container)).toBe(markup(dome.container))

  const canvas = render(<InfiniteCanvasGallery />)
  const canvasSame = render(<InfiniteCanvasGallery gap={168} size={160} />)
  expect(markup(canvasSame.container)).toBe(markup(canvas.container))

  const sortable = render(<SortableList />)
  const sortableSame = render(<SortableList gap={8} />)
  expect(markup(sortableSame.container)).toBe(markup(sortable.container))

  const thumbs = render(<ThumbnailFlowPath />)
  const thumbsSame = render(<ThumbnailFlowPath duration={1350} delay={120} size={64} gap={12} />)
  expect(markup(thumbsSame.container)).toBe(markup(thumbs.container))
})

test("新 prop 会改变能画出来的标记", () => {
        
          
  const globe = render(<GlobeSphere dots={12} duration={8000} size={120} color="#112233" />)
  expect(globe.container.querySelectorAll("[data-slot=globe-sphere] > span")).toHaveLength(12)
  expect(globe.container.querySelector("[data-slot=globe-sphere]")?.getAttribute("style")).toContain("width: 120px")
  expect(globe.container.querySelector("[data-slot=globe-sphere] > div")?.className).toContain("globe-spin_8000ms")
  expect(globe.container.querySelector("[data-slot=globe-sphere] > span")?.getAttribute("style")).toContain("rgb(17, 34, 51)")

  const dome = render(<DomeGallery count={8} size={120} />)
  expect(dome.container.querySelectorAll("button")).toHaveLength(8)
  expect(dome.container.querySelector("button")?.getAttribute("style")).toContain("translateZ(120px)")

  const gallery = render(<InfiniteCanvasGallery size={100} />)
  expect(gallery.container.querySelector("[style*='width: 100px']")).toBeTruthy()

  const sortable = render(<SortableList gap={16} />)
  expect(sortable.container.querySelector("ul")?.getAttribute("style")).toContain("gap: 16px")

  installMatchMedia(true)
    })

test("减弱动效时仍能挂上，画布组件不抛错", () => {
  installMatchMedia(true)
  expect(() => render(<DomeGallery />)).not.toThrow()
    expect(() => render(<ProximityScaleGrid count={10} size={2} speed={1} intensity={1} />)).not.toThrow()
  expect(() => render(<FireworksShow colors={FIREWORKS} auto intensity={1} />)).not.toThrow()
  expect(() => render(<LoomThreadsMarquee speed={1} />)).not.toThrow()
  expect(() => render(<LiquidMorphSlideshow interval={3200} intensity={0.45} speed={1} />)).not.toThrow()
  expect(() => render(<AudioSpectrum mode="bars" size={48} />)).not.toThrow()
    expect(render(<ThumbnailFlowPath />).container.querySelector(".gap-3")).toBeTruthy()
})
