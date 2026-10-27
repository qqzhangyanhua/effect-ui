"use client"
import { TreeView } from "../ui/tree-view"

export function TreeViewDemo() {
  return (
    <TreeView
      className="w-full max-w-sm rounded-xl border p-2"
      nodes={[
        {
          id: "app",
          name: "app",
          children: [
            { id: "page", name: "page.tsx" },
            { id: "layout", name: "layout.tsx" },
          ],
        },
        {
          id: "components",
          name: "components",
          children: [{ id: "button", name: "button.tsx" }],
        },
      ]}
    />
  )
}
