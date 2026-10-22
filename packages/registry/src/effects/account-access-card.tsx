"use client"

// Ported from Spectrum UI (Apache-2.0, (c) Spectrum UI / arihantcodes) — https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/account-access-card/account-access-card.tsx. Modified for effect-ui.

import { ChevronRight, CircleAlert, Lock } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AccountCredential {
  email: string
  passwordLength?: number
}

export interface AccountAccessCardProps {
  title?: string
  description?: string
  emailLabel?: string
  passwordLabel?: string
  forgotLabel?: string
  buttonLabel?: string
  buttonIcon?: ReactNode
  dangerTitle?: string
  dangerDescription?: string
  credentials?: readonly AccountCredential[]
  animated?: boolean
  emailValue?: string
  passwordValue?: string
  onSubmit?: () => void
  onForgot?: () => void
  onDanger?: () => void
  className?: string
}

type ActiveField = "email" | "password" | null

const CSS = `
[data-slot="account-access-card"] .caret{display:inline-block;width:1px;height:0.875rem;margin-left:1px;background:var(--foreground);animation:account-access-caret 1s steps(2) infinite}
[data-slot="account-access-card"][data-motion="off"] .caret{animation:none;opacity:1}
[data-slot="account-access-card"][data-reduced="false"] .submit:hover .lock{animation:account-access-lock .5s ease}
@keyframes account-access-caret{0%,50%{opacity:1}50.01%,100%{opacity:0}}
@keyframes account-access-lock{0%{transform:rotate(0)}25%{transform:rotate(-12deg)}50%{transform:rotate(10deg)}75%{transform:rotate(-6deg)}100%{transform:rotate(0)}}
`

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function AccountAccessCard({
  title = "账号访问",
  description = "更新凭据或重新验证。",
  emailLabel = "邮箱",
  passwordLabel = "当前密码",
  forgotLabel = "忘记？",
  buttonLabel = "更新安全设置",
  buttonIcon,
  dangerTitle = "危险区域",
  dangerDescription = "归档账号并移除访问",
  credentials = [],
  animated = true,
  emailValue = "",
  passwordValue = "",
  onSubmit,
  onForgot,
  onDanger,
  className,
}: AccountAccessCardProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(rootRef)
  const play = animated && active && !reduced && credentials.length > 0
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [activeField, setActiveField] = useState<ActiveField>(null)
  const first = credentials[0]
  const shownEmail = !animated ? emailValue : reduced ? (first?.email ?? emailValue) : email
  const shownPassword = !animated ? passwordValue : reduced ? "•".repeat(first?.passwordLength ?? 0) : password

  useEffect(() => {
    if (!play) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      void (async () => {
        let index = 0
        while (!cancelled) {
          const cred = credentials[index % credentials.length]
          if (!cred) return
          const dots = cred.passwordLength ?? 14
          setActiveField("email")
          for (let i = 1; i <= cred.email.length; i += 1) {
            if (cancelled) return
            setEmail(cred.email.slice(0, i))
            await sleep(80)
          }
          await sleep(550)
          setActiveField("password")
          for (let i = 1; i <= dots; i += 1) {
            if (cancelled) return
            setPassword("•".repeat(i))
            await sleep(85)
          }
          setActiveField(null)
          await sleep(3200)
          for (let i = dots - 1; i >= 0; i -= 1) {
            if (cancelled) return
            setPassword("•".repeat(i))
            await sleep(18)
          }
          for (let i = cred.email.length - 1; i >= 0; i -= 1) {
            if (cancelled) return
            setEmail(cred.email.slice(0, i))
            await sleep(24)
          }
          await sleep(750)
          index += 1
        }
      })()
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [credentials, play])

  return (
    <div
      ref={rootRef}
      className={cn("w-full rounded-3xl border bg-card p-5 text-card-foreground shadow-sm", className)}
      data-motion={play ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="account-access-card"
    >
      <style>{CSS}</style>
      <h3 className="text-base font-medium">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">
        <label className="text-sm font-medium">{emailLabel}</label>
        <div className={cn("mt-3 flex h-8 items-center rounded-2xl bg-muted px-2.5", activeField === "email" && "ring-1 ring-ring")}>
          <span className="truncate text-sm text-muted-foreground">{shownEmail}</span>
          {activeField === "email" ? <span aria-hidden className="caret" /> : null}
        </div>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{passwordLabel}</label>
          <button className="text-xs font-medium tracking-wide text-muted-foreground uppercase" type="button" onClick={onForgot}>
            {forgotLabel}
          </button>
        </div>
        <div className={cn("mt-3 flex h-8 items-center rounded-2xl bg-muted px-2.5", activeField === "password" && "ring-1 ring-ring")}>
          <span className="truncate text-sm tracking-wider text-muted-foreground">{shownPassword}</span>
          {activeField === "password" ? <span aria-hidden className="caret" /> : null}
        </div>
      </div>
      <button className="submit mt-5 flex h-9 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-medium text-primary-foreground" type="button" onClick={onSubmit}>
        <span className="lock flex">{buttonIcon ?? <Lock className="size-4" />}</span>
        {buttonLabel}
      </button>
      <button className="mt-4 flex min-h-[4.5rem] w-full items-center gap-3 rounded-2xl bg-muted/60 p-4 text-left" type="button" onClick={onDanger}>
        <CircleAlert className="size-4 shrink-0 text-destructive" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{dangerTitle}</span>
          <span className="mt-1 block truncate text-sm text-muted-foreground">{dangerDescription}</span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>
    </div>
  )
}
