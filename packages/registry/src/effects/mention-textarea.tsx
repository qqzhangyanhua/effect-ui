"use client"

import * as React from "react"

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

export interface MentionCandidate {
  id: string
  label: string
}

export interface MentionToken {
  id: string
  kind: "mention" | "tag"
  label: string
}

export interface MentionValue {
  text: string
  mentions: MentionToken[]
}

export interface MentionTextareaProps {
  people?: MentionCandidate[]
  tags?: MentionCandidate[]
  value?: MentionValue
  onValueChange?: (value: MentionValue) => void
  className?: string
}

const PEOPLE: MentionCandidate[] = [
  { id: "lin", label: "林夏" },
  { id: "zhou", label: "周宁" },
  { id: "zhao", label: "赵衡" },
]

const TAGS: MentionCandidate[] = [
  { id: "design", label: "设计" },
  { id: "ship", label: "发布" },
]

function collect(text: string, people: MentionCandidate[], tags: MentionCandidate[]): MentionToken[] {
  return [
    ...people.filter((person) => text.includes(`@${person.label}`)).map((person) => ({ id: person.id, kind: "mention" as const, label: person.label })),
    ...tags.filter((tag) => text.includes(`#${tag.label}`)).map((tag) => ({ id: tag.id, kind: "tag" as const, label: tag.label })),
  ]
}

function caretPoint(textarea: HTMLTextAreaElement) {
  const mirror = document.createElement("div")
  const style = window.getComputedStyle(textarea)
  mirror.style.position = "absolute"
  mirror.style.visibility = "hidden"
  mirror.style.whiteSpace = "pre-wrap"
  mirror.style.wordWrap = "break-word"
  mirror.style.width = `${textarea.clientWidth}px`
  mirror.style.font = style.font
  mirror.style.padding = style.padding
  mirror.style.border = style.border
  mirror.style.lineHeight = style.lineHeight
  mirror.textContent = textarea.value.slice(0, textarea.selectionStart)
  const marker = document.createElement("span")
  marker.textContent = textarea.value.slice(textarea.selectionStart) || "."
  mirror.appendChild(marker)
  document.body.appendChild(mirror)
  const point = { left: marker.offsetLeft - textarea.scrollLeft, top: marker.offsetTop - textarea.scrollTop + marker.offsetHeight }
  mirror.remove()
  return point
}

function MentionTextarea({ people = PEOPLE, tags = TAGS, value, onValueChange, className }: MentionTextareaProps) {
  const [text, setText] = React.useState(value?.text ?? "")
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [kind, setKind] = React.useState<"mention" | "tag">("mention")
  const [anchor, setAnchor] = React.useState({ left: 0, top: 0 })
  const areaRef = React.useRef<HTMLTextAreaElement>(null)
  const anchorRef = React.useRef<HTMLSpanElement>(null)
  const current = value?.text ?? text

  const emit = (next: string) => {
    if (value === undefined) setText(next)
    onValueChange?.({ text: next, mentions: collect(next, people, tags) })
  }

  const candidates = (kind === "mention" ? people : tags).filter((item) => item.label.includes(query))

  const syncTrigger = (node: HTMLTextAreaElement) => {
    const caret = node.selectionStart ?? 0
    const before = node.value.slice(0, caret)
    const match = /(^|\s)([@#])([^\s@#]*)$/.exec(before)
    if (!match) {
      setOpen(false)
      return
    }
    setKind(match[2] === "#" ? "tag" : "mention")
    setQuery(match[3] ?? "")
    const point = caretPoint(node)
    setAnchor(point)
    setOpen(true)
  }

  const insert = (label: string) => {
    const node = areaRef.current
    if (!node) return
    const caret = node.selectionStart ?? current.length
    const before = current.slice(0, caret)
    const after = current.slice(caret)
    const match = /(^|\s)([@#])([^\s@#]*)$/.exec(before)
    if (!match) return
    const token = `${match[2]}${label} `
    const next = `${before.slice(0, before.length - match[0].length)}${match[1] ?? ""}${token}${after}`
    emit(next)
    setOpen(false)
    const place = next.length - after.length
    requestAnimationFrame(() => {
      node.focus()
      node.setSelectionRange(place, place)
    })
  }

  return (
    <div data-slot="mention-textarea" className={cn("relative", className)}>
      <textarea
        ref={areaRef}
        aria-label="提到某人或话题"
        value={current}
        className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
        onChange={(event) => {
          emit(event.target.value)
          syncTrigger(event.target)
        }}
        onKeyUp={(event) => {
          if (event.currentTarget instanceof HTMLTextAreaElement) syncTrigger(event.currentTarget)
        }}
        onClick={(event) => syncTrigger(event.currentTarget)}
      />
      <span ref={anchorRef} className="pointer-events-none absolute size-1" style={{ left: anchor.left, top: anchor.top }} />
      <Combobox
        open={open}
        onOpenChange={setOpen}
        items={candidates.map((item) => item.label)}
        onValueChange={(next) => {
          if (typeof next === "string") insert(next)
        }}
      >
        <ComboboxContent anchor={anchorRef} side="bottom" align="start">
          <ComboboxEmpty>没有匹配</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {kind === "mention" ? "@" : "#"}
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

export { MentionTextarea }
