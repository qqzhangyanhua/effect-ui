// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { BlurVignette, BlurVignetteArticle } from "./blur-vignette"
import { HaloBadge } from "./halo-badge"
import { HatchDivider } from "./hatch-divider"
import { NeoStarShapes } from "./neo-star-shapes"
import { ShapeMask } from "./shape-mask"
import { SquiggleArrow } from "./squiggle-arrow"
import { StarRingOrbit } from "./star-ring-orbit"

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

function vignette() {
  return (
    <BlurVignette blur="6px" inset="20px" radius="24px">
      <BlurVignetteArticle>四周发虚</BlurVignetteArticle>
    </BlurVignette>
  )
}

test("虚化四周保留圆角和模糊", () => {
  const view = render(vignette())
  expect(screen.getByText("四周发虚")).toBeInTheDocument()
  expect(slot(view.container, "blur-vignette")).toHaveStyle({ borderRadius: "24px" })
  expect(slot(view.container, "blur-vignette-article").getAttribute("style") ?? "").toContain("blur(6px)")
  expect(slot(view.container, "blur-vignette")).toHaveAttribute("data-reduced", "false")
})

test("虚化四周在减弱动效下去掉模糊", () => {
  reduceMotion = true
  const view = render(vignette())
  const root = slot(view.container, "blur-vignette")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(slot(view.container, "blur-vignette-article").getAttribute("style") ?? "").toContain("blur(0px)")
})

test("斜线分隔使用主题色", () => {
  const view = render(<HatchDivider />)
  const root = slot(view.container, "hatch-divider")
  expect(root.getAttribute("style") ?? "").toContain("var(--border)")
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("斜线分隔在减弱动效下仍用主题色", () => {
  reduceMotion = true
  const view = render(<HatchDivider />)
  const root = slot(view.container, "hatch-divider")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root.getAttribute("style") ?? "").toContain("var(--border)")
})

test("形状遮罩裁成心形", () => {
  const view = render(
    <ShapeMask as="div" shape="heart">
      <span>心</span>
    </ShapeMask>,
  )
  const root = slot(view.container, "shape-mask")
  expect(root.tagName).toBe("DIV")
  expect(root).toHaveAttribute("data-shape", "heart")
  expect(screen.getByText("心")).toBeInTheDocument()
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("形状遮罩在减弱动效下仍显示文字", () => {
  reduceMotion = true
  const view = render(
    <ShapeMask as="div" shape="heart">
      <span>心</span>
    </ShapeMask>,
  )
  expect(slot(view.container, "shape-mask")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("心")).toBeInTheDocument()
})

test("光晕徽章读出在线并带状态点", () => {
  const view = render(
    <div>
      <HaloBadge layout live variant="default">
        在线
      </HaloBadge>
      <HaloBadge tabularNums variant="secondary">
        8
      </HaloBadge>
      <HaloBadge variant="destructive">注意</HaloBadge>
    </div>,
  )
  const badges = view.container.querySelectorAll("[data-slot=halo-badge]")
  expect(badges).toHaveLength(3)
  expect(badges[0]).toHaveAttribute("data-reduced", "false")
  expect(badges[0]?.querySelector("[data-part=live]")).not.toBeNull()
  expect(screen.getByText("在线")).toBeInTheDocument()
  expect(screen.getByText("8")).toBeInTheDocument()
  expect(screen.getByText("注意")).toBeInTheDocument()
})

test("光晕徽章在减弱动效下仍显示状态点", () => {
  reduceMotion = true
  const view = render(
    <HaloBadge layout live variant="default">
      在线
    </HaloBadge>,
  )
  const root = slot(view.container, "halo-badge")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root.querySelector("[data-part=live]")).not.toBeNull()
})

test("手绘箭头第一支向右，另外两支保持原样", () => {
  const view = render(
    <div>
      <SquiggleArrow direction="right" label="波浪箭头" variant="wavy" />
      <SquiggleArrow direction="up" variant="bouncy" />
      <SquiggleArrow direction="left" variant="smooth" />
    </div>,
  )
  const arrows = view.container.querySelectorAll("[data-slot=squiggle-arrow]")
  expect(arrows).toHaveLength(3)
  expect(arrows[0]).toHaveAttribute("data-direction", "right")
  expect(arrows[0]).toHaveAttribute("data-variant", "wavy")
  expect(arrows[0]).toHaveAttribute("aria-label", "波浪箭头")
  expect(arrows[1]).toHaveAttribute("data-direction", "up")
  expect(arrows[2]).toHaveAttribute("data-direction", "left")
  expect(arrows[0]).toHaveAttribute("data-reduced", "false")
})

test("手绘箭头在减弱动效下仍读出名称", () => {
  reduceMotion = true
  render(<SquiggleArrow direction="right" label="波浪箭头" variant="wavy" />)
  expect(screen.getByRole("img", { name: "波浪箭头" })).toHaveAttribute("data-reduced", "true")
})

test("星环挂上 12 颗星", () => {
  const view = render(
    <StarRingOrbit color="#05e17a" count={12} size={42}>
      <h2>围着标题转</h2>
    </StarRingOrbit>,
  )
  const root = slot(view.container, "star-ring-orbit")
  expect(screen.getByRole("heading", { name: "围着标题转" })).toBeInTheDocument()
  expect(root.querySelectorAll("[data-part=star]")).toHaveLength(12)
  expect(root.querySelector("[data-part=star] svg")).toHaveAttribute("width", "42")
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("星环在减弱动效下停住", () => {
  reduceMotion = true
  const view = render(
    <StarRingOrbit color="#05e17a" count={12} size={42}>
      <h2>围着标题转</h2>
    </StarRingOrbit>,
  )
  const root = slot(view.container, "star-ring-orbit")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root.querySelectorAll("[data-part=star]")).toHaveLength(12)
})

test("星星形状画出预览的三颗", () => {
  const view = render(
    <div>
      <NeoStarShapes color="#05e17a" shape={1} size={72} stroke="#111111" strokeWidth={3} />
      <NeoStarShapes color="#05e17a" shape={19} size={72} stroke="#111111" strokeWidth={3} />
      <NeoStarShapes color="#05e17a" shape={32} size={72} stroke="#111111" strokeWidth={3} />
    </div>,
  )
  const stars = view.container.querySelectorAll("[data-slot=neo-star-shapes]")
  expect(stars).toHaveLength(3)
  expect(stars[0]).toHaveAttribute("data-shape", "1")
  expect(stars[0]).toHaveAttribute("width", "72")
  expect(stars[1]).toHaveAttribute("data-shape", "19")
  expect(stars[2]).toHaveAttribute("data-shape", "32")
  expect(stars[0]).toHaveAttribute("data-reduced", "false")
})

test("星星形状在减弱动效下仍保留编号", () => {
  reduceMotion = true
  const view = render(<NeoStarShapes color="#05e17a" shape={1} size={72} stroke="#111111" strokeWidth={3} />)
  const root = slot(view.container, "neo-star-shapes")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).toHaveAttribute("data-shape", "1")
})
