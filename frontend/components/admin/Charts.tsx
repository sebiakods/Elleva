"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartPoint {
  label: string;
  value: number;
}

interface ChartsProps {
  data: ChartPoint[];
  loading?: boolean;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-sand-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className="font-display text-sm font-semibold text-wine-900">
        {payload[0].value.toLocaleString("fr-FR")}
      </p>
    </div>
  );
}

export function Charts({ data, loading = false }: ChartsProps) {
  if (loading) {
    return (
      <div className="h-72 w-full animate-pulse rounded-2xl bg-sand-50" />
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-2xl bg-sand-50">
        <p className="text-sm text-ink-soft">Aucune donnée disponible.</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="riseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e11d67" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#e11d67" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1e7e0" vertical={false} />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#9c8f88" }}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#9c8f88" }}
            width={40}
          />

          <Tooltip content={<ChartTooltip />} />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#be123c"
            strokeWidth={2}
            fill="url(#riseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}