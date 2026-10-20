"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SocialPostFeedProps {
  className?: string
}

interface Post {
  id: string
  author: string
  body: string
  at: number
  likes: number
  liked: boolean
}

const NOW = Date.UTC(2026, 9, 20, 18, 0, 0)

const INITIAL: Post[] = [
  { id: "p1", author: "林夏", body: "隧道预览已经对着数据节奏了。", at: NOW - 2 * 3600000, likes: 12, liked: false },
  { id: "p2", author: "周宁", body: "相片堆在滚动到一半时最好看。", at: NOW - 26 * 3600000, likes: 4, liked: false },
  { id: "p3", author: "赵衡", body: "风力拉满以后旗帜会卷边。", at: NOW - 3 * 86400000, likes: 9, liked: true },
]

function relative(at: number) {
  const hours = Math.round((NOW - at) / 3600000)
  if (hours < 1) return "刚刚"
  if (hours < 24) return `${hours} 小时前`
  return `${Math.round(hours / 24)} 天前`
}

function SocialPostFeed({ className }: SocialPostFeedProps) {
  const reduced = usePrefersReducedMotion()
  const nextId = React.useRef(4)
  const [draft, setDraft] = React.useState("")
  const [posts, setPosts] = React.useState(INITIAL)

  const publish = () => {
    const body = draft.trim()
    if (!body) return
    nextId.current += 1
    setPosts((current) => [{ id: `p-${nextId.current}`, author: "你", body, at: NOW - 60 * 1000, likes: 0, liked: false }, ...current])
    setDraft("")
  }

  return (
    <section data-slot="social-post-feed" className={cn("w-full space-y-3", className)}>
      <div className="flex gap-2">
        <input
          aria-label="新帖子"
          value={draft}
          placeholder="写一条更新"
          className="h-9 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") publish()
          }}
        />
        <button type="button" className="rounded-md bg-primary px-3 text-sm text-primary-foreground" onClick={publish}>
          发布
        </button>
      </div>
      <ul className="space-y-2">
        {posts.map((post) => (
          <motion.li
            key={post.id}
            layout
            initial={reduced ? false : { y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="rounded-xl border p-3"
          >
            <article>
              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="text-sm font-medium text-foreground">{post.author}</span>
                <time dateTime={new Date(post.at).toISOString()}>{relative(post.at)}</time>
              </div>
              <p className="mt-2 text-sm">{post.body}</p>
              <button
                type="button"
                aria-pressed={post.liked}
                className="mt-2 rounded-md border px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() =>
                  setPosts((current) =>
                    current.map((item) =>
                      item.id === post.id
                        ? { ...item, liked: !item.liked, likes: item.likes + (item.liked ? -1 : 1) }
                        : item,
                    ),
                  )
                }
              >
                {post.liked ? "已喜欢" : "喜欢"} · {post.likes}
              </button>
            </article>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}

export { SocialPostFeed }
