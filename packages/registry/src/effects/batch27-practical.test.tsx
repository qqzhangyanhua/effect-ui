// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { ArcadePixel } from "./arcade-pixel"
import { CardSwipeDeck } from "./card-swipe-deck"


import { EmbossSurface } from "./emboss-surface"
import { GridLoader } from "./grid-loader"
import { KineticTypeScroll } from "./kinetic-type-scroll"
import { MusicToggle } from "./music-toggle"
import { NovatrixBackground } from "./novatrix-background"

import { PinnedList } from "./pinned-list"

import { UnlockFaceId } from "./unlock-face-id"

let reduceMotion = false

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
}))
vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
  window.setTimeout(() => callback(performance.now()), 16),
)
vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id))

function slot(container: HTMLElement, name: string) {
  return container.querySelector(`[data-slot=${name}]`)
}

test("减弱动效时色波停在标记上", () => {
  reduceMotion = true
  const wave = render(<NovatrixBackground />)
  expect(slot(wave.container, "novatrix-background")).toHaveAttribute("data-reduced", "true")
  cleanup()
  reduceMotion = false
})

test("置顶、滑卡和扫描能改状态", () => {
  reduceMotion = true
  render(
    <PinnedList
      items={[
        { id: "north", title: "北窗" },
        { id: "night", title: "夜航" },
      ]}
    />,
  )
  fireEvent.click(screen.getByRole("button", { name: "Pin 北窗" }))
  expect(screen.getByRole("button", { name: "Unpin 北窗" })).toHaveAttribute("aria-pressed", "true")
  cleanup()

  render(
    <CardSwipeDeck
      items={[
        { content: <span>甲</span>, id: "a" },
        { content: <span>乙</span>, id: "b" },
      ]}
    />,
  )
  fireEvent.keyDown(screen.getByRole("application"), { key: "ArrowRight" })
  expect(screen.getByText("乙")).toBeInTheDocument()
  expect(screen.queryByText("甲")).not.toBeInTheDocument()
  cleanup()

  render(<UnlockFaceId scanDuration={50} />)
  fireEvent.click(screen.getByRole("button", { name: "Scan to unlock" }))
  expect(screen.getByRole("status")).toHaveTextContent("Scanning face…")
  cleanup()
  reduceMotion = false
})

test("其余 Eldora 与 SmoothUI 组件都挂上槽位", () => {
  reduceMotion = false
  const relief = render(
    <EmbossSurface>
      <span>浮雕</span>
    </EmbossSurface>,
  )
  expect(slot(relief.container, "emboss-surface")).toHaveTextContent("浮雕")
  cleanup()

  const arcade = render(<ArcadePixel text="HI" />)
  expect(slot(arcade.container, "arcade-pixel")).toHaveTextContent("HI")
  cleanup()

  const type = render(<KineticTypeScroll words={["北", "窗"]} />)
  expect(slot(type.container, "kinetic-type-scroll")).toHaveTextContent("北 窗")
  cleanup()

  const loader = render(<GridLoader pattern="heartbeat" />)
  expect(slot(loader.container, "grid-loader")).toHaveAttribute("aria-label", "Loading")
  cleanup()

  const player = render(<MusicToggle artist="北窗" title="夜航" />)
  expect(slot(player.container, "music-toggle")).toHaveTextContent("夜航")
  fireEvent.click(screen.getByRole("button", { name: /Play 夜航/ }))
  expect(screen.getByRole("button", { name: /Pause 夜航/ })).toHaveAttribute("aria-pressed", "true")
  cleanup()
})
