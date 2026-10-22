// @vitest-environment jsdom

import { fireEvent, render, renderHook } from "@testing-library/react"
import { useRef, type RefObject } from "react"
import { expect, test, vi } from "vitest"

import { useDismiss } from "./use-dismiss"
import { useHoverGesture } from "./use-hover-gesture"
import { useTapGesture } from "./use-tap-gesture"

test("鼠标进入算悬停，触屏进入不算", () => {
  const { result } = renderHook(() => useHoverGesture())
  expect(result.current.enter({ pointerId: 1, pointerType: "mouse", buttons: 0 })).toBe(true)
  expect(result.current.enter({ pointerId: 2, pointerType: "touch", buttons: 1 })).toBe(false)
})

test("start 记下这次点击，take 取走之后为空", () => {
  const { result } = renderHook(() => useTapGesture<string>())
  result.current.start({ pointerType: "mouse" }, "open")
  expect(result.current.take()).toEqual({ pointerType: "mouse", state: "open" })
  expect(result.current.take()).toBeNull()
})

function DismissHost({
  open,
  onDismiss,
}: {
  open: boolean
  onDismiss: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(open, onDismiss, ref as RefObject<HTMLElement | null>)
  return <div ref={ref}>面板</div>
}

test("打开时按 Esc 关闭，关上时不关闭", () => {
  const onDismiss = vi.fn()
  const view = render(<DismissHost open onDismiss={onDismiss} />)
  fireEvent.keyDown(window, { key: "Escape" })
  expect(onDismiss).toHaveBeenCalledOnce()

  onDismiss.mockClear()
  view.rerender(<DismissHost open={false} onDismiss={onDismiss} />)
  fireEvent.keyDown(window, { key: "Escape" })
  expect(onDismiss).not.toHaveBeenCalled()
})
