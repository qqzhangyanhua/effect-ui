"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/banner/index.tsx

import { Button } from "@/components/ui/button"
import { useControllableState } from "@/hooks/use-controllable-state"
import { cn } from "@/lib/utils"

import { XIcon, type LucideIcon } from "lucide-react"
import {
  createContext,
  useContext,
  type ComponentProps,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react"

interface BannerContextProps {
  show: boolean
  setShow: (show: boolean) => void
}

const BannerContext = createContext<BannerContextProps>({
  show: true,
  setShow: () => {},
})

export interface BannerProps {
  children?: ReactNode
  visible?: boolean
  defaultVisible?: boolean
  onClose?: () => void
  inset?: boolean
  className?: string
}

export function Banner({
  children,
  visible,
  defaultVisible = true,
  onClose,
  className,
  inset = false,
}: BannerProps) {
  const [show, setShow] = useControllableState({
    value: visible,
    defaultValue: defaultVisible,
    onChange: (next) => {
      if (!next) onClose?.()
    },
  })

  if (!show) return null

  return (
    <BannerContext.Provider value={{ show, setShow }}>
      <div
        className={cn(
          "flex w-full items-center justify-between gap-2 bg-primary px-4 py-2 text-primary-foreground",
          inset && "rounded-lg",
          className,
        )}
        data-slot="banner"
      >
        {children}
      </div>
    </BannerContext.Provider>
  )
}

export function BannerIcon({
  icon: Icon,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { icon: LucideIcon }) {
  return (
    <div className={cn("rounded-full border border-background/20 bg-background/10 p-1 shadow-sm", className)} {...props}>
      <Icon size={16} />
    </div>
  )
}

export function BannerTitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("flex-1 text-sm", className)} {...props} />
}

export function BannerAction({ variant = "outline", size = "sm", className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("shrink-0 bg-transparent hover:bg-background/10 hover:text-background", className)}
      size={size}
      variant={variant}
      {...props}
    />
  )
}

export function BannerClose({
  variant = "ghost",
  size = "icon",
  onClick,
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const { setShow } = useContext(BannerContext)
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    setShow(false)
    onClick?.(event)
  }

  return (
    <Button
      className={cn("shrink-0 bg-transparent hover:bg-background/10 hover:text-background", className)}
      aria-label="关闭"
      onClick={handleClick}
      size={size}
      variant={variant}
      {...props}
    >
      <XIcon size={18} />
    </Button>
  )
}
