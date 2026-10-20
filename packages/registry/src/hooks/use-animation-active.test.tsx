// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react"
import { useRef, type RefObject } from "react"
import { afterEach, expect, test, vi } from "vitest"

import { useAnimationActive } from "./use-animation-active"

type Hit = { isIntersecting: boolean }

let hits: ((entries: Hit[]) => void) | undefined
let observed: Element | undefined
let disconnects = 0

class FakeObserver {
  constructor(callback: (entries: Hit[]) => void) {
    hits = callback
  }

  observe(node: Element) {
    observed = node
  }

  disconnect() {
    disconnects += 1
  }
}

function Probe({ target }: { target?: RefObject<Element | null> }) {
  const own = useRef<HTMLDivElement>(null)
  const active = useAnimationActive(target ?? own)
  return (
    <div ref={own} data-testid="node">
      {active ? "播放" : "暂停"}
    </div>
  )
}

function setVisible(visible: boolean) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => (visible ? "visible" : "hidden"),
  })
  document.dispatchEvent(new Event("visibilitychange"))
}

afterEach(() => {
  cleanup()
  hits = undefined
  observed = undefined
  disconnects = 0
  vi.unstubAllGlobals()
})

test("视口内且标签页可见时播放，离开或隐藏时暂停", () => {
  vi.stubGlobal("IntersectionObserver", FakeObserver)
  setVisible(true)
  render(<Probe />)

  expect(screen.getByText("暂停")).toBeTruthy()
  expect(observed).toBe(screen.getByTestId("node"))

  act(() => {
    hits?.([{ isIntersecting: true }])
  })
  expect(screen.getByText("播放")).toBeTruthy()

  act(() => {
    setVisible(false)
  })
  expect(screen.getByText("暂停")).toBeTruthy()

  act(() => {
    setVisible(true)
  })
  expect(screen.getByText("播放")).toBeTruthy()

  act(() => {
    hits?.([{ isIntersecting: false }])
  })
  expect(screen.getByText("暂停")).toBeTruthy()
})

test("没有观察器或目标时保持暂停，卸载时断开观察", () => {
  vi.stubGlobal("IntersectionObserver", undefined)
  setVisible(true)
  const { unmount } = render(<Probe />)
  expect(screen.getByText("暂停")).toBeTruthy()
  unmount()

  vi.stubGlobal("IntersectionObserver", FakeObserver)
  const empty = { current: null }
  const hidden = render(<Probe target={empty} />)
  expect(screen.getByText("暂停")).toBeTruthy()
  expect(observed).toBeUndefined()

  hidden.unmount()
  const mounted = render(<Probe />)
  expect(observed).toBeTruthy()
  mounted.unmount()
  expect(disconnects).toBeGreaterThan(0)
})
