// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"
import { toast } from "sonner"

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: () => undefined }),
}))

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog"
import { AspectRatio } from "./aspect-ratio"
import { Avatar, AvatarFallback } from "./avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb"
import { Calendar } from "./calendar"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./carousel"
import { Checkbox } from "./checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Slider } from "./slider"
import { Toaster } from "./sonner"
import { Switch } from "./switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }))
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => {}
  HTMLElement.prototype.releasePointerCapture = () => {}
  HTMLElement.prototype.scrollIntoView = () => {}
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("tooltip shows its text on hover", async () => {
  const user = userEvent.setup()
  render(
    <Tooltip>
      <TooltipTrigger>悬停</TooltipTrigger>
      <TooltipContent>灯塔在北</TooltipContent>
    </Tooltip>,
  )
  await user.hover(screen.getByRole("button", { name: "悬停" }))
  expect(await screen.findByRole("tooltip")).toHaveTextContent("灯塔在北")
})

test("toaster shows a toast", async () => {
  render(<Toaster />)
  toast("夜航提醒")
  expect(await screen.findByText("夜航提醒")).toBeInTheDocument()
})

test("switch toggles when clicked", async () => {
  const user = userEvent.setup()
  render(<Switch aria-label="通知" />)
  const control = screen.getByRole("switch", { name: "通知" })
  expect(control).not.toBeChecked()
  await user.click(control)
  expect(control).toBeChecked()
})

test("checkbox toggles when clicked", async () => {
  const user = userEvent.setup()
  render(<Checkbox aria-label="已读" />)
  const control = screen.getByRole("checkbox", { name: "已读" })
  expect(control).not.toBeChecked()
  await user.click(control)
  expect(control).toBeChecked()
})

test("select opens its option", async () => {
  const user = userEvent.setup()
  render(
    <Select>
      <SelectTrigger aria-label="港口">
        <SelectValue placeholder="选港口" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="north">北窗</SelectItem>
      </SelectContent>
    </Select>,
  )
  await user.click(screen.getByRole("combobox", { name: "港口" }))
  expect(await screen.findByRole("option", { name: "北窗" })).toBeInTheDocument()
})

test("accordion reveals the panel", async () => {
  const user = userEvent.setup()
  render(
    <Accordion type="single" collapsible>
      <AccordionItem value="route">
        <AccordionTrigger>航线</AccordionTrigger>
        <AccordionContent>从北窗出发</AccordionContent>
      </AccordionItem>
    </Accordion>,
  )
  await user.click(screen.getByRole("button", { name: "航线" }))
  expect(screen.getByText("从北窗出发")).toBeInTheDocument()
})

test("popover shows its content", async () => {
  const user = userEvent.setup()
  render(
    <Popover>
      <PopoverTrigger>打开</PopoverTrigger>
      <PopoverContent>雾还没散</PopoverContent>
    </Popover>,
  )
  await user.click(screen.getByRole("button", { name: "打开" }))
  expect(await screen.findByText("雾还没散")).toBeInTheDocument()
})

test("avatar shows the fallback initials", () => {
  render(
    <Avatar>
      <AvatarFallback>北</AvatarFallback>
    </Avatar>,
  )
  expect(screen.getByText("北")).toBeInTheDocument()
})

test("slider uses the default range", () => {
  const { container } = render(<Slider aria-label="亮度" defaultValue={[20]} />)
  expect(container.querySelector("[data-slot='slider']")).toHaveAttribute("aria-label", "亮度")
  const thumb = screen.getByRole("slider")
  expect(thumb).toHaveAttribute("aria-valuemin", "0")
  expect(thumb).toHaveAttribute("aria-valuemax", "100")
  expect(thumb).toHaveAttribute("aria-valuenow", "20")
})

test("alert shows the title", () => {
  render(
    <Alert>
      <AlertTitle>注意</AlertTitle>
      <AlertDescription>有雾。</AlertDescription>
    </Alert>,
  )
  expect(screen.getByRole("alert")).toHaveTextContent("注意")
  expect(screen.getByText("有雾。")).toBeInTheDocument()
})

test("alert dialog opens the confirmation", async () => {
  const user = userEvent.setup()
  render(
    <AlertDialog>
      <AlertDialogTrigger>确认</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>离开港口</AlertDialogTitle>
        <AlertDialogDescription>这会结束这一班。</AlertDialogDescription>
        <AlertDialogAction>继续</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>,
  )
  await user.click(screen.getByRole("button", { name: "确认" }))
  expect(await screen.findByRole("alertdialog", { name: "离开港口" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "继续" })).toBeInTheDocument()
})

test("aspect ratio keeps its child", () => {
  render(
    <AspectRatio ratio={16 / 9}>
      <p>海面</p>
    </AspectRatio>,
  )
  expect(screen.getByText("海面")).toBeInTheDocument()
})

test("breadcrumb marks the current page", () => {
  render(
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">首页</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>灯塔</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  )
  expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "首页" })).toHaveAttribute("href", "#home")
  expect(screen.getByText("灯塔")).toHaveAttribute("aria-current", "page")
})

test("calendar renders a month grid", () => {
  render(<Calendar />)
  expect(screen.getByRole("grid")).toBeInTheDocument()
})

test("carousel shows the first slide and the next button", () => {
  render(
    <Carousel>
      <CarouselContent>
        <CarouselItem>第一张</CarouselItem>
        <CarouselItem>第二张</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>,
  )
  expect(screen.getByText("第一张")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument()
})
