// @vitest-environment jsdom

import { useState } from "react"
import { MotionGlobalConfig } from "motion"
import { expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { AnimatedBackground } from "./animated-background"
import { ComicText } from "./comic-text"
import { CoolMode } from "./cool-mode"
import { Disclosure, DisclosureContent, DisclosureTrigger } from "./disclosure"
import { FeedbackWidget } from "./feedback-widget"
import { GeoPatterns } from "./geo-patterns"

let reduceMotion = false

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

test("漫画字在减弱动效时不弹跳", () => {
  reduceMotion = true
  const { container } = render(<ComicText>北窗</ComicText>)
  expect(container.querySelector("[data-slot=comic-text]")).toHaveAttribute("data-reduced", "true")
  expect(container.querySelector("[data-slot=comic-text]")).toHaveTextContent("北窗")
  cleanup()
  reduceMotion = false
})

test("减弱动效时点击不产生粒子", () => {
  reduceMotion = true
  render(
    <CoolMode particle="✨">
      <button type="button">喷</button>
    </CoolMode>,
  )
  fireEvent.pointerDown(screen.getByText("喷"), { clientX: 20, clientY: 20 })
  expect(document.getElementById("effect-ui-cool-mode")).toBeNull()
  cleanup()
  reduceMotion = false
})

test("几何图案可以画斜纹", () => {
  const { container } = render(<GeoPatterns variant="striped" direction="right" />)
  expect(container.querySelector("line")).toBeTruthy()
  cleanup()
})

test("折叠区可以展开", () => {
  render(
    <Disclosure>
      <DisclosureTrigger>展开说明</DisclosureTrigger>
      <DisclosureContent>
        <p>隐藏正文</p>
      </DisclosureContent>
    </Disclosure>,
  )
  expect(screen.queryByText("隐藏正文")).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "展开说明" }))
  expect(screen.getByText("隐藏正文")).toBeInTheDocument()
  cleanup()
})

test("共享高亮跟着点击移动", () => {
  render(
    <AnimatedBackground defaultValue="one">
      <button type="button" data-id="one">
        其一
      </button>
      <button type="button" data-id="two">
        其二
      </button>
    </AnimatedBackground>,
  )
  fireEvent.click(screen.getByRole("button", { name: "其二" }))
  expect(screen.getByRole("button", { name: "其二" })).toHaveAttribute("data-checked", "true")
  cleanup()
})

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
