// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { PolaroidScrollStack } from "../sections/polaroid-scroll-stack"
import { DepthFogGallery } from "../sections/depth-fog-gallery"
import { TelescopeZoomScroll } from "../sections/telescope-zoom-scroll"
import { CurvedScrollbar } from "../effects/curved-scrollbar"

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }))
  document.elementFromPoint = () => null
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => {}
  HTMLElement.prototype.releasePointerCapture = () => {}
  HTMLElement.prototype.scrollIntoView = () => {}
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
  Object.getPrototypeOf(path).getTotalLength = () => 120
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})


test("polaroid stack shows the first caption", () => {
  render(<PolaroidScrollStack />)
  expect(screen.getByText("向下滚动。相片从画面外甩进来，再叠成一摞。")).toBeInTheDocument()
  expect(screen.getByText("晨雾还没散")).toBeInTheDocument()
})

test("depth fog gallery shows the near window", () => {
  render(<DepthFogGallery />)
  expect(screen.getByText("近处的窗")).toBeInTheDocument()
  expect(screen.getByText("几乎看不见")).toBeInTheDocument()
})

test("telescope zoom shows the revealed caption", () => {
  render(<TelescopeZoomScroll />)
  expect(screen.getByRole("heading", { name: "再把整片夜空揭开。" })).toBeInTheDocument()
})

test("curved scrollbar shows its content", () => {
  render(
    <CurvedScrollbar>
      <p>弯轨里的段落</p>
    </CurvedScrollbar>,
  )
  expect(screen.getByText("弯轨里的段落")).toBeInTheDocument()
})


