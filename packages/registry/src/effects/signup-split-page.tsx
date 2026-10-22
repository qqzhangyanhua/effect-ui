"use client"

// Ported from Meraki UI (MIT, (c) 2021 Khatab Wedaa) — https://github.com/merakiuilabs/merakiui/blob/main/components/sign-in-and-registration/SignUpPageWithSideImage.html. Modified for effect-ui.

import { useRef, useState, type FormEvent, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SignupValues {
  accountType: "client" | "worker"
  firstName: string
  lastName: string
  phone: string
  email: string
  password: string
}

export interface SignupSplitPageProps {
  imageUrl?: string
  imageAlt?: string
  title?: string
  description?: string
  onSubmit?: (values: SignupValues) => void
  status?: "idle" | "submitting" | "success" | "error"
  statusMessage?: string
  className?: string
}

const fieldClass =
  "mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"

export function SignupSplitPage({
  imageUrl,
  imageAlt = "",
  title = "创建账号",
  description,
  onSubmit,
  status = "idle",
  statusMessage,
  className,
}: SignupSplitPageProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const [accountType, setAccountType] = useState<"client" | "worker">("client")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const confirm = form.elements.namedItem("confirmPassword")
    const password = String(new FormData(form).get("password") ?? "")
    if (confirm instanceof HTMLInputElement) {
      confirm.setCustomValidity(confirm.value === password ? "" : "两次密码不一致")
    }
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    const data = new FormData(form)
    onSubmit?.({
      accountType,
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      password,
    })
  }

  return (
    <section
      className={cn("bg-background text-foreground", className)}
      data-motion={motionOn && !reduced ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="signup-split-page"
      data-status={status}
      ref={ref}
    >
      <div className="flex min-h-[36rem]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
          <img alt={imageAlt} className="hidden w-2/5 object-cover lg:block" src={imageUrl} />
        ) : null}
        <div className="mx-auto flex w-full max-w-3xl items-center px-6 py-10 lg:w-3/5">
          <div className="w-full">
            <h1 className="text-2xl font-semibold tracking-wide">{title}</h1>
            {description ? <p className="mt-4 text-muted-foreground">{description}</p> : null}
            <fieldset className="mt-6">
              <legend className="text-sm text-muted-foreground">账号类型</legend>
              <div className="mt-3 flex flex-wrap gap-3">
                <TypeButton current={accountType} icon="briefcase" onSelect={setAccountType} reduced={reduced} value="client">
                  客户
                </TypeButton>
                <TypeButton current={accountType} icon="person" onSelect={setAccountType} reduced={reduced} value="worker">
                  合作者
                </TypeButton>
              </div>
            </fieldset>
            <form className="mt-8 grid gap-5 md:grid-cols-2" noValidate={false} onSubmit={submit}>
              <Field label="名" name="firstName" placeholder="名" />
              <Field label="姓" name="lastName" placeholder="姓" />
              <Field label="电话" name="phone" placeholder="手机号" />
              <Field label="邮箱" name="email" placeholder="name@example.com" type="email" />
              <Field label="密码" name="password" placeholder="密码" type="password" />
              <Field label="确认密码" name="confirmPassword" placeholder="再输入一次" type="password" />
              <div className="md:col-span-2">
                <button
                  className={cn(
                    "inline-flex w-full items-center justify-between rounded-lg bg-primary px-6 py-3 text-sm text-primary-foreground disabled:opacity-60",
                    reduced ? "transition-none" : "transition-colors",
                  )}
                  disabled={status === "submitting"}
                  type="submit"
                >
                  <span>{status === "submitting" ? "提交中" : "注册"}</span>
                  <span aria-hidden="true">→</span>
                </button>
                {statusMessage ? (
                  <p aria-live="polite" className="mt-3 text-sm text-muted-foreground" role="status">
                    {statusMessage}
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({ label, name, placeholder, type = "text" }: { label: string; name: string; placeholder: string; type?: string }) {
  return (
    <label className="block text-sm text-muted-foreground">
      {label}
      <input className={fieldClass} name={name} placeholder={placeholder} required type={type} />
    </label>
  )
}

function TypeButton({
  current,
  value,
  onSelect,
  reduced,
  icon,
  children,
}: {
  current: "client" | "worker"
  value: "client" | "worker"
  onSelect: (value: "client" | "worker") => void
  reduced: boolean
  icon: "briefcase" | "person"
  children: ReactNode
}) {
  const on = current === value
  return (
    <button
      aria-pressed={on}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm",
        on ? "bg-primary text-primary-foreground" : "border border-primary text-primary",
        reduced ? "transition-none" : "transition-colors",
      )}
      onClick={() => onSelect(value)}
      type="button"
    >
      <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        {icon === "briefcase" ? (
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 9h16v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" strokeLinejoin="round" />
        ) : (
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 8a7 7 0 0 1 14 0" strokeLinecap="round" />
        )}
      </svg>
      {children}
    </button>
  )
}
