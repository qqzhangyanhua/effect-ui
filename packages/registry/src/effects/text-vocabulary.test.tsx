// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react")
  const scrollYProgress = actual.motionValue(0)
  return { ...actual, useScroll: () => ({ scrollYProgress }) }
})

import { FuzzyText } from "./fuzzy-text"
import { GhostTrailText } from "./ghost-trail-text"
import { LampHeading } from "./lamp-heading"
import { PetalDissolveText } from "./petal-dissolve-text"
import { SplitFlapText } from "./split-flap-text"
import { Text3dScroll } from "./text-3d-scroll"

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

beforeEach(() => {
  installMatchMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})


test("灯罩不传颜色时仍用原来的渐变类", () => {
  const { container } = render(<LampHeading text="灯" />)
  expect(container.innerHTML).toContain("bg-[radial-gradient(ellipse_at_top,#c4b5fd,transparent_70%)]")
})

test("灯罩传默认色时仍用原来的渐变类", () => {
  const { container } = render(<LampHeading text="灯" color="#c4b5fd" />)
  expect(container.innerHTML).toContain("bg-[radial-gradient(ellipse_at_top,#c4b5fd,transparent_70%)]")
})

test("灯罩传入颜色后改成内联渐变", () => {
  const { container } = render(<LampHeading text="灯" color="#123456" />)
  expect(container.innerHTML).toContain("rgb(18, 52, 86)")
  expect(container.innerHTML).not.toContain("bg-[radial-gradient(ellipse_at_top,#c4b5fd,transparent_70%)]")
})


test("画布文字不传新 prop 时仍有可读名称", () => {
  render(<FuzzyText text="SIGNAL" />)
  expect(screen.getByLabelText("SIGNAL")).toBeInTheDocument()
  render(<PetalDissolveText text="花瓣" />)
  expect(screen.getByLabelText("花瓣")).toBeInTheDocument()
})

test("画布文字传入新 prop 后名称还在", () => {
  render(<FuzzyText text="SIGNAL" fontSize={40} intensity={0.5} color="#ffffff" align="left" />)
  expect(screen.getByLabelText("SIGNAL")).toBeInTheDocument()
  render(<PetalDissolveText text="花瓣" fontSize={40} fontWeight={500} align="center" />)
  expect(screen.getByLabelText("花瓣")).toBeInTheDocument()
})

test("减弱动效时文字仍在", () => {
  installMatchMedia(true)
  render(<Text3dScroll text="翻过来" />)
  expect(screen.getByRole("heading", { name: "翻过来" })).toBeInTheDocument()
  render(<GhostTrailText text="影" />)
  expect(screen.getByRole("heading", { name: "影" })).toBeInTheDocument()
  render(<FuzzyText text="SIGNAL" />)
  expect(screen.getByLabelText("SIGNAL")).toBeInTheDocument()
  render(<SplitFlapText target="AB" />)
  expect(screen.getByRole("img", { name: "AB" })).toBeInTheDocument()
})
