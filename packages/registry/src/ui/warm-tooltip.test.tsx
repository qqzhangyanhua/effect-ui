// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { WarmTooltip } from "./warm-tooltip"

function installMatchMedia(reduce: boolean) {
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

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub
})

afterEach(() => {
  cleanup()
})

test("聚焦触发器后显示内容", async () => {
  installMatchMedia(false)
  const user = userEvent.setup()
  render(
    <WarmTooltip content="说明" delay={0}>
      <button type="button">悬停</button>
    </WarmTooltip>,
  )

  await user.tab()
  expect(await screen.findByRole("tooltip")).toHaveTextContent("说明")
})

test("减弱动效时没有光晕", async () => {
  installMatchMedia(true)
  const user = userEvent.setup()
  render(
    <WarmTooltip content="说明" glow>
      <button type="button">悬停</button>
    </WarmTooltip>,
  )

  await user.tab()
  expect(await screen.findByRole("tooltip")).toHaveAttribute("data-glow", "false")
})
