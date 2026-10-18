"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface MorphingDialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  id: string
}

const MorphingDialogContext = React.createContext<MorphingDialogContextValue | null>(null)

function useMorphingDialog() {
  const context = React.useContext(MorphingDialogContext)
  if (!context) {
    throw new Error("MorphingDialog components must be used within MorphingDialog")
  }
  return context
}

function MorphingDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const id = React.useId()
  return (
    <MorphingDialogContext.Provider value={{ open, setOpen, id }}>
      <MotionConfig transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}>
        {children}
      </MotionConfig>
    </MorphingDialogContext.Provider>
  )
}

function MorphingDialogTrigger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { open, setOpen, id } = useMorphingDialog()
  return (
    <motion.button
      type="button"
      layoutId={`morph-dialog-${id}`}
      className={cn("relative cursor-pointer text-left", className)}
      onClick={() => setOpen(!open)}
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      {children}
    </motion.button>
  )
}

function MorphingDialogContainer({ children }: { children: React.ReactNode }) {
  const { open, id } = useMorphingDialog()
  const mounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            key={`backdrop-${id}`}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {children}
          </div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

function MorphingDialogContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { setOpen, id } = useMorphingDialog()

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [setOpen])

  return (
    <motion.div
      layoutId={`morph-dialog-${id}`}
      role="dialog"
      aria-modal="true"
      className={cn("relative overflow-hidden rounded-2xl border bg-card shadow-xl", className)}
    >
      {children}
    </motion.div>
  )
}

function MorphingDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { id } = useMorphingDialog()
  return (
    <motion.h2 layoutId={`morph-title-${id}`} className={cn("text-lg font-semibold", className)}>
      {children}
    </motion.h2>
  )
}

function MorphingDialogDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("text-sm text-muted-foreground", className)}>{children}</div>
}

function MorphingDialogClose({ className }: { className?: string }) {
  const { setOpen } = useMorphingDialog()
  return (
    <button
      type="button"
      aria-label="关闭"
      className={cn("absolute top-3 right-3 rounded-full p-1 hover:bg-muted", className)}
      onClick={() => setOpen(false)}
    >
      <XIcon className="size-4" />
    </button>
  )
}

export {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogDescription,
  MorphingDialogClose,
}
