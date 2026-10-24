"use client"

// Ported from prompt-kit (MIT, (c) 2025 Julien Thibeaut) — https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/source.tsx. Modified for effect-ui.

import { createContext, useContext, type ReactNode } from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

function SourceCardContent({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        align="center"
        sideOffset={4}
        className={cn(
          "z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
      >
        {children}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  )
}

type SourceContextValue = {
  href: string
  domain: string
  faviconSrc?: string
}

const SourceContext = createContext<SourceContextValue | null>(null)

function useSourceContext() {
  const context = useContext(SourceContext)
  if (!context) throw new Error("Source 的子组件必须放在 Source 里面。")
  return context
}

function domainOf(href: string) {
  try {
    return new URL(href).hostname
  } catch {
    return href.split("/").pop() || href
  }
}

export interface SourceProps {
  href: string
  children?: ReactNode
  faviconSrc?: string
}

export function Source({ href, children, faviconSrc }: SourceProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <SourceContext.Provider value={{ href, domain: domainOf(href), faviconSrc }}>
      <HoverCardPrimitive.Root closeDelay={0} openDelay={reduced ? 0 : 150}>
        {children}
      </HoverCardPrimitive.Root>
    </SourceContext.Provider>
  )
}

export interface SourceTriggerProps {
  label?: string | number
  showFavicon?: boolean
  className?: string
}

export function SourceTrigger({ label, showFavicon = false, className }: SourceTriggerProps) {
  const reduced = usePrefersReducedMotion()
  const { href, domain, faviconSrc } = useSourceContext()
  const labelToShow = label ?? domain.replace(/^www\./, "")
  const icon = showFavicon && faviconSrc ? faviconSrc : undefined
  return (
    <HoverCardPrimitive.Trigger asChild>
      <a className={cn("inline-flex h-5 max-w-32 items-center gap-1 overflow-hidden rounded-full bg-muted text-xs text-muted-foreground no-underline hover:bg-muted-foreground/30 hover:text-primary", reduced && "transition-none", icon ? "pr-2 pl-1" : "px-1", className)} data-reduced={reduced ? "true" : "false"} data-slot="source" href={href} rel="noopener noreferrer" target="_blank">
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
          <img alt="" className="size-3.5 rounded-full" height={14} src={icon} width={14} />
        ) : null}
        <span className="truncate text-center font-normal tabular-nums">{labelToShow}</span>
      </a>
    </HoverCardPrimitive.Trigger>
  )
}

export interface SourceContentProps {
  title: string
  description: string
  className?: string
}

export function SourceContent({ title, description, className }: SourceContentProps) {
  const { href, domain, faviconSrc } = useSourceContext()
  return (
    <SourceCardContent className={cn("w-80 p-0 shadow-xs", className)}>
      <a className="flex flex-col gap-2 p-3" href={href} rel="noopener noreferrer" target="_blank">
        <div className="flex items-center gap-1.5">
          {faviconSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
            <img alt="" className="size-4 rounded-full" height={16} src={faviconSrc} width={16} />
          ) : null}
          <div className="truncate text-sm text-primary">{domain.replace(/^www\./, "")}</div>
        </div>
        <div className="line-clamp-2 text-sm font-medium">{title}</div>
        <div className="line-clamp-2 text-sm text-muted-foreground">{description}</div>
      </a>
    </SourceCardContent>
  )
}
