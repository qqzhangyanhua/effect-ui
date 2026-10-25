// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { CountBadge } from "./count-badge"
import { DepthParallaxWords } from "./depth-parallax-words"
import { ExpandableNavbar } from "./expandable-navbar"
import { GitHubStarsAnimation } from "./github-stars-animation"
import { HoverExpand } from "./hover-expand"

import { MorphIcon } from "./morph-icon"

import { PrismSweepTransition } from "./prism-sweep-transition"

import { ScrollImageReveal } from "./scroll-image-reveal"
import { SplashMask } from "./splash-mask"


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

const swatch = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"

function slot(container: HTMLElement, name: string) {
  return container.querySelector(`[data-slot="${name}"]`)
}

test("减弱动效时棱镜停在标记上", () => {
  reduceMotion = true
  const sweep = render(
    <PrismSweepTransition transitionKey="a">
      <span>甲</span>
    </PrismSweepTransition>,
  )
  expect(slot(sweep.container, "prism-sweep-transition")).toHaveAttribute("data-reduced", "true")
  expect(slot(sweep.container, "prism-sweep-transition")).toHaveAttribute("data-sweeping", "false")
  expect(sweep.container).toHaveTextContent("甲")
  cleanup()
  reduceMotion = false
})

test("星标组件只在传入接口时请求网络", async () => {
  reduceMotion = true
  const fetchSpy = vi.spyOn(globalThis, "fetch")
  render(
    <GitHubStarsAnimation
      starCount={1280}
      stargazers={[{ avatar_url: swatch, html_url: "https://github.com/north", login: "north" }]}
    />,
  )
  expect(fetchSpy).not.toHaveBeenCalled()
  expect(await screen.findByText((text) => text.replace(/[^\d]/g, "") === "1280")).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "north's GitHub profile" })).toBeInTheDocument()
  fetchSpy.mockRestore()
  cleanup()

  const endpointSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ stars: 12, stargazers: [] }),
  } as Response)
  render(<GitHubStarsAnimation apiEndpoint="https://example.test/stars" owner="north" repo="harbor" />)
  await waitFor(() => expect(endpointSpy).toHaveBeenCalled())
  expect(String(endpointSpy.mock.calls[0]?.[0])).toContain("https://example.test/stars?owner=north&repo=harbor")
  endpointSpy.mockRestore()
  cleanup()
  reduceMotion = false
})

test("导航和数字徽章能改状态", async () => {
  reduceMotion = true
  render(
    <ExpandableNavbar items={[{ id: "work", label: "作品", panel: <p>夜航</p> }]} />,
  )
  fireEvent.click(screen.getByRole("button", { name: "作品" }))
  expect(screen.getAllByText("夜航").length).toBeGreaterThan(0)
  expect(screen.getByRole("button", { name: "作品" })).toHaveAttribute("aria-expanded", "true")
  cleanup()

  render(<CountBadge count={128} variant="count" />)
  expect(await screen.findByText("99+")).toBeInTheDocument()
  cleanup()
  reduceMotion = false
})

test("其余裁切、字和图标都挂上槽位", () => {
  reduceMotion = false
  const reveal = render(<ScrollImageReveal alt="夜空" src={swatch} />)
  expect(slot(reveal.container, "scroll-image-reveal")).toBeTruthy()
  expect(screen.getByRole("img", { name: "夜空" })).toBeInTheDocument()
  cleanup()

  const words = render(<DepthParallaxWords>雾散</DepthParallaxWords>)
  expect(slot(words.container, "depth-parallax-words")).toHaveAttribute("data-reduced", "false")
  expect(words.container).toHaveTextContent("雾散")
  cleanup()

  const splash = render(
    <SplashMask>
      <span>水</span>
    </SplashMask>,
  )
  expect(slot(splash.container, "splash-mask")).toHaveTextContent("水")
  expect(splash.container.querySelector("clipPath")).toBeTruthy()
  cleanup()

  const icon = render(<MorphIcon label="菜单" variant="menu" />)
  expect(slot(icon.container, "morph-icon")).toHaveAttribute("role", "img")
  cleanup()

  const strips = render(
    <HoverExpand items={[{ id: "a", image: swatch, title: "靛蓝" }]} />,
  )
  expect(slot(strips.container, "hover-expand")).toBeTruthy()
  expect(screen.getByRole("button", { name: "靛蓝" })).toHaveAttribute("aria-pressed", "true")
  cleanup()
})
