// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { AnalogStick } from "./analog-stick"
import { ClientCard } from "./client-card"
import { CornerVideo } from "./corner-video"
import { CreateMenu } from "./create-menu"
import { DiscoverSearchPill } from "./discover-search-pill"
import { DynamicGridGallery } from "./dynamic-grid-gallery"
import { GetInTouch } from "./get-in-touch"
import { GooeyNavbar } from "./gooey-navbar"

import { PaperShredButton } from "./paper-shred-button"
import { PhotoAlbums } from "./photo-albums"
import { ScanDocument } from "./scan-document"
import { StackedList } from "./stacked-list"
import { TactileRocker } from "./tactile-rocker"

afterEach(() => {
  cleanup()
})

class IntersectingObserver {
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
}

class SizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: { x: 0, y: 0, width: 640, height: 480, top: 0, left: 0, bottom: 480, right: 640, toJSON() { return {} } },
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    )
  }

  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal("ResizeObserver", SizeObserver)
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: query.includes("prefers-reduced-motion"),
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
  onchange: null,
}))

test("uselayouts 组件在减弱动效下仍可操作", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })

  const { unmount: unmountStick } = render(<AnalogStick />)
  await user.click(screen.getByRole("button", { name: "Up" }))
  expect(screen.getByRole("button", { name: "Up" })).toHaveAttribute("aria-pressed", "true")
  unmountStick()

  render(<PaperShredButton />)
  await user.click(screen.getByRole("button", { name: "Shred document" }))
  expect(screen.getByRole("button", { name: "Shred document" })).toHaveAttribute("data-state", "shredding")
  cleanup()

  render(<ScanDocument />)
  await user.click(screen.getByRole("button", { name: "Scan" }))
  expect(screen.getByRole("button", { name: "Scanning" })).toBeDisabled()
  cleanup()

  render(<DynamicGridGallery />)
  await user.click(screen.getByRole("button", { name: "Dune Crests" }))
  expect(screen.getByRole("button", { name: "Dune Crests" })).toHaveAttribute("aria-pressed", "true")
  cleanup()

  render(<PhotoAlbums />)
  await user.click(screen.getByRole("button", { name: /Travel & Exploration/ }))
  expect(screen.getByRole("button", { name: "Go back" })).toBeInTheDocument()
  cleanup()

  render(<GooeyNavbar />)
  await user.click(screen.getByRole("link", { name: "Work" }))
  expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page")
  cleanup()

  const { unmount: unmountTouch } = render(<GetInTouch />)
  const link = screen.getByRole("link", { name: "GET IN TOUCH" })
  await user.click(link)
  expect(link).toHaveAttribute("data-phase", "end")
  unmountTouch()

  render(<ClientCard />)
  await user.click(screen.getByRole("button", { name: "+5" }))
  expect(screen.getByRole("button", { name: /Go Back/ })).toBeInTheDocument()
  cleanup()

  render(<CornerVideo />)
  expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
  cleanup()

  render(<CreateMenu />)
  await user.click(screen.getByRole("button", { name: "Start Creating" }))
  expect(screen.getByRole("menuitem", { name: "New Post" })).toBeInTheDocument()
  cleanup()

  render(<StackedList />)
  expect(screen.getByRole("heading", { name: /Active Members/ })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: /Member Directory/ }))
  expect(screen.getByRole("button", { name: "Close directory" })).toBeInTheDocument()
  cleanup()

  render(<DiscoverSearchPill />)
  await user.click(screen.getByRole("button", { name: "Search" }))
  expect(screen.getByRole("textbox", { name: "Search" })).toBeInTheDocument()
  cleanup()

  render(<TactileRocker />)
  await user.click(screen.getByRole("button", { name: "Get Started" }))
  expect(screen.getByRole("button", { name: "Get Started" })).toHaveAttribute("aria-pressed", "true")
})
