"use client"

import * as React from "react"
import { toast } from "sonner"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Separator } from "../ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet"
import { Slider } from "../ui/slider"
import { Switch } from "../ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Textarea } from "../ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  )
}

export function InputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="demo-email">Email</Label>
      <Input id="demo-email" type="email" placeholder="you@effect-ui.dev" />
    </div>
  )
}

export function TextareaDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Textarea placeholder="写一段组件使用备注…" />
      <Textarea placeholder="禁用" disabled />
      <Textarea defaultValue="格式不对" aria-invalid />
    </div>
  )
}

export function LabelDemo() {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">接受开源协议</Label>
    </div>
  )
}

export function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Effect UI</CardTitle>
        <CardDescription>把基础组件和视觉特效放进同一套 registry。</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        复制到项目后即可用 CSS 变量换肤。
      </CardContent>
    </Card>
  )
}

export function BadgeDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  )
}

export function SeparatorDemo() {
  return (
    <div className="w-full max-w-sm space-y-3">
      <p className="text-sm">基础组件</p>
      <Separator />
      <p className="text-sm text-muted-foreground">特效组件</p>
    </div>
  )
}

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>打开对话框</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>安装组件</DialogTitle>
          <DialogDescription>使用 shadcn CLI 从 registry 复制源码。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>知道了</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">打开侧栏</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>文档导航</SheetTitle>
          <SheetDescription>从右侧滑出的面板。</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

export function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">菜单</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>操作</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>复制安装命令</DropdownMenuItem>
        <DropdownMenuItem>查看源码</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function TabsDemo() {
  return (
    <Tabs defaultValue="preview" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview" className="rounded-md border p-4 text-sm">
        实时预览区域
      </TabsContent>
      <TabsContent value="code" className="rounded-md border p-4 font-mono text-sm">
        npx shadcn add …
      </TabsContent>
    </Tabs>
  )
}

export function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">悬停我</Button>
      </TooltipTrigger>
      <TooltipContent>复制到项目，自由改源码</TooltipContent>
    </Tooltip>
  )
}

export function SonnerDemo() {
  return (
    <Button
      onClick={() => toast("组件已加入 registry", { description: "可以继续安装下一个特效。" })}
    >
      触发 Toast
    </Button>
  )
}

export function SwitchDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-2">
        <Switch id="switch-off" />
        <Label htmlFor="switch-off">关</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-on" defaultChecked />
        <Label htmlFor="switch-on">开</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="switch-disabled" disabled />
        <Label htmlFor="switch-disabled">禁用</Label>
      </div>
    </div>
  )
}

export function CheckboxDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-off" />
        <Label htmlFor="checkbox-off">未选</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-on" defaultChecked />
        <Label htmlFor="checkbox-on">已选</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-mixed" checked="indeterminate" onCheckedChange={() => undefined} />
        <Label htmlFor="checkbox-mixed">半选</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-disabled" disabled />
        <Label htmlFor="checkbox-disabled">禁用</Label>
      </div>
    </div>
  )
}

function SelectSample({
  placeholder,
  disabled,
  defaultValue,
}: {
  placeholder: string
  disabled?: boolean
  defaultValue?: string
}) {
  return (
    <Select defaultValue={defaultValue} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="motion">Motion</SelectItem>
        <SelectItem value="css">CSS</SelectItem>
        <SelectItem value="canvas">Canvas</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function SelectDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SelectSample placeholder="选择特效" defaultValue="motion" />
      <SelectSample placeholder="占位" />
      <SelectSample placeholder="禁用" disabled />
    </div>
  )
}

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="one">
        <AccordionTrigger>如何安装？</AccordionTrigger>
        <AccordionContent>用 shadcn CLI 指向本仓库的 registry JSON。</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>可以改主题吗？</AccordionTrigger>
        <AccordionContent>可以。所有颜色都走 CSS 变量，支持亮/暗色。</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">打开 Popover</Button>
      </PopoverTrigger>
      <PopoverContent>轻量浮层，适合说明和快捷设置。</PopoverContent>
    </Popover>
  )
}

export function AvatarDemo() {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
        <AvatarFallback>EU</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>FX</AvatarFallback>
      </Avatar>
    </div>
  )
}

export function SliderDemo() {
  const [value, setValue] = React.useState<number[]>([42])
  return (
    <div className="grid w-full max-w-sm gap-6">
      <div className="space-y-2">
        <Slider value={value} onValueChange={setValue} max={100} step={1} />
        <p className="text-sm text-muted-foreground">当前值：{value[0]}</p>
      </div>
      <Slider defaultValue={[20]} max={100} step={1} disabled />
    </div>
  )
}
