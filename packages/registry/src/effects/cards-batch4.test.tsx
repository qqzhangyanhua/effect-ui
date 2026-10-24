// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { FlipCard } from "./flip-card"
import { GlassCard } from "./glass-card"
import { HoverLift } from "./hover-lift"

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

test("flip card shows the front face", () => {
  const { container } = render(
    <FlipCard
      duration={500}
      front={<span>正面 · 悬停翻转</span>}
      back={<span>背面 · 更多细节</span>}
    />,
  )
  expect(screen.getByText("正面 · 悬停翻转")).toBeInTheDocument()
  const faces = slot(container, "flip-card").querySelectorAll(":scope > div > div")
  expect(faces[1]).toHaveClass("motion-reduce:hidden")
  expect(faces[0]).not.toHaveClass("motion-reduce:hidden")
})

test("flip card swaps which face the reduced-motion rule hides", () => {
  reduceMotion = true
  const { container } = render(
    <FlipCard front={<span>正面 · 悬停翻转</span>} back={<span>背面 · 更多细节</span>} />,
  )
  const host = slot(container, "flip-card")
  fireEvent.mouseEnter(host)
  const faces = host.querySelectorAll(":scope > div > div")
  expect(screen.getByText("背面 · 更多细节")).toBeInTheDocument()
  expect(faces[0]).toHaveClass("motion-reduce:hidden")
  expect(host.querySelector(":scope > div")).toHaveClass("motion-reduce:transform-none")
})

test("glass card shows the title on the frosted surface", () => {
  const { container } = render(
    <GlassCard intensity={1} size={24}>
      <h3>Glass</h3>
      <p>毛玻璃叠在彩色背景上。</p>
    </GlassCard>,
  )
  expect(screen.getByRole("heading", { name: "Glass" })).toBeInTheDocument()
  expect(screen.getByText("毛玻璃叠在彩色背景上。")).toBeInTheDocument()
  expect(slot(container, "glass-card")).toHaveClass("backdrop-blur-xl")
})

test("glass card keeps the title when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(
    <GlassCard>
      <h3>Glass</h3>
      <p>毛玻璃叠在彩色背景上。</p>
    </GlassCard>,
  )
  expect(screen.getByRole("heading", { name: "Glass" })).toBeInTheDocument()
  expect(screen.getByText("毛玻璃叠在彩色背景上。")).toBeInTheDocument()
  expect(slot(container, "glass-card")).toBeInTheDocument()
})

test("hover lift shows the card copy", () => {
  const { container } = render(
    <HoverLift duration={300} intensity={1}>
      <h3>Hover Lift</h3>
      <p>悬停抬起并加深阴影。</p>
    </HoverLift>,
  )
  expect(screen.getByRole("heading", { name: "Hover Lift" })).toBeInTheDocument()
  expect(screen.getByText("悬停抬起并加深阴影。")).toBeInTheDocument()
  expect(slot(container, "hover-lift")).toHaveClass("motion-reduce:hover:translate-y-0", "hover:-translate-y-1.5")
})

test("hover lift keeps the copy and the reduced-motion class", () => {
  reduceMotion = true
  const { container } = render(
    <HoverLift>
      <h3>Hover Lift</h3>
      <p>悬停抬起并加深阴影。</p>
    </HoverLift>,
  )
  expect(screen.getByRole("heading", { name: "Hover Lift" })).toBeInTheDocument()
  expect(screen.getByText("悬停抬起并加深阴影。")).toBeInTheDocument()
  expect(slot(container, "hover-lift")).toHaveClass("motion-reduce:hover:translate-y-0")
})
