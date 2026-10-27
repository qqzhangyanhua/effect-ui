"use client"

import { ActiveSessionsList, type ActiveSession } from "../effects/active-sessions-list"

const sessions: ActiveSession[] = [
  { id: "here", device: "desktop", browser: "Chrome", os: "macOS", city: "上海", lastActive: new Date().toISOString(), current: true },
  { id: "phone", device: "mobile", browser: "Safari", os: "iOS", city: "杭州", lastActive: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
  { id: "pad", device: "tablet", browser: "Firefox", os: "Android", city: "成都", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
]

export function ActiveSessionsListDemo() {
  return <ActiveSessionsList sessions={sessions} />
}
