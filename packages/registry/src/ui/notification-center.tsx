"use client"

import * as React from "react"
import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface NotificationItem {
  id: string
  title: string
  body: string
  time: string
  unread?: boolean
}

export interface NotificationCenterProps {
  items?: NotificationItem[]
  className?: string
}

const sample: NotificationItem[] = [
  { id: "1", title: "构建完成", body: "registry 已生成 180+ 条目。", time: "刚刚", unread: true },
  { id: "2", title: "新评论", body: "有人在 holographic-foil 下留言。", time: "12 分钟前", unread: true },
  { id: "3", title: "周报", body: "本周新增 15 个组件。", time: "昨天", unread: false },
]

function NotificationCenter({ items = sample, className }: NotificationCenterProps) {
  const [list, setList] = React.useState(items)
  const unread = list.filter((item) => item.unread).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className={cn("relative", className)} aria-label="通知">
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] text-white">
              {unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-medium">通知</p>
          <button type="button" className="text-xs text-primary" onClick={() => setList((current) => current.map((item) => ({ ...item, unread: false })))}>
            全部已读
          </button>
        </div>
        <ul className="max-h-72 overflow-auto">
          {list.map((item) => (
            <li key={item.id} className="border-b px-3 py-2 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.title}</p>
                {item.unread ? <span className="size-1.5 rounded-full bg-primary" /> : null}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.body}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{item.time}</p>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export { NotificationCenter }
