"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface CommentThreadProps {
  className?: string
}

interface Reply {
  id: string
  author: string
  body: string
}

interface Comment {
  id: string
  author: string
  body: string
  replies: Reply[]
  collapsed: boolean
}

const INITIAL: Comment[] = [
  {
    id: "c1",
    author: "林夏",
    body: "透视圈的边缘可以再软一点。",
    collapsed: false,
    replies: [{ id: "r1", author: "周宁", body: "我把噪声幅度收到 0.01 了。" }],
  },
  {
    id: "c2",
    author: "赵衡",
    body: "签名示例要能一键清掉。",
    collapsed: false,
    replies: [],
  },
]

function CommentThread({ className }: CommentThreadProps) {
  const nextId = React.useRef(3)
  const [comments, setComments] = React.useState(INITIAL)
  const [replyFor, setReplyFor] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState("")

  const send = (parentId: string) => {
    const body = draft.trim()
    if (!body) return
    nextId.current += 1
    const reply = { id: `r-${nextId.current}`, author: "你", body }
    setComments((current) =>
      current.map((comment) =>
        comment.id === parentId ? { ...comment, collapsed: false, replies: [...comment.replies, reply] } : comment,
      ),
    )
    setDraft("")
    setReplyFor(null)
  }

  return (
    <section data-slot="comment-thread" className={cn("w-full space-y-3", className)}>
      <h2 className="text-sm font-medium">讨论</h2>
      <ul className="space-y-3">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-xl border p-3">
            <article>
              <p className="text-sm font-medium">{comment.author}</p>
              <p className="mt-1 text-sm">{comment.body}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => {
                    setReplyFor(comment.id)
                    setDraft("")
                  }}
                >
                  回复
                </button>
                {comment.replies.length > 0 ? (
                  <button
                    type="button"
                    aria-expanded={!comment.collapsed}
                    className="text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() =>
                      setComments((current) =>
                        current.map((item) => (item.id === comment.id ? { ...item, collapsed: !item.collapsed } : item)),
                      )
                    }
                  >
                    {comment.collapsed ? `展开 ${comment.replies.length} 条回复` : "收起"}
                  </button>
                ) : null}
              </div>
              {replyFor === comment.id ? (
                <form
                  className="mt-2 flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault()
                    send(comment.id)
                  }}
                >
                  <input
                    aria-label={`回复 ${comment.author}`}
                    value={draft}
                    className="h-8 flex-1 rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onChange={(event) => setDraft(event.target.value)}
                  />
                  <button type="submit" className="rounded-md bg-primary px-2 text-xs text-primary-foreground">
                    发送
                  </button>
                </form>
              ) : null}
              {comment.collapsed ? null : (
                <ul className="mt-3 space-y-2 border-l pl-3">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <p className="text-xs font-medium">{reply.author}</p>
                      <p className="text-sm">{reply.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

export { CommentThread }
