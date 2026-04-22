'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

interface MwByRegionChartProps {
  data: Array<{ region: string; totalTargetMw: number; siteCount: number }>
}

export function MwByRegionChart({ data }: MwByRegionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="region" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `${v}MW`} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => [`${value} MW`, 'Target MW']}
          labelStyle={{ fontWeight: 600 }}
        />
        <Bar dataKey="totalTargetMw" radius={[4, 4, 0, 0]}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
