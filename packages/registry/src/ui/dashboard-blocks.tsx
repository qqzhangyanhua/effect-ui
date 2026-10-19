"use client"

import type { ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export type DashboardVariant = "analytics" | "sales" | "ops"

export interface DashboardBlocksProps {
  variant?: DashboardVariant
  className?: string
}

const chartData = [
  { name: "周一", value: 24 },
  { name: "周二", value: 38 },
  { name: "周三", value: 29 },
  { name: "周四", value: 44 },
  { name: "周五", value: 36 },
]

const kpis = [
  { label: "访问", value: "18.2k", delta: "+12%" },
  { label: "转化", value: "3.4%", delta: "+0.4%" },
  { label: "收入", value: "$24.8k", delta: "+8%" },
]

function Frame({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("overflow-hidden rounded-2xl border bg-background", className)}>{children}</section>
}

function KpiRow() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {kpis.map((item) => (
        <Card key={item.label} className="py-4">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-xs font-normal text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between px-4">
            <p className="font-display text-2xl">{item.value}</p>
            <Badge variant="secondary">{item.delta}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function MiniChart() {
  return (
    <ChartContainer className="h-40 w-full" config={{ value: { label: "指标", color: "var(--primary)" } }}>
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

function Analytics() {
  return (
    <Frame className="grid gap-4 p-4 md:grid-cols-[160px_1fr]">
      <aside className="hidden space-y-2 rounded-xl bg-sidebar p-3 text-sm md:block">
        {["总览", "流量", "漏斗", "设置"].map((item, index) => (
          <div key={item} className={cn("rounded-md px-2 py-1.5", index === 0 && "bg-sidebar-accent text-sidebar-accent-foreground")}>
            {item}
          </div>
        ))}
      </aside>
      <div className="space-y-4">
        <KpiRow />
        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">本周趋势</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <MiniChart />
          </CardContent>
        </Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>来源</TableHead>
              <TableHead>会话</TableHead>
              <TableHead>转化</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ["文档站", "8,210", "4.1%"],
              ["GitHub", "5,004", "2.8%"],
              ["搜索", "3,112", "1.6%"],
            ].map(([source, sessions, rate]) => (
              <TableRow key={source}>
                <TableCell>{source}</TableCell>
                <TableCell>{sessions}</TableCell>
                <TableCell>{rate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Frame>
  )
}

function Sales() {
  return (
    <Frame className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl">销售看板</h3>
        <Badge>本月</Badge>
      </div>
      <KpiRow />
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">订单漏斗</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4">
            {[
              ["浏览", 92],
              ["加购", 54],
              ["结账", 31],
              ["付款", 22],
            ].map(([label, width]) => (
              <div key={String(label)}>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{label}</span>
                  <span>{width}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">最近订单</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 text-sm">
            {["#1842 · $128 · 已发货", "#1841 · $64 · 处理中", "#1840 · $240 · 已付款"].map((row) => (
              <div key={row} className="rounded-lg border px-3 py-2">
                {row}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Frame>
  )
}

function Ops() {
  return (
    <Frame className="space-y-4 p-4">
      <h3 className="font-display text-xl">运维看板</h3>
      <div className="grid gap-3 md:grid-cols-3">
        {[
          ["API", "正常", "99.98%"],
          ["构建", "排队 1", "4m"],
          ["错误", "3 条", "24h"],
        ].map(([title, status, meta]) => (
          <Card key={title} className="py-4">
            <CardHeader className="px-4 pb-1">
              <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-lg font-medium">{status}</p>
              <p className="text-xs text-muted-foreground">{meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">活动流</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 text-sm text-muted-foreground">
          <p>09:14 部署 `cursor/batch5` 成功</p>
          <p>09:02 类型检查通过</p>
          <p>08:51 有人打开了 PR #3</p>
        </CardContent>
      </Card>
    </Frame>
  )
}

function DashboardBlocks({ variant = "analytics", className }: DashboardBlocksProps) {
  return (
    <div className={className}>
      {variant === "sales" ? <Sales /> : variant === "ops" ? <Ops /> : <Analytics />}
    </div>
  )
}

export { DashboardBlocks }
