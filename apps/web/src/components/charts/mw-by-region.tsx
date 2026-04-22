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

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

interface Props {
  data: Array<{ region: string; totalTargetMw: number; siteCount: number }>
}

export function MwByRegionChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="region"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${v}MW`}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          formatter={(v: number) => [`${v.toLocaleString()} MW`, 'Target']}
          contentStyle={{
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px',
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          cursor={{ fill: 'var(--muted)' }}
        />
        <Bar dataKey="totalTargetMw" radius={[4, 4, 0, 0]}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
