"use client"

import * as React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ApiKeyRecord {
  id: string
  name: string
  masked: string
  scopes: string[]
  lastUsed: string
  createdAt: string
}

export interface CreatedApiKey extends ApiKeyRecord {
  secret: string
}

export interface ApiKeyManagerProps {
  keys?: ApiKeyRecord[]
  onCreate: (input: { name: string; scopes: string[] }) => Promise<CreatedApiKey>
  onRevoke: (id: string) => Promise<void> | void
  onCopy?: (value: string) => void
  className?: string
}

const SCOPES = ["读取", "写入"]

function ApiKeyManager({ keys: initial = [], onCreate, onRevoke, onCopy, className }: ApiKeyManagerProps) {
  usePrefersReducedMotion()
  const [keys, setKeys] = React.useState(initial)
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<"create" | "secret" | "revoke">("create")
  const [name, setName] = React.useState("")
  const [scopes, setScopes] = React.useState<string[]>(["读取"])
  const [secret, setSecret] = React.useState("")
  const [target, setTarget] = React.useState<ApiKeyRecord | null>(null)
  const [copied, setCopied] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  const copy = async (value: string) => {
    try {
      await navigator.clipboard?.writeText(value)
    } catch {
      /* 剪贴板不可用时仍通知外部 */
    }
    onCopy?.(value)
    setCopied(value)
  }

  return (
    <div data-slot="api-key-manager" className={cn("mx-auto w-full max-w-4xl space-y-3", className)}>
      <div className="flex justify-end">
        <button type="button" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground" onClick={() => { setMode("create"); setSecret(""); setOpen(true) }}>创建密钥</button>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-muted-foreground">
          <tr>
            <th className="py-2 font-normal">名称</th>
            <th className="font-normal">密钥</th>
            <th className="font-normal">权限</th>
            <th className="font-normal">最近使用</th>
            <th className="font-normal">创建时间</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key.id} className="border-t">
              <td className="py-2">{key.name}</td>
              <td>
                <button type="button" className="font-mono" onClick={() => void copy(key.masked)}>{key.masked}</button>
                {copied === key.masked ? <span className="ml-2 text-xs text-emerald-600">已复制</span> : null}
              </td>
              <td>{key.scopes.join("、")}</td>
              <td>{key.lastUsed}</td>
              <td>{key.createdAt}</td>
              <td>
                <button type="button" className="text-rose-600" onClick={() => { setTarget(key); setMode("revoke"); setOpen(true) }}>吊销</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {mode === "secret" ? (
            <>
              <DialogHeader>
                <DialogTitle>密钥只显示这一次</DialogTitle>
                <DialogDescription>关掉之后只能看到掩码。请立刻复制。</DialogDescription>
              </DialogHeader>
              <p className="rounded-md border p-3 font-mono text-sm break-all">{secret}</p>
              <button type="button" className="rounded-md border px-3 py-1.5 text-sm" onClick={() => void copy(secret)}>复制</button>
            </>
          ) : mode === "revoke" ? (
            <>
              <DialogHeader>
                <DialogTitle>确认吊销</DialogTitle>
                <DialogDescription>吊销后 {target?.name} 不能再访问接口。</DialogDescription>
              </DialogHeader>
              <button
                type="button"
                className="rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white"
                onClick={() => {
                  if (!target) return
                  void Promise.resolve(onRevoke(target.id)).then(() => {
                    setKeys((current) => current.filter((item) => item.id !== target.id))
                    setOpen(false)
                  })
                }}
              >
                确认吊销
              </button>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>创建密钥</DialogTitle>
                <DialogDescription>生成后完整密钥只出现一次。</DialogDescription>
              </DialogHeader>
              <label className="grid gap-1 text-sm">
                名称
                <input aria-label="密钥名称" value={name} onChange={(event) => setName(event.target.value)} className="h-10 rounded-md border px-3" />
              </label>
              <div className="flex gap-3 text-sm">
                {SCOPES.map((scope) => (
                  <label key={scope} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={scopes.includes(scope)}
                      onChange={() => setScopes((current) => (current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]))}
                    />
                    {scope}
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-60"
                disabled={busy || name.trim() === ""}
                onClick={() => {
                  setBusy(true)
                  void onCreate({ name: name.trim(), scopes }).then((created) => {
                    setKeys((current) => [...current, { id: created.id, name: created.name, masked: created.masked, scopes: created.scopes, lastUsed: created.lastUsed, createdAt: created.createdAt }])
                    setSecret(created.secret)
                    setMode("secret")
                    setName("")
                  }).finally(() => setBusy(false))
                }}
              >
                生成
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { ApiKeyManager }
