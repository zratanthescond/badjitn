"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

type Metric = "orders" | "revenue";

const COLOR = "#0059bb";

export default function TimelineChart({
  timeline,
  currency,
  primaryOnlyNote,
}: {
  timeline: { date: string; orders: number; revenue: number }[];
  currency: string;
  /** Show the "revenue shown in <currency> only" note when the revenue metric is selected. */
  primaryOnlyNote?: boolean;
}) {
  const t = useTranslations("pro.dashboard");
  const locale = useLocale();
  const [metric, setMetric] = useState<Metric>("orders");

  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const money = (amount: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  const shortDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(new Date(value));
  const fullDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">{t("timeline.title")}</h2>
        <div className="flex rounded-lg border border-border p-0.5 text-xs">
          {(["orders", "revenue"] as Metric[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              aria-pressed={metric === m}
              className={cn(
                "rounded-md px-3 py-1 font-medium transition-colors",
                metric === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(`timeline.${m}`)}
            </button>
          ))}
        </div>
      </div>
      {timeline.length === 0 ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
          {t("timeline.empty")}
        </div>
      ) : (
        <div className="h-[260px] w-full" role="img" aria-label={t("timeline.title")}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="proTimeline" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={shortDate}
                stroke="currentColor"
                className="text-muted-foreground"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                stroke="currentColor"
                className="text-muted-foreground"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={metric === "revenue"}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                labelFormatter={(label: any) => fullDate(label as string)}
                formatter={(value: any) => [
                  metric === "revenue" ? money(Number(value)) : number(Number(value)),
                  t(`timeline.${metric}`),
                ]}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={COLOR}
                strokeWidth={2.5}
                fill="url(#proTimeline)"
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {metric === "revenue" && primaryOnlyNote && (
        <p className="mt-2 text-xs text-muted-foreground">{t("timeline.primaryOnly", { currency })}</p>
      )}
    </section>
  );
}
