"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface KanbanItem {
  id: string
  name: string
  column: string
}

export interface KanbanColumn {
  id: string
  name: string
}

interface KanbanContextValue {
  data: KanbanItem[]
  activeId: string | null
}

const KanbanContext = React.createContext<KanbanContextValue>({ data: [], activeId: null })

export interface KanbanProviderProps {
  columns: KanbanColumn[]
  data: KanbanItem[]
  onDataChange?: (data: KanbanItem[]) => void
  className?: string
  children: (column: KanbanColumn) => React.ReactNode
}

function KanbanProvider({ columns, data, onDataChange, className, children }: KanbanProviderProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const moveItem = (event: DragOverEvent | DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const current = data.find((item) => item.id === active.id)
    if (!current) return
    const overItem = data.find((item) => item.id === over.id)
    const overColumn = overItem?.column ?? columns.find((column) => column.id === over.id)?.id
    if (!overColumn) return

    let next = data.map((item) => (item.id === current.id ? { ...item, column: overColumn } : item))
    if (overItem && active.id !== over.id) {
      next = arrayMove(
        next,
        next.findIndex((item) => item.id === active.id),
        next.findIndex((item) => item.id === over.id),
      )
    }
    onDataChange?.(next)
  }

  return (
    <KanbanContext.Provider value={{ data, activeId }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(event: DragStartEvent) => setActiveId(String(event.active.id))}
        onDragOver={moveItem}
        onDragEnd={(event) => {
          moveItem(event)
          setActiveId(null)
        }}
      >
        <div className={cn("grid auto-cols-fr grid-flow-col gap-3", className)}>
          {columns.map((column) => children(column))}
        </div>
        <DragOverlay>
          {activeId ? (
            <Card className="p-3 text-sm shadow-lg">
              {data.find((item) => item.id === activeId)?.name}
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </KanbanContext.Provider>
  )
}

function KanbanBoard({
  id,
  children,
  className,
}: {
  id: string
  children: React.ReactNode
  className?: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-48 flex-col rounded-lg border bg-muted/40",
        isOver && "ring-2 ring-primary",
        className,
      )}
    >
      {children}
    </div>
  )
}

function KanbanHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-3 py-2 text-sm font-medium", className)}>{children}</div>
}

function KanbanCards({
  id,
  children,
  className,
}: {
  id: string
  children: (item: KanbanItem) => React.ReactNode
  className?: string
}) {
  const { data } = React.useContext(KanbanContext)
  const items = data.filter((item) => item.column === id)
  return (
    <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
      <div className={cn("flex flex-1 flex-col gap-2 p-2", className)}>
        {items.map(children)}
      </div>
    </SortableContext>
  )
}

function KanbanCard({
  id,
  name,
  className,
  children,
}: {
  id: string
  name: string
  className?: string
  children?: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("cursor-grab gap-0 p-3 py-3 text-sm shadow-none", isDragging && "opacity-40", className)}
      {...attributes}
      {...listeners}
    >
      {children ?? name}
    </Card>
  )
}

export { KanbanProvider, KanbanBoard, KanbanHeader, KanbanCards, KanbanCard }
