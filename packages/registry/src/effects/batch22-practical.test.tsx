// @vitest-environment jsdom

import { useState } from "react"
import { MotionGlobalConfig } from "motion"
import { expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { FeedbackWidget } from "./feedback-widget"

const reduceMotion = false

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal("ResizeObserver", class {
  observe() {}
  unobserve() {}
  disconnect() {}
})
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
vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 16))
vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id))


test("反馈组件提交评分和留言", () => {
  const onSubmit = vi.fn()
  function Harness() {
    const [openNote, setOpenNote] = useState("")
    return (
      <>
        <FeedbackWidget
          onSubmit={(value) => {
            onSubmit(value)
            setOpenNote("sent")
          }}
        />
        <span>{openNote}</span>
      </>
    )
  }
  render(<Harness />)
  fireEvent.click(screen.getByRole("button", { name: "Feedback" }))
  fireEvent.click(screen.getByRole("button", { name: "很好" }))
  fireEvent.change(screen.getByPlaceholderText("What should we change?"), { target: { value: "north-window" } })
  fireEvent.click(screen.getByRole("button", { name: "Send" }))
  expect(onSubmit).toHaveBeenCalledWith({ rating: 4, message: "north-window" })
  expect(screen.getByText("Thanks ✓")).toBeInTheDocument()
  cleanup()
})
