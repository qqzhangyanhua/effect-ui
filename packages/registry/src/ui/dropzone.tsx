"use client"

import * as React from "react"
import { UploadIcon } from "lucide-react"
import { useDropzone, type DropzoneOptions, type FileRejection } from "react-dropzone"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DropzoneContextValue {
  files?: File[]
  accept?: DropzoneOptions["accept"]
  maxSize?: number
  maxFiles?: number
}

const DropzoneContext = React.createContext<DropzoneContextValue | null>(null)

function useDropzoneContext() {
  const context = React.useContext(DropzoneContext)
  if (!context) throw new Error("Dropzone parts must be used within Dropzone")
  return context
}

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index += 1
  }
  return `${size.toFixed(1)} ${units[index]}`
}

export interface DropzoneProps extends Omit<DropzoneOptions, "onDrop"> {
  files?: File[]
  className?: string
  children?: React.ReactNode
  onDrop?: (accepted: File[], rejected: FileRejection[]) => void
}

function Dropzone({
  files,
  className,
  children,
  accept,
  maxFiles = 4,
  maxSize,
  disabled,
  onDrop,
  onError,
  ...props
}: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    disabled,
    onError,
    onDrop: (accepted, rejected) => {
      if (rejected[0]?.errors[0]) {
        onError?.(new Error(rejected[0].errors[0].message))
        return
      }
      onDrop?.(accepted, rejected)
    },
    ...props,
  })

  return (
    <DropzoneContext.Provider value={{ files, accept, maxSize, maxFiles }}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className={cn(
          "h-auto w-full flex-col gap-2 p-8",
          isDragActive && "ring-2 ring-ring",
          className,
        )}
        {...getRootProps()}
      >
        <input {...getInputProps()} disabled={disabled} />
        {children}
      </Button>
    </DropzoneContext.Provider>
  )
}

function DropzoneEmptyState({ className }: { className?: string }) {
  const { files, accept, maxSize, maxFiles } = useDropzoneContext()
  if (files && files.length > 0) return null
  const types = accept ? Object.keys(accept).join(", ") : "任意类型"
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div className="mb-2 flex size-9 items-center justify-center rounded-md bg-muted">
        <UploadIcon className="size-4" />
      </div>
      <p className="text-sm font-medium">拖拽或点击上传</p>
      <p className="text-xs text-muted-foreground">
        最多 {maxFiles} 个文件{maxSize ? ` · 单文件 ${formatBytes(maxSize)}` : ""} · {types}
      </p>
    </div>
  )
}

function DropzoneContent({ className }: { className?: string }) {
  const { files } = useDropzoneContext()
  if (!files?.length) return null
  return (
    <div className={cn("w-full space-y-1 text-left text-sm", className)}>
      {files.map((file) => (
        <div key={`${file.name}-${file.size}`} className="flex justify-between gap-3">
          <span className="truncate">{file.name}</span>
          <span className="text-muted-foreground">{formatBytes(file.size)}</span>
        </div>
      ))}
    </div>
  )
}

export { Dropzone, DropzoneContent, DropzoneEmptyState, formatBytes }
