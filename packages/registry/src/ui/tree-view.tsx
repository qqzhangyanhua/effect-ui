"use client"

import * as React from "react"
import { ChevronRight, FileIcon, FolderIcon } from "lucide-react"

import { cn } from "@/lib/cn"

export interface TreeNode {
  id: string
  name: string
  children?: TreeNode[]
}

export interface TreeViewProps {
  nodes: TreeNode[]
  className?: string
}

function TreeItem({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = React.useState(true)
  const isFolder = Boolean(node.children)

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-sm hover:bg-muted"
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => isFolder && setOpen((value) => !value)}
      >
        {isFolder ? (
          <ChevronRight className={cn("size-3.5 transition-transform motion-reduce:transition-none", open && "rotate-90")} />
        ) : (
          <span className="w-3.5" />
        )}
        {isFolder ? <FolderIcon className="size-3.5" /> : <FileIcon className="size-3.5" />}
        {node.name}
      </button>
      {isFolder && open
        ? node.children?.map((child) => <TreeItem key={child.id} node={child} depth={depth + 1} />)
        : null}
    </div>
  )
}

function TreeView({ nodes, className }: TreeViewProps) {
  return (
    <div className={cn("min-w-48", className)}>
      {nodes.map((node) => (
        <TreeItem key={node.id} node={node} depth={0} />
      ))}
    </div>
  )
}

export { TreeView, TreeView as FileTree }
