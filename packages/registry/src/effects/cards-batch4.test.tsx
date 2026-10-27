// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { GlassCard } from "./glass-card"

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


