"use client"

/* eslint-disable @next/next/no-img-element -- registry 组件不能依赖 next/image */

import { motion } from "motion/react"
import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TwoFactorSetupProps {
  qrSrc: string
  secret: string
  recoveryCodes: readonly string[]
  onVerify: (code: string) => boolean | Promise<boolean>
  onComplete?: () => void
  className?: string
}

async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return
    }
    const area = document.createElement("textarea")
    area.value = value
    document.body.append(area)
    area.select()
    document.execCommand("copy")
    area.remove()
  } catch {
    // 剪贴板不可用时仍保留可见密钥和恢复码。
  }
}

function TwoFactorSetup({ qrSrc, secret, recoveryCodes, onVerify, onComplete, className }: TwoFactorSetupProps) {
  const reduced = usePrefersReducedMotion()
  const [step, setStep] = React.useState(0)
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState(false)
  const [shake, setShake] = React.useState(0)
  const [copied, setCopied] = React.useState<"secret" | "codes" | null>(null)
  const [saved, setSaved] = React.useState(false)

  const verify = async (next: string) => {
    const ok = await onVerify(next)
    if (!ok) {
      setError(true)
      setShake((value) => value + 1)
      return
    }
    setError(false)
    setStep(2)
  }

  const download = () => {
    const blob = new Blob([recoveryCodes.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "recovery-codes.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section data-slot="two-factor-setup" className={cn("w-full overflow-hidden rounded-xl border", className)}>
      <p className="border-b px-4 py-3 text-sm text-muted-foreground">第 {step + 1} / 3 步</p>
      <motion.div
        className="flex w-[300%]"
        animate={{ x: `-${step * (100 / 3)}%` }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 32 }}
      >
        <div className="w-1/3 space-y-3 p-4">
          <h2 className="text-lg font-medium">扫描二维码</h2>
          <img src={qrSrc} alt="验证器二维码" className="size-40 rounded-md border bg-white p-2" />
          <p className="font-mono text-sm">{secret}</p>
          <button
            type="button"
            className="h-9 rounded-md border px-3 text-sm"
            onClick={() => {
              void copyText(secret).then(() => setCopied("secret"))
            }}
          >
            {copied === "secret" ? "已复制密钥" : "复制密钥"}
          </button>
          <button type="button" className="ml-2 h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground" onClick={() => setStep(1)}>
            下一步
          </button>
        </div>
        <div className="w-1/3 space-y-3 p-4">
          <h2 className="text-lg font-medium">输入 6 位验证码</h2>
          <motion.div
            key={shake}
            animate={error && !reduced ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <InputOTP
              maxLength={6}
              value={code}
              aria-invalid={error}
              onChange={(value) => {
                setCode(value)
                setError(false)
              }}
              onComplete={(value) => void verify(value)}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </motion.div>
          {error ? <p className="text-sm text-destructive">验证码不正确</p> : null}
          <button type="button" className="h-9 rounded-md border px-3 text-sm" onClick={() => setStep(0)}>
            返回
          </button>
        </div>
        <div className="w-1/3 space-y-3 p-4">
          <h2 className="text-lg font-medium">保存恢复码</h2>
          <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
            {recoveryCodes.map((item) => (
              <li key={item} className="rounded-md border px-2 py-1">
                {item}
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              type="button"
              className="h-9 rounded-md border px-3 text-sm"
              onClick={() => {
                void copyText(recoveryCodes.join("\n")).then(() => setCopied("codes"))
              }}
            >
              {copied === "codes" ? "已复制" : "复制"}
            </button>
            <button type="button" className="h-9 rounded-md border px-3 text-sm" onClick={download}>
              下载 txt
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox aria-label="我已保存恢复码" checked={saved} onCheckedChange={(value) => setSaved(value === true)} />
            我已保存恢复码
          </label>
          <button
            type="button"
            className="h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground disabled:opacity-40"
            disabled={!saved}
            onClick={() => onComplete?.()}
          >
            完成
          </button>
        </div>
      </motion.div>
    </section>
  )
}

export { TwoFactorSetup }
