"use client"

// Ported from Spectrum UI (Apache-2.0, (c) Spectrum UI / arihantcodes) — https://github.com/arihantcodes/spectrum-ui/blob/main/components/spectrumui/github-profile-card.tsx. Modified for effect-ui.

import { Github, Globe, LoaderCircle, Mail, Search, Share2 } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GitHubProfileUser {
  login: string
  name?: string
  bio?: string
  avatarUrl?: string
  followers?: number
  following?: number
  publicRepos?: number
  htmlUrl?: string
  email?: string
  twitterUsername?: string
  blog?: string
}

export interface GitHubContribution {
  date: string
  level: number
  count: number
}

export interface GitHubProfileCardProps {
  user?: GitHubProfileUser
  username?: string
  fetchProfile?: boolean
  contributions?: readonly GitHubContribution[]
  emptyLabel?: string
  className?: string
}

const LEVELS = ["bg-muted", "bg-chart-2/30", "bg-chart-2/55", "bg-chart-2/75", "bg-chart-2"]

function useClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

function formatNumber(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

function levelFor(seed: string, index: number) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 33 + (seed.charCodeAt(i) ?? 0)) >>> 0
  const mixed = (hash + index * 1103515245) >>> 0
  const bucket = mixed % 10
  if (bucket > 8) return 4
  if (bucket > 6) return 3
  if (bucket > 4) return 2
  if (bucket > 2) return 1
  return 0
}

function buildDays(login: string): GitHubContribution[] {
  const today = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())
  return Array.from({ length: 371 }, (_, index) => {
    const level = levelFor(login, index)
    const date = new Date(today - (370 - index) * 86400000).toISOString().slice(0, 10)
    return { date, level, count: level * 3 }
  })
}

interface ApiUser {
  login?: string
  name?: string | null
  bio?: string | null
  avatar_url?: string
  followers?: number
  following?: number
  public_repos?: number
  html_url?: string
  email?: string | null
  twitter_username?: string | null
  blog?: string | null
}

async function loadUser(name: string): Promise<GitHubProfileUser> {
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(name)}`)
  if (!response.ok) {
    if (response.status === 404) throw new Error("没有找到这个用户")
    if (response.status === 403) throw new Error("请求过于频繁")
    throw new Error("资料获取失败")
  }
  const data = (await response.json()) as ApiUser
  const login = data.login ?? name
  return {
    login,
    name: data.name ?? "",
    bio: data.bio ?? "",
    avatarUrl: data.avatar_url ?? "",
    followers: data.followers ?? 0,
    following: data.following ?? 0,
    publicRepos: data.public_repos ?? 0,
    htmlUrl: data.html_url ?? `https://github.com/${login}`,
    email: data.email ?? "",
    twitterUsername: data.twitter_username ?? "",
    blog: data.blog ?? "",
  }
}

export function GitHubProfileCard({ user, username = "", fetchProfile = false, contributions, emptyLabel = "输入 GitHub 用户名查看资料卡", className }: GitHubProfileCardProps) {
  const reduced = usePrefersReducedMotion()
  const client = useClient()
  const [draftSource, setDraftSource] = useState(username)
  const [draft, setDraft] = useState(username)
  const [loaded, setLoaded] = useState<GitHubProfileUser | null>(null)
  const [phase, setPhase] = useState<"idle" | "loading" | "error">("idle")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  if (username !== draftSource) {
    setDraftSource(username)
    setDraft(username)
  }
  const autoKey = fetchProfile && username && !user ? username : ""
  const [autoTracked, setAutoTracked] = useState(autoKey)
  if (autoKey !== autoTracked) {
    setAutoTracked(autoKey)
    setPhase(autoKey ? "loading" : "idle")
    setError("")
  }
  const shown = loaded ?? user ?? null

  useEffect(() => {
    if (!autoKey) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      void loadUser(autoKey)
        .then((next) => {
          if (cancelled) return
          setLoaded(next)
          setPhase("idle")
        })
        .catch((reason: unknown) => {
          if (cancelled) return
          setLoaded(null)
          setPhase("error")
          setError(reason instanceof Error ? reason.message : "资料获取失败")
        })
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [autoKey])

  const search = () => {
    const name = draft.trim()
    if (!name) return
    setPhase("loading")
    setError("")
    void loadUser(name)
      .then((next) => {
        setLoaded(next)
        setPhase("idle")
      })
      .catch((reason: unknown) => {
        setLoaded(null)
        setPhase("error")
        setError(reason instanceof Error ? reason.message : "资料获取失败")
      })
  }

  const days = contributions ?? (client && shown ? buildDays(shown.login) : [])
  const weeks: GitHubContribution[][] = []
  for (let index = 0; index < days.length; index += 7) weeks.push(days.slice(index, index + 7))

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-4", className)} data-reduced={reduced ? "true" : "false"} data-slot="github-profile-card">
      <div className="flex gap-2">
        <input
          aria-label="GitHub 用户名"
          className="h-9 min-w-0 flex-1 rounded-xl border bg-transparent px-3 text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="GitHub 用户名"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") search()
          }}
        />
        <button aria-label={phase === "loading" ? "正在加载资料" : "搜索资料"} className="inline-flex h-9 items-center rounded-xl bg-secondary px-3 text-secondary-foreground disabled:opacity-50" disabled={phase === "loading" || draft.trim().length === 0} type="button" onClick={search}>
          {phase === "loading" ? <LoaderCircle className={cn("size-4", reduced ? "" : "animate-spin")} /> : <Search className="size-4" />}
        </button>
      </div>
      {error ? <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">{error}</p> : null}
      {shown ? (
        <div className="rounded-3xl border bg-card p-8 text-card-foreground">
          <div className="flex flex-col items-center gap-5">
            {shown.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
              <img alt={shown.name || shown.login} className="size-20 rounded-full border object-cover" src={shown.avatarUrl} />
            ) : (
              <span className="flex size-20 items-center justify-center rounded-full bg-primary text-xl text-primary-foreground">{(shown.name || shown.login).slice(0, 1).toUpperCase()}</span>
            )}
            <div className="text-center">
              <h2 className="text-2xl font-bold">{shown.name || shown.login}</h2>
              {shown.bio ? <p className="mt-2 max-w-xs text-sm text-muted-foreground">{shown.bio}</p> : null}
            </div>
            <div className="flex gap-2">
              {shown.htmlUrl ? (
                <a aria-label={`${shown.login} 的 GitHub`} className="rounded-lg p-2 text-muted-foreground" href={shown.htmlUrl} rel="noopener noreferrer" target="_blank">
                  <Github className="size-5" />
                </a>
              ) : null}
              {shown.blog ? (
                <a aria-label={`${shown.login} 的网站`} className="rounded-lg p-2 text-muted-foreground" href={shown.blog.startsWith("http") ? shown.blog : `https://${shown.blog}`} rel="noopener noreferrer" target="_blank">
                  <Globe className="size-5" />
                </a>
              ) : null}
              {shown.email ? (
                <a aria-label={`给 ${shown.name || shown.login} 发邮件`} className="rounded-lg p-2 text-muted-foreground" href={`mailto:${shown.email}`}>
                  <Mail className="size-5" />
                </a>
              ) : null}
            </div>
            <div className="flex w-full overflow-hidden rounded-lg border">
              <Stat label="关注者" value={shown.followers ?? 0} />
              <Stat label="正在关注" value={shown.following ?? 0} />
              <Stat label="仓库" value={shown.publicRepos ?? 0} last />
            </div>
            <div className="w-full space-y-3">
              <div className="flex gap-1 overflow-x-auto">
                {weeks.map((week) => (
                  <div key={week[0]?.date ?? "week"} className="flex flex-col gap-1">
                    {week.map((day) => (
                      <div key={day.date} className={cn("size-3 rounded-sm", LEVELS[day.level] ?? LEVELS[0])} title={`${day.date} ${day.count}`} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            className="mx-auto mt-6 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
            type="button"
            onClick={() => {
              const link = shown.htmlUrl ?? `https://github.com/${shown.login}`
              void navigator.clipboard?.writeText(link).then(() => setCopied(true))
            }}
          >
            <Share2 className="size-4" />
            {copied ? "已复制" : "复制主页链接"}
          </button>
        </div>
      ) : phase === "loading" ? null : (
        <p className="text-center text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </div>
  )
}

function Stat({ label, value, last = false }: { label: string; value: number; last?: boolean }) {
  return (
    <div className={cn("flex-1 py-3 text-center", last ? "" : "border-r")}>
      <div className="text-lg font-semibold">{formatNumber(value)}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
