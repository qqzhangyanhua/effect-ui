// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { NotFoundPage } from "./not-found-page"
import { PrismSweepTransition } from "./prism-sweep-transition"
import { Terminal } from "./terminal"
import { IPhone, Macbook, Safari } from "../ui/device-mockups"
import { ViewTransitionGallery } from "../ui/view-transition-gallery"

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
  vi.stubGlobal("requestAnimationFrame", () => 1)
  vi.stubGlobal("cancelAnimationFrame", () => {})
  vi.stubGlobal(
    "IntersectionObserver",
    class {
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

const helpLinks = [{ title: "文档", description: "查组件和主题变量。", href: "#docs" }]





test("device mockups show the safari address and the phone", () => {
  render(
    <div>
      <Safari>
        <p>Safari 预览</p>
      </Safari>
      <IPhone>
        <p>iPhone</p>
      </IPhone>
      <Macbook>
        <p>MacBook</p>
      </Macbook>
    </div>,
  )
  expect(screen.getByText("https://effect-ui.dev")).toBeInTheDocument()
  expect(screen.getByText("iPhone")).toBeInTheDocument()
  expect(screen.getByText("MacBook")).toBeInTheDocument()
})

test("device mockups keep the frames when motion is reduced", () => {
  reduceMotion = true
  render(
    <Safari>
      <p>Safari 预览</p>
    </Safari>,
  )
  expect(screen.getByText("https://effect-ui.dev")).toBeInTheDocument()
  expect(screen.getByText("Safari 预览")).toBeInTheDocument()
})

test("terminal reveals only the first command before the interval", () => {
  const { container } = render(<Terminal lines={["pnpm add @effect-ui/registry", "pnpm registry:build"]} />)
  const rows = container.querySelectorAll("pre > div")
  expect(rows[0]).not.toHaveClass("hidden")
  expect(rows[1]).toHaveClass("hidden")
  expect(screen.getByText("pnpm add @effect-ui/registry")).toBeInTheDocument()
})

test("terminal shows every command when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(<Terminal lines={["pnpm add @effect-ui/registry", "pnpm registry:build"]} />)
  const rows = container.querySelectorAll("pre > div")
  expect(rows[0]).not.toHaveClass("hidden")
  expect(rows[1]).not.toHaveClass("hidden")
  expect(screen.getByText("pnpm registry:build")).toBeInTheDocument()
})





test("view transition gallery lists its shots", () => {
  render(<ViewTransitionGallery />)
  expect(screen.getByRole("button", { name: "北岸" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "墨色" })).toBeInTheDocument()
})

test("view transition gallery keeps the shots when motion is reduced", () => {
  reduceMotion = true
  render(<ViewTransitionGallery />)
  expect(screen.getByRole("button", { name: "暮紫" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "潮色" })).toBeInTheDocument()
})





test("prism sweep shows the scene with the default sweep", () => {
  const { container } = render(
    <PrismSweepTransition direction="left" duration={1240} tone="prism" transitionKey={0}>
      <p>洋红</p>
    </PrismSweepTransition>,
  )
  expect(screen.getByText("洋红")).toBeInTheDocument()
  expect(slot(container, "prism-sweep-transition")).toHaveAttribute("data-reduced", "false")
})

test("prism sweep marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(
    <PrismSweepTransition transitionKey={0}>
      <p>洋红</p>
    </PrismSweepTransition>,
  )
  expect(screen.getByText("洋红")).toBeInTheDocument()
  expect(slot(container, "prism-sweep-transition")).toHaveAttribute("data-reduced", "true")
})

test("not found page shows the centered title and the back button", () => {
  const { container } = render(
    <NotFoundPage backLabel="返回" links={helpLinks} title="这一页不在了" variant="centered" />,
  )
  expect(screen.getByText("这一页不在了")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "返回" })).toBeInTheDocument()
  expect(screen.getByRole("link", { name: /文档/ })).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "回到首页" })).toBeInTheDocument()
  expect(slot(container, "not-found-page")).toHaveAttribute("data-variant", "centered")
  expect(slot(container, "not-found-page")).toHaveAttribute("data-reduced", "false")
})

test("not found page marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(<NotFoundPage backLabel="返回" title="这一页不在了" />)
  expect(screen.getByRole("button", { name: "返回" })).toBeInTheDocument()
  expect(slot(container, "not-found-page")).toHaveAttribute("data-reduced", "true")
})
