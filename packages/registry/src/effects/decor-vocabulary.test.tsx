// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { BurstIcons } from "./burst-icons"
import { ClickSpark } from "./click-spark"
import { ConfettiBurst } from "./confetti-burst"
import { ElectricBorder } from "./electric-border"
import { Sparkles } from "./sparkles"

const CONFETTI = ["#a78bfa", "#22d3ee", "#f472b6", "#facc15", "#34d399"]
const BURST = ["#f43f5e", "#f59e0b", "#22d3ee", "#a78bfa"]

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

function styleOf(node: Element | null) {
  return node?.getAttribute("style") ?? ""
}

function markup(node: Element) {
  return node.outerHTML.replace(/ id="[^"]*"/g, "").replace(/url\(#electric-[^)]*\)/g, "url(#electric)")
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
  const confetti = render(<ConfettiBurst>庆祝</ConfettiBurst>)
  const confettiSame = render(
    <ConfettiBurst pieces={18} duration={800} scale={1} colors={CONFETTI}>
      庆祝
    </ConfettiBurst>,
  )
  expect(markup(confettiSame.container)).toBe(markup(confetti.container))

  const sparkles = render(<Sparkles>星</Sparkles>)
  const sparklesSame = render(<Sparkles count={8} duration={1400} delay={120} size={4}>星</Sparkles>)
  expect(markup(sparklesSame.container)).toBe(markup(sparkles.container))

  const burst = render(<BurstIcons />)
  const burstSame = render(<BurstIcons count={10} colors={BURST} duration={700} scale={1} size={16} />)
  expect(markup(burstSame.container)).toBe(markup(burst.container))

  const edge = render(<ElectricBorder />)
  const edgeSame = render(<ElectricBorder color="#67e8f9" speed={1} scale={1} intensity={1} />)
  expect(markup(edgeSame.container)).toBe(markup(edge.container))

  const spark = render(<ClickSpark />)
  const sparkSame = render(<ClickSpark count={12} duration={450} scale={1} size={12} />)
  expect(markup(sparkSame.container)).toBe(markup(spark.container))
})

test("新 prop 写进 class 或 style", () => {
  vi.spyOn(Math, "random").mockReturnValue(0)
  const confetti = render(<ConfettiBurst pieces={4} duration={400} scale={2} colors={["#112233", "#112233", "#112233", "#112233", "#112233"]} />)
  fireEvent.click(confetti.getByRole("button"))
  const bits = confetti.container.querySelectorAll(".size-2")
  expect(bits).toHaveLength(4)
  expect(styleOf(bits[0] ?? null)).toContain("400ms")
  expect(styleOf(bits[0] ?? null)).toContain("-180px")
  expect(styleOf(bits[0] ?? null)).toContain("-80px")
  expect(styleOf(bits[0] ?? null)).toContain("rgb(17, 34, 51)")

  const sparkles = render(<Sparkles count={3} duration={800} delay={0} size={10} color="#112233">星</Sparkles>)
  const points = sparkles.container.querySelectorAll(".rounded-full")
  expect(points).toHaveLength(3)
  expect(points[0]).not.toHaveClass("size-1")
  expect(points[0]).not.toHaveClass("bg-amber-300")
  expect(points[0]).toHaveClass("motion-reduce:animate-none")
  expect(styleOf(points[0] ?? null)).toContain("0.8s")
  expect(styleOf(points[1] ?? null)).toContain("0ms")
  expect(styleOf(points[0] ?? null)).toContain("10px")
  expect(styleOf(points[0] ?? null)).toContain("rgb(17, 34, 51)")

  const burst = render(<BurstIcons count={4} size={24} colors={["#112233", "#112233", "#112233", "#112233"]} />)
  fireEvent.click(burst.getByRole("button", { name: "爆发" }))
  const icons = burst.container.querySelectorAll("svg")
  expect(icons).toHaveLength(4)
  expect(icons[0]).not.toHaveClass("size-4")
  expect(styleOf(icons[0] ?? null)).toContain("24px")

  const edge = render(<ElectricBorder color="#112233" scale={2} intensity={0.5} speed={1.6} />)
  const rect = edge.container.querySelector("rect")
  const shift = edge.container.querySelector("feDisplacementMap")
  expect(rect).toHaveAttribute("stroke", "#112233")
  expect(shift).toHaveAttribute("scale", "28")
  expect(styleOf(rect)).toContain("4px")
  expect(styleOf(rect)).toContain("#112233")
  expect(edge.container.querySelector("feTurbulence")).toHaveAttribute("baseFrequency", "0.01 0.04")

  const spark = render(<ClickSpark count={5} size={20} color="#112233" duration={700} scale={1.6} />)
  fireEvent.pointerDown(spark.getByText("点击任意处"), { clientX: 12, clientY: 8 })
  const lines = spark.container.querySelectorAll(".origin-left")
  expect(lines).toHaveLength(5)
  expect(lines[0]).not.toHaveClass("w-3")
  expect(lines[0]).not.toHaveClass("bg-amber-200")
  expect(styleOf(lines[0] ?? null)).toContain("20px")
  expect(styleOf(lines[0] ?? null)).toContain("rgb(17, 34, 51)")
})

test("减弱动效时不飞出彩纸和火花", () => {
  installMatchMedia(true)
  const confetti = render(<ConfettiBurst pieces={8} duration={400} />)
  fireEvent.click(confetti.getByRole("button"))
  expect(confetti.container.querySelectorAll(".size-2")).toHaveLength(0)

  const spark = render(<ClickSpark count={8} />)
  fireEvent.pointerDown(spark.getByText("点击任意处"), { clientX: 4, clientY: 4 })
  expect(spark.container.querySelectorAll(".origin-left")).toHaveLength(0)

  const edge = render(<ElectricBorder speed={2} />)
  expect(edge.container.querySelector("feTurbulence")).toHaveAttribute("baseFrequency", "0.01 0.04")

  const burst = render(<BurstIcons count={4} />)
  fireEvent.click(burst.getByRole("button", { name: "爆发" }))
  expect(burst.getByRole("button", { name: "爆发" })).toBeInTheDocument()
})
