"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/dialog-stack/index.tsx

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"

interface DialogStackContextType {
  activeIndex: number
  setActiveIndex: (index: number) => void
  totalDialogs: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  clickable: boolean
}

const DialogStackContext = createContext<DialogStackContextType | null>(null)

function useDialogStack() {
  const context = useContext(DialogStackContext)
  if (!context) throw new Error("DialogStack 组件必须放在 DialogStack 里面。")
  return context
}

export interface DialogStackProps {
  children?: ReactNode
  className?: string
  open?: boolean
  clickable?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
}

export function DialogStack({
  children,
  className,
  open,
  defaultOpen = false,
  onOpenChange,
  clickable = false,
}: DialogStackProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  return (
    <DialogStackContext.Provider
      value={{
        activeIndex,
        setActiveIndex,
        totalDialogs: 0,
        isOpen,
        setIsOpen,
        clickable,
      }}
    >
      <div className={className} data-slot="dialog-stack">
        {children}
      </div>
    </DialogStackContext.Provider>
  )
}

export function DialogStackTrigger({
  children,
  className,
  onClick,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = useDialogStack()
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    context.setIsOpen(true)
    onClick?.(event)
  }

  if (asChild && children) {
    const child = children as ReactElement<{
      onClick?: MouseEventHandler<HTMLButtonElement>
      className?: string
    }>
    return cloneElement(child, {
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        handleClick(event)
        child.props.onClick?.(event)
      },
      className: cn(className, child.props.className),
    })
  }

  return (
    <button
      className={cn(
        "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
        className,
      )}
      onClick={handleClick}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

export function DialogStackOverlay({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const context = useDialogStack()
  const prefersReducedMotion = usePrefersReducedMotion()
  const handleClick = useCallback(() => {
    context.setIsOpen(false)
  }, [context])

  if (!context.isOpen || typeof document === "undefined") return null

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/80",
        !prefersReducedMotion &&
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      data-state="open"
      onClick={handleClick}
      {...props}
    />,
    document.body,
  )
}

export function DialogStackBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const context = useDialogStack()
  const totalDialogs = Children.count(children)

  if (!context.isOpen || typeof document === "undefined") return null

  return (
    <DialogStackContext.Provider value={{ ...context, totalDialogs }}>
      {createPortal(
        <div
          className={cn(
            "pointer-events-none fixed inset-0 z-50 mx-auto flex w-full max-w-lg flex-col items-center justify-center",
            className,
          )}
          data-slot="dialog-stack-body"
          {...props}
        >
          <div className="pointer-events-auto relative flex w-full flex-col items-center justify-center">
            {Children.map(children, (child, index) => {
              if (!child || typeof child !== "object") return child
              const childElement = child as ReactElement<{ index?: number }>
              return cloneElement(childElement, { index })
            })}
          </div>
        </div>,
        document.body,
      )}
    </DialogStackContext.Provider>
  )
}

export function DialogStackContent({
  children,
  className,
  index = 0,
  offset = 10,
  ...props
}: HTMLAttributes<HTMLDivElement> & { index?: number; offset?: number }) {
  const context = useDialogStack()
  const prefersReducedMotion = usePrefersReducedMotion()
  if (!context.isOpen) return null

  const distanceFromActive = index - context.activeIndex
  const translateY =
    distanceFromActive < 0
      ? `-${Math.abs(distanceFromActive) * offset}px`
      : `${Math.abs(distanceFromActive) * offset}px`

  return (
    <div
      {...props}
      className={cn(
        "bg-background h-auto w-full rounded-lg border p-6 shadow-lg",
        prefersReducedMotion ? "transition-none" : "transition-all duration-300",
        className,
      )}
      onClick={() => {
        if (context.clickable && context.activeIndex > index) context.setActiveIndex(index)
      }}
      style={{
        ...props.style,
        top: 0,
        transform: `translateY(${translateY})`,
        width: `calc(100% - ${Math.abs(distanceFromActive) * 10}px)`,
        zIndex: 50 - Math.abs(context.activeIndex - index),
        position: distanceFromActive ? "absolute" : "relative",
        opacity: distanceFromActive > 0 ? 0 : 1,
        cursor: context.clickable && context.activeIndex > index ? "pointer" : "default",
      }}
    >
      <div
        className={cn(
          "h-full w-full",
          prefersReducedMotion ? "transition-none" : "transition-all duration-300",
          context.activeIndex !== index && "pointer-events-none opacity-0 select-none",
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogStackTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg leading-none font-semibold tracking-tight", className)} {...props}>
      {children}
    </h2>
  )
}

export function DialogStackDescription({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props}>
      {children}
    </p>
  )
}

export function DialogStackHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
}

export function DialogStackFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-end space-x-2 pt-4", className)} {...props}>
      {children}
    </div>
  )
}

function stackButtonClass(className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50",
    className,
  )
}

export function DialogStackNext({
  children,
  className,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = useDialogStack()
  const handleNext = () => {
    if (context.activeIndex < context.totalDialogs - 1) context.setActiveIndex(context.activeIndex + 1)
  }

  if (asChild && children) {
    const child = children as ReactElement<{
      onClick?: MouseEventHandler<HTMLButtonElement>
      className?: string
    }>
    return cloneElement(child, {
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        handleNext()
        child.props.onClick?.(event)
      },
      className: cn(className, child.props.className),
    })
  }

  return (
    <button
      className={stackButtonClass(className)}
      disabled={context.activeIndex >= context.totalDialogs - 1}
      onClick={handleNext}
      type="button"
      {...props}
    >
      {children || "下一步"}
    </button>
  )
}

export function DialogStackPrevious({
  children,
  className,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = useDialogStack()
  const handlePrevious = () => {
    if (context.activeIndex > 0) context.setActiveIndex(context.activeIndex - 1)
  }

  if (asChild && children) {
    const child = children as ReactElement<{
      onClick?: MouseEventHandler<HTMLButtonElement>
      className?: string
    }>
    return cloneElement(child, {
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        handlePrevious()
        child.props.onClick?.(event)
      },
      className: cn(className, child.props.className),
    })
  }

  return (
    <button
      className={stackButtonClass(className)}
      disabled={context.activeIndex <= 0}
      onClick={handlePrevious}
      type="button"
      {...props}
    >
      {children || "上一步"}
    </button>
  )
}
