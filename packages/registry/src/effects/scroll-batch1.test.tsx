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

import { ApertureReveal } from "./aperture-reveal"
import { ContainerScroll3D } from "./container-scroll-3d"
import { ElementAlongPathItem, ElementAlongSvgPath } from "./element-along-svg-path"
import { KineticTypeScroll } from "./kinetic-type-scroll"
import { Scroll3dImageRotate } from "./scroll-3d-image-rotate"
import { ScrollAndSwapText } from "./scroll-and-swap-text"
import { ScrollBlurText } from "./scroll-blur-text"
import { ScrollImageReveal } from "./scroll-image-reveal"
import { ScrollImageSequence } from "./scroll-image-sequence"
import { SkewedInfiniteScroll } from "./skewed-infinite-scroll"
import { StickyGridScroll } from "./sticky-grid-scroll"
import { TimelineReveal } from "./timeline-reveal"
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
const picture = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
const skewItems = [
  { id: "1", text: "夜航" },
  { id: "2", text: "北窗" },
]

function aperture() {
  return (
    <ApertureReveal length={2.2} viewportHeight={420}>
      <ApertureReveal.Media>
        <div>照片</div>
      </ApertureReveal.Media>
      <ApertureReveal.Headline>
        <ApertureReveal.Lead>打开</ApertureReveal.Lead>
        <ApertureReveal.Opening />
        <ApertureReveal.Trail>光圈</ApertureReveal.Trail>
      </ApertureReveal.Headline>
      <ApertureReveal.Caption>
        <ApertureReveal.Text>镜头随滚动张开，照片填满画面。</ApertureReveal.Text>
      </ApertureReveal.Caption>
    </ApertureReveal>
  )
}

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

test("aperture reveal shows the headline inside a scroll box", () => {
  const { container } = render(aperture())
  expect(screen.getByText("打开")).toBeInTheDocument()
  expect(screen.getByText("光圈")).toBeInTheDocument()
  expect(slot(container, "aperture-reveal")).toHaveAttribute("data-contained", "")
  expect(slot(container, "aperture-reveal")).not.toHaveAttribute("data-static")
})

test("aperture reveal lays the copy out when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(aperture())
  expect(screen.getAllByText("镜头随滚动张开，照片填满画面。")).toHaveLength(2)
  expect(screen.getByRole("heading", { name: /打开/ })).toBeInTheDocument()
  expect(slot(container, "aperture-reveal")).toHaveAttribute("data-static", "")
  expect(slot(container, "aperture-reveal")).not.toHaveAttribute("data-contained")
})

test("kinetic type scroll reads the words in order", () => {
  const { container } = render(<KineticTypeScroll words={["北", "窗", "夜", "航"]} />)
  expect(screen.getByText("北 窗 夜 航")).toBeInTheDocument()
  expect(screen.getAllByText("北").length).toBeGreaterThan(0)
  expect(slot(container, "kinetic-type-scroll")).toHaveAttribute("data-reduced", "false")
})

test("kinetic type scroll marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(<KineticTypeScroll words={["北", "窗", "夜", "航"]} />)
  expect(screen.getByText("航")).toBeInTheDocument()
  expect(slot(container, "kinetic-type-scroll")).toHaveAttribute("data-reduced", "true")
})

test("scroll image reveal shows the picture in a rounded frame", () => {
  const { container } = render(<ScrollImageReveal alt="靛蓝夜空" direction="left" mask="wipe" parallax={60} src={picture} />)
  expect(screen.getByRole("img", { name: "靛蓝夜空" })).toBeInTheDocument()
  expect(slot(container, "scroll-image-reveal")).toHaveClass("rounded-2xl")
  expect(slot(container, "scroll-image-reveal")).toHaveAttribute("data-reduced", "false")
})

test("scroll image reveal marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(<ScrollImageReveal alt="靛蓝夜空" src={picture} />)
  expect(screen.getByRole("img", { name: "靛蓝夜空" })).toBeInTheDocument()
  expect(slot(container, "scroll-image-reveal")).toHaveAttribute("data-reduced", "true")
})

test("scroll and swap text shows the phrase", () => {
  const { container } = render(<ScrollAndSwapText>北窗换字</ScrollAndSwapText>)
  expect(screen.getAllByText("北窗换字").length).toBeGreaterThan(0)
  expect(slot(container, "scroll-and-swap-text").tagName).toBe("SPAN")
  expect(slot(container, "scroll-and-swap-text")).toHaveAttribute("data-reduced", "false")
})

test("scroll and swap text keeps one static phrase when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(<ScrollAndSwapText>北窗换字</ScrollAndSwapText>)
  expect(screen.getAllByText("北窗换字").length).toBeGreaterThan(0)
  expect(slot(container, "scroll-and-swap-text")).toHaveAttribute("data-reduced", "true")
})

test("skewed infinite scroll duplicates each item", () => {
  const { container } = render(<SkewedInfiniteScroll columns={2} items={skewItems} speed={18} />)
  expect(screen.getAllByText("夜航")).toHaveLength(2)
  expect(screen.getAllByText("北窗")).toHaveLength(2)
  expect(slot(container, "skewed-infinite-scroll")).toHaveAttribute("data-reduced", "false")
})

test("skewed infinite scroll stops the loop when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(<SkewedInfiniteScroll columns={2} items={skewItems} speed={18} />)
  expect(screen.getAllByText("夜航")).toHaveLength(2)
  expect(container.querySelector("[style*='animation-name']")).toHaveStyle({ animationName: "none" })
  expect(slot(container, "skewed-infinite-scroll")).toHaveAttribute("data-reduced", "true")
})

test("element along a path draws the curve and both dots", () => {
  const { container } = render(
    <ElementAlongSvgPath animationType="auto" direction="normal" duration={4} path="M10 80 C 30 10, 70 10, 90 80" showPath>
      <ElementAlongPathItem>
        <span>甲</span>
      </ElementAlongPathItem>
      <ElementAlongPathItem startOffset={30}>
        <span>乙</span>
      </ElementAlongPathItem>
    </ElementAlongSvgPath>,
  )
  expect(screen.getByText("甲")).toBeInTheDocument()
  expect(screen.getByText("乙")).toBeInTheDocument()
  expect(container.querySelector("path")).toHaveAttribute("stroke", "currentColor")
  expect(slot(container, "element-along-svg-path")).toHaveAttribute("data-reduced", "false")
})

test("element along a path marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(
    <ElementAlongSvgPath path="M10 80 C 30 10, 70 10, 90 80" showPath>
      <ElementAlongPathItem>
        <span>甲</span>
      </ElementAlongPathItem>
    </ElementAlongSvgPath>,
  )
  expect(screen.getByText("甲")).toBeInTheDocument()
  expect(slot(container, "element-along-svg-path")).toHaveAttribute("data-reduced", "true")
})

test("timeline reveal shows the first line as a div", () => {
  const { container } = render(
    <TimelineReveal animationNum={0} as="div" once>
      先读许可
    </TimelineReveal>,
  )
  expect(screen.getByText("先读许可").tagName).toBe("DIV")
  expect(slot(container, "timeline-reveal")).toHaveAttribute("data-reduced", "false")
})

test("timeline reveal marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(<TimelineReveal>先读许可</TimelineReveal>)
  expect(screen.getByText("先读许可")).toBeInTheDocument()
  expect(slot(container, "timeline-reveal")).toHaveAttribute("data-reduced", "true")
})

test("scroll blur text renders a heading from the words", () => {
  const { container } = render(<ScrollBlurText as="h2" direction="down" text="按词出现的一行句子" />)
  expect(screen.getByRole("heading", { level: 2, name: "按词出现的一行句子" })).toBeInTheDocument()
  expect(slot(container, "scroll-blur-text")).toHaveAttribute("data-state", "visible")
  expect(slot(container, "scroll-blur-text")).toHaveAttribute("data-reduced", "false")
})

test("scroll blur text marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(<ScrollBlurText text="按词出现的一行句子" />)
  expect(screen.getByRole("heading", { name: "按词出现的一行句子" })).toBeInTheDocument()
  expect(slot(container, "scroll-blur-text")).toHaveAttribute("data-reduced", "true")
})
