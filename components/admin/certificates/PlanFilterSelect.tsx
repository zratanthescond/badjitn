"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"

export type PlanChoice = { plan: string; option: string }

export const ALL_PLANS = "all"

// A filter value is either ALL_PLANS, a whole plan, or one option (sub-plan) of a plan.
const encode = (plan: string, option?: string) => JSON.stringify(option ? [plan, option] : [plan])

export function matchesPlanFilter(plans: PlanChoice[] | undefined, value: string) {
    if (value === ALL_PLANS) return true
    let plan = ""
    let option: string | undefined
    try {
        ;[plan, option] = JSON.parse(value)
    } catch {
        return true
    }
    return (plans || []).some((p) => p.plan === plan && (option === undefined || p.option === option))
}

export function PlanFilterSelect({
    rows,
    value,
    onChange,
    className,
}: {
    rows: { plans?: PlanChoice[] }[]
    value: string
    onChange: (value: string) => void
    className?: string
}) {
    const t = useTranslations("certificates")

    const facets = useMemo(() => {
        const byPlan = new Map<string, { count: number; options: Map<string, number> }>()
        for (const row of rows) {
            for (const { plan, option } of row.plans || []) {
                let facet = byPlan.get(plan)
                if (!facet) byPlan.set(plan, (facet = { count: 0, options: new Map() }))
                facet.count++
                if (option) facet.options.set(option, (facet.options.get(option) || 0) + 1)
            }
        }
        return Array.from(byPlan.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([plan, facet]) => ({
                plan,
                count: facet.count,
                options: Array.from(facet.options.entries()).sort(([a], [b]) => a.localeCompare(b)),
            }))
    }, [rows])

    if (facets.length === 0) return null

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={className} aria-label={t("planFilter.label")}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80">
                <SelectItem value={ALL_PLANS}>{t("planFilter.all")}</SelectItem>
                {facets.map((facet) => (
                    <SelectGroup key={facet.plan}>
                        <SelectSeparator />
                        <SelectItem value={encode(facet.plan)} className="font-medium">
                            {facet.plan} ({facet.count})
                        </SelectItem>
                        {facet.options.map(([option, count]) => (
                            <SelectItem key={option} value={encode(facet.plan, option)} className="pl-10">
                                {option} ({count})
                            </SelectItem>
                        ))}
                    </SelectGroup>
                ))}
            </SelectContent>
        </Select>
    )
}
