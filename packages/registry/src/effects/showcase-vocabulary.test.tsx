// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import * as React from "react"

import { AnimatedBeam } from "./animated-beam"

import { AudioSpectrum } from "./audio-spectrum"
import { DomeGallery } from "./dome-gallery"

import { FireworksShow } from "./fireworks-show"
import { GlobeSphere } from "./globe-sphere"
import { IconCloud } from "./icon-cloud"
import { InfiniteCanvasGallery } from "./infinite-canvas-gallery"

import { LiquidMorphSlideshow } from "./liquid-morph-slideshow"
import { LoomThreadsMarquee } from "./loom-threads-marquee"
import { Marquee } from "./marquee"
import { MarqueeAlongSvgPath } from "./marquee-along-svg-path"
import { OrbitingCircles } from "./orbiting-circles"
import { OrbitingItems3D } from "./orbiting-items-3d"
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

function Beam({
  pathWidth,
  duration,
  delay,
}: {
  pathWidth?: number
  duration?: number
  delay?: number
}) {
  const container = React.useRef<HTMLDivElement>(null)
  const from = React.useRef<HTMLDivElement>(null)
  const to = React.useRef<HTMLDivElement>(null)
  return (
    <div ref={container}>
      <span ref={from}>A</span>
      <span ref={to}>B</span>
      <AnimatedBeam
        containerRef={container}
        fromRef={from}
        toRef={to}
        pathWidth={pathWidth}
        duration={duration}
        delay={delay}
      />
    </div>
  )
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
  const marquee = render(<Marquee>灯</Marquee>)
  const marqueeSame = render(
    <Marquee pauseOnHover reverse={false} repeat={2} duration={28000} gap={16}>
      灯
    </Marquee>,
  )
  expect(markup(marqueeSame.container)).toBe(markup(marquee.container))

  const orbit = render(
    <OrbitingCircles>
      <span>A</span>
    </OrbitingCircles>,
  )
  const orbitSame = render(
    <OrbitingCircles radius={80} duration={12} size={32}>
      <span>A</span>
    </OrbitingCircles>,
  )
  expect(markup(orbitSame.container)).toBe(markup(orbit.container))

  const globe = render(<GlobeSphere />)
  const globeSame = render(<GlobeSphere dots={48} duration={16000} size={192} />)
  expect(markup(globeSame.container)).toBe(markup(globe.container))

  const cloud = render(<IconCloud icons={[<span key="a">A</span>]} />)
  const cloudSame = render(<IconCloud icons={[<span key="a">A</span>]} duration={18000} size={90} scale={1} />)
  expect(markup(cloudSame.container)).toBe(markup(cloud.container))

  const beam = render(<Beam />)
  const beamSame = render(<Beam pathWidth={2} duration={5} delay={0} />)
  expect(markup(beamSame.container)).toBe(markup(beam.container))

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
  const marquee = render(
    <Marquee duration={14000} gap={8} repeat={4}>
      灯
    </Marquee>,
  )
  expect(marquee.container.querySelector("[data-slot=marquee]")?.className).toContain("[--duration:14000ms]")
  expect(marquee.container.querySelector("[data-slot=marquee]")?.className).toContain("[--gap:8px]")
  expect(marquee.container.querySelectorAll("[data-slot=marquee] > div")).toHaveLength(4)

  const orbit = render(
    <OrbitingCircles radius={48} duration={8} size={20}>
      <span>A</span>
    </OrbitingCircles>,
  )
  const icon = orbit.container.querySelectorAll("[data-slot=orbiting-circles] > span")[1]
  expect(icon?.getAttribute("style")).toContain("8s")
  expect(icon?.getAttribute("style")).toContain("width: 20px")
  expect(orbit.container.querySelector("[data-slot=orbiting-circles] > span")?.getAttribute("style")).toContain("48px")

  const globe = render(<GlobeSphere dots={12} duration={8000} size={120} color="#112233" />)
  expect(globe.container.querySelectorAll("[data-slot=globe-sphere] > span")).toHaveLength(12)
  expect(globe.container.querySelector("[data-slot=globe-sphere]")?.getAttribute("style")).toContain("width: 120px")
  expect(globe.container.querySelector("[data-slot=globe-sphere] > div")?.className).toContain("globe-spin_8000ms")
  expect(globe.container.querySelector("[data-slot=globe-sphere] > span")?.getAttribute("style")).toContain("rgb(17, 34, 51)")

  const cloud = render(<IconCloud icons={[<span key="a">A</span>]} duration={9000} size={120} scale={2} />)
  expect(cloud.container.firstElementChild?.firstElementChild?.className).toContain("icon-orbit_9000ms")
  const chip = cloud.container.querySelector("div div div div")
  expect(chip?.getAttribute("style")).toContain("width: 72px")
  expect(chip?.className).not.toContain("size-9")

  const beam = render(<Beam pathWidth={6} />)
  expect(beam.container.querySelector("path")?.getAttribute("stroke-width")).toBe("6")

  const dome = render(<DomeGallery count={8} size={120} />)
  expect(dome.container.querySelectorAll("button")).toHaveLength(8)
  expect(dome.container.querySelector("button")?.getAttribute("style")).toContain("translateZ(120px)")

  const gallery = render(<InfiniteCanvasGallery size={100} />)
  expect(gallery.container.querySelector("[style*='width: 100px']")).toBeTruthy()

  const sortable = render(<SortableList gap={16} />)
  expect(sortable.container.querySelector("ul")?.getAttribute("style")).toContain("gap: 16px")

  installMatchMedia(true)
  const ring = render(<OrbitingItems3D size={140} />)
  expect(ring.container.querySelector("span span, span")?.getAttribute("style") ?? ring.container.innerHTML).toContain("140px")
})

test("减弱动效时仍能挂上，画布组件不抛错", () => {
  installMatchMedia(true)
  expect(() => render(<DomeGallery />)).not.toThrow()
  expect(() => render(<OrbitingItems3D speed={1} size={108} />)).not.toThrow()
  expect(() => render(<ProximityScaleGrid count={10} size={2} speed={1} intensity={1} />)).not.toThrow()
  expect(() => render(<FireworksShow colors={FIREWORKS} auto intensity={1} />)).not.toThrow()
  expect(() => render(<LoomThreadsMarquee speed={1} />)).not.toThrow()
  expect(() => render(<LiquidMorphSlideshow interval={3200} intensity={0.45} speed={1} />)).not.toThrow()
  expect(() => render(<AudioSpectrum mode="bars" size={48} />)).not.toThrow()
  expect(() => render(<MarqueeAlongSvgPath baseVelocity={8} repeat={2} showPath>字</MarqueeAlongSvgPath>)).not.toThrow()
  expect(render(<ThumbnailFlowPath />).container.querySelector(".gap-3")).toBeTruthy()
})
