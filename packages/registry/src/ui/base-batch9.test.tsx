// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { useTypewriter } from "../hooks/use-typewriter"
import { ExpandableText } from "../effects/expandable-text"

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

function TypewriterProbe() {
  const { text } = useTypewriter(["夜航", "靠岸"])
  return <p>{text}</p>
}

function stubLineHeights() {
  const previous = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    const height = this instanceof HTMLSpanElement ? 24 : 96
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 120,
      bottom: height,
      width: 120,
      height,
      toJSON() {
        return {}
      },
    } as DOMRect
  }
  return () => {
    Element.prototype.getBoundingClientRect = previous
  }
}

test("typewriter shows the first phrase", () => {
  render(<TypewriterProbe />)
  expect(screen.getByText("夜航")).toBeInTheDocument()
})

test("expandable text opens the rest of the paragraph", async () => {
  const user = userEvent.setup()
  const restore = stubLineHeights()
  try {
    render(
      <ExpandableText>
        港口夜航的记录比预览里能放下的三行更长，所以末行会被夹住。
      </ExpandableText>,
    )
    expect(screen.getByText(/港口夜航/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Read more" }))
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute("aria-expanded", "true")
  } finally {
    restore()
  }
})
