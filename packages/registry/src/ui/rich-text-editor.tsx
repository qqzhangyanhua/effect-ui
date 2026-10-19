"use client"

import * as React from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Bold, Heading2, Italic, List, ListOrdered } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface RichTextEditorProps {
  content?: string
  placeholder?: string
  onChange?: (html: string) => void
  className?: string
}

function RichTextEditor({
  content = "<p></p>",
  placeholder = "输入 / 开始，或直接写…",
  onChange,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Placeholder.configure({ placeholder })],
    content,
    editorProps: {
      attributes: {
        class: "min-h-40 px-3 py-2 text-sm outline-none [&_h2]:text-lg [&_h2]:font-semibold",
      },
    },
    onUpdate: ({ editor: instance }) => onChange?.(instance.getHTML()),
  })

  if (!editor) return <div className={cn("min-h-48 rounded-xl border", className)} />

  return (
    <div className={cn("overflow-hidden rounded-xl border", className)}>
      <div className="flex flex-wrap gap-1 border-b p-1">
        <Button type="button" size="icon" variant={editor.isActive("bold") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold />
        </Button>
        <Button type="button" size="icon" variant={editor.isActive("italic") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic />
        </Button>
        <Button type="button" size="icon" variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 />
        </Button>
        <Button type="button" size="icon" variant={editor.isActive("bulletList") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List />
        </Button>
        <Button type="button" size="icon" variant={editor.isActive("orderedList") ? "secondary" : "ghost"} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export { RichTextEditor }
