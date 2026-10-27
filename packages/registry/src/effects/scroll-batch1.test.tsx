// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react")
  return {
    ...actual,
    useScroll: () => ({
      scrollY: actual.useMotionValue(0),
      scrollYProgress: actual.useMotionValue(0),
    }),
  }
})

import { ContainerScroll3D } from "./container-scroll-3d"
import { Scroll3dImageRotate } from "./scroll-3d-image-rotate"
import { ScrollImageSequence } from "./scroll-image-sequence"
import { StickyGridScroll } from "./sticky-grid-scroll"
import { TracingBeam } from "./tracing-beam"
import { KeyholeScrollReveal } from "../sections/keyhole-scroll-reveal"

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
  vi.stubGlobal("requestAnimationFrame", () => 1)
  vi.stubGlobal("cancelAnimationFrame", () => {})
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
  Element.prototype.scrollTo = () => {}
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot="${name}"]`)
  expect(node).not.toBeNull()
  return node as HTMLElement
}

const frames = ["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"]


test("tracing beam shows its copy and starts the beam collapsed", () => {
  const { container } = render(
    <TracingBeam>
      <p>滚动点亮竖线。</p>
    </TracingBeam>,
  )
  expect(screen.getByText("滚动点亮竖线。")).toBeInTheDocument()
  expect(container.querySelector(".from-violet-400")).toHaveStyle({ height: "0%" })
})

test("tracing beam fills the beam when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(
    <TracingBeam>
      <p>滚动点亮竖线。</p>
    </TracingBeam>,
  )
  expect(screen.getByText("滚动点亮竖线。")).toBeInTheDocument()
  expect(container.querySelector(".from-violet-400")).toHaveStyle({ height: "100%" })
})

test("container scroll shows the title and the card", () => {
  render(
    <ContainerScroll3D title="滚动透视">
      <div>透视卡片</div>
    </ContainerScroll3D>,
  )
  expect(screen.getByText("滚动透视")).toBeInTheDocument()
  expect(screen.getByText("透视卡片")).toBeInTheDocument()
})

test("container scroll keeps the title when motion is reduced", () => {
  reduceMotion = true
  render(
    <ContainerScroll3D>
      <div>透视卡片</div>
    </ContainerScroll3D>,
  )
  expect(screen.getByText("滚动透视")).toBeInTheDocument()
  expect(screen.getByText("透视卡片")).toBeInTheDocument()
})

test("scroll image sequence shows the first frame and the caption", () => {
  const { container } = render(<ScrollImageSequence frames={frames} />)
  expect(container.querySelector("img")).toHaveAttribute("src", frames[0])
  expect(screen.getByText("滚动切换帧 · 灵感来自 Apple 产品页，原创实现")).toBeInTheDocument()
})

test("scroll image sequence keeps the first frame when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(<ScrollImageSequence frames={frames} />)
  expect(container.querySelector("img")).toHaveAttribute("src", frames[0])
  expect(screen.getByText("滚动切换帧 · 灵感来自 Apple 产品页，原创实现")).toBeInTheDocument()
})

test("sticky grid lists all nine tiles", () => {
  const { container } = render(<StickyGridScroll />)
  expect(screen.getByText("01")).toBeInTheDocument()
  expect(screen.getByText("09")).toBeInTheDocument()
  expect(slot(container, "sticky-grid-scroll")).toHaveAttribute("aria-label", "钉住的图片网格。滚动时两侧错位，中间图片放大到铺满。")
})

test("sticky grid keeps the tiles when motion is reduced", () => {
  reduceMotion = true
  render(<StickyGridScroll />)
  expect(screen.getByText("05")).toBeInTheDocument()
  expect(screen.getByText("09")).toBeInTheDocument()
})

test("scroll 3d rotate shows every card", () => {
  const { container } = render(<Scroll3dImageRotate />)
  expect(screen.getByText("01")).toBeInTheDocument()
  expect(screen.getByText("04")).toBeInTheDocument()
  expect(slot(container, "scroll-3d-image-rotate")).toHaveAttribute("aria-label", "滚动时色块绕竖直轴翻入再翻出。")
})

test("scroll 3d rotate keeps the cards when motion is reduced", () => {
  reduceMotion = true
  render(<Scroll3dImageRotate />)
  expect(screen.getByText("02")).toBeInTheDocument()
  expect(screen.getByText("03")).toBeInTheDocument()
})

test("keyhole scroll reveal starts at the first cue", () => {
  const { container } = render(<KeyholeScrollReveal />)
  expect(screen.getByText("门厅")).toBeInTheDocument()
  expect(screen.queryByText("长廊")).not.toBeInTheDocument()
  expect(slot(container, "keyhole-scroll-reveal")).toBeInTheDocument()
})

test("keyhole scroll reveal stacks every cue when motion is reduced", () => {
  reduceMotion = true
  render(<KeyholeScrollReveal />)
  expect(screen.getByText("门厅")).toBeInTheDocument()
  expect(screen.getByText("长廊")).toBeInTheDocument()
  expect(screen.getByText("庭院")).toBeInTheDocument()
})


