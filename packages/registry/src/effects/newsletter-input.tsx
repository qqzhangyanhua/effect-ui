"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author deepak16375）— https://github.com/uiverse-io/galaxy/blob/main/Inputs/deepak16375_neat-impala-82.html

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useId, type FormEvent, type HTMLAttributes } from "react"

export interface NewsletterInputProps extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit"> {
  onSubmit?: (email: string) => void
  status?: "idle" | "loading" | "success" | "error"
  placeholder?: string
  buttonLabel?: string
}

export function NewsletterInput({
  onSubmit,
  status = "idle",
  placeholder = "输入邮箱",
  buttonLabel = "订阅",
  className,
  ...props
}: NewsletterInputProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const inputId = useId()
  const statusText = status === "loading" ? "正在提交" : status === "success" ? "订阅成功" : status === "error" ? "订阅失败" : ""

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === "loading") return
    const email = String(new FormData(event.currentTarget).get("email") ?? "")
    onSubmit?.(email)
  }

  return (
    <form
      {...props}
      aria-label="订阅邮件"
      className={cn("inline-flex flex-wrap items-center gap-2", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="newsletter-input"
      onSubmit={submit}
    >
      <input
        aria-label="邮箱"
        autoComplete="email"
        className="max-w-[190px] rounded-s-lg border-2 border-border bg-background px-4 py-3 text-base text-foreground outline-none"
        id={inputId}
        name="email"
        placeholder={placeholder}
        required
        type="email"
      />
      <button
        className={cn(
          "-ml-2 rounded-e-lg bg-primary px-4 py-3 text-base text-primary-foreground",
          prefersReducedMotion ? "transition-none" : "transition-opacity",
          status === "loading" && "opacity-70",
        )}
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? "提交中" : buttonLabel}
      </button>
      {statusText ? (
        <p className="text-sm text-muted-foreground" role="status">
          {statusText}
        </p>
      ) : null}
    </form>
  )
}
