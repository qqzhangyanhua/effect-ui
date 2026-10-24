// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { act, cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { BandWaveText } from "./band-wave-text"
import { BarsSpinner } from "./bars-spinner"
import { ExplodingInput } from "./exploding-input"
import { FallbackAvatar } from "./fallback-avatar"
import { FlowButton } from "./flow-button"
import { GlowDivider } from "./glow-divider"
import { HeldKeys } from "./held-keys"
import { InvalidShake } from "./invalid-shake"
import { LogosCarousel } from "./logos-carousel"
import { VerifyBadge } from "./verify-badge"

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

test("Spell、Sera 与 Hexta 组件在减弱动效下仍可操作", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })

  const exploding = render(<ExplodingInput />)
  await user.type(screen.getByLabelText("Exploding input"), "a")
  expect(exploding.container.querySelector("[data-chip]")).toHaveTextContent("a")
  exploding.unmount()

  render(<FlowButton />)
  expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled()
  cleanup()

  render(
    <LogosCarousel>
      <span>Alpha</span>
      <span>Beta</span>
    </LogosCarousel>,
  )
  expect(screen.getByText("Alpha")).toBeInTheDocument()
  cleanup()

  render(<BarsSpinner />)
  expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument()
  cleanup()

  render(<BandWaveText />)
  expect(screen.getByText("Band wave")).toBeInTheDocument()
  cleanup()

  render(<GlowDivider />)
  expect(screen.getByRole("separator")).toBeInTheDocument()
  cleanup()

  render(<InvalidShake />)
  await user.click(screen.getByRole("button", { name: "Submit" }))
  expect(screen.getByRole("status")).toHaveTextContent("Enter a valid email.")
  await user.type(screen.getByLabelText("Email"), "ada@example.com")
  await user.click(screen.getByRole("button", { name: "Submit" }))
  expect(screen.getByRole("status")).toHaveTextContent("Address saved.")
  cleanup()

  render(<FallbackAvatar name="Ada Lovelace" />)
  expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveTextContent("AL")
  cleanup()

  render(<VerifyBadge />)
  expect(screen.getByText("Verified")).toBeInTheDocument()
  cleanup()

  render(<HeldKeys />)
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a", code: "KeyA" }))
  })
  expect(screen.getByText("a")).toBeInTheDocument()
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keyup", { key: "a", code: "KeyA" }))
  })
  expect(screen.queryByText("a")).not.toBeInTheDocument()
  cleanup()
})
