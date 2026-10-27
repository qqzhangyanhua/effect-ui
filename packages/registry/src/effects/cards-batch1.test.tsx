// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { CardBeamScanner } from "./card-beam-scanner"
import { CircularGallery } from "./circular-gallery"
import { LenticularCard } from "./lenticular-card"
import { PerspectiveCard } from "./perspective-card"

const shots = [
  { title: "A", src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" },
  { title: "B", src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" },
]

let reduceMotion = false

function media(query: string) {
  return {
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }
}

beforeEach(() => {
  reduceMotion = false
  vi.stubGlobal("matchMedia", media)
  vi.stubGlobal(
    "IntersectionObserver",
    class {
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
    },
  )
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot="${name}"]`)
  expect(node).not.toBeNull()
  return node as HTMLElement
}

test("透视卡片跟着指针倾斜，内容仍在", () => {
  render(
    <PerspectiveCard>
      <h3>Perspective</h3>
    </PerspectiveCard>,
  )
  const card = screen.getByText("Perspective").closest("[data-slot='perspective-card']")
  expect(card).not.toBeNull()
  fireEvent.mouseMove(card as HTMLElement, { clientX: 20, clientY: 10 })
  expect(screen.getByText("Perspective")).toBeInTheDocument()
})

test("透视卡片在减弱动效时不再跟随指针", () => {
  reduceMotion = true
  const { container } = render(
    <PerspectiveCard>
      <h3>Perspective</h3>
    </PerspectiveCard>,
  )
  const card = slot(container, "perspective-card")
  fireEvent.mouseMove(card, { clientX: 20, clientY: 10 })
  expect(screen.getByText("Perspective")).toBeInTheDocument()
})


test("环形相册先挂上画布", () => {
  const { container } = render(<CircularGallery items={shots} />)
  expect(container.querySelector("canvas")).not.toBeNull()
})

test("环形相册在减弱动效时仍挂上画布", () => {
  reduceMotion = true
  const { container } = render(<CircularGallery items={shots} />)
  expect(container.querySelector("canvas")).not.toBeNull()
})


test("光栅卡在角度居中时停在中间画面", () => {
  render(<LenticularCard />)
  expect(screen.getByRole("button", { name: /海湾/ })).toBeInTheDocument()
  expect(screen.getByText("倾斜或移动指针，光栅会换到另一张图。")).toBeInTheDocument()
})

test("光栅卡在减弱动效时从第一张点到下一张", () => {
  reduceMotion = true
  render(<LenticularCard />)
  expect(screen.getByText("点击切换画面。")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: /晨雾/ }))
  expect(screen.getByRole("button", { name: /海湾/ })).toBeInTheDocument()
})

test("光束扫卡在运动时画出光束", () => {
  const { container } = render(<CardBeamScanner />)
  expect(screen.getByRole("heading", { name: "北窗卡" })).toBeInTheDocument()
  expect(container.querySelector(".bg-amber-200")).not.toBeNull()
})

test("光束扫卡在减弱动效时收起光束", () => {
  reduceMotion = true
  const { container } = render(<CardBeamScanner />)
  expect(screen.getByRole("heading", { name: "北窗卡" })).toBeInTheDocument()
  expect(container.querySelector(".bg-amber-200")).toBeNull()
})


