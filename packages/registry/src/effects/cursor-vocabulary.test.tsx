// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { CursorFollow } from "./cursor-follow"
import { CursorTrail } from "./cursor-trail"
import { GlareHover } from "./glare-hover"
import { GravityImageTrail } from "./gravity-image-trail"
import { TargetCursor } from "./target-cursor"

import { WobbleLineCursor } from "./wobble-line-cursor"

function installMatchMedia(reduce = false, coarse = false) {
  window.matchMedia = (query: string) =>
    ({
      matches:
        (reduce && query.includes("prefers-reduced-motion")) || (coarse && query.includes("pointer: coarse")),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList
}

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

beforeEach(() => {
  installMatchMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  vi.stubGlobal("ResizeObserver", SilentObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})


test("磁性、倾斜和跟随在不传与传起始值时都能渲染", () => {
                    render(<CursorFollow>跟</CursorFollow>)
  expect(document.querySelector("[aria-hidden]")).toBeTruthy()
})

test("减弱动效时跟随光标不渲染光点", () => {
  installMatchMedia(true)
  render(<CursorFollow>跟</CursorFollow>)
  expect(document.querySelector("[aria-hidden]")).toBeNull()
})

test("跟随光标不传时用 35% 主题色，传入颜色仍保持这个透明度", () => {
  const plain = render(<CursorFollow>跟</CursorFollow>)
  const dot = plain.container.querySelector("[aria-hidden]")
  expect(dot).toHaveClass("bg-primary/35")
  plain.unmount()

  const tinted = render(<CursorFollow color="#112233">跟</CursorFollow>)
  const next = tinted.container.querySelector("[aria-hidden]")
  expect(next).toHaveStyle({ backgroundColor: "rgb(17, 34, 51)", opacity: "0.35" })
  expect(next).not.toHaveClass("bg-primary/35")
  tinted.unmount()

  installMatchMedia(false, true)
  const coarse = render(<CursorFollow>跟</CursorFollow>)
  fireEvent.mouseMove(coarse.container.firstElementChild as HTMLElement, { clientX: 80, clientY: 40 })
  expect(coarse.container.querySelector("[aria-hidden]")).toBeTruthy()
})


test("拖尾在粗指针和减弱动效下停在画面外", () => {
  const view = render(<CursorTrail>尾</CursorTrail>)
  fireEvent.mouseMove(view.container.firstElementChild as HTMLElement, { clientX: 120, clientY: 40 })
  expect(view.container.querySelector("span")).toHaveStyle({ left: "120px" })
  view.unmount()

  installMatchMedia(false, true)
  const coarse = render(<CursorTrail>尾</CursorTrail>)
  fireEvent.mouseMove(coarse.container.firstElementChild as HTMLElement, { clientX: 120, clientY: 40 })
  expect(coarse.container.querySelector("span")).toHaveStyle({ left: "-20px" })
  coarse.unmount()

  installMatchMedia(true)
  const reduced = render(<CursorTrail>尾</CursorTrail>)
  fireEvent.mouseMove(reduced.container.firstElementChild as HTMLElement, { clientX: 120, clientY: 40 })
  expect(reduced.container.querySelector("span")).toHaveStyle({ left: "-20px" })
})

test("拖尾尺寸 10 沿用类名，其它尺寸写内联宽高", () => {
  const same = render(<CursorTrail size={10}>尾</CursorTrail>)
  expect(same.container.querySelector("span")).toHaveClass("size-2.5")
  same.unmount()
  const next = render(<CursorTrail size={20} intensity={0.5} color="#112233">尾</CursorTrail>)
  const dot = next.container.querySelector("span")
  expect(dot).toHaveStyle({ width: "20px", height: "20px", backgroundColor: "#112233" })
  expect(dot).not.toHaveClass("size-2.5")
})


test("高光扫过不传时保留白光带，减弱动效时不渲染光带", () => {
  const { container } = render(<GlareHover />)
  expect(container.innerHTML).toContain("via-white/75")
  expect(container.innerHTML).toContain("duration-700")
  expect(container.innerHTML).toContain("pointer-coarse:opacity-100")
  cleanup()
  installMatchMedia(true)
  const reduced = render(<GlareHover />)
  expect(reduced.container.querySelector("[aria-hidden]")).toBeNull()
})

test("高光宽度倍率会写成百分比", () => {
  const { container } = render(<GlareHover scale={2} />)
  expect(container.querySelector("[aria-hidden]")).toHaveStyle({ width: "100%" })
})

test("传入白色与不传一样保留高光类名", () => {
  const { container } = render(<GlareHover color="#ffffff" intensity={1} />)
  expect(container.innerHTML).toContain("via-white/75")
})

test("琴弦默认 5 根，颜色和根数会生效，粗指针不拨动", () => {
  const view = render(<WobbleLineCursor />)
  expect(screen.getByLabelText("可以被拨动的弦").querySelectorAll("path")).toHaveLength(5)
  fireEvent.pointerMove(view.container.firstElementChild as HTMLElement, { clientX: 10, clientY: 10 })
  view.unmount()

  installMatchMedia(false, true)
  const coarse = render(<WobbleLineCursor lines={3} color="#112233" />)
  const before = coarse.container.querySelector("path")?.getAttribute("d")
  fireEvent.pointerMove(coarse.container.firstElementChild as HTMLElement, { clientX: 10, clientY: 10 })
  const paths = screen.getByLabelText("可以被拨动的弦").querySelectorAll("path")
  expect(paths).toHaveLength(3)
  expect(paths[0]).toHaveAttribute("stroke", "#112233")
  expect(paths[0]?.getAttribute("d")).toBe(before)
  coarse.unmount()

  installMatchMedia(true)
  const reduced = render(<WobbleLineCursor />)
  const straight = reduced.container.querySelector("path")?.getAttribute("d")
  fireEvent.pointerMove(reduced.container.firstElementChild as HTMLElement, { clientX: 80, clientY: 40 })
  expect(reduced.container.querySelector("path")?.getAttribute("d")).toBe(straight)
})

test("目标括号默认 28，强度会缩短角标", () => {
  const same = render(<TargetCursor />)
  expect(same.container.querySelector("[data-slot='target-cursor']")).toBeTruthy()
  expect(same.container.innerHTML).toContain("size-3")
  same.unmount()
  const next = render(<TargetCursor intensity={0.5} size={40} />)
  expect(next.container.querySelector("span")).toHaveStyle({ width: "6px" })
  expect(next.container.innerHTML).not.toContain("size-3")
})

test("画布光标在不传和传入新 prop 时都能挂上标记", () => {
  const gravity = render(<GravityImageTrail />)
  expect(screen.getByLabelText(/沿指针落下的图片/)).toBeTruthy()
  gravity.unmount()
  render(<GravityImageTrail size={40} gap={10} intensity={0.5} speed={1.5} />)
  expect(screen.getByLabelText(/沿指针落下的图片/)).toBeTruthy()
})

