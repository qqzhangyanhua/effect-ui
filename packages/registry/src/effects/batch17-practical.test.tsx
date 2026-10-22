// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"

vi.mock("@number-flow/react", () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>,
}))
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { EmbedCodeGenerator } from "./embed-code-generator"
import { FileUploadQueue } from "./file-upload-queue"
import { PollVote } from "./poll-vote"
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

test("上传队列会完成，损坏文件可以重试", async () => {
  const user = userEvent.setup()
  render(<FileUploadQueue />)
  await user.click(screen.getByRole("button", { name: "加入示例" }))
  expect(screen.getByText("损坏.zip")).toBeInTheDocument()
  expect(await screen.findByRole("button", { name: "重试" }, { timeout: 2500 })).toBeInTheDocument()
  await waitFor(() => expect(screen.getAllByText("完成")).toHaveLength(2), { timeout: 3000 })
  await user.click(screen.getByRole("button", { name: "重试" }))
  expect(await screen.findByText("失败", {}, { timeout: 2500 })).toBeInTheDocument()
})

test("嵌入代码跟着宽度和自动播放变化", async () => {
  const user = userEvent.setup()
  const { container } = render(<EmbedCodeGenerator />)
  expect(container.textContent).toContain("480px")
  await user.click(screen.getAllByRole("button", { name: "增加" })[0]!)
  expect(container.textContent).toContain("481px")
  await user.click(screen.getByRole("checkbox", { name: "自动播放" }))
  expect(container.textContent).toContain('data-autoplay="false"')
})

test("帖子可以反应，也可以发布和展开", async () => {
  const user = userEvent.setup()
  render(<SocialPostFeed />)
  const reaction = screen.getAllByRole("button", { pressed: false })[0]!
  await user.click(reaction)
  expect(reaction).toHaveAttribute("aria-pressed", "true")
  await user.click(screen.getByRole("button", { name: "展开更多" }))
  expect(screen.getByText(/我们决定把周五留空/)).toBeInTheDocument()
  await user.type(screen.getByRole("textbox", { name: "写一条帖子" }), "今晚看星系")
  await user.click(screen.getByRole("button", { name: "发布" }))
  expect(screen.getByText("今晚看星系")).toBeInTheDocument()
})

test("输入姓名可以生成签名再清除", async () => {
  const user = userEvent.setup()
  render(<SignaturePad />)
  expect(screen.getByText("未签名")).toBeInTheDocument()
  await user.type(screen.getByRole("textbox", { name: "姓名" }), "林夏")
  await user.click(screen.getByRole("button", { name: "生成签名" }))
  expect(screen.getByText("已签名")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "清除" }))
  expect(screen.getByText("未签名")).toBeInTheDocument()
})

test("投票后显示比例和总票数", async () => {
  const user = userEvent.setup()
  render(<PollVote />)
  await user.click(screen.getByRole("radio", { name: "本周发布" }))
  expect(screen.getByText("共 37 票")).toBeInTheDocument()
  expect(screen.getByRole("radio", { name: /本周发布/ })).toHaveAttribute("aria-checked", "true")
  expect(screen.getByText(/截止/)).toBeInTheDocument()
})
