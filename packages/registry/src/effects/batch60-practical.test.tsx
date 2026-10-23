// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { ArcCards } from "./arc-cards"
import { BlurGlideMenu } from "./blur-glide-menu"
import { CursorEdgeGlowButton } from "./cursor-edge-glow-button"
import { HoverGlideCards } from "./hover-glide-cards"
import { PreviewHoverToolbar } from "./preview-hover-toolbar"
import { ProgressRingCheck } from "./progress-ring-check"
import { RollingLettersAnimation } from "./rolling-letters-animation"
import { SectionNavigator } from "./section-navigator"
import { SecurePurchaseButton } from "./secure-purchase-button"
import { SpotlightIndicator } from "./spotlight-indicator"
import { TiltImageCarousel } from "./tilt-image-carousel"
import { WavyThreadsBackground } from "./wavy-threads-background"

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 800 })
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 480 })
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 168 })
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 64 })
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", { configurable: true, get: () => 0 })
  Object.defineProperty(HTMLElement.prototype, "offsetTop", { configurable: true, get: () => 0 })
})

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

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
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

const user = userEvent.setup({ pointerEventsCheck: 0 })

test("wavy threads paint a canvas and stay still", () => {
  render(<WavyThreadsBackground />)
  expect(document.querySelector("canvas")).toBeInTheDocument()
  expect(document.querySelector("[data-slot=wavy-threads-background]")).toHaveAttribute("data-motion", "off")
})

test("rolling letters keep the phrase readable", () => {
  render(<RollingLettersAnimation text="Hello" />)
  expect(screen.getByText("Hello")).toBeInTheDocument()
  expect(document.querySelector("[data-slot=rolling-letters-animation]")).toHaveAttribute("data-motion", "off")
})

test("arc cards open from a press", async () => {
  render(<ArcCards items={[{ id: "a", title: "清晨", detail: "窗台" }]} />)
  await user.click(screen.getByRole("group", { name: "Arc cards" }))
  expect(document.querySelector("[data-slot=arc-cards]")).toHaveAttribute("data-open", "true")
})

test("tilt carousel advances from the next button", async () => {
  render(<TiltImageCarousel items={[{ title: "港湾" }, { title: "街角" }]} />)
  await user.click(screen.getByRole("button", { name: "Next" }))
  expect(document.querySelector("[data-slot=tilt-image-carousel]")).toHaveAttribute("data-index", "1")
})

test("hover glide marks the pressed card", async () => {
  render(<HoverGlideCards />)
  await user.click(screen.getByRole("button", { name: /Calendar/ }))
  expect(screen.getByRole("button", { name: /Calendar/ })).toHaveAttribute("data-active", "true")
})

test("progress ring exposes a completed status", () => {
  render(<ProgressRingCheck status="done" />)
  expect(screen.getByRole("img", { name: "Completed" })).toBeInTheDocument()
  expect(document.querySelector("[data-slot=progress-ring-check]")).toHaveAttribute("data-status", "done")
})

test("cursor edge glow names its action", () => {
  render(<CursorEdgeGlowButton />)
  expect(screen.getByRole("button", { name: /See in Action/ })).toBeInTheDocument()
})

test("secure purchase enters processing", async () => {
  render(<SecurePurchaseButton duration={1600} />)
  await user.click(screen.getByRole("button", { name: "Complete Purchase" }))
  expect(document.querySelector("[data-slot=secure-purchase-button]")).toHaveAttribute("data-state", "processing")
  expect(document.querySelector("[data-slot=secure-purchase-button]")).toHaveAttribute("aria-busy", "true")
})

test("blur glide menu opens a nested panel", async () => {
  render(<BlurGlideMenu />)
  await user.click(screen.getByRole("button", { name: "Board actions" }))
  await user.click(screen.getByRole("menuitem", { name: /Invite people/ }))
  expect(screen.getByRole("menuitem", { name: /Priya Raman/ })).toBeInTheDocument()
})

test("spotlight indicator selects favorites", async () => {
  render(<SpotlightIndicator />)
  await user.click(screen.getByRole("button", { name: "Favorites" }))
  expect(screen.getByRole("button", { name: "Favorites" })).toHaveAttribute("aria-pressed", "true")
})

test("section navigator chooses a section without a portal", async () => {
  const onSectionClick = vi.fn()
  render(<SectionNavigator sections={[{ id: "open", name: "开场" }, { id: "work", name: "过程" }]} onSectionClick={onSectionClick} />)
  await user.click(screen.getByRole("button", { name: "Sections" }))
  expect(document.querySelector("[data-slot=section-navigator]")).toHaveAttribute("data-open", "true")
  expect(document.body.querySelector(":scope > ul")).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "过程" }))
  expect(onSectionClick).toHaveBeenCalledWith({ id: "work", name: "过程" })
})

test("preview toolbar opens from the toggle", async () => {
  render(<PreviewHoverToolbar />)
  await user.click(screen.getByRole("button", { name: "Show preview actions" }))
  expect(document.querySelector("[data-open=true]")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "View All" })).toBeEnabled()
})
