// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { useIsMobile } from "../hooks/use-mobile"
import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion"
import { textStyle } from "../lib/text-style"
import { cn } from "../lib/utils"
import { Badge } from "./badge"
import { Button } from "./button"
import { Card, CardDescription, CardHeader, CardTitle } from "./card"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Input } from "./input"
import { Label } from "./label"
import { Separator } from "./separator"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Textarea } from "./textarea"

let reduceMotion = false
let mobile = false

function media(query: string) {
  return {
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : query.includes("max-width") ? mobile : false,
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
  mobile = false
  vi.stubGlobal("matchMedia", media)
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => {}
  HTMLElement.prototype.releasePointerCapture = () => {}
  HTMLElement.prototype.scrollIntoView = () => {}
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("cn lets a later padding class win", () => {
  expect(cn("px-2", "px-4")).toBe("px-4")
})

test("text style writes only the fields it is given", () => {
  expect(textStyle(undefined, undefined, undefined, undefined, undefined)).toBeUndefined()
  expect(textStyle(undefined, 16, 600, 0.02, "center")).toMatchObject({
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "0.02em",
    textAlign: "center",
  })
})

test("use mobile reports a narrow viewport", () => {
  mobile = true
  function Probe() {
    return <p>{useIsMobile() ? "窄屏" : "宽屏"}</p>
  }
  render(<Probe />)
  expect(screen.getByText("窄屏")).toBeInTheDocument()
})

test("use prefers reduced motion follows the media query", () => {
  reduceMotion = true
  function Probe() {
    return <p>{usePrefersReducedMotion() ? "减弱" : "正常"}</p>
  }
  render(<Probe />)
  expect(screen.getByText("减弱")).toBeInTheDocument()
})

test("button renders its label", () => {
  render(<Button>保存</Button>)
  expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument()
})

test("input accepts typed text", async () => {
  const user = userEvent.setup()
  render(<Input aria-label="名字" />)
  await user.type(screen.getByRole("textbox", { name: "名字" }), "北窗")
  expect(screen.getByRole("textbox", { name: "名字" })).toHaveValue("北窗")
})

test("textarea accepts typed text", async () => {
  const user = userEvent.setup()
  render(<Textarea aria-label="备注" />)
  await user.type(screen.getByRole("textbox", { name: "备注" }), "夜航")
  expect(screen.getByRole("textbox", { name: "备注" })).toHaveValue("夜航")
})

test("label names the field", () => {
  render(
    <div>
      <Label htmlFor="port">港口</Label>
      <Input id="port" />
    </div>,
  )
  expect(screen.getByRole("textbox", { name: "港口" })).toBeInTheDocument()
})

test("card shows the title and description", () => {
  render(
    <Card>
      <CardHeader>
        <CardTitle>灯塔</CardTitle>
        <CardDescription>夜里能看见。</CardDescription>
      </CardHeader>
    </Card>,
  )
  expect(screen.getByText("灯塔")).toBeInTheDocument()
  expect(screen.getByText("夜里能看见。")).toBeInTheDocument()
})

test("badge shows its label", () => {
  render(<Badge>进行中</Badge>)
  expect(screen.getByText("进行中")).toBeInTheDocument()
})

test("separator is decorative by default", () => {
  const { container } = render(<Separator />)
  const line = container.querySelector("[data-slot='separator']")
  expect(line).toHaveAttribute("data-orientation", "horizontal")
  expect(line).toHaveAttribute("role", "none")
})

test("dialog opens and shows the title", async () => {
  const user = userEvent.setup()
  render(
    <Dialog>
      <DialogTrigger>打开对话框</DialogTrigger>
      <DialogContent>
        <DialogTitle>航线</DialogTitle>
        <DialogDescription>从北窗出发。</DialogDescription>
      </DialogContent>
    </Dialog>,
  )
  await user.click(screen.getByRole("button", { name: "打开对话框" }))
  expect(screen.getByRole("dialog", { name: "航线" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument()
})

test("sheet opens from the trigger", async () => {
  const user = userEvent.setup()
  render(
    <Sheet>
      <SheetTrigger>打开侧栏</SheetTrigger>
      <SheetContent>
        <SheetTitle>甲板</SheetTitle>
      </SheetContent>
    </Sheet>,
  )
  await user.click(screen.getByRole("button", { name: "打开侧栏" }))
  expect(screen.getByRole("dialog", { name: "甲板" })).toBeInTheDocument()
})

test("dropdown menu shows the item after opening", async () => {
  const user = userEvent.setup()
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>菜单</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>第一项</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  )
  await user.click(screen.getByRole("button", { name: "菜单" }))
  expect(screen.getByRole("menuitem", { name: "第一项" })).toBeInTheDocument()
})

test("tabs show the selected panel", async () => {
  const user = userEvent.setup()
  render(
    <Tabs defaultValue="north">
      <TabsList>
        <TabsTrigger value="north">北</TabsTrigger>
        <TabsTrigger value="south">南</TabsTrigger>
      </TabsList>
      <TabsContent value="north">北窗</TabsContent>
      <TabsContent value="south">南港</TabsContent>
    </Tabs>,
  )
  expect(screen.getByText("北窗")).toBeInTheDocument()
  await user.click(screen.getByRole("tab", { name: "南" }))
  expect(screen.getByText("南港")).toBeInTheDocument()
})
