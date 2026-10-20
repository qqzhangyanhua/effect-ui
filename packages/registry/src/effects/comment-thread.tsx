"use client"

import * as React from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { ReactionBar, type ReactionItem } from "@/components/ui/reaction-bar"
import { cn } from "@/lib/utils"

export interface ThreadComment {
  id: string
  parentId: string | null
  author: string
  body: string
  resolved?: boolean
  reactions: ReactionItem[]
}

export interface CommentThreadProps {
  className?: string
  comments?: ThreadComment[]
  people?: string[]
}

const PEOPLE = ["林夏", "周宁", "赵衡"]

const STARTER: ThreadComment[] = [
  {
    id: "c1",
    parentId: null,
    author: "林夏",
    body: "这里的间距是不是再松一点？ @周宁",
    reactions: [
      { emoji: "👍", count: 2 },
      { emoji: "❤️", count: 0 },
    ],
  },
  {
    id: "c2",
    parentId: "c1",
    author: "周宁",
    body: "可以，我把标题也一起改。",
    reactions: [
      { emoji: "👍", count: 1 },
      { emoji: "❤️", count: 1 },
    ],
  },
  {
    id: "c3",
    parentId: "c2",
    author: "赵衡",
    body: "改完标成已解决就行。",
    resolved: true,
    reactions: [
      { emoji: "👍", count: 0 },
      { emoji: "❤️", count: 0 },
    ],
  },
]

function emptyReactions(): ReactionItem[] {
  return [
    { emoji: "👍", count: 0 },
    { emoji: "❤️", count: 0 },
  ]
}

function MentionText({ body }: { body: string }) {
  const parts = body.split(/(@[\w\u4e00-\u9fa5]+)/g)
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("@") ? (
          <mark key={`${part}-${index}`} className="rounded bg-primary/15 px-0.5 text-primary">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  )
}

function CommentThread({ className, comments: commentsProp, people = PEOPLE }: CommentThreadProps) {
  const [comments, setComments] = React.useState(commentsProp ?? STARTER)
  const [draft, setDraft] = React.useState("")
  const [replyTo, setReplyTo] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<string | null>(null)
  const [editDraft, setEditDraft] = React.useState("")
  const [menu, setMenu] = React.useState<string | null>(null)

  const childrenOf = (parentId: string | null) => comments.filter((comment) => comment.parentId === parentId)

  const send = () => {
    const body = draft.trim()
    if (!body) return
    const parent = comments.find((comment) => comment.id === replyTo)
    const depth = parent ? depthOf(parent.id) : 0
    setComments((current) => [
      ...current,
      {
        id: `local-${current.length + 1}`,
        parentId: depth >= 3 ? parent?.parentId ?? null : replyTo,
        author: "你",
        body,
        reactions: emptyReactions(),
      },
    ])
    setDraft("")
    setReplyTo(null)
  }

  const depthOf = (id: string, guard = 0): number => {
    if (guard > 6) return 3
    const comment = comments.find((item) => item.id === id)
    if (!comment?.parentId) return 1
    return depthOf(comment.parentId, guard + 1) + 1
  }

  const removeTree = (id: string) => {
    const drop = new Set<string>([id])
    let grew = true
    while (grew) {
      grew = false
      for (const comment of comments) {
        if (comment.parentId && drop.has(comment.parentId) && !drop.has(comment.id)) {
          drop.add(comment.id)
          grew = true
        }
      }
    }
    setComments((current) => current.filter((comment) => !drop.has(comment.id)))
  }

  const renderNode = (comment: ThreadComment, depth: number): React.ReactNode => {
    if (depth > 3) return null
    return (
      <li key={comment.id} className={cn(depth > 1 && "ml-4 border-l border-border pl-3")}>
        <article className={cn("rounded-lg border p-3", comment.resolved && "opacity-70")}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{comment.author}</span>
            <div className="flex items-center gap-2">
              {comment.resolved ? <span className="text-xs text-emerald-600">已解决</span> : null}
              <button type="button" className="text-xs" aria-expanded={menu === comment.id} onClick={() => setMenu(menu === comment.id ? null : comment.id)}>
                更多
              </button>
            </div>
          </div>
          {menu === comment.id ? (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="rounded-md border px-2 py-1 text-xs"
                onClick={() => {
                  setEditing(comment.id)
                  setEditDraft(comment.body)
                  setMenu(null)
                }}
              >
                编辑
              </button>
              <button
                type="button"
                className="rounded-md border px-2 py-1 text-xs"
                onClick={() => {
                  removeTree(comment.id)
                  setMenu(null)
                }}
              >
                删除
              </button>
              <button
                type="button"
                className="rounded-md border px-2 py-1 text-xs"
                onClick={() => {
                  setComments((current) => current.map((item) => (item.id === comment.id ? { ...item, resolved: !item.resolved } : item)))
                  setMenu(null)
                }}
              >
                {comment.resolved ? "重新打开" : "标为已解决"}
              </button>
            </div>
          ) : null}
          {editing === comment.id ? (
            <form
              className="mt-2 space-y-2"
              onSubmit={(event) => {
                event.preventDefault()
                setComments((current) => current.map((item) => (item.id === comment.id ? { ...item, body: editDraft } : item)))
                setEditing(null)
              }}
            >
              <textarea aria-label="编辑评论" value={editDraft} onChange={(event) => setEditDraft(event.target.value)} className="min-h-16 w-full rounded-md border px-2 py-1 text-sm" />
              <button type="submit" className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground">
                保存
              </button>
            </form>
          ) : (
            <p className="mt-2 text-sm">
              <MentionText body={comment.body} />
            </p>
          )}
          <ReactionBar
            className="mt-2"
            items={comment.reactions}
            onToggle={(emoji) =>
              setComments((current) =>
                current.map((item) =>
                  item.id === comment.id
                    ? {
                        ...item,
                        reactions: item.reactions.map((reaction) =>
                          reaction.emoji === emoji
                            ? { ...reaction, active: !reaction.active, count: reaction.count + (reaction.active ? -1 : 1) }
                            : reaction,
                        ),
                      }
                    : item,
                ),
              )
            }
          />
          {depth < 3 ? (
            <button type="button" className="mt-2 text-xs text-primary" onClick={() => setReplyTo(comment.id)}>
              回复
            </button>
          ) : null}
        </article>
        <ul className="mt-2 space-y-2">{childrenOf(comment.id).map((child) => renderNode(child, depth + 1))}</ul>
      </li>
    )
  }

  return (
    <div data-slot="comment-thread" className={cn("w-full max-w-xl space-y-3", className)}>
      <ul className="space-y-3">{childrenOf(null).map((comment) => renderNode(comment, 1))}</ul>
      <form
        className="space-y-2 rounded-xl border p-3"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <p className="text-xs text-muted-foreground">{replyTo ? "正在回复" : "写一条评论"} · ⌘ Enter 或 Ctrl Enter 发送</p>
        <Combobox
          items={people}
          onValueChange={(value) => {
            if (typeof value === "string" && value) setDraft((current) => `${current}${current.endsWith(" ") || current.length === 0 ? "" : " "}@${value} `)
          }}
        >
          <ComboboxInput aria-label="提及某人" placeholder="提及某人" showTrigger={false} />
          <ComboboxContent>
            <ComboboxEmpty>没有匹配的人</ComboboxEmpty>
            <ComboboxList>
              {(person: string) => (
                <ComboboxItem key={person} value={person}>
                  {person}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <textarea
          aria-label="评论"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              send()
            }
          }}
          className="min-h-20 w-full rounded-md border bg-background px-2 py-1.5 text-sm"
        />
        <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          发送
        </button>
      </form>
    </div>
  )
}

export { CommentThread }
