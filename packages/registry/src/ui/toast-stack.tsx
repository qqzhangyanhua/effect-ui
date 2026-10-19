"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ToastVariant = "default" | "success" | "error"

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  actionLabel?: string
  onAction?: () => void
}

interface ToastContextValue {
  toasts: ToastItem[]
  push: (toast: Omit<ToastItem, "id"> & { id?: string }) => string
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToastStack() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToastStack must be used within ToastStackProvider")
  }
  return context
}

export function ToastStackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const push = React.useCallback(
    (toast: Omit<ToastItem, "id"> & { id?: string }) => {
      const id = toast.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((current) => [{ ...toast, id }, ...current].slice(0, 5))
      window.setTimeout(() => dismiss(id), 4200)
      return id
    },
    [dismiss],
  )

  return <ToastContext.Provider value={{ toasts, push, dismiss }}>{children}</ToastContext.Provider>
}

export interface ToastStackProps {
  items?: ToastItem[]
  className?: string
  onDismiss?: (id: string) => void
}

function variantClass(variant: ToastVariant = "default") {
  if (variant === "success") return "border-emerald-500/40 bg-card"
  if (variant === "error") return "border-destructive/40 bg-card"
  return "bg-card"
}

function ToastStack({ items, className, onDismiss }: ToastStackProps) {
  const context = React.useContext(ToastContext)
  const toasts = items ?? context?.toasts ?? []
  const dismiss = onDismiss ?? context?.dismiss

  return (
    <div className={cn("flex w-80 flex-col gap-2", className)}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={cn(
            "rounded-xl border p-3 shadow-lg transition-transform",
            variantClass(toast.variant),
          )}
          style={{ transform: `translateY(${index * -4}px) scale(${1 - index * 0.03})` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-xs text-muted-foreground">{toast.description}</p> : null}
            </div>
            <button
              type="button"
              className="text-xs text-muted-foreground"
              onClick={() => dismiss?.(toast.id)}
            >
              关闭
            </button>
          </div>
          {toast.actionLabel ? (
            <button
              type="button"
              className="mt-2 text-xs font-medium text-primary"
              onClick={() => {
                toast.onAction?.()
                dismiss?.(toast.id)
              }}
            >
              {toast.actionLabel}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export { ToastStack }
