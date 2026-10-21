"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ComparePlan {
  id: string
  name: string
  price: string
}

export interface CompareRow {
  label: string
  values: Record<string, boolean | string>
}

export interface CompareGroup {
  title: string
  rows: CompareRow[]
}

export interface PlanCompareTableProps {
  plans?: ComparePlan[]
  groups?: CompareGroup[]
  className?: string
}

const DEFAULT_PLANS: ComparePlan[] = [
  { id: "solo", name: "个人", price: "¥29" },
  { id: "team", name: "团队", price: "¥79" },
  { id: "studio", name: "工作室", price: "¥159" },
]

const DEFAULT_GROUPS: CompareGroup[] = [
  {
    title: "协作",
    rows: [
      { label: "席位", values: { solo: "1", team: "5", studio: "15" } },
      { label: "评论", values: { solo: true, team: true, studio: true } },
      { label: "访客", values: { solo: false, team: true, studio: true } },
    ],
  },
  {
    title: "发布",
    rows: [
      { label: "自定义域名", values: { solo: false, team: true, studio: true } },
      { label: "审计日志", values: { solo: false, team: false, studio: true } },
    ],
  },
]

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <span aria-label="包含">✓</span>
  if (value === false) return <span aria-label="不包含">✕</span>
  return <span>{value}</span>
}

function sameValues(row: CompareRow) {
  const values = Object.values(row.values)
  return values.every((value) => value === values[0])
}

function PlanCompareTable({ plans = DEFAULT_PLANS, groups = DEFAULT_GROUPS, className }: PlanCompareTableProps) {
  const [open, setOpen] = React.useState<Record<string, boolean>>(() => Object.fromEntries(groups.map((group) => [group.title, true])))
  const [differences, setDifferences] = React.useState(false)
  const [planId, setPlanId] = React.useState(plans[0]?.id ?? "")
  const [narrow, setNarrow] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)")
    const update = () => setNarrow(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  const visibleGroups = groups.map((group) => ({
    ...group,
    rows: group.rows.filter((row) => !differences || !sameValues(row)),
  }))

  if (narrow) {
    const plan = plans.find((item) => item.id === planId) ?? plans[0]
    return (
      <section data-slot="plan-compare-table" className={cn("space-y-3", className)}>
        <div role="tablist" aria-label="方案" className="flex gap-2">
          {plans.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={item.id === plan?.id} className={cn("rounded-full border px-3 py-1 text-sm", item.id === plan?.id && "bg-primary text-primary-foreground")} onClick={() => setPlanId(item.id)}>
              {item.name}
            </button>
          ))}
        </div>
        {plan ? <p className="text-sm">{plan.price}</p> : null}
        {visibleGroups.map((group) => (
          <section key={group.title}>
            <h3 className="text-sm font-medium">{group.title}</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {group.rows.map((row) => (
                <li key={row.label} className="flex justify-between gap-3">
                  <span>{row.label}</span>
                  <Cell value={plan ? row.values[plan.id] ?? false : false} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    )
  }

  return (
    <section data-slot="plan-compare-table" className={cn("space-y-3", className)}>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={differences} onChange={(event) => setDifferences(event.target.checked)} />
        只看差异
      </label>
      <div className="overflow-auto">
        <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 bg-background">
            <tr>
              <th className="border-b p-2 text-left">功能</th>
              {plans.map((plan) => (
                <th key={plan.id} className="border-b p-2 text-left">
                  {plan.name}
                  <span className="block font-normal text-muted-foreground">{plan.price}</span>
                </th>
              ))}
            </tr>
          </thead>
          {visibleGroups.map((group) => (
            <tbody key={group.title}>
              <tr>
                <th colSpan={plans.length + 1} className="p-2 text-left">
                  <button type="button" aria-expanded={open[group.title] !== false} onClick={() => setOpen((current) => ({ ...current, [group.title]: !current[group.title] }))}>
                    {group.title}
                  </button>
                </th>
              </tr>
              {open[group.title] !== false
                ? group.rows.map((row) => (
                    <tr key={row.label}>
                      <th className="border-b p-2 text-left font-normal">{row.label}</th>
                      {plans.map((plan) => (
                        <td key={plan.id} className="border-b p-2">
                          <Cell value={row.values[plan.id] ?? false} />
                        </td>
                      ))}
                    </tr>
                  ))
                : null}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  )
}

export { PlanCompareTable }
