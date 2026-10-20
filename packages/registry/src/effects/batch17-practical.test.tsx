// @vitest-environment jsdom

import { afterEach, expect, test } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { CommentThread } from "./comment-thread"
import { EmbedCodeGenerator } from "./embed-code-generator"
import { FileUploadQueue } from "./file-upload-queue"
import { PollVote } from "./poll-vote"
import { ScheduleSlotPicker } from "./schedule-slot-picker"
import { SignaturePad } from "./signature-pad"
import { SocialPostFeed } from "./social-post-feed"

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  }),
})

afterEach(() => {
  cleanup()
})

test("上传队列会完成，失败项可以重试", async () => {
  const user = userEvent.setup()
  render(<FileUploadQueue />)
  await user.click(screen.getByRole("button", { name: "加入示例" }))
  expect(screen.getByText("损坏.zip")).toBeInTheDocument()
  expect(await screen.findByRole("button", { name: "重试" }, { timeout: 2500 })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "重试" }))
  await waitFor(() => expect(screen.getAllByText("完成")).toHaveLength(3), { timeout: 3000 })
})

test("嵌入代码跟着宽度和自动播放变化", async () => {
  const user = userEvent.setup()
  render(<EmbedCodeGenerator />)
  const width = screen.getByRole("spinbutton", { name: "宽度" })
  fireEvent.change(width, { target: { value: "640" } })
  await user.click(screen.getByRole("checkbox", { name: "自动播放" }))
  const code = screen.getByRole("textbox", { name: "嵌入代码" }) as HTMLTextAreaElement
  expect(code.value).toContain('width="640"')
  expect(code.value).toContain('data-autoplay="true"')
})

test("帖子可以喜欢，也可以发布", async () => {
  const user = userEvent.setup()
  render(<SocialPostFeed />)
  await user.click(screen.getByRole("button", { name: "喜欢 · 12" }))
  expect(screen.getByRole("button", { name: "已喜欢 · 13" })).toBeInTheDocument()
  await user.type(screen.getByRole("textbox", { name: "新帖子" }), "今晚看星系")
  await user.click(screen.getByRole("button", { name: "发布" }))
  expect(screen.getByText("今晚看星系")).toBeInTheDocument()
})

test("讨论可以回复并收起", async () => {
  const user = userEvent.setup()
  render(<CommentThread />)
  await user.click(screen.getAllByRole("button", { name: "回复" })[0]!)
  await user.type(screen.getByRole("textbox", { name: "回复 林夏" }), "好的")
  await user.click(screen.getByRole("button", { name: "发送" }))
  expect(screen.getByText("好的")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "收起" }))
  expect(screen.queryByText("好的")).not.toBeInTheDocument()
  expect(screen.getByRole("button", { name: "展开 2 条回复" })).toBeInTheDocument()
})

test("示例签名可以写下再清除", async () => {
  const user = userEvent.setup()
  render(<SignaturePad />)
  expect(screen.getByText("空白")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "示例签名" }))
  expect(screen.getByText("已签名")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "清除" }))
  expect(screen.getByText("空白")).toBeInTheDocument()
})

test("投票后显示比例，改投会移动这一票", async () => {
  const user = userEvent.setup()
  render(<PollVote />)
  await user.click(screen.getByRole("radio", { name: /海浪/ }))
  expect(screen.getByText("共 37 票，可以改投。")).toBeInTheDocument()
  await user.click(screen.getByRole("radio", { name: /星系/ }))
  expect(screen.getByRole("radio", { name: /星系/ })).toHaveAttribute("aria-checked", "true")
  expect(screen.getByRole("radio", { name: /海浪/ })).toHaveAttribute("aria-checked", "false")
})

test("时段选择跳过已占，并写出日期", async () => {
  const user = userEvent.setup()
  render(<ScheduleSlotPicker />)
  expect(screen.getByRole("radio", { name: "10:00 已占" })).toBeDisabled()
  await user.click(screen.getByRole("tab", { name: "周二" }))
  await user.click(screen.getByRole("radio", { name: "11:00" }))
  expect(screen.getByText("已选 周二 11:00")).toBeInTheDocument()
})
