// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { ClickSpark } from "./click-spark"
import { ElectricBorder } from "./electric-border"


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
      
      
      
  const edge = render(<ElectricBorder />)
  const edgeSame = render(<ElectricBorder color="#67e8f9" speed={1} scale={1} intensity={1} />)
  expect(markup(edgeSame.container)).toBe(markup(edge.container))

  const spark = render(<ClickSpark />)
  const sparkSame = render(<ClickSpark count={12} duration={450} scale={1} size={12} />)
  expect(markup(sparkSame.container)).toBe(markup(spark.container))
})

test("新 prop 写进 class 或 style", () => {
  vi.spyOn(Math, "random").mockReturnValue(0)
                
                    
            
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
      
  const spark = render(<ClickSpark count={8} />)
  fireEvent.pointerDown(spark.getByText("点击任意处"), { clientX: 4, clientY: 4 })
  expect(spark.container.querySelectorAll(".origin-left")).toHaveLength(0)

  const edge = render(<ElectricBorder speed={2} />)
  expect(edge.container.querySelector("feTurbulence")).toHaveAttribute("baseFrequency", "0.01 0.04")

      })
