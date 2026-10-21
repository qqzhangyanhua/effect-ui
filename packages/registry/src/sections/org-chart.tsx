"use client"

import * as React from "react"
import { LayoutGroup, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface OrgNode {
  id: string
  name: string
  title: string
  children?: OrgNode[]
}

export interface OrgChartProps {
  root?: OrgNode
  className?: string
}

const CARD_W = 168
const CARD_H = 72
const GAP_X = 28
const GAP_Y = 72

const DEFAULT_ROOT: OrgNode = {
  id: "lin",
  name: "林夏",
  title: "负责人",
  children: [
    {
      id: "zhou",
      name: "周宁",
      title: "设计",
      children: [{ id: "chen", name: "陈可", title: "品牌" }],
    },
    { id: "zhao", name: "赵衡", title: "工程" },
  ],
}

interface Placed {
  id: string
  name: string
  title: string
  x: number
  y: number
  hasChildren: boolean
}

function layoutTree(node: OrgNode, left: number, depth: number, collapsed: Set<string>) {
  const nodes: Placed[] = []
  const edges: { from: string; to: string }[] = []
  const walk = (current: OrgNode, start: number, level: number): number => {
    const children = collapsed.has(current.id) ? [] : current.children ?? []
    if (children.length === 0) {
      nodes.push({ id: current.id, name: current.name, title: current.title, x: start + CARD_W / 2, y: level * (CARD_H + GAP_Y), hasChildren: Boolean(current.children?.length) })
      return CARD_W
    }
    let cursor = start
    children.forEach((child) => {
      const width = walk(child, cursor, level + 1)
      edges.push({ from: current.id, to: child.id })
      cursor += width + GAP_X
    })
    const total = cursor - start - GAP_X
    nodes.push({
      id: current.id,
      name: current.name,
      title: current.title,
      x: start + total / 2,
      y: level * (CARD_H + GAP_Y),
      hasChildren: true,
    })
    return total
  }
  const width = walk(node, left, depth)
  return { nodes, edges, width }
}

function findPath(node: OrgNode, query: string, trail: string[] = []): string[] | null {
  const next = [...trail, node.id]
  if (query && (node.name.includes(query) || node.title.includes(query))) return next
  for (const child of node.children ?? []) {
    const found = findPath(child, query, next)
    if (found) return found
  }
  return null
}

function OrgChart({ root = DEFAULT_ROOT, className }: OrgChartProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const zoomRef = React.useRef(1)
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set())
  const [active, setActive] = React.useState("")
  const [query, setQuery] = React.useState("")
  const [pan, setPan] = React.useState({ x: 24, y: 24 })
  const [zoom, setZoom] = React.useState(1)
  const dragRef = React.useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const placed = React.useMemo(() => layoutTree(root, 0, 0, collapsed), [collapsed, root])

  React.useEffect(() => {
    const node = hostRef.current
    if (!node) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const next = Math.min(2.2, Math.max(0.45, zoomRef.current + (event.deltaY < 0 ? 0.08 : -0.08)))
      zoomRef.current = next
      setZoom(next)
    }
    node.addEventListener("wheel", onWheel, { passive: false })
    return () => node.removeEventListener("wheel", onWheel)
  }, [])

  const search = (value: string) => {
    setQuery(value)
    const path = findPath(root, value.trim())
    if (!path) {
      setActive("")
      return
    }
    const nextCollapsed = new Set(collapsed)
    path.forEach((id) => nextCollapsed.delete(id))
    const nextPlaced = layoutTree(root, 0, 0, nextCollapsed)
    const hit = path[path.length - 1]
    const node = nextPlaced.nodes.find((item) => item.id === hit)
    setCollapsed(nextCollapsed)
    setActive(hit ?? "")
    const host = hostRef.current
    if (node && host) {
      const rect = host.getBoundingClientRect()
      setPan({
        x: rect.width / 2 - node.x * zoomRef.current,
        y: rect.height / 2 - (node.y + CARD_H / 2) * zoomRef.current,
      })
    }
  }

  return (
    <section data-slot="org-chart" className={cn("w-full space-y-3", className)}>
      <label className="flex items-center gap-2 text-sm">
        搜索
        <input role="searchbox" aria-label="搜索成员" value={query} onChange={(event) => search(event.target.value)} className="h-9 rounded-md border px-2" placeholder="姓名或职位" />
      </label>
      <div
        ref={hostRef}
        className="relative h-96 overflow-hidden rounded-xl border bg-muted/30"
        onPointerDown={(event) => {
          const target = event.target
          if (target instanceof HTMLElement && target.closest("button, input, article")) return
          dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current
          if (!drag) return
          setPan({ x: drag.panX + event.clientX - drag.x, y: drag.panY + event.clientY - drag.y })
        }}
        onPointerUp={() => {
          dragRef.current = null
        }}
      >
        <div className="absolute top-0 left-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0", width: placed.width, height: 480 }}>
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            {placed.edges.map((edge) => {
              const from = placed.nodes.find((item) => item.id === edge.from)
              const to = placed.nodes.find((item) => item.id === edge.to)
              if (!from || !to) return null
              const mid = from.y + CARD_H + GAP_Y / 2
              return <path key={`${edge.from}-${edge.to}`} d={`M ${from.x} ${from.y + CARD_H} V ${mid} H ${to.x} V ${to.y}`} fill="none" stroke="currentColor" strokeOpacity="0.45" />
            })}
          </svg>
          <LayoutGroup>
            {placed.nodes.map((node) => (
              <motion.article
                key={node.id}
                layout={reduced ? false : true}
                data-active={node.id === active ? "true" : undefined}
                className={cn("absolute w-40 rounded-xl border bg-background p-3 shadow-sm", node.id === active && "border-primary")}
                style={{ left: node.x - CARD_W / 2, top: node.y, width: CARD_W }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-sm">{node.name.slice(0, 1)}</span>
                  <div>
                    <h3 className="text-sm font-medium">{node.name}</h3>
                    <p className="text-xs text-muted-foreground">{node.title}</p>
                  </div>
                </div>
                {node.hasChildren ? (
                  <button
                    type="button"
                    aria-expanded={!collapsed.has(node.id)}
                    className="mt-2 text-xs text-muted-foreground"
                    onClick={() => {
                      setCollapsed((current) => {
                        const next = new Set(current)
                        if (next.has(node.id)) next.delete(node.id)
                        else next.add(node.id)
                        return next
                      })
                    }}
                  >
                    {collapsed.has(node.id) ? "展开" : "折叠"}
                  </button>
                ) : null}
              </motion.article>
            ))}
          </LayoutGroup>
        </div>
      </div>
    </section>
  )
}

export { OrgChart }
