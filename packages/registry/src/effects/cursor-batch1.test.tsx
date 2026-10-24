// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { MagneticField } from "./magnetic-field"

import { RepetitionImageHover } from "./repetition-image-hover"
import { SmoothCursor } from "./smooth-cursor"

import { TextCursorProximity } from "./text-cursor-proximity"

let reduceMotion = false

function media(query: string) {
  return {
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : query.includes("pointer: fine"),
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

test("repetition hover stacks five echoes", () => {
  const { container } = render(<RepetitionImageHover />)
  const front = container.querySelector("[data-slot='repetition-image-hover'] > div:not([aria-hidden])")
  expect(front).toHaveTextContent("回声")
  expect(front).toHaveStyle({ opacity: "1" })
  expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(4)
})

test("repetition hover keeps one echo when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(<RepetitionImageHover />)
  expect(screen.getAllByText("回声")).toHaveLength(1)
  expect(slot(container, "repetition-image-hover")).toBeInTheDocument()
})

test("smooth cursor mounts a follower for a fine pointer", () => {
  const { container } = render(
    <div>
      <p>在页面上移动指针</p>
      <SmoothCursor />
    </div>,
  )
  expect(screen.getByText("在页面上移动指针")).toBeInTheDocument()
  expect(slot(container, "smooth-cursor")).toBeInTheDocument()
})

test("smooth cursor stays off when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(
    <div>
      <p>在页面上移动指针</p>
      <SmoothCursor />
    </div>,
  )
  expect(screen.getByText("在页面上移动指针")).toBeInTheDocument()
  expect(container.querySelector('[data-slot="smooth-cursor"]')).toBeNull()
})

test("magnetic field shows the three labels", () => {
  const { container } = render(
    <MagneticField mode="attract" radius={180} strength={0.35}>
      <span data-magnetic="">北</span>
      <span data-magnetic="">窗</span>
      <span data-magnetic="">夜</span>
    </MagneticField>,
  )
  expect(screen.getByText("北")).toBeInTheDocument()
  expect(screen.getByText("窗")).toBeInTheDocument()
  expect(screen.getByText("夜")).toBeInTheDocument()
  expect(slot(container, "magnetic-field")).toHaveAttribute("data-reduced", "false")
})

test("magnetic field marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(
    <MagneticField>
      <span data-magnetic="">北</span>
    </MagneticField>,
  )
  expect(screen.getByText("北")).toBeInTheDocument()
  expect(slot(container, "magnetic-field")).toHaveAttribute("data-reduced", "true")
})
const letterStyles = {
  scale: { from: 1, to: 1.6 },
  color: { from: "rgb(100, 116, 139)", to: "rgb(79, 70, 229)" },
}

test("text cursor proximity keeps the readable sentence", () => {
  const { container } = render(
    <TextCursorProximity as="span" containerRef={{ current: null }} falloff="gaussian" radius={120} styles={letterStyles}>
      指针靠近时字母变大
    </TextCursorProximity>,
  )
  const host = slot(container, "text-cursor-proximity")
  const painted = Array.from(host.querySelectorAll("[aria-hidden] span")).map((node) => node.textContent ?? "").join("")
  expect(painted.replaceAll("\u00a0", "")).toBe("指针靠近时字母变大")
  expect(host.querySelector(".sr-only")).toHaveTextContent("指针靠近时字母变大")
  expect(host.tagName).toBe("SPAN")
  expect(host).toHaveAttribute("data-reduced", "false")
})

test("text cursor proximity marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(
    <TextCursorProximity containerRef={{ current: null }} styles={letterStyles}>
      指针靠近时字母变大
    </TextCursorProximity>,
  )
  const host = slot(container, "text-cursor-proximity")
  const painted = Array.from(host.querySelectorAll("[aria-hidden] span")).map((node) => node.textContent ?? "").join("")
  expect(painted.replaceAll("\u00a0", "")).toBe("指针靠近时字母变大")
  expect(host.querySelector(".sr-only")).toHaveTextContent("指针靠近时字母变大")
  expect(host).toHaveAttribute("data-reduced", "true")
})
