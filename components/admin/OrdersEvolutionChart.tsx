"use client";

import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
}

interface OrdersEvolutionChartProps {
  orders: Order[];
  title?: string;
}

const OrdersEvolutionChart: React.FC<OrdersEvolutionChartProps> = ({
  orders,
  title = "Évolution des commandes",
}) => {
  const data = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    // Group orders by date
    const countsByDate = orders.reduce((acc: Record<string, number>, order) => {
      if (!order.createdAt) return acc;
      // Truncate to YYYY-MM-DD
      const dateStr = order.createdAt.substring(0, 10);
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {});

    // Convert to array and sort chronologically
    const sortedData = Object.entries(countsByDate)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sortedData;
  }, [orders]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd MMM", { locale: fr });
    } catch {
      return dateString;
    }
  };

  if (data.length === 0) {
    return (
      <div className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-xl mt-8">
        <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200">
          {title}
        </h3>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Pas assez de données pour afficher l'évolution.
        </div>
      </div>
    );
  }

  return (
    <div className="glass bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-xl mt-8">
      <h3 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200">
        {title}
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: any) => `${value}`}
              dx={-10}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderColor: "#e2e8f0",
                borderRadius: "8px",
                color: "#0f172a",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelFormatter={(label: any) => formatDate(label as string)}
              itemStyle={{ color: "#4f46e5", fontWeight: "bold" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Commandes"
              stroke="#4f46e5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrdersEvolutionChart;
